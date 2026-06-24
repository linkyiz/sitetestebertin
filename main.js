document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animatiom
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -150px 0px" // Trigger slightly later so animations are more visible
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // Video Scroll Logic
    const video = document.getElementById('hero-video');
    const scrollContainer = document.getElementById('hero-scroll-container');
    
    if (video && scrollContainer) {
        let targetTime = 0;
        let currentTime = 0;
        const ease = 0.08; // Quanto menor o valor, mais "longa/suave" a transição
        
        // Em dispositivos móveis, o vídeo simplesmente toca normalmente
        if (window.innerWidth <= 768) {
            video.loop = true;
            video.play().catch(e => console.log('Autoplay prevent:', e));
        } else {
            window.addEventListener('scroll', () => {
                const rect = scrollContainer.getBoundingClientRect();
                const scrollProgress = -rect.top;
                const scrollMax = Math.max(1, rect.height - window.innerHeight); // Evita divisão por zero
                
                if (scrollProgress >= 0 && scrollProgress <= scrollMax) {
                    let progressRatio = scrollProgress / scrollMax;
                    if (video.duration) {
                        targetTime = video.duration * progressRatio;
                    }
                } else if (scrollProgress < 0) {
                    targetTime = 0;
                } else if (scrollProgress > scrollMax && video.duration) {
                    targetTime = video.duration;
                }
            });


        function renderLoop() {
            if (video.duration) {
                // Interpolação suave (Lerp) para alcançar o tempo alvo
                currentTime += (targetTime - currentTime) * ease;
                
                // Evita atualizações infinitesimais
                if (Math.abs(targetTime - currentTime) > 0.001) {
                    video.currentTime = currentTime;
                }
            }
            requestAnimationFrame(renderLoop);
        }
        
        renderLoop();
        } // fecha o else
    }

    // Smooth Scroll para a Nav
    const links = document.querySelectorAll('.nav-links a, .hero-actions a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if(targetId.startsWith('#')) {
                e.preventDefault();
                const targetEl = document.querySelector(targetId);
                if(targetEl) {
                    const offset = 80;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = targetEl.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    // Global Stats Animation
    const statsPanel = document.querySelector('.global-stats-panel');
    const counterKg = document.getElementById('export-counter-kg');
    const counterPercent = document.getElementById('export-counter-percent');
    let statsAnimated = false;

    function animateCounter(el, targetValue, duration = 1500) {
        const startValue = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeProgress);
            
            if (el) el.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                if (el) el.textContent = targetValue;
            }
        }

        requestAnimationFrame(update);
    }

    if (statsPanel && counterKg && counterPercent) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !statsAnimated) {
                statsAnimated = true;
                setTimeout(() => animateCounter(counterKg, 20), 200);
                setTimeout(() => animateCounter(counterPercent, 12), 400);
            }
        }, { threshold: 0.5 });

        statsObserver.observe(statsPanel);
    }

    // Gallery Card Interaction
    const galleryCards = document.querySelectorAll('.gallery-card');
    const hoverTimers = new Map();

    galleryCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Remove from any previous state
            card.classList.remove('is-expanded');
            
            // Start loading state
            card.classList.add('is-loading');
            
            // Wait 0.75s to expand
            const timer = setTimeout(() => {
                card.classList.remove('is-loading');
                card.classList.add('is-expanded');
            }, 750);
            
            hoverTimers.set(card, timer);
        });

        card.addEventListener('mouseleave', () => {
            // Cancel timer if mouse leaves early
            if (hoverTimers.has(card)) {
                clearTimeout(hoverTimers.get(card));
            }
            // Revert state
            card.classList.remove('is-loading');
            card.classList.remove('is-expanded');
        });
    });

    // Language Switcher Logic
    const langSwitcher = document.getElementById('lang-switcher');
    
    if (langSwitcher && window.siteTranslations) {
        // Load preference
        const savedLang = localStorage.getItem('site_lang') || 'pt';
        langSwitcher.value = savedLang;
        updateLanguage(savedLang);

        langSwitcher.addEventListener('change', (e) => {
            const newLang = e.target.value;
            localStorage.setItem('site_lang', newLang);
            updateLanguage(newLang);
        });

        function updateLanguage(lang) {
            const dictionary = window.siteTranslations[lang];
            if (!dictionary) return;

            // Update text/html elements
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (dictionary[key]) {
                    // Use innerHTML because some keys contain <br> or <span> tags
                    el.innerHTML = dictionary[key];
                }
            });

            // Update placeholders
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (dictionary[key]) {
                    el.setAttribute('placeholder', dictionary[key]);
                }
            });

            // Map translation logic removed
        }
    }
});
