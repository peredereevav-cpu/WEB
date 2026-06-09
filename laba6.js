// --- Вспомогательные функции ---
const parseInput = (id) => JSON.parse(document.getElementById(id).value);
const display = (id, data) => {
    document.getElementById(id).innerText = typeof data === 'object' ? JSON.stringify(data) : data;
};

// ==========================================
// ЧАСТЬ 1. МАССИВЫ
// ==========================================

// 1.1 Максимальная разница (Max - Min)
function runMaxDiff() {
    try {
        const arr = parseInput('arr1_1');
        const diff = Math.max(...arr) - Math.min(...arr);
        display('res1_1', `Разница: ${diff}`);
    } catch (e) { display('res1_1', 'Ошибка ввода'); }
}

// 1.2 Массив без повторений
function runUniqueArr() {
    try {
        const arr = parseInput('arr1_2');
        display('res1_2', [...new Set(arr)]);
    } catch (e) { display('res1_2', 'Ошибка ввода'); }
}

// 1.3 Фильтр объектов (isDone: true)
function runFilterObjects() {
    try {
        const arr = parseInput('arr1_3');
        // Поддержка опечатки из ТЗ (idDone) и правильного варианта (isDone)
        const filtered = arr.filter(obj => obj.isDone === true || obj.idDone === true);
        display('res1_3', filtered);
    } catch (e) { display('res1_3', 'Ошибка формата JSON'); }
}

// 2.1 Элементы больше N
function runFilterGreater() {
    try {
        const arr = parseInput('arr2_1');
        const num = +document.getElementById('num2_1').value;
        display('res2_1', arr.filter(x => x > num));
    } catch (e) { display('res2_1', 'Ошибка ввода'); }
}

// 2.2 Плоский массив (любой вложенности)
function runFlatten() {
    try {
        const arr = parseInput('arr2_2');
        display('res2_2', arr.flat(Infinity));
    } catch (e) { display('res2_2', 'Ошибка ввода'); }
}

// 3.1 Пары, дающие в сумме 0 (непересекающиеся)
function runPairs() {
    try {
        let arr = parseInput('arr3');
        let count = 0;
        let used = new Array(arr.length).fill(false);

        for (let i = 0; i < arr.length; i++) {
            if (used[i]) continue;
            for (let j = i + 1; j < arr.length; j++) {
                if (!used[j] && arr[i] + arr[j] === 0) {
                    count++;
                    used[i] = true;
                    used[j] = true;
                    break; // Пара найдена, переходим к следующему i
                }
            }
        }
        display('res3', `Количество пар: ${count}`);
    } catch (e) { display('res3', 'Ошибка ввода'); }
}

// 3.2 Тройки, дающие в сумме 0 (непересекающиеся)
function runTriplets() {
    try {
        let arr = parseInput('arr3');
        let count = 0;
        let used = new Array(arr.length).fill(false);

        for (let i = 0; i < arr.length; i++) {
            if (used[i]) continue;
            for (let j = i + 1; j < arr.length; j++) {
                if (used[j]) continue;
                for (let k = j + 1; k < arr.length; k++) {
                    if (!used[k] && arr[i] + arr[j] + arr[k] === 0) {
                        count++;
                        used[i] = true;
                        used[j] = true;
                        used[k] = true;
                        break;
                    }
                }
                if (used[i]) break; // Если i использован в тройке, выходим из цикла j
            }
        }
        display('res3', `Количество троек: ${count}`);
    } catch (e) { display('res3', 'Ошибка ввода'); }
}


// ==========================================
// ЧАСТЬ 2. ГЕНЕРАТОРЫ, MAP, SET, MATH
// ==========================================

// --- Задание 1. Генераторы ---

// 1.1 Генератор случайных чисел в диапазоне (n, m)
function* randomGenObj(n, m) {
    while (true) {
        yield Math.floor(Math.random() * (m - n + 1)) + n;
    }
}
let randIterator = null;
function nextRandom() {
    const n = +document.getElementById('gen_n').value;
    const m = +document.getElementById('gen_m').value;
    if (!randIterator) randIterator = randomGenObj(n, m);
    document.getElementById('res_gen1').innerText = randIterator.next().value;
}

// 1.2 Генератор последовательности Падована (P(n) = P(n-2) + P(n-3))
function* padovanGenObj() {
    let p0 = 1, p1 = 1, p2 = 1;
    yield p0;
    yield p1;
    yield p2;
    while (true) {
        let next = p0 + p1;
        yield next;
        p0 = p1;
        p1 = p2;
        p2 = next;
    }
}
const padovanIterator = padovanGenObj();
function nextPadovan() {
    document.getElementById('res_gen2').innerText = padovanIterator.next().value;
}

// 1.3 Генератор простых чисел
function isPrimeSimple(num) {
    for (let i = 2; i * i <= num; i++) {
        if (num % i === 0) return false;
    }
    return num > 1;
}
function* primeGenObj() {
    let i = 2;
    while (true) {
        if (isPrimeSimple(i)) yield i;
        i++;
    }
}
const primeIterator = primeGenObj();
function nextPrimeGen() {
    document.getElementById('res_gen3').innerText = primeIterator.next().value;
}


// --- Задание 2. Map и BigInt ---

// 2.1 Подсчет вхождений букв (используя Map)
function runMapCount() {
    const str = document.getElementById('str_map').value;
    const map = new Map();
    
    for (let char of str) {
        if (char === ' ') continue; // Пропускаем пробелы для чистоты
        map.set(char, (map.get(char) || 0) + 1);
    }
    
    let result = '';
    for (let [key, value] of map) {
        result += `'${key}': ${value}\n`;
    }
    display('res_map', result || 'Пустая строка');
}

// 2.2 N-ное простое число с использованием BigInt
function isBigPrime(num) {
    for (let i = 2n; i * i <= num; i++) {
        if (num % i === 0n) return false;
    }
    return num > 1n;
}

function getPrime(n) {
    let count = 0;
    let curr = 1n; // Используем BigInt
    while (count < n) {
        curr++;
        if (isBigPrime(curr)) {
            count++;
        }
    }
    return curr;
}

function runGetPrimeBigInt() {
    const n = +document.getElementById('num_prime').value;
    if (n <= 0) {
        display('res_bigint', 'Введите число больше 0');
        return;
    }
    const primeBigInt = getPrime(n);
    display('res_bigint', `Простое число №${n}: ${primeBigInt.toString()}n`);
}
