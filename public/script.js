/* =========================================
   MISTER REELS NEWS — JavaScript
   ========================================= */

// =========================================
// Supabase Functions - Fetch articles from database
// =========================================

// Fetch all published articles from Supabase
async function fetchArticles() {
    console.log("fetchArticles called, window.supabase:", !!window.supabase);

    if (!window.supabase) {
        console.log('Supabase not configured - showing empty');
        return [];
    }

    try {
        console.log("Fetching articles from Supabase...");
        const { data, error } = await window.supabase
            .from('articles')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return [];
        }

        console.log("Articles fetched:", data ? data.length : 0);

        // Transform Supabase data to match our format
        return data.map(article => ({
            id: article.id,
            title: article.title,
            category: article.category,
            author: article.author,
            date: article.date,
            readTime: article.read_time,
            image: article.image,
            excerpt: article.excerpt,
            content: article.content,
            isFeatured: article.is_featured,
            isTrending: article.is_trending,
            views: article.views || 0
        }));
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

// Fetch single article by ID
async function fetchArticleById(id) {
    if (!window.supabase) {
        console.log('Supabase not configured - showing empty');
        return null;
    }

    try {
        const { data, error } = await window.supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Article not found:', error);
            return null;
        }

        // Increment view count
        await window.supabase
            .from('articles')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', id);

        return {
            id: data.id,
            title: data.title,
            category: data.category,
            author: data.author,
            date: data.date,
            readTime: data.read_time,
            image: data.image,
            excerpt: data.excerpt,
            content: data.content,
            isFeatured: data.is_featured,
            isTrending: data.is_trending,
            views: (data.views || 0) + 1
        };
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}

// Fetch related articles by category
async function fetchRelatedArticles(category, currentId) {
    if (!window.supabase) {
        return [];
    }

    try {
        // Get articles from the same category only
        const { data, error } = await window.supabase
            .from('articles')
            .select('id, title, category, image, date')
            .eq('is_published', true)
            .eq('category', category)
            .neq('id', parseInt(currentId))
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) throw error;

        // Only return articles from the same category
        // If there are no related articles in this category, return empty array
        return data || [];
    } catch (error) {
        console.error('Error fetching related articles:', error);
        return [];
    }
}

// =========================================
// Breaking News Functions - Supabase
// =========================================

// Fetch all active breaking news from Supabase
async function fetchBreakingNews() {
    console.log("fetchBreakingNews called, window.supabase:", !!window.supabase);

    if (!window.supabase) {
        console.log('Supabase not configured - returning empty array');
        return [];
    }

    try {
        console.log("Fetching breaking news from Supabase...");
        const { data, error } = await window.supabase
            .from('breaking_news')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error fetching breaking news:', error);
            return [];
        }

        console.log("Breaking news fetched:", data ? data.length : 0, "items");

        return data || [];
    } catch (error) {
        console.error('Error fetching breaking news:', error);
        return [];
    }
}

// Update breaking news in Supabase
async function updateBreakingNews(id, updates) {
    if (!window.supabase) {
        console.error('Supabase not configured');
        return { error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await window.supabase
            .from('breaking_news')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating breaking news:', error);
            return { error };
        }

        console.log('Breaking news updated successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Error updating breaking news:', error);
        return { error };
    }
}

