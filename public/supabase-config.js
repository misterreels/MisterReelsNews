// Supabase Configuration
// Replace these values with your Supabase project credentials
// Get them from: Supabase Dashboard > Settings > API

const supabaseUrl = "https://namaczchgkjclgphcblk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbWFjemNoZ2tqY2xncGhjYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODUyMzAsImV4cCI6MjA4ODk2MTIzMH0.J-jBEYDEqAkDdM6qL5gCilno6b0_uRhqH--A-QoTlyk";

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
