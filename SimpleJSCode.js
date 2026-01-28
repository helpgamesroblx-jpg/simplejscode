/* =========================
   SIMPLEJS — mini framework
   ========================= */

/* ===== ПЕРЕМЕННЫЕ ===== */
let appStarted = false;
let elementCounter = 0;
let createdElements = [];
let defaultParent = null;

let debugEnabled = true;
let logs = [];
let maxLogs = 100;

let activeTimers = [];
let globalState = {};
let randomSeed = Math.random();

let systemElementsLoaded = false;
let mounted = false;
let themeName = "default";
let tickCount = 0;
let isPaused = false;

/* ===== СИСТЕМНЫЕ ЭЛЕМЕНТЫ ===== */
function loadSystem() {
    if (systemElementsLoaded) return;
    createdElements.push(
        document.documentElement, // html
        document.head,            // head
        document.body             // body
    );
    systemElementsLoaded = true;
}

/* ===== ОСНОВНЫЕ ФУНКЦИИ ===== */
function create(tag, text = "", parent = defaultParent) {
    if (!parent) parent = document.body;

    const el = document.createElement(tag);
    el.textContent = text;

    elementCounter++;
    el.id = "sj-" + elementCounter;

    parent.appendChild(el);
    createdElements.push(el);

    return el;
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
    console.log("[SimpleJS]", msg);
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
function ready(fn) {
    if (appStarted) fn();
    else document.addEventListener("DOMContentLoaded", fn);
}

/* ===== МОНТИРОВАНИЕ ===== */
function mount() {
    if (mounted) return;
    loadSystem();
    mounted = true;
    log("SimpleJS смонтирован");
}

/* ===== АВТОЗАПУСК ===== */
ready(() => {
    appStarted = true;
    defaultParent = document.body;

    mount();

    bg("#111");
    styleAll({
        fontFamily: "monospace",
        color: "#0f0",
        padding: "8px"
    });

    styleTag("h1", { fontSize: "36px" });
});
