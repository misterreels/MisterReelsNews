/* =========================================
   MISTER REELS NEWS — Admin Panel JavaScript
   ========================================= */

// Track current edit ID
let currentEditNewsId = null;
let currentEditVotingId = null;
let currentEditAppId = null;

// =========================================
// Initialization - Check Authentication
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Display device ID in auth modal
    const deviceId = getAdminDeviceId();
    const deviceIdDisplay = document.getElementById('device-id-display');
    if (deviceIdDisplay) {
        deviceIdDisplay.textContent = deviceId;
    }

    // Check if already authorized
    if (isAdminAuthorized()) {
        closeAuthModal();
        await loadNewsList();
        await loadVotingList();
        await loadAppsList();
    }
});

// =========================================
// Modal Management
// =========================================

function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('active');
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
}

function openAddNewsModal() {
    // Only reset if not editing
    if (!currentEditNewsId) {
        currentEditNewsId = null;
        document.getElementById('news-form').reset();
        document.getElementById('news-modal-title').textContent = 'Add News';
    }
    document.getElementById('news-alerts').innerHTML = '';
    const modal = document.getElementById('news-modal');
    if (modal) modal.classList.add('active');
}

function closeNewsModal() {
    const modal = document.getElementById('news-modal');
    if (modal) modal.classList.remove('active');
    currentEditNewsId = null;
}

function openAddVotingModal() {
    // Only reset if not editing
    if (!currentEditVotingId) {
        currentEditVotingId = null;
        document.getElementById('voting-form').reset();
        document.getElementById('voting-modal-title').textContent = 'Add Voting Category';
    }
    document.getElementById('voting-alerts').innerHTML = '';
    const modal = document.getElementById('voting-modal');
    if (modal) modal.classList.add('active');
}

function closeVotingModal() {
    const modal = document.getElementById('voting-modal');
    if (modal) modal.classList.remove('active');
    currentEditVotingId = null;
}

function openAddAppModal() {
    // Only reset if not editing
    if (!currentEditAppId) {
        currentEditAppId = null;
        document.getElementById('apps-form').reset();
        document.getElementById('apps-modal-title').textContent = 'Add Application';
    }
    document.getElementById('apps-alerts').innerHTML = '';
    const modal = document.getElementById('apps-modal');
    if (modal) modal.classList.add('active');
}

function closeAppModal() {
    const modal = document.getElementById('apps-modal');
    if (modal) modal.classList.remove('active');
    currentEditAppId = null;
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const newsModal = document.getElementById('news-modal');
    const votingModal = document.getElementById('voting-modal');
    const appsModal = document.getElementById('apps-modal');
    const authModal = document.getElementById('auth-modal');

    if (newsModal && event.target === newsModal) {
        closeNewsModal();
    }
    if (votingModal && event.target === votingModal) {
        closeVotingModal();
    }
    if (appsModal && event.target === appsModal) {
        closeAppModal();
    }
});

// =========================================
// Tab Switching
// =========================================

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked nav item
    event.target.closest('.admin-nav-item').classList.add('active');
}

// =========================================
// Alert/Notification System
// =========================================

function showAlert(message, type, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    
    const icon = type === 'success' ? '✓' : '✕';
    alertDiv.innerHTML = `${icon} ${escapeHtml(message)}`;
    
    container.innerHTML = '';
    container.appendChild(alertDiv);

    // Auto-remove alert after 5 seconds
    setTimeout(() => {
        if (container.contains(alertDiv)) {
            alertDiv.remove();
        }
    }, 5000);
}

// =========================================
// Authentication
// =========================================

async function authenticateAdmin(event) {
    event.preventDefault();
    
    const password = document.getElementById('admin-password').value;
    const authAlert = document.getElementById('auth-alert');

    if (!password) {
        showAlert('Please enter a password', 'error', 'auth-alert');
        return;
    }

    if (authorizeAdminDevice(password)) {
        closeAuthModal();
        document.getElementById('admin-password').value = '';
        authAlert.innerHTML = '';
        await loadNewsList();
        await loadVotingList();
    } else {
        showAlert('Incorrect password. Please try again.', 'error', 'auth-alert');
        document.getElementById('admin-password').value = '';
    }
}

// =========================================
// News CRUD Operations
// =========================================

