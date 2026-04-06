/**
 * ModeTube — Premium Focus Homepage Script
 * Enhanced with Focus Library System
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

    // 1. Randomize Quote on load
    const startQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    if (quoteEl) quoteEl.textContent = `"${startQuote}"`;

    // 2. Search Logic
    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.top.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        }
    };

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            performSearch();
        });
    }

    if (searchBtn) searchBtn.addEventListener('click', performSearch);

    // 3. Auto-focus
    setTimeout(() => {
        if (searchInput) searchInput.focus();
    }, 500);

    // 4. Initialize Focus Library
    initFocusLibrary();

    // 5. Start Session Timer
    startTimer();
}

/**
 * Focus Library System
 */
async function initFocusLibrary() {
    const addBtn = document.getElementById('lib-add-btn');
    const linkInput = document.getElementById('lib-link-input');
    const folderInput = document.getElementById('lib-folder-input');

    // Seed Demo Folders once
    const seedData = await chrome.storage.local.get("demo_seeded");
    if (!seedData.demo_seeded) {
        const data = await chrome.storage.local.get("library");
        const lib = data.library || {};
        if (!lib['Deep Work']) lib['Deep Work'] = [];
        if (!lib['Learning']) lib['Learning'] = [];
        if (!lib['Relaxation']) lib['Relaxation'] = [];
        await chrome.storage.local.set({ library: lib, demo_seeded: true });
    }

    // Load and render initial data
    renderLibrary();

    // Event Listeners
    if (addBtn) {
        addBtn.addEventListener('click', () => handleAddVideo());
    }

    // Listeners for Library Search
    const libSearchInput = document.getElementById('lib-search-input');
    if (libSearchInput) {
        libSearchInput.addEventListener('focus', () => {
             libSearchInput.style.borderColor = 'rgba(80,222,169,0.4)';
             libSearchInput.style.background = 'rgba(255,255,255,0.06)';
        });
        libSearchInput.addEventListener('blur', () => {
             libSearchInput.style.borderColor = 'rgba(255,255,255,0.05)';
             libSearchInput.style.background = 'rgba(255,255,255,0.03)';
        });
        libSearchInput.addEventListener('input', (e) => {
            renderLibrary(e.target.value);
        });
    }

    // Enter key support for inputs
    [linkInput, folderInput].forEach(inp => {
        if (inp) {
            inp.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleAddVideo();
            });
        }
    });
}

async function handleAddVideo() {
    const linkInput = document.getElementById('lib-link-input');
    const folderInput = document.getElementById('lib-folder-input');
    const url = linkInput.value.trim();
    const folderName = folderInput.value.trim() || "Uncategorized";

    // 1. Basic Validation
    if (!url) {
        showError("Please paste a YouTube link");
        return;
    }

    // 2. Simple YouTube Check
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
        showError("Invalid YouTube URL");
        return;
    }

    // 3. Duplicate Check
    const data = await chrome.storage.local.get("library");
    const library = data.library || {};
    const existingVideos = library[folderName] || [];
    
    if (existingVideos.some(v => v.url === url)) {
        showError("Video already in this folder");
        return;
    }

    // 4. Fetch Metadata (oEmbed)
    showError(""); // Clear errors
    const addBtn = document.getElementById('lib-add-btn');
    addBtn.disabled = true;
    addBtn.style.opacity = '0.5';

    try {
        const metadata = await fetchVideoMetadata(url);
        
        // 5. Update Storage
        const newVideo = {
            url: url,
            title: metadata.title || "Unknown Title",
            thumbnail: metadata.thumbnail_url || "https://s.ytimg.com/yts/img/no_thumbnail-vfl4_28D7.jpg"
        };

        if (!library[folderName]) {
            library[folderName] = [];
        }
        library[folderName].push(newVideo);

        await chrome.storage.local.set({ library });

        // 6. UI Updates
        linkInput.value = "";
        
        // Update datalist logic is handled in renderLibrary
        renderLibrary();
    } catch (err) {
        showError("Failed to fetch video details");
    } finally {
        addBtn.disabled = false;
        addBtn.style.opacity = '1';
    }
}

