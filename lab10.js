// Здесь будем хранить координаты и название города
let myLat = 55.7558;  // Широта Москвы (по умолчанию)
let myLon = 37.6173;  // Долгота Москвы
let myCity = 'Москва';

// Здесь будем хранить погодные данные
let weatherData = null;

// Какой режим просмотра: 'days' (по дням) или 'hours' (по часам)
let viewMode = 'days';

// Какая сейчас карточка показана (номер)
let currentCard = 0;

// Сколько всего карточек
let totalCards = 0;

// ============================================
// ШАГ 1: УЗНАЁМ, ГДЕ НАХОДИТСЯ ПОЛЬЗОВАТЕЛЬ
// ============================================

function askLocation() {
    // Проверяем, умеет ли браузер определять местоположение
    if (navigator.geolocation) {
        // Запрашиваем координаты
        navigator.geolocation.getCurrentPosition(
            // ЕСЛИ ПОЛЬЗОВАТЕЛЬ РАЗРЕШИЛ:
            function (pos) {
                myLat = pos.coords.latitude;
                myLon = pos.coords.longitude;
                getCityName(myLat, myLon);  // Узнаём название города
                loadWeather();               // Загружаем погоду
            },
            // ЕСЛИ ПОЛЬЗОВАТЕЛЬ ЗАПРЕТИЛ (или ошибка):
            function () {
                // Оставляем Москву по умолчанию
                showCityOnScreen();
                loadWeather();
            }
        );
    } else {
        // Браузер не умеет — просто Москва
        showCityOnScreen();
        loadWeather();
    }
}

// ============================================
// ШАГ 2: УЗНАЁМ НАЗВАНИЕ ГОРОДА ПО КООРДИНАТАМ
// ============================================

function getCityName(lat, lon) {
    // Спрашиваем у Nominatim (бесплатный сервис)
    let url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon;
    
    fetch(url)
        .then(function (answer) {
            return answer.json();
        })
        .then(function (data) {
            // Пытаемся взять название города
            if (data.address) {
                myCity = data.address.city || data.address.town || data.address.village || 'Москва';
            } else {
                myCity = 'Москва';
            }
            showCityOnScreen();
        })
        .catch(function () {
            myCity = 'Москва';
            showCityOnScreen();
        });
}

// Показываем название города на экране
function showCityOnScreen() {
    document.getElementById('city-name').innerHTML = myCity;
    document.getElementById('coordinates').innerHTML = myLat.toFixed(4) + '°N, ' + myLon.toFixed(4) + '°E';
}

// ============================================
// ШАГ 3: ЗАГРУЖАЕМ ПОГОДУ
// ============================================

function loadWeather() {
    // Показываем надпись "Загрузка..."
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    
    // Собираем ссылку для запроса
    let url = 'https://api.open-meteo.com/v1/forecast?';
    url = url + 'latitude=' + myLat;
    url = url + '&longitude=' + myLon;
    url = url + '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weathercode';
    url = url + '&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode';
    url = url + '&timezone=auto&forecast_days=7';
    
    // Отправляем запрос
    fetch(url)
        .then(function (answer) {
            return answer.json();
        })
        .then(function (data) {
            // Сохраняем данные
            weatherData = data;
            // Прячем загрузку
            document.getElementById('loading').style.display = 'none';
            // Показываем первую карточку
            currentCard = 0;
            showCards();
        })
        .catch(function () {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error-message').innerHTML = 'Не получилось загрузить погоду. Проверьте интернет.';
            document.getElementById('error-message').style.display = 'block';
        });
}

// ============================================
// ШАГ 4: СОЗДАЁМ И ПОКАЗЫВАЕМ КАРТОЧКИ
// ============================================

function showCards() {
    if (weatherData === null) {
        return;  // Если данных нет — ничего не делаем
    }
    
    if (viewMode === 'days') {
        makeDayCards();
    } else {
        makeHourCards();
    }
    
    // Показываем только одну карточку (ту, которую выбрали)
    showOneCard(currentCard);
    // Обновляем кнопки "Вперёд/Назад"
    updateButtons();
    // Обновляем точки
    updateDots();
}

