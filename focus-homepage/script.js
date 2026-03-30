/**
 * ZenTube — Premium Focus Homepage Script
 * Logic for timer visualization and search functionality.
 */

const QUOTES = [
    "Focus on the step, not the mountain.",
    "Breathe. One intention at a time.",
    "Quality is pride of workmanship.",
    "Silence is the sleep that nourishes wisdom.",
    "Don't busy yourself, focus yourself.",
    "A journey of a thousand miles begins with a single step."
];

function initPremiumZen() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const quoteEl = document.getElementById('zen-quote');
    const timerEl = document.getElementById('zen-timer');

    // 1. Randomize Quote on load
    const startQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    quoteEl.textContent = `"${startQuote}"`;

    // 2. Search Logic
    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        }
    };

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
    });

    searchBtn.addEventListener('click', performSearch);

    // 3. Simple Timer Visualization (Updates every minute to show progress toward focus)
    // For now we just show a static 25:00 as per design, but we can make it countdown 
    // if the user wants it to be active immediately.
    
    // 4. Auto-focus
    setTimeout(() => {
        searchInput.focus();
    }, 500);
}

document.addEventListener('DOMContentLoaded', initPremiumZen);
