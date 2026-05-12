// =========================================
// CONFIGURACIÓN DE SUPABASE (PÚBLICO)
// =========================================
const _supabase = window.supabase ? window.supabase.createClient('https://agqrytictqmjzupqrnqp.supabase.co', 'sb_publishable_RuhFkhy2RrVwu4ZYbLZOGw_be0S_rDf') : null;

// ---- Aplicar contenido dinámico desde Supabase (site_config) ----
async function applyDynamicContent(){
    if(!_supabase) return;
    try {
        const {data} = await _supabase.from('site_config').select('key,value');
        if(!data) return;
        const cfg = {};
        data.forEach(row => { try{ cfg[row.key]=JSON.parse(row.value); }catch(e){} });

        // Hero text
        if(cfg.hero_text){
            const t = cfg.hero_text;
            const heroTitle = document.querySelector('.hero-title');
            if(heroTitle && t.titulo1 && t.nombre && t.titulo2){
                heroTitle.innerHTML = `${t.titulo1} <br><span class="text-green">${t.nombre}</span> <br>${t.titulo2}`;
            }
            const heroSub = document.querySelector('.hero-subtext');
            if(heroSub && t.sub) heroSub.textContent = t.sub;
        }

        // Hero images
        if(cfg.hero_imgs){
            const hi = cfg.hero_imgs;
            const imgs = document.querySelectorAll('.hero-img-dominant');
            if(imgs[0] && hi.img1) imgs[0].src = hi.img1;
            if(imgs[1] && hi.img2) imgs[1].src = hi.img2;
            const heroSec = document.getElementById('presentacion');
            if(heroSec && hi.bg){
                heroSec.style.background = `linear-gradient(135deg, rgba(11,22,44,0.85) 0%, rgba(21,41,78,0.85) 100%), url('${hi.bg}') center/cover no-repeat`;
            }
        }

        // Slider images — soporta hasta 100 imágenes
        if(cfg.slider_imgs){
            const sl = cfg.slider_imgs;
            const urls = Array.isArray(sl.urls) ? sl.urls
                : [sl.s1, sl.s2, sl.s3].filter(u => u && u.trim());

            if(urls.length > 0){
                const wrapper = document.getElementById('slider-wrapper');
                const dotsEl  = document.getElementById('slider-dots');
                if(wrapper){
                    wrapper.innerHTML = '';
                    if(dotsEl) dotsEl.innerHTML = '';
                    urls.forEach((url, i) => {
                        const div = document.createElement('div');
                        div.className = 'slide-rc' + (i===0 ? ' active' : '');
                        div.innerHTML = `<img src="${url}" alt="Imagen ${i+1}">`;
                        wrapper.appendChild(div);
                        if(dotsEl){
                            const dot = document.createElement('span');
                            dot.className = 'dot' + (i===0 ? ' active' : '');
                            dot.dataset.slide = String(i);
                            dotsEl.appendChild(dot);
                        }
                    });
                    // Re-inicializar el slider con los nuevos elementos
                    if(typeof reinitSlider === 'function') reinitSlider();
                }
            }
        }

        // Contact / social links
        if(cfg.contacto){
            const ct = cfg.contacto;
            if(ct.wa){
                document.querySelectorAll('a[href*="wa.me"]').forEach(a=>{
                    a.href=`https://wa.me/${ct.wa}?text=Quiero%20formar%20parte%20de%20su%20equipo`;
                });
            }
            if(ct.fb) document.querySelectorAll('a[href*="facebook.com"]').forEach(a=>a.href=ct.fb);
            if(ct.tt) document.querySelectorAll('a[href*="tiktok.com"]').forEach(a=>a.href=ct.tt);
        }

        // Theme Colors
        if(cfg.theme) {
            if(cfg.theme.navy) document.documentElement.style.setProperty('--navy', cfg.theme.navy);
            if(cfg.theme.cyan) document.documentElement.style.setProperty('--cyan-action', cfg.theme.cyan);
        }

        // SEO
        if(cfg.seo) {
            if(cfg.seo.title) document.title = cfg.seo.title;
            if(cfg.seo.desc) {
                let metaDesc = document.querySelector('meta[name="description"]');
                if(!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name="description"; document.head.appendChild(metaDesc); }
                metaDesc.content = cfg.seo.desc;
            }
        }

    } catch(e){ console.warn('Dynamic content error:', e); }
}