// Создаём карточки по дням
function makeDayCards() {
    let container = document.getElementById('weather-cards');
    container.innerHTML = '';  // Очищаем
    
    let days = weatherData.daily.time;
    totalCards = days.length;
    
    // Для каждого дня создаём карточку
    for (let i = 0; i < days.length; i++) {
        let card = document.createElement('div');
        card.className = 'weather-card';
        card.setAttribute('data-index', i);
        
        // Получаем данные для этого дня
        let date = days[i];
        let maxTemp = Math.round(weatherData.daily.temperature_2m_max[i]);
        let minTemp = Math.round(weatherData.daily.temperature_2m_min[i]);
        let rain = weatherData.daily.precipitation_sum[i];
        let wind = weatherData.daily.wind_speed_10m_max[i];
        let code = weatherData.daily.weathercode[i];
        
        // Красивая дата
        let dateObj = new Date(date);
        let dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        let dayName = dayNames[dateObj.getDay()];
        let dateStr = dateObj.toLocaleDateString('ru-RU');
        
        // Заполняем карточку
        card.innerHTML = 
            '<div class="date">' + dayName + ', ' + dateStr + '</div>' +
            '<div class="weather-icon">' + getEmoji(code) + '</div>' +
            '<div class="temp">' + maxTemp + '° / ' + minTemp + '°</div>' +
            '<div class="details">' +
                '<div class="weather-detail"><span>' + getWeatherText(code) + '</span><span>💧 ' + rain + ' мм</span></div>' +
                '<div class="weather-detail"><span>💨 Ветер</span><span>' + wind + ' м/с</span></div>' +
                '<div class="weather-detail"><span>🌡️ Ощущается</span><span>' + Math.round((maxTemp + minTemp) / 2) + '°</span></div>' +
            '</div>';
        
        container.appendChild(card);
    }
}

// Создаём карточки по часам
function makeHourCards() {
    let container = document.getElementById('weather-cards');
    container.innerHTML = '';  // Очищаем
    
    // Получаем сегодняшнюю дату в формате "2024-01-15"
    let today = new Date().toISOString().split('T')[0];
    
    // Отбираем только часы на сегодня
    let allTimes = weatherData.hourly.time;
    let todayTimes = [];
    for (let i = 0; i < allTimes.length; i++) {
        if (allTimes[i].startsWith(today)) {
            todayTimes.push(i);  // Запоминаем индекс
        }
    }
    
    totalCards = todayTimes.length;
    
    // Для каждого часа создаём карточку
    for (let j = 0; j < todayTimes.length; j++) {
        let i = todayTimes[j];  // Настоящий индекс в данных
        
        let card = document.createElement('div');
        card.className = 'weather-card';
        card.setAttribute('data-index', j);
        
        let time = allTimes[i];
        let temp = Math.round(weatherData.hourly.temperature_2m[i]);
        let humidity = weatherData.hourly.relative_humidity_2m[i];
        let wind = weatherData.hourly.wind_speed_10m[i];
        let code = weatherData.hourly.weathercode[i];
        
        let hour = new Date(time).getHours();
        
        card.innerHTML = 
            '<div class="date">' + hour + ':00 - ' + ((hour + 1) % 24) + ':00</div>' +
            '<div class="weather-icon">' + getEmoji(code) + '</div>' +
            '<div class="temp">' + temp + '°C</div>' +
            '<div class="details">' +
                '<div class="weather-detail"><span>' + getWeatherText(code) + '</span><span>💧 ' + humidity + '%</span></div>' +
                '<div class="weather-detail"><span>💨 Ветер</span><span>' + wind + ' м/с</span></div>' +
            '</div>';
        
        container.appendChild(card);
    }
    
    // Показываем текущий час
    let nowHour = new Date().getHours();
    if (nowHour < totalCards) {
        currentCard = nowHour;
    } else {
        currentCard = 0;
    }
}

// Показываем одну карточку (остальные прячем)
function showOneCard(index) {
    let cards = document.querySelectorAll('.weather-card');
    for (let i = 0; i < cards.length; i++) {
        if (i === index) {
            cards[i].classList.add('active');
        } else {
            cards[i].classList.remove('active');
        }
    }
}

// ============================================
// ШАГ 5: КНОПКИ И ТОЧКИ НАВИГАЦИИ
// ============================================

function goPrev() {
    if (currentCard > 0) {
        currentCard = currentCard - 1;
        showOneCard(currentCard);
        updateButtons();
        updateDots();
    }
}

function goNext() {
    if (currentCard < totalCards - 1) {
        currentCard = currentCard + 1;
        showOneCard(currentCard);
        updateButtons();
        updateDots();
    }
}

function updateButtons() {
    // Кнопка "Назад"
    if (currentCard === 0) {
        document.getElementById('prev-btn').disabled = true;
    } else {
        document.getElementById('prev-btn').disabled = false;
    }
    
    // Кнопка "Вперёд"
    if (currentCard === totalCards - 1) {
        document.getElementById('next-btn').disabled = true;
    } else {
        document.getElementById('next-btn').disabled = false;
    }
}

function updateDots() {
    let dotsBox = document.getElementById('carousel-dots');
    dotsBox.innerHTML = '';
    
    for (let i = 0; i < totalCards; i++) {
        let dot = document.createElement('div');
        dot.className = 'dot';
        
        // Текущая точка — выделенная
        if (i === currentCard) {
            dot.classList.add('active');
        }
        
        // При клике на точку — переключаемся
        dot.onclick = function () {
            currentCard = i;
            showOneCard(currentCard);
            updateButtons();
            updateDots();
        };
        
        dotsBox.appendChild(dot);
    }
}

// ============================================
// ШАГ 6: ПОИСК ГОРОДОВ
// ============================================

