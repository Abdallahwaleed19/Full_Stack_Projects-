// Add smooth scrolling to all links
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Content Loaded - Initializing functionality');

    // Debug check for content visibility
    const mainContent = document.querySelector('main');
    if (mainContent) {
        console.log('Main content found:', mainContent.innerHTML.length, 'characters');
    } else {
        console.log('Main content container not found');
    }

    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Auto-hide flash messages after 5 seconds
    const flashMessages = document.querySelectorAll('.alert');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.transition = 'opacity 0.5s ease';
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 500);
        }, 5000);
    });

    // Add loading animation to forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function () {
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
            }
        });
    });

    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Add confirmation for delete actions
    document.querySelectorAll('.delete-confirm').forEach(button => {
        button.addEventListener('click', function (e) {
            if (!confirm('Are you sure you want to delete this item?')) {
                e.preventDefault();
            }
        });
    });

    // Unified search functionality with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const debounce = (func, wait) => {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        };

        const performSearch = debounce(function (searchText) {
            console.log('Performing search for:', searchText);
            const items = document.querySelectorAll('.searchable-item');
            searchText = searchText.toLowerCase();

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                const isVisible = text.includes(searchText);
                item.style.display = isVisible ? '' : 'none';
                console.log('Item visibility:', item.textContent.substring(0, 20) + '...', isVisible);
            });
        }, 300);

        searchInput.addEventListener('input', function () {
            performSearch(this.value);
        });
    }

    // Add animation on scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    console.log('Found', animatedElements.length, 'animated elements');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                console.log('Animating element:', entry.target.tagName, entry.target.className);
            }
        });
    });

    animatedElements.forEach(element => observer.observe(element));

    // Form validation
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function (e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Password validation
    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength && hasUpperCase && hasLowerCase &&
            hasNumbers && hasSpecialChar;
    }

    document.querySelectorAll('input[type="password"]').forEach(input => {
        const feedback = document.createElement('div');
        feedback.className = 'password-feedback mt-2 small text-muted';
        input.parentNode.appendChild(feedback);

        input.addEventListener('input', function () {
            const isValid = validatePassword(this.value);
            feedback.innerHTML = isValid ? '✓ Password meets requirements' :
                'Password must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters';
            feedback.className = `password-feedback mt-2 small ${isValid ? 'text-success' : 'text-danger'}`;
        });
    });

    // Image preview functionality
    document.querySelectorAll('input[type="file"][accept*="image"]').forEach(input => {
        input.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                const preview = document.createElement('img');
                preview.className = 'img-preview mt-2 img-fluid';
                preview.style.maxHeight = '200px';

                this.parentNode.appendChild(preview);

                reader.onload = function (e) {
                    preview.src = e.target.result;
                };

                reader.readAsDataURL(file);
            }
        });
    });
}); 