async function fetchVideoMetadata(url) {
    // YouTube oEmbed endpoint
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    if (!response.ok) throw new Error("Metadata fetch failed");
    return await response.json();
}
async function renderLibrary(searchQuery = '') {
    const display = document.getElementById('library-display');
    if (!display) return;

    const data = await chrome.storage.local.get("library");
    const library = data.library || {};

    if (Object.keys(library).length === 0) {
        display.innerHTML = `<p style="color: var(--on-surface-variant); opacity: 0.5; margin-top: 2rem;">Your library is empty. Add your first link above.</p>`;
        return;
    }

    display.innerHTML = ""; // Clear

    const term = searchQuery.toLowerCase().trim();

    // Sort folders alphabetically
    const folders = Object.keys(library).sort();

    // Populate Datalist for folder input (only when not searching, or always if it helps)
    if (!searchQuery) {
        const datalist = document.getElementById('folder-options');
        if (datalist) {
            datalist.innerHTML = folders.map(f => `<option value="${f}">`).join('');
        }
    }

    folders.forEach(folderName => {
        let videos = library[folderName];
        
        // Filter logic
        const folderMatches = folderName.toLowerCase().includes(term);
        if (term) {
            if (!folderMatches) {
                // If folder doesn't match, keep only videos that match
                videos = videos.filter(v => v.title.toLowerCase().includes(term));
            }
            // If neither folder nor any videos match, skip this folder entirely
            if (!folderMatches && videos.length === 0) return;
        }

        const folderSection = document.createElement('div');
        folderSection.className = 'folder-section';

        folderSection.innerHTML = `
            <div class="folder-header">
                <div class="folder-info" style="flex: 1; display: flex; align-items: center; gap: 0.75rem;">
                    <span class="folder-name-container" style="display: flex; align-items: center;">
                        <span class="folder-name">${folderName}</span>
                    </span>
                    <span class="video-count">(${videos.length} ${videos.length === 1 ? 'video' : 'videos'})</span>
                </div>
                <div class="folder-actions" style="display: flex; gap: 0.5rem; align-items: center;">
                    <button class="folder-edit-btn" style="background: transparent; border: none; color: var(--on-surface-variant); cursor: pointer; opacity: 0.5; transition: opacity 0.2s;" title="Edit Folder Name">
                        <span class="material-symbols-outlined" style="font-size: 1.1rem;">edit</span>
                    </button>
                    <button class="folder-delete-btn" style="background: transparent; border: none; color: var(--on-surface-variant); cursor: pointer; opacity: 0.5; transition: opacity 0.2s;" title="Delete Folder">
                        <span class="material-symbols-outlined" style="font-size: 1.1rem;">delete</span>
                    </button>
                </div>
            </div>
            <div class="videos-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
        `;

        const list = folderSection.querySelector('.videos-list');
        const editBtn = folderSection.querySelector('.folder-edit-btn');
        const deleteBtn = folderSection.querySelector('.folder-delete-btn');
        const nameContainer = folderSection.querySelector('.folder-name-container');
        const nameSpan = folderSection.querySelector('.folder-name');

        // Hover effects for folder buttons
        [editBtn, deleteBtn].forEach(btn => {
            btn.onmouseover = () => { 
                if (btn.dataset.locked) return;
                btn.style.opacity = '1'; 
                btn.style.color = btn.classList.contains('folder-delete-btn') ? '#ff5f5f' : 'var(--primary)'; 
            };
            btn.onmouseout = () => { 
                if (btn.dataset.locked) return;
                btn.style.opacity = '0.5'; 
                btn.style.color = 'var(--on-surface-variant)'; 
            };
        });

        // Edit folder event (Inline Input)
        editBtn.addEventListener('click', () => {
            // Prevent multiple inputs
            if (nameContainer.querySelector('input')) return;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = folderName;
            input.style = 'background: rgba(255,255,255,0.05); border: 1px solid rgba(80,222,169,0.3); color: var(--on-surface); font-family: inherit; font-size: 1.1rem; font-weight: 600; outline: none; border-radius: 4px; padding: 2px 6px; width: 140px;';

            nameContainer.innerHTML = '';
            nameContainer.appendChild(input);
            input.focus();
            
            // Hide edit button while editing
            editBtn.style.display = 'none';

            let isFinishing = false;

            const finishEdit = async () => {
                if (isFinishing) return;
                isFinishing = true;

                const newName = input.value.trim();
                if (!newName || newName === folderName) {
                    renderLibrary(); // Cancel edit
                    return;
                }

                const data = await chrome.storage.local.get("library");
                const lib = data.library || {};

                if (lib[newName]) {
                    showError(`Folder "${newName}" already exists`);
                    renderLibrary();
                    return;
                }

                // Preserve order
                const newLibrary = {};
                for (const key of Object.keys(lib)) {
                    if (key === folderName) {
                        newLibrary[newName] = lib[folderName];
                    } else {
                        newLibrary[key] = lib[key];
                    }
                }

                await chrome.storage.local.set({ library: newLibrary });
                renderLibrary();
            };

            input.addEventListener('blur', finishEdit);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') finishEdit();
            });
        });

        // Delete folder event (Inline Confirmation)
        let confirmDeleteTimer;
        deleteBtn.addEventListener('click', async () => {
            if (deleteBtn.dataset.confirming === "true") {
                clearTimeout(confirmDeleteTimer);
                // Execute deletion
                const data = await chrome.storage.local.get("library");
                const lib = data.library || {};
                delete lib[folderName];
                await chrome.storage.local.set({ library: lib });
                renderLibrary();
            } else {
                // Require second click
                deleteBtn.dataset.confirming = "true";
                deleteBtn.dataset.locked = "true";
                deleteBtn.style.opacity = '1';
                deleteBtn.style.color = '#ff5f5f';
                deleteBtn.innerHTML = '<span style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase;">Confirm?</span>';
                
                confirmDeleteTimer = setTimeout(() => {
                    deleteBtn.dataset.confirming = "false";
                    deleteBtn.dataset.locked = "false";
                    deleteBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1.1rem;">delete</span>';
                    deleteBtn.style.opacity = '0.5';
                    deleteBtn.style.color = 'var(--on-surface-variant)';
                }, 3000);
            }
        });

        if (videos.length === 0) {
            list.innerHTML = '<span style="color: var(--on-surface-variant); opacity: 0.5; font-size: 0.85rem; padding: 0.5rem 0;">Empty folder</span>';
        }

        videos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'video-item-minimal';
            videoCard.style = 'display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; transition: background 0.2s;';
            videoCard.innerHTML = `
                <div class="video-info" style="padding: 0; display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 0;">
                    <span class="material-symbols-outlined" style="font-size: 1.2rem; color: var(--primary); opacity: 0.8;">play_circle</span>
                    <span class="video-title" style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${video.title}</span>
                </div>
                <button class="remove-video-btn" title="Remove link" style="background: transparent; border: none; color: var(--on-surface-variant); cursor: pointer; padding: 4px; display: flex; align-items: center; opacity: 0.4; transition: all 0.2s;">
                    <span class="material-symbols-outlined" style="font-size: 1.2rem;">close</span>
                </button>
            `;

            const delBtn = videoCard.querySelector('.remove-video-btn');

            videoCard.onmouseover = () => { 
                videoCard.style.background = 'rgba(255,255,255,0.06)';
                delBtn.style.opacity = '1';
                delBtn.style.color = '#ff5f5f';
            };
            videoCard.onmouseout = () => { 
                videoCard.style.background = 'rgba(255,255,255,0.03)';
                delBtn.style.opacity = '0.4';
                delBtn.style.color = 'var(--on-surface-variant)';
            };

            // Click to open
            videoCard.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-video-btn')) {
                    window.top.location.href = video.url;
                }
            });

            // Delete event
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteVideo(folderName, video.url);
            });

            list.appendChild(videoCard);
        });

        display.appendChild(folderSection);
    });
}