// Create new breaking news in Supabase
async function createBreakingNews(title, isActive = true, displayOrder = 0) {
    if (!window.supabase) {
        console.error('Supabase not configured');
        return { error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await window.supabase
            .from('breaking_news')
            .insert([{
                title: title,
                is_active: isActive,
                display_order: displayOrder
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating breaking news:', error);
            return { error };
        }

        console.log('Breaking news created successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Error creating breaking news:', error);
        return { error };
    }
}

// Delete breaking news from Supabase
async function deleteBreakingNews(id) {
    if (!window.supabase) {
        console.error('Supabase not configured');
        return { error: { message: 'Supabase not configured' } };
    }

    try {
        const { error } = await window.supabase
            .from('breaking_news')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting breaking news:', error);
            return { error };
        }

        console.log('Breaking news deleted successfully');
        return { error: null };
    } catch (error) {
        console.error('Error deleting breaking news:', error);
        return { error };
    }
}

// Render breaking news ticker
async function renderBreakingNewsTicker() {
    const tickerContainer = document.querySelector('.ticker');
    if (!tickerContainer) return;

    const breakingNews = await fetchBreakingNews();

    if (breakingNews.length === 0) {
        // Hide the breaking news bar if no breaking news
        const breakingBar = document.querySelector('.breaking-news-bar');
        if (breakingBar) {
            breakingBar.style.display = 'none';
        }
        return;
    }

    // Show the breaking news bar
    const breakingBar = document.querySelector('.breaking-news-bar');
    if (breakingBar) {
        breakingBar.style.display = 'flex';
    }

    // Create ticker items from breaking news
    const tickerItems = breakingNews.map(news => {
        // Display title as-is
        return `<span class="ticker-item">${news.title}</span>`;
    }).join('');

    tickerContainer.innerHTML = tickerItems;
}

// Render articles to the news grid
async function renderArticles() {
    const grid = document.getElementById('news-grid');
    if (!grid) return;

    const articles = await fetchArticles();

    if (articles.length === 0) {
        grid.innerHTML = '<p style="padding: 20px; text-align: center;">No articles found.</p>';
        return;
    }

    grid.innerHTML = articles.map((article, index) => `
        <article class="news-card ${index === 0 ? 'featured-card' : ''}" id="article-card-${article.id}">
            <a href="article.html?id=${article.id}" class="card-link">
                <div class="card-image-wrap">
                    <img src="${article.image}" alt="${article.title}" class="card-image" loading="lazy">
                    <div class="card-image-overlay"></div>
                    <span class="card-category">${article.category}</span>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${article.title}</h3>
                    <p class="card-excerpt">${article.excerpt}</p>
                    <div class="card-meta">
                        <span class="card-author">${article.author}</span>
                        <span class="card-date">${article.date}</span>
                    </div>
                </div>
            </a>
        </article>
    `).join('');
}

// Fetch articles by category
async function fetchArticlesByCategory(category) {
    if (!window.supabase) {
        return [];
    }

    try {
        const { data, error } = await window.supabase
            .from('articles')
            .select('*')
            .eq('is_published', true)
            .ilike('category', category)
            .order('created_at', { ascending: false })
            .limit(6);

        if (error) {
            console.error('Error fetching category articles:', error);
            return [];
        }

        return data.map(article => ({
            id: article.id,
            title: article.title,
            category: article.category,
            author: article.author,
            date: article.date,
            readTime: article.read_time,
            image: article.image,
            excerpt: article.excerpt,
            content: article.content,
            isFeatured: article.is_featured,
            isTrending: article.is_trending,
            views: article.views || 0
        }));
    } catch (error) {
        console.error('Error fetching category articles:', error);
        return [];
    }
}

// Render articles to category grid
async function renderCategoryArticles(category, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const articles = await fetchArticlesByCategory(category);

    if (articles.length === 0) {
        grid.innerHTML = '<p style="padding: 20px; text-align: center; grid-column: 1/-1;">No articles found in this category.</p>';
        return;
    }

    grid.innerHTML = articles.map((article) => `
        <article class="news-card" id="article-card-${article.id}">
            <a href="article.html?id=${article.id}" class="card-link">
                <div class="card-image-wrap">
                    <img src="${article.image}" alt="${article.title}" class="card-image" loading="lazy">
                    <div class="card-image-overlay"></div>
                    <span class="card-category">${article.category}</span>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${article.title}</h3>
                    <p class="card-excerpt">${article.excerpt}</p>
                    <div class="card-meta">
                        <span class="card-author">${article.author}</span>
                        <span class="card-date">${article.date}</span>
                    </div>
                </div>
            </a>
        </article>
    `).join('');
}

// Load category articles on homepage
async function loadCategoryArticles() {
    // Load Movies articles
    await renderCategoryArticles('Movies', 'movies-grid');
    // Load Sports articles
    await renderCategoryArticles('Sports', 'sports-grid');
    // Load Politics articles
    await renderCategoryArticles('Politics', 'politics-grid');
    // Load Economy articles
    await renderCategoryArticles('Economy', 'economy-grid');
    // Load Health articles
    await renderCategoryArticles('Health', 'health-grid');
    // Load Technology articles
    await renderCategoryArticles('Technology', 'technology-grid');
}

// Load featured article in hero section
async function loadFeaturedArticle() {
    const heroTitle = document.getElementById('hero-title');
    if (!heroTitle) return; // Not on homepage

    const articles = await fetchArticles();

    if (articles.length === 0) {
        heroTitle.textContent = 'No articles yet';
        return;
    }

    // Use first article as featured
    const featured = articles[0];

    // Update hero section
    document.getElementById('hero-bg').style.backgroundImage = `url('${featured.image}')`;
    document.getElementById('hero-category').textContent = featured.category.toUpperCase();
    document.getElementById('hero-title').textContent = featured.title;
    document.getElementById('hero-excerpt').textContent = featured.excerpt;
    document.getElementById('hero-author').textContent = 'By ' + featured.author;
    document.getElementById('hero-date').textContent = featured.date;
    document.getElementById('hero-read').textContent = featured.readTime;
    document.getElementById('hero-read-more').href = `article.html?id=${featured.id}`;
}

// Fetch trending articles from Supabase
async function fetchTrendingArticles() {
    if (!window.supabase) {
        return [];
    }

    try {
        const { data, error } = await window.supabase
            .from('articles')
            .select('*')
            .eq('is_published', true)
            .eq('is_trending', true)
            .order('views', { ascending: false })
            .limit(5);

        if (error) throw error;

        return data.map(article => ({
            id: article.id,
            title: article.title,
            category: article.category,
            views: article.views || 0
        }));
    } catch (error) {
        console.error('Error fetching trending articles:', error);
        return [];
    }
}

// Load trending articles in sidebar
async function loadTrendingArticles() {
    const trendingGrid = document.getElementById('trending-grid');
    if (!trendingGrid) return;

    const trending = await fetchTrendingArticles();

    if (trending.length === 0) {
        trendingGrid.innerHTML = '<p style="padding: 20px; text-align: center;">No trending articles yet.</p>';
        return;
    }

    trendingGrid.innerHTML = trending.map((article, index) => `
        <a href="article.html?id=${article.id}" class="trending-item" id="trending-${index + 1}">
            <span class="trending-number">${String(index + 1).padStart(2, '0')}</span>
            <div class="trending-content">
                <span class="trending-cat">${article.category}</span>
                <h4 class="trending-title">${article.title}</h4>
            </div>
        </a>
    `).join('');
}

// =========================================
// Article Data — Edit content here
// =========================================
const articlesData = [
    {
        id: 1,
        title: "Summer Blockbuster Season Shatters All Box Office Records",
        category: "Box Office",
        author: "Michael Torres",
        date: "March 13, 2026",
        readTime: "5 min read",
        image: "images/news-1.png",
        excerpt: "Hollywood's biggest season yet sees unprecedented ticket sales as audiences flock to theaters for a lineup of highly anticipated sequels and original films that have captivated global audiences.",
        content: `
            <p>The 2026 summer blockbuster season has officially gone down in history as the most successful in Hollywood's storied existence. With total global box office receipts surpassing $14.7 billion between May and August, the industry has shattered every previous record by a staggering 23% margin.</p>

            <h2>A Perfect Storm of Anticipation</h2>
            <p>Industry analysts attribute this phenomenal success to a convergence of factors that created what many are calling a "perfect storm" of audience anticipation. The delayed release schedules from previous years meant that 2026 saw an unusually packed calendar of highly anticipated sequels, reboots, and original spectacles that drew audiences of all ages back to the multiplex.</p>

            <blockquote>"We haven't seen this level of excitement for theatrical releases since the golden age of cinema. Audiences are clearly hungry for the big-screen experience, and studios have delivered in spectacular fashion." — Rebecca Liu, Senior Analyst at BoxOffice Pro</blockquote>

            <h2>Record-Breaking Weekends</h2>
            <p>The season kicked off with a bang in early May when the latest installment of a beloved sci-fi franchise earned $287 million domestically in its opening weekend alone, setting a new all-time record. But that was just the beginning. June saw three consecutive weekends where the top film earned over $150 million, an unprecedented feat.</p>

            <p>Perhaps most impressively, the season's success wasn't limited to sequels and franchise installments. Several original films performed exceptionally well, with at least two original properties crossing the billion-dollar mark globally — a testament to audiences' appetite for fresh storytelling when delivered with the right spectacle and marketing.</p>

            <h2>What It Means for the Industry</h2>
            <p>The record-breaking season has sent ripples of optimism throughout Hollywood. Studios are already greenlit ambitious slates for 2027 and beyond, with several major productions announcing increased budgets and expanded theatrical release windows.</p>

            <p>Theater chains, which had been struggling in recent years amid competition from streaming platforms, are now reporting their highest profit margins in over a decade. AMC Entertainment, the world's largest theater chain, has announced plans to renovate and expand 200 locations over the next two years.</p>

            <p>The message from this summer is clear: when studios invest in quality content designed for the big screen, audiences will show up. As one industry executive put it, "The theatrical experience isn't just surviving — it's thriving like never before."</p>
        `
    },
    {
        id: 2,
        title: "Legendary Director Reveals Ambitious New Sci-Fi Epic in Development",
        category: "Production",
        author: "Sarah Chen",
        date: "March 12, 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=500&fit=crop",
        excerpt: "The acclaimed filmmaker shares exclusive details about a groundbreaking science fiction project that promises to push the boundaries of visual storytelling.",
        content: `
            <p>In an exclusive interview, one of Hollywood's most celebrated directors has pulled back the curtain on an ambitious new science fiction epic that has been in secret development for over three years. The project, described as a "generation-defining" cinematic experience, is set to begin principal photography later this year.</p>

            <h2>A Vision Three Years in the Making</h2>
            <p>The director revealed that the idea for the film first came during the production of their previous award-winning feature. "I was standing on set one day, looking at what we'd built, and I realized that the story I really wanted to tell required tools and techniques that didn't exist yet," they shared. "So we spent the next three years developing them."</p>

            <blockquote>"This isn't just a movie — it's a new way of experiencing cinema. We've developed proprietary technology that will allow audiences to feel not just like observers, but participants in the story."</blockquote>

            <h2>Pushing Technological Boundaries</h2>
            <p>The project reportedly combines traditional filmmaking with cutting-edge virtual production techniques, including a newly developed camera system that captures footage in unprecedented resolution and dynamic range. The director's visual effects team has been working in partnership with leading tech companies to create what's being described as a "quantum leap" in visual storytelling.</p>

            <p>While plot details remain tightly under wraps, the director did confirm that the story spans multiple timelines and explores themes of human consciousness, artificial intelligence, and the nature of reality itself — topics that have become increasingly relevant in today's rapidly evolving technological landscape.</p>

            <h2>An All-Star Ensemble</h2>
            <p>Casting announcements are expected in the coming weeks, with reports suggesting that several A-list performers have already signed on to the project. The film's budget is rumored to be in the range of $250-300 million, making it one of the most expensive original productions ever greenlit.</p>

            <p>The studio behind the project has committed to an exclusive theatrical release, with the director insisting that the film is designed specifically for the big-screen experience. "This is a film that demands to be seen in a theater," they said. "The scale, the sound design, the visual density — it's all calibrated for that communal, immersive experience."</p>

            <p>The film is currently targeted for a late 2027 release, with post-production expected to take approximately 18 months due to the complexity of the visual effects work involved.</p>
        `
    },
    {
        id: 3,
        title: "Streaming Giants Announce $50 Billion Combined Content Investment for 2026",
        category: "Streaming",
        author: "James Park",
        date: "March 11, 2026",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=500&fit=crop",
        excerpt: "Major platforms are doubling down on original content as the streaming wars intensify with unprecedented budgets and exclusive deals.",
        content: `
            <p>The streaming landscape is set for its most dramatic transformation yet, as the industry's leading platforms have collectively committed more than $50 billion to original content production in 2026. This staggering investment represents a 40% increase over the previous year and signals a new phase in the ongoing streaming wars.</p>

            <h2>The Numbers Behind the Headlines</h2>
            <p>Leading the charge is the market's dominant player, which has earmarked approximately $18 billion for original films, series, and documentaries — a figure that would make it the single largest content spender in entertainment history. Close behind, two major competitors have each pledged budgets in the $12-15 billion range, while several emerging platforms are making aggressive plays with budgets between $3-5 billion each.</p>

            <blockquote>"We're witnessing an arms race in content creation that shows no signs of slowing down. The platforms that will win are the ones that can consistently deliver both quantity and quality." — Dr. Amanda Foster, Media Industry Professor at UCLA</blockquote>

            <h2>Quality Over Quantity Shift</h2>
            <p>Perhaps the most notable trend within these investments is a clear shift toward fewer, higher-quality productions. After years of criticism for "content flooding" — the practice of releasing hundreds of titles of varying quality — major platforms are now focusing on prestige projects with larger per-title budgets.</p>

            <p>One platform executive explained the strategic pivot: "We've learned that audiences don't want 500 mediocre shows. They want 50 incredible ones. So we're investing more per project while being more selective about what we greenlight."</p>

            <h2>Global Content Expansion</h2>
            <p>A significant portion of these budgets is being directed toward international productions. Following the massive global success of non-English language content in recent years, platforms are establishing production hubs across Asia, Europe, Latin America, and Africa.</p>

            <p>This global expansion is creating unprecedented opportunities for filmmakers and actors worldwide. Industry reports suggest that streaming platforms will directly employ over 2 million creative professionals globally by the end of 2026, making them collectively the largest employer in the entertainment industry.</p>

            <h2>The Impact on Traditional Media</h2>
            <p>The massive streaming investments are having profound effects on traditional broadcast and cable television. Several legacy networks have announced accelerated plans to transition their content libraries to streaming-first distribution models, while theater chains are working to differentiate the big-screen experience from at-home viewing.</p>

            <p>Despite the competitive pressures, many industry observers see this moment as a golden age for content creators and audiences alike. With more money being invested in storytelling than ever before, the variety and quality of available entertainment continues to reach new heights.</p>
        `
    },
    {
        id: 4,
        title: "Indie Film Renaissance: Low-Budget Movies Dominating Critical Acclaim",
        category: "Indie",
        author: "Emily Rodriguez",
        date: "March 10, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=500&fit=crop",
        excerpt: "A wave of independent films is capturing audiences and critics alike, proving that compelling storytelling doesn't require blockbuster budgets.",
        content: `
            <p>In a year dominated by mega-budget spectacles and franchise installments, a quiet revolution has been unfolding in the independent film world. A remarkable slate of low-budget productions has earned near-universal critical acclaim, festival awards, and — perhaps most surprisingly — significant commercial success.</p>

            <h2>Breaking the Budget Barrier</h2>
            <p>The numbers tell a compelling story. At least seven films made for under $5 million have earned over $50 million at the global box office this year, while three micro-budget productions (under $500,000) have crossed the $20 million mark. These returns represent some of the highest ROI ratios in the industry's history.</p>

            <blockquote>"We're seeing a fundamental shift in what audiences value. They're increasingly drawn to authentic, personal stories that connect on an emotional level. You can't buy that kind of resonance with a $200 million budget." — Maria Santos, Sundance Film Festival Director</blockquote>

            <h2>The New Wave of Indie Auteurs</h2>
            <p>This indie renaissance has been driven by a new generation of filmmakers who grew up with unprecedented access to filmmaking tools and distribution channels. Digital cameras, affordable editing software, and social media marketing have drastically lowered the barriers to entry, allowing diverse voices to tell stories that the traditional studio system might never have greenlit.</p>

            <p>Among the breakout talents this year are a debut director whose immigrant family drama has been called "the most emotionally devastating film of the decade," and a collective of filmmakers whose experimental anthology has pushed the boundaries of narrative structure in thrilling new ways.</p>

            <h2>Streaming Platforms Take Notice</h2>
            <p>The commercial viability of indie films has not gone unnoticed by major streaming platforms. Several services have launched dedicated indie acquisition divisions, and bidding wars at major festivals have driven acquisition prices to record levels. One platform recently paid $25 million for distribution rights to a film that was made for just $800,000.</p>

            <p>However, many indie filmmakers are choosing to maintain their independence, utilizing direct-to-consumer distribution models and building loyal fan communities through social media engagement. This grassroots approach has proven remarkably effective, with some filmmakers earning more through self-distribution than they would have through traditional studio deals.</p>

            <h2>Impact on the Industry</h2>
            <p>The indie boom is having a measurable impact on the broader industry. Major studios are increasingly looking to the independent world for fresh talent and ideas, with several blockbuster directors originally emerging from this year's festivals. The result is a healthier, more diverse film ecosystem that benefits creators and audiences alike.</p>

            <p>As one veteran producer noted, "The best thing that ever happened to Hollywood was this indie renaissance. It's reminded everyone — studios, audiences, critics — that the magic of cinema isn't about how much you spend. It's about what you have to say."</p>
        `
    },
    {
        id: 5,
        title: "Awards Season 2026: Early Predictions and Front-Runners Revealed",
        category: "Awards",
        author: "David Kim",
        date: "March 9, 2026",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800&h=500&fit=crop",
        excerpt: "Industry insiders weigh in on which films, directors, and performances are leading the race as the prestigious awards season approaches.",
        content: `
            <p>As the entertainment world turns its attention to the upcoming awards season, early predictions and front-runners are beginning to emerge from the critical consensus. This year's race promises to be one of the most competitive in recent memory, with an unusually deep field of contenders across all major categories.</p>

            <h2>Best Picture: A Wide-Open Race</h2>
            <p>The Best Picture race is shaping up to be the most unpredictable in years. At least eight films are considered serious contenders, spanning genres from intimate character studies to epic historical dramas. Leading the early polls is a critically acclaimed portrait of a struggling musician that has been called "a masterpiece of human observation," followed closely by a sweeping period drama and a groundbreaking animated feature.</p>

            <blockquote>"This is the deepest, most diverse group of Best Picture contenders I've seen in my 30 years covering the industry. Any of the top five could win on any given night." — Richard Thompson, Awards Season Analyst</blockquote>

            <h2>Directing and Performance Categories</h2>
            <p>The Best Director category features a compelling mix of established masters and exciting newcomers. Two debut filmmakers are among the front-runners — a rarity that underscores the industry's shifting power dynamics and openness to fresh perspectives.</p>

            <p>In the acting categories, several transformative performances have already generated significant buzz. The lead categories are expected to be fiercely contested, with performances ranging from a complete physical transformation for a biographical role to a nuanced portrayal of a historical figure that has been described as "career-defining."</p>

            <h2>Technical Achievement Standouts</h2>
            <p>The technical categories are seeing some of the most innovative work in years. Advances in visual effects, sound design, and cinematography have produced several films that are pushing the boundaries of what's possible on screen. One particular front-runner has been praised for its revolutionary approach to in-camera effects work, blending practical and digital techniques in ways that have left industry professionals in awe.</p>

            <p>The original score category is also generating excitement, with several composers delivering some of the most memorable musical work in recent memory. From haunting minimalist compositions to sweeping orchestral arrangements, this year's scores have demonstrated the continued importance of music in enhancing cinematic storytelling.</p>

            <h2>The Campaign Trail</h2>
            <p>With the ceremony still months away, the awards campaign season is already in full swing. Studios are investing heavily in "for your consideration" campaigns, with events, screenings, and promotional materials flooding the industry. The total spend on awards campaigns is projected to exceed $500 million this year — a new record that reflects the enormous prestige and commercial value associated with major awards wins.</p>

            <p>As the race intensifies, one thing is certain: this year's awards season will be remembered as one of the most exciting and competitive in the history of the industry. With so many deserving contenders and no clear frontrunner, the coming months promise to deliver the kind of drama and suspense that rivals the best films of the year.</p>
        `
    },
    {
        id: 6,
        title: "AI Revolution in Healthcare: How Machine Learning is Transforming Patient Care",
        category: "Technology",
        author: "Priya Sharma",
        date: "March 13, 2026",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop",
        excerpt: "Artificial intelligence is revolutionizing healthcare with groundbreaking diagnostic tools and personalized treatment plans that are saving lives worldwide.",
        content: `
            <p>The healthcare industry is experiencing a profound transformation thanks to artificial intelligence and machine learning technologies. From early disease detection to personalized treatment plans, AI is fundamentally changing how medical professionals diagnose and treat patients.</p>

            <h2>Breaking New Ground in Diagnostics</h2>
            <p>AI-powered diagnostic tools are now capable of detecting diseases at earlier stages than ever before. Recent clinical trials have shown that machine learning algorithms can identify certain cancers with 95% accuracy, significantly outperforming traditional screening methods. Hospitals across India are rapidly adopting these technologies to improve patient outcomes.</p>

            <blockquote>"AI is not replacing doctors — it's giving them superpowers. We're seeing diagnostic accuracy rates that were simply impossible before." — Dr. Rajesh Kumar, Chief AI Officer at AIIMS</blockquote>

            <h2>Personalized Medicine Takes Center Stage</h2>
            <p>The era of one-size-fits-all treatment is coming to an end. AI analyzes vast amounts of patient data, including genetic information, lifestyle factors, and medical history, to recommend tailored treatment protocols. This approach has shown remarkable success in managing chronic conditions like diabetes and heart disease.</p>

            <h2>Challenges and Ethical Considerations</h2>
            <p>Despite the promise, the adoption of AI in healthcare faces significant challenges. Data privacy concerns, regulatory frameworks, and the need for extensive training for medical staff are major hurdles. Additionally, there are ongoing debates about the ethical implications of AI-driven medical decisions.</p>

            <p>As technology continues to evolve, the partnership between human expertise and artificial intelligence promises to revolutionize healthcare delivery across the globe.</p>
        `
    },
    {
        id: 7,
        title: "Shah Rukh Khan's Next Blockbuster Announced: Fans Go Wild",
        category: "Bollywood",
        author: "Ananya Reddy",
        date: "March 12, 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800&h=500&fit=crop",
        excerpt: "The King of Bollywood reveals his next big project, creating massive buzz among fans and industry insiders alike.",
        content: `
            <p>Shah Rukh Khan, the beloved King of Bollywood, has announced his next cinematic venture, sending fans into a frenzy of excitement across social media. The announcement, made during a special event in Mumbai, marks Khan's return to the silver screen after his recent successful releases.</p>

            <h2>A Dream Collaboration</h2>
            <p>The upcoming film will be directed by a renowned filmmaker known for their ability to blend commercial appeal with meaningful storytelling. Sources suggest this will be one of the most expensive Bollywood productions ever made, with a budget exceeding ₹300 crores.</p>

            <blockquote>"Working with Shah Rukh Khan is a dream come true for any director. His commitment to cinema is unparalleled." — Director Statement</blockquote>

            <h2>What We Know So Far</h2>
            <p>While plot details remain under wraps, insiders reveal that the film will be a high-octane action drama with elements of romance and suspense. The star cast reportedly includes some of Bollywood's biggest names, creating unprecedented anticipation among moviegoers.</p>

            <p>The film is expected to release during Diwali 2026, continuing the tradition of big-budget festive releases.</p>
        `
    },
    {
        id: 8,
        title: "Suriya and Vijay Set to Clash at Box Office: Who Will Win?",
        category: "Tamil",
        author: "Karthik Srinivasan",
        date: "March 11, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop",
        excerpt: "Two of Tamil cinema's biggest stars are gearing up for an epic box office showdown as their films release on the same date.",
        content: `
            <p>The Tamil film industry is buzzing with excitement as two of its biggest stars, Suriya and Vijay, prepare to lock horns at the box office. Both actors have announced their upcoming releases for the same date, creating what promises to be the biggest box office clash in South Indian cinema history.</p>

            <h2>The Contenders</h2>
            <p>Suriya's much-anticipated action drama, directed by a National Award winner, promises to be a groundbreaking cinematic experience. Meanwhile, Vijay's political thriller has been generating massive buzz since its announcement. Both films have huge budgets and star-studded casts.</p>

            <blockquote>"This is a dream scenario for cinema lovers. Both films are expected to set new benchmarks in Tamil cinema." — Trade Analyst</blockquote>

            <h2>Industry Impact</h2>
            <p>The clash has created unprecedented hype, with advance booking records being broken within hours of tickets going live. Theater owners are preparing for massive crowds, with additional shows and screens being arranged to accommodate the expected rush.</p>

            <p>Industry experts predict that whichever film emerges victorious, the real winner will be Tamil cinema itself, showcasing its massive drawing power.</p>
        `
    },
    {
        id: 9,
        title: "India's Foreign Policy Shift: New Strategic Alliances in a Changing World",
        category: "Indian Politics",
        author: "Arun Mishra",
        date: "March 13, 2026",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=500&fit=crop",
        excerpt: "India announces new strategic partnerships as the nation navigates complex global dynamics and strengthens its position on the world stage.",
        content: `
            <p>In a significant development that could reshape regional dynamics, India has announced several new strategic partnerships with neighboring countries and global powers. The announcements came during a high-profile diplomatic summit in New Delhi.</p>

            <h2>Strengthening Regional Ties</h2>
            <p>The new agreements focus on economic cooperation, security collaboration, and cultural exchange programs. Experts note that these partnerships reflect India's growing influence as a key player in global affairs.</p>

            <blockquote>"India's diplomatic outreach demonstrates our commitment to peaceful coexistence and mutual development. These partnerships will benefit not just our nations, but the entire region." — External Affairs Minister</blockquote>

            <h2>Economic Implications</h2>
            <p>The new trade agreements are expected to boost bilateral commerce significantly. Joint infrastructure projects and technology sharing initiatives form a major part of these partnerships.</p>

            <h2>Global Reactions</h2>
            <p>International observers have welcomed India's diplomatic initiatives, noting that a stable and prosperous India contributes to regional and global peace. The strategic partnerships are seen as a diplomatic balancing act in an increasingly complex geopolitical landscape.</p>
        `
    },
    {
        id: 10,
        title: "Global Climate Summit Reaches Historic Agreement on Emissions",
        category: "Global Politics",
        author: "Sarah Thompson",
        date: "March 12, 2026",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800&h=500&fit=crop",
        excerpt: "World leaders commit to ambitious new targets in landmark climate agreement that could transform global environmental policy.",
        content: `
            <p>In what environmental advocates are calling a watershed moment, representatives from over 190 countries have reached a historic agreement on climate action. The deal sets binding targets for emissions reduction and establishes a fund for climate adaptation in vulnerable nations.</p>

            <h2>Key Provisions</h2>
            <p>The agreement mandates that developed nations accelerate their timeline for achieving net-zero emissions. A new mechanism for monitoring compliance has been established, with penalties for countries failing to meet their targets.</p>

            <blockquote>"This agreement represents the best chance we have to preserve our planet for future generations. It's not perfect, but it's a crucial step forward." — UN Climate Chief</blockquote>

            <h2>Funding Commitments</h2>
            <p>Rich nations have pledged $100 billion annually to help developing countries transition to clean energy and adapt to climate impacts. The funds will be distributed through a newly established international body.</p>

            <h2>Challenges Ahead</h2>
            <p>While the agreement has been widely praised, experts caution that implementation will be key. Political changes in some countries could threaten the deal's effectiveness, and civil society groups are pushing for even more ambitious action.</p>
        `
    },
    {
        id: 11,
        title: "Monsoon Updates: Heavy Rains Expected Across Indian Subcontinent",
        category: "General",
        author: "Vijay Kumar",
        date: "March 13, 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&h=500&fit=crop",
        excerpt: "Meteorological department issues warning as heavy monsoon rains expected to hit several states in the coming days.",
        content: `
            <p>The India Meteorological Department has issued a heavy rainfall warning for several states as the annual monsoon season gains momentum. Coastal districts are expected to bear the brunt of the showers, with authorities taking preemptive measures.</p>

            <h2>States on Alert</h2>
            <p>Districts in Kerala, Karnataka, Maharashtra, and Gujarat are likely to experience heavy to very heavy rainfall. Local administrations have advised fishermen to stay off the sea and have set up relief camps in vulnerable areas.</p>

            <blockquote>"We are fully prepared to handle any emergency situation. Our disaster response teams are on standby." — State Disaster Minister</blockquote>

            <h2>Impact on Agriculture</h2>
            <p>Farmers across the region are welcoming the rainfall, which is crucial for the kharif planting season. Agricultural experts predict a significant boost in crop production if the monsoon continues at normal levels.</p>

            <p>Residents in low-lying areas have been advised to move to safer locations as a precautionary measure.</p>
        `
    },
    {
        id: 12,
        title: "International Day of Happiness: Global Celebrations Marked Worldwide",
        category: "General",
        author: "Meera Patel",
        date: "March 11, 2026",
        readTime: "3 min read",
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=500&fit=crop",
        excerpt: "People around the world celebrate International Day of Happiness with various activities promoting well-being and community spirit.",
        content: `
            <p>Communities across the globe came together to celebrate International Day of Happiness, observed annually on March 20th. This year's celebrations carried special significance as nations focus on mental health and well-being post-pandemic.</p>

            <h2>Global Initiatives</h2>
            <p>From flash mobs in major cities to community service projects in rural areas, people found unique ways to spread joy. Social media campaigns using the hashtag #InternationalDayOfHappiness trended worldwide.</p>

            <blockquote>"Happiness is not just a personal pursuit — it's a collective responsibility. Today we celebrate our shared humanity." — UNESCO Director</blockquote>

            <h2>India's Celebrations</h2>
            <p>In India, schools, offices, and community organizations organized various activities including yoga sessions, art competitions, and food drives. The emphasis was on promoting mental health awareness and supporting those in need.</p>

            <p>Several corporates announced employee wellness programs, recognizing the link between happiness and productivity.</p>
        `
    },
    {
        id: 13,
        title: "Stock Markets Reach All-Time High as Trading Volumes Surge",
        category: "Trading",
        author: "Rajesh Venkatesh",
        date: "March 13, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
        excerpt: "Global stock markets rally to record levels as investor confidence grows and trading volumes hit unprecedented numbers.",
        content: `
            <p>Stock markets across the world surged to new all-time highs today as trading volumes reached unprecedented levels. The rally, driven by strong corporate earnings and optimism about economic growth, has investors celebrating what many are calling a new bull market.</p>

            <h2>Global Market Overview</h2>
            <p>Major indices across Asia, Europe, and North America posted significant gains. The Sensex and Nifty in India climbed to record closing levels, surpassing analyst predictions. Technology and financial sectors led the rally, with several blue-chip stocks hitting their 52-week highs.</p>

            <blockquote>"We're seeing a perfect combination of factors driving this market surge — strong earnings, positive economic data, and renewed investor confidence." — Market Analyst</blockquote>

            <h2>What Investors Should Know</h2>
            <p>While the market rally is encouraging, experts advise caution. Trading volumes have been exceptionally high, indicating both enthusiasm and potential volatility. Financial advisors suggest maintaining a diversified portfolio and avoiding impulsive decisions based on short-term movements.</p>

            <p>The rally is expected to continue in the near term, but market watchers are keeping an eye on inflation data and central bank policies that could impact future growth.</p>
        `
    },
    {
        id: 14,
        title: "Gold Prices Surge: Why Investors Are Turning to Safe Haven Assets",
        category: "Gold Price",
        author: "Amit Sharma",
        date: "March 12, 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=500&fit=crop",
        excerpt: "Gold prices climb to multi-month highs as investors seek safety amid economic uncertainty and geopolitical tensions.",
        content: `
            <p>Gold prices have surged to their highest levels in months as investors increasingly turn to the precious metal as a safe haven asset. The yellow metal's rally is being driven by a combination of factors including economic uncertainty, currency fluctuations, and geopolitical tensions.</p>

            <h2>Current Market Trends</h2>
            <p>In India, gold prices have jumped significantly, with 24-karat gold crossing ₹75,000 per 10 grams. Analysts predict further gains in the coming weeks as demand remains strong during the wedding season and festive period.</p>

            <blockquote>"Gold continues to be the go-to asset for investors seeking stability. We're seeing increased demand from both retail buyers and institutional investors." — Commodity Expert</blockquote>

            <h2>Factors Driving Gold Prices</h2>
            <p>Several factors are contributing to the gold price surge: global economic uncertainty, weakening dollar, central bank buying, and inflation concerns. Additionally, jewelry demand in India remains robust despite higher prices.</p>

            <p>Experts suggest that gold could see further upside in the medium term, though short-term corrections are possible. Investors are advised to consider their portfolio allocation carefully.</p>
        `
    },
    {
        id: 15,
        title: "Malayalam Cinema Sees Revival with New Wave of Content",
        category: "Malayalam",
        author: "Suresh Nair",
        date: "March 13, 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=500&fit=crop",
        excerpt: "Mollywood experiences a renaissance with path-breaking films gaining national recognition and international acclaim.",
        content: `
            <p>Malayalam cinema is witnessing a spectacular revival with a new generation of filmmakers pushing boundaries and creating content that resonates with audiences worldwide. The industry, often called Mollywood, has seen a string of critically acclaimed and commercially successful films.</p>

            <h2>New Wave Cinema</h2>
            <p>A fresh wave of young directors is redefining Malayalam cinema with innovative storytelling techniques and bold themes. These films are not only winning awards at major festivals but also finding audiences across India and abroad through streaming platforms.</p>

            <blockquote>"This is the golden era of Malayalam cinema. The content quality is unmatched and audiences are embracing meaningful storytelling." — Film Critic</blockquote>

            <h2>Streaming Success</h2>
            <p>Several Malayalam films have become huge hits on streaming platforms, reaching diaspora audiences worldwide. The success has led to increased investment in the industry and more opportunities for talented filmmakers.</p>
        `
    },
    {
        id: 16,
        title: "Telugu Blockbusters Set New Box Office Records in 2026",
        category: "Telugu",
        author: "Ravi Teja",
        date: "March 12, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&h=500&fit=crop",
        excerpt: "Tollywood continues its golden run with films crossing 1000 crore mark globally.",
        content: `
            <p>Telugu cinema, popularly known as Tollywood, continues its unprecedented success story with films setting new box office records. The industry's global footprint has expanded significantly, with films earning unprecedented amounts in international markets.</p>

            <h2>Global Expansion</h2>
            <p>Telugu films are now releasing simultaneously in multiple languages across the world. The combination of high-octane action, emotional storytelling, and world-class production values has created a universal appeal.</p>

            <blockquote>"Tollywood has become a force to reckon with globally. The ticket prices and collections are matching Hollywood standards." — Trade Analyst</blockquote>

            <h2>Star Power</h2>
            <p>Top Telugu actors command massive opening day collections, with their films consistently crossing 100 crore mark on the first day. The industry's growth has attracted major Bollywood studios to collaborate on projects.</p>
        `
    },
    {
        id: 17,
        title: "Kannada Film Industry Emerges as New Destination for Quality Cinema",
        category: "Kannada",
        author: "Prakash Raj",
        date: "March 11, 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop",
        excerpt: "Sandalwood gains national attention with critically acclaimed films and star-studded projects.",
        content: `
            <p>The Kannada film industry, known as Sandalwood, is experiencing a transformation with a focus on quality content and pan-India appeal. Several recent releases have garnered national awards and widespread recognition.</p>

            <h2>Quality Over Quantity</h2>
            <p>Kannada filmmakers are increasingly focusing on meaningful storytelling rather than mass commercial formulas. This shift has resulted in films that appeal to a wider audience beyond the traditional Kannada-speaking regions.</p>

            <blockquote>"Sandalwood is producing some of the finest cinema in the country. The talent pool is exceptional." — National Award Jury Member</blockquote>

            <h2>Star Collaborations</h2>
            <p>Major Bollywood actors are now queuing up to work in Kannada films, recognizing the industry's potential. These collaborations are helping reach new audiences.</p>
        `
    },
    {
        id: 18,
        title: "Chinese Dramas Gain Massive Popularity in India",
        category: "Chinese Series",
        author: "Lin Wei",
        date: "March 13, 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=500&fit=crop",
        excerpt: "Indian audiences embrace Chinese web dramas with growing enthusiasm and fan communities.",
        content: `
            <p>Chinese web dramas are finding a dedicated audience in India, with streaming platforms reporting significant viewership growth. The unique storytelling style and high production values have captivated Indian viewers.</p>

            <h2>Rising Popularity</h2>
            <p>Historical dramas, fantasy series, and romantic comedies from China have developed strong fan bases in India. Subtitle quality and faster release schedules have contributed to the growing popularity.</p>

            <blockquote>"Chinese dramas offer a fresh perspective. The visual appeal and storylines are incredibly engaging." — Streaming Platform Executive</blockquote>

            <h2>Fan Communities</h2>
            <p>Dedicated fan communities on social media discuss plots, share updates, and create fan content. This organic promotion has helped attract more viewers to Chinese series.</p>
        `
    }
];

// =========================================
// Header Scroll Behavior
// =========================================
function initHeader() {
    const header = document.getElementById('main-header');
    const breakingBar = document.querySelector('.breaking-news-bar');

    if (!header) return;

    // Only apply scroll behavior on pages with breaking news bar (not on mobile)
    if (breakingBar) {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            // Skip scroll behavior on mobile
            if (window.innerWidth <= 768) {
                return;
            }

            const currentScroll = window.scrollY;
            if (currentScroll > 60) {
                header.classList.add('scrolled');
                breakingBar.style.transform = 'translateY(-100%)';
                breakingBar.style.transition = 'transform 0.4s ease';
                header.style.top = '0';
            } else {
                header.classList.remove('scrolled');
                breakingBar.style.transform = 'translateY(0)';
                header.style.top = '40px';
            }
            lastScroll = currentScroll;
        });
    }
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

    // Close menu when nav link is clicked
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            toggle.classList.remove('active');
        });
    });
}

