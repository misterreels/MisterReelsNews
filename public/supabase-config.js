// Supabase Configuration
// Replace these values with your Supabase project credentials
// Get them from: Supabase Dashboard > Settings > API

const supabaseUrl = "https://drjzwdsdrmrcvmzmnqip.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyanp3ZHNkcm1yY3Ztem1ucWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTEzMDIsImV4cCI6MjA4OTM4NzMwMn0.ZyHxQk7WxUZ_UzSmxdINDVrYXC-zgVvAnhP1tXHCp9E";

// NewsData.io Configuration
// Get your free API key from: https://newsdata.io/
const newsdataApiKey = "pub_18fd94de6dd54e14ae23e6ebb7f96fb0";

// Check if credentials are configured
const isSupabaseConfigured = supabaseUrl !== "YOUR_SUPABASE_URL" && supabaseKey !== "YOUR_SUPABASE_ANON_KEY";
const isNewsdataConfigured = newsdataApiKey !== "YOUR_NEWSDATA_API_KEY" && newsdataApiKey !== "";

// Initialize Supabase client and make it globally available
if (isSupabaseConfigured) {
    try {
        // Create Supabase client and make it available globally
        window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
        console.log("Supabase client initialized successfully");
    } catch (e) {
        console.error("Supabase initialization failed:", e);
    }
} else {
    console.log("Supabase credentials not configured");
}

// Make variables globally accessible
window.isSupabaseConfigured = isSupabaseConfigured;
window.isNewsdataConfigured = isNewsdataConfigured;
window.newsdataApiKey = newsdataApiKey;

console.log("Supabase config loaded, isSupabaseConfigured:", isSupabaseConfigured);
console.log("NewsData.io config loaded, isNewsdataConfigured:", isNewsdataConfigured);
