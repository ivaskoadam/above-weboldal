document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleMenu() {
        mobileBtn.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }

    if (mobileBtn) {
        mobileBtn.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for Fade-in Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in class to elements we want to animate
    const animatedElements = document.querySelectorAll('.project-card, .about-text, .section-header, .timeline-item, .hero-text, .team-member');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        // Stagger delay for lists
        if (el.classList.contains('timeline-item') || el.classList.contains('team-member')) {
            el.style.transitionDelay = `${index % 3 * 0.1}s`;
        }
        observer.observe(el);
    });

    // Add CSS class for the animation
    const style = document.createElement('style');
    style.innerHTML = `
        .fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        body.no-scroll {
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
});

// Modal Functions
function openModal(projectId) {
    const modal = document.getElementById('project-modal');
    const dataContainer = document.getElementById(`${projectId}-data`);

    if (!dataContainer) return;

    // Get data
    const title = dataContainer.querySelector('[data-title]').textContent;
    const date = dataContainer.querySelector('[data-date]').textContent;
    const location = dataContainer.querySelector('[data-location]').textContent;
    const flag = dataContainer.querySelector('[data-flag]').textContent;
    const imageSrc = dataContainer.querySelector('[data-image]').textContent;
    const description = dataContainer.querySelector('[data-description]').innerHTML;

    // Populate Modal
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-date').textContent = date;
    document.getElementById('modal-location').textContent = location;
    document.getElementById('modal-flag').textContent = flag;
    document.getElementById('modal-image').src = imageSrc;
    document.getElementById('modal-description').innerHTML = description;

    // Show Modal
    modal.classList.add('show');
    document.body.classList.add('no-scroll');
}

function closeModal(event) {
    // Close if clicking overlay or close button
    if (event.target.classList.contains('modal') ||
        event.target.classList.contains('close-modal') ||
        event.target.closest('.close-modal')) {

        const modal = document.getElementById('project-modal');
        modal.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('project-modal');
        if (modal.classList.contains('show')) {
            modal.classList.remove('show');
            document.body.classList.remove('no-scroll');
        }
    }
});
