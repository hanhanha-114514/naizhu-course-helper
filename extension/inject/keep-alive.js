(() => {
  "use strict";

  // 延迟干预：等待视频成功播放后再应用保护措施，避免干扰播放器初始化
  let _videoActivated = false;
  let _interventionsApplied = false;

  function applyInterventions() {
    if (_interventionsApplied) return;
    _interventionsApplied = true;

    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const nativeHidden = Object.getOwnPropertyDescriptor(Document.prototype, "hidden");
    const nativeVisibilityState = Object.getOwnPropertyDescriptor(Document.prototype, "visibilityState");

    if (nativeHidden) {
      Object.defineProperty(document, "hidden", {
        get() { return false; },
        configurable: true
      });
    }

    if (nativeVisibilityState) {
      Object.defineProperty(document, "visibilityState", {
        get() { return "visible"; },
        configurable: true
      });
    }

    Document.prototype.hasFocus = function () {
      return true;
    };

    const BLOCKED_CAPTURE = new Set(["visibilitychange", "blur", "focus", "mouseleave"]);

    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (typeof type === "string" && BLOCKED_CAPTURE.has(type) && listener != null) {
        if (type === "visibilitychange" && (this === document || this === window)) {
          const wrappedListener = function (event) {
            if (nativeHidden && nativeHidden.get.call(document)) {
              return;
            }
            if (typeof listener.handleEvent === "function") {
              listener.handleEvent(event);
            } else {
              listener.call(this, event);
            }
          };
          originalAddEventListener.call(this, type, wrappedListener, true);
          return;
        }

        if ((type === "blur" || type === "focus" || type === "mouseleave") && 
            (this === window || this === document)) {
          return;
        }
      }

      originalAddEventListener.call(this, type, listener, options);
    };

    const nativeOnSetter = nativeHidden && Object.getOwnPropertyDescriptor(Document.prototype, "onvisibilitychange");
    if (nativeOnSetter && nativeOnSetter.set) {
      Object.defineProperty(Document.prototype, "onvisibilitychange", {
        get: nativeOnSetter.get,
        set() {},
        configurable: true,
        enumerable: true
      });
    }

    Object.defineProperty(window, "onblur", { get() { return null; }, set() {}, configurable: true });
    Object.defineProperty(window, "onfocus", { get() { return null; }, set() {}, configurable: true });
    Object.defineProperty(document, "onfocus", { get() { return null; }, set() {}, configurable: true });
    Object.defineProperty(document, "onblur", { get() { return null; }, set() {}, configurable: true });

    let _lastUserGesture = Date.now();
    for (const evt of ["click", "keydown", "keyup", "mousedown", "touchstart", "mousemove", "mouseover"]) {
      originalAddEventListener.call(document, evt, () => {
        _lastUserGesture = Date.now();
      }, true);
    }

    setInterval(() => {
      _lastUserGesture = Date.now();
      try {
        const fakeEvent = new MouseEvent("mousemove", {
          bubbles: true, cancelable: true, view: window
        });
        document.dispatchEvent(fakeEvent);
      } catch {}
    }, 30000);
  }

  // 播放器确认在播后再延迟装保护措施（过早覆盖 hidden/hasFocus 会让 Aliplayer 黑屏）
  function onPlaying() {
    scheduleActivation(document.querySelector("video, audio"));
  }

  function scheduleActivation(video) {
    if (_videoActivated) return;
    _videoActivated = true;
    try { video.removeEventListener("playing", onPlaying); } catch {}
    setTimeout(applyInterventions, 1000);
  }

  // 监听视频元素出现，等待播放成功后再应用干预
  const observer = new MutationObserver(() => {
    if (_videoActivated) return;
    const video = document.querySelector("video, audio");
    if (!video) return;

    video.addEventListener("playing", onPlaying, { once: true });

    if (!video.paused && video.readyState >= 2) scheduleActivation(video);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // 播放守护：检测到 video 就一直盯着，不再"试 10 次（约 6 秒）就放弃"。
  // 站点侧 loadedmetadata 可能要 20+ 秒（连续切换章节后更慢），
  // 旧逻辑在视频还没 ready 时就把重试次数耗光，于是永远卡在暂停界面。
  function forcePlay(player) {
    try {
      const pr = player.play();
      if (pr && typeof pr.catch === "function") {
        pr.catch(() => {
          // 新建的 iframe 没有用户激活，浏览器会拒绝有声自动播放：改用静音播（学时照样累计）
          try { player.muted = true; } catch {}
          const again = player.play();
          if (again && typeof again.catch === "function") again.catch(() => {});
        });
      }
    } catch {}
  }

  function resumeStalled() {
    const player = document.querySelector("video, audio");
    if (!player || player.ended) return;
    if (player.readyState < 2 || !player.paused) return;
    forcePlay(player);
  }

  let _watchStarted = false;
  function startResumeWatch() {
    if (_watchStarted) return;
    _watchStarted = true;

    // Worker 定时器不受后台标签节流影响，隐藏时也能把被暂停的视频推回去
    const workerCode = `
      let intervalId = null;
      self.onmessage = function(e) {
        if (e.data === "start") {
          if (intervalId) clearInterval(intervalId);
          intervalId = setInterval(() => { self.postMessage("tick"); }, 1200);
        } else if (e.data === "stop") {
          if (intervalId) clearInterval(intervalId);
          intervalId = null;
        }
      };
    `;
    let worker = null;
    try {
      const blob = new Blob([workerCode], { type: "application/javascript" });
      worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = () => { resumeStalled(); };
      worker.postMessage("start");
    } catch {}
    // CSP 禁止 blob worker 时退回主线程定时器
    if (!worker) setInterval(resumeStalled, 1500);
  }

  // player-found 通知限流：Aliplayer 初始化期间 DOM 每秒变动十几次，
  // 每条通知都会让顶层 panel.js 跑一遍 update() 并占满 50 条日志缓冲
  let _lastFoundPost = 0;
  let _lastFoundPath = "";
  function notifyPlayerFound(player) {
    const path = location.pathname + location.search;
    const now = Date.now();
    if (path === _lastFoundPath && now - _lastFoundPost < 5000) return;
    _lastFoundPath = path;
    _lastFoundPost = now;

    document.dispatchEvent(new CustomEvent("site-test-kit:player-found", {
      detail: { tagName: player.tagName.toLowerCase() }
    }));
    if (window.top !== window) {
      try {
        window.top.postMessage({
          source: "site-test-kit-frame",
          type: "player-found",
          path
        }, "*");
      } catch {}
    }
  }

  const _playerObserver = new MutationObserver(() => {
    const p = document.querySelector("video, audio");
    if (!p) return;
    startResumeWatch();
    notifyPlayerFound(p);
    if (p.paused && p.readyState >= 2) forcePlay(p);
    // Aliplayer 可能换掉 video 元素，旧的 playing 监听会丢；这里补装保护措施
    if (!p.paused && p.readyState >= 2) scheduleActivation(p);
  });
  _playerObserver.observe(document.documentElement, { childList: true, subtree: true });

  function findPlayer() {
    return document.querySelector("video, audio");
  }

  function applyVolumeChange(detail) {
    const player = findPlayer();
    if (!player) return;
    const vol = Math.max(0, Math.min(1, Number(detail.volume)));
    try { player.volume = vol; } catch {}
    player.__stkVolume = vol;
    document.dispatchEvent(new CustomEvent("site-test-kit:volume-changed", {
      detail: { volume: vol, muted: player.muted }
    }));
  }

  function applyMuteToggle() {
    const player = findPlayer();
    if (!player) return;
    if (player.muted) {
      const v = player.__stkVolume > 0 ? player.__stkVolume : 0.5;
      try { player.volume = v; player.muted = false; } catch {}
      player.__stkVolume = v;
    } else {
      player.__stkVolume = player.volume || 0.5;
      try { player.muted = true; } catch {}
    }
    document.dispatchEvent(new CustomEvent("site-test-kit:mute-changed", {
      detail: { muted: player.muted, volume: player.volume }
    }));
  }

  document.addEventListener("site-test-kit:volume-change", (e) => {
    if (!e.detail) return;
    applyVolumeChange(e.detail);
  });

  document.addEventListener("site-test-kit:mute-toggle", () => {
    applyMuteToggle();
  });

  if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (!message || typeof message !== "object") return;
      if (message.type === "playerVolumeChange" && message.volume != null) {
        applyVolumeChange({ volume: message.volume });
      } else if (message.type === "playerMuteToggle") {
        applyMuteToggle();
      } else if (message.type === "playerAutoAdvance" && message.selector) {
        try {
          const btn = document.querySelector(message.selector);
          if (btn) btn.click();
        } catch {}
      }
    });
  }

  window.addEventListener("message", (e) => {
    const data = e.data;
    if (!data || data.source !== "site-test-kit-relay") return;
    if (data.type === "playerVolumeChange" && data.volume != null) {
      applyVolumeChange({ volume: data.volume });
    } else if (data.type === "playerMuteToggle") {
      applyMuteToggle();
    }
  });

  document.addEventListener("site-test-kit:get-state", () => {
    const player = findPlayer();
    if (!player) return;
    document.dispatchEvent(new CustomEvent("site-test-kit:state-report", {
      detail: { volume: player.volume, muted: player.muted }
    }));
  });

  document.dispatchEvent(
    new CustomEvent("site-test-kit-ready", { detail: { source: "keep-alive" } })
  );
})();