async function loadNewsList() {
    const newsList = document.getElementById('news-list');
    if (!newsList || !window.supabase) return;

    newsList.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-muted); text-align: center; padding: 40px;">Loading news...</p>';

    try {
        const { data, error } = await window.supabase
            .from('subscribers_news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            newsList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <div style="font-size: 48px; margin-bottom: 20px;">📰</div>
                    <h3 style="font-size: 18px; color: var(--text); margin-bottom: 10px;">No News Yet</h3>
                    <p>Click "Add News" to create your first article.</p>
                </div>
            `;
            return;
        }

        newsList.innerHTML = data.map(news => `
            <div class="admin-card">
                <div class="card-header">
                    <h3 class="card-title">${escapeHtml(news.title)}</h3>
                    <span class="card-badge">${news.is_published ? '✓ Published' : '⊗ Draft'}</span>
                </div>
                <div class="card-meta">
                    <div>Category: ${escapeHtml(news.category)}</div>
                    <div>Author: ${escapeHtml(news.author)}</div>
                    <div>Views: ${news.views || 0}</div>
                </div>
                ${news.image ? `<p style="color: var(--text-muted); font-size: 12px; margin-top: 10px;">📷 Has image</p>` : ''}
                <div class="card-actions">
                    <button class="btn-small btn-edit" onclick="editNews(${news.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteNews(${news.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading news:', error);
        newsList.innerHTML = '<p style="grid-column: 1/-1; color: var(--danger); text-align: center; padding: 40px;">Error loading news. Please try again.</p>';
    }
}

async function saveNews(event) {
    event.preventDefault();

    const title = document.getElementById('news-title').value.trim();
    const category = document.getElementById('news-category').value.trim();
    const author = document.getElementById('news-author').value.trim();
    const date = document.getElementById('news-date').value;
    const image = document.getElementById('news-image').value.trim();
    const excerpt = document.getElementById('news-excerpt').value.trim();
    const content = document.getElementById('news-content').value.trim();
    const isPublished = document.getElementById('news-published').checked;

    // Validation
    if (!title || !category || !author || !content) {
        showAlert('Please fill in all required fields', 'error', 'news-alerts');
        return;
    }

    try {
        const newsData = {
            title,
            category,
            author,
            date: date || new Date().toISOString().split('T')[0],
            image,
            excerpt,
            content,
            is_published: isPublished,
            updated_at: new Date().toISOString()
        };

        if (currentEditNewsId) {
            // Update existing news (don't include created_at on update)
            const { error } = await window.supabase
                .from('subscribers_news')
                .update(newsData)
                .eq('id', currentEditNewsId);

            if (error) throw error;
            showAlert('News updated successfully!', 'success', 'news-alerts');
        } else {
            // Insert new news
            const { error } = await window.supabase
                .from('subscribers_news')
                .insert([{
                    ...newsData,
                    created_at: new Date().toISOString(),
                    views: 0
                }]);

            if (error) throw error;
            showAlert('News created successfully!', 'success', 'news-alerts');
        }

        // Reload list and close modal
        setTimeout(() => {
            closeNewsModal();
            loadNewsList();
        }, 1500);
    } catch (error) {
        console.error('Error saving news:', error);
        showAlert('Error saving news: ' + (error.message || 'Please try again.'), 'error', 'news-alerts');
    }
}

async function editNews(id) {
    if (!window.supabase) return;

    try {
        const { data, error } = await window.supabase
            .from('subscribers_news')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) throw error;

        // Populate form with data BEFORE opening modal
        currentEditNewsId = id;
        document.getElementById('news-title').value = data.title;
        document.getElementById('news-category').value = data.category;
        document.getElementById('news-author').value = data.author;
        document.getElementById('news-date').value = data.date || '';
        document.getElementById('news-image').value = data.image || '';
        document.getElementById('news-excerpt').value = data.excerpt || '';
        document.getElementById('news-content').value = data.content;
        document.getElementById('news-published').checked = data.is_published;
        document.getElementById('news-modal-title').textContent = 'Edit News';
        document.getElementById('news-alerts').innerHTML = '';

        // Now open the modal with data already populated
        openAddNewsModal();
    } catch (error) {
        console.error('Error loading news for edit:', error);
        alert('Error loading news. Please try again.');
    }
}

async function deleteNews(id) {
    if (!confirm('Are you sure you want to delete this news article? This action cannot be undone.')) {
        return;
    }

    if (!window.supabase) return;

    try {
        const { error } = await window.supabase
            .from('subscribers_news')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showAlert('News deleted successfully!', 'success', 'news-alerts');
        setTimeout(() => {
            loadNewsList();
        }, 1000);
    } catch (error) {
        console.error('Error deleting news:', error);
        alert('Error deleting news. Please try again.');
    }
}