async function deleteVideo(folderName, url) {
    const data = await chrome.storage.local.get("library");
    const library = data.library || {};

    if (library[folderName]) {
        library[folderName] = library[folderName].filter(v => v.url !== url);
        await chrome.storage.local.set({ library });
        renderLibrary();
    }
}



function showError(msg) {
    const errorEl = document.getElementById('library-error');
    if (!errorEl) return;

    errorEl.textContent = msg;
    if (msg) {
        errorEl.classList.add('visible');
        setTimeout(() => {
            errorEl.classList.remove('visible');
        }, 3000);
    } else {
        errorEl.classList.remove('visible');
    }
}

let timerInterval;
let secondsElapsed = 0;
let isPageVisible = !document.hidden && document.hasFocus();

function _getTodayKey() {
    const d = new Date();
    return `zen_usage_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
}

async function startTimer() {
    const timerEl = document.getElementById('zen-timer');
    if (!timerEl) return;

    const updateUI = () => {
        const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (secondsElapsed % 60).toString().padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
    };

    const syncFromStorage = async () => {
        const key = _getTodayKey();
        const data = await chrome.storage.local.get({ [key]: 0 });
        secondsElapsed = data[key];
        updateUI();
    };

    // Initial sync
    await syncFromStorage();

    const checkVisibility = () => !document.hidden && document.hasFocus();

    // Listen for visibility and focus changes to stay in sync
    const handleVisibilityChange = async () => {
        isPageVisible = checkVisibility();
        if (isPageVisible) {
            // Re-fetch from storage in case time was spent in another tab
            await syncFromStorage();
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);

    timerInterval = setInterval(() => {
        // Double check focus every second to prevent desync
        isPageVisible = checkVisibility();
        if (isPageVisible) {
            secondsElapsed++;
            updateUI();
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', initPremiumZen);