// =========================================
// Newsletter Form
// =========================================
function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    const btn = document.getElementById('newsletter-submit');

    if (!form || !btn) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletter-email').value;
        if (email) {
            btn.textContent = '✓ Subscribed!';
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            setTimeout(() => {
                btn.textContent = 'Subscribe';
                btn.style.background = '';
                document.getElementById('newsletter-email').value = '';
            }, 3000);
        }
    });
}

// =========================================
// Article Page — Load Content
// =========================================
async function initArticlePage() {
    const articlePage = document.getElementById('article-page');
    if (!articlePage) return;

    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');

    // Fetch article from Supabase - convert ID to number
    const article = await fetchArticleById(parseInt(articleId));

    if (!article) {
        window.location.href = 'index.html';
        return;
    }

    // Update page title
    document.title = `${article.title} - Mister Reels News`;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = article.excerpt;

    // Populate article data
    document.getElementById('article-hero-img').src = article.image;
    document.getElementById('article-hero-img').alt = article.title;
    document.getElementById('article-category').textContent = article.category;
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-author').textContent = `By ${article.author}`;
    document.getElementById('article-date').textContent = `${article.date} · ${article.readTime}`;

    // Author avatar — first letter
    const avatar = document.getElementById('author-avatar');
    avatar.textContent = article.author.charAt(0);

    // Article body
    document.getElementById('article-body').innerHTML = article.content;

    // Related articles - fetch from Supabase by category
    const relatedArticles = await fetchRelatedArticles(article.category, article.id);
    const relatedGrid = document.getElementById('related-grid');

    if (!relatedGrid) {
        console.log('Related grid not found');
    } else if (relatedArticles.length === 0) {
        relatedGrid.innerHTML = '<p>No related articles found.</p>';
    } else {
        relatedGrid.innerHTML = relatedArticles.map(a => `
            <a href="article.html?id=${a.id}" class="related-card">
                <img src="${a.image}" alt="${a.title}" class="related-card-img" loading="lazy">
                <div class="related-card-body">
                    <span class="related-card-cat">${a.category}</span>
                    <h4 class="related-card-title">${a.title}</h4>
                </div>
            </a>
        `).join('');
    }

    // Share button — copy link
    const copyBtn = document.getElementById('share-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
                }, 2000);
            });
        });
    }
}

