// ========== МОБИЛЬНОЕ МЕНЮ ==========
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');

if (burger) {
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    });
}

// ========== ПЛАВНАЯ ПРОКРУТКА ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            if (nav) nav.classList.remove('nav-active');
            if (burger) burger.classList.remove('toggle');
        }
    });
});

// ========== FAQ АККОРДЕОН ==========
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (question) {
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    }
});

// ========== КАРУСЕЛЬ ==========
const carouselTrack = document.querySelector('.carousel-track');
const slides = carouselTrack ? Array.from(carouselTrack.children) : [];
const nextButton = document.querySelector('.carousel-btn.next');
const prevButton = document.querySelector('.carousel-btn.prev');
const dots = Array.from(document.querySelectorAll('.dot'));

let currentSlide = 0;
const totalSlides = slides.length;
let autoPlayInterval;

function updateSlide(index) {
    if (!carouselTrack) return;
    carouselTrack.style.transform = `translateX(-${index * 100}%)`;
    
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[index]) dots[index].classList.add('active');
    
    currentSlide = index;
}

function nextSlide() {
    if (totalSlides === 0) return;
    const newIndex = (currentSlide + 1) % totalSlides;
    updateSlide(newIndex);
}

function prevSlide() {
    if (totalSlides === 0) return;
    const newIndex = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlide(newIndex);
}

function startAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(nextSlide, 4000);
}

function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
}

if (nextButton && prevButton && slides.length > 0) {
    nextButton.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });

    prevButton.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.getAttribute('data-slide'));
            if (!isNaN(slideIndex)) {
                updateSlide(slideIndex);
                resetAutoPlay();
            }
        });
    });

    updateSlide(0);
    startAutoPlay();

    const carousel = document.querySelector('.carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });

        carousel.addEventListener('mouseleave', () => {
            startAutoPlay();
        });
    }
}

// ========== ИНТЕРАКТИВНАЯ КАРТА МИРА (LEAFLET + OPENSTREETMAP) ==========
let worldMap;
let currentCircle = null;
let currentMarker = null;

function initWorldMap() {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer) return;
    
    worldMap = L.map('leaflet-map').setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 2
    }).addTo(worldMap);
    
    console.log('Карта мира инициализирована');
}

