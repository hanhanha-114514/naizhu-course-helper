(() => {
  "use strict";

  const DEFAULTS = {
    sitePattern: "",
    siteUrl: "",
    timerSelector: "#spTitle",
    playerSelector: "",
    targetTime: "",
    nextSelector: ""
  };

  const HOST_ID = "site-test-kit-host";
  const PANEL_CSS = `
    :host {
      all: initial;
      position: fixed;
      inset: 0 auto auto 0;
      width: 0;
      height: 0;
      z-index: 2147483645;

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    .panel {
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: min(328px, calc(100vw - 24px));
      overflow: hidden;
      border: 1px solid rgba(220, 180, 190, 0.2);
      border-radius: 16px;
      color: #5a4a50;
      background:
        radial-gradient(120% 100% at 100% 0%, rgba(240, 210, 220, 0.15), transparent 58%),
        linear-gradient(155deg, rgba(255, 245, 248, 0.95), rgba(250, 240, 245, 0.97));
      box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.08),
        0 0 40px rgba(220, 180, 190, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      font-family: "Segoe UI Variable", "Segoe UI", "Microsoft YaHei UI", "Microsoft YaHei", sans-serif;
      font-size: 11px;
      -webkit-font-smoothing: antialiased;
      backdrop-filter: blur(20px) saturate(1.2);
      -webkit-backdrop-filter: blur(20px) saturate(1.2);
      animation: stk-in 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
      transition: width 180ms ease;
    }

    .panel::before {
      content: "";
      position: absolute;
      top: 0;
      left: 24px;
      right: 24px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(220, 180, 190, 0.4), transparent);
      pointer-events: none;
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px 8px;
      cursor: grab;
      user-select: none;
      touch-action: none;
    }

    .head:active {
      cursor: grabbing;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .logo {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      flex: 0 0 28px;
      border: 1px solid rgba(220, 180, 190, 0.3);
      border-radius: 9px;
      color: #8a6a72;
      background: linear-gradient(160deg, #f8e0e8, #f0d0d8);
      box-shadow: 0 2px 8px rgba(220, 180, 190, 0.15);
    }

    .logo svg {
      display: block;
      width: 18px;
      height: 18px;
    }

    .brand strong {
      display: block;
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.3px;
      line-height: 1.1;
      color: #6a5058;
    }

    .brand small {
      display: block;
      margin-top: 3px;
      color: #a08890;
      font-family: "Cascadia Mono", "Consolas", monospace;
      font-size: 7px;
      letter-spacing: 1px;
    }

    .head-actions {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #d4a0b0;
      box-shadow: 0 0 0 4px rgba(212, 160, 176, 0.1), 0 0 6px rgba(212, 160, 176, 0.3);
      animation: stk-pulse 2.2s ease-in-out infinite;
    }

    .collapse {
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      padding: 0;
      border: 1px solid rgba(180, 150, 160, 0.2);
      border-radius: 7px;
      color: #a08890;
      background: rgba(255, 255, 255, 0.6);
      font-family: inherit;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
    }

    .collapse:hover {
      color: #6a5058;
      border-color: rgba(212, 160, 176, 0.35);
      background: rgba(248, 224, 232, 0.5);
    }

    /* Tab Navigation */
    .tabs {
      display: flex;
      gap: 2px;
      padding: 0 10px;
      margin-bottom: 6px;
    }

    .tab-btn {
      flex: 1;
      padding: 6px 4px;
      border: 1px solid rgba(220, 180, 190, 0.12);
      border-radius: 8px 8px 0 0;
      border-bottom: none;
      color: #a08890;
      background: rgba(248, 224, 232, 0.2);
      font-family: inherit;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: all 160ms ease;
      text-align: center;
    }

    .tab-btn:hover {
      color: #6a5058;
      background: rgba(248, 224, 232, 0.4);
    }

    .tab-btn.active {
      color: #c08090;
      background: rgba(248, 224, 232, 0.5);
      border-color: rgba(220, 180, 190, 0.25);
    }

    .tab-content {
      display: none;
      padding: 0 10px 10px;
    }

    .tab-content.active {
      display: block;
    }

    .body {
      padding: 0 10px 10px;
    }

    .origin {
      overflow: hidden;
      margin-bottom: 8px;
      color: #a08890;
      font-family: "Cascadia Mono", "Consolas", monospace;
      font-size: 8px;
      line-height: 1.4;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .progress-row {
      display: grid;
      gap: 5px;
      margin-top: 6px;
      padding: 7px 9px;
      border: 1px solid rgba(220, 180, 190, 0.12);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(8px);
    }

    .progress-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .progress-label > span {
      color: #a08890;
      font-size: 8px;
      letter-spacing: 0.1px;
    }

    .progress-label > em {
      color: #6a5058;
      font-family: "Cascadia Mono", "Consolas", monospace;
      font-size: 9px;
      font-style: normal;
      font-weight: 600;
    }

    .progress-bar {
      height: 5px;
      border-radius: 3px;
      background: rgba(220, 180, 190, 0.15);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 3px;
      background: linear-gradient(90deg, #e8b0c0, #f0c8d4);
      transition: width 400ms ease;
      min-width: 0;
      box-shadow: 0 0 6px rgba(232, 176, 192, 0.3);
    }

    .cell {
      min-width: 0;
      padding: 8px 9px;
      border: 1px solid rgba(220, 180, 190, 0.12);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(8px);
    }

    .cell span {
      display: block;
      color: #a08890;
      font-size: 8px;
      letter-spacing: 0.1px;
    }

    .cell strong {
      display: block;
      overflow: hidden;
      margin-top: 4px;
      color: #6a5058;
      font-family: "Cascadia Mono", "Consolas", monospace;
      font-size: 10px;
      font-weight: 600;
      line-height: 1.25;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cell strong.wrap {
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
      line-height: 1.4;
      word-break: break-all;
    }

    .cell strong.ok {
      color: #88c8a0;
    }

    .cell strong.warn {
      color: #d4a860;
    }

    .cell strong.muted {
      color: #a08890;
      font-weight: 500;
    }

    .detail {
      overflow: hidden;
      margin-top: 7px;
      padding: 7px 8px;
      border: 1px solid rgba(220, 180, 190, 0.1);
      border-radius: 8px;
      color: #a08890;
      background: rgba(255, 255, 255, 0.4);
      font-family: "Cascadia Mono", "Consolas", monospace;
      font-size: 8px;
      line-height: 1.5;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Log tab styles */
    .log-container {
      max-height: 220px;
      overflow-y: auto;
      scrollbar-color: rgba(220, 180, 190, 0.3) transparent;
      scrollbar-width: thin;
    }

    .log {
      display: grid;
      grid-template-columns: 48px 1fr;
      gap: 2px;
      margin: 0;
      padding: 2px 1px;
      list-style: none;
    }

    .log li {
      display: grid;
      grid-template-columns: 48px 1fr;
      gap: 6px;
      padding: 4px 6px;
      border-radius: 6px;
      color: #8a7078;
      font-size: 8.5px;
      line-height: 1.4;
    }

    .log li:nth-child(odd) {
      background: rgba(248, 224, 232, 0.15);
    }

    .log time {
      color: #b0989e;
      font-family: "Cascadia Mono", "Consolas", monospace;
      font-size: 7px;
      white-space: nowrap;
    }

    .log li span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .log-empty {
      color: #b0989e !important;
      font-style: normal;
    }

    .log-actions {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 6px;
      margin-top: 8px;
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 6px;
      margin-top: 8px;
    }

    .actions button,
    .log-actions button {
      padding: 6px 8px;
      border: 1px solid rgba(220, 180, 190, 0.2);
      border-radius: 8px;
      color: #8a6a72;
      background: rgba(255, 255, 255, 0.6);
      font-family: inherit;
      font-size: 8.5px;
      cursor: pointer;
      transition: 160ms ease;
      backdrop-filter: blur(4px);
    }

    .actions button:hover,
    .log-actions button:hover {
      border-color: rgba(220, 180, 190, 0.35);
      color: #6a5058;
      background: rgba(248, 224, 232, 0.5);
    }

    .volume-ctrl {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      padding: 7px 9px;
      border: 1px solid rgba(220, 180, 190, 0.12);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(8px);
    }

    .volume-ctrl span {
      flex: 0 0 auto;
      color: #a08890;
      font-size: 8px;
      letter-spacing: 0.1px;
    }

    .volume-ctrl input[type="range"] {
      flex: 1;
      min-width: 0;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(220, 180, 190, 0.2);
      border-radius: 2px;
      outline: none;
      cursor: pointer;
    }

    .volume-ctrl input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #d4a0b0;
      border: none;
      box-shadow: 0 0 4px rgba(212, 160, 176, 0.4);
      cursor: pointer;
    }

    .volume-ctrl input[type="range"]::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #d4a0b0;
      border: none;
      box-shadow: 0 0 4px rgba(212, 160, 176, 0.4);
      cursor: pointer;
    }

    .volume-ctrl input[type="range"]:disabled {
      opacity: 0.3;
      cursor: default;
    }

    .volume-ctrl em {
      flex: 0 0 30px;
      text-align: right;
      color: #6a5058;
      font-family: "Cascadia Mono", "Consolas", monospace;
      font-size: 9px;
      font-style: normal;
      font-weight: 600;
    }

    .mute-btn {
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      padding: 0;
      border: 1px solid rgba(220, 180, 190, 0.2);
      border-radius: 6px;
      color: #a08890;
      background: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition: 160ms ease;
    }

    .mute-btn:hover {
      color: #6a5058;
      border-color: rgba(220, 180, 190, 0.35);
      background: rgba(248, 224, 232, 0.5);
    }

    .mute-btn.muted {
      color: #d4a860;
      border-color: rgba(212, 168, 96, 0.3);
      background: rgba(255, 240, 200, 0.4);
    }

    .mute-btn:disabled {
      opacity: 0.3;
      cursor: default;
    }

    .mute-btn svg {
      width: 13px;
      height: 13px;
      display: block;
    }

    .mute-btn .mute-x {
      display: none;
    }

    .mute-btn .mute-waves {
      display: "";
    }

    .mute-btn.muted .mute-x {
      display: "";
    }

    .mute-btn.muted .mute-waves {
      display: none;
    }

    /* About page styles */
    .about-section {
      padding: 4px 0;
    }

    .about-card {
      padding: 10px 12px;
      border: 1px solid rgba(220, 180, 190, 0.15);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(8px);
      margin-bottom: 8px;
    }

    .about-card h3 {
      margin: 0 0 6px;
      font-size: 10px;
      font-weight: 700;
      color: #c08090;
      letter-spacing: 0.5px;
    }

    .about-card p {
      margin: 0;
      font-size: 9px;
      line-height: 1.6;
      color: #8a7078;
    }

    .about-features {
      list-style: none;
      margin: 6px 0 0;
      padding: 0;
    }

    .about-features li {
      padding: 3px 0;
      font-size: 8.5px;
      color: #8a7078;
      line-height: 1.5;
    }

    .about-features li::before {
      content: "~ ";
      color: #d4a0b0;
      font-weight: bold;
    }

    .about-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border: 1px solid rgba(220, 180, 190, 0.1);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.4);
    }

    .about-meta span {
      font-size: 8px;
      color: #a08890;
      font-family: "Cascadia Mono", "Consolas", monospace;
    }

    .about-meta strong {
      font-size: 9px;
      color: #c08090;
      font-weight: 600;
    }

    .aa-field {
      display: grid;
      gap: 4px;
      margin-bottom: 10px;
    }

    .aa-field span {
      font-size: 9px;
      color: #8a7078;
      font-weight: 600;
    }

    .aa-field input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid rgba(220, 180, 190, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.6);
      color: #5a4a50;
      font-size: 10px;
      font-family: "Cascadia Mono", "Consolas", monospace;
      outline: none;
      transition: border-color 150ms ease, box-shadow 150ms ease;
    }

    .aa-field input:focus {
      border-color: #d4a0b0;
      box-shadow: 0 0 0 3px rgba(212, 160, 176, 0.15);
    }

    .aa-field input::placeholder {
      color: #b0989e;
    }

    .aa-toggle {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 12px 0;
      font-size: 10px;
      color: #5a4a50;
    }

    .aa-switch {
      position: relative;
      display: inline-block;
      width: 36px;
      height: 20px;
      flex-shrink: 0;
    }

    .aa-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .aa-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: rgba(180, 160, 165, 0.3);
      border-radius: 20px;
      transition: 200ms ease;
    }

    .aa-slider::before {
      content: "";
      position: absolute;
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: 200ms ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }

    .aa-switch input:checked + .aa-slider {
      background: linear-gradient(135deg, #e8b0c0, #d4a0b0);
    }

    .aa-switch input:checked + .aa-slider::before {
      transform: translateX(16px);
    }

    .aa-save-btn {
      width: 100%;
      padding: 10px;
      border: 1px solid rgba(212, 160, 176, 0.4);
      border-radius: 8px;
      background: linear-gradient(135deg, #f8e0e8, #f0d0d8);
      color: #6a4a55;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms ease;
      margin-top: 5px;
    }

    .aa-save-btn:hover {
      background: linear-gradient(135deg, #f0d0d8, #e8c0cc);
      box-shadow: 0 4px 12px rgba(212, 160, 176, 0.25);
    }

    .aa-save-btn:active {
      transform: translateY(1px);
    }

    .aa-preset-btn {
      width: 100%;
      padding: 8px;
      margin-top: 8px;
      border: 1px dashed rgba(103, 194, 255, 0.4);
      border-radius: 8px;
      background: rgba(103, 194, 255, 0.08);
      color: #4a90d9;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .aa-preset-btn:hover {
      background: rgba(103, 194, 255, 0.15);
      border-color: rgba(103, 194, 255, 0.6);
    }

    .aa-preset-btn:active {
      transform: translateY(1px);
    }

    .aa-status {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: 1px solid rgba(220, 180, 190, 0.15);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.4);
      font-size: 9px;
      color: #8a7078;
    }

    .aa-status strong {
      color: #d4a0b0;
      font-weight: 600;
    }

    .aa-status strong.active {
      color: #76b580;
    }

    .foot {
      margin-top: 7px;
      color: #b0989e;
      font-size: 7.5px;
      line-height: 1.4;
      text-align: center;
    }

    .panel.collapsed {
      width: min(232px, calc(100vw - 24px));
    }

    .panel.collapsed .body,
    .panel.collapsed .tabs,
    .panel.collapsed .tab-content {
      display: none;
    }

    .panel.collapsed .head {
      padding-bottom: 10px;
    }

    @media (max-width: 700px) {
      .panel {
        right: 12px;
        bottom: 12px;
      }
    }

    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 280px;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid rgba(220, 180, 190, 0.25);
      background: linear-gradient(155deg, rgba(255, 245, 248, 0.97), rgba(250, 240, 245, 0.98));
      color: #5a4a50;
      font-size: 11px;
      line-height: 1.5;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 15px rgba(220, 180, 190, 0.08);
      backdrop-filter: blur(20px) saturate(1.2);
      -webkit-backdrop-filter: blur(20px) saturate(1.2);
      z-index: 2147483647;
      animation: stk-toast-in 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
      transition: opacity 300ms ease;
    }

    .toast.fade-out {
      opacity: 0;
    }

    .toast strong {
      display: block;
      font-size: 12px;
      margin-bottom: 4px;
      color: #c08090;
    }

    @keyframes stk-toast-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes stk-in {
      from {
        opacity: 0;
        transform: translateY(9px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes stk-pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.45;
      }
    }
  `;

  let config = { ...DEFAULTS };
  let panelHost = null;
  let panel = null;
  let refs = {};
  let pollTimer = null;
  let logCount = 0;
  let destroyed = false;
  let lastPlayerError = "";
  let dragState = null;
  const watchedPlayers = new WeakSet();
  const controller = new AbortController();
  let lastKnownMuted = false;
  let lastTimerSource = "";
  const isTopFrame = window.top === window;
  const frameId =
    window.name ||
    `${location.pathname}#${Math.random().toString(36).slice(2, 8)}`;
  const frameStates = new Map();
  const knownFrames = new Set();
  const knownFramePlayers = new Set();
  let _pendingVolume = -1;
  let _pendingVolumeTimer = null;

  function formatTime(seconds) {
    const total = Number(seconds);
    if (!Number.isFinite(total) || total < 0) {
      return "—";
    }

    const whole = Math.floor(total);
    const h = Math.floor(whole / 3600);
    const m = Math.floor((whole % 3600) / 60);
    const s = whole % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  function setCell(node, text, tone = "") {
    if (!node) {
      return;
    }
    node.textContent = text;
    node.title = text;
    node.classList.remove("ok", "warn", "muted");
    if (tone) {
      node.classList.add(tone);
    }
  }

  function log(message) {
    if (!refs.log || destroyed) {
      return;
    }

    logCount += 1;
    refs.log.querySelector(".log-empty")?.remove();
    const item = document.createElement("li");
    const time = document.createElement("time");
    time.textContent = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    const text = document.createElement("span");
    text.textContent = String(message).slice(0, 140);
    item.append(time, text);
    refs.log.prepend(item);

    while (refs.log.children.length > 50) {
      refs.log.lastElementChild?.remove();
    }

    if (refs.logCount) {
      refs.logCount.textContent = String(logCount);
    }
  }

  function showToast(title, message, duration = 5000) {
    if (!isTopFrame || !panelHost) return;
    const shadow = panelHost.shadowRoot;
    const existing = shadow.querySelector(".toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
    shadow.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  let _autoStartDone = false;
  let _startButtonObserver = null;
  
  function autoStartLearning() {
    if (!isTopFrame || _autoStartDone) return;

    // 5 秒倒计时提醒后自动开始学习
    let remaining = 5;
    showToast("自动学习", `${remaining} 秒后自动开始学习…`);
    const countdown = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        showToast("自动学习", `${remaining} 秒后自动开始学习…`);
        return;
      }
      clearInterval(countdown);
      tryAutoStart(0);
    }, 1000);
  }

  function tryAutoStart(attempt) {
    if (_autoStartDone) return;
    if (doAutoStart()) return;
    if (attempt >= 30) {
      log("自动学习：重试 30 次仍未成功，放弃");
      showToast("自动学习", "自动开始学习失败");
      return;
    }
    setTimeout(() => tryAutoStart(attempt + 1), 1000);
  }

  function doAutoStart() {
    const mainIframe = document.getElementById("mainIframe");
    if (!mainIframe) {
      log("自动学习：未找到 mainIframe，1 秒后重试");
      return false;
    }

    try {
      const doc = mainIframe.contentDocument;
      if (!doc) {
        log("自动学习：无法访问 mainIframe 内容，1 秒后重试");
        return false;
      }

      // 查找第一个未完成的课程
      const found = findUnfinishedChapterLink(doc);
      if (found) {
        _autoStartDone = true;
        _lastAutoAdvance = Date.now();
        enterChapter(found, "自动开始学习");
        return true;
      }

      // 当前页没有未完成章节：尝试翻页后继续查找
      if (tryPaginateForChapter(doc)) {
        _autoStartDone = true;
        return true;
      }

      log("自动学习：本页无可学习课程，且未找到翻页控件");
      return false;
    } catch (err) {
      log("自动学习失败：" + err.message);
      return false;
    }
  }

  function isMediaElement(el) {
    if (!el) return false;
    // 跨 iframe 时 instanceof HTMLMediaElement 会失败，用 tagName 判断
    const tag = el.tagName ? el.tagName.toUpperCase() : "";
    return tag === "VIDEO" || tag === "AUDIO";
  }

  function findPlayerInDoc(doc) {
    const selector = String(config.playerSelector || "").trim();
    if (selector) {
      try {
        let found = doc.querySelector(selector);
        if (found && !isMediaElement(found)) {
          found = found.querySelector("video, audio");
        }
        if (isMediaElement(found)) return found;
      } catch {}
    }
    const found = doc.querySelector("video, audio");
    if (isMediaElement(found)) return found;
    // 穿透 Shadow DOM 查找（新版播放器可能将 video 放在 shadow root 内）
    return findPlayerInShadow(doc.body || doc.documentElement, 0);
  }

  function findPlayerInShadow(root, depth) {
    if (!root || depth > 12) return null;
    const all = root.querySelectorAll("*");
    for (const el of all) {
      if (el.shadowRoot) {
        const media = el.shadowRoot.querySelector("video, audio");
        if (isMediaElement(media)) return media;
        const nested = findPlayerInShadow(el.shadowRoot, depth + 1);
        if (nested) return nested;
      }
    }
    return null;
  }

  // 播放器诊断日志每个轮询周期都会跑一遍，只在结论变化时输出，否则 50 条日志缓冲区会被刷满
  const _diagSeen = new Map();
  function diagOnce(message) {
    const now = Date.now();
    const last = _diagSeen.get(message);
    // 同一条消息最多 15 秒一次，避免两条消息互相顶掉导致刷屏
    if (last && now - last < 15000) return;
    _diagSeen.set(message, now);
    if (_diagSeen.size > 24) {
      const oldest = _diagSeen.keys().next().value;
      _diagSeen.delete(oldest);
    }
    log(message);
  }

  function resolvePlayer() {
    const topPlayer = findPlayerInDoc(document);
    if (topPlayer) {
      diagOnce('播放器：顶层文档找到');
      return { player: topPlayer, invalid: false };
    }

    // 特殊处理 ExamView iframe（动态创建的学习页面）
    const examView = document.getElementById('ExamView');
    if (examView) {
      try {
        const examDoc = examView.contentDocument;
        if (examDoc) {
          // 先检查 J_prismPlayer 容器
          const prismPlayer = examDoc.getElementById('J_prismPlayer');
          if (prismPlayer) {
            const video = prismPlayer.querySelector('video, audio');
            if (isMediaElement(video)) {
              diagOnce(`播放器：ExamView J_prismPlayer 内 video 就绪`);
              return { player: video, invalid: false };
            }
          }

          const examPlayer = findPlayerInDoc(examDoc);
          if (examPlayer) {
            diagOnce('播放器：ExamView iframe 文档级找到');
            return { player: examPlayer, invalid: false };
          }
          diagOnce(
            `播放器：ExamView 无播放器 url=${examDoc.URL} ` +
            `video数=${examDoc.querySelectorAll('video, audio').length} ` +
            `J_prismPlayer=${prismPlayer ? '存在' : '不存在'}`
          );
        } else {
          diagOnce('播放器：ExamView 无 contentDocument');
        }
      } catch (e) {
        diagOnce('播放器：ExamView 访问失败 - ' + e.message);
      }
    } else {
      diagOnce('播放器：ExamView iframe 不存在');
    }

    // 搜索所有 iframe
    function searchIframes(rootDoc) {
      const iframes = rootDoc.querySelectorAll("iframe");
      for (const iframe of iframes) {
        try {
          const iframeDoc = iframe.contentDocument;
          if (!iframeDoc) continue;
          const player = findPlayerInDoc(iframeDoc);
          if (player) return player;
          const nested = searchIframes(iframeDoc);
          if (nested) return nested;
        } catch {}
      }
      return null;
    }

    const iframePlayer = searchIframes(document);
    if (iframePlayer) {
      diagOnce('播放器：其他 iframe 找到');
    }
    return {
      player: iframePlayer,
      invalid: false
    };
  }

  // 轮询 ExamView iframe 中的视频
  function pollExamViewPlayer() {
    const examView = document.getElementById('ExamView');
    if (!examView) {
      diagOnce('轮询：ExamView 不存在');
      setTimeout(pollExamViewPlayer, 1000);
      return;
    }

    try {
      const examDoc = examView.contentDocument;
      if (!examDoc) {
        diagOnce('轮询：ExamView 无 contentDocument');
        setTimeout(pollExamViewPlayer, 1000);
        return;
      }

      const prismPlayer = examDoc.getElementById('J_prismPlayer');
      if (prismPlayer) {
        const video = prismPlayer.querySelector('video, audio');
        if (isMediaElement(video)) {
          diagOnce('轮询：找到播放器（J_prismPlayer）');
          update();
          // 继续轮询以监控播放器状态变化
          setTimeout(pollExamViewPlayer, 2000);
          return;
        }
      }

      const video = examDoc.querySelector('video, audio');
      if (isMediaElement(video)) {
        diagOnce('轮询：找到播放器（文档级）');
        update();
        setTimeout(pollExamViewPlayer, 2000);
        return;
      }

      diagOnce(
        `轮询：ExamView 暂无播放器 url=${examDoc.URL} ` +
        `video数=${examDoc.querySelectorAll('video, audio').length} ` +
        `J_prismPlayer=${prismPlayer ? '存在' : '不存在'}`
      );
    } catch (e) {
      diagOnce('轮询 ExamView 失败：' + e.message);
    }

    setTimeout(pollExamViewPlayer, 1000);
  }

  // 监听动态添加的 video 元素
  function setupVideoObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'VIDEO' || node.nodeName === 'AUDIO') {
            log('检测到新播放器元素');
            setTimeout(update, 100);
            return;
          }
          if (node.querySelectorAll) {
            const media = node.querySelectorAll('video, audio');
            if (media.length > 0) {
              log('检测到新播放器容器');
              setTimeout(update, 100);
              return;
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // 监听 ExamView iframe 的加载
    const examViewObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'IFRAME' && node.id === 'ExamView') {
            log('检测到 ExamView iframe 创建');
            // 等待 iframe 加载完成后检查视频
            node.addEventListener('load', () => {
              log('ExamView iframe 加载完成');
              setTimeout(update, 500);
            });
          }
        }
      }
    });
    examViewObserver.observe(document.body, { childList: true, subtree: true });
    
    return observer;
  }

  function findTimerTextInDoc(doc) {
    const all = doc.querySelectorAll("span, div, td, p, label, font, b, strong, em");
    for (const el of all) {
      const t = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (t.includes("累计") && /分.*秒/.test(t)) {
        return t.slice(0, 80);
      }
    }
    return null;
  }

  function resolveTimer() {
    let selector = String(config.timerSelector || "").trim();
    if (!selector) selector = "#spTitle";

    try {
      let node = document.querySelector(selector);
      if (!node) {
        const iframes = document.querySelectorAll("iframe");
        for (const iframe of iframes) {
          try {
            node = iframe.contentDocument?.querySelector(selector);
            if (node) break;
          } catch {}
        }
      }
      if (node) {
        const raw =
          node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement
            ? node.value
            : node.textContent;
        const text = String(raw || "").replace(/\s+/g, " ").trim();
        if (text) return { text: text.slice(0, 80), tone: "ok" };
      }

      let found = findTimerTextInDoc(document);
      if (!found) {
        const iframes = document.querySelectorAll("iframe");
        for (const iframe of iframes) {
          try {
            found = findTimerTextInDoc(iframe.contentDocument);
            if (found) break;
          } catch {}
        }
      }
      if (found) return { text: found, tone: "ok" };

      return { text: "未找到", tone: "warn" };
    } catch {
      return { text: "选择器无效", tone: "warn" };
    }
  }

  function formatTimerTwoLines(text) {
    const statuses = ["未设置", "未找到", "选择器无效", "（空）"];
    if (statuses.includes(text)) return text;
    const idx = text.indexOf(",");
    if (idx > 0) {
      const line1 = text.slice(0, idx).trim();
      const line2 = text.slice(idx + 1).trim();
      return `${line1}<br>${line2}`;
    }
    const idx2 = text.indexOf("，");
    if (idx2 > 0) {
      const line1 = text.slice(0, idx2).trim();
      const line2 = text.slice(idx2 + 1).trim();
      return `${line1}<br>${line2}`;
    }
    return text;
  }

  function parseCumulativeMinutes(timerText) {
    const match = String(timerText || "").match(/累计\s*(\d+)\s*分\s*(\d+)\s*秒/);
    if (!match) return 0;
    return parseInt(match[1], 10) + parseInt(match[2], 10) / 60;
  }

  function extractMinutes(text) {
    const t = (text || "").trim();
    let m = t.match(/(\d+)\s*分钟/);
    if (m) return parseInt(m[1], 10);
    m = t.match(/(\d+)\s*分/);
    if (m) return parseInt(m[1], 10);
    m = t.match(/学时\s*[：:]*\s*(\d+)/);
    if (m) return parseInt(m[1], 10);
    m = t.match(/(\d+)\s*min/i);
    if (m) return parseInt(m[1], 10);
    return 0;
  }

  function getCourseListTimes() {
    if (!isTopFrame) return { required: 0, completed: 0 };
    try {
      const mainIframe = document.getElementById("mainIframe");
      if (!mainIframe?.contentDocument) return { required: 0, completed: 0 };
      const doc = mainIframe.contentDocument;
      const chapterTitle = readChapterTitle();
      const playingId = currentStudyId();
      const allRows = Array.from(doc.querySelectorAll("tr"));
      for (const row of allRows) {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) continue;
        const link = row.querySelector('a[onclick*="showframe"]');
        const rowId = link ? parseStudyLink(link).id : "";
        const name = (cells[0].textContent || "").trim();
        const rowText = (row.textContent || "").replace(/\s+/g, " ");
        // 播放器打开时按课程 Id 精确命中当前章节行
        const matched = playingId
          ? rowId === playingId
          : (!!chapterTitle && (normName(name) === normName(chapterTitle) || rowText.includes(chapterTitle)));
        if (matched) {
          let required = 0, completed = 0;
          for (let i = 1; i < cells.length; i++) {
            const mins = extractMinutes(cells[i].textContent);
            if (mins > 0) {
              if (!required) required = mins;
              else if (!completed) { completed = mins; break; }
            }
          }
          if (required > 0 || completed > 0) return { required, completed };
        }
      }
    } catch {}
    return { required: 0, completed: 0 };
  }

  function getRequiredMinutes() {
    const times = getCourseListTimes();
    if (times.required > 0) return times.required;
    for (const [, frame] of frameStates) {
      if (frame && typeof frame.requiredTime === "number" && frame.requiredTime > 0) {
        return frame.requiredTime;
      }
    }
    return 0;
  }

  function getCompletedMinutes() {
    const times = getCourseListTimes();
    if (times.completed > 0) return times.completed;
    for (const [, frame] of frameStates) {
      if (frame && typeof frame.completedTime === "number" && frame.completedTime > 0) {
        return frame.completedTime;
      }
    }
    return 0;
  }

  let _lastLoggedRequired = -1;

  function updateProgress(cumulativeMin) {
    if (!refs.progressText || !refs.progressFill) return;
    let required = getRequiredMinutes();
    if (required <= 0) {
      for (const [, frame] of frameStates) {
        if (frame && typeof frame.requiredTime === "number" && frame.requiredTime > 0) {
          required = frame.requiredTime;
          break;
        }
      }
    }
    if (required > 0 && required !== _lastLoggedRequired) {
      _lastLoggedRequired = required;
      log(`目标学时：${required} 分钟`);
    }
    const completedMin = getCompletedMinutes();
    const totalDone = completedMin + cumulativeMin;
    const cumMin = Math.floor(cumulativeMin);
    const cumSec = Math.round((cumulativeMin - cumMin) * 60);
    const cumStr = `${cumMin}分${cumSec}秒`;
    if (required <= 0) {
      refs.progressText.textContent = completedMin > 0
        ? `已完成 ${completedMin}分 + 本次 ${cumStr}`
        : `已学 ${cumStr}`;
      refs.progressFill.style.width = "0%";
      return;
    }
    const pct = Math.min(100, Math.round((totalDone / required) * 100));
    if (completedMin > 0) {
      refs.progressText.textContent = `已完成 ${completedMin}分 + 本次 ${cumStr} / 要求 ${required}分钟 (${pct}%)`;
    } else {
      refs.progressText.textContent = `${cumStr} / ${required}分钟 (${pct}%)`;
    }
    refs.progressFill.style.width = `${pct}%`;
  }

  let _lastAutoAdvance = 0;
  let _lastAdvancedChapter = "";
  let _allCoursesCompleted = false;
  // 本地记录已学完的章节名（归一化），避免依赖服务器状态刷新导致循环播放
  const _completedChapters = new Set();
  // 同上，用课程 Id 记录（比名称更可靠）
  const _completedIds = new Set();
  // 当前插件自己点进去的章节，用作对话框标题读不到时的兜底排除项
  let _activeChapter = "";
  // 翻页后等待加载的标志
  let _awaitingPageLoad = false;
  // iframe 播放器发现的限流（Aliplayer 初始化时通知会密集到达）
  let _lastPlayerFoundPath = "";
  let _lastPlayerFoundAt = 0;

  // 章节名归一化：去掉所有空白，便于对话框标题与列表单元格文本比对
  function normName(text) {
    return (text || "").replace(/\s+/g, "");
  }

  // 播放器/考试弹窗容器 #viewBox 是 MainPage.aspx 里的常驻节点（初始 display:none），
  // showframe 只是改标题+src 并显示它。所以绝对不能再 remove 它——删掉之后
  // 整站的"开始学习/课后练习"弹窗都打不开，只能刷新页面才能恢复。
  function isDialogOpen() {
    try {
      const box = document.getElementById("viewBox");
      if (!box) return false;
      return getComputedStyle(box).display !== "none";
    } catch {
      return false;
    }
  }

  // 章节标题只在弹窗真正打开时才有意义：容器常驻且默认文本是"考试详情"
  function readChapterTitle() {
    if (!isDialogOpen()) return "";
    try {
      const span = document.getElementById("spanTitle");
      const t = span ? (span.textContent || "").trim() : "";
      if (t && t !== "考试详情") return t;
      const el = document.querySelector("#easyDialogTitle");
      const d = el ? (el.textContent || "").trim() : "";
      return d === "考试详情" ? "" : d;
    } catch {}
    return "";
  }

  // 真正关闭播放器对话框（触发服务器记录学时并更新状态）
  // panel.js 在 ISOLATED world，取不到页面的 closeView / easyDialog，
  // 必须点击站点自己的关闭链接（href="javascript:closeView();easyDialog.close();"）
  function closePlayerDialog() {
    try {
      const btn = document.querySelector(
        '#easyDialogTitle a.fright, #easyDialogTitle a[href*="closeView"], ' +
        '#viewBox a[href*="close"], #viewBox a.fright'
      );
      if (btn) {
        btn.click();
        // 确认对话框是否真的被站点关掉
        const left = document.getElementById("viewBox");
        if (!left || left.style.display === "none" || !left.querySelector("#ExamView")) return true;
      } else {
        log("关闭播放器：未找到对话框关闭链接（学时可能未上报）");
      }
    } catch {}

    // 绝对不要 remove #viewBox —— 它是 MainPage.aspx 里的常驻静态节点，
    // 删掉之后整站的"开始学习/课后练习"弹窗全都打不开，只能刷新页面恢复。
    return false;
  }

  // 从 showframe('章节名', Id) 里取出章节名与课程 Id
  function parseStudyLink(link) {
    const oc = link.getAttribute("onclick") || "";
    const m = oc.match(/showframe\(\s*['"]([^'"]*)['"]\s*,\s*(\d+)/i);
    if (m) return { name: m[1].trim(), id: m[2] };
    return { name: "", id: "" };
  }

  // 当前播放器 iframe 对应的课程 Id，用于精确排除"正在学/刚学完"的章节
  function currentStudyId() {
    try {
      if (!isDialogOpen()) return "";
      const frame = document.getElementById("ExamView") || document.querySelector('iframe[name="ExamView"]');
      const src = frame ? (frame.getAttribute("src") || frame.src || "") : "";
      const m = src.match(/[?&]Id=(\d+)/i);
      if (m) return m[1];
    } catch {}
    return "";
  }

  // 正在播放章节的排除快照（务必在关闭播放器之前取）
  function activeChapterSnapshot() {
    return {
      title: normName(readChapterTitle()),
      active: normName(_activeChapter),
      id: currentStudyId()
    };
  }

  // 在课程列表文档中查找第一个未完成章节
  // 服务器要等播放器关闭后才更新"已完成学时"，所以正在播放的章节按 Id/标题/本地记录三重排除
  function findUnfinishedChapterLink(doc, snap) {
    const s = snap || activeChapterSnapshot();
    const allRows = Array.from(doc.querySelectorAll("tr"));
    for (const row of allRows) {
      const rowText = (row.textContent || "").replace(/\s+/g, " ");
      if (rowText.includes("已完成") || rowText.includes("已学完")) continue;
      if (!rowText.includes("未学习") && !rowText.includes("学习中")) continue;
      const link = row.querySelector('a[onclick*="showframe"]');
      if (!link || (link.textContent || "").trim() !== "开始学习") continue;

      const parsed = parseStudyLink(link);
      if (s.id && parsed.id === s.id) continue;
      if (parsed.id && _completedIds.has(parsed.id)) continue;
      const cells = row.querySelectorAll("td");
      const name = parsed.name || (cells[0] && cells[0].textContent || "").trim();
      const key = normName(name);
      if (key && (key === s.title || key === s.active || _completedChapters.has(key))) continue;
      return { link, name, id: parsed.id };
    }
    return null;
  }

  // 章节播放器是否真的打开了（用课程 Id 校验，避免点了没反应却以为切换成功）
  function chapterOpened(found) {
    try {
      const box = document.getElementById("viewBox");
      if (!box || getComputedStyle(box).display === "none") return false;
      if (!document.getElementById("ExamView")) return false;
      if (found && found.id) return currentStudyId() === found.id;
      return true;
    } catch {
      return false;
    }
  }

  // 取章节链接（iframe 重载后原引用会失效，按 Id/名称重新找一次）
  function chapterLinkOf(found) {
    try {
      if (found.link && found.link.isConnected) return found.link;
      const doc = document.getElementById("mainIframe")?.contentDocument;
      if (!doc) return null;
      for (const link of Array.from(doc.querySelectorAll('a[onclick*="showframe"]'))) {
        const p = parseStudyLink(link);
        if ((found.id && p.id === found.id) || (found.name && p.name === found.name)) return link;
      }
    } catch {}
    return null;
  }

  // 点击"开始学习"并确认播放器打开；站点的弹窗复用偶尔吞掉点击，所以带重试
  function confirmChapterOpen(found, tries) {
    if (chapterOpened(found)) return;
    if (tries <= 0) {
      log(`进入「${found.name || "章节"}」失败，请手动点一次"开始学习"`);
      showToast("自动切换", "章节未能打开，请手动点开始学习");
      return;
    }
    const link = chapterLinkOf(found);
    log(`播放器未打开，重试进入「${found.name || "章节"}」`);
    if (link) {
      try { link.click(); } catch {}
    }
    setTimeout(() => confirmChapterOpen(found, tries - 1), 2500);
  }

  function enterChapter(found, note) {
    _activeChapter = found.name;
    _lastAdvancedChapter = found.name;
    const prefix = note ? `${note}，` : "";
    log(`${prefix}自动切换至：${found.name || "下一章"}`);
    showToast("自动切换", `${prefix}正在进入「${found.name || "下一章"}」`);
    const link = chapterLinkOf(found);
    if (link) { try { link.click(); } catch {} }
    setTimeout(() => confirmChapterOpen(found, 3), 2500);
  }

  // 课程列表是否已加载出章节（postback 期间 iframe 文档可能是 about:blank）
  function listReady(doc) {
    try {
      return !!doc && doc.querySelectorAll('a[onclick*="showframe"]').length > 0;
    } catch {
      return false;
    }
  }

  // ASP.NET 翻页兜底：内容脚本点 javascript: 链接不一定被放行，
  // 直接按 __doPostBack 的做法写 __EVENTTARGET 再提交表单
  function aspPostBack(doc, link) {
    try {
      const attr = `${link.getAttribute("href") || ""}${link.getAttribute("onclick") || ""}`;
      const m = attr.match(/__doPostBack\(\s*['"]([^'"]+)['"]/i);
      if (!m) return false;
      const form = doc.getElementById("form1") || doc.forms && doc.forms[0];
      const et = doc.querySelector("input[name='__EVENTTARGET']");
      if (!form || !et) return false;
      et.value = m[1];
      const ea = doc.querySelector("input[name='__EVENTARGUMENT']");
      if (ea) ea.value = "";
      form.submit();
      return true;
    } catch {
      return false;
    }
  }

  // 翻到下一页。内容脚本点 javascript:__doPostBack 链接不会生效（实测），
  // 所以优先按 __doPostBack 的方式写 __EVENTTARGET 并提交表单，点击只作兜底
  function goNextPage(doc) {
    const link = findNextPageLink(doc);
    if (!link) return false;
    if (aspPostBack(doc, link)) return true;
    try {
      link.click();
      return true;
    } catch {
      return false;
    }
  }

  // 翻页后轮询等待新页加载，再查找未完成章节并点击
  // prevSignature：翻页前列表指纹；attempts：已发起的翻页次数
  // 关键：列表没加载好或仍是同一页时，绝不能判定成"全部完成"
  function advanceAfterPageLoad(retries, prevSignature, attempts) {
    const mainIframe = document.getElementById("mainIframe");
    const doc = mainIframe && mainIframe.contentDocument;
    const ready = listReady(doc);
    const signature = ready ? listSignature(doc) : "";
    const unchanged = ready && !!prevSignature && signature === prevSignature;

    if (!ready || unchanged) {
      if (retries > 0) {
        if (unchanged && attempts < 3) {
          attempts += 1;
          log(`翻页后列表未变化，再次翻页（第 ${attempts} 次）`);
          goNextPage(doc);
        }
        setTimeout(() => advanceAfterPageLoad(retries - 1, prevSignature, attempts), 1000);
        return;
      }
      _awaitingPageLoad = false;
      if (unchanged) {
        log("多次翻页后列表仍未变化，可能已经是最后一页");
        showToast("翻页", "翻页未生效，可能已到最后一页");
      } else {
        log("翻页后课程列表一直未加载完成");
        showToast("翻页", "课程列表加载超时，稍后再试");
      }
      return;
    }

    const found = findUnfinishedChapterLink(doc);
    if (found) {
      _awaitingPageLoad = false;
      closePlayerDialog();
      setTimeout(() => enterChapter(found, "翻页后"), 700);
      return;
    }

    // 新页也没有未完成章节：继续翻下一页
    if (retries > 0 && goNextPage(doc)) {
      log("本页课程已完成，继续翻下一页");
      showToast("翻页", "正在切换到下一页");
      setTimeout(() => advanceAfterPageLoad(10, signature, 1), 1000);
      return;
    }
    _awaitingPageLoad = false;
    showAllCompletedDialog();
  }

  // 当前页没有未完成章节时翻页；返回是否已安排翻页
  function tryPaginateForChapter(doc) {
    const signature = listSignature(doc);
    if (!goNextPage(doc)) return false;
    _awaitingPageLoad = true;
    showToast("翻页", "当前页课程已完成，正在切换到下一页");
    log("当前页无未完成章节，发起翻页并等待加载");
    setTimeout(() => advanceAfterPageLoad(10, signature, 1), 1000);
    return true;
  }

  function nextPageTextOk(text) {
    const t = (text || "").trim();
    if (!t) return false;
    if (t.length > 12) return false;
    return /下一页|下页|下一章|后一页|下\s*页|next|›|》|>/i.test(t);
  }

  // 查找"下一页"控件：本平台用 ASP.NET 分页（__doPostBack('PageSplit1$BtnNext','')）
  function findNextPageLink(doc) {
    const candidates = Array.from(
      doc.querySelectorAll('a, input[type="submit"], input[type="button"], button, span[onclick], td[onclick]')
    );

    // 第一遍：属性里带 Next 的控件（最可靠，与显示文案无关）
    for (const el of candidates) {
      const attr = `${el.getAttribute("href") || ""}${el.getAttribute("onclick") || ""}` +
                   `${el.id || ""}${el.name || ""}${el.getAttribute("name") || ""}`;
      if (!/next/i.test(attr)) continue;
      const text = (el.textContent || el.value || "").trim();
      if (!text || nextPageTextOk(text)) return el;
    }

    // 第二遍：按可见文案匹配
    for (const el of candidates) {
      if (nextPageTextOk((el.textContent || el.value || "").trim())) return el;
    }

    return null;
  }

  // 列表内容指纹，用于确认翻页是否真的生效
  function listSignature(doc) {
    try {
      return Array.from(doc.querySelectorAll("tr")).slice(0, 8)
        .map(row => (row.textContent || "").replace(/\s+/g, ""))
        .join("|")
        .slice(0, 500);
    } catch {
      return "";
    }
  }

  function showAllCompletedDialog() {
    if (_allCoursesCompleted) return;
    _allCoursesCompleted = true;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      backdrop-filter: blur(8px);
      animation: stk-in 300ms ease;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: linear-gradient(135deg, #fdf8fa, #faf5f7);
      border: 2px solid rgba(212, 160, 176, 0.3);
      border-radius: 16px;
      padding: 32px 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2), 0 0 40px rgba(212, 160, 176, 0.1);
      text-align: center;
      max-width: 400px;
      font-family: "Segoe UI Variable", "Segoe UI", "Microsoft YaHei UI", "Microsoft YaHei", sans-serif;
    `;

    dialog.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
      <h2 style="margin: 0 0 12px; color: #6a5058; font-size: 20px; font-weight: 700;">恭喜！所有课程学习完成</h2>
      <p style="margin: 0 0 24px; color: #8a7078; font-size: 14px; line-height: 1.6;">
        奶猪水课助手已帮你完成全部章节的学习任务。<br>
        现在可以休息啦！
      </p>
      <button id="stkAllDoneBtn" style="
        padding: 10px 32px;
        border: 1px solid rgba(212, 160, 176, 0.3);
        border-radius: 8px;
        background: linear-gradient(180deg, #f8e0e8, #f0d0d8);
        color: #6a5058;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(212, 160, 176, 0.2);
        transition: all 200ms ease;
      ">知道了</button>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const btn = dialog.querySelector('#stkAllDoneBtn');
    btn.addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 300ms ease';
      setTimeout(() => overlay.remove(), 300);
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 6px 16px rgba(212, 160, 176, 0.3)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 4px 12px rgba(212, 160, 176, 0.2)';
    });

    log('所有课程学习完成！');
  }

  function checkAutoAdvance(timerText) {
    if (!isTopFrame) return;
    const now = Date.now();

    const cumulativeMin = parseCumulativeMinutes(timerText);
    const required = getRequiredMinutes();
    const completed = getCompletedMinutes();
    const totalDone = completed + cumulativeMin;

    // 当前正在播放的章节名（easyDialog 标题在顶层文档）
    const currentChapter = readChapterTitle();

    // 没有真正打开学习章节（ExamView 的 Id 拿不到）时不做切换判断：
    // 否则会读到列表里的旧数据把进度误判成"已学完"，从而连续跳章直到翻页
    if (!currentStudyId()) return;

    // Reset cooldown if we've switched to a different chapter
    if (currentChapter && normName(currentChapter) !== normName(_lastAdvancedChapter)) {
      _lastAutoAdvance = 0;
      _lastAdvancedChapter = currentChapter;
    }

    if (now - _lastAutoAdvance < 15000) return;

    let shouldAdvance = false;
    let reason = "";

    if (required > 0 && totalDone >= required) {
      shouldAdvance = true;
      reason = `进度已达 ${Math.round(totalDone)}/${required} 分钟`;
    } else {
      const target = parseFloat(config.targetTime);
      if (target && target > 0 && cumulativeMin >= target) {
        shouldAdvance = true;
        reason = `累计学时已达 ${cumulativeMin.toFixed(1)} 分钟`;
      }
    }

    if (!shouldAdvance) return;
    if (_awaitingPageLoad) return;

    _lastAutoAdvance = now;

    // 关键：把当前章节记入本地已学完集合，避免再次点击导致循环
    // 服务器要等播放器关闭后才刷新状态，所以排除快照必须在关闭之前取
    const snap = activeChapterSnapshot();
    if (currentChapter) {
      _completedChapters.add(normName(currentChapter));
      _lastAdvancedChapter = currentChapter;
    }
    if (_activeChapter) _completedChapters.add(normName(_activeChapter));
    if (snap.id) _completedIds.add(snap.id);

    const mainIframe = document.getElementById("mainIframe");
    if (!mainIframe?.contentDocument) {
      log(`自动切换：${reason}，但未找到课程列表`);
      return;
    }

    try {
      const iframeDoc = mainIframe.contentDocument;

      // 真正关闭播放器对话框，触发服务器记录学时并更新状态
      closePlayerDialog();

      // 给站点 0.7 秒走完关闭流程再选下一章：
      // 紧接着点击会被站点吞掉（播放器没打开，之前就是这么一路空跳到最后一页的）
      setTimeout(() => {
        const found = findUnfinishedChapterLink(iframeDoc, snap);
        if (found) {
          enterChapter(found, reason);
        } else if (tryPaginateForChapter(iframeDoc)) {
          log(`${reason}，当前页章节已全部完成，等待翻页结果`);
        } else {
          log(`${reason}，当前页无未完成章节且找不到翻页控件`);
          showAllCompletedDialog();
        }
      }, 700);
    } catch (e) {
      log("自动切换失败：" + (e.message || e));
    }
  }

  function collectFrameState() {
    const resolved = resolvePlayer();
    const player = resolved.player;
    const timer = resolveTimer();
    const courseTimes = getCourseListTimes();

    return {
      frameId,
      path: `${location.pathname}${location.search}`,
      title: document.title,
      visibility: document.visibilityState,
      timer: timer.text,
      timerTone: timer.tone,
      requiredTime: courseTimes.required,
      completedTime: courseTimes.completed,
      playerInvalid: resolved.invalid,
      player: player
        ? {
            tagName: player.tagName.toLowerCase(),
            paused: player.paused,
            currentTime: player.currentTime,
            duration: player.duration,
            volume: getEffectiveVolume(player),
            muted: isPlayerMuted(player),
            readyState: player.readyState
          }
        : null,
      updatedAt: Date.now()
    };
  }

  function postFrameState() {
    if (isTopFrame || destroyed) {
      return;
    }

    try {
      window.top.postMessage(
        {
          source: "site-test-kit-frame",
          type: "state",
          state: collectFrameState()
        },
        "*"
      );
    } catch {
      // 跨域 top 或页面正在卸载时忽略。
    }
  }

  function attachFramePlayer(player) {
    if (!player || watchedPlayers.has(player)) {
      return;
    }

    watchedPlayers.add(player);
    const options = { passive: true, signal: controller.signal };

    for (const type of ["play", "pause", "volumechange", "ended", "loadedmetadata"]) {
      player.addEventListener(type, postFrameState, options);
    }
  }

  function freshFrames() {
    const now = Date.now();
    const frames = [];

    for (const [id, frame] of frameStates) {
      if (!frame || now - (Number(frame.updatedAt) || 0) > 5000) {
        frameStates.delete(id);
        knownFrames.delete(id);
        knownFramePlayers.delete(id);
        continue;
      }
      frames.push(frame);
    }

    return frames;
  }

  function frameWithPlayer(frames) {
    return frames.find((frame) => frame.player) || null;
  }

  function frameWithTimer(frames) {
    return (
      frames.find(
        (frame) =>
          frame.timer &&
          !["未设置", "未找到", "选择器无效", "（空）"].includes(frame.timer)
      ) || null
    );
  }

  function attachPlayer(player) {
    if (!player || watchedPlayers.has(player)) {
      return;
    }

    watchedPlayers.add(player);
    const options = { passive: true, signal: controller.signal };

    player.addEventListener(
      "play",
      () => {
        log("播放器事件：play");
        update();
      },
      options
    );
    player.addEventListener(
      "pause",
      () => {
        log("播放器事件：pause");
        update();
      },
      options
    );
    player.addEventListener(
      "volumechange",
      () => {
        log(`播放器事件：volumechange · ${Math.round(getEffectiveVolume(player) * 100)}%${isPlayerMuted(player) ? " · 静音" : ""}`);
        update();
      },
      options
    );
    player.addEventListener(
      "ended",
      () => {
        log("播放器事件：ended");
        update();
      },
      options
    );
    player.addEventListener(
      "loadedmetadata",
      () => {
        log("播放器事件：loadedmetadata");
        update();
      },
      options
    );
  }

  function getEffectiveVolume(player) {
    return player.volume;
  }

  function isPlayerMuted(player) {
    return lastKnownMuted;
  }

  function requestVolume(player, value) {
    document.dispatchEvent(
      new CustomEvent("site-test-kit:volume-change", {
        detail: { volume: value }
      })
    );
  }

  function update() {
    try {
    if (destroyed || !panel) {
      return;
    }

    const frames = freshFrames();
    const local = resolvePlayer();
    const remoteFrame =
      !local.player && !local.invalid && frames.length
        ? frameWithPlayer(frames)
        : null;
    const player = local.player || remoteFrame?.player || null;
    const playerFromFrame = Boolean(!local.player && remoteFrame);

    if (local.invalid) {
      setCell(refs.player, "选择器无效", "warn");
      setCell(refs.volume, "—", "muted");
      if (refs.volumeSlider) {
        refs.volumeSlider.disabled = true;
      }
      if (refs.muteBtn) {
        refs.muteBtn.disabled = true;
      }
      if (refs.volumeValue) {
        refs.volumeValue.textContent = "—";
      }
      if (refs.detail) {
        refs.detail.textContent = "播放器选择器语法无效，请检查后重新保存。";
      }
      if (lastPlayerError !== "invalid") {
        lastPlayerError = "invalid";
        log("播放器选择器无效");
      }
    } else if (!player) {
      setCell(refs.player, "未找到", "warn");
      setCell(refs.volume, "—", "muted");
      if (refs.volumeSlider) {
        refs.volumeSlider.disabled = true;
      }
      if (refs.muteBtn) {
        refs.muteBtn.disabled = true;
      }
      if (refs.volumeValue) {
        refs.volumeValue.textContent = "—";
      }
      if (refs.detail) {
        refs.detail.textContent = frames.length
          ? `已检测到 ${frames.length} 个同源 iframe，但其中没有找到播放器。`
          : "页面中没有找到匹配的 video / audio 元素。";
      }
      if (lastPlayerError !== "missing") {
        lastPlayerError = "missing";
        log(frames.length ? "iframe 中未找到播放器元素" : "未找到播放器元素");
      }
    } else {
      if (local.player) {
        attachPlayer(local.player);
        if (!local.player.__stkInitialized) {
          local.player.__stkInitialized = true;
          local.player.__stkVolume = 0;
          requestVolume(local.player, 0);
          log("播放器默认音量已设为 0%");
        }
      }
      lastPlayerError = "";
      const tag = player.tagName.toLowerCase();
      setCell(
        refs.player,
        playerFromFrame
          ? `iframe · ${player.paused ? "已暂停" : "播放中"}`
          : `${tag} · ${player.paused ? "已暂停" : "播放中"}`,
        player.paused ? "warn" : "ok"
      );
      const volPct = Math.round(getEffectiveVolume(player) * 100);
      const muted = isPlayerMuted(player);
      setCell(
        refs.volume,
        `${volPct}%${muted ? " · 静音" : ""}`,
        muted ? "warn" : "ok"
      );
      if (refs.volumeSlider) {
        refs.volumeSlider.disabled = false;
        if (_pendingVolume < 0) {
          refs.volumeSlider.value = String(volPct);
        }
      }
      if (refs.muteBtn) {
        refs.muteBtn.disabled = false;
        refs.muteBtn.classList.toggle("muted", muted);
        refs.muteBtn.title = muted ? "取消静音" : "一键静音";
        refs.muteBtn.setAttribute("aria-label", refs.muteBtn.title);
      }
      if (refs.volumeValue) {
        refs.volumeValue.textContent = `${volPct}%${muted ? " MUTE" : ""}`;
      }
      if (refs.detail) {
        const originText = playerFromFrame ? `iframe ${remoteFrame.path}` : "本页";
        refs.detail.textContent =
          `${originText} · ${tag} · ${formatTime(player.currentTime)} / ${formatTime(player.duration)}` +
          ` · readyState ${player.readyState}${muted ? " · muted" : ""}`;
      }
    }

    setCell(
      refs.visibility,
      document.visibilityState,
      document.hidden ? "warn" : "ok"
    );

    let timer = resolveTimer();
    let timerFrame = null;

    if (
      frames.length &&
      (timer.text === "未设置" || timer.text === "未找到" || timer.text === "选择器无效")
    ) {
      const frame = frameWithTimer(frames);
      if (frame) {
        timer = { text: frame.timer, tone: frame.timerTone || "ok" };
        timerFrame = frame;
        if (lastTimerSource !== "iframe") {
          lastTimerSource = "iframe";
          log(`计时器来自 iframe ${frame.path}`);
        }
      }
    }

    setCell(refs.timer, "", timer.tone);
    if (refs.timer) {
      refs.timer.innerHTML = formatTimerTwoLines(timer.text);
      refs.timer.title = timer.text;
    }
    if (timerFrame && refs.timer) {
      refs.timer.title = `iframe ${timerFrame.path} · ${timer.text}`;
    }

    checkAutoAdvance(timer.text);

    updateProgress(parseCumulativeMinutes(timer.text));

    if (isTopFrame) {
      const overlayPlayer = player
        ? {
            tagName: player.tagName.toLowerCase(),
            paused: player.paused,
            currentTime: player.currentTime,
            duration: player.duration,
            volume: getEffectiveVolume(player),
            muted: isPlayerMuted(player),
            ended: player.ended,
            readyState: player.readyState
          }
        : null;

      chrome.storage.local.set({
        overlayState: {
          siteTitle: location.href,
          player: overlayPlayer,
          timer: timer.text,
          updatedAt: Date.now()
        }
      }).catch(() => {});
    }
    } catch (e) {
      console.error('[stk] update error:', e);
    }
  }

  async function copyDiagnostics() {
    const frames = freshFrames();
    const resolved = resolvePlayer();
    const remoteFrame =
      !resolved.player && !resolved.invalid && frames.length
        ? frameWithPlayer(frames)
        : null;
    const player = resolved.player || remoteFrame?.player || null;
    const timer = resolveTimer();
    const events = refs.log
      ? Array.from(refs.log.querySelectorAll("li")).slice(0, 20).map((item) => item.innerText)
      : [];

    const manifest = chrome.runtime.getManifest();
    const payload = {
      tool: "奶猪水课助手",
      version: manifest.version || "unknown",
      timestamp: new Date().toISOString(),
      url: location.href,
      title: document.title,
      visibility: document.visibilityState,
      hidden: document.hidden,
      selectors: {
        timer: config.timerSelector || "",
        player: config.playerSelector || ""
      },
      player: player
        ? {
            source: resolved.player ? "top" : `iframe ${remoteFrame.path}`,
            tag: player.tagName.toLowerCase(),
            paused: player.paused,
            currentTime: player.currentTime,
            duration: player.duration,
            volume: getEffectiveVolume(player),
            muted: isPlayerMuted(player),
            readyState: player.readyState
          }
        : null,
      timerText: timer.text,
      frames: frames.map((frame) => ({
        frameId: frame.frameId,
        path: frame.path,
        title: frame.title,
        visibility: frame.visibility,
        timer: frame.timer,
        player: frame.player
      })),
      recentEvents: events
    };

    const text = JSON.stringify(payload, null, 2);

    // 在日志中显示关键诊断信息
    log('=== 诊断信息 ===');
    log(`URL: ${payload.url}`);

    // 尝试复制
    const fallbackCopy = () => {
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "readonly");
        area.style.position = "fixed";
        area.style.top = "-9999px";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        area.setSelectionRange(0, text.length);
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
      } catch {
        return false;
      }
    };

    let copySuccess = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copySuccess = true;
        log('✓ 诊断信息已复制到剪贴板');
        showToast("复制成功", "诊断信息已复制");
      } catch {
        log('剪贴板 API 失败，尝试备用方法...');
        copySuccess = fallbackCopy();
        if (copySuccess) {
          log('✓ 已通过备用方法复制');
          showToast("复制成功", "诊断信息已复制");
        }
      }
    } else {
      copySuccess = fallbackCopy();
      if (copySuccess) {
        log('✓ 已通过备用方法复制');
        showToast("复制成功", "诊断信息已复制");
      }
    }

    if (!copySuccess) {
      log('⚠ 自动复制失败，请手动复制下方内容');
      log(text);
      showToast("复制失败", "请查看日志手动复制");
    }
  }

  function createPanel() {
    if (document.getElementById(HOST_ID)) {
      return;
    }

    const host = document.createElement("div");
    host.id = HOST_ID;
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>${PANEL_CSS}</style>
      <section class="panel" aria-label="奶猪水课助手监测面板">
        <div class="head" id="stkDrag">
          <div class="brand">
            <span class="logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <ellipse cx="12" cy="13" rx="8" ry="7.5" stroke="#8a6a72" stroke-width="1.8"/>
                <path d="M5.5 7.5 C4 4, 6.5 2.5, 8 5" stroke="#8a6a72" stroke-width="1.8" stroke-linecap="round" fill="none"/>
                <path d="M18.5 7.5 C20 4, 17.5 2.5, 16 5" stroke="#8a6a72" stroke-width="1.8" stroke-linecap="round" fill="none"/>
                <ellipse cx="12" cy="14.5" rx="3.5" ry="2.8" stroke="#8a6a72" stroke-width="1.5" fill="none"/>
                <circle cx="10.8" cy="14.2" r="0.7" fill="#8a6a72"/>
                <circle cx="13.2" cy="14.2" r="0.7" fill="#8a6a72"/>
                <circle cx="9" cy="11" r="0.9" fill="#8a6a72"/>
                <circle cx="15" cy="11" r="0.9" fill="#8a6a72"/>
              </svg>
            </span>
            <span>
              <strong>奶猪水课助手 <span style="font-size:8px;font-weight:400;color:#b0989e;">by Hanhanha</span></strong>
              <small style="border:1px solid rgba(212,160,176,0.25);border-radius:4px;padding:1px 5px;margin-top:4px;display:inline-block;">MILK PIG STUDY BUDDY · v2.3.46</small>
            </span>
          </div>
          <div class="head-actions">
            <i class="dot" aria-hidden="true"></i>
            <button class="collapse" id="stkCollapse" type="button" title="收起面板" aria-label="收起面板">−</button>
          </div>
        </div>
        <div class="tabs">
          <button class="tab-btn active" data-tab="main">卓越考试网</button>
          <button class="tab-btn" data-tab="logs">日志 <span id="stkLogCount" style="font-family:monospace;font-size:7px;opacity:0.7;">0</span></button>
          <button class="tab-btn" data-tab="autoanswer">自动答题</button>
          <button class="tab-btn" data-tab="about">关于</button>
        </div>
        <div class="tab-content active" id="tab-main">
          <div class="origin" id="stkOrigin"></div>
          <div class="grid">
            <div class="cell"><span>页面可见性</span><strong id="stkVisibility" class="muted">—</strong></div>
            <div class="cell"><span>播放器</span><strong id="stkPlayer" class="muted">—</strong></div>
            <div class="cell"><span>音量</span><strong id="stkVolume" class="muted">—</strong></div>
            <div class="cell"><span>计时器</span><strong id="stkTimer" class="wrap muted">—</strong></div>
          </div>
          <div class="progress-row">
            <div class="progress-label">
              <span>学习进度</span>
              <em id="stkProgressText">—</em>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" id="stkProgressFill" style="width:0%"></div>
            </div>
          </div>
          <div class="volume-ctrl">
            <span>设定音量</span>
            <input type="range" id="stkVolumeSlider" min="0" max="100" value="100" disabled>
            <em id="stkVolumeValue">—</em>
            <button class="mute-btn" id="stkMuteBtn" type="button" title="一键静音" aria-label="一键静音" disabled>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15" class="mute-x"/>
                <line x1="17" y1="9" x2="23" y2="15" class="mute-x"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" class="mute-waves"/>
              </svg>
            </button>
          </div>
          <div class="detail" id="stkDetail">正在读取页面状态…</div>
          <div class="actions">
            <button id="stkToggleStudy" type="button" style="background:rgba(100,200,150,0.15);border-color:rgba(100,200,150,0.4);color:#50a070;">开始学习</button>
            <button id="stkRefresh" type="button">刷新</button>
            <button id="stkCopy" type="button">复制诊断</button>
          </div>
        </div>
        <div class="tab-content" id="tab-logs">
          <div class="log-container">
            <ol class="log" id="stkLog"></ol>
          </div>
          <div class="log-actions">
            <button id="stkLogClear" type="button">清空日志</button>
            <button id="stkLogCopy" type="button">复制日志</button>
          </div>
        </div>
        <div class="tab-content" id="tab-autoanswer">
          <div class="about-section">
            <div class="about-card">
              <h3>自动答题</h3>
              <p style="color:#b08040;text-align:center;padding:20px 0;">该功能正在调试中...<br>等待后续版本开放</p>
            </div>
          </div>
        </div>
        <div class="tab-content" id="tab-about">
          <div class="about-section">
            <div class="about-card">
              <h3>奶猪水课助手</h3>
              <p>为解决刷线上水课的烦恼，所以奶猪水课助手诞生了。</p>
            </div>
            <div class="about-card">
              <h3>功能特性</h3>
              <ul class="about-features">
                <li>窗口失焦后继续播放，计时器继续计时</li>
                <li>自动检测未完成章节并开始学习</li>
                <li>学时达标后自动切换下一章节</li>
                <li>可拖动滑块设定音量，一键静音</li>
                <li>最小化时桌面悬浮窗同步播放进度</li>
                <li>学习进度实时追踪（已完成 + 本次累计）</li>
                <li>反暂停监测：模拟鼠标活动防止自动暂停</li>
                <li>自动答题：调用 LLM API 分析题目并选择答案</li>
              </ul>
            </div>
            <div class="about-meta">
              <span>版本 v2.3.46</span>
              <strong>by Hanhanha</strong>
            </div>
          </div>
        </div>
      </section>
    `;

    document.documentElement.appendChild(host);
    panelHost = host;
    panel = shadow.querySelector(".panel");
    refs = {
      origin: shadow.querySelector("#stkOrigin"),
      visibility: shadow.querySelector("#stkVisibility"),
      player: shadow.querySelector("#stkPlayer"),
      volume: shadow.querySelector("#stkVolume"),
      timer: shadow.querySelector("#stkTimer"),
      detail: shadow.querySelector("#stkDetail"),
      log: shadow.querySelector("#stkLog"),
      logCount: shadow.querySelector("#stkLogCount"),
      toggleStudy: shadow.querySelector("#stkToggleStudy"),
      refresh: shadow.querySelector("#stkRefresh"),
      copy: shadow.querySelector("#stkCopy"),
      volumeSlider: shadow.querySelector("#stkVolumeSlider"),
      volumeValue: shadow.querySelector("#stkVolumeValue"),
      muteBtn: shadow.querySelector("#stkMuteBtn"),
      progressText: shadow.querySelector("#stkProgressText"),
      progressFill: shadow.querySelector("#stkProgressFill"),
      logClear: shadow.querySelector("#stkLogClear"),
      logCopy: shadow.querySelector("#stkLogCopy"),
    };

    refs.origin.textContent = location.href;
    refs.origin.title = location.href;
    refs.log.innerHTML = '<li class="log-empty"><span>等待页面事件…</span></li>';

    refs.refresh.addEventListener("click", () => {
      log("手动刷新状态");
      update();
    });
    refs.copy.addEventListener("click", copyDiagnostics);

    // 开始/停止学习切换按钮
    let _studyCountdownTimer = null;
    let _studyInProgress = false;
    
    refs.toggleStudy.addEventListener("click", () => {
      if (_studyInProgress) {
        // 停止学习：取消倒计时
        if (_studyCountdownTimer) {
          clearInterval(_studyCountdownTimer);
          _studyCountdownTimer = null;
        }
        _studyInProgress = false;
        refs.toggleStudy.textContent = "开始学习";
        refs.toggleStudy.style.background = "rgba(100,200,150,0.15)";
        refs.toggleStudy.style.borderColor = "rgba(100,200,150,0.4)";
        refs.toggleStudy.style.color = "#50a070";
        log("已取消自动学习");
        showToast("自动学习", "已取消");
      } else {
        // 开始学习：启动倒计时
        startManualLearning();
      }
    });

    function startManualLearning() {
      if (!isTopFrame) {
        log("手动学习：非顶层框架，无法执行");
        return;
      }
      
      _studyInProgress = true;
      refs.toggleStudy.textContent = "停止学习";
      refs.toggleStudy.style.background = "rgba(200,100,100,0.15)";
      refs.toggleStudy.style.borderColor = "rgba(200,100,100,0.4)";
      refs.toggleStudy.style.color = "#a05050";
      
      let remaining = 5;
      showToast("自动学习", `${remaining} 秒后开始…（点击按钮取消）`);
      log(`手动触发自动学习：${remaining} 秒倒计时`);
      
      _studyCountdownTimer = setInterval(() => {
        remaining -= 1;
        if (remaining > 0) {
          showToast("自动学习", `${remaining} 秒后开始…（点击按钮取消）`);
          return;
        }
        clearInterval(_studyCountdownTimer);
        _studyCountdownTimer = null;
        executeManualLearning();
      }, 1000);
    }

    function executeManualLearning() {
      const mainIframe = document.getElementById("mainIframe");
      if (!mainIframe) {
        log("手动学习：未找到 mainIframe");
        showToast("自动学习", "未找到课程列表");
        resetStudyButton();
        return;
      }

      try {
        const doc = mainIframe.contentDocument;
        if (!doc) {
          log("手动学习：无法访问 mainIframe 内容");
          showToast("自动学习", "无法访问课程列表");
          resetStudyButton();
          return;
        }

        const found = findUnfinishedChapterLink(doc);
        if (found) {
          _lastAutoAdvance = Date.now();
          enterChapter(found, "手动学习");
          // 保持按钮为"停止学习"状态，用户可以随时停止
          return;
        }

        // 当前页已完成：翻页后由 advanceAfterPageLoad 接管
        if (tryPaginateForChapter(doc)) return;

        log("手动学习：未找到未学习的课程，且未找到翻页控件");
        showToast("自动学习", "未找到未学习课程，可能已全部完成");
        resetStudyButton();
      } catch (err) {
        log("手动学习失败：" + err.message);
        showToast("自动学习", "操作失败");
        resetStudyButton();
      }
    }

    function resetStudyButton() {
      _studyInProgress = false;
      refs.toggleStudy.textContent = "开始学习";
      refs.toggleStudy.style.background = "rgba(100,200,150,0.15)";
      refs.toggleStudy.style.borderColor = "rgba(100,200,150,0.4)";
      refs.toggleStudy.style.color = "#50a070";
    }

    // Tab switching
    const tabBtns = shadow.querySelectorAll(".tab-btn");
    const tabContents = shadow.querySelectorAll(".tab-content");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        shadow.querySelector(`#tab-${target}`).classList.add("active");
      });
    });

    // Log tab actions
    if (refs.logClear) {
      refs.logClear.addEventListener("click", () => {
        logCount = 0;
        refs.log.innerHTML = '<li class="log-empty"><span>日志已清空</span></li>';
      });
    }
    if (refs.logCopy) {
      refs.logCopy.addEventListener("click", () => {
        const items = Array.from(refs.log.querySelectorAll("li"))
          .filter(li => !li.classList.contains("log-empty"))
          .map(li => li.innerText)
          .join("\n");
        
        // 尝试使用 Clipboard API
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(items)
            .then(() => {
              log("日志已复制");
              showToast("复制成功", "日志已复制到剪贴板");
            })
            .catch((err) => {
              // 如果失败，使用备用方法
              fallbackCopyText(items);
            });
        } else {
          fallbackCopyText(items);
        }
      });
    }
    
    function fallbackCopyText(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        log("日志已复制（备用方法）");
        showToast("复制成功", "日志已复制到剪贴板");
      } catch (err) {
        log("复制失败：" + err.message);
        showToast("复制失败", "请手动复制日志");
      }
      document.body.removeChild(textarea);
    }

    // 调试按钮
    const debugBtn = shadow.querySelector("#stkDebugBtn");
    if (debugBtn) {
      debugBtn.addEventListener("click", () => {
        log('=== 手动调试检测 ===');
        log(`当前URL: ${location.href}`);
        log(`页面标题: ${document.title}`);
          
        // 检测当前页面
        const isQuiz = isQuizPage(document);
        log(`isQuizPage(document): ${isQuiz}`);
        
        if (isQuiz) {
          const { question, options } = extractQuestion(document);
          log(`提取到题目: ${question ? question.substring(0, 50) + '...' : '无'}`);
          log(`提取到选项: ${options.length} 个`);
          options.forEach((opt, i) => {
            log(`  选项${String.fromCharCode(65+i)}: ${opt.text.substring(0, 40)}...`);
          });
        }
        
        // 检测 iframe
        const iframes = document.querySelectorAll('iframe');
        log(`iframe 数量: ${iframes.length}`);
        iframes.forEach((iframe, i) => {
          try {
            const doc = iframe.contentDocument;
            if (doc) {
              const iframeIsQuiz = isQuizPage(doc);
              log(`iframe[${i}] 可访问, isQuiz=${iframeIsQuiz}, URL=${iframe.src?.substring(0, 60) || 'about:blank'}`);
              if (iframeIsQuiz) {
                const { question, options } = extractQuestion(doc);
                log(`  题目: ${question ? question.substring(0, 50) + '...' : '无'}`);
                log(`  选项: ${options.length} 个`);
              }
            } else {
              log(`iframe[${i}] 无法访问 (跨域)`);
            }
          } catch (e) {
            log(`iframe[${i}] 错误: ${e.message}`);
          }
        });

        // 页面结构分析
        const forms = document.querySelectorAll('form');
        log(`表单数量: ${forms.length}`);
        const inputs = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        log(`单选/复选框: ${inputs.length}`);
        const labels = document.querySelectorAll('label');
        log(`标签数量: ${labels.length}`);
        const tables = document.querySelectorAll('table');
        log(`表格数量: ${tables.length}`);
        
        showToast("调试", "检测完成，请查看日志");
      });
    }

    refs.volumeSlider.addEventListener("input", () => {
      const value = Number(refs.volumeSlider.value);
      refs.volumeValue.textContent = `${value}%`;
      _pendingVolume = value;
      clearTimeout(_pendingVolumeTimer);
      _pendingVolumeTimer = setTimeout(() => { _pendingVolume = -1; }, 3000);
      chrome.runtime.sendMessage({
        type: "setPlayerVolume",
        volume: value / 100
      });
    });

    refs.muteBtn.addEventListener("click", () => {
      lastKnownMuted = !lastKnownMuted;
      refs.muteBtn.classList.toggle("muted", lastKnownMuted);
      refs.muteBtn.title = lastKnownMuted ? "取消静音" : "一键静音";
      refs.muteBtn.setAttribute("aria-label", refs.muteBtn.title);
      const volPct = Number(refs.volumeSlider.value);
      refs.volumeValue.textContent = `${volPct}%${lastKnownMuted ? " MUTE" : ""}`;
      chrome.runtime.sendMessage({ type: "togglePlayerMute" });
    });

    document.addEventListener("site-test-kit:volume-changed", (event) => {
      if (!event.detail || destroyed) {
        return;
      }
      const pct = Math.round((event.detail.volume || 0) * 100);
      const muted = Boolean(event.detail.muted);
      lastKnownMuted = muted;
      refs.volumeValue.textContent = `${pct}%${muted ? " MUTE" : ""}`;
      refs.muteBtn.classList.toggle("muted", muted);
      refs.muteBtn.title = muted ? "取消静音" : "一键静音";
      refs.muteBtn.setAttribute("aria-label", refs.muteBtn.title);
      log(`音量：${pct}%${muted ? " · 静音" : ""}`);
      update();
    }, { passive: true, signal: controller.signal });

    document.addEventListener("site-test-kit:mute-changed", (event) => {
      if (!event.detail || destroyed) return;
      lastKnownMuted = Boolean(event.detail.muted);
      refs.muteBtn.classList.toggle("muted", lastKnownMuted);
      refs.muteBtn.title = lastKnownMuted ? "取消静音" : "一键静音";
      refs.muteBtn.setAttribute("aria-label", refs.muteBtn.title);
      const p = resolvePlayer().player;
      const volPct = p ? Math.round(getEffectiveVolume(p) * 100) : 0;
      refs.volumeValue.textContent = `${volPct}%${lastKnownMuted ? " MUTE" : ""}`;
      log(lastKnownMuted ? "已静音" : "已取消静音");
      update();
    }, { passive: true, signal: controller.signal });

    const collapseButton = shadow.querySelector("#stkCollapse");
    collapseButton.addEventListener("click", () => {
      const collapsed = panel.classList.toggle("collapsed");
      collapseButton.textContent = collapsed ? "+" : "−";
      collapseButton.title = collapsed ? "展开面板" : "收起面板";
      collapseButton.setAttribute("aria-label", collapseButton.title);
    });

    if (window.matchMedia("(max-width: 700px)").matches) {
      panel.classList.add("collapsed");
      collapseButton.textContent = "+";
      collapseButton.title = "展开面板";
      collapseButton.setAttribute("aria-label", "展开面板");
    }

    const dragHandle = shadow.querySelector("#stkDrag");
    dragHandle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest("button")) {
        return;
      }

      const rect = panel.getBoundingClientRect();
      dragState = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        width: rect.width,
        height: rect.height
      };

      panel.style.left = `${rect.left}px`;
      panel.style.top = `${rect.top}px`;
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      dragHandle.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    dragHandle.addEventListener("pointermove", (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      const maxX = Math.max(8, window.innerWidth - dragState.width - 8);
      const maxY = Math.max(8, window.innerHeight - dragState.height - 8);
      panel.style.left = `${Math.min(maxX, Math.max(8, event.clientX - dragState.offsetX))}px`;
      panel.style.top = `${Math.min(maxY, Math.max(8, event.clientY - dragState.offsetY))}px`;
    });

    const endDrag = (event) => {
      if (dragState && event.pointerId === dragState.pointerId) {
        dragState = null;
      }
    };

    dragHandle.addEventListener("pointerup", endDrag);
    dragHandle.addEventListener("pointercancel", endDrag);

    update();
  }

  function shutdown() {
    destroyed = true;
    window.clearInterval(pollTimer);
    controller.abort();
    frameStates.clear();
    knownFrames.clear();
    knownFramePlayers.clear();
    panelHost?.remove();
    panelHost = null;
    panel = null;
    if (isTopFrame) {
      chrome.storage.local.remove("overlayState").catch(() => {});
      chrome.runtime.sendMessage({ type: "hideOverlay" }).catch(() => {});
    }
  }

  function onStorageChanged(changes, area) {
    if (area !== "local") {
      return;
    }

    for (const key of Object.keys(DEFAULTS)) {
      if (changes[key]) {
        config[key] = changes[key].newValue;
      }
    }

    if (!config.sitePattern || config.sitePattern !== `${location.origin}/*`) {
      shutdown();
      return;
    }

    if (isTopFrame) {
      update();
    } else {
      attachFramePlayer(resolvePlayer().player);
      postFrameState();
    }
  }

  function onWindowMessage(event) {
    const data = event.data;

    if (event.source === window) {
      if (data && data.source === "site-test-kit" && data.type === "event" && data.message) {
        log(`站点上报：${String(data.message).slice(0, 100)}`);
      }
      return;
    }

    // 处理 player-found 消息
    if (data && data.source === "site-test-kit-frame" && data.type === "player-found") {
      diagOnce(`iframe 播放器已发现：${data.path || 'unknown'}`);
      if (!data.path || data.path !== _lastPlayerFoundPath || Date.now() - _lastPlayerFoundAt > 4000) {
        _lastPlayerFoundPath = data.path || "";
        _lastPlayerFoundAt = Date.now();
        update();
      }
      return;
    }

    // 验证消息来源 - 支持同域和跨域 iframe
    let fromKnownFrame = false;
    if (event.origin === location.origin) {
      fromKnownFrame = true;
    } else {
      // 跨域 iframe：检查 DOM 中是否存在该 iframe
      try {
        const iframes = document.querySelectorAll("iframe");
        for (const iframe of iframes) {
          try {
            if (iframe.contentWindow === event.source) {
              fromKnownFrame = true;
              break;
            }
          } catch {
            // 跨域无法访问 contentWindow，但 iframe 存在于 DOM 中
            fromKnownFrame = true;
            break;
          }
          try {
            const nested = iframe.contentDocument?.querySelectorAll("iframe") || [];
            for (const inner of nested) {
              try {
                if (inner.contentWindow === event.source) {
                  fromKnownFrame = true;
                  break;
                }
              } catch {
                fromKnownFrame = true;
                break;
              }
            }
            if (fromKnownFrame) break;
          } catch {
            fromKnownFrame = true;
            break;
          }
        }
      } catch {}
    }

    if (!fromKnownFrame) return;

    if (!data || data.source !== "site-test-kit-frame" || data.type !== "state") {
      return;
    }

    const state = data.state;
    if (!state || !state.frameId) {
      return;
    }

    frameStates.set(state.frameId, state);

    if (!knownFrames.has(state.frameId)) {
      knownFrames.add(state.frameId);
      log(`检测到 iframe：${state.path || state.frameId}`);
    }

    if (state.player && !knownFramePlayers.has(state.frameId)) {
      knownFramePlayers.add(state.frameId);
      log(`iframe 播放器已找到：${state.path || state.frameId}`);
    }

    update();
  }

  function bootFrame() {
    attachFramePlayer(resolvePlayer().player);

    chrome.runtime.onMessage.addListener((message) => {
      if (message && message.type === "keepAlivePing") {
        // 移除强制播放逻辑，避免干扰播放器初始化
        postFrameState();
      }
    });

    document.addEventListener("visibilitychange", postFrameState, {
      passive: true,
      signal: controller.signal
    });

    window.addEventListener("focus", postFrameState, {
      passive: true,
      signal: controller.signal
    });

    window.addEventListener("blur", postFrameState, {
      passive: true,
      signal: controller.signal
    });

    chrome.storage.onChanged.addListener(onStorageChanged);
    postFrameState();

    pollTimer = window.setInterval(() => {
      attachFramePlayer(resolvePlayer().player);
      postFrameState();
    }, 800);
  }

  async function boot() {
    try {
      const stored = await chrome.storage.local.get(DEFAULTS);
      config = { ...DEFAULTS, ...stored };
    } catch {
      return;
    }

    if (!config.sitePattern || config.sitePattern !== `${location.origin}/*`) {
      return;
    }

    chrome.runtime.onMessage.addListener((message) => {
      if (!message || typeof message !== "object") return;
      if (message.type === "playerVolumeChange" || message.type === "playerMuteToggle") {
        // 1. 转发到顶层 MAIN world（keep-alive.js）
        window.postMessage({
          source: "site-test-kit-relay",
          type: message.type,
          volume: message.volume
        }, "*");

        // 2. 直接操作同源 ExamView iframe 中的播放器元素
        const examView = document.getElementById('ExamView');
        if (examView) {
          try {
            const examDoc = examView.contentDocument;
            if (examDoc) {
              const player = examDoc.querySelector('video, audio');
              if (player) {
                if (message.type === "playerVolumeChange" && message.volume != null) {
                  const vol = Math.max(0, Math.min(1, Number(message.volume)));
                  try { player.volume = vol; player.muted = vol === 0; } catch {}
                  log(`音量已设置：${Math.round(vol * 100)}%`);
                  update();
                } else if (message.type === "playerMuteToggle") {
                  try {
                    if (player.muted) {
                      const v = player.__stkVolume > 0 ? player.__stkVolume : 0.5;
                      player.volume = v; player.muted = false;
                    } else {
                      player.__stkVolume = player.volume || 0.5;
                      player.muted = true;
                    }
                    log(player.muted ? "已静音" : "已取消静音");
                    update();
                  } catch {}
                }
              }
            }
          } catch {}

          // 3. 同时转发到 ExamView iframe 的 MAIN world（keep-alive.js）
          try {
            examView.contentWindow.postMessage({
              source: "site-test-kit-relay",
              type: message.type,
              volume: message.volume
            }, "*");
          } catch {}
        }
      }
    });

    if (!isTopFrame) {
      bootFrame();
      return;
    }

    createPanel();
    setupVideoObserver();
    pollExamViewPlayer();
    
    document.addEventListener(
      "visibilitychange",
      () => {
        log(`页面可见性：${document.visibilityState}`);
        update();
      },
      { passive: true, signal: controller.signal }
    );

    window.addEventListener(
      "focus",
      () => {
        log("窗口获得焦点");
        chrome.storage.local.remove("overlayState").catch(() => {});
        chrome.runtime.sendMessage({ type: "hideOverlay" }).catch(() => {});
        update();
      },
      { passive: true, signal: controller.signal }
    );

    window.addEventListener(
      "blur",
      async () => {
        log("窗口失去焦点");
        update();

        const shouldShow = await new Promise((resolve) => {
          try {
            chrome.windows.getCurrent((win) => {
              if (chrome.runtime.lastError || !win) {
                resolve(document.hidden);
                return;
              }
              resolve(win.state === "minimized" || document.hidden);
            });
          } catch {
            resolve(document.hidden);
          }
        });

        if (shouldShow) {
          const resolved = resolvePlayer();
          const frames = freshFrames();
          const remoteFrame =
            !resolved.player && !resolved.invalid && frames.length
              ? frameWithPlayer(frames)
              : null;
          const player = resolved.player || remoteFrame?.player || null;

          const overlayPlayer = player
            ? {
                tagName: player.tagName.toLowerCase(),
                paused: player.paused,
                currentTime: player.currentTime,
                duration: player.duration,
                volume: getEffectiveVolume(player),
                muted: isPlayerMuted(player),
                ended: player.ended,
                readyState: player.readyState
              }
            : null;

          try {
            await chrome.storage.local.set({
              overlayState: {
                siteTitle: location.href,
                player: overlayPlayer,
                timer: resolveTimer().text,
                updatedAt: Date.now()
              }
            });
          } catch (err) {
            console.error("[panel] overlayState write failed:", err);
          }

          chrome.runtime.sendMessage({ type: "showOverlay" }).catch(() => {});
        }
      },
      { passive: true, signal: controller.signal }
    );

    window.addEventListener("message", onWindowMessage, {
      passive: true,
      signal: controller.signal
    });

    chrome.storage.onChanged.addListener(onStorageChanged);

    chrome.runtime.onMessage.addListener((message) => {
      if (message && message.type === "keepAlivePing") {
        // 移除强制播放逻辑，避免干扰播放器初始化
        update();
      }
    });

    setTimeout(() => {
      try {
        update();
      } catch (e) {
        console.error('[stk] update error:', e);
      }
    }, 500);

    chrome.runtime.sendMessage({ type: "getTabMuteState" }, (response) => {
      if (response && response.ok) {
        lastKnownMuted = response.muted;
        if (refs.muteBtn) {
          refs.muteBtn.classList.toggle("muted", response.muted);
          refs.muteBtn.title = response.muted ? "取消静音" : "一键静音";
          refs.muteBtn.setAttribute("aria-label", refs.muteBtn.title);
        }
      }
    });

    pollTimer = window.setInterval(() => {
      try {
        update();
      } catch (e) {
        console.error('[stk] pollTimer update error:', e);
      }
    }, 800);
  }

  boot();
})();