// =========================================
// Intersection Observer — Scroll Animations
// =========================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe trending items
    document.querySelectorAll('.trending-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`;
        observer.observe(item);
    });

    // Observe newsletter
    const newsletter = document.querySelector('.newsletter-content');
    if (newsletter) {
        newsletter.style.opacity = '0';
        newsletter.style.transform = 'translateY(30px)';
        newsletter.style.transition = 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(newsletter);
    }
}

// =========================================
// Initialize Everything
// =========================================

// =========================================
// Subscribers Voting System (Supabase)
// =========================================

// Store device ID
let deviceId = null;

// Generate or get device fingerprint
function getDeviceId() {
    if (deviceId) return deviceId;

    // Try to get existing device ID from localStorage
    const storedId = localStorage.getItem('misterreels_device_id');
    if (storedId) {
        deviceId = storedId;
        return deviceId;
    }

    // Generate new device ID based on browser fingerprint
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

    // Simple hash function for fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    // Create UUID-like ID
    deviceId = 'device_' + Math.abs(hash).toString(36) + Date.now().toString(36);

    // Store for future visits
    localStorage.setItem('misterreels_device_id', deviceId);

    return deviceId;
}

// Get votes from Supabase
async function getVotesFromSupabase(category) {
    const { data, error } = await supabase
        .from('votes')
        .select('series_name, device_id, likes, dislikes')
        .eq('category', category);

    if (error) {
        console.error('Error fetching votes:', error);
        return {};
    }

    // Count unique votes per series (one per device)
    const seriesCounts = {};

    data.forEach(vote => {
        const name = vote.series_name.trim();
        if (!seriesCounts[name]) {
            seriesCounts[name] = { devices: new Set(), likes: 0, dislikes: 0 };
        }
        seriesCounts[name].devices.add(vote.device_id);
        seriesCounts[name].likes = (seriesCounts[name].likes || 0) + (vote.likes || 0);
        seriesCounts[name].dislikes = (seriesCounts[name].dislikes || 0) + (vote.dislikes || 0);
    });

    // Convert to count object
    const result = {};
    Object.entries(seriesCounts).forEach(([name, data]) => {
        result[name] = {
            count: data.devices.size,
            devices: Array.from(data.devices),
            likes: data.likes,
            dislikes: data.dislikes
        };
    });

    return result;
}

