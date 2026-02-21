// Cross-Device Testimonials System for Netlify
// Uses JSONBin.io for free cross-device synchronization

let testimonials = [];
let currentTestimonialIndex = 0;
let testimonialsUpdateInterval;
let currentLanguage = 'en'; // Default language
let currentTheme = 'dark'; // Default theme

// JSONBin.io Configuration (Free API for cross-device sync)
const JSONBIN_API_KEY = '$2a$10$VbgnOiTqlNPde9xu2N6tBe3QzYxs0WzrW4vwHAf32MR9uUlhZrQ3q'; // Your actual API key
const JSONBIN_BIN_ID = '689ba4c743b1c97be91cbdd4'; // We'll get this after creating a bin
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== Portfolio Initialization ===');

    // Load saved preferences
    loadPreferences();

    // Initialize testimonials system
    initializeTestimonialsCrossDevice();

    // Setup language switching
    setupLanguageSwitching();

    // Setup theme switching
    setupThemeSwitching();

    // Setup admin functionality
    setupAdminFeatures();

    // Setup mobile navigation
    setupMobileNavigation();

    // Setup smooth scrolling
    setupSmoothScrolling();

    // Setup contact form
    setupContactForm();

    // Setup project demos
    setupProjectDemos();

    console.log('Portfolio fully initialized!');

    // Test admin button functionality
    setTimeout(() => {
        console.log('🔧 Testing admin functionality...');
        const adminToggle = document.getElementById('adminToggle');
        if (adminToggle) {
            console.log('✅ Admin button found in DOM');
            console.log('Admin button text:', adminToggle.textContent);
            console.log('Admin button onclick:', adminToggle.onclick);
            console.log('Admin button event listeners:', adminToggle.onclick ? 'Has onclick' : 'No onclick');
        } else {
            console.error('❌ Admin button not found in DOM');
        }
    }, 1000);
});

