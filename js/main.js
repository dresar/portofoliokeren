document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- 1. Initial Setup & Variables ---
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const headerEl = document.getElementById('site-header');
    const backToTopBtn = document.getElementById('back-to-top');
    const preloaderEl = document.querySelector('.preloader');

    // --- 2. Preloader ---
    function initPreloader() {
        // Simulate loading time (replace with actual asset loading checks if needed)
        const minLoadTime = 1500; // Minimum time preloader is visible (in ms)
        const startTime = Date.now();

        window.addEventListener('load', () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadTime - elapsedTime);

            setTimeout(() => {
                if (preloaderEl) {
                    preloaderEl.style.opacity = '0';
                    preloaderEl.style.visibility = 'hidden';
                    preloaderEl.addEventListener('transitionend', () => {
                        preloaderEl.remove();
                    });
                }
                bodyEl.classList.remove('preload'); // Allow animations now
            }, remainingTime);
        });

        // Fallback if window.load doesn't fire quickly
        setTimeout(() => {
            if (preloaderEl && !bodyEl.classList.contains('loaded')) { // Check if still preloading
                if (preloaderEl) {
                    preloaderEl.style.opacity = '0';
                    preloaderEl.style.visibility = 'hidden';
                    preloaderEl.addEventListener('transitionend', () => {
                        preloaderEl.remove();
                    });
                }
                bodyEl.classList.remove('preload');
                console.warn("Preloader fallback triggered.");
            }
        }, 5000); // Max wait 5 seconds

    }

    // --- 3. Theme Switcher ---
    function initThemeSwitcher() {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme') || htmlEl.dataset.theme || 'dark'; // Default ke dark jika tidak ada

        function applyTheme(theme) {
            htmlEl.dataset.theme = theme;
            localStorage.setItem('theme', theme);
            // Update theme-color meta tag (optional, but good practice)
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (themeColorMeta) {
                themeColorMeta.content = (theme === 'light') ? '#ffffff' : '#1a202c';
            }
            if (themeToggleBtn) {
                themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Ubah ke mode terang' : 'Ubah ke mode gelap');
            }
        }

        applyTheme(currentTheme); // Terapkan tema awal

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const newTheme = htmlEl.dataset.theme === 'dark' ? 'light' : 'dark';
                applyTheme(newTheme);
            });
        }
    }

    // --- 4. Language Switcher ---
    function initLanguageSwitcher() {
        const langToggleBtn = document.getElementById('language-toggle');
        const langOptionsContainer = document.getElementById('language-options');
        const currentLangSpan = document.querySelector('.current-lang'); // Span untuk menampilkan bahasa aktif
        const defaultLang = 'id'; // Bahasa default
        let currentLang = localStorage.getItem('language') || htmlEl.dataset.lang || defaultLang;

        // Objek data bahasa global (diasumsikan sudah ada dari id.js dan en.js)
        // Contoh: const langData = { id: {...}, en: {...} };

        function updateTexts(lang) {
            if (!window.langData || !window.langData[lang]) {
                console.error(`Language data for "${lang}" not found.`);
                return;
            }

            const elementsToUpdate = document.querySelectorAll('[data-lang-key]');
            const data = window.langData[lang];

            elementsToUpdate.forEach(el => {
                const key = el.dataset.langKey;
                const text = key.split('.').reduce((o, i) => (o ? o[i] : null), data); // Handle nested keys like 'hero.title'

                if (text !== null && text !== undefined) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        if (el.placeholder !== undefined) el.placeholder = text;
                    } else if (el.tagName === 'META') {
                        if (el.name === 'description' || el.name === 'keywords') el.content = text;
                    } else if (el.tagName === 'TITLE') {
                        document.title = text; // Update document title
                    }
                    else if (el.hasAttribute('aria-label')) {
                        el.setAttribute('aria-label', text);
                    } else if (el.hasAttribute('data-tooltip')) {
                        el.setAttribute('data-tooltip', text);
                    }
                    else {
                        // Untuk elemen lain, coba ganti textContent
                        // Cek jika ada elemen anak spesifik seperti span di dalam tombol
                        const textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
                        if (textNode) {
                            textNode.textContent = text;
                        } else if (el.querySelector('span:not([class])')) { // Target span tanpa class di dalam tombol/link
                            el.querySelector('span:not([class])').textContent = text;
                        }
                        else {
                            el.textContent = text; // Fallback
                        }
                    }
                } else {
                    console.warn(`Translation key "${key}" not found for language "${lang}".`);
                }
            });

            htmlEl.lang = lang;
            htmlEl.dataset.lang = lang;
            if (currentLangSpan) {
                currentLangSpan.textContent = lang.toUpperCase();
            }
            // Update role ticker jika ada
            if (typeof initRoleTicker === 'function') {
                initRoleTicker(); // Re-initialize ticker with new language roles
            }
            // Update Portfolio Modal data (jika perlu dan modal terbuka)
            // Update FAQ data (jika perlu)
        }

        function setLanguage(lang) {
            currentLang = lang;
            updateTexts(lang);
            localStorage.setItem('language', lang);
            if (langOptionsContainer) langOptionsContainer.parentElement.classList.remove('open'); // Tutup dropdown
            console.log(`Language changed to: ${lang}`);
        }

        // Toggle Dropdown
        if (langToggleBtn && langOptionsContainer) {
            langToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Hindari penutupan langsung oleh listener window
                langOptionsContainer.parentElement.classList.toggle('open');
            });

            // Tambahkan listener ke opsi bahasa
            const langButtons = langOptionsContainer.querySelectorAll('button[data-lang-set]');
            langButtons.forEach(button => {
                button.addEventListener('click', () => {
                    setLanguage(button.dataset.langSet);
                });
            });

            // Tutup dropdown jika klik di luar
            window.addEventListener('click', (e) => {
                if (!langToggleBtn.contains(e.target) && !langOptionsContainer.contains(e.target)) {
                    langOptionsContainer.parentElement.classList.remove('open');
                }
            });
        }

        // Muat teks awal
        updateTexts(currentLang);
    }

    // --- 5. Mobile Navigation ---
    function initMobileNav() {
        const menuTrigger = document.getElementById('mobile-menu-trigger');
        const mobileNavContainer = document.getElementById('mobile-nav');

        if (menuTrigger && mobileNavContainer) {
            menuTrigger.addEventListener('click', () => {
                bodyEl.classList.toggle('mobile-nav-active');
                menuTrigger.setAttribute('aria-label', bodyEl.classList.contains('mobile-nav-active') ? 'Tutup menu navigasi' : 'Buka menu navigasi');
            });

            // Tutup menu saat link di klik
            const mobileNavLinks = mobileNavContainer.querySelectorAll('.mobile-nav-link');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    bodyEl.classList.remove('mobile-nav-active');
                    menuTrigger.setAttribute('aria-label', 'Buka menu navigasi');
                });
            });

            // Tutup menu saat klik di luar (jika diperlukan backdrop)
            // const backdrop = document.querySelector('.mobile-menu-backdrop'); // Jika ada backdrop
            // if(backdrop) {
            //     backdrop.addEventListener('click', () => {
            //         bodyEl.classList.remove('mobile-nav-active');
            //     });
            // }
        }
    }

    // --- 6. Sticky Header ---
    function initStickyHeader() {
        let lastScrollTop = 0;
        const scrollThreshold = 50; // Jarak scroll sebelum header sticky

        window.addEventListener('scroll', () => {
            if (!headerEl) return;
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > scrollThreshold) {
                headerEl.classList.add('scrolled');
            } else {
                headerEl.classList.remove('scrolled');
            }

            // Optional: Sembunyikan header saat scroll ke bawah, tampilkan saat scroll ke atas
            // if (scrollTop > lastScrollTop && scrollTop > headerEl.offsetHeight){
            //     // Scroll Down
            //     headerEl.style.top = `-${headerEl.offsetHeight}px`;
            // } else {
            //     // Scroll Up
            //     headerEl.style.top = "0";
            // }
            // lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling

        }, { passive: true }); // Optimasi performa scroll listener
    }

    // --- 7. Smooth Scrolling & Nav Active State ---
    function initSmoothScroll() {
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .scroll-down-indicator');
        const headerHeight = headerEl ? headerEl.offsetHeight : 70; // Ambil tinggi header atau default

        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#') && href.length > 1) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        // Hitung offset dengan mempertimbangkan tinggi header saat itu
                        const headerOffset = headerEl && headerEl.classList.contains('scrolled') ? headerEl.offsetHeight : var(--header - height); // Gunakan tinggi dinamis jika header mengecil
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 10; // Tambahkan sedikit padding

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });

                        // Tutup mobile nav jika link mobile di klik
                        if (this.classList.contains('mobile-nav-link')) {
                            bodyEl.classList.remove('mobile-nav-active');
                            document.getElementById('mobile-menu-trigger')?.setAttribute('aria-label', 'Buka menu navigasi');
                        }
                    }
                }
            });
        });

        // Update Active Nav Link on Scroll
        const sections = document.querySelectorAll('.section');
        const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-link');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav .mobile-nav-link');

        window.addEventListener('scroll', () => {
            let currentSectionId = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                // Kurangi tinggi header + sedikit offset agar aktif lebih awal
                const triggerPoint = sectionTop - (headerEl ? headerEl.offsetHeight : 70) - 50;

                if (window.pageYOffset >= triggerPoint) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            const updateActiveLink = (links) => {
                links.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                });
            };

            updateActiveLink(desktopNavLinks);
            updateActiveLink(mobileNavLinks);

        }, { passive: true });
    }

    // --- 8. Scroll Animations (Intersection Observer) ---
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, observerInstance) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.dataset.delay || '0';
                        entry.target.style.transitionDelay = `${delay}s`;
                        entry.target.classList.add('animated');

                        // Animate progress bars within skill items when they become visible
                        if (entry.target.classList.contains('skill-item') || entry.target.closest('.skill-item')) {
                            const skillItem = entry.target.classList.contains('skill-item') ? entry.target : entry.target.closest('.skill-item');
                            const progressBarSpan = skillItem.querySelector('.skill-progress-bar span');
                            const skillLevelDiv = skillItem.querySelector('.skill-level');
                            if (progressBarSpan && skillLevelDiv && skillLevelDiv.dataset.level) {
                                // Use a CSS variable to set width, easier to manage transitions
                                progressBarSpan.style.setProperty('--progress-width', `${skillLevelDiv.dataset.level}%`);
                            }
                        }

                        observerInstance.unobserve(entry.target); // Hentikan observasi setelah animasi
                    }
                });
            }, {
                threshold: 0.1 // Muncul saat 10% elemen terlihat
            });

            animatedElements.forEach(el => {
                observer.observe(el);
            });
        } else {
            // Fallback for older browsers (optional: just show elements)
            animatedElements.forEach(el => el.classList.add('animated'));
            console.warn("IntersectionObserver not supported. Animations triggered immediately.");
        }
    }

    // --- 9. Back to Top Button ---
    function initBackToTop() {
        if (!backToTopBtn) return;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) { // Tampilkan setelah scroll 300px
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 10. Custom Cursor ---
    function initCustomCursor() {
        const cursorOuter = document.querySelector('.custom-cursor-outer');
        const cursorInner = document.querySelector('.custom-cursor-inner');

        // Sembunyikan jika tidak support hover (touch devices)
        if (window.matchMedia("(hover: none)").matches) {
            if (cursorOuter) cursorOuter.style.display = 'none';
            if (cursorInner) cursorInner.style.display = 'none';
            return; // Stop function if no hover support
        }

        if (!cursorOuter || !cursorInner) return; // Stop if elements dont exist

        let mouseX = 0, mouseY = 0;
        let outerX = 0, outerY = 0;
        let innerX = 0, innerY = 0;
        const speedOuter = 0.15; // Kecepatan kursor luar (lebih lambat)
        const speedInner = 0.5; // Kecepatan kursor dalam (lebih cepat)

        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            // Interpolasi linear untuk gerakan smooth
            outerX += (mouseX - outerX) * speedOuter;
            outerY += (mouseY - outerY) * speedOuter;
            innerX += (mouseX - innerX) * speedInner;
            innerY += (mouseY - innerY) * speedInner;

            cursorOuter.style.transform = `translate3d(${outerX}px, ${outerY}px, 0)`;
            cursorInner.style.transform = `translate3d(${innerX}px, ${innerY}px, 0)`;

            requestAnimationFrame(animateCursor);
        }
        requestAnimationFrame(animateCursor);

        // Tambahkan state hover
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, [data-cursor-hover], .filter-btn, .view-details-btn, .skill-tab-btn, .nav-link, .mobile-nav-link, .social-icon-hero, .social-icon-contact, .social-icon-footer, .faq-question');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => bodyEl.classList.add('cursor-pointer'));
            el.addEventListener('mouseleave', () => bodyEl.classList.remove('cursor-pointer'));
        });
        // Tambahkan state hover spesifik jika perlu (misal: scale up)
        const hoverScaleElements = document.querySelectorAll('.portfolio-card, .service-card, .blog-post-card');
        hoverScaleElements.forEach(el => {
            el.addEventListener('mouseenter', () => bodyEl.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => bodyEl.classList.remove('cursor-hover'));
        });

    }

    // --- 11. Role Ticker ---
    function initRoleTicker() {
        const tickerEl = document.getElementById('role-ticker');
        if (!tickerEl) return;

        // Ambil peran dari data bahasa saat ini
        const lang = htmlEl.dataset.lang || 'id';
        const roles = window.langData && window.langData[lang] && window.langData[lang].hero_roles
            ? window.langData[lang].hero_roles
            : ['Web Developer', 'UI/UX Designer', 'Problem Solver']; // Fallback roles

        let currentRoleIndex = 0;
        let currentSpan = null; // Simpan span aktif
        let intervalId = null; // Simpan ID interval untuk di-clear

        function showNextRole() {
            const nextRoleIndex = (currentRoleIndex + 1) % roles.length;
            const nextRoleText = roles[nextRoleIndex];

            // Buat span baru untuk peran berikutnya
            const nextSpan = document.createElement('span');
            nextSpan.textContent = nextRoleText;

            // Tambahkan span baru dan sembunyikan yang lama
            if (currentSpan) {
                currentSpan.style.opacity = '0';
                // Hapus span lama setelah transisi selesai
                currentSpan.addEventListener('transitionend', () => {
                    if (currentSpan && currentSpan.parentElement === tickerEl) { // Cek jika masih ada
                        tickerEl.removeChild(currentSpan);
                    }
                }, { once: true });
            }

            tickerEl.appendChild(nextSpan);

            // Trigger reflow untuk memastikan transisi opacity bekerja
            void nextSpan.offsetWidth;

            // Tampilkan span baru
            nextSpan.style.opacity = '1';
            nextSpan.classList.add('active'); // Tambah class active jika diperlukan CSS tambahan

            currentSpan = nextSpan; // Update span aktif
            currentRoleIndex = nextRoleIndex;
        }

        // Hentikan interval sebelumnya jika ada (penting saat ganti bahasa)
        if (initRoleTicker.intervalId) {
            clearInterval(initRoleTicker.intervalId);
        }
        // Bersihkan ticker sebelum memulai
        tickerEl.innerHTML = '';
        currentSpan = null;

        // Tampilkan peran pertama segera
        showNextRole();

        // Mulai interval
        initRoleTicker.intervalId = setInterval(showNextRole, 3000); // Ganti peran setiap 3 detik
    }
    // Static property to hold interval ID
    initRoleTicker.intervalId = null;


    // --- 12. Portfolio Filtering & Modal ---
    function initPortfolio() {
        const filterContainer = document.querySelector('.portfolio-filters');
        const portfolioGrid = document.querySelector('.portfolio-grid');
        const portfolioItems = portfolioGrid ? portfolioGrid.querySelectorAll('.portfolio-item') : [];
        const modal = document.getElementById('portfolio-modal');
        const modalOverlay = modal ? modal.querySelector('.modal-overlay') : null;
        const modalCloseBtn = modal ? modal.querySelector('.modal-close-btn') : null;
        const loadMoreBtn = document.getElementById('load-more-projects'); // Tombol muat lebih banyak
        let itemsToShow = 8; // Jumlah item awal yang ditampilkan
        const itemsIncrement = 4; // Jumlah item yang ditambahkan saat load more

        // Dummy project data (Ganti dengan data asli Anda atau fetch dari API)
        const projectData = {
            'pertamina-hulu-rokan': {
                titleKey: 'project_1_title_modal',
                clientKey: 'project_1_client',
                dateKey: 'project_1_date',
                categoryKey: 'project_1_category',
                tech: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap'],
                descriptionKey: 'project_1_desc_modal',
                featuresKey: 'project_1_features', // Array of lang keys for features
                liveLink: 'https://projectprofilpertaminahulurokanrantaufield1.expedient609.com/',
                repoLink: 'https://github.com/dresar/PertaminaHuluRokanRantau.git',
                images: ['images/projects/project-pertamina-large.jpg', 'images/projects/project-pertamina-detail-1.jpg', 'images/projects/project-pertamina-detail-2.jpg']
            },
            'fintrack-dashboard': {
                titleKey: 'project_2_title_modal',
                clientKey: 'project_2_client',
                dateKey: 'project_2_date',
                categoryKey: 'project_2_category',
                tech: ['HTML5', 'CSS3', 'JavaScript', 'PHP (Concept)'],
                descriptionKey: 'project_2_desc_modal',
                featuresKey: 'project_2_features',
                liveLink: 'https://find.ekasyarifmaulana.biz.id/transaksi.html', // Contoh link, ganti jika ada
                repoLink: 'https://github.com/dresar/fintrack.git',
                images: ['images/projects/project-fintrack-large.jpg', 'images/projects/project-fintrack-detail-1.png', 'images/projects/project-fintrack-detail-2.png']
            },
            'personal-portfolio': {
                titleKey: 'project_3_title_modal',
                clientKey: 'project_3_client',
                dateKey: 'project_3_date',
                categoryKey: 'project_3_category',
                tech: ['HTML5', 'CSS3', 'JavaScript', 'GSAP'],
                descriptionKey: 'project_3_desc_modal',
                featuresKey: 'project_3_features',
                liveLink: '#', // Link ke halaman ini sendiri
                repoLink: 'https://github.com/dresar/your-portfolio-repo', // Ganti repo Anda
                images: ['images/projects/project-portfolio-large.jpg', 'images/projects/project-portfolio-detail-1.jpg', 'images/projects/project-portfolio-detail-2.jpg']
            },
            'delipark-navigator': {
                titleKey: 'project_4_title_modal',
                clientKey: 'project_4_client',
                dateKey: 'project_4_date',
                categoryKey: 'project_4_category',
                tech: ['Android', 'ARCore', 'Java', 'Unity'],
                descriptionKey: 'project_4_desc_modal',
                featuresKey: 'project_4_features',
                // liveLink: null, // Tidak ada demo live web
                downloadLink: 'https://drive.google.com/file/d/17dEk8-Qrlri3OWuZsU37I5IZhDq4gJk4/view?usp=drive_link', // Link unduh APK
                images: ['images/projects/project-delipark-large.jpg', 'images/projects/project-delipark-detail-1.png', 'images/projects/project-delipark-detail-2.png']
            },
            'cafecore-app': {
                titleKey: 'project_5_title_modal',
                clientKey: 'project_5_client',
                dateKey: 'project_5_date',
                categoryKey: 'project_5_category',
                tech: ['Figma', 'Adobe XD', 'Illustrator'],
                descriptionKey: 'project_5_desc_modal',
                featuresKey: 'project_5_features',
                figmaLink: 'https://www.figma.com/proto/c0wGJyNljaZgJTZbL60JRQ/CoffeApp?node-id=27-8748&starting-point-node-id=27%3A8748&t=M1Hg5OxhUqxg787w-1',
                images: ['images/projects/project-cafecore-large.jpg', 'images/projects/project-cafecore-detail-1.jpg', 'images/projects/project-cafecore-detail-2.jpg']
            },
            'mahir-ppt': {
                titleKey: 'project_6_title_modal',
                clientKey: 'project_6_client',
                dateKey: 'project_6_date',
                categoryKey: 'project_6_category',
                tech: ['Branding', 'Digital Marketing', 'PowerPoint', 'Clicky'],
                descriptionKey: 'project_6_desc_modal',
                featuresKey: 'project_6_features',
                storeLink: 'https://clicky.id/arifex21', // Link ke toko
                images: ['images/projects/project-mahirppt-large.jpg', 'images/projects/project-mahirppt-detail-1.jpg', 'images/projects/project-mahirppt-detail-2.jpg']
            },
            'arsip-digital': {
                titleKey: 'project_7_title_modal',
                clientKey: 'project_7_client',
                dateKey: 'project_7_date',
                categoryKey: 'project_7_category',
                tech: ['PHP', 'MySQL', 'Bootstrap', 'jQuery'],
                descriptionKey: 'project_7_desc_modal',
                featuresKey: 'project_7_features',
                repoLink: 'https://github.com/dresar/arsipdigitalpertamina.git',
                images: ['images/projects/project-arsip-large.jpg', 'images/projects/project-arsip-detail-1.jpg', 'images/projects/project-arsip-detail-2.jpg']
            },
            'netflix-clone': {
                titleKey: 'project_8_title_modal',
                clientKey: 'project_8_client',
                dateKey: 'project_8_date',
                categoryKey: 'project_8_category',
                tech: ['Android', 'Java', 'SQLite', 'ExoPlayer'],
                descriptionKey: 'project_8_desc_modal',
                featuresKey: 'project_8_features',
                // downloadLink: '#', // Ganti jika ada link unduh
                images: ['images/projects/project-netflix-clone-large.jpg', 'images/projects/project-netflix-clone-detail-1.jpg', 'images/projects/project-netflix-clone-detail-2.jpg']
            }
            // Tambahkan data untuk proyek lain di sini...
        };

        // --- Fungsi untuk menerjemahkan teks modal ---
        function getLangText(key) {
            const lang = htmlEl.dataset.lang || 'id';
            if (!window.langData || !window.langData[lang]) return `[${key}]`; // Fallback
            // Handle nested keys if project data uses them
            const text = key.split('.').reduce((o, i) => (o ? o[i] : null), window.langData[lang]);
            return text || `[${key}]`; // Fallback jika key tidak ditemukan
        }


        // --- Fungsi untuk menampilkan item berdasarkan filter dan jumlah ---
        function displayItems() {
            const activeFilter = filterContainer?.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            let visibleCount = 0;

            portfolioItems.forEach((item, index) => {
                const categories = item.dataset.category ? item.dataset.category.split(' ') : [];
                const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);

                if (matchesFilter && visibleCount < itemsToShow) {
                    item.style.display = ''; // Tampilkan item
                    // Tambahkan delay animasi berdasarkan urutan tampil
                    item.style.transitionDelay = `${(visibleCount % itemsIncrement) * 0.05}s`;
                    item.classList.remove('filtered-out');
                    visibleCount++;
                } else {
                    item.style.display = 'none'; // Sembunyikan item
                    item.classList.add('filtered-out');
                }
            });

            // Tampilkan/sembunyikan tombol "Load More"
            if (loadMoreBtn) {
                const totalMatchingItems = Array.from(portfolioItems).filter(item => {
                    const categories = item.dataset.category ? item.dataset.category.split(' ') : [];
                    return activeFilter === 'all' || categories.includes(activeFilter);
                }).length;

                if (visibleCount < totalMatchingItems) {
                    loadMoreBtn.style.display = 'inline-flex';
                } else {
                    loadMoreBtn.style.display = 'none';
                }
            }
        }


        // Filter Logic
        if (filterContainer && portfolioItems.length > 0) {
            filterContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn') && !e.target.classList.contains('active')) {
                    filterContainer.querySelector('.filter-btn.active')?.classList.remove('active');
                    e.target.classList.add('active');
                    itemsToShow = 8; // Reset jumlah item saat filter berubah
                    displayItems(); // Tampilkan item sesuai filter baru
                }
            });
        }

        // Load More Logic
        if (loadMoreBtn && portfolioItems.length > 0) {
            loadMoreBtn.addEventListener('click', () => {
                itemsToShow += itemsIncrement;
                displayItems(); // Tampilkan lebih banyak item
            });
        }


        // Modal Logic
        if (portfolioGrid && modal && modalOverlay && modalCloseBtn) {
            portfolioGrid.addEventListener('click', (e) => {
                const viewButton = e.target.closest('.view-details-btn');
                if (viewButton) {
                    const projectId = viewButton.dataset.projectId;
                    const data = projectData[projectId];

                    if (data) {
                        // Populate Modal Content
                        modal.querySelector('.modal-project-title').textContent = getLangText(data.titleKey);
                        modal.querySelector('#modal-client').textContent = getLangText(data.clientKey);
                        modal.querySelector('#modal-date').textContent = getLangText(data.dateKey);
                        modal.querySelector('#modal-category').textContent = getLangText(data.categoryKey);
                        modal.querySelector('#modal-description-content').textContent = getLangText(data.descriptionKey);

                        // Populate Tech Stack
                        const techStackContainer = modal.querySelector('#modal-tech-stack');
                        techStackContainer.innerHTML = ''; // Clear previous
                        data.tech.forEach(tech => {
                            const tag = document.createElement('span');
                            tag.className = 'tech-tag';
                            tag.textContent = tech;
                            techStackContainer.appendChild(tag);
                        });

                        // Populate Features
                        const featuresList = modal.querySelector('#modal-features-list');
                        featuresList.innerHTML = ''; // Clear previous
                        if (data.featuresKey && Array.isArray(window.langData[htmlEl.dataset.lang][data.featuresKey])) {
                            window.langData[htmlEl.dataset.lang][data.featuresKey].forEach(featureText => {
                                const li = document.createElement('li');
                                li.textContent = featureText;
                                featuresList.appendChild(li);
                            });
                        } else if (data.featuresKey) { // Jika featuresKey hanya string tunggal
                            const li = document.createElement('li');
                            li.textContent = getLangText(data.featuresKey);
                            featuresList.appendChild(li);
                        }


                        // Populate Images
                        const mainImage = modal.querySelector('#modal-main-image');
                        const thumbnailsContainer = modal.querySelector('#modal-thumbnails');
                        thumbnailsContainer.innerHTML = ''; // Clear previous
                        if (data.images && data.images.length > 0) {
                            mainImage.src = data.images[0]; // Set main image
                            mainImage.alt = getLangText(data.titleKey);

                            data.images.forEach((imgSrc, index) => {
                                const thumbImg = document.createElement('img');
                                thumbImg.src = imgSrc; // Idealnya thumbnail terpisah, tapi pakai full image untuk contoh
                                thumbImg.alt = `Thumbnail ${index + 1}`;
                                if (index === 0) thumbImg.classList.add('active');
                                thumbImg.addEventListener('click', () => {
                                    mainImage.src = imgSrc;
                                    thumbnailsContainer.querySelector('.active')?.classList.remove('active');
                                    thumbImg.classList.add('active');
                                });
                                thumbnailsContainer.appendChild(thumbImg);
                            });
                        } else {
                            mainImage.src = 'images/placeholder-project-large.png'; // Fallback
                        }


                        // Handle Links
                        const liveLinkEl = modal.querySelector('#modal-live-link');
                        const repoLinkEl = modal.querySelector('#modal-repo-link');
                        const downloadLinkEl = modal.querySelector('#modal-download-link'); // Tambahkan jika ada ID ini
                        const figmaLinkEl = modal.querySelector('#modal-figma-link'); // Tambahkan jika ada ID ini
                        const storeLinkEl = modal.querySelector('#modal-store-link'); // Tambahkan jika ada ID ini
                        const caseStudyLinkEl = modal.querySelector('#modal-case-study-link');


                        const setupLink = (el, link, langKey) => {
                            if (el) {
                                if (link) {
                                    el.href = link;
                                    el.style.display = 'inline-flex';
                                    const span = el.querySelector('span');
                                    if (span && langKey) span.textContent = getLangText(langKey);
                                } else {
                                    el.style.display = 'none';
                                }
                            }
                        };

                        setupLink(liveLinkEl, data.liveLink, 'modal_live_demo');
                        setupLink(repoLinkEl, data.repoLink, 'modal_source_code');
                        setupLink(downloadLinkEl, data.downloadLink, 'modal_download'); // Ganti key jika perlu
                        setupLink(figmaLinkEl, data.figmaLink, 'modal_figma'); // Ganti key jika perlu
                        setupLink(storeLinkEl, data.storeLink, 'modal_store'); // Ganti key jika perlu
                        setupLink(caseStudyLinkEl, data.caseStudyLink, 'modal_case_study');


                        // Show Modal
                        modal.classList.add('open');
                        bodyEl.style.overflow = 'hidden'; // Prevent body scroll
                    } else {
                        console.error(`Project data not found for ID: ${projectId}`);
                    }
                }
            });

            // Close Modal Function
            const closeModal = () => {
                modal.classList.remove('open');
                bodyEl.style.overflow = ''; // Restore body scroll
            };

            // Close Modal Listeners
            modalOverlay.addEventListener('click', closeModal);
            modalCloseBtn.addEventListener('click', closeModal);
        }

        // Tampilkan item awal saat halaman dimuat
        if (portfolioItems.length > 0) {
            displayItems();
        }

    }

    // --- 13. Testimonial Slider (Placeholder for Library) ---
    function initTestimonials() {
        const sliderEl = document.getElementById('testimonial-slider');
        if (!sliderEl) return;

        // --- PENTING: Ganti ini dengan inisialisasi library slider Anda ---
        // Contoh jika menggunakan Slick Slider (perlu jQuery & Slick JS/CSS)
        /*
        if (typeof $ !== 'undefined' && $.fn.slick) {
            $('#testimonial-slider').slick({
                dots: true,
                infinite: true,
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 5000,
                arrows: true, // Tampilkan panah bawaan slick
                prevArrow: '<button type="button" class="slick-prev nav-btn prev-btn"><i class="fas fa-chevron-left"></i></button>',
                nextArrow: '<button type="button" class="slick-next nav-btn next-btn"><i class="fas fa-chevron-right"></i></button>',
                dotsClass: 'slick-dots slider-dots' // Gunakan class dots kustom kita
            });
            console.log("Slick Slider Initialized for Testimonials");
        } else {
             console.warn("Slick Slider library not found. Testimonials will not slide.");
             // Mungkin tambahkan logika fallback sederhana (tampilkan 1 testimoni)
        }
        */

        // Contoh jika menggunakan Swiper.js (perlu Swiper JS/CSS)
        /*
         if (typeof Swiper !== 'undefined') {
             const swiper = new Swiper('.testimonial-slider-wrapper', { // Target wrapper
                 loop: true,
                 slidesPerView: 1,
                 spaceBetween: 30, // Jarak antar slide jika > 1
                 autoplay: {
                     delay: 5000,
                     disableOnInteraction: false,
                 },
                 pagination: {
                     el: '.slider-dots', // Gunakan kontainer dots kustom kita
                     clickable: true,
                 },
                 navigation: {
                     nextEl: '.slider-nav .next-btn', // Gunakan tombol kustom kita
                     prevEl: '.slider-nav .prev-btn',
                 },
             });
             console.log("Swiper Initialized for Testimonials");
         } else {
             console.warn("Swiper library not found. Testimonials will not slide.");
         }
         */

        // Jika tidak pakai library, tampilkan semua atau hanya satu
        console.warn("No slider library detected/initialized for testimonials. Displaying statically.");
        // Jika ingin hanya tampilkan 1:
        // const slides = sliderEl.querySelectorAll('.testimonial-slide');
        // slides.forEach((slide, index) => { if(index > 0) slide.style.display = 'none'; });
        // Sembunyikan navigasi/dots jika statis
        const nav = document.querySelector('.testimonial-slider-wrapper .slider-nav');
        const dots = document.querySelector('.testimonial-slider-wrapper .slider-dots');
        if (nav) nav.style.display = 'none';
        if (dots) dots.style.display = 'none';
    }


    // --- 14. FAQ Accordion ---
    function initFaqAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const questionBtn = item.querySelector('.faq-question');
            const answerDiv = item.querySelector('.faq-answer');

            if (questionBtn && answerDiv) {
                questionBtn.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');

                    // Tutup semua item lain (opsional)
                    // faqItems.forEach(otherItem => {
                    //     if (otherItem !== item) {
                    //         otherItem.classList.remove('active');
                    //         otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    //     }
                    // });

                    // Toggle item yang diklik
                    item.classList.toggle('active');
                    if (item.classList.contains('active')) {
                        // Set max-height sesuai scrollHeight saat membuka
                        answerDiv.style.maxHeight = answerDiv.scrollHeight + "px";
                    } else {
                        // Set max-height ke null (atau 0) saat menutup
                        answerDiv.style.maxHeight = null;
                    }
                });
            }
        });
    }

    // --- 15. Contact Form Simulation ---
    function initContactForm() {
        const contactForm = document.getElementById('contact-form');
        const submitButton = document.getElementById('submit-contact-form');
        const statusMessage = document.getElementById('contact-form-status');

        if (contactForm && submitButton && statusMessage) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault(); // Hentikan pengiriman form standar

                // --- Validasi Sederhana (Contoh) ---
                const nameInput = document.getElementById('contact-name');
                const emailInput = document.getElementById('contact-email');
                const messageInput = document.getElementById('contact-message');
                const consentCheckbox = document.getElementById('contact-consent');
                let isValid = true;

                // Reset status
                statusMessage.textContent = '';
                statusMessage.className = 'form-status-message'; // Reset class
                statusMessage.style.display = 'none';
                nameInput.style.borderColor = ''; // Reset border
                emailInput.style.borderColor = '';
                messageInput.style.borderColor = '';


                if (!nameInput.value.trim()) {
                    nameInput.style.borderColor = '#F56565'; // Merah error
                    isValid = false;
                }
                if (!emailInput.value.trim() || !/^\S+@\S+\.\S+$/.test(emailInput.value)) {
                    emailInput.style.borderColor = '#F56565';
                    isValid = false;
                }
                if (!messageInput.value.trim()) {
                    messageInput.style.borderColor = '#F56565';
                    isValid = false;
                }
                if (!consentCheckbox.checked) {
                    // Beri indikator visual ke checkbox/label jika perlu
                    isValid = false;
                    // Tampilkan pesan error spesifik untuk consent jika mau
                }

                if (!isValid) {
                    statusMessage.textContent = getLangText('form_validation_error') || 'Harap isi semua kolom yang wajib diisi dengan benar.'; // Ambil dari langData
                    statusMessage.classList.add('error');
                    statusMessage.style.display = 'block';
                    return; // Hentikan jika tidak valid
                }


                // Tampilkan state loading
                submitButton.disabled = true;
                submitButton.classList.add('loading');
                const btnText = submitButton.querySelector('.btn-text');
                const originalText = btnText ? btnText.textContent : 'Kirim Pesan'; // Simpan teks asli
                if (btnText) btnText.textContent = getLangText('form_sending') || 'Mengirim...';
                const spinner = submitButton.querySelector('.loading-spinner');
                if (spinner) spinner.style.display = 'inline-block';


                // --- Simulasi Pengiriman ---
                console.log("Simulating form submission...");
                const formData = new FormData(contactForm);
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}: ${value}`);
                }

                setTimeout(() => {
                    // --- Simulasi Hasil ---
                    const isSuccess = Math.random() > 0.2; // 80% chance of success

                    // Sembunyikan loading
                    submitButton.disabled = false;
                    submitButton.classList.remove('loading');
                    if (btnText) btnText.textContent = originalText; // Kembalikan teks asli
                    if (spinner) spinner.style.display = 'none';

                    if (isSuccess) {
                        statusMessage.textContent = getLangText('form_success') || 'Pesan berhasil dikirim! Terima kasih.';
                        statusMessage.className = 'form-status-message success';
                        contactForm.reset(); // Reset form setelah berhasil
                    } else {
                        statusMessage.textContent = getLangText('form_error') || 'Gagal mengirim pesan. Silakan coba lagi.';
                        statusMessage.className = 'form-status-message error';
                    }
                    statusMessage.style.display = 'block';

                    // Sembunyikan pesan status setelah beberapa detik
                    setTimeout(() => {
                        statusMessage.style.display = 'none';
                    }, 5000);

                }, 1500); // Delay simulasi 1.5 detik
            });
        }
    }


    // --- 16. Button Ripple Effect ---
    function initRippleEffect() {
        const buttons = document.querySelectorAll('.btn'); // Target semua tombol atau class spesifik

        buttons.forEach(button => {
            button.addEventListener('mousedown', function (e) { // Gunakan mousedown agar muncul saat klik ditekan
                const rect = button.getBoundingClientRect();
                const ripple = document.createElement('span');
                const diameter = Math.max(button.clientWidth, button.clientHeight);
                const radius = diameter / 2;

                // Hapus ripple lama jika ada (jarang terjadi tapi untuk jaga-jaga)
                const oldRipple = button.querySelector('.ripple');
                if (oldRipple) oldRipple.remove();

                ripple.style.width = ripple.style.height = `${diameter}px`;
                ripple.style.left = `${e.clientX - rect.left - radius}px`;
                ripple.style.top = `${e.clientY - rect.top - radius}px`;
                ripple.classList.add('ripple');

                button.appendChild(ripple);

                // Hapus elemen ripple setelah animasi selesai
                ripple.addEventListener('animationend', () => {
                    ripple.remove();
                });
            });
        });
    }


    // --- 17. Lazy Loading Images ---
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img.lazyload[data-src]');
        const lazyBackgrounds = document.querySelectorAll('.lazyload[data-bg-src]'); // Contoh untuk background

        if ('IntersectionObserver' in window) {
            const lazyImageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target;
                        lazyImage.src = lazyImage.dataset.src;
                        // Optional: Hapus data-src setelah load
                        // lazyImage.removeAttribute('data-src');
                        lazyImage.classList.remove('lazyload');
                        lazyImage.classList.add('lazyloaded'); // Tambah class jika perlu styling post-load

                        // Tambahkan event listener load untuk menangani gambar yang gagal dimuat
                        lazyImage.addEventListener('load', () => {
                            // Gambar berhasil dimuat
                        });
                        lazyImage.addEventListener('error', () => {
                            console.error(`Failed to load image: ${lazyImage.src}`);
                            // Ganti dengan gambar placeholder error jika perlu
                            // lazyImage.src = 'images/placeholder-error.png';
                        });


                        observer.unobserve(lazyImage);
                    }
                });
            });

            lazyImages.forEach(img => lazyImageObserver.observe(img));

            // Observer untuk background (jika ada)
            const lazyBackgroundObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const lazyBg = entry.target;
                        lazyBg.style.backgroundImage = `url(${lazyBg.dataset.bgSrc})`;
                        lazyBg.removeAttribute('data-bg-src');
                        lazyBg.classList.remove('lazyload');
                        lazyBg.classList.add('lazyloaded');
                        observer.unobserve(lazyBg);
                    }
                });
            });
            lazyBackgrounds.forEach(bg => lazyBackgroundObserver.observe(bg));

        } else {
            // Fallback: Muat semua gambar langsung jika IntersectionObserver tidak didukung
            lazyImages.forEach(img => { img.src = img.dataset.src; img.classList.remove('lazyload'); });
            lazyBackgrounds.forEach(bg => { bg.style.backgroundImage = `url(${bg.dataset.bgSrc})`; bg.classList.remove('lazyload'); });
            console.warn("IntersectionObserver not supported. Lazy loading disabled.");
        }
    }


    // --- Initialization Call ---
    function initializeApp() {
        initPreloader(); // Jalankan preloader paling awal
        initLanguageSwitcher(); // Muat bahasa & teks awal
        initThemeSwitcher(); // Terapkan tema awal
        initMobileNav();
        initStickyHeader();
        initSmoothScroll();
        initScrollAnimations(); // Harus setelah elemen ada
        initBackToTop();
        initCustomCursor();
        // initRoleTicker(); // Dipanggil di dalam initLanguageSwitcher saat bahasa diupdate
        initPortfolio();
        initTestimonials();
        initFaqAccordion();
        initContactForm();
        initRippleEffect();
        initLazyLoading(); // Jalankan lazy loading setelah DOM siap
        console.log("Portfolio App Initialized");
    }

    initializeApp();

}); // Akhir dari DOMContentLoaded