// Handle like/dislike action
async function handleLikeDislike(category, seriesName, reaction) {
    // Check if Supabase is configured
    if (!window.supabase || !window.isSupabaseConfigured) {
        alert('Voting system not configured yet. Please set up Supabase first.');
        return;
    }

    const deviceId = getDeviceId();
    const seriesNameUpper = seriesName.toUpperCase();

    // Check if user already has a reaction on this series
    const { data: existingReaction } = await supabase
        .from('votes')
        .select('*')
        .eq('category', category)
        .eq('series_name', seriesNameUpper)
        .eq('device_id', deviceId)
        .single();

    // Update likes/dislikes count
    let updateData = {};

    if (existingReaction && existingReaction.user_reaction) {
        // User already has a reaction - allow changing vote
        const currentReaction = existingReaction.user_reaction;

        if (currentReaction === reaction) {
            // User clicked the same reaction - remove their vote (toggle off)
            updateData = {
                likes: Math.max(0, (existingReaction.likes || 0) - (reaction === 'like' ? 1 : 0)),
                dislikes: Math.max(0, (existingReaction.dislikes || 0) - (reaction === 'dislike' ? 1 : 0)),
                user_reaction: null
            };
        } else {
            // User is changing their vote - decrement old count, increment new count
            updateData = {
                likes: (existingReaction.likes || 0) + (reaction === 'like' ? 1 : 0) - (currentReaction === 'like' ? 1 : 0),
                dislikes: (existingReaction.dislikes || 0) + (reaction === 'dislike' ? 1 : 0) - (currentReaction === 'dislike' ? 1 : 0),
                user_reaction: reaction
            };
        }
    } else {
        // No existing reaction - add new one
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

    // If no existing vote, create one; otherwise update
    if (!existingReaction) {
        const { error: insertError } = await supabase
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
            alert('Error submitting reaction. Please try again. ' + insertError.message);
            return;
        }
    } else {
        const { error: updateError } = await supabase
            .from('votes')
            .update(updateData)
            .eq('category', category)
            .eq('series_name', seriesNameUpper)
            .eq('device_id', deviceId);

        if (updateError) {
            console.error('Error updating reaction:', updateError);
            alert('Error updating reaction. Please try again. ' + updateError.message);
            return;
        }
    }

    // Refresh results to show updated counts
    loadResults(category);
}