// Load user preferences from localStorage
function loadPreferences() {
    // Load language preference
    const savedLanguage = localStorage.getItem('portfolioLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        translatePage(currentLanguage);
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('portfolioTheme');
    if (savedTheme) {
        currentTheme = savedTheme;
        applyTheme(currentTheme);
    }
}

// Language switching functionality
function setupLanguageSwitching() {
    const languageToggle = document.getElementById('languageToggle');
    const currentLangSpan = document.getElementById('currentLang');

    if (languageToggle) {
        languageToggle.addEventListener('click', function () {
            const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
            translatePage(newLanguage);
        });
    }

    // Update language display
    if (currentLangSpan) {
        currentLangSpan.textContent = currentLanguage.toUpperCase();
    }
}

// Translate the entire page
function translatePage(language) {
    currentLanguage = language;
    localStorage.setItem('portfolioLanguage', language);

    // Update language display
    const currentLangSpan = document.getElementById('currentLang');
    if (currentLangSpan) {
        currentLangSpan.textContent = language.toUpperCase();
    }

    // Set page direction
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');

    // Translate all elements with data attributes
    const translatableElements = document.querySelectorAll('[data-en][data-ar]');
    translatableElements.forEach(element => {
        const translation = language === 'ar' ? element.getAttribute('data-ar') : element.getAttribute('data-en');
        if (translation) {
            element.textContent = translation;
        }
    });

    // Translate form placeholders
    const placeholderElements = document.querySelectorAll('[data-en-placeholder][data-ar-placeholder]');
    placeholderElements.forEach(element => {
        const placeholder = language === 'ar' ? element.getAttribute('data-ar-placeholder') : element.getAttribute('data-en-placeholder');
        if (placeholder) {
            element.placeholder = placeholder;
        }
    });

    // Translate testimonials
    translateTestimonials(language);
}

// Theme switching functionality
function setupThemeSwitching() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const currentThemeSpan = document.getElementById('currentTheme');

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // Update theme display
    if (currentThemeSpan) {
        currentThemeSpan.textContent = currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
    }
    if (themeIcon) {
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Apply theme to the page
function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('portfolioTheme', theme);

    document.documentElement.setAttribute('data-theme', theme);

    // Update theme display
    const currentThemeSpan = document.getElementById('currentTheme');
    const themeIcon = document.getElementById('themeIcon');

    if (currentThemeSpan) {
        currentThemeSpan.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    }
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Admin functionality
function setupAdminFeatures() {
    console.log('🔧 Setting up admin features...');

    const adminToggle = document.getElementById('adminToggle');
    const adminModal = document.getElementById('adminModal');
    const adminUnlockBtn = document.getElementById('adminUnlockBtn');
    const adminPassInput = document.getElementById('adminPassInput');

    console.log('🔧 Admin elements found:');
    console.log('- Admin toggle:', adminToggle);
    console.log('- Admin modal:', adminModal);
    console.log('- Admin unlock button:', adminUnlockBtn);
    console.log('- Admin pass input:', adminPassInput);

    let isAdminMode = false;
    const adminPasscode = '2112004'; // Updated password

    console.log('🔧 Admin passcode set to:', adminPasscode);

    if (adminToggle) {
        console.log('🔧 Admin toggle button found:', adminToggle);
        adminToggle.addEventListener('click', function () {
            console.log('🔧 Admin button clicked!');
            console.log('Current admin mode:', isAdminMode);

            if (!isAdminMode) {
                console.log('🔓 Opening admin modal...');
                if (adminModal) {
                    adminModal.style.display = 'flex';
                    if (adminPassInput) {
                        adminPassInput.value = '';
                        adminPassInput.focus();
                    }
                    console.log('✅ Admin modal opened');
                } else {
                    console.error('❌ Admin modal not found!');
                }
            } else {
                console.log('🔒 Exiting admin mode...');
                // Exit admin mode
                isAdminMode = false;
                updateAdminUI();
            }
        });
    } else {
        console.error('❌ Admin toggle button not found!');
    }

    if (adminUnlockBtn) {
        console.log('🔧 Admin unlock button found:', adminUnlockBtn);
        adminUnlockBtn.addEventListener('click', function () {
            console.log('🔧 Admin unlock button clicked!');
            const input = adminPassInput ? adminPassInput.value : '';
            console.log('Input passcode:', input);
            console.log('Expected passcode:', adminPasscode);

            if (input === adminPasscode) {
                console.log('✅ Correct passcode! Activating admin mode...');
                isAdminMode = true;
                updateAdminUI();
                if (adminModal) {
                    adminModal.style.display = 'none';
                }
                if (adminPassInput) {
                    adminPassInput.value = '';
                }
                console.log('✅ Admin mode activated successfully!');
            } else {
                console.log('❌ Incorrect passcode!');
                alert('❌ Incorrect passcode! Try: ' + adminPasscode);
            }
        });
    } else {
        console.error('❌ Admin unlock button not found!');
    }

    // Setup cancel button
    const cancelBtn = document.querySelector('.modal-btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            if (adminModal) {
                adminModal.style.display = 'none';
            }
        });
    }

    // Close modal when clicking outside
    if (adminModal) {
        adminModal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }

    function updateAdminUI() {
        const adminIcon = document.getElementById('adminIcon');
        const adminState = document.getElementById('adminState');

        if (isAdminMode) {
            if (adminIcon) adminIcon.className = 'fas fa-unlock';
            if (adminState) adminState.textContent = currentLanguage === 'en' ? 'Admin' : 'مشرف';
            console.log('✅ Admin mode activated');
        } else {
            if (adminIcon) adminIcon.className = 'fas fa-lock';
            if (adminState) adminState.textContent = currentLanguage === 'en' ? 'Admin' : 'مشرف';
            console.log('🔒 Admin mode deactivated');
        }

        // Update admin mode in localStorage
        localStorage.setItem('adminMode', isAdminMode.toString());

        // Check admin mode for delete buttons
        checkAdminMode();
    }
}

// Mobile navigation
function setupMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Contact form functionality
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');

            // Here you would typically send the email
            // For now, just show a success message
            alert('Thank you for your message! I will get back to you soon.');
            this.reset();
        });
    }
}

