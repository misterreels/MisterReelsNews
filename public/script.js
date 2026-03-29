/* =========================================
   MISTER REELS NEWS — JavaScript
   ========================================= */

// =========================================
// Admin Authentication System
// =========================================

let adminDeviceId = null;

// Generate device fingerprint for admin authentication
function generateDeviceFingerprint() {
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || '',
        navigator.deviceMemory || ''
    ].join('|');

    // Create hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return 'admin_' + Math.abs(hash).toString(16);
}

// Get or create admin device ID
function getAdminDeviceId() {
    if (adminDeviceId) return adminDeviceId;

    const storedId = localStorage.getItem('misterreels_admin_id');
    if (storedId) {
        adminDeviceId = storedId;
        return adminDeviceId;
    }

    adminDeviceId = generateDeviceFingerprint();
    localStorage.setItem('misterreels_admin_id', adminDeviceId);
    return adminDeviceId;
}

// Check if current device is authorized admin
function isAdminAuthorized() {
    const authorizedId = localStorage.getItem('authorized_admin_device_id');
    const currentId = getAdminDeviceId();
    return authorizedId && currentId === authorizedId;
}

// Authorize current device as admin
function authorizeAdminDevice(password) {
    // Simple password check - change this to your desired password
    if (password === 'MISTERreels@8753') {
        const currentId = getAdminDeviceId();
        localStorage.setItem('authorized_admin_device_id', currentId);
        return true;
    }
    return false;
}

// Logout admin
function logoutAdmin() {
    localStorage.removeItem('authorized_admin_device_id');
    window.location.href = 'index.html';
}

// =========================================
// User Device ID - For Voting
// =========================================

let deviceId = null;

// Generate or get device fingerprint for voting
function getDeviceId() {
    if (deviceId) return deviceId;

    const storedId = localStorage.getItem('misterreels_device_id');
    if (storedId) {
        deviceId = storedId;
        return deviceId;
    }

    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || '',
        navigator.deviceMemory || ''
    ].join('|');

    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    deviceId = 'device_' + Math.abs(hash).toString(36) + Date.now().toString(36);

    localStorage.setItem('misterreels_device_id', deviceId);

    return deviceId;
}

// =========================================
// Subscribers News Functions
// =========================================

// Fetch all published subscribers news
async function fetchSubscribersNews() {
    if (!window.supabase) {
        return [];
    }

    try {
        const { data, error } = await window.supabase
            .from('subscribers_news')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching subscribers news:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching subscribers news:', error);
        return [];
    }
}