// View all results in modal
async function viewAllResults(category) {
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const resultsList = document.getElementById('viewAllResultsList');

    // Set modal title
    const categoryNames = {
        'next': 'Next Movie / Series - All Results',
        'general': 'General - All Results'
    };
    modalTitle.textContent = categoryNames[category] || 'All Results';

    // Check if Supabase is configured
    if (!window.supabase || !window.isSupabaseConfigured) {
        resultsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No votes yet. Be the first to vote!</p>';
        modal.style.display = 'block';
        return;
    }

    try {
        // Get all votes for this category from Supabase
        const { data: votes, error } = await supabase
            .from('votes')
            .select('series_name, device_id, likes, dislikes')
            .eq('category', category);

        if (error) throw error;

        // Count unique votes per series (one per device)
        const seriesData = {};
        let totalVotes = 0;

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

        // Convert to array
        const seriesWithCounts = Object.entries(seriesData).map(([name, data]) => ({
            name,
            likes: data.likes,
            dislikes: data.dislikes
        }));

        // Calculate total likes for percentage
        const totalLikes = seriesWithCounts.reduce((sum, item) => sum + item.likes, 0);

        // Sort by likes and get all
        const allResults = seriesWithCounts
            .sort((a, b) => b.likes - a.likes);

        // Get device ID for like/dislike status
        const deviceId = getDeviceId();

        // Get user's like/dislike status
        const { data: userReactions } = await supabase
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

        // Render results
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
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Submit vote to Supabase
async function submitVote(category) {
    // Check if Supabase is configured
    if (!window.supabase || !window.isSupabaseConfigured) {
        alert('Voting system not configured yet. Please set up Supabase first.');
        return;
    }

    const seriesInput = document.getElementById(`series-${category}`);
    // Clean series name: trim, remove multiple spaces, convert to uppercase
    const seriesName = seriesInput.value
        .trim()                    // Remove leading/trailing spaces
        .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
        .toUpperCase();            // Convert to uppercase

    if (!seriesName) {
        alert('Please enter a series name');
        return;
    }

    const deviceId = getDeviceId();

    // Check if series already exists in this category (case-insensitive)
    const { data: existingSeries } = await supabase
        .from('votes')
        .select('series_name, device_id, likes, dislikes')
        .eq('category', category)
        .ilike('series_name', seriesName);

    if (existingSeries && existingSeries.length > 0) {
        // Series already exists, update the existing entry with device vote
        const existingEntry = existingSeries[0];

        // Check if this device already voted for this series
        if (existingEntry.device_id === deviceId) {
            alert('You have already voted for this series!');
            return;
        }

        // Add this device to the voters list (increment count)
        // For simplicity, we'll add the device_id to a JSONB array or just count unique devices
        // Since we're changing to likes-based, let's increment likes by 1 for the existing series
        const { error: updateError } = await supabase
            .from('votes')
            .update({
                likes: (existingEntry.likes || 0) + 1,
                device_id: deviceId  // Update to track the latest voter
            })
            .eq('category', category)
            .eq('series_name', existingEntry.series_name);

        if (updateError) {
            console.error('Error updating vote:', updateError);
            alert('Error submitting vote. Please try again. ' + updateError.message);
            return;
        }

        alert('Vote added! Thanks for voting.');
    } else {
        // New series - insert it with 1 like (the initial vote)
        const { error } = await supabase
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

        if (error) {
            console.error('Error submitting vote:', error);
            alert('Error submitting vote. Please try again. ' + error.message);
            return;
        }

        alert('Vote submitted successfully!');
    }

    // Clear input
    seriesInput.value = '';

    // Refresh results
    loadResults(category);
}

// Load and display top 5 results from Supabase
async function loadResults(category) {
    const resultsList = document.getElementById(`results-list-${category}`);

    // Check if Supabase is configured
    if (!window.supabase || !window.isSupabaseConfigured) {
        resultsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No votes yet. Be the first to vote!</p>';
        return;
    }

    try {
        // Get all votes for this category from Supabase
        const { data: votes, error } = await supabase
            .from('votes')
            .select('series_name, device_id, likes, dislikes')
            .eq('category', category);

        if (error) throw error;

        // Count unique votes per series (one per device)
        const seriesData = {};
        let totalVotes = 0;

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

        // Convert to array
        const seriesWithCounts = Object.entries(seriesData).map(([name, data]) => ({
            name,
            likes: data.likes,
            dislikes: data.dislikes
        }));

        // Calculate total likes for percentage
        const totalLikes = seriesWithCounts.reduce((sum, item) => sum + item.likes, 0);

        // Sort by likes and get top 5
        const top5 = seriesWithCounts
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 5);

        // Get device ID for like/dislike status
        const deviceId = getDeviceId();

        // Get user's like/dislike status
        const { data: userReactions } = await supabase
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

        // Render results
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
                                onclick="handleLikeDislike('${category}', '${item.name.replace(/'/g, "\\'")}', 'like').then(() => showResults('${category}'));">
                                👍 <span class="vote-count">${item.likes || 0}</span>
                            </button>
                            <button class="like-dislike-btn dislike-btn ${userReaction === 'dislike' ? 'disliked' : ''}" 
                                onclick="handleLikeDislike('${category}', '${item.name.replace(/'/g, "\\'")}', 'dislike').then(() => showResults('${category}'));">
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

// Initialize voting system
function initVoting() {
    // Load results for all categories
    loadResults('next');
    loadResults('general');
}

document.addEventListener('DOMContentLoaded', async () => {
    // Handle anchor links for smooth scrolling
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

    // Render articles from Supabase
    if (document.getElementById('news-grid')) {
        renderArticles();
        loadFeaturedArticle();
        loadTrendingArticles();
        loadCategoryArticles(); // Load category sections from database
    }

    // Render breaking news ticker from Supabase
    renderBreakingNewsTicker();

    initHeader();
    initMobileMenu();
    initNewsletter();
    await initArticlePage();
    initScrollAnimations();
    initVoting();
    initSubscribersNews();
});

// =========================================
// Subscribers Page News Functions
// =========================================

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fetch all published subscribers news from Supabase
async function fetchSubscribersNews() {
    console.log("fetchSubscribersNews called, window.supabase:", !!window.supabase);

    if (!window.supabase) {
        console.log('Supabase not configured - showing empty');
        return [];
    }

    try {
        console.log("Fetching subscribers news from Supabase...");
        const { data, error } = await window.supabase
            .from('subscribers_news')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return [];
        }

        console.log("Subscribers news fetched:", data ? data.length : 0);

        return data || [];
    } catch (error) {
        console.error('Error fetching subscribers news:', error);
        return [];
    }
}

// Fetch single subscribers news by ID
async function fetchSubscribersNewsById(id) {
    if (!window.supabase) {
        return null;
    }

    try {
        const { data, error } = await window.supabase
            .from('subscribers_news')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return null;
        }

        // Increment view count
        await window.supabase
            .from('subscribers_news')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', id);

        return data;
    } catch (error) {
        console.error('Error fetching subscribers news:', error);
        return null;
    }
}