// Project demo functionality
function setupProjectDemos() {
    const demoLinks = document.querySelectorAll('.project-demo');
    const demoModal = document.getElementById('demoModal');
    const demoTitle = document.getElementById('demoTitle');
    const projectVideo = document.getElementById('projectVideo');
    const projectPDF = document.getElementById('projectPDF');
    const closeDemo = document.querySelector('.close-demo');

    demoLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const filePath = this.getAttribute('data-file');
            const fileType = this.getAttribute('data-file-type');
            const projectTitle = this.getAttribute('data-project-title');

            if (demoTitle) demoTitle.textContent = projectTitle || 'Project Demo';

            if (fileType === 'video') {
                if (projectVideo) {
                    projectVideo.src = filePath;
                    projectVideo.style.display = 'block';
                    if (projectPDF) projectPDF.style.display = 'none';
                }
            } else if (fileType === 'pdf') {
                if (projectPDF) {
                    projectPDF.src = filePath;
                    projectPDF.style.display = 'block';
                    if (projectVideo) projectVideo.style.display = 'none';
                }
            }

            if (demoModal) demoModal.style.display = 'flex';
        });
    });

    if (closeDemo) {
        closeDemo.addEventListener('click', function () {
            if (demoModal) demoModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    if (demoModal) {
        demoModal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }
}

// Translate testimonials
function translateTestimonials(language) {
    const testimonialElements = document.querySelectorAll('.testimonial');
    testimonialElements.forEach(testimonial => {
        const nameElement = testimonial.querySelector('.testimonial-author h4');
        const messageElement = testimonial.querySelector('.testimonial-text p');

        if (nameElement && nameElement.getAttribute('data-en')) {
            const translation = language === 'ar' ? nameElement.getAttribute('data-ar') : nameElement.getAttribute('data-en');
            if (translation) nameElement.textContent = translation;
        }

        if (messageElement && messageElement.getAttribute('data-en')) {
            const translation = language === 'ar' ? messageElement.getAttribute('data-ar') : messageElement.getAttribute('data-en');
            if (translation) messageElement.textContent = translation;
        }
    });
}

// Initialize testimonials system with cross-device support
async function initializeTestimonialsCrossDevice() {
    console.log('=== Cross-Device Testimonials System Initialization ===');

    // Try to load from server first, fallback to localStorage
    await loadTestimonialsFromServer();

    // Update the display
    updateTestimonialsDisplay();

    // Setup navigation and form
    setupTestimonialNavigation();
    setupFeedbackForm();

    // Start real-time updates every 15 seconds
    startRealTimeUpdates();

    console.log('Cross-device testimonials system initialized with', testimonials.length, 'testimonials');
}

// Load testimonials from JSONBin.io server
async function loadTestimonialsFromServer() {
    try {
        console.log('🔄 Loading testimonials from server...');
        const response = await fetch(JSONBIN_URL, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            testimonials = data.record.testimonials || [];
            console.log('✅ Loaded testimonials from server:', testimonials.length);

            // Save to localStorage as backup
            saveTestimonialsToLocalStorage();

            if (testimonials.length > 0) {
                showNotification(`Loaded ${testimonials.length} testimonials from server`, 'success');
            }
        } else {
            console.log('⚠️ Server returned error, using localStorage fallback');
            loadTestimonialsFromLocalStorage();
        }
    } catch (error) {
        console.log('🌐 Server not available, using localStorage fallback:', error.message);
        showNotification('Server not available, using local data', 'warning');
        loadTestimonialsFromLocalStorage();
    }
}

// Save testimonials to JSONBin.io server
async function saveTestimonialsToServer() {
    try {
        console.log('🔄 Saving testimonials to server...');
        const response = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                testimonials: testimonials,
                lastUpdated: new Date().toISOString(),
                totalCount: testimonials.length
            })
        });

        if (response.ok) {
            console.log('✅ Testimonials saved to server successfully');
            return true;
        } else {
            console.log('⚠️ Failed to save to server');
            return false;
        }
    } catch (error) {
        console.log('🌐 Server not available:', error.message);
        return false;
    }
}

// Load testimonials from localStorage (fallback)
function loadTestimonialsFromLocalStorage() {
    const savedTestimonials = localStorage.getItem('portfolioTestimonials');
    if (savedTestimonials) {
        try {
            testimonials = JSON.parse(savedTestimonials);
            console.log('Loaded testimonials from localStorage:', testimonials.length);
        } catch (error) {
            console.error('Error parsing testimonials from localStorage:', error);
            testimonials = [];
        }
    } else {
        testimonials = [];
    }

    // Add sample testimonial if none exist
    if (testimonials.length === 0) {
        addSampleTestimonial();
    }
}

