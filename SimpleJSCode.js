/* =========================
   SIMPLEJS — mini framework
   ========================= */

/* ===== ПЕРЕМЕННЫЕ ===== */
let appStarted = false;
let elementCounter = 0;
let createdElements = [];
let defaultParent = null;
let idClassMap = {};        // связь id <-> class
let lastSelected = null;   // последний найденный элемент
let queryCount = 0;        // счётчик запросов
let cacheEnabled = true;   // кэширование
let elementCache = {};     // кэш элементов
let debugEnabled = true;
let logs = [];
let maxLogs = 100;
let activeTimers = [];
let globalState = {};
let randomSeed = Math.random();
let version = '2.0.0'
let systemElementsLoaded = false;
let mounted = false;
let themeName = "default";
let tickCount = 0;
let isPaused = false;
let baseTheme = {
    fontFamily: "Arial, sans-serif",
    background: "#ffffff",
    textColor: "#000000",
    fontSize: "16px"
};

// ===================== SIMPLEJS v1 =====================

document.addEventListener("DOMContentLoaded", () => {
    __isReady = true;
    __readyQueue.forEach(fn => fn());
    __readyQueue = [];
});

function ready(fn) {
    if (__isReady) fn();
    else __readyQueue.push(fn);
}

// ====== Тема ======

function applyTheme() {
    ready(() => {
        const body = document.body;
        if (!body) return;

        body.style.fontFamily = baseTheme.fontFamily;
        body.style.background = baseTheme.background;
        body.style.color = baseTheme.textColor;
        body.style.fontSize = baseTheme.fontSize;
    });
}

function Theme(settings = {}) {
    Object.assign(baseTheme, settings);
    applyTheme();
}

// ====== Готовые темы ======
Theme.dark = () => Theme({
    background: "#111",
    textColor: "#eee",
    fontFamily: "Verdana, sans-serif"
});

Theme.light = () => Theme({
    background: "#fff",
    textColor: "#000",
    fontFamily: "Arial, sans-serif"
});

Theme.auto = () => {
    const h = new Date().getHours();
    (h >= 19 || h < 7) ? Theme.dark() : Theme.light();
};

// Новые придуманные темы
Theme.sunset = () => Theme({
    background: "#FFB347",
    textColor: "#2C1E00",
    fontFamily: "Georgia, serif"
});

Theme.forest = () => Theme({
    background: "#2E8B57",
    textColor: "#F0FFF0",
    fontFamily: "Tahoma, sans-serif"
});

Theme.ocean = () => Theme({
    background: "#1E90FF",
    textColor: "#F0F8FF",
    fontFamily: "Helvetica, sans-serif"
});

// ====== Сохранение и загрузка темы ======
Theme.save = function() {
    try {
        localStorage.setItem("SimpleJSTheme", JSON.stringify(baseTheme));
        console.log("Тема сохранена ✅");
    } catch(e) {
        console.warn("Не удалось сохранить тему:", e);
    }
};

Theme.load = function() {
    try {
        const t = localStorage.getItem("SimpleJSTheme");
        if (t) {
            Theme(JSON.parse(t));
            console.log("Тема загружена ✅");
        }
    } catch(e) {
        console.warn("Не удалось загрузить тему:", e);
    }
};

function loadSystem() {
    if (systemElementsLoaded) return;
    createdElements.push(
        document.documentElement, // html
        document.head,            // head
        document.body             // body
    );
    systemElementsLoaded = true;
}
function linkIdClass(id, className) {
    idClassMap[id] = className;
    idClassMap[className] = id;
}

function getByIdOrClass(value) {
    queryCount++;

    if (cacheEnabled && elementCache[value]) {
        lastSelected = elementCache[value];
        return lastSelected;
    }

    let el = document.getElementById(value);
    if (!el) el = document.querySelector("." + value);

    if (el && cacheEnabled) elementCache[value] = el;
    lastSelected = el;
    return el;
}
function addClassById(id, className) {
    const el = document.getElementById(id);
    if (el) el.classList.add(className);
}
function setIdByClass(className, id) {
    const el = document.querySelector("." + className);
    if (el) el.id = id;
}
function toggleClass(value, className) {
    const el = getByIdOrClass(value);
    if (el) el.classList.toggle(className);
}
function styleBy(value, styles) {
    const el = getByIdOrClass(value);
    if (!el || !styles) return;

    for (const k in styles) {
        el.style[k] = styles[k];
    }
}
function css(el, styles) {
    if (!el) return;
    Object.assign(el.style, styles);
}
function S(selector) {
    let elements = [];

    if (selector.startsWith("#")) {
        const el = document.getElementById(selector.slice(1));
        if (el) elements = [el];
    } 
    else if (selector.startsWith(".")) {
        elements = Array.from(document.getElementsByClassName(selector.slice(1)));
    } 
    else {
        elements = Array.from(document.getElementsByTagName(selector));
    }

    return {
        els: elements,

        paint(styles) {
            this.els.forEach(el => {
                for (const k in styles) {
                    el.style[k] = styles[k];
                }
            });
            return this;
        },

        textSet(value) {
            this.els.forEach(el => el.textContent = value);
            return this;
        },

        add(cls) {
            this.els.forEach(el => el.classList.add(cls));
            return this;
        },

        remove(cls) {
            this.els.forEach(el => el.classList.remove(cls));
            return this;
        },

        onClick(fn) {
            this.els.forEach(el => el.addEventListener("click", fn));
            return this;
        },

        hideShow() {
            this.els.forEach(el => {
                el.style.display = el.style.display === "none" ? "" : "none";
            });
            return this;
        }
    };
}

