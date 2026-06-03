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
        
        window.addEventListener('scroll', () => {
            const rect = scrollContainer.getBoundingClientRect();
            const scrollProgress = -rect.top;
            const scrollMax = rect.height - window.innerHeight;
            
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
    // Mapa Global Interativo
    const mapPins = document.querySelectorAll('.map-pin');
    const counterEl = document.getElementById('export-counter');
    const exportTextEl = document.getElementById('export-text');

    const countryData = {
        'Brasil': { text: 'comercializadas no Brasil.', target: 200 },
        'China': { text: 'exportadas para a China.', target: 200 },
        'Japão': { text: 'exportadas para o Japão.', target: 200 },
        'USA': { text: 'exportadas para os EUA.', target: 200 },
        'Coreia do Sul': { text: 'exportadas para a Coreia do Sul.', target: 200 },
        'Espanha': { text: 'exportadas para a Espanha.', target: 200 },
        'Argentina': { text: 'exportadas para a Argentina.', target: 200 },
        'Canadá': { text: 'exportadas para o Canadá.', target: 200 }
    };

    let animationId = null;

    function animateCounter(targetValue, duration = 1500) {
        if (animationId) cancelAnimationFrame(animationId);
        
        const startValue = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeProgress);
            
            counterEl.textContent = currentValue;

            if (progress < 1) {
                animationId = requestAnimationFrame(update);
            } else {
                counterEl.textContent = targetValue;
            }
        }

        animationId = requestAnimationFrame(update);
    }

    mapPins.forEach(pin => {
        pin.addEventListener('click', function() {
            // Remove active
            mapPins.forEach(p => p.classList.remove('active'));
            // Set active
            this.classList.add('active');

            const country = this.getAttribute('data-country');
            const data = countryData[country];

            if (data) {
                exportTextEl.textContent = data.text;
                animateCounter(data.target);
            }
        });
    });

    // Iniciar contagem para o primeiro carregamento
    if (mapPins.length > 0) {
        const activePin = document.querySelector('.map-pin.active');
        if (activePin) {
            const country = activePin.getAttribute('data-country');
            const data = countryData[country];
            if (data) animateCounter(data.target);
        }
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

            // Handle map data text translation when language changes
            if (lang === 'en') {
                countryData['Brasil'].text = 'traded in Brazil.';
                countryData['China'].text = 'exported to China.';
                countryData['Japão'].text = 'exported to Japan.';
                countryData['USA'].text = 'exported to USA.';
                countryData['Coreia do Sul'].text = 'exported to South Korea.';
                countryData['Espanha'].text = 'exported to Spain.';
                countryData['Argentina'].text = 'exported to Argentina.';
                countryData['Canadá'].text = 'exported to Canada.';
            } else {
                countryData['Brasil'].text = 'comercializadas no Brasil.';
                countryData['China'].text = 'exportadas para a China.';
                countryData['Japão'].text = 'exportadas para o Japão.';
                countryData['USA'].text = 'exportadas para os EUA.';
                countryData['Coreia do Sul'].text = 'exportadas para a Coreia do Sul.';
                countryData['Espanha'].text = 'exportadas para a Espanha.';
                countryData['Argentina'].text = 'exportadas para a Argentina.';
                countryData['Canadá'].text = 'exportadas para o Canadá.';
            }

            // Update currently selected map pin text
            const activePin = document.querySelector('.map-pin.active');
            if (activePin) {
                const country = activePin.getAttribute('data-country');
                if (countryData[country]) {
                    const exportTextEl = document.getElementById('export-text');
                    if (exportTextEl) exportTextEl.textContent = countryData[country].text;
                }
            }
        }
    }
});