document.addEventListener('DOMContentLoaded', () => {
    applyDynamicContent();

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
    let slideInterval;
    let currentSlide = 0;

    window.reinitSlider = function(){
        clearInterval(slideInterval);
        currentSlide = 0;
        const slides = Array.from(document.querySelectorAll('.slide-rc'));
        const dots   = Array.from(document.querySelectorAll('.dot'));
        if(!slides.length) return;

        // Asegurar que el primero esté activo
        slides.forEach((s,i) => s.classList.toggle('active', i===0));
        dots.forEach((d,i)   => d.classList.toggle('active', i===0));

        const showSlide = (index) => {
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d   => d.classList.remove('active'));
            currentSlide = ((index % slides.length) + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            if(dots[currentSlide]) dots[currentSlide].classList.add('active');
        };

        dots.forEach(dot => {
            // Remove old listeners by cloning
            const newDot = dot.cloneNode(true);
            dot.parentNode.replaceChild(newDot, dot);
            newDot.addEventListener('click', e => {
                showSlide(parseInt(e.target.dataset.slide));
                clearInterval(slideInterval);
                slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
            });
        });

        slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
    };

    window.reinitSlider();



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
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            const nombre = document.getElementById('contact-name').value.trim();
            const telefono = document.getElementById('contact-phone').value.trim();
            const mensaje = document.getElementById('contact-msg').value.trim();

            if (!nombre || !mensaje) {
                alert('Por favor, completa tu nombre y mensaje.');
                return;
            }

            btn.innerText = 'ENVIANDO PROPUESTA...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            if (_supabase) {
                const { error } = await _supabase.from('mensajes').insert([{ nombre, telefono, mensaje }]);
                if (error) {
                    alert('Hubo un error enviando tu mensaje: ' + error.message);
                    btn.innerText = originalText;
                    btn.style.opacity = '1';
                    btn.disabled = false;
                    return;
                }
            }

            setTimeout(() => {
                alert('¡GRACIAS! TU PROPUESTA HA SIDO RECIBIDA POR EL EQUIPO DEL DR. FABIÁN ROBLES. JUNTOS CONSTRUIREMOS EL MONTÚFAR QUE SOÑAMOS.');
                contactForm.reset();
                btn.innerText = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
            }, 500);
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
                <div class="prop-desc-content" style="color:var(--text-gray); font-size:0.95rem; line-height:1.6; margin-bottom:15px">${p.desc_text}</div>
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

        // Load dynamic map points from Supabase
        const loadMapPoints = async () => {
            let mapData = [];
            if (_supabase) {
                const { data } = await _supabase.from('mapa_puntos').select('*');
                if (data && data.length > 0) mapData = data;
            }
            
            // Fallback si no hay conexión o no hay datos
            if(mapData.length === 0) {
                mapData = [
                    { lat: 0.592, lng: -77.831, titulo: 'SAN GABRIEL', texto: 'Compromiso: Recuperación total del Casco Colonial y Seguridad Comercial.' },
                    { lat: 0.612, lng: -77.745, titulo: 'CRISTÓBAL COLÓN', texto: 'Compromiso: Fortalecimiento de la tecnificación del cultivo de papa.' },
                    { lat: 0.505, lng: -77.865, titulo: 'LA PAZ', texto: 'Compromiso: Potencialización turística de la Gruta y vialidad rural.' },
                    { lat: 0.635, lng: -77.880, titulo: 'PIARTAL', texto: 'Compromiso: Sistema de riego comunitario y apoyo al sector lechero.' },
                    { lat: 0.665, lng: -77.820, titulo: 'FERNÁNDEZ SALVADOR', texto: 'Compromiso: Atención médica móvil y maquinaria permanente para el campo.' },
                    { lat: 0.575, lng: -77.885, titulo: 'CHITÁN DE NAVARRETE', texto: 'Compromiso: Infraestructura deportiva y fomento al emprendimiento juvenil.' }
                ];
            }

            mapData.forEach(loc => {
                L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map)
                    .bindPopup(`
                        <div class="map-popup-header">${loc.titulo}</div>
                        <div class="map-popup-text">${loc.texto}</div>
                    `);
            });
        };

        loadMapPoints();
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