function create(tag, text = "", parent = document.body, id = null) {
    ready(() => {
        const el = document.createElement(tag);
        el.textContent = text;
        el.id = id ?? "sj-" + (++elementCounter);
        parent.appendChild(el);
    });
}



function createMany(obj) {
    for (const tag in obj) {
        create(tag, obj[tag]);
    }
}

function remove(el) {
    if (!el) return;
    el.remove();
    createdElements = createdElements.filter(e => e !== el);
}

function clearAll() {
    createdElements.forEach(e => {
        if (e !== document.body && e !== document.head && e !== document.documentElement) {
            e.remove();
        }
    });
    createdElements = [];
}

/* ===== ПОИСК И СОБЫТИЯ ===== */
function find(id) {
    return document.getElementById(id);
}

function on(el, event, fn) {
    el.addEventListener(event, fn);
}

function once(el, event, fn) {
    const h = e => {
        fn(e);
        el.removeEventListener(event, h);
    };
    el.addEventListener(event, h);
}

/* ===== ТАЙМЕРЫ ===== */
function delay(fn, ms) {
    const t = setTimeout(fn, ms);
    activeTimers.push(t);
}

function every(fn, ms) {
    const t = setInterval(fn, ms);
    activeTimers.push(t);
}

function stopTimers() {
    activeTimers.forEach(t => clearTimeout(t));
    activeTimers = [];
}

/* ===== СТИЛИ ===== */
function styleAll(styles) {
    createdElements.forEach(el => Object.assign(el.style, styles));
}

function styleTag(tag, styles) {
    createdElements
        .filter(el => el.tagName.toLowerCase() === tag.toLowerCase())
        .forEach(el => Object.assign(el.style, styles));
}

function styleId(id, styles) {
    const el = document.getElementById(id);
    if (el) Object.assign(el.style, styles);
}

function css(el, styles) {
    if (el) Object.assign(el.style, styles);
}

/* ===== BODY / HTML ===== */
function bg(color) {
    document.body.style.backgroundColor = color;
}

/* ===== ТЕКСТ / HTML ===== */
function text(el, value) {
    if (el) el.textContent = value;
}

function html(el, value) {
    if (el) el.innerHTML = value;
}

/* ===== КЛАССЫ / АТРИБУТЫ ===== */
function addClass(el, cls) {
    if (el) el.classList.add(cls);
}

function removeClass(el, cls) {
    if (el) el.classList.remove(cls);
}

function attr(el, name, value) {
    if (el) el.setAttribute(name, value);
}

/* ===== УТИЛИТЫ ===== */
function log(msg) {
    if (!debugEnabled) return;
    logs.push(msg);
    if (logs.length > maxLogs) logs.shift();
    console.log("[SimpleJS]", version, msg);
}

function random() {
    randomSeed = (randomSeed * 16807) % 2147483647;
    return randomSeed / 2147483647;
}

function setState(key, value) {
    globalState[key] = value;
}

function getState(key) {
    return globalState[key];
}

/* ===== ТИК / LOOP ===== */
function tick() {
    if (isPaused) return;
    tickCount++;
}

function loop(fn) {
    function frame() {
        if (!isPaused) fn();
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

/* ===== ГОТОВНОСТЬ ===== */

/* ===== МОНТИРОВАНИЕ ===== */
function mount() {
    if (mounted) return;
    loadSystem();
    mounted = true;
    log("SimpleJS mounted");
}

/* ===== АВТОЗАПУСК ===== */
let __readyQueue = [];
let __isReady = false;

document.addEventListener("DOMContentLoaded", () => {
    __isReady = true;
    __readyQueue.forEach(fn => fn());
    __readyQueue = [];
});

function ready(fn) {
    if (__isReady) fn();
    else __readyQueue.push(fn);
}
