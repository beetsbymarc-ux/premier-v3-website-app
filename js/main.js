/**
 * Premier Realty — Cinematic Motion System
 * Powered by GSAP & ScrollTrigger
 */

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    initNavigation();
    initHeroAnimations();
    initScrollAnimations();
    initFormHandling();
});

/**
 * Navigation Scroll Logic
 */
function initNavigation() {
    const nav = document.querySelector('nav');
    
    ScrollTrigger.create({
        start: 'top -80',
        onUpdate: (self) => {
            if (self.direction === 1) {
                nav.classList.add('scrolled');
            } else if (self.scroll() < 80) {
                nav.classList.remove('scrolled');
            }
        }
    });

    // Scroll Progress Bar
    gsap.to(".scroll-progress", {
        width: "100%",
        ease: "none",
        scrollTrigger: { 
            scrub: 0.3,
            start: "top top",
            end: "bottom bottom"
        }
    });
}

/**
 * Hero Cinematic Entrance
 */
function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.2 }});

    tl.to(".hero-video", {
        scale: 1,
        duration: 2.5,
        ease: "power2.out"
    })
    .from(".hero .eyebrow", {
        y: 20,
        opacity: 0
    }, "-=1.5")
    .from(".hero h1", {
        y: 40,
        opacity: 0,
        stagger: 0.1
    }, "-=1.2")
    .from(".hero p", {
        opacity: 0
    }, "-=0.8")
    .from(".floating-form-trigger", {
        y: 20,
        opacity: 0
    }, "-=0.5");

    // Subtle Video Parallax
    gsap.to(".hero-video", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });
}

/**
 * Scroll Reveal System
 */
function initScrollAnimations() {
    const revealItems = document.querySelectorAll('.reveal-item');

    revealItems.forEach(item => {
        gsap.to(item, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: item,
                start: "top 90%",
                toggleActions: "play none none none"
            }
        });
    });
}

/**
 * Intelligent Lead Capture Logic
 */
function initFormHandling() {
    const form = document.getElementById('cinema-lead-form');
    const overlay = document.getElementById('success-overlay');
    const messageText = document.getElementById('success-message-text');
    const closeBtn = document.getElementById('close-success');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // UI Feedback - Processing
        const submitBtn = form.querySelector('button');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "Processing Protocol...";
        submitBtn.disabled = true;

        try {
            // Netlify Function call
            const response = await fetch('/.netlify/functions/submit-lead', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            // Display Success Overlay
            messageText.innerHTML = result.message;
            overlay.classList.add('active');
            
            // GSAP Reveal for Overlay Success
            gsap.from(".success-card", {
                scale: 0.9,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });

        } catch (error) {
            console.error('Submission protocol failure:', error);
            // Fallback for demo purposes if functions aren't live
            messageText.innerHTML = "Your request has been broadcast to our internal Sacramento network. A growth consultant will contact you shortly.";
            overlay.classList.add('active');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        form.reset();
    });
}