// Save testimonials to localStorage
function saveTestimonialsToLocalStorage() {
    try {
        localStorage.setItem('portfolioTestimonials', JSON.stringify(testimonials));
        console.log('Testimonials saved to localStorage:', testimonials.length);

        // Also save to sessionStorage for cross-tab sharing
        sessionStorage.setItem('portfolioTestimonials', JSON.stringify(testimonials));

        // Trigger custom event for cross-tab synchronization
        window.dispatchEvent(new CustomEvent('testimonialsUpdated', {
            detail: { testimonials: testimonials }
        }));

    } catch (error) {
        console.error('Error saving testimonials to localStorage:', error);
    }
}

// Start real-time updates
function startRealTimeUpdates() {
    // Check for new testimonials every 15 seconds
    testimonialsUpdateInterval = setInterval(async () => {
        await checkForNewTestimonials();
    }, 15000); // 15 seconds

    console.log('Real-time testimonials updates started (every 15 seconds)');

    // Listen for testimonials updates from other tabs
    window.addEventListener('testimonialsUpdated', (event) => {
        const newTestimonials = event.detail.testimonials;
        if (newTestimonials.length > testimonials.length) {
            testimonials = newTestimonials;
            updateTestimonialsDisplay();
            console.log('Testimonials updated from another tab');
        }
    });

    // Listen for storage changes (cross-tab)
    window.addEventListener('storage', (event) => {
        if (event.key === 'portfolioTestimonials') {
            try {
                const newTestimonials = JSON.parse(event.newValue || '[]');
                if (newTestimonials.length > testimonials.length) {
                    testimonials = newTestimonials;
                    updateTestimonialsDisplay();
                    console.log('Testimonials updated from storage event');
                }
            } catch (error) {
                console.error('Error parsing testimonials from storage event:', error);
            }
        }
    });
}

// Check for new testimonials from server
async function checkForNewTestimonials() {
    try {
        console.log('Checking for new testimonials from server...');
        const response = await fetch(JSONBIN_URL, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const serverTestimonials = data.record.testimonials || [];

            // Check if there are new testimonials
            if (serverTestimonials.length > testimonials.length) {
                testimonials = serverTestimonials;
                updateTestimonialsDisplay();
                saveTestimonialsToLocalStorage();
                console.log('✅ New testimonials found and loaded from server');
                showNotification('New testimonials loaded!', 'success');
            }
        }
    } catch (error) {
        console.log('Could not check for new testimonials:', error.message);
    }
}

// Add new testimonial with cross-device support
async function addNewTestimonialCrossDevice(name, title, message, language) {
    console.log('=== Adding New Testimonial ===');
    console.log('Name:', name);
    console.log('Title:', title);
    console.log('Message:', message);
    console.log('Language:', language);

    const testimonial = {
        id: Date.now() + Math.random(), // Ensure unique ID
        name: name.trim(),
        title: title.trim(),
        message: message.trim(),
        language: language || currentLanguage,
        translatedText: null,
        date: new Date().toISOString(),
        deviceInfo: getDeviceInfo()
    };

    console.log('Testimonial object created:', testimonial);

    // Add to testimonials array
    testimonials.push(testimonial);

    // Save to localStorage first (immediate feedback)
    saveTestimonialsToLocalStorage();

    // Update display immediately
    updateTestimonialsDisplay();

    // Try to save to server for cross-device sync
    const serverSuccess = await saveTestimonialsToServer();

    if (serverSuccess) {
        const successMessage = currentLanguage === 'en'
            ? 'Thank you! Your feedback has been shared across all devices.'
            : 'شكراً لك! تم مشاركة ملاحظاتك عبر جميع الأجهزة.';
        showNotification(successMessage, 'success');
    } else {
        const fallbackMessage = currentLanguage === 'en'
            ? 'Feedback saved locally. Will sync when server is available.'
            : 'تم حفظ الملاحظات محلياً. سيتم المزامنة عند توفر الخادم.';
        showNotification(fallbackMessage, 'info');
    }

    console.log('New testimonial added with cross-device support:', testimonial);
    return testimonial;
}

// Add sample testimonial for demonstration
function addSampleTestimonial() {
    testimonials.push({
        id: Date.now(),
        name: 'Ahmed Hassan',
        title: 'Software Engineer',
        message: 'Abdallah is an exceptional IoT engineer with deep knowledge in Big Data analytics. His attention to detail and innovative solutions made our project a huge success. Highly recommended!',
        language: 'en',
        translatedText: null,
        date: new Date().toISOString(),
        deviceInfo: getDeviceInfo()
    });
    saveTestimonialsToLocalStorage();
}