// =========================================
// Voting CRUD Operations
// =========================================

async function loadVotingList() {
    const votingList = document.getElementById('voting-list');
    if (!votingList || !window.supabase) return;

    votingList.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-muted); text-align: center; padding: 40px;">Loading categories...</p>';

    try {
        const { data, error } = await window.supabase
            .from('voting_categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            votingList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <div style="font-size: 48px; margin-bottom: 20px;">🗳️</div>
                    <h3 style="font-size: 18px; color: var(--text); margin-bottom: 10px;">No Categories Yet</h3>
                    <p>Click "Add Category" to create your first voting category.</p>
                </div>
            `;
            return;
        }

        votingList.innerHTML = data.map(category => `
            <div class="admin-card">
                <div class="card-header">
                    <h3 class="card-title">${escapeHtml(category.title)}</h3>
                    <span class="card-badge">${category.icon}</span>
                </div>
                <div class="card-meta">
                    <div>Slug: <code style="background: rgba(139, 92, 246, 0.2); padding: 2px 6px; border-radius: 4px;">${escapeHtml(category.slug)}</code></div>
                    <div>Placeholder: "${escapeHtml(category.placeholder)}"</div>
                    <div>Order: ${category.display_order}</div>
                </div>
                <div class="card-actions">
                    <button class="btn-small btn-edit" onclick="editVoting(${category.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteVoting(${category.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading voting categories:', error);
        votingList.innerHTML = '<p style="grid-column: 1/-1; color: var(--danger); text-align: center; padding: 40px;">Error loading categories. Please try again.</p>';
    }
}

async function saveVoting(event) {
    event.preventDefault();

    const title = document.getElementById('voting-title').value.trim();
    const slug = document.getElementById('voting-slug').value.trim().toLowerCase();
    const icon = document.getElementById('voting-icon').value.trim();
    const placeholder = document.getElementById('voting-placeholder').value.trim();
    const order = parseInt(document.getElementById('voting-order').value) || 0;

    // Validation
    if (!title || !slug || !icon || !placeholder) {
        showAlert('Please fill in all required fields', 'error', 'voting-alerts');
        return;
    }

    // Validate slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
        showAlert('Slug can only contain lowercase letters, numbers, and hyphens', 'error', 'voting-alerts');
        return;
    }

    try {
        const votingData = {
            title,
            slug,
            icon,
            placeholder,
            display_order: order
        };

        if (currentEditVotingId) {
            // Update existing category (don't include created_at on update)
            const { error } = await window.supabase
                .from('voting_categories')
                .update(votingData)
                .eq('id', currentEditVotingId);

            if (error) {
                console.error('Update error details:', error);
                throw error;
            }
            showAlert('Category updated successfully!', 'success', 'voting-alerts');
        } else {
            // Insert new category
            const { error } = await window.supabase
                .from('voting_categories')
                .insert([{
                    ...votingData,
                    created_at: new Date().toISOString()
                }]);

            if (error) {
                console.error('Insert error details:', error);
                throw error;
            }
            showAlert('Category created successfully!', 'success', 'voting-alerts');
        }

        // Reload list and close modal
        setTimeout(() => {
            closeVotingModal();
            loadVotingList();
        }, 1500);
    } catch (error) {
        console.error('Error saving voting category:', error);
        const errorMsg = error.message ? error.message : 'Unknown error occurred';
        showAlert('Error saving category: ' + errorMsg, 'error', 'voting-alerts');
    }
}

async function editVoting(id) {
    if (!window.supabase) return;

    try {
        const { data, error } = await window.supabase
            .from('voting_categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Load error:', error);
            throw error;
        }

        // Populate form with data BEFORE opening modal
        currentEditVotingId = id;
        document.getElementById('voting-title').value = data.title;
        document.getElementById('voting-slug').value = data.slug;
        document.getElementById('voting-icon').value = data.icon;
        document.getElementById('voting-placeholder').value = data.placeholder;
        document.getElementById('voting-order').value = data.display_order;
        document.getElementById('voting-modal-title').textContent = 'Edit Voting Category';
        document.getElementById('voting-alerts').innerHTML = '';

        // Now open the modal with data already populated
        openAddVotingModal();
    } catch (error) {
        console.error('Error loading voting category for edit:', error);
        alert('Error loading category. Please try again.');
    }
}

