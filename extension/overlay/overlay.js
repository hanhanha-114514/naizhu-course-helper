"use strict";

const el = {
  content: document.getElementById("content"),
  emptyMsg: document.getElementById("emptyMsg"),
  progressFill: document.getElementById("progressFill"),
  currentTime: document.getElementById("currentTime"),
  duration: document.getElementById("duration"),
  statusDot: document.getElementById("statusDot"),
  statusText: document.getElementById("statusText"),
  volumeText: document.getElementById("volumeText"),
  timerRow: document.getElementById("timerRow"),
  timerText: document.getElementById("timerText"),
  siteTitle: document.getElementById("siteTitle")
};

function formatTime(seconds) {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total < 0) return "--:--";
  const whole = Math.floor(total);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function render(state) {
  if (!state || !state.player) {
    el.content.style.display = "none";
    el.emptyMsg.style.display = "flex";
    el.emptyMsg.textContent = state ? "未找到播放器元素" : "等待播放器数据…";
    return;
  }

  el.content.style.display = "";
  el.emptyMsg.style.display = "none";

  const p = state.player;
  const pct = p.duration > 0 ? Math.min(100, (p.currentTime / p.duration) * 100) : 0;
  el.progressFill.style.width = `${pct}%`;
  el.currentTime.textContent = formatTime(p.currentTime);
  el.duration.textContent = formatTime(p.duration);

  el.statusDot.className = "status-dot" + (p.paused ? " paused" : "");
  el.statusText.textContent = p.ended ? "已结束" : p.paused ? "已暂停" : "播放中";

  const volPct = Math.round(p.volume * 100);
  el.volumeText.textContent = `${volPct}%${p.muted ? " · 静音" : ""}`;

  const timerHidden = !state.timer || ["未设置", "未找到", "选择器无效", "（空）"].includes(state.timer);
  el.timerRow.classList.toggle("visible", !timerHidden);
  if (!timerHidden) {
    el.timerText.textContent = state.timer;
  }

  if (state.siteTitle) {
    try {
      el.siteTitle.textContent = new URL(state.siteTitle).host;
    } catch {
      el.siteTitle.textContent = state.siteTitle;
    }
  }
}

let goneTicks = 0;

async function poll() {
  try {
    const data = await chrome.storage.local.get("overlayState");
    const state = data.overlayState;

    if (state && state.updatedAt) {
      goneTicks = 0;
      render(state);
    } else {
      goneTicks++;
      if (goneTicks > 20) {
        window.close();
        return;
      }
      render(null);
    }
  } catch (err) {
    console.error("[overlay] poll error:", err);
    goneTicks++;
    if (goneTicks > 20) {
      window.close();
    }
  }
}

poll();
setInterval(poll, 500);