// Load and display subscribers news in the page
async function loadSubscribersNews() {
    const newsContainer = document.getElementById('subscribers-news-container');

    if (!newsContainer) {
        console.log('Subscribers news container not found');
        return;
    }

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
            <a href="subscribers-article.html?id=${item.id}" style="text-decoration: none; color: inherit;">
                <div class="subscribers-news-card" style="background: #1a1a2e; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 10px 30px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                    ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}" style="width: 100%; height: 180px; object-fit: cover;" loading="lazy">` : ''}
                    <div style="padding: 16px;">
                        <span style="background: #8b5cf6; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">${escapeHtml(item.category)}</span>
                        <h4 style="margin: 12px 0 8px; font-size: 16px; line-height: 1.4; color: #f1f5f9;">${escapeHtml(item.title)}</h4>
                        <p style="font-size: 13px; color: #94a3b8; margin: 0 0 10px 0; line-height: 1.5;">${escapeHtml(item.excerpt || '')}</p>
                        <p style="font-size: 12px; color: #64748b; margin: 0;">${item.author} · ${item.date || new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading subscribers news:', error);
        newsContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 40px;">Error loading news. Please try again later.</p>';
    }
}

// Open subscribers news article in modal or navigate
function openSubscribersNews(id) {
    // Store the selected news ID for the modal
    window.selectedSubscribersNewsId = id;

    // Show the modal
    const modal = document.getElementById('subscribers-news-modal');
    if (modal) {
        modal.style.display = 'flex';
        loadSubscribersNewsDetail(id);
    }
}

// Close subscribers news modal
function closeSubscribersNewsModal() {
    const modal = document.getElementById('subscribers-news-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Load subscribers news detail in modal
async function loadSubscribersNewsDetail(id) {
    const modalTitle = document.getElementById('modal-subscribers-title');
    const modalContent = document.getElementById('modal-subscribers-content');
    const modalImage = document.getElementById('modal-subscribers-image');
    const commentsSection = document.getElementById('subscribers-comments-section');

    if (!window.supabase || !window.isSupabaseConfigured) {
        modalTitle.textContent = 'News not available';
        modalContent.innerHTML = '<p>Supabase not configured</p>';
        return;
    }

    try {
        const news = await fetchSubscribersNewsById(id);

        if (!news) {
            modalTitle.textContent = 'News not found';
            modalContent.innerHTML = '<p>The requested news article could not be found.</p>';
            return;
        }

        modalTitle.textContent = news.title;
        modalContent.innerHTML = `
            <p style="color: #64748b; margin-bottom: 15px;">${news.author} · ${news.date || new Date(news.created_at).toLocaleDateString()}</p>
            ${news.image ? `<img src="${news.image}" alt="${escapeHtml(news.title)}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">` : ''}
            <div style="line-height: 1.8; color: #e2e8f0;">${news.content || news.excerpt || ''}</div>
        `;

    } catch (error) {
        console.error('Error loading subscribers news detail:', error);
        modalTitle.textContent = 'Error';
        modalContent.innerHTML = '<p>Error loading news article. Please try again.</p>';
    }
}

// Fetch comments for a subscribers news article
async function loadSubscribersComments(newsId) {
    const commentsContainer = document.getElementById('subscribers-comments-list');
    const commentsCount = document.getElementById('subscribers-comments-count');

    if (!commentsContainer) return;

    if (!window.supabase || !window.isSupabaseConfigured) {
        commentsContainer.innerHTML = '<p style="color: #64748b;">Comments not available</p>';
        return;
    }

    try {
        // Get top-level comments (no parent)
        const { data: comments, error } = await window.supabase
            .from('subscribers_news_comments')
            .select('*')
            .eq('news_id', newsId)
            .is('parent_comment_id', null)
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }

        // Get replies for each comment
        let commentsWithReplies = [];
        if (comments && comments.length > 0) {
            for (const comment of comments) {
                const { data: replies } = await window.supabase
                    .from('subscribers_news_comments')
                    .select('*')
                    .eq('parent_comment_id', comment.id)
                    .eq('is_approved', true);

                commentsWithReplies.push({
                    ...comment,
                    replies: replies || []
                });
            }
        }

        const totalComments = commentsWithReplies.reduce((sum, c) => sum + 1 + (c.replies ? c.replies.length : 0), 0);

        if (commentsCount) {
            commentsCount.textContent = `${totalComments} Comment${totalComments !== 1 ? 's' : ''}`;
        }

        if (!commentsWithReplies || commentsWithReplies.length === 0) {
            commentsContainer.innerHTML = '<p style="color: #64748b; text-align: center; padding: 20px;">No comments yet. Be the first to comment!</p>';
            return;
        }

        // Get current user's device ID to highlight their comments
        const currentDeviceId = getDeviceId();

        commentsContainer.innerHTML = commentsWithReplies.map(comment => `
            <div class="comment-item" style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; margin-bottom: 15px; ${comment.device_id === currentDeviceId ? 'border: 1px solid #8b5cf6;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong style="color: #e2e8f0;">${escapeHtml(comment.author_name || 'Anonymous')}${comment.device_id === currentDeviceId ? ' (You)' : ''}</strong>
                        <span style="color: #64748b; font-size: 12px; margin-left: 10px;">${formatCommentDate(comment.created_at)}</span>
                    </div>
                </div>
                <p style="color: #cbd5e1; margin: 10px 0; line-height: 1.6;">${escapeHtml(comment.content)}</p>
                <button onclick="showReplyForm('${comment.id}')" style="background: none; border: none; color: #8b5cf6; cursor: pointer; font-size: 13px; padding: 0;">Reply</button>
                
                <!-- Reply form -->
                <div id="reply-form-${comment.id}" style="display: none; margin-top: 15px; padding-left: 20px; border-left: 2px solid #8b5cf6;">
                    <textarea id="reply-content-${comment.id}" placeholder="Write your reply..." rows="2" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.2); border-radius: 5px; background: rgba(0,0,0,0.3); color: #fff; resize: vertical;"></textarea>
                    <button onclick="submitReply('${comment.id}')" style="background: #8b5cf6; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-right: 10px;">Submit Reply</button>
                    <button onclick="hideReplyForm('${comment.id}')" style="background: #64748b; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">Cancel</button>
                </div>
                
                <!-- Replies -->
                ${comment.replies && comment.replies.length > 0 ? `
                    <div style="margin-top: 15px; padding-left: 20px; border-left: 2px solid #64748b;">
                        ${comment.replies.map(reply => `
                            <div style="margin-bottom: 15px;">
                                <strong style="color: #e2e8f0; font-size: 13px;">${escapeHtml(reply.author_name || 'Anonymous')}${reply.device_id === currentDeviceId ? ' (You)' : ''}</strong>
                                <span style="color: #64748b; font-size: 11px; margin-left: 10px;">${formatCommentDate(reply.created_at)}</span>
                                <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 13px; line-height: 1.5;">${escapeHtml(reply.content)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading comments:', error);
        commentsContainer.innerHTML = '<p style="color: #64748b;">Error loading comments</p>';
    }
}

