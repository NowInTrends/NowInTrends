const state = {
    query: '',
    activeTags: [],
};

document.addEventListener('DOMContentLoaded', async () => {
    await window.postStore.init();
    renderTags();
    renderPosts();
    bindSearch();
    bindContactForm();
    bindNewsletterForm();
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});

function renderTags() {
    const container = document.getElementById('tagFilters');
    container.innerHTML = '';
    const tags = window.postStore.tags();
    if (!tags.length) return;

    tags.forEach((tag) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `tag${state.activeTags.includes(tag) ? ' active' : ''}`;
        button.textContent = tag;
        button.addEventListener('click', () => toggleTag(tag));
        container.appendChild(button);
    });
}

function toggleTag(tag) {
    if (state.activeTags.includes(tag)) {
        state.activeTags = state.activeTags.filter((item) => item !== tag);
    } else {
        state.activeTags.push(tag);
    }
    renderTags();
    renderPosts();
}

function bindSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearFilters');

    searchInput?.addEventListener('input', (event) => {
        state.query = event.target.value;
        renderPosts();
    });

    clearButton?.addEventListener('click', () => {
        state.query = '';
        state.activeTags = [];
        if (searchInput) searchInput.value = '';
        renderTags();
        renderPosts();
    });
}

function renderPosts() {
    const container = document.getElementById('postsGrid');
    const emptyState = document.getElementById('emptyState');
    const posts = window.postStore.search(state.query, state.activeTags);

    container.innerHTML = '';
    if (!posts.length) {
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;

    posts.forEach((post) => {
        container.appendChild(buildPostCard(post));
    });
}

function buildPostCard(post) {
    const card = document.createElement('article');
    card.className = 'post-card';

    if (post.image) {
        const image = document.createElement('img');
        image.src = post.image;
        image.alt = post.title;
        card.appendChild(image);
    }

    const body = document.createElement('div');
    body.className = 'post-content';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'post-eyebrow';
    eyebrow.textContent = `${post.author || 'NowInTrends'} · ${new Date(post.publishedAt).toLocaleDateString()}`;

    const title = document.createElement('h3');
    title.textContent = post.title;

    const summary = document.createElement('p');
    summary.className = 'post-summary';
    summary.textContent = post.summary || '';

    const markdownPreview = document.createElement('div');
    markdownPreview.className = 'post-body';
    const fullMarkdown = window.renderMarkdown(post.content || '');
    const temp = document.createElement('div');
    temp.innerHTML = fullMarkdown;
    const textPreview = temp.textContent.trim();
    markdownPreview.textContent = textPreview.length > 320 ? `${textPreview.slice(0, 320)}…` : textPreview;

    const tagWrap = document.createElement('div');
    tagWrap.className = 'post-tags';
    (post.tags || []).forEach((tag) => {
        const badge = document.createElement('span');
        badge.textContent = tag;
        tagWrap.appendChild(badge);
    });

    body.append(eyebrow, title, summary, markdownPreview, tagWrap);
    card.appendChild(body);
    return card;
}

function bindContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const feedback = document.getElementById('contactFeedback');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        const mailto = new URL('mailto:nowintrends.today@gmail.com');
        mailto.search = new URLSearchParams({
            subject: `NowInTrends contact · ${name}`,
            body: `From: ${name} (${email})%0D%0A%0D%0A${message}`,
        }).toString();
        window.location.href = mailto.href;
        feedback.textContent = 'Your email client should now open. If it did not, reach us at nowintrends.today@gmail.com.';
        form.reset();
    });
}

function bindNewsletterForm() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('Subscriptions are not live yet. We will notify you once automation is ready.');
    });
}