async function deleteVoting(id) {
    if (!confirm('Are you sure you want to delete this voting category? This action cannot be undone.')) {
        return;
    }

    if (!window.supabase) return;

    try {
        const { error } = await window.supabase
            .from('voting_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showAlert('Category deleted successfully!', 'success', 'voting-alerts');
        setTimeout(() => {
            loadVotingList();
        }, 1000);
    } catch (error) {
        console.error('Error deleting voting category:', error);
        alert('Error deleting category. Please try again.');
    }
}

// =========================================
// Applications CRUD Operations
// =========================================

async function loadAppsList() {
    const appsList = document.getElementById('apps-list');
    if (!appsList || !window.supabase) return;

    appsList.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-muted); text-align: center; padding: 40px;">Loading applications...</p>';

    try {
        const { data, error } = await window.supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            appsList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <div style="font-size: 48px; margin-bottom: 20px;">📱</div>
                    <h3 style="font-size: 18px; color: var(--text); margin-bottom: 10px;">No Applications Yet</h3>
                    <p>Click "Add Application" to register your first app.</p>
                </div>
            `;
            return;
        }

        appsList.innerHTML = data.map(app => `
            <div class="admin-card">
                <div class="card-header">
                    <h3 class="card-title">${escapeHtml(app.title)}</h3>
                    <span class="card-badge">v${escapeHtml(app.version)}</span>
                </div>
                <div class="card-meta">
                    <div style="margin-bottom: 8px;">${escapeHtml(app.description.substring(0, 100))}${app.description.length > 100 ? '...' : ''}</div>
                    <div style="font-size: 11px; word-break: break-all; opacity: 0.7;">URL: ${escapeHtml(app.download_url)}</div>
                </div>
                <div class="card-actions">
                    <button class="btn-small btn-edit" onclick="editApp(${app.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteApp(${app.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading applications:', error);
        appsList.innerHTML = '<p style="grid-column: 1/-1; color: var(--danger); text-align: center; padding: 40px;">Error loading applications. Please try again.</p>';
    }
}

async function saveApp(event) {
    event.preventDefault();

    const title = document.getElementById('app-title').value.trim();
    const description = document.getElementById('app-description').value.trim();
    const version = document.getElementById('app-version').value.trim();
    const link = document.getElementById('app-link').value.trim();
    const icon = document.getElementById('app-icon').value.trim();

    // Validation
    if (!title || !description || !version || !link) {
        showAlert('Please fill in all required fields', 'error', 'apps-alerts');
        return;
    }

    try {
        const appData = {
            title,
            description,
            version,
            download_url: link,
            icon_url: icon,
            updated_at: new Date().toISOString()
        };

        if (currentEditAppId) {
            // Update existing app
            const { error } = await window.supabase
                .from('applications')
                .update(appData)
                .eq('id', currentEditAppId);

            if (error) throw error;
            showAlert('Application updated successfully!', 'success', 'apps-alerts');
        } else {
            // Insert new app
            const { error } = await window.supabase
                .from('applications')
                .insert([{
                    ...appData,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
            showAlert('Application added successfully!', 'success', 'apps-alerts');
        }

        // Reload list and close modal
        setTimeout(() => {
            closeAppModal();
            loadAppsList();
        }, 1500);
    } catch (error) {
        console.error('Error saving application:', error);
        showAlert('Error saving application: ' + (error.message || 'Please try again.'), 'error', 'apps-alerts');
    }
}

async function editApp(id) {
    if (!window.supabase) return;

    try {
        const { data, error } = await window.supabase
            .from('applications')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) throw error;

        // Populate form
        currentEditAppId = id;
        document.getElementById('app-title').value = data.title;
        document.getElementById('app-description').value = data.description;
        document.getElementById('app-version').value = data.version;
        document.getElementById('app-link').value = data.download_url;
        document.getElementById('app-icon').value = data.icon_url || '';
        document.getElementById('apps-modal-title').textContent = 'Edit Application';
        document.getElementById('apps-alerts').innerHTML = '';

        openAddAppModal();
    } catch (error) {
        console.error('Error loading application for edit:', error);
        alert('Error loading application. Please try again.');
    }
}

async function deleteApp(id) {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
        return;
    }

    if (!window.supabase) return;

    try {
        const { error } = await window.supabase
            .from('applications')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showAlert('Application deleted successfully!', 'success', 'apps-alerts');
        setTimeout(() => {
            loadAppsList();
        }, 1000);
    } catch (error) {
        console.error('Error deleting application:', error);
        alert('Error deleting application. Please try again.');
    }
}