// Load and display subscribers news
async function loadSubscribersNews() {
    const newsContainer = document.getElementById('subscribers-news-container');
    if (!newsContainer) return;

    if (!window.supabase || !window.isSupabaseConfigured) {
        newsContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 40px;">No news available yet.</p>';
        return;
    }

    try {
        const news = await fetchSubscribersNews();

        if (news.length === 0) {
            newsContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 40px;">No news available yet. Check back soon!</p>';
            return;
        }

        newsContainer.innerHTML = news.map(item => `
            <article class="news-card" id="news-card-${item.id}" onclick="openSubscribersNews(${item.id})" style="cursor: pointer;">
                <div class="card-image-wrap">
                    ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}" class="card-image" loading="lazy">` : '<div class="card-image" style="background: #16213e;"></div>'}
                    <div class="card-image-overlay"></div>
                    <span class="card-category">${escapeHtml(item.category)}</span>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${escapeHtml(item.title)}</h3>
                    <p class="card-excerpt">${escapeHtml(item.excerpt || '')}</p>
                    <div class="card-meta">
                        <span class="card-author">${escapeHtml(item.author)}</span>
                        <span class="card-date">${item.date || new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading subscribers news:', error);
        newsContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 40px;">Error loading news. Please try again later.</p>';
    }
}

// Open subscribers news in new page
async function openSubscribersNews(id) {
    window.location.href = 'subscribers-article.html?id=' + id;
}

// Close subscribers news modal
function closeSubscribersNewsModal() {
    const modal = document.getElementById('subscribers-news-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =========================================
// Voting System - Supabase
// =========================================

// Fetch voting categories from Supabase
async function fetchVotingCategories() {
    if (!window.supabase || !window.isSupabaseConfigured) {
        console.log('Supabase not configured');
        return [];
    }

    try {
        const { data, error } = await window.supabase
            .from('voting_categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching voting categories:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching voting categories:', error);
        return [];
    }
}

// Render voting categories dynamically
async function renderVotingCategories() {
    const wrapper = document.getElementById('voting-categories-wrapper');
    if (!wrapper) return;

    const categories = await fetchVotingCategories();

    if (categories.length === 0) {
        wrapper.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 40px; grid-column: 1/-1;">No voting categories available.</p>';
        return;
    }

    wrapper.innerHTML = categories.map(category => `
        <div class="voting-category">
            <h3 class="category-title">${category.icon} ${category.title}</h3>

            <div class="series-input-panel" id="series-panel-${category.slug}">
                <input type="text" class="vote-input" id="series-${category.slug}" placeholder="${category.placeholder}">
                <button class="vote-btn" onclick="submitVote('${category.slug}')">Vote</button>
            </div>

            <div class="results-panel" id="results-${category.slug}">
                <h4 class="results-title">Top 5 Voted</h4>
                <div class="results-list" id="results-list-${category.slug}"></div>
                <button class="view-all-btn" onclick="viewAllResults('${category.slug}')">View All</button>
            </div>
        </div>
    `).join('');

    categories.forEach(category => {
        loadResults(category.slug);
    });
}

// Handle like/dislike action
async function handleLikeDislike(category, seriesName, reaction) {
    if (!window.supabase || !window.isSupabaseConfigured) {
        alert('Voting system not configured yet. Please set up Supabase first.');
        return;
    }

    const deviceId = getDeviceId();
    const seriesNameUpper = seriesName.toUpperCase();

    try {
        const { data: existingReaction } = await window.supabase
            .from('votes')
            .select('*')
            .eq('category', category)
            .eq('series_name', seriesNameUpper)
            .eq('device_id', deviceId)
            .single();

        let updateData = {};

        if (existingReaction && existingReaction.user_reaction) {
            const currentReaction = existingReaction.user_reaction;

            if (currentReaction === reaction) {
                updateData = {
                    likes: Math.max(0, (existingReaction.likes || 0) - (reaction === 'like' ? 1 : 0)),
                    dislikes: Math.max(0, (existingReaction.dislikes || 0) - (reaction === 'dislike' ? 1 : 0)),
                    user_reaction: null
                };
            } else {
                updateData = {
                    likes: (existingReaction.likes || 0) + (reaction === 'like' ? 1 : 0) - (currentReaction === 'like' ? 1 : 0),
                    dislikes: (existingReaction.dislikes || 0) + (reaction === 'dislike' ? 1 : 0) - (currentReaction === 'dislike' ? 1 : 0),
                    user_reaction: reaction
                };
            }
        } else {
            if (reaction === 'like') {
                updateData = {
                    likes: (existingReaction?.likes || 0) + 1,
                    user_reaction: 'like'
                };
            } else {
                updateData = {
                    dislikes: (existingReaction?.dislikes || 0) + 1,
                    user_reaction: 'dislike'
                };
            }
        }

        if (!existingReaction) {
            const { error: insertError } = await window.supabase
                .from('votes')
                .insert([{
                    category: category,
                    series_name: seriesNameUpper,
                    device_id: deviceId,
                    likes: reaction === 'like' ? 1 : 0,
                    dislikes: reaction === 'dislike' ? 1 : 0,
                    user_reaction: reaction,
                    created_at: new Date().toISOString()
                }]);

            if (insertError) {
                console.error('Error adding reaction:', insertError);
                alert('Error submitting reaction. Please try again.');
                return;
            }
        } else {
            const { error: updateError } = await window.supabase
                .from('votes')
                .update(updateData)
                .eq('category', category)
                .eq('series_name', seriesNameUpper)
                .eq('device_id', deviceId);

            if (updateError) {
                console.error('Error updating reaction:', updateError);
                alert('Error updating reaction. Please try again.');
                return;
            }
        }

        loadResults(category);
    } catch (error) {
        console.error('Error in handleLikeDislike:', error);
    }
}

// View all results in modal
async function viewAllResults(category) {
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const resultsList = document.getElementById('viewAllResultsList');

    const categories = await fetchVotingCategories();
    const categoryObj = categories.find(c => c.slug === category);
    const categoryName = categoryObj ? categoryObj.title : category;
    
    modalTitle.textContent = `${categoryName} - All Results`;

    if (!window.supabase || !window.isSupabaseConfigured) {
        resultsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No votes yet. Be the first to vote!</p>';
        modal.style.display = 'block';
        return;
    }

    try {
        const { data: votes, error } = await window.supabase
            .from('votes')
            .select('series_name, device_id, likes, dislikes')
            .eq('category', category);

        if (error) throw error;

        const seriesData = {};

        votes.forEach(vote => {
            const name = vote.series_name.trim();
            if (!seriesData[name]) {
                seriesData[name] = {
                    devices: new Set(),
                    likes: 0,
                    dislikes: 0
                };
            }
            seriesData[name].devices.add(vote.device_id);
            seriesData[name].likes = (seriesData[name].likes || 0) + (vote.likes || 0);
            seriesData[name].dislikes = (seriesData[name].dislikes || 0) + (vote.dislikes || 0);
        });

        const seriesWithCounts = Object.entries(seriesData).map(([name, data]) => ({
            name,
            likes: data.likes,
            dislikes: data.dislikes
        }));

        const totalLikes = seriesWithCounts.reduce((sum, item) => sum + item.likes, 0);

        const allResults = seriesWithCounts.sort((a, b) => b.likes - a.likes);

        const deviceId = getDeviceId();

        const { data: userReactions } = await window.supabase
            .from('votes')
            .select('series_name, user_reaction, device_id')
            .eq('category', category);

        const userReactionMap = {};
        if (userReactions) {
            userReactions.forEach(r => {
                if (r.device_id === deviceId) {
                    userReactionMap[r.series_name.trim().toUpperCase()] = r.user_reaction;
                }
            });
        }

        if (allResults.length === 0) {
            resultsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No votes yet. Be the first to vote!</p>';
        } else {
            resultsList.innerHTML = allResults.map((item, index) => {
                const percentage = totalLikes > 0 ? Math.round((item.likes / totalLikes) * 100) : 0;
                const userReaction = userReactionMap[item.name] || null;
                return `
                    <div class="result-item">
                        <div class="result-item-top">
                            <span class="result-rank">${index + 1}</span>
                            <span class="result-name">${item.name}</span>
                            <span class="result-percentage">${percentage}%</span>
                        </div>
                        <div class="result-item-bottom">
                            <div class="result-actions">
                                <button class="like-dislike-btn like-btn ${userReaction === 'like' ? 'liked' : ''}" 
                                    onclick="handleLikeDislike('${category}', '${item.name.replace(/'/g, "\\'")}', 'like').then(() => viewAllResults('${category}'));">
                                    👍 <span class="vote-count">${item.likes || 0}</span>
                                </button>
                                <button class="like-dislike-btn dislike-btn ${userReaction === 'dislike' ? 'disliked' : ''}" 
                                    onclick="handleLikeDislike('${category}', '${item.name.replace(/'/g, "\\'")}', 'dislike').then(() => viewAllResults('${category}'));">
                                    👎 <span class="vote-count">${item.dislikes || 0}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading all results:', error);
        resultsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Error loading results. Please try again.</p>';
    }

    modal.style.display = 'block';
}

// Close view all modal
function closeViewAllModal() {
    const modal = document.getElementById('viewAllModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('viewAllModal');
    if (modal && event.target === modal) {
        modal.style.display = 'none';
    }
    const newsModal = document.getElementById('subscribers-news-modal');
    if (newsModal && event.target === newsModal) {
        newsModal.style.display = 'none';
    }
}

// Submit vote to Supabase
async function submitVote(category) {
    if (!window.supabase || !window.isSupabaseConfigured) {
        alert('Voting system not configured yet. Please set up Supabase first.');
        return;
    }

    const seriesInput = document.getElementById(`series-${category}`);
    const seriesName = seriesInput.value
        .trim()
        .replace(/\s+/g, ' ')
        .toUpperCase();

    if (!seriesName) {
        alert('Please enter a series name');
        return;
    }

    const deviceId = getDeviceId();

    try {
        const { data: existingSeries } = await window.supabase
            .from('votes')
            .select('series_name, device_id, likes, dislikes')
            .eq('category', category)
            .ilike('series_name', seriesName);

        if (existingSeries && existingSeries.length > 0) {
            const existingEntry = existingSeries[0];

            if (existingEntry.device_id === deviceId) {
                alert('You have already voted for this series!');
                return;
            }

            const { error: updateError } = await window.supabase
                .from('votes')
                .update({
                    likes: (existingEntry.likes || 0) + 1,
                    device_id: deviceId
                })
                .eq('category', category)
                .eq('series_name', existingEntry.series_name);

            if (updateError) throw updateError;

            alert('Vote added! Thanks for voting.');
        } else {
            const { error } = await window.supabase
                .from('votes')
                .insert([{
                    category: category,
                    series_name: seriesName,
                    device_id: deviceId,
                    likes: 1,
                    dislikes: 0,
                    user_reaction: 'like',
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            alert('Vote submitted successfully!');
        }

        seriesInput.value = '';
        loadResults(category);
    } catch (error) {
        console.error('Error in submitVote:', error);
        alert('An error occurred. Please try again.');
    }
}

// Load and display top 5 results from Supabase
async function loadResults(category) {
    const resultsList = document.getElementById(`results-list-${category}`);

    if (!resultsList) return;

    if (!window.supabase || !window.isSupabaseConfigured) {
        resultsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No votes yet. Be the first to vote!</p>';
        return;
    }

    try {
        const { data: votes, error } = await window.supabase
            .from('votes')
            .select('series_name, device_id, likes, dislikes')
            .eq('category', category);

        if (error) throw error;

        const seriesData = {};

        votes.forEach(vote => {
            const name = vote.series_name.trim();
            if (!seriesData[name]) {
                seriesData[name] = {
                    devices: new Set(),
                    likes: 0,
                    dislikes: 0
                };
            }
            seriesData[name].devices.add(vote.device_id);
            seriesData[name].likes = (seriesData[name].likes || 0) + (vote.likes || 0);
            seriesData[name].dislikes = (seriesData[name].dislikes || 0) + (vote.dislikes || 0);
        });

        const seriesWithCounts = Object.entries(seriesData).map(([name, data]) => ({
            name,
            likes: data.likes,
            dislikes: data.dislikes
        }));

        const totalLikes = seriesWithCounts.reduce((sum, item) => sum + item.likes, 0);

        const top5 = seriesWithCounts
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 5);

        const deviceId = getDeviceId();

        const { data: userReactions } = await window.supabase
            .from('votes')
            .select('series_name, user_reaction, device_id')
            .eq('category', category);

        const userReactionMap = {};
        if (userReactions) {
            userReactions.forEach(r => {
                if (r.device_id === deviceId) {
                    userReactionMap[r.series_name.trim().toUpperCase()] = r.user_reaction;
                }
            });
        }

        if (top5.length === 0) {
            resultsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No votes yet. Be the first to vote!</p>';
            return;
        }

        resultsList.innerHTML = top5.map((item, index) => {
            const percentage = totalLikes > 0 ? Math.round((item.likes / totalLikes) * 100) : 0;
            const userReaction = userReactionMap[item.name] || null;
            return `
                <div class="result-item">
                    <div class="result-item-top">
                        <span class="result-rank">${index + 1}</span>
                        <span class="result-name">${item.name}</span>
                        <span class="result-percentage">${percentage}%</span>
                    </div>
                    <div class="result-item-bottom">
                        <div class="result-actions">
                            <button class="like-dislike-btn like-btn ${userReaction === 'like' ? 'liked' : ''}" 
                                onclick="handleLikeDislike('${category}', '${item.name.replace(/'/g, "\\'")}', 'like').then(() => loadResults('${category}'));">
                                👍 <span class="vote-count">${item.likes || 0}</span>
                            </button>
                            <button class="like-dislike-btn dislike-btn ${userReaction === 'dislike' ? 'disliked' : ''}" 
                                onclick="handleLikeDislike('${category}', '${item.name.replace(/'/g, "\\'")}', 'dislike').then(() => loadResults('${category}'));">
                                👎 <span class="vote-count">${item.dislikes || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading results:', error);
        resultsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No votes yet. Be the first to vote!</p>';
    }
}

// =========================================
// Header Scroll Behavior
// =========================================
function initHeader() {
    const header = document.getElementById('main-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.innerWidth <= 768) return;
        const currentScroll = window.scrollY;
        if (currentScroll > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// =========================================
// Mobile Menu
// =========================================
function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        toggle.classList.toggle('active');
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            toggle.classList.remove('active');
        });
    });
}

// =========================================
// Initialize Everything
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    initHeader();
    initMobileMenu();
    
    // Load subscribers news
    await loadSubscribersNews();
    
    // Load and render voting categories dynamically from database
    await renderVotingCategories();

    // Load applications
    await loadApplications();

    // Load congratulations
    await loadCongratulations();
});

/* =========================================
   Applications System
   ========================================= */

async function loadApplications() {
    const appsContainer = document.getElementById('apps-container');
    if (!appsContainer || !window.supabase) return;

    try {
        const { data: apps, error } = await window.supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!apps || apps.length === 0) {
            appsContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; grid-column: 1/-1; padding: 40px;">No applications available at the moment.</p>';
            return;
        }

        appsContainer.innerHTML = apps.map(app => `
            <div class="app-card fade-in-up">
                <div class="app-icon">
                    ${app.icon_url ? `<img src="${app.icon_url}" alt="${escapeHtml(app.title)}">` : '📱'}
                </div>
                <h3 class="app-title">${escapeHtml(app.title)}</h3>
                <span class="app-version">v${escapeHtml(app.version)}</span>
                <p class="app-description">${escapeHtml(app.description)}</p>
                <button class="btn-download" onclick="handleDownload(this, '${app.download_url}', '${escapeHtml(app.title)}')">
                    <div class="download-progress"></div>
                    <span class="download-icon">📥</span>
                    <span class="spinner"></span>
                    <span class="download-text">Download Now</span>
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading applications:', error);
        appsContainer.innerHTML = '<p style="color: #ef4444; text-align: center; grid-column: 1/-1; padding: 40px;">Failed to load applications. Please try again later.</p>';
    }
}

function handleDownload(btn, url, title) {
    if (btn.classList.contains('downloading')) return;

    btn.classList.add('downloading');
    const progress = btn.querySelector('.download-progress');
    const text = btn.querySelector('.download-text');
    const originalText = text.textContent;
    
    text.textContent = 'Preparing...';
    
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            text.textContent = 'Starting Download...';
            
            setTimeout(() => {
                // Trigger actual download
                const link = document.createElement('a');
                link.href = url;
                link.download = ''; // Browser will try to use the filename from URL
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Reset button after a delay
                setTimeout(() => {
                    btn.classList.remove('downloading');
                    progress.style.width = '0%';
                    text.textContent = originalText;
                }, 2000);
            }, 1000);
        } else {
            width += Math.random() * 15;
            if (width > 100) width = 100;
            progress.style.width = width + '%';
            if (width > 30) text.textContent = 'Downloading... ' + Math.floor(width) + '%';
        }
    }, 200);
}

/* =========================================
   Congratulations System
   ========================================= */

async function loadCongratulations() {
    const congratulationsContainer = document.getElementById('congratulations-container');
    if (!congratulationsContainer || !window.supabase) {
        return;
    }

    try {
        const { data: congratulations, error } = await window.supabase
            .from('congratulations')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (error) throw error;

        if (!congratulations || congratulations.length === 0) {
            congratulationsContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; grid-column: 1/-1; padding: 40px;">No congratulations available at the moment.</p>';
            return;
        }

        congratulationsContainer.innerHTML = congratulations.map(cong => {
            let iconHTML = '';
            
            if (cong.icon_url) {
                iconHTML = `<div class="congratulations-icon-wrapper">
                    <img src="${cong.icon_url}" alt="${escapeHtml(cong.title)}">
                </div>`;
            } else {
                // Use first emoji or default celebration emoji
                iconHTML = `<div class="congratulations-icon-wrapper emoji">🎉</div>`;
            }

            return `
                <div class="congratulations-card fade-in-up">
                    ${iconHTML}
                    <h3 class="congratulations-title">${escapeHtml(cong.title)}</h3>
                    <p class="congratulations-description">${escapeHtml(cong.description)}</p>
                    ${cong.image_url ? `<img src="${cong.image_url}" alt="${escapeHtml(cong.title)}" class="congratulations-image">` : ''}
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading congratulations:', error);
        congratulationsContainer.innerHTML = '<p style="color: #ef4444; text-align: center; grid-column: 1/-1; padding: 40px;">Failed to load congratulations. Please try again later.</p>';
    }
}
