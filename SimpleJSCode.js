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
let defaultColor = "black";    // цвет по умолчанию
let defaultBg = "white";       // фон по умолчанию
let elementIndex = 0;          // индекс для внутренних операций
let autoSaveInterval = 30000;  // интервал автосохранения
let focusElement = null;       // текущий выделенный элемент
let enableShortcuts = true;    // включение горячих клавиш
let defaultFont = "Arial, sans-serif";  // шрифт по умолчанию
let defaultFontSize = 16;               // размер шрифта в px
let defaultLineHeight = 1.5;            // межстрочный интервал         // цвет текста по умолчанию
let defaultBackground = "#ffffff";      // фон по умолчанию
let defaultPadding = 10;                // отступы в px
let defaultMargin = 10;                 // внешние отступы
let defaultBorder = "1px solid #000";   // рамка по умолчанию
let defaultBorderRadius = 0;            // скругление по умолчанию
let defaultBoxShadow = "none";          // тень по умолчанию

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
// ====== Анимации ======
function animateElement(el, props, duration = 500, callback) {
    if (!el) return;
    const start = {};
    const end = {};

    for (const key in props) {
        start[key] = parseFloat(getComputedStyle(el)[key]) || 0;
        end[key] = parseFloat(props[key]);
    }

    const startTime = performance.now();

    function step(time) {
        let progress = Math.min((time - startTime) / duration, 1);
        for (const key in props) {
            const value = start[key] + (end[key] - start[key]) * progress;
            el.style[key] = value + "px";
        }
        if (progress < 1) requestAnimationFrame(step);
        else if (callback) callback();
    }

    requestAnimationFrame(step);
}

// ====== Простые методы для элементов ======
function grow(selector, width = null, height = null, duration = 500) {
    const el = getByIdOrClass(selector);
    if (!el) return;
    const props = {};
    if (width !== null) props.width = width;
    if (height !== null) props.height = height;
    animateElement(el, props, duration);
}
function S(selector) {
    const el = getByIdOrClass(selector);
    if (!el) return null;

    const obj = {
        grow: function(width = null, height = null, duration = 500) {
            animateElement(el, Object.assign(
                {},
                width !== null ? { width } : {},
                height !== null ? { height } : {}
            ), duration);
            return obj; // для цепочки
        },
        shrink: function(width = null, height = null, duration = 500) {
            animateElement(el, Object.assign(
                {},
                width !== null ? { width } : {},
                height !== null ? { height } : {}
            ), duration);
            return obj;
        },
        slideWidth: function(width, duration = 500) {
            return obj.grow(width, null, duration);
        },
        slideHeight: function(height, duration = 500) {
            return obj.grow(null, height, duration);
        },
        round: function(radius = 0, duration = 500) {
            const start = parseFloat(getComputedStyle(el).borderRadius) || 0;
            const end = parseFloat(radius);
            const startTime = performance.now();

            function step(time) {
                let progress = Math.min((time - startTime)/duration, 1);
                const value = start + (end - start) * progress;
                el.style.borderRadius = value + "px";
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
            return obj;
        },
        style: function(styles) {
            Object.assign(el.style, styles);
            return obj;
        }
    };

    return obj;
}
function createUniqueId(prefix="el") {
    elementIndex++;
    return prefix + "-" + elementIndex;
}

function getAll(tag) {
    return Array.from(document.getElementsByTagName(tag));
}

function getByClass(cls) {
    return Array.from(document.getElementsByClassName(cls));
}

function hide(id) {
    const el = find(id);
    if(el) el.style.display = "none";
}

function show(id) {
    const el = find(id);
    if(el) el.style.display = "";
}

function toggle(id) {
    const el = find(id);
    if(el) el.style.display = (el.style.display === "none") ? "" : "none";
}

function setText(id, text) {
    const el = find(id);
    if(el) el.textContent = text;
}

function clearText(id) {
    setText(id, "");
}
// применяет несколько стилей к элементу по id
function setStyle(id, styles) {
    const el = find(id);
    if(el) Object.assign(el.style, styles);
}

// применяет базовые стили по умолчанию
function applyDefaultStyle(id) {
    setStyle(id, {
        fontFamily: defaultFont,
        fontSize: defaultFontSize + "px",
        lineHeight: defaultLineHeight,
        color: defaultColor,
        backgroundColor: defaultBackground,
        padding: defaultPadding + "px",
        margin: defaultMargin + "px",
        border: defaultBorder,
        borderRadius: defaultBorderRadius + "px",
        boxShadow: defaultBoxShadow
    });
}
function S(selector) {
    const el = find(selector);
    if(!el) return null;

    return {
        setColor: function(color) {
            el.style.color = color;
            return this; // для цепочек
        },
        setBackground: function(color) {
            el.style.backgroundColor = color;
            return this;
        },
        setFontSize: function(px) {
            el.style.fontSize = px + "px";
            return this;
        },
        setBorderRadius: function(px) {
            el.style.borderRadius = px + "px";
            return this;
        }
        // можно добавить остальные функции стилей
    };
}
// ===== Функция для создания <img> с URL =====
function animateSize(element, targetWidth, targetHeight, duration) {
    const startWidth = element.offsetWidth;
    const startHeight = element.offsetHeight;
    const widthDiff = targetWidth - startWidth;
    const heightDiff = targetHeight - startHeight;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1); // от 0 до 1

        element.style.width = startWidth + widthDiff * progress + 'px';
        element.style.height = startHeight + heightDiff * progress + 'px';

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}
function heartbeat(el) {
    if (el._hbRunning) return; // уже запущен

    el._hbRunning = true;
    el._hbPaused = false;

    function beat() {
        if (!el._hbRunning) return;

        if (!el._hbPaused) {
            el.animate(
                [
                    { transform: "scale(1)" },
                    { transform: "scale(1.15)" },
                    { transform: "scale(1)" }
                ],
                {
                    duration: 300,
                    easing: "ease-in-out"
                }
            );
        }

        el._hbTimer = setTimeout(beat, 700);
    }

    beat();
}

