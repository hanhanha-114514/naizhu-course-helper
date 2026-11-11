"use strict";

const SCRIPT_ID = "site-test-kit-panel";
const PENDING_KEY = "pendingSite";
const DEFAULTS = {
  sitePattern: "",
  siteUrl: "",
  timerSelector: "#spTitle",
  playerSelector: "",
  targetTime: "",
  nextSelector: ""
};

function isOriginPattern(value) {
  if (typeof value !== "string" || !value.endsWith("/*")) {
    return false;
  }

  try {
    const base = value.slice(0, -2);
    const url = new URL(base);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      value === `${url.origin}/*`
    );
  } catch {
    return false;
  }
}

function validateSitePayload(message) {
  const pattern = String(message.pattern || "");
  const siteUrl = String(message.siteUrl || "");
  const timerSelector = String(message.timerSelector || "").trim().slice(0, 300);
  const playerSelector = String(message.playerSelector || "").trim().slice(0, 300);
  const targetTime = String(message.targetTime || "").trim().slice(0, 20);
  const nextSelector = String(message.nextSelector || "").trim().slice(0, 300);

  if (!isOriginPattern(pattern)) {
    return { error: "网站地址无效，请填写完整的 http(s) 地址。" };
  }

  let parsed;
  try {
    parsed = new URL(siteUrl);
  } catch {
    return { error: "页面地址无效。" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { error: "只支持 http:// 或 https:// 网站。" };
  }

  if (`${parsed.origin}/*` !== pattern) {
    return { error: "页面地址与授权范围不一致。" };
  }

  return {
    pattern,
    siteUrl: parsed.href,
    timerSelector,
    playerSelector,
    targetTime,
    nextSelector
  };
}

async function readConfig() {
  const stored = await chrome.storage.local.get(DEFAULTS);
  return { ...DEFAULTS, ...stored };
}

async function unregisterPanel() {
  try {
    await chrome.scripting.unregisterContentScripts({
      ids: [SCRIPT_ID, `${SCRIPT_ID}-keep-alive`]
    });
  } catch {
    // 没有注册过时忽略。
  }
}

async function registerPanel(pattern) {
  await unregisterPanel();
  await chrome.scripting.registerContentScripts([
    {
      id: SCRIPT_ID,
      matches: [pattern],
      js: ["content/panel.js"],
      runAt: "document_idle",
      persistAcrossSessions: true,
      allFrames: false
    },
    {
      id: `${SCRIPT_ID}-keep-alive`,
      matches: [pattern],
      js: ["inject/keep-alive.js"],
      runAt: "document_start",
      persistAcrossSessions: true,
      allFrames: true,
      world: "MAIN"
    }
  ]);
}

async function syncRegistration() {
  const config = await readConfig();

  if (!config.sitePattern || !isOriginPattern(config.sitePattern)) {
    await unregisterPanel();
    return { registered: false, granted: false };
  }

  const granted = await chrome.permissions.contains({ origins: [config.sitePattern] });
  if (!granted) {
    await unregisterPanel();
    return { registered: false, granted: false };
  }

  try {
    await registerPanel(config.sitePattern);
    return { registered: true, granted: true };
  } catch (error) {
    return {
      registered: false,
      granted: true,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function getStatus() {
  const config = await readConfig();
  const granted = config.sitePattern
    ? await chrome.permissions.contains({ origins: [config.sitePattern] })
    : false;

  let registered = false;
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    registered = scripts.length > 0;
  } catch {
    registered = false;
  }

  return { ok: true, config, granted, registered };
}

async function applySite(message) {
  const validation = validateSitePayload(message);
  if (validation.error) {
    return { ok: false, error: validation.error };
  }

  const { pattern, siteUrl, timerSelector, playerSelector, targetTime, nextSelector } = validation;

  const granted = await chrome.permissions.contains({ origins: [pattern] });
  if (!granted) {
    return { ok: false, error: "尚未授权该网站，请重新点击保存并授权。" };
  }

  const previous = await readConfig();

  await chrome.storage.local.set({
    sitePattern: pattern,
    siteUrl,
    timerSelector,
    playerSelector,
    targetTime,
    nextSelector,
    [PENDING_KEY]: null
  });

  try {
    await registerPanel(pattern);
  } catch (error) {
    return {
      ok: false,
      error: `内容脚本注册失败：${error instanceof Error ? error.message : String(error)}`
    };
  }

  if (previous.sitePattern && previous.sitePattern !== pattern) {
    try {
      await chrome.permissions.remove({ origins: [previous.sitePattern] });
    } catch {
      // 旧站点权限可能已被手动移除。
    }
  }

  return { ok: true, ...(await getStatus()) };
}

async function prepareSite(message) {
  const validation = validateSitePayload(message);
  if (validation.error) {
    return { ok: false, error: validation.error };
  }

  await chrome.storage.local.set({
    [PENDING_KEY]: {
      ...validation,
      createdAt: Date.now()
    }
  });

  return { ok: true };
}

async function clearPending() {
  await chrome.storage.local.set({ [PENDING_KEY]: null });
  return { ok: true };
}

async function consumePending() {
  const stored = await chrome.storage.local.get(PENDING_KEY);
  const pending = stored[PENDING_KEY];

  if (!pending || !isOriginPattern(pending.pattern)) {
    return false;
  }

  if (!pending.createdAt || Date.now() - pending.createdAt > 10 * 60 * 1000) {
    await chrome.storage.local.set({ [PENDING_KEY]: null });
    return false;
  }

  const granted = await chrome.permissions.contains({ origins: [pending.pattern] });
  if (!granted) {
    return false;
  }

  const previous = await readConfig();

  await chrome.storage.local.set({
    sitePattern: pending.pattern,
    siteUrl: pending.siteUrl,
    timerSelector: pending.timerSelector || "",
    playerSelector: pending.playerSelector || "",
    targetTime: pending.targetTime || "",
    nextSelector: pending.nextSelector || "",
    [PENDING_KEY]: null
  });

  try {
    await registerPanel(pending.pattern);
  } catch {
    return false;
  }

  if (previous.sitePattern && previous.sitePattern !== pending.pattern) {
    try {
      await chrome.permissions.remove({ origins: [previous.sitePattern] });
    } catch {
      // 忽略旧权限移除失败。
    }
  }

  return true;
}

async function removeSite() {
  const config = await readConfig();

  await unregisterPanel();

  if (config.sitePattern) {
    try {
      await chrome.permissions.remove({ origins: [config.sitePattern] });
    } catch {
      // 权限可能已经被移除。
    }
  }

  for (const windowId of overlayWindows.keys()) {
    await hideOverlay(windowId);
  }

  await chrome.storage.local.set({ ...DEFAULTS, [PENDING_KEY]: null, overlayState: null });
  return { ok: true, ...(await getStatus()) };
}

chrome.runtime.onInstalled.addListener(() => {
  void syncRegistration();
  chrome.alarms.create("keep-alive-ping", { periodInMinutes: 1 / 12 });
});

chrome.runtime.onStartup.addListener(() => {
  void syncRegistration();
  chrome.alarms.create("keep-alive-ping", { periodInMinutes: 1 / 12 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keep-alive-ping") {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (tab.id != null) {
          chrome.tabs.sendMessage(tab.id, { type: "keepAlivePing" }).catch(() => {});
        }
      }
    });
  }
});