// Get device information
function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;

    // Detect device type
    let deviceType = 'Desktop';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        deviceType = 'Mobile';
    } else if (/iPad|Android/i.test(userAgent)) {
        deviceType = 'Tablet';
    }

    return `${deviceType} - ${platform} - ${language}`;
}

// Export testimonials for sharing
function exportTestimonialsForSharing() {
    const dataStr = JSON.stringify(testimonials, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'testimonials-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Testimonials exported successfully', 'success');
}

// Import testimonials from file
function importTestimonialsFromFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedTestimonials = JSON.parse(e.target.result);
            if (Array.isArray(importedTestimonials)) {
                testimonials = importedTestimonials;
                saveTestimonialsToLocalStorage();
                saveTestimonialsToServer(); // Also save to server
                updateTestimonialsDisplay();
                showNotification('Testimonials imported successfully', 'success');
            } else {
                showNotification('Invalid file format', 'error');
            }
        } catch (error) {
            showNotification('Error importing testimonials', 'error');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

// Setup JSONBin.io (call this once to initialize)
async function setupJSONBin() {
    try {
        console.log('Setting up JSONBin.io for cross-device sync...');
        const response = await fetch('https://api.jsonbin.io/v3/b', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({
                testimonials: [],
                lastUpdated: new Date().toISOString(),
                totalCount: 0
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ JSONBin.io setup successful!');
            console.log('Bin ID:', data.metadata.id);
            return data.metadata.id;
        }
    } catch (error) {
        console.error('Error setting up JSONBin.io:', error);
    }
}

// Make functions globally accessible
window.initializeTestimonialsCrossDevice = initializeTestimonialsCrossDevice;
window.addNewTestimonialCrossDevice = addNewTestimonialCrossDevice;
window.exportTestimonialsForSharing = exportTestimonialsForSharing;
window.importTestimonialsFromFile = importTestimonialsFromFile;
window.setupJSONBin = setupJSONBin;
window.testimonials = testimonials; // For debugging

// ===== MISSING FUNCTIONS FOR TESTIMONIALS SYSTEM =====

// Update testimonials display
function updateTestimonialsDisplay() {
    console.log('=== Updating Testimonials Display ===');
    console.log('Testimonials count:', testimonials.length);
    console.log('Testimonials:', testimonials);

    const container = document.getElementById('testimonialsContainer');
    const noTestimonials = document.getElementById('noTestimonials');
    const testimonialNav = document.getElementById('testimonialNav');

    console.log('Container found:', !!container);
    console.log('No testimonials element found:', !!noTestimonials);
    console.log('Navigation element found:', !!testimonialNav);

    if (!container) {
        console.error('Testimonials container not found!');
        return;
    }

    // Clear container
    container.innerHTML = '';

    if (testimonials.length === 0) {
        // Show no testimonials message
        if (noTestimonials) {
            container.appendChild(noTestimonials.cloneNode(true));
        }
        if (testimonialNav) testimonialNav.style.display = 'none';
        return;
    }

    // Hide no testimonials message
    if (noTestimonials) noTestimonials.style.display = 'none';

    // Create testimonial cards
    testimonials.forEach((testimonial, index) => {
        const testimonialCard = createTestimonialCard(testimonial, index);
        container.appendChild(testimonialCard);
    });

    // Setup navigation
    setupTestimonialNavigation();

    // Start auto-rotation
    startTestimonialRotation();

    // Check admin mode for delete buttons
    checkAdminMode();
}

// Create testimonial card
function createTestimonialCard(testimonial, index) {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.style.display = index === 0 ? 'block' : 'none';
    card.setAttribute('data-index', index);

    const date = new Date(testimonial.date);
    const formattedDate = date.toLocaleDateString();

    card.innerHTML = `
        <div class="testimonial-content">
            <div class="testimonial-text">
                <p data-en="${testimonial.message}" data-ar="${testimonial.message}">"${testimonial.message}"</p>
            </div>
            <div class="testimonial-author">
                <div class="author-info">
                    <h4 data-en="${testimonial.name}" data-ar="${testimonial.name}">${testimonial.name}</h4>
                    <span data-en="Feedback Contributor • ${formattedDate}" data-ar="مساهم في التقييم • ${formattedDate}">
                        Feedback Contributor • ${formattedDate}
                    </span>
                    <div class="testimonial-device">${testimonial.deviceInfo}</div>
                </div>
            </div>
            <div class="testimonial-actions">
                <button class="delete-testimonial" onclick="deleteTestimonial(${testimonial.id})" style="display: none;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    return card;
}

// Setup testimonial navigation
function setupTestimonialNavigation() {
    const testimonialNav = document.getElementById('testimonialNav');
    if (!testimonialNav || testimonials.length <= 1) return;

    testimonialNav.style.display = 'flex';
    testimonialNav.innerHTML = '';

    testimonials.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'nav-dot';
        dot.setAttribute('data-index', index);
        dot.addEventListener('click', () => showTestimonial(index));
        testimonialNav.appendChild(dot);
    });

    // Highlight first dot
    const firstDot = testimonialNav.querySelector('.nav-dot');
    if (firstDot) firstDot.classList.add('active');
}

// Show specific testimonial
function showTestimonial(index) {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.nav-dot');

    // Hide all cards
    cards.forEach(card => card.style.display = 'none');

    // Remove active class from all dots
    dots.forEach(dot => dot.classList.remove('active'));

    // Show selected card
    if (cards[index]) {
        cards[index].style.display = 'block';
    }

    // Highlight selected dot
    if (dots[index]) {
        dots[index].classList.add('active');
    }

    currentTestimonialIndex = index;
}

// Start testimonial rotation
function startTestimonialRotation() {
    if (testimonials.length <= 1) return;

    // Clear existing interval
    if (testimonialsUpdateInterval) {
        clearInterval(testimonialsUpdateInterval);
    }

    // Start new rotation interval
    testimonialsUpdateInterval = setInterval(() => {
        const nextIndex = (currentTestimonialIndex + 1) % testimonials.length;
        showTestimonial(nextIndex);
    }, 5000); // 5 seconds
}

// Setup feedback form
function setupFeedbackForm() {
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = this.querySelector('#feedbackName').value;
            const title = this.querySelector('#feedbackTitle').value;
            const message = this.querySelector('#feedbackMessage').value;
            const language = currentLanguage || 'en';

            if (name && title && message) {
                addNewTestimonialCrossDevice(name, title, message, language);
                this.reset();

                // Send email notification
                sendEmailNotification(name, title, message);
            }
        });
    }
}

// Send email notification
function sendEmailNotification(name, title, message) {
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init('og6W1oZLy7gT0DFzt'); // Your EmailJS User ID

        const templateParams = {
            to_name: 'Abdallah',
            from_name: name,
            from_title: title,
            message: message,
            reply_to: 'feedback@portfolio.com'
        };

        emailjs.send('service_e1n8403', 'template_kgre7jp', templateParams)
            .then(function (response) {
                console.log('Email sent successfully:', response);
                showNotification('Email notification sent!', 'success');
            }, function (error) {
                console.log('Email failed to send:', error);
                showNotification('Email notification failed', 'warning');
            });
    } else {
        console.log('EmailJS not loaded');
        showNotification('Email service not available', 'warning');
    }
}

// Delete testimonial
function deleteTestimonial(testimonialId) {
    const confirmationModal = document.getElementById('confirmationModal');
    const deleteBtn = document.querySelector('.modal-btn-delete');
    const cancelBtn = document.querySelector('.modal-btn-cancel');

    if (confirmationModal) {
        confirmationModal.style.display = 'flex';

        // Setup delete button
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                testimonials = testimonials.filter(t => t.id !== testimonialId);
                updateTestimonialsDisplay();
                saveTestimonialsToLocalStorage();
                saveTestimonialsToServer();
                confirmationModal.style.display = 'none';
                showNotification('Testimonial deleted successfully', 'success');
            };
        }

        // Setup cancel button
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                confirmationModal.style.display = 'none';
            };
        }
    }
}

// Show modern notification
function showNotification(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `modern-notification modern-notification-${type}`;

    // Get icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    const icon = icons[type] || icons.info;

    notification.innerHTML = `
        <div class="notification-icon">
            <i class="${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
            <div class="notification-progress"></div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Setup close button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            closeNotification(notification);
        };
    }

    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notification);
        }, duration);
    }

    return notification;
}

