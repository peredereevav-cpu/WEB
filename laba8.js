// ==========================================
// ЗАДАЧА 1: ТАЙМЕРЫ
// ==========================================

// ----- 1.1 Простой счетчик -----

// Функция, которая считает от N до 0 раз в секунду
function counter(n) {
    // Находим на странице место, куда будем выводить числа
    let div = document.getElementById('simpleCounterOutput');
    
    // Очищаем это место (удаляем старый текст)
    div.innerHTML = '';
    
    // Добавляем класс для анимации (мигание)
    div.classList.add('updating');
    
    // Запоминаем, с какого числа начинаем
    let tekusheeChislo = n;
    
    // Показываем первое число
    div.innerHTML = 'Начали: ' + tekusheeChislo + '<br>';
    
    // Запускаем таймер, который срабатывает каждую секунду
    let timerId = setInterval(function() {
        // Уменьшаем число на 1
        tekusheeChislo = tekusheeChislo - 1;
        
        // Если число еще не меньше нуля - показываем его
        if (tekusheeChislo >= 0) {
            div.innerHTML = div.innerHTML + tekusheeChislo + '<br>';
        } else {
            // Если число стало -1, останавливаем таймер
            clearInterval(timerId);
            div.innerHTML = div.innerHTML + 'Всё! Счетчик закончил работу.';
            // Убираем анимацию
            div.classList.remove('updating');
        }
    }, 1000); // 1000 миллисекунд = 1 секунда
}

// Функция, которая вызывается при нажатии кнопки
function startSimpleCounter() {
    // Берем число из поля ввода
    let input = document.getElementById('counterInput');
    let n = Number(input.value); // Number() превращает текст в число
    
    // Проверяем, правильное ли число ввели
    if (isNaN(n) || n < 1) {
        alert('Пожалуйста, введите число больше 0');
        return; // Выходим из функции, если число плохое
    }
    
    // Запускаем счетчик
    counter(n);
}

// ----- 1.2 Управляемый счетчик -----