chrome.permissions.onAdded.addListener(() => {
  void consumePending().then((consumed) => {
    if (!consumed) {
      void syncRegistration();
    }
  });
});

chrome.permissions.onRemoved.addListener(() => {
  void syncRegistration();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== "object") {
    return false;
  }

  if (message.type === "getStatus") {
    getStatus()
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "prepareSite") {
    prepareSite(message)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "clearPending") {
    clearPending()
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "applySite") {
    applySite(message)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "removeSite") {
    removeSite()
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "showOverlay") {
    const windowId = sender.tab?.windowId;
    if (windowId == null) {
      sendResponse({ ok: false, error: "no window" });
      return false;
    }
    showOverlay(windowId)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "hideOverlay") {
    const windowId = sender.tab?.windowId;
    if (windowId == null) {
      sendResponse({ ok: true });
      return false;
    }
    hideOverlay(windowId)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "getTabMuteState") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      sendResponse({ ok: true, muted: tab ? tab.mutedInfo.muted : false });
    });
    return true;
  }

  if (message.type === "toggleTabMute") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) {
        sendResponse({ ok: false, error: "no active tab" });
        return;
      }
      const newMuted = !tab.mutedInfo.muted;
      console.log("[sw] toggleTabMute: tab", tab.id, "muted:", tab.mutedInfo.muted, "->", newMuted);
      chrome.tabs.update(tab.id, { muted: newMuted })
        .then(() => {
          console.log("[sw] tab", tab.id, "muted =", newMuted);
          sendResponse({ ok: true, muted: newMuted });
        })
        .catch((e) => {
          console.error("[sw] tabs.update failed:", e);
          sendResponse({ ok: false, error: String(e) });
        });
    });
    return true;
  }

  if (message.type === "setPlayerVolume") {
    const tabId = sender.tab?.id;
    if (tabId != null) {
      chrome.tabs.sendMessage(tabId, {
        type: "playerVolumeChange",
        volume: message.volume
      }).catch(() => {});
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "playerVolumeChange",
            volume: message.volume
          }).catch(() => {});
        }
      });
    }
    sendResponse({ ok: true });
    return false;
  }

  if (message.type === "togglePlayerMute") {
    const tabId = sender.tab?.id;
    if (tabId != null) {
      chrome.tabs.sendMessage(tabId, {
        type: "playerMuteToggle"
      }).catch(() => {});
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "playerMuteToggle"
          }).catch(() => {});
        }
      });
    }
    sendResponse({ ok: true });
    return false;
  }

  return false;
});

const overlayWindows = new Map();

async function showOverlay(windowId) {
  if (overlayWindows.has(windowId)) {
    try {
      const win = await chrome.windows.get(overlayWindows.get(windowId));
      if (win && win.id) {
        return { ok: true };
      }
    } catch {
      overlayWindows.delete(windowId);
    }
  }

  const overlayWidth = 320;
  const overlayHeight = 110;

  try {
    const win = await chrome.windows.create({
      url: chrome.runtime.getURL("overlay/overlay.html"),
      type: "popup",
      width: overlayWidth,
      height: overlayHeight,
      focused: false
    });

    if (win && win.id) {
      overlayWindows.set(windowId, win.id);
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

async function hideOverlay(windowId) {
  const overlayId = overlayWindows.get(windowId);
  if (overlayId == null) {
    return { ok: true };
  }

  overlayWindows.delete(windowId);
  try {
    await chrome.windows.remove(overlayId);
  } catch {
    // 窗口可能已经被用户手动关闭。
  }
  return { ok: true };
}

chrome.windows.onRemoved.addListener((windowId) => {
  for (const [mainId, overlayId] of overlayWindows) {
    if (overlayId === windowId) {
      overlayWindows.delete(mainId);
      break;
    }
  }
});