function animateBorderRadius(element, targetRadius, duration) {
    const style = getComputedStyle(element);
    const startRadius = parseFloat(style.borderRadius) || 0;
    const radiusDiff = targetRadius - startRadius;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        element.style.borderRadius = startRadius + radiusDiff * progress + 'px';

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

// меняет цвет текста
function setColor(id, color) { setStyle(id, { color: color }); }

// меняет фон
function setBackground(id, color) { setStyle(id, { backgroundColor: color }); }

// меняет шрифт
function setFont(id, font) { setStyle(id, { fontFamily: font }); }

// меняет размер шрифта
function setFontSize(id, size) { setStyle(id, { fontSize: size + "px" }); }

// скругление
function setBorderRadius(id, radius) { setStyle(id, { borderRadius: radius + "px" }); }

// рамка
function setBorder(id, border) { setStyle(id, { border: border }); }

// тень
function setBoxShadow(id, shadow) { setStyle(id, { boxShadow: shadow }); }

// внутренние отступы
function setPadding(id, px) { setStyle(id, { padding: px + "px" }); }

// внешние отступы
function setMargin(id, px) { setStyle(id, { margin: px + "px" }); }

function focus(id) {
    const el = find(id);
    if(el) { el.focus(); focusElement = el; }
}

function blurFocus() {
    if(focusElement) { focusElement.blur(); focusElement = null; }
}

function shrink(selector, width = null, height = null, duration = 500) {
    const el = getByIdOrClass(selector);
    if (!el) return;
    const props = {};
    if (width !== null) props.width = width;
    if (height !== null) props.height = height;
    animateElement(el, props, duration);
}

function slideWidth(selector, width, duration = 500) {
    grow(selector, width, null, duration);
}

function slideHeight(selector, height, duration = 500) {
    grow(selector, null, height, duration);
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

function create(tag, text = "", parent = document.body, id = null) {
    ready(() => {
        const el = document.createElement(tag);
        el.textContent = text;
        el.id = id ?? "sj-" + (++elementCounter);
        parent.appendChild(el);
    });
}
function heartbeatDouble(el) {
    if (el._hbRunning) return;

    el._hbRunning = true;
    el._hbPaused = false;

    function beat() {
        if (!el._hbRunning) return;

        if (!el._hbPaused) {
            el.animate(
                [
                    { transform: "scale(1)" },
                    { transform: "scale(1.15)" },
                    { transform: "scale(1)" }
                ],
                { duration: 220 }
            );

            setTimeout(() => {
                if (el._hbPaused) return;
                el.animate(
                    [
                        { transform: "scale(1)" },
                        { transform: "scale(1.12)" },
                        { transform: "scale(1)" }
                    ],
                    { duration: 180 }
                );
            }, 260);
        }

        el._hbTimer = setTimeout(beat, 900);
    }

    beat();
}

function makeDraggable(el) {
    el.style.position = "absolute";
    el.style.cursor = "grab";

    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    el.addEventListener("mousedown", e => {
        dragging = true;
        el.style.cursor = "grabbing";

        // ⏸ пауза heartbeat
        el._hbPaused = true;

        offsetX = e.clientX - el.offsetLeft;
        offsetY = e.clientY - el.offsetTop;

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", stop);
    });

    function move(e) {
        if (!dragging) return;

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        // 📐 границы экрана
        const maxX = window.innerWidth  - el.offsetWidth;
        const maxY = window.innerHeight - el.offsetHeight;

        // 🔒 clamp
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));

        el.style.left = x + "px";
        el.style.top  = y + "px";
    }

    function stop() {
        dragging = false;
        el.style.cursor = "grab";

        // ▶ продолжаем heartbeat
        el._hbPaused = false;

        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", stop);
    }
}
function rainbowGlow(el, speed = 2) {
    if (el._rainbowGlowRunning) return;

    el._rainbowGlowRunning = true;
    el._rainbowGlowHue = 0;

    function loop() {
        if (!el._rainbowGlowRunning) return;

        el._rainbowGlowHue = (el._rainbowGlowHue + speed) % 360;

        el.style.color = `hsl(${el._rainbowGlowHue}, 100%, 50%)`;
        el.style.borderColor = `hsl(${el._rainbowGlowHue}, 100%, 50%)`;
        el.style.boxShadow =
            `0 0 12px hsl(${el._rainbowGlowHue}, 100%, 50%)`;

        requestAnimationFrame(loop);
    }

    loop();
}