function searchCities(text) {
    if (text.length < 2) {
        hideResults();
        return;
    }
    
    let url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(text) + '&limit=5';
    
    fetch(url)
        .then(function (answer) {
            return answer.json();
        })
        .then(function (cities) {
            showResults(cities);
        })
        .catch(function () {
            hideResults();
        });
}

function showResults(cities) {
    let box = document.getElementById('search-results');
    box.innerHTML = '';
    
    if (cities.length === 0) {
        box.classList.remove('active');
        return;
    }
    
    for (let i = 0; i < cities.length; i++) {
        let city = cities[i];
        let item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = city.display_name;
        
        // При клике на город — выбираем его
        item.onclick = function () {
            pickCity(city);
        };
        
        box.appendChild(item);
    }
    
    box.classList.add('active');
}

function hideResults() {
    document.getElementById('search-results').classList.remove('active');
}

function pickCity(city) {
    myLat = parseFloat(city.lat);
    myLon = parseFloat(city.lon);
    
    // Берём короткое название
    if (city.name) {
        myCity = city.name;
    } else {
        myCity = city.display_name.split(',')[0];
    }
    
    showCityOnScreen();
    loadWeather();
    hideResults();
    
    // Пишем название в поле поиска
    document.getElementById('city-search').value = myCity;
}

// ============================================
// ШАГ 7: ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Эмодзи по коду погоды
function getEmoji(code) {
    if (code === 0) return '☀️';           // Ясно
    if (code === 1 || code === 2) return '🌤️';  // Малооблачно
    if (code === 3) return '☁️';           // Пасмурно
    if (code >= 45 && code <= 48) return '🌫️';  // Туман
    if (code >= 51 && code <= 65) return '🌧️';  // Дождь
    if (code >= 71 && code <= 77) return '❄️';  // Снег
    if (code >= 80 && code <= 82) return '🌧️';  // Ливни
    if (code >= 85 && code <= 86) return '🌨️';  // Снегопад
    if (code >= 95) return '⛈️';               // Гроза
    return '🌡️';  // Неизвестно
}

// Текст погоды по коду
function getWeatherText(code) {
    if (code === 0) return 'Ясно';
    if (code === 1) return 'Малооблачно';
    if (code === 2) return 'Облачно';
    if (code === 3) return 'Пасмурно';
    if (code === 45) return 'Туман';
    if (code === 48) return 'Изморозь';
    if (code === 51) return 'Морось';
    if (code === 53) return 'Морось';
    if (code === 55) return 'Морось';
    if (code === 61) return 'Дождь';
    if (code === 63) return 'Дождь';
    if (code === 65) return 'Ливень';
    if (code === 71) return 'Снег';
    if (code === 73) return 'Снег';
    if (code === 75) return 'Снегопад';
    if (code === 77) return 'Снег';
    if (code === 80) return 'Ливни';
    if (code === 81) return 'Ливни';
    if (code === 82) return 'Ливни';
    if (code === 85) return 'Снегопад';
    if (code === 86) return 'Снегопад';
    if (code === 95) return 'Гроза';
    if (code === 96) return 'Гроза с градом';
    if (code === 99) return 'Гроза с градом';
    return '?';
}

// ============================================
// ШАГ 8: ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================

// Ждём, пока страница загрузится
window.onload = function () {
    
    // Запрашиваем геолокацию и грузим погоду
    askLocation();
    
    // Кнопка "По дням"
    document.getElementById('daily-view-btn').onclick = function () {
        viewMode = 'days';
        currentCard = 0;
        // Меняем классы кнопок
        document.getElementById('daily-view-btn').classList.add('active');
        document.getElementById('hourly-view-btn').classList.remove('active');
        showCards();
    };
    
    // Кнопка "По часам"
    document.getElementById('hourly-view-btn').onclick = function () {
        viewMode = 'hours';
        currentCard = 0;
        document.getElementById('hourly-view-btn').classList.add('active');
        document.getElementById('daily-view-btn').classList.remove('active');
        showCards();
    };
    
    // Кнопки "Вперёд" и "Назад"
    document.getElementById('prev-btn').onclick = goPrev;
    document.getElementById('next-btn').onclick = goNext;
    
    // Поиск города
    let searchInput = document.getElementById('city-search');
    let searchBtn = document.getElementById('search-btn');
    
    searchBtn.onclick = function () {
        searchCities(searchInput.value);
    };
    
    // Поиск при нажатии Enter
    searchInput.onkeypress = function (e) {
        if (e.key === 'Enter') {
            searchCities(searchInput.value);
        }
    };
    
    // Поиск при вводе текста (живой поиск)
    searchInput.oninput = function () {
        searchCities(searchInput.value);
    };
    
    // Клик в любое место вне поиска — закрыть результаты
    document.onclick = function (e) {
        if (!e.target.closest('.search-box')) {
            hideResults();
        }
    };
    
    // Навигация с клавиатуры (стрелки влево/вправо)
    document.onkeydown = function (e) {
        if (e.key === 'ArrowLeft') {
            goPrev();
        } else if (e.key === 'ArrowRight') {
            goNext();
        }
    };
};