// Close notification with animation
function closeNotification(notification) {
    notification.classList.remove('show');
    notification.classList.add('hiding');

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Show modern popup modal
function showModernPopup(title, message, type = 'info', options = {}) {
    const modal = document.createElement('div');
    modal.className = 'modern-popup-overlay';

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    const icon = icons[type] || icons.info;

    modal.innerHTML = `
        <div class="modern-popup">
            <div class="popup-header popup-${type}">
                <div class="popup-icon">
                    <i class="${icon}"></i>
                </div>
                <h3 class="popup-title">${title}</h3>
                <button class="popup-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="popup-body">
                <p class="popup-message">${message}</p>
            </div>
            <div class="popup-footer">
                ${options.showCancel ? `<button class="popup-btn popup-btn-cancel">${options.cancelText || 'Cancel'}</button>` : ''}
                <button class="popup-btn popup-btn-primary popup-btn-${type}">${options.confirmText || 'OK'}</button>
            </div>
        </div>
    `;

    // Add to page
    document.body.appendChild(modal);

    // Animate in
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);

    // Setup close button
    const closeBtn = modal.querySelector('.popup-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            closeModernPopup(modal);
            if (options.onCancel) options.onCancel();
        };
    }

    // Setup confirm button
    const confirmBtn = modal.querySelector('.popup-btn-primary');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            closeModernPopup(modal);
            if (options.onConfirm) options.onConfirm();
        };
    }

    // Setup cancel button
    const cancelBtn = modal.querySelector('.popup-btn-cancel');
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            closeModernPopup(modal);
            if (options.onCancel) options.onCancel();
        };
    }

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModernPopup(modal);
            if (options.onCancel) options.onCancel();
        }
    });

    return modal;
}