function rainbowGlowStop(el) {
    el._rainbowGlowRunning = false;
}

function rainbow(el, speed = 1) {
    if (el._rainbowBgRunning) return;

    el._rainbowBgRunning = true;
    el._rainbowBgHue = 0;

    function loop() {
        if (!el._rainbowBgRunning) return;

        el._rainbowBgHue = (el._rainbowBgHue + speed) % 360;

        // 🌈 меняем фон
        el.style.backgroundColor = `hsl(${el._rainbowBgHue}, 100%, 50%)`;

        requestAnimationFrame(loop);
    }

    loop();
}

function rainbowStop(el) {
    el._rainbowBgRunning = false;
}
function rainbowGB(el, speed = 1, options = { text: true, bg: true, glow: true }) {
    if (el._rainbowSyncRunning) return;

    el._rainbowSyncRunning = true;
    el._rainbowHue = 0;

    function loop() {
        if (!el._rainbowSyncRunning) return;

        el._rainbowHue = (el._rainbowHue + speed) % 360;
        const color = `hsl(${el._rainbowHue}, 100%, 50%)`;

        if (options.bg) el.style.backgroundColor = color;
        if (options.text) el.style.color = color;
        if (options.glow) {
            el.style.borderColor = color;
            el.style.boxShadow = `0 0 12px ${color}`;
        }

        requestAnimationFrame(loop);
    }

    loop();
}

function rainbowGBStop(el) {
    el._rainbowSyncRunning = false;
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
