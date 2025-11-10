class PostStore {
    constructor(storageKey = 'nowintrends::posts') {
        this.storageKey = storageKey;
        this.posts = [];
        this.ready = null;
    }

    async init() {
        if (!this.ready) {
            this.ready = this.#load();
        }
        return this.ready;
    }

    async #load() {
        const defaults = await this.#fetchDefaults();
        const overrides = this.#readLocal();
        const merged = this.#mergePosts(defaults, overrides);
        this.posts = merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        return this.posts;
    }

    async #fetchDefaults() {
        try {
            const response = await fetch('data/posts.json', { cache: 'no-store' });
            if (!response.ok) throw new Error('Failed to fetch defaults');
            return await response.json();
        } catch (error) {
            console.warn('No default posts found yet.', error);
            return [];
        }
    }

    #readLocal() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return [];
            return JSON.parse(raw);
        } catch (error) {
            console.warn('Unable to read local posts', error);
            return [];
        }
    }

    #persist() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.posts));
        } catch (error) {
            console.warn('Unable to persist posts locally', error);
        }
    }

    #mergePosts(defaults, overrides) {
        const map = new Map();
        defaults.forEach((post) => map.set(post.id, post));
        overrides.forEach((post) => map.set(post.id, post));
        return Array.from(map.values());
    }

    list() {
        return [...this.posts];
    }

    get(postId) {
        return this.posts.find((post) => post.id === postId);
    }

    upsert(post) {
        if (!post.id) {
            post.id = this.#generateId(post.title);
        }
        if (!post.publishedAt) {
            post.publishedAt = new Date().toISOString();
        }
        const existingIndex = this.posts.findIndex((item) => item.id === post.id);
        if (existingIndex >= 0) {
            this.posts[existingIndex] = post;
        } else {
            this.posts.unshift(post);
        }
        this.#persist();
        return post;
    }

    delete(postId) {
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.#persist();
    }

    tags() {
        const tagSet = new Set();
        this.posts.forEach((post) => {
            (post.tags || []).forEach((tag) => tagSet.add(tag));
        });
        return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
    }

    search(query = '', activeTags = []) {
        const normalizedQuery = query.trim().toLowerCase();
        return this.posts.filter((post) => {
            const matchesQuery = normalizedQuery
                ? [post.title, post.author, post.summary, post.content]
                      .filter(Boolean)
                      .some((field) => field.toLowerCase().includes(normalizedQuery)) ||
                  (post.tags || []).some((tag) => tag.toLowerCase().includes(normalizedQuery))
                : true;

            const matchesTags = activeTags.length
                ? activeTags.every((tag) => (post.tags || []).includes(tag))
                : true;

            return matchesQuery && matchesTags;
        });
    }

    export() {
        return JSON.stringify(this.posts, null, 2);
    }

    import(rawJSON) {
        try {
            const data = JSON.parse(rawJSON);
            if (!Array.isArray(data)) throw new Error('JSON must be an array of posts');
            this.posts = data;
            this.#persist();
            return this.posts;
        } catch (error) {
            throw new Error(`Import failed: ${error.message}`);
        }
    }

    #generateId(title = 'post') {
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')</r
            .replace(/(^-|-$)/g, '')
            .slice(0, 50);
        return `post-${slug || 'signal'}-${Date.now()}`;
    }
}

function renderMarkdown(markdown = '') {
    if (!window.marked) return markdown;
    const html = window.marked.parse(markdown, { mangle: false, headerIds: true });
    return window.DOMPurify ? window.DOMPurify.sanitize(html) : html;
}

window.postStore = new PostStore();
window.renderMarkdown = renderMarkdown;

