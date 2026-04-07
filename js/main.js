document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
        // Hero Transitions
        const heroTl = gsap.timeline();
        heroTl.from('.hero-text h1', {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        })
            .from('.hero-text p', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.6')
            .from('.lead-form-container', {
                x: 40,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            }, '-=0.8');

        // Scroll Reveal Staggers
        gsap.utils.toArray('.reveal-section').forEach(section => {
            gsap.from(section.querySelectorAll('.reveal-item'), {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out'
            });
        });
    });

    // 2. Navigation Logic
    const navbar = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const navRight = document.querySelector('.nav-right');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navRight.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Services Dropdown (Desktop hover is handled by CSS, but we can add robust click for mobile)
    const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
    const dropdownMenu = document.querySelector('.nav-dropdown-menu');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            if (window.innerWidth < 1024) {
                e.preventDefault();
                dropdownMenu.classList.toggle('active');
            }
        });
    }

    // 3. Lead Form Submission
    const leadForm = document.getElementById('cinema-lead-form');
    const successOverlay = document.getElementById('success-overlay');
    const successMessageText = document.getElementById('success-message-text');

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = leadForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Processing...';
            submitBtn.disabled = true;

            const formData = new FormData(leadForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/.netlify/functions/submit-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    // Show success state
                    successMessageText.innerText = result.message;
                    successOverlay.classList.add('active');
                    leadForm.reset();
                } else {
                    alert('Something went wrong. Please try again.');
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('Connection error. Please check your internet or try again later.');
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Close Success Overlay
    const closeSuccess = document.getElementById('close-success');
    if (closeSuccess) {
        closeSuccess.addEventListener('click', () => {
            successOverlay.classList.remove('active');
        });
    }
});
