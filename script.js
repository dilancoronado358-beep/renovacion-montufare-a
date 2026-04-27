// =========================================
// CONFIGURACIÓN DE SUPABASE (PÚBLICO)
// =========================================
const _supabase = window.supabase ? window.supabase.createClient('https://agqrytictqmjzupqrnqp.supabase.co', 'sb_publishable_RuhFkhy2RrVwu4ZYbLZOGw_be0S_rDf') : null;

document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const contactForm = document.getElementById('contact-form');
    const counters = document.querySelectorAll('.count-val');
    const faqItems = document.querySelectorAll('.faq-item');

    // --- MOBILE MENU ---
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
            
            // Toggle body scroll for better UX
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
    }

    // --- MAIN SLIDER LOGIC ---
    const slides = document.querySelectorAll('.slide-rc');
    let currentSlide = 0;
    let slideInterval;

    const showSlide = (index) => {
        if (!slides.length) return;
        slides.forEach(slide => slide.classList.remove('active'));
        
        currentSlide = index;
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;
        
        slides[currentSlide].classList.add('active');
    };

    const nextSlide = () => showSlide(currentSlide + 1);

    const startSlider = () => {
        if (!slides.length) return;
        slideInterval = setInterval(nextSlide, 5000); // Cambia cada 5 segundos
    };

    if (slides.length > 0) {
        startSlider();
    }



    // --- COUNTDOWN TIMER (Día de la Victoria) ---
    const updateCountdown = () => {
        // Fecha oficial CNE Elecciones Seccionales Ecuador: 29 de noviembre de 2026
        const targetDate = new Date('2026-11-29T00:00:00').getTime(); 
        const now = new Date().getTime();

        const difference = targetDate - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            document.getElementById('days').innerText = days < 10 ? '0' + days : days;
            document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
            document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
            document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
        }
    };

    if (document.getElementById('countdown')) {
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    // --- FAQ ACCORDION ---
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close others
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- IMPACT COUNTER ANIMATION ---
    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const speed = target / 100;

                if (count < target) {
                    counter.innerText = Math.ceil(count + speed);
                    setTimeout(updateCount, 25);
                } else {
                    counter.innerText = target;
                }
            };

            const observer = new IntersectionObserver((entries) => {
                if(entries[0].isIntersecting) {
                    updateCount();
                    observer.disconnect();
                }
            }, { threshold: 0.5 });

            observer.observe(counter);
        });
    };

    if (counters.length > 0) {
        animateCounters();
    }

    // --- SMOOTH SCROLL ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }

            }
        });
    });

    // --- FORM EXPERIENCE ---
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'ENVIANDO PROPUESTA...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            setTimeout(() => {
                alert('¡GRACIAS! TU PROPUESTA HA SIDO RECIBIDA POR EL EQUIPO DEL DR. FABIÁN ROBLES. JUNTOS CONSTRUIREMOS EL MONTÚFAR QUE SOÑAMOS.');
                contactForm.reset();
                btn.innerText = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
            }, 2000);
        });
    }

    // --- NAVBAR SCROLL (Hide on scroll down, show on up) ---
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('main-nav');
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scrolling down
            nav.classList.add('nav-hidden');
        } else {
            // Scrolling up
            nav.classList.remove('nav-hidden');
        }
        
        // Padding adjustment
        if (scrollTop > 50) {
            nav.style.padding = '5px 0';
        } else {
            nav.style.padding = '10px 0';
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });


    // --- PROPOSALS 2.0: SEARCH & FILTER ---
    let proposalsData = []; // Se cargará dinámicamente
    
    const proposalsContainer = document.getElementById('proposals-container');
    const searchInput = document.getElementById('proposal-search');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const renderProposals = (filter = 'all', searchTerm = '') => {
        if (!proposalsContainer) return;
        
        proposalsContainer.innerHTML = '';
        
        const filtered = proposalsData.filter(p => {
            const matchesFilter = filter === 'all' || p.category === filter;
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 p.desc_text.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'prop-card-rc';
            card.setAttribute('data-aos', 'fade-up');
            card.innerHTML = `
                <span class="prop-badge bg-${p.category}">${p.category}</span>
                <h4>${p.title}</h4>
                <p>${p.desc_text}</p>
            `;
            proposalsContainer.appendChild(card);
        });
    };

    // Cargar propuestas desde Supabase
    const fetchProposals = async () => {
        if (!_supabase || !proposalsContainer) return;
        
        const { data, error } = await _supabase
            .from('propuestas')
            .select('*')
            .eq('is_active', true); // Solo cargar las que estén activas
            
        if (data) {
            proposalsData = data;
            renderProposals(); // Renderizar una vez cargados los datos
        }
    };

    // Listeners for Search & Filter
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const currentFilter = document.querySelector('.filter-btn.active').dataset.category;
            renderProposals(currentFilter, e.target.value);
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProposals(btn.dataset.category, searchInput.value);
        });
    });

    // Ejecutar fetch al inicio
    fetchProposals();


    // --- TERRITORIAL MAP INITIALIZATION ---
    const mapElement = document.getElementById('map-montufar');
    if (mapElement) {
        const map = L.map('map-montufar', {
            scrollWheelZoom: false,
            dragging: !L.Browser.mobile, // Disable dragging with one finger on mobile
            tap: !L.Browser.mobile
        }).setView([0.597, -77.830], 11);


        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#E21921; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);'></div>",
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const locations = [
            { pos: [0.592, -77.831], title: 'SAN GABRIEL', text: 'Compromiso: Recuperación total del Casco Colonial y Seguridad Comercial.' },
            { pos: [0.612, -77.745], title: 'CRISTÓBAL COLÓN', text: 'Compromiso: Fortalecimiento de la tecnificación del cultivo de papa.' },
            { pos: [0.505, -77.865], title: 'LA PAZ', text: 'Compromiso: Potencialización turística de la Gruta y vialidad rural.' },
            { pos: [0.635, -77.880], title: 'PIARTAL', text: 'Compromiso: Sistema de riego comunitario y apoyo al sector lechero.' },
            { pos: [0.665, -77.820], title: 'FERNÁNDEZ SALVADOR', text: 'Compromiso: Atención médica móvil y maquinaria permanente para el campo.' },
            { pos: [0.575, -77.885], title: 'CHITÁN DE NAVARRETE', text: 'Compromiso: Infraestructura deportiva y fomento al emprendimiento juvenil.' }
        ];


        locations.forEach(loc => {
            L.marker(loc.pos, { icon: customIcon }).addTo(map)
                .bindPopup(`
                    <div class="map-popup-header">${loc.title}</div>
                    <div class="map-popup-text">${loc.text}</div>
                `);
        });
    }

        // --- ATTENTION MODAL & STICKY CTA ---
        const modal = document.getElementById('attention-modal');
        const modalClose = document.getElementById('modal-close');
        const sticky = document.getElementById('sticky-cta');
        const stickyClose = document.getElementById('sticky-close');
        const shareBtn = document.getElementById('share-btn');

        const showModalOnce = () => {
            if (!modal) return;
            try {
                const shown = localStorage.getItem('modal_shown_v1');
                if (!shown) {
                    setTimeout(() => {
                        modal.setAttribute('aria-hidden', 'false');
                        modal.classList.add('active');
                    }, 900);
                    localStorage.setItem('modal_shown_v1', '1');
                }
            } catch (e) { /* ignore storage errors */ }
        };

        if (modal && modalClose) {
            modalClose.addEventListener('click', () => {
                modal.setAttribute('aria-hidden', 'true');
                modal.classList.remove('active');
            });
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.setAttribute('aria-hidden', 'true');
                    modal.classList.remove('active');
                }
            });
            showModalOnce();
        }

        if (sticky && stickyClose) {
            stickyClose.addEventListener('click', () => {
                sticky.style.display = 'none';
                try { localStorage.setItem('sticky_closed_v1', '1'); } catch (e) {}
            });
            if (localStorage.getItem('sticky_closed_v1')) {
                sticky.style.display = 'none';
            }
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                const shareData = { title: document.title, text: 'Apoya a Fabián Robles en Montúfar', url: location.href };
                if (navigator.share) {
                    try { await navigator.share(shareData); } catch (e) { /* canceled */ }
                } else if (navigator.clipboard) {
                    try {
                        await navigator.clipboard.writeText(location.href);
                        alert('Enlace copiado. ¡Compártelo con tus contactos!');
                    } catch (e) {
                        // fallback alert
                        alert('Copia este enlace y compártelo: ' + location.href);
                    }
                } else {
                    alert('Comparte esta URL: ' + location.href);
                }
            });
        }

    });
