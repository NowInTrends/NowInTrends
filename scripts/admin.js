const adminState = {
    selectedId: null,
};

document.addEventListener('DOMContentLoaded', async () => {
    await window.postStore.init();
    bindEditor();
    renderAdminList();
});

function bindEditor() {
    const form = document.getElementById('postForm');
    const deleteButton = document.getElementById('deletePost');
    const newButton = document.getElementById('newPost');
    const exportButton = document.getElementById('exportPosts');
    const importInput = document.getElementById('importPosts');

    form.addEventListener('input', updatePreview);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = formDataToPost(new FormData(form));
        if (adminState.selectedId) data.id = adminState.selectedId;
        window.postStore.upsert(data);
        adminState.selectedId = data.id;
        showFeedback('Post saved locally. Export when ready to publish.');
        renderAdminList();
    });

    deleteButton.addEventListener('click', () => {
        if (!adminState.selectedId) return;
        const confirmation = confirm('Remove this post from local storage?');
        if (!confirmation) return;
        window.postStore.delete(adminState.selectedId);
        resetForm();
        renderAdminList();
        showFeedback('Post deleted.');
    });

    newButton.addEventListener('click', () => {
        resetForm();
        showFeedback('Ready for a fresh signal.');
    });

    exportButton.addEventListener('click', () => {
        const blob = new Blob([window.postStore.export()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'posts.json';
        link.click();
        URL.revokeObjectURL(url);
    });

    importInput.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        window.postStore.import(text);
        renderAdminList();
        showFeedback('Posts imported.');
    });
}

function renderAdminList() {
    const container = document.getElementById('adminPosts');
    container.innerHTML = '';
    const posts = window.postStore.list();
    if (!posts.length) {
        container.innerHTML = '<p class="tiny-note">No posts yet. Draft your first signal on the right.</p>';
        return;
    }

    posts.forEach((post) => {
        const card = document.createElement('article');
        card.className = `admin-card${adminState.selectedId === post.id ? ' active' : ''}`;
        card.innerHTML = `
            <strong>${post.title}</strong>
            <p class="tiny-note">${new Date(post.publishedAt).toLocaleString()} · ${(post.tags || []).join(', ') || 'No tags yet'}</p>
        `;
        card.addEventListener('click', () => selectPost(post.id));
        container.appendChild(card);
    });
}

function selectPost(postId) {
    const post = window.postStore.get(postId);
    if (!post) return;
    const form = document.getElementById('postForm');
    form.postTitle.value = post.title || '';
    form.postAuthor.value = post.author || '';
    form.postImage.value = post.image || '';
    form.postTags.value = (post.tags || []).join(', ');
    form.postSummary.value = post.summary || '';
    form.postContent.value = post.content || '';
    adminState.selectedId = post.id;
    updatePreview();
    document.getElementById('deletePost').disabled = false;
    document.getElementById('editorState').textContent = 'Editing existing signal';
    renderAdminList();
}

function resetForm() {
    const form = document.getElementById('postForm');
    form.reset();
    adminState.selectedId = null;
    document.getElementById('deletePost').disabled = true;
    document.getElementById('editorState').textContent = 'Create a signal';
    updatePreview();
}

function formDataToPost(formData) {
    return {
        title: formData.get('title').trim(),
        author: formData.get('author').trim() || 'NowInTrends',
        image: formData.get('image').trim(),
        summary: formData.get('summary').trim(),
        tags: formData
            .get('tags')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        content: formData.get('content'),
        publishedAt: adminState.selectedId ? undefined : new Date().toISOString(),
    };
}

function updatePreview() {
    const form = document.getElementById('postForm');
    if (!form) return;
    const preview = document.getElementById('previewCard');
    preview.querySelector('h4').textContent = form.postTitle.value || 'Start typing to see the preview.';
    preview.querySelector('.post-summary').textContent = form.postSummary.value || 'The rendered Markdown will appear here.';
    preview.querySelector('.post-body').innerHTML = window.renderMarkdown(form.postContent.value);
}

function showFeedback(message) {
    const output = document.getElementById('editorFeedback');
    output.textContent = message;
    setTimeout(() => (output.textContent = ''), 4000);
}