// Get or create user display name
async function getUserDisplayName() {
    if (!window.supabase || !window.isSupabaseConfigured) {
        return null;
    }

    const deviceId = getDeviceId();

    try {
        const { data, error } = await window.supabase
            .from('subscribers_commenters')
            .select('display_name')
            .eq('device_id', deviceId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data ? data.display_name : null;
    } catch (err) {
        console.error('Error getting user display name:', err);
        return null;
    }
}

// Save or update user display name
async function saveUserDisplayName(name) {
    if (!window.supabase || !window.isSupabaseConfigured) {
        return false;
    }

    const deviceId = getDeviceId();

    try {
        // Try to update first
        const { data: existing, error: checkError } = await window.supabase
            .from('subscribers_commenters')
            .select('id')
            .eq('device_id', deviceId)
            .single();

        if (existing) {
            // Update existing
            const { error } = await window.supabase
                .from('subscribers_commenters')
                .update({ display_name: name })
                .eq('device_id', deviceId);

            if (error) throw error;
        } else {
            // Insert new
            const { error } = await window.supabase
                .from('subscribers_commenters')
                .insert([{ device_id: deviceId, display_name: name }]);

            if (error) throw error;
        }

        return true;
    } catch (err) {
        console.error('Error saving display name:', err);
        return false;
    }
}

// Update all comments with the new name
async function updateAllCommentsWithNewName(newName) {
    if (!window.supabase || !window.isSupabaseConfigured) {
        return false;
    }

    const deviceId = getDeviceId();

    try {
        // Update all comments by this device
        const { error } = await window.supabase
            .from('subscribers_news_comments')
            .update({}) // Empty update, we just need to update via RLS or trigger
            .eq('device_id', deviceId);

        // Note: We can't directly update comments since they don't store author_name anymore
        // Instead, the display_name is fetched from subscribers_commenters table
        // So we just need to update the subscribers_commenters table

        return true;
    } catch (err) {
        console.error('Error updating comments:', err);
        return false;
    }
}

// Show name input modal
function showNameInputModal(callback, defaultName = '') {
    const modal = document.getElementById('name-input-modal');
    if (!modal) {
        // Create modal if doesn't exist
        const modalHtml = `
            <div id="name-input-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; justify-content: center; align-items: center;">
                <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 12px; max-width: 400px; width: 90%;">
                    <h3 style="color: #fff; margin-top: 0;">Enter Your Name</h3>
                    <p style="color: #94a3b8; margin-bottom: 20px;">This name will be displayed with all your comments. You can change it later.</p>
                    <input type="text" id="user-display-name-input" placeholder="Your name" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.2); border-radius: 5px; background: rgba(0,0,0,0.3); color: #fff; box-sizing: border-box;">
                    <div style="display: flex; gap: 10px;">
                        <button id="save-name-btn" style="flex: 1; background: #8b5cf6; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer;">Save</button>
                        <button id="cancel-name-btn" style="flex: 1; background: #64748b; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer;">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    const modalEl = document.getElementById('name-input-modal');
    const inputEl = document.getElementById('user-display-name-input');
    const saveBtn = document.getElementById('save-name-btn');
    const cancelBtn = document.getElementById('cancel-name-btn');

    inputEl.value = defaultName;
    modalEl.style.display = 'flex';
    inputEl.focus();

    // Remove old event listeners
    const newSaveBtn = saveBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newSaveBtn.onclick = async () => {
        const name = inputEl.value.trim();
        if (name) {
            const success = await saveUserDisplayName(name);
            if (success) {
                modalEl.style.display = 'none';
                if (callback) callback(name);
            } else {
                alert('Error saving name. Please try again.');
            }
        }
    };

    newCancelBtn.onclick = () => {
        modalEl.style.display = 'none';
    };

    // Handle Enter key
    inputEl.onkeypress = (e) => {
        if (e.key === 'Enter') {
            newSaveBtn.click();
        }
    };
}

// Show name change modal
function showNameChangeModal() {
    showNameInputModal(async (newName) => {
        alert('Name updated! All your comments will now show this name.');
        // Reload comments if modal is open
        if (window.selectedSubscribersNewsId) {
            loadSubscribersComments(window.selectedSubscribersNewsId);
        }
    }, '');
}

// Show reply form
function showReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form) {
        form.style.display = 'block';
    }
}

// Hide reply form
function hideReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form) {
        form.style.display = 'none';
    }
}

// Submit a new comment
async function submitComment(newsId) {
    const contentInput = document.getElementById('comment-content');
    const content = contentInput.value.trim();

    if (!content) {
        alert('Please enter a comment');
        return;
    }

    if (!window.supabase || !window.isSupabaseConfigured) {
        alert('Comment system not configured');
        return;
    }

    try {
        // Check if user has a display name
        const displayName = await getUserDisplayName();

        if (!displayName) {
            // Show name input modal
            showNameInputModal(async (name) => {
                // Try submitting comment again after name is saved
                await submitComment(newsId);
            });
            return;
        }

        const deviceId = getDeviceId();

        const { error } = await window.supabase
            .from('subscribers_news_comments')
            .insert([{
                news_id: newsId,
                device_id: deviceId,
                author_name: displayName,
                content: content,
                is_approved: true
            }]);

        if (error) throw error;

        // Clear form
        contentInput.value = '';

        // Reload comments
        loadSubscribersComments(newsId);

        alert('Comment submitted successfully!');
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Error submitting comment. Please try again.');
    }
}

// Submit a reply to a comment
async function submitReply(parentCommentId) {
    const contentInput = document.getElementById(`reply-content-${parentCommentId}`);
    const content = contentInput.value.trim();

    if (!content) {
        alert('Please enter a reply');
        return;
    }

    if (!window.supabase || !window.isSupabaseConfigured) {
        alert('Comment system not configured');
        return;
    }

    try {
        // Check if user has a display name
        const displayName = await getUserDisplayName();

        if (!displayName) {
            // Show name input modal
            showNameInputModal(async (name) => {
                // Try submitting reply again after name is saved
                await submitReply(parentCommentId);
            });
            return;
        }

        // Get the news_id from the parent comment
        const { data: parentComment, error: fetchError } = await window.supabase
            .from('subscribers_news_comments')
            .select('news_id')
            .eq('id', parentCommentId)
            .single();

        if (fetchError || !parentComment) {
            alert('Error finding parent comment');
            return;
        }

        const deviceId = getDeviceId();

        const { error } = await window.supabase
            .from('subscribers_news_comments')
            .insert([{
                news_id: parentComment.news_id,
                parent_comment_id: parentCommentId,
                device_id: deviceId,
                author_name: displayName,
                content: content,
                is_approved: true
            }]);

        if (error) throw error;

        // Clear form
        contentInput.value = '';

        // Hide form
        hideReplyForm(parentCommentId);

        // Reload comments
        loadSubscribersComments(parentComment.news_id);

        alert('Reply submitted successfully!');
    } catch (error) {
        console.error('Error submitting reply:', error);
        alert('Error submitting reply. Please try again.');
    }
}

// Format comment date
function formatCommentDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Initialize subscribers news section
function initSubscribersNews() {
    // Check if we're on subscribers page
    const newsContainer = document.getElementById('subscribers-news-container');
    if (!newsContainer) return;

    loadSubscribersNews();
}

// Admin functions for subscribers news
async function loadSubscribersNewsList() {
    const container = document.getElementById('subscribersNewsList');

    if (!container) {
        console.log('Subscribers news list container not found');
        return;
    }

    if (!window.supabase) {
        container.innerHTML = '<p style="color: #fff;">Supabase not configured</p>';
        return;
    }

    try {
        const { data, error } = await window.supabase
            .from('subscribers_news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            container.innerHTML = '<p style="color: #ff4757;">Error loading news: ' + error.message + '</p>';
            return;
        }

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color: #aaa;">No subscribers news yet. Add one above!</p>';
            return;
        }

        container.innerHTML = data.map(news => `
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 10px;">
                    <div style="flex: 1;">
                        <span style="display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; margin-bottom: 5px; background: ${news.is_published ? '#28a745' : '#6c757d'}; color: #fff;">
                            ${news.is_published ? 'Published' : 'Draft'}
                        </span>
                        <p style="color: #fff; margin: 5px 0; font-size: 0.95rem;">${escapeHtml(news.title)}</p>
                        <small style="color: #aaa;">${news.category} | ${news.author} | ${new Date(news.created_at).toLocaleDateString()}</small>
                    </div>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                        <button onclick="editSubscribersNews('${news.id}')" style="padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem; background: #007bff; color: #fff;">
                            Edit
                        </button>
                        <button onclick="toggleSubscribersNews('${news.id}', ${!news.is_published})" style="padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem; background: ${news.is_published ? '#ffc107' : '#28a745'}; color: ${news.is_published ? '#000' : '#fff'};">
                            ${news.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onclick="deleteSubscribersNews('${news.id}')" style="padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem; background: #dc3545; color: #fff;">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading subscribers news:', error);
        container.innerHTML = '<p style="color: #ff4757;">Error loading subscribers news</p>';
    }
}

// Toggle subscribers news publish status
async function toggleSubscribersNews(id, publish) {
    if (!confirm(publish ? 'Are you sure you want to publish this news?' : 'Are you sure you want to unpublish this news?')) return;

    const messageEl = document.getElementById('subscribersNewsMessage');

    if (!window.supabase) {
        showMessage(messageEl, 'Supabase not configured', 'error');
        return;
    }

    try {
        const { error } = await window.supabase
            .from('subscribers_news')
            .update({ is_published: publish })
            .eq('id', id);

        if (error) throw error;

        showMessage(messageEl, publish ? 'News published successfully!' : 'News unpublished successfully!', 'success');
        loadSubscribersNewsList();
    } catch (error) {
        console.error('Error updating subscribers news:', error);
        showMessage(messageEl, 'Error updating news: ' + error.message, 'error');
    }
}

// Delete subscribers news
async function deleteSubscribersNews(id) {
    if (!confirm('Are you sure you want to delete this news?')) return;

    const messageEl = document.getElementById('subscribersNewsMessage');

    if (!window.supabase) {
        showMessage(messageEl, 'Supabase not configured', 'error');
        return;
    }

    try {
        const { error } = await window.supabase
            .from('subscribers_news')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showMessage(messageEl, 'News deleted successfully!', 'success');
        loadSubscribersNewsList();
    } catch (error) {
        console.error('Error deleting subscribers news:', error);
        showMessage(messageEl, 'Error deleting news: ' + error.message, 'error');
    }
}

// Edit subscribers news - load data into form
async function editSubscribersNews(id) {
    if (!window.supabase) {
        alert('Supabase not configured');
        return;
    }

    try {
        const { data, error } = await window.supabase
            .from('subscribers_news')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Fill form fields
        document.getElementById('subscribersNewsTitle').value = data.title || '';
        document.getElementById('subscribersNewsCategory').value = data.category || '';
        document.getElementById('subscribersNewsAuthor').value = data.author || '';
        document.getElementById('subscribersNewsImage').value = data.image || '';
        document.getElementById('subscribersNewsExcerpt').value = data.excerpt || '';
        document.getElementById('subscribersNewsContent').value = data.content || '';

        // Store the ID for update
        document.getElementById('addSubscribersNewsForm').dataset.editId = id;

        // Change button text
        const submitBtn = document.querySelector('#addSubscribersNewsForm button[type="submit"]');
        submitBtn.textContent = 'Update News';

        // Scroll to form
        document.getElementById('addSubscribersNewsForm').scrollIntoView({ behavior: 'smooth' });

        alert('News loaded for editing. Make your changes and click "Update News" to save.');
    } catch (error) {
        console.error('Error loading subscribers news:', error);
        alert('Error loading news for editing');
    }
}