async function getContinentCoordinates(continentName) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(continentName)}&format=json&limit=1`;
    
    try {
        console.log(`Запрос к API для континента: ${continentName}`);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'TravelWorld Tourism Website/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            console.log(`Получены координаты для ${continentName}: широта=${lat}, долгота=${lon}`);
            return { lat, lon, found: true };
        } else {
            console.warn(`Координаты для ${continentName} не найдены`);
            return { found: false };
        }
    } catch (error) {
        console.error('Ошибка при запросе к API:', error);
        return { found: false, error: error.message };
    }
}

const fallbackCoordinates = {
    'Asia': { lat: 34.0479, lon: 100.6197, name: 'Азия' },
    'North America': { lat: 39.8283, lon: -98.5795, name: 'Северная Америка' },
    'Europe': { lat: 54.5260, lon: 15.2551, name: 'Европа' },
    'Africa': { lat: 8.7832, lon: 34.5085, name: 'Африка' }
};

function showContinentCircle(continentQuery, continentName, radius, buttonElement) {
    if (buttonElement) {
        buttonElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            buttonElement.style.transform = 'scale(1)';
        }, 150);
    }
    
    const infoDiv = document.getElementById('map-region-info');
    if (infoDiv) {
        infoDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Загрузка координат...</p>';
        infoDiv.style.background = '#fff0f3';
    }
    
    getContinentCoordinates(continentQuery).then(result => {
        let lat, lon;
        let usedFallback = false;
        
        if (result.found) {
            lat = result.lat;
            lon = result.lon;
        } else {
            const fallback = fallbackCoordinates[continentQuery];
            if (fallback) {
                lat = fallback.lat;
                lon = fallback.lon;
                usedFallback = true;
                console.log(`Используем запасные координаты для ${continentQuery}`);
            } else {
                lat = 20;
                lon = 0;
                usedFallback = true;
            }
        }
        
        if (infoDiv) {
            const apiStatus = usedFallback ? 
                '<span style="color: #e890a0;">(API временно недоступен, используются локальные координаты)</span>' : 
                '<span style="color: #4CAF50;">✓ Координаты получены через OpenStreetMap API</span>';
            
            infoDiv.innerHTML = `
                <div style="text-align: center;">
                    <h3 style="color: #c94a62; margin-bottom: 0.5rem;">${continentName}</h3>
                    <p style="margin: 0.3rem 0;"><strong>Координаты:</strong> ${lat.toFixed(4)}°, ${lon.toFixed(4)}°</p>
                    <p style="margin: 0.3rem 0;"><strong>Радиус области:</strong> ${(radius / 1000).toFixed(0)} км</p>
                    <p style="margin: 0.3rem 0; font-size: 0.85rem;">${apiStatus}</p>
                </div>
            `;
            infoDiv.style.background = '#ffe0e5';
            infoDiv.style.transform = 'scale(1.02)';
            setTimeout(() => {
                if (infoDiv) infoDiv.style.transform = 'scale(1)';
            }, 200);
        }
        
        if (currentCircle) {
            worldMap.removeLayer(currentCircle);
        }
        if (currentMarker) {
            worldMap.removeLayer(currentMarker);
        }
        
        currentCircle = L.circle([lat, lon], {
            color: '#c94a62',
            fillColor: '#e890a0',
            fillOpacity: 0.3,
            radius: radius,
            weight: 3,
            opacity: 0.8
        }).addTo(worldMap);
        
        currentMarker = L.marker([lat, lon]).addTo(worldMap)
            .bindPopup(`
                <b>${continentName}</b><br>
                Центр выбранного региона<br>
                <span style="font-size: 11px; color: #666;">Координаты: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°</span>
            `)
            .openPopup();
        
        let zoomLevel = 3;
        if (continentQuery === 'Europe') zoomLevel = 4;
        if (continentQuery === 'Asia') zoomLevel = 3;
        
        worldMap.setView([lat, lon], zoomLevel, {
            animate: true,
            duration: 1
        });
        
        setTimeout(() => {
            if (currentCircle) {
                currentCircle.setStyle({ weight: 5, opacity: 1 });
                setTimeout(() => {
                    if (currentCircle) currentCircle.setStyle({ weight: 3, opacity: 0.8 });
                }, 500);
            }
        }, 100);
        
        console.log(`Окружность добавлена для ${continentName} в координатах [${lat}, ${lon}]`);
    }).catch(error => {
        console.error('Ошибка при работе с картой:', error);
        if (infoDiv) {
            infoDiv.innerHTML = `
                <div style="text-align: center;">
                    <p style="color: #c94a62;">❌ Ошибка получения данных</p>
                    <p style="font-size: 0.9rem;">Пожалуйста, попробуйте позже или выберите другой континент</p>
                </div>
            `;
            infoDiv.style.background = '#ffe0e5';
        }
    });
}

function setupContinentButtons() {
    const buttons = document.querySelectorAll('.continent-btn');
    
    const continentConfig = {
        'asia': { query: 'Asia', name: 'Азия', radius: 2500000 },
        'america': { query: 'North America', name: 'Северная и Южная Америка', radius: 3000000 },
        'europe': { query: 'Europe', name: 'Европа', radius: 2000000 },
        'africa': { query: 'Africa', name: 'Африка', radius: 2200000 }
    };
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const continent = btn.getAttribute('data-continent');
            const config = continentConfig[continent];
            if (config) {
                buttons.forEach(b => {
                    b.style.opacity = '0.7';
                    b.style.transform = 'scale(1)';
                });
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1.02)';
                
                showContinentCircle(config.query, config.name, config.radius, btn);
            }
        });
        
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-3px)';
            btn.style.boxShadow = '0 6px 20px rgba(180, 70, 90, 0.4)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        });
    });
}

// ========== ОБРАБОТКА ФОРМ ==========
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Отправлено!';
                submitBtn.style.background = '#4CAF50';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                    form.reset();
                }, 2000);
            }, 1500);
        }
    });
});

// ========== АНИМАЦИЯ ПРИ СКРОЛЛЕ ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease';
    observer.observe(section);
});

const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroSection.style.opacity = '1';
    heroSection.style.transform = 'translateY(0)';
}

// ========== ЗАПУСК КАРТЫ ==========
document.addEventListener('DOMContentLoaded', () => {
    initWorldMap();
    setupContinentButtons();
});

console.log('TravelWorld - все скрипты загружены и готовы к работе!');