// Функция создает объект-счетчик с кнопками старт, пауза, стоп
function createCounter(n) {
    // Переменные, которые будут жить внутри объекта
    let tekusheeChislo = n; // Текущее число
    let timerId = null;     // ID таймера (null - значит таймер не запущен)
    
    // Находим место для вывода
    let div = document.getElementById('managedCounterOutput');
    
    // Функция для показа числа на экране
    function pokazatChislo() {
        div.innerHTML = div.innerHTML + tekusheeChislo + '<br>';
        // Прокручиваем вниз, чтобы видеть новое число
        div.scrollTop = div.scrollHeight;
    }
    
    // Создаем объект с тремя методами
    let schetchik = {
        // Метод start - запускает или продолжает счет
        start: function() {
            // Если таймер уже работает - ничего не делаем
            if (timerId !== null) {
                return;
            }
            
            // Включаем анимацию
            div.classList.add('updating');
            
            // Если это первый запуск - показываем стартовое сообщение
            if (tekusheeChislo === n) {
                div.innerHTML = 'Запустили счетчик:<br>';
                pokazatChislo();
            } else {
                // Если продолжаем после паузы
                div.innerHTML = div.innerHTML + 'Продолжаем счет:<br>';
                pokazatChislo();
            }
            
            // Запускаем таймер
            timerId = setInterval(function() {
                tekusheeChislo = tekusheeChislo - 1;
                
                if (tekusheeChislo >= 0) {
                    pokazatChislo();
                } else {
                    // Счет закончен
                    schetchik.stop();
                    div.innerHTML = div.innerHTML + 'Счетчик завершил работу!<br>';
                    div.classList.remove('updating');
                }
            }, 1000);
            
            // Обновляем кнопки: старт нельзя нажать, паузу и стоп можно
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('stopBtn').disabled = false;
        },
        
        // Метод pause - ставит на паузу
        pause: function() {
            // Если таймер не работает - ничего не делаем
            if (timerId === null) {
                return;
            }
            
            // Останавливаем таймер
            clearInterval(timerId);
            timerId = null;
            
            // Сообщаем о паузе
            div.innerHTML = div.innerHTML + 'Пауза!<br>';
            div.classList.remove('updating');
            
            // Обновляем кнопки: старт можно, паузу нельзя
            document.getElementById('startBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
        },
        
        // Метод stop - полностью останавливает и сбрасывает
        stop: function() {
            // Если таймер работает - останавливаем
            if (timerId !== null) {
                clearInterval(timerId);
                timerId = null;
            }
            
            // Сбрасываем число обратно на N
            tekusheeChislo = n;
            
            // Сообщаем об остановке
            div.innerHTML = div.innerHTML + 'Стоп! Счетчик сброшен.<br>';
            div.classList.remove('updating');
            
            // Обновляем кнопки: старт можно, остальные нельзя
            document.getElementById('startBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
            document.getElementById('stopBtn').disabled = true;
        }
    };
    
    // Возвращаем созданный объект
    return schetchik;
}

// Переменная, где будет храниться наш счетчик
let managedCounter = null;

// Функция, которая создает новый счетчик при нажатии кнопки
function initManagedCounter() {
    // Берем число из поля ввода
    let input = document.getElementById('managedCounterInput');
    let n = Number(input.value);
    
    // Проверка
    if (isNaN(n) || n < 1) {
        alert('Пожалуйста, введите число больше 0');
        return;
    }
    
    // Очищаем вывод
    document.getElementById('managedCounterOutput').innerHTML = '';
    
    // Создаем новый счетчик
    managedCounter = createCounter(n);
    
    // Настраиваем кнопки
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
}

// ==========================================
// ЗАДАЧА 2: ПРОМИСЫ
// ==========================================

// ----- 2.1 Функция задержки -----

// Функция, которая ждет N секунд и потом говорит "всё готово"
function delay(N) {
    // Создаем обещание (промис)
    let promise = new Promise(function(resolve) {
        // resolve - это функция, которую вызовем, когда время пройдет
        setTimeout(function() {
            resolve(); // Говорим: "Обещание выполнено!"
        }, N * 1000); // Умножаем на 1000, потому что setTimeout ждет миллисекунды
    });
    
    return promise;
}

// Функция для проверки работы delay
async function testDelay() {
    let div = document.getElementById('delayOutput');
    
    // Берем число из поля ввода
    let input = document.getElementById('delayInput');
    let N = Number(input.value);
    
    // Проверка
    if (isNaN(N) || N < 1) {
        div.innerHTML = '<span class="error">Введите число больше 0</span>';
        return;
    }
    
    // Показываем сообщение
    div.classList.add('updating');
    div.innerHTML = 'Ждем ' + N + ' секунд...<br>';
    
    // Запоминаем время начала
    let startTime = Date.now();
    
    // Ждем N секунд (программа здесь "засыпает")
    await delay(N);
    
    // Смотрим, сколько прошло времени
    let endTime = Date.now();
    let proshloSekund = (endTime - startTime) / 1000;
    
    // Показываем результат
    div.innerHTML = div.innerHTML + 'Готово! Прошло ' + proshloSekund + ' секунд.<br>';
    div.classList.remove('updating');
}

// ----- 2.2 Счетчик на промисах -----

// Считает от N до 0, используя delay
async function startPromiseCounter() {
    let div = document.getElementById('promiseCounterOutput');
    
    // Берем число
    let input = document.getElementById('promiseCounterInput');
    let n = Number(input.value);
    
    // Проверка
    if (isNaN(n) || n < 1) {
        div.innerHTML = '<span class="error">Введите число больше 0</span>';
        return;
    }
    
    // Начинаем счет
    div.classList.add('updating');
    div.innerHTML = 'Счетчик на промисах:<br>';
    
    // Цикл от N до 0
    for (let i = n; i >= 0; i = i - 1) {
        div.innerHTML = div.innerHTML + i + '<br>';
        
        // Ждем 1 секунду, но только если это не последнее число
        if (i > 0) {
            await delay(1);
        }
    }
    
    div.innerHTML = div.innerHTML + 'Счетчик завершен!';
    div.classList.remove('updating');
}

// ----- 2.3 Получение репозитория с GitHub -----

// Функция получает имя первого репозитория пользователя
async function getFirstRepo() {
    let div = document.getElementById('githubOutput');
    
    // Берем имя пользователя из поля ввода
    let input = document.getElementById('githubUsername');
    let username = input.value.trim(); // trim() убирает пробелы в начале и конце
    
    // Проверка
    if (username === '') {
        div.innerHTML = '<span class="error">Введите имя пользователя</span>';
        return;
    }
    
    // Показываем, что загружаем
    div.classList.add('updating');
    div.innerHTML = 'Ищем пользователя ' + username + '...<br>';
    
    try {
        // Первый запрос: получаем информацию о пользователе
        let userUrl = 'https://api.github.com/users/' + username;
        let userResponse = await fetch(userUrl);
        
        // Проверяем, успешно ли прошел запрос
        if (userResponse.ok === false) {
            throw new Error('Пользователь не найден (ошибка ' + userResponse.status + ')');
        }
        
        // Превращаем ответ в объект
        let userData = await userResponse.json();
        
        div.innerHTML = div.innerHTML + 'Пользователь найден: ' + userData.login + '<br>';
        div.innerHTML = div.innerHTML + 'Публичных репозиториев: ' + userData.public_repos + '<br>';
        
        // Второй запрос: получаем список репозиториев
        let reposResponse = await fetch(userData.repos_url);
        
        if (reposResponse.ok === false) {
            throw new Error('Не получилось загрузить репозитории');
        }
        
        let reposData = await reposResponse.json();
        
        // Проверяем, есть ли репозитории
        if (reposData.length > 0) {
            // Берем первый репозиторий
            let firstRepo = reposData[0];
            
            div.innerHTML = div.innerHTML + '<br>Первый репозиторий:<br>';
            div.innerHTML = div.innerHTML + 'Название: ' + firstRepo.name + '<br>';
            
            // Описание может быть пустым
            if (firstRepo.description) {
                div.innerHTML = div.innerHTML + 'Описание: ' + firstRepo.description + '<br>';
            } else {
                div.innerHTML = div.innerHTML + 'Описание: нет<br>';
            }
            
            div.innerHTML = div.innerHTML + 'Звезды: ' + firstRepo.stargazers_count + ' ⭐<br>';
        } else {
            div.innerHTML = div.innerHTML + 'У пользователя нет публичных репозиториев.<br>';
        }
        
        div.classList.add('success');
        
    } catch (error) {
        // Если что-то пошло не так
        div.innerHTML = div.innerHTML + '<span class="error">Ошибка: ' + error.message + '</span>';
    }
    
    div.classList.remove('updating');
}

// ==========================================
// ЗАДАЧА 3: ASYNC/AWAIT
// ==========================================

// Создаем свой класс ошибки для HTTP-запросов
class HttpError extends Error {
    constructor(response) {
        super('Ошибка ' + response.status + ' для ' + response.url);
        this.name = 'HttpError';
        this.response = response;
    }
}

// Функция загрузки JSON (переписанная с async/await)
async function loadJson(url) {
    // Делаем запрос
    let response = await fetch(url);
    
    // Проверяем статус ответа
    if (response.status === 200) {
        // Если всё хорошо, возвращаем данные
        let data = await response.json();
        return data;
    } else {
        // Если ошибка, создаем нашу специальную ошибку
        throw new HttpError(response);
    }
}

// Функция поиска пользователя GitHub (переписанная с циклом вместо рекурсии)
async function getGithubUserAsync() {
    let div = document.getElementById('asyncGithubOutput');
    let input = document.getElementById('asyncGithubUsername');
    
    div.classList.add('updating');
    div.innerHTML = '';
    
    let user = null;       // Найденный пользователь
    let attempts = 0;      // Количество попыток
    let maxAttempts = 3;   // Максимум попыток
    
    // Цикл: продолжаем, пока не нашли пользователя и не исчерпали попытки
    while (user === null && attempts < maxAttempts) {
        // Берем имя из поля ввода
        let name = input.value.trim();
        
        // Если имя пустое при первой попытке, используем имя по умолчанию
        if (name === '' && attempts === 0) {
            name = 'iliakan';
        }
        
        // Если имя все еще пустое
        if (name === '') {
            div.innerHTML = div.innerHTML + 'Нужно ввести имя пользователя<br>';
            break;
        }
        
        attempts = attempts + 1;
        div.innerHTML = div.innerHTML + 'Попытка ' + attempts + ': ищем "' + name + '"...<br>';
        
        try {
            // Пробуем загрузить данные пользователя
            user = await loadJson('https://api.github.com/users/' + name);
            
            // Если успешно - показываем результат
            div.innerHTML = div.innerHTML + 'Пользователь найден!<br>';
            div.innerHTML = div.innerHTML + 'Полное имя: ' + (user.name || 'не указано') + '<br>';
            div.innerHTML = div.innerHTML + 'Логин: ' + user.login + '<br>';
            div.innerHTML = div.innerHTML + 'Репозиториев: ' + user.public_repos + '<br>';
            
        } catch (err) {
            // Если ошибка
            if (err instanceof HttpError && err.response.status === 404) {
                // Пользователь не найден (ошибка 404)
                div.innerHTML = div.innerHTML + 'Такого пользователя нет.<br>';
                
                // Если остались попытки - спрашиваем новое имя
                if (attempts < maxAttempts) {
                    let newName = prompt('Пользователь не найден. Введите другое имя:');
                    
                    // Если нажали Отмена - выходим
                    if (newName === null) {
                        div.innerHTML = div.innerHTML + 'Поиск отменен.<br>';
                        break;
                    }
                    
                    // Обновляем поле ввода
                    input.value = newName;
                } else {
                    div.innerHTML = div.innerHTML + 'Попытки закончились.<br>';
                }
            } else {
                // Другая ошибка
                div.innerHTML = div.innerHTML + 'Ошибка: ' + err.message + '<br>';
                break;
            }
        }
    }
    
    div.classList.remove('updating');
}

// ==========================================
// ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ==========================================

// Эта функция выполнится, когда вся страница загрузится
document.addEventListener('DOMContentLoaded', function() {
    
    // Создаем счетчик с начальным значением из поля ввода
    initManagedCounter();
    
    // Находим все поля ввода на странице
    let allInputs = document.querySelectorAll('input');
    
    // Добавляем обработку нажатия Enter для каждого поля
    allInputs.forEach(function(input) {
        input.addEventListener('keypress', function(event) {
            // Если нажата клавиша Enter
            if (event.key === 'Enter') {
                // Ищем ближайшую кнопку и нажимаем её
                let section = input.closest('.subtask');
                let button = section.querySelector('button');
                if (button) {
                    button.click();
                }
            }
        });
    });
    
    // Выводим сообщение в консоль
    console.log('Лабораторная работа 8 готова!');
});