// Close modern popup
function closeModernPopup(modal) {
    modal.classList.remove('show');
    modal.classList.add('hiding');

    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 300);
}

// Add modern CSS for notifications and popups
const modernStyles = document.createElement('style');
modernStyles.textContent = `
    /* Modern Notifications */
    .modern-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        padding: 16px;
        max-width: 400px;
        z-index: 10000;
        transform: translateX(120%);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .modern-notification.show {
        transform: translateX(0);
    }
    
    .modern-notification.hiding {
        transform: translateX(120%);
        opacity: 0;
    }
    
    .modern-notification-success {
        border-left: 4px solid #10b981;
    }
    
    .modern-notification-error {
        border-left: 4px solid #ef4444;
    }
    
    .modern-notification-warning {
        border-left: 4px solid #f59e0b;
    }
    
    .modern-notification-info {
        border-left: 4px solid #3b82f6;
    }
    
    .notification-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .modern-notification-success .notification-icon {
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
    }
    
    .modern-notification-error .notification-icon {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
    }
    
    .modern-notification-warning .notification-icon {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
    }
    
    .modern-notification-info .notification-icon {
        color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
    }
    
    .notification-content {
        flex: 1;
        min-width: 0;
    }
    
    .notification-message {
        color: #1f2937;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
        margin-bottom: 8px;
    }
    
    .notification-progress {
        height: 3px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 2px;
        overflow: hidden;
    }
    
    .notification-progress::before {
        content: '';
        display: block;
        height: 100%;
        background: currentColor;
        animation: progress 5s linear;
    }
    
    .modern-notification-success .notification-progress::before {
        background: #10b981;
    }
    
    .modern-notification-error .notification-progress::before {
        background: #ef4444;
    }
    
    .modern-notification-warning .notification-progress::before {
        background: #f59e0b;
    }
    
    .modern-notification-info .notification-progress::before {
        background: #3b82f6;
    }
    
    .notification-close {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border: none;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 50%;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    
    .notification-close:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #374151;
        transform: scale(1.1);
    }
    
    @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
    }
    
    /* Modern Popup Modal */
    .modern-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        opacity: 0;
        transition: all 0.3s ease;
        padding: 20px;
    }
    
    .modern-popup-overlay.show {
        opacity: 1;
    }
    
    .modern-popup-overlay.hiding {
        opacity: 0;
    }
    
    .modern-popup {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        max-width: 450px;
        width: 100%;
        transform: scale(0.8) translateY(20px);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        border: 1px solid rgba(255, 255, 255, 0.2);
        overflow: hidden;
    }
    
    .modern-popup-overlay.show .modern-popup {
        transform: scale(1) translateY(0);
    }
    
    .modern-popup-overlay.hiding .modern-popup {
        transform: scale(0.8) translateY(20px);
    }
    
    .popup-header {
        padding: 24px 24px 16px;
        display: flex;
        align-items: center;
        gap: 16px;
        position: relative;
    }
    
    .popup-header.popup-success {
        background: linear-gradient(135deg, #10b981, #059669);
    }
    
    .popup-header.popup-error {
        background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    
    .popup-header.popup-warning {
        background: linear-gradient(135deg, #f59e0b, #d97706);
    }
    
    .popup-header.popup-info {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
    }
    
    .popup-icon {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
    }
    
    .popup-title {
        color: white;
        font-size: 20px;
        font-weight: 600;
        margin: 0;
        flex: 1;
    }
    
    .popup-close {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    
    .popup-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
    }
    
    .popup-body {
        padding: 20px 24px;
    }
    
    .popup-message {
        color: #374151;
        font-size: 16px;
        line-height: 1.6;
        margin: 0;
    }
    
    .popup-footer {
        padding: 16px 24px 24px;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }
    
    .popup-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 80px;
    }
    
    .popup-btn-cancel {
        background: #f3f4f6;
        color: #6b7280;
    }
    
    .popup-btn-cancel:hover {
        background: #e5e7eb;
        color: #374151;
    }
    
    .popup-btn-primary {
        color: white;
    }
    
    .popup-btn-success {
        background: linear-gradient(135deg, #10b981, #059669);
    }
    
    .popup-btn-error {
        background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    
    .popup-btn-warning {
        background: linear-gradient(135deg, #f59e0b, #d97706);
    }
    
    .popup-btn-info {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
    }
    
    .popup-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    /* Testimonial Cards */
    .testimonial-card {
        background: rgba(255, 255, 255, 0.05);
        padding: 2rem;
        border-radius: 15px;
        margin-bottom: 1rem;
        border: 1px solid rgba(0, 255, 255, 0.2);
        backdrop-filter: blur(10px);
    }
    
    .testimonial-text p {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
        color: #e0e0e0;
        font-style: italic;
    }
    
    .testimonial-author h4 {
        color: #00ffff;
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
    }
    
    .testimonial-author span {
        color: #b0b0b0;
        font-size: 0.9rem;
    }
    
    .testimonial-device {
        font-size: 0.8rem;
        color: #00ff00;
        margin-top: 0.5rem;
        opacity: 0.8;
    }
    
    .nav-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(0, 255, 255, 0.3);
        margin: 0 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .nav-dot:hover,
    .nav-dot.active {
        background: #00ffff;
        transform: scale(1.2);
    }
    
    .delete-testimonial {
        background: rgba(244, 67, 54, 0.2);
        border: 1px solid rgba(244, 67, 54, 0.5);
        color: #f44336;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .delete-testimonial:hover {
        background: rgba(244, 67, 54, 0.3);
        transform: scale(1.05);
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .modern-notification {
            right: 10px;
            left: 10px;
            max-width: none;
        }
        
        .modern-popup {
            margin: 20px;
            max-width: none;
        }
        
        .popup-footer {
            flex-direction: column;
        }
        
        .popup-btn {
            width: 100%;
        }
    }
`;

document.head.appendChild(modernStyles);

// Check if admin mode is active and show delete buttons
function checkAdminMode() {
    console.log('🔧 Checking admin mode...');
    const deleteButtons = document.querySelectorAll('.delete-testimonial');
    const isAdmin = localStorage.getItem('adminMode') === 'true';

    console.log('Admin mode from localStorage:', isAdmin);
    console.log('Delete buttons found:', deleteButtons.length);

    deleteButtons.forEach(button => {
        const shouldShow = isAdmin;
        button.style.display = shouldShow ? 'inline-block' : 'none';
        console.log(`Delete button ${button.textContent}: ${shouldShow ? 'SHOWN' : 'HIDDEN'}`);
    });
}

// Update admin mode in localStorage and check UI
function updateAdminMode(isAdmin) {
    console.log('🔧 Updating admin mode to:', isAdmin);
    localStorage.setItem('adminMode', isAdmin.toString());
    checkAdminMode();
}

// Call this when admin mode changes
window.updateAdminMode = updateAdminMode;
