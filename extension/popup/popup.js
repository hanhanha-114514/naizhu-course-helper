"use strict";

const $ = (selector) => document.querySelector(selector);

const el = {
  siteUrl: $("#siteUrl"),
  timerSelector: $("#timerSelector"),
  playerSelector: $("#playerSelector"),
  targetTime: $("#targetTime"),
  save: $("#save"),
  saveText: $("#saveText"),
  statusCard: $("#statusCard"),
  siteLabel: $("#siteLabel"),
  siteUrlText: $("#siteUrlText"),
  permBadge: $("#permBadge"),
  regText: $("#regText"),
  statusDot: $("#statusDot"),
  openSite: $("#openSite"),
  removeSite: $("#removeSite"),
  message: $("#message")
};

let current = null;
let busy = false;

function normalizeSite(input) {
  let raw = String(input || "").trim();

  if (!raw) {
    throw new Error("请先填写网站地址。");
  }

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
    const lower = raw.toLowerCase();
    const isLocal =
      lower.startsWith("localhost") ||
      lower.startsWith("127.0.0.1") ||
      lower.startsWith("[::1]");
    raw = `${isLocal ? "http" : "https"}://${raw}`;
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("网站地址格式不正确。");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("只支持 http:// 或 https:// 网站。");
  }

  if (!url.hostname) {
    throw new Error("网站地址缺少域名。");
  }

  return {
    href: url.href,
    origin: url.origin,
    pattern: `${url.origin}/*`
  };
}

function setMessage(text, tone = "") {
  el.message.textContent = text || "";
  el.message.classList.toggle("error", tone === "error");
  el.message.classList.toggle("success", tone === "success");
}

function setBusy(next) {
  busy = next;
  el.save.disabled = next;
  el.openSite.disabled = next || !current?.config?.siteUrl;
  el.removeSite.disabled = next || !current?.config?.sitePattern;
  el.saveText.textContent = next ? "正在处理…" : "保存并授权";
}

function fillInputs(config = {}) {
  el.siteUrl.value = config.siteUrl || "";
  el.timerSelector.value = config.timerSelector || "";
  el.playerSelector.value = config.playerSelector || "";
  el.targetTime.value = config.targetTime || "";
}

function renderStatus(status) {
  current = status;
  const config = status?.config || {};
  const hasSite = Boolean(config.sitePattern);
  const granted = Boolean(status?.granted);
  const registered = Boolean(status?.registered);

  let host = "已配置";
  if (hasSite) {
    try {
      host = new URL(config.siteUrl).host;
    } catch {
      host = config.siteUrl;
    }
  }

  el.statusCard.classList.toggle("configured", hasSite);
  el.siteLabel.textContent = hasSite ? host : "尚未配置";
  el.siteUrlText.textContent = hasSite ? config.siteUrl : "填写你的网站地址开始使用";
  el.siteUrlText.title = hasSite ? config.siteUrl : "";

  el.permBadge.textContent = granted ? "已授权" : "未授权";
  el.permBadge.classList.toggle("granted", granted);

  if (!hasSite) {
    el.regText.textContent = "面板未注册";
  } else if (!granted) {
    el.regText.textContent = "等待站点授权";
  } else if (registered) {
    el.regText.textContent = "面板已注册 · 刷新页面生效";
  } else {
    el.regText.textContent = "面板注册失败，请重新保存";
  }

  el.openSite.disabled = busy || !hasSite;
  el.removeSite.disabled = busy || !hasSite;

  if (hasSite && document.activeElement !== el.siteUrl) {
    fillInputs(config);
  }
}

async function send(message) {
  const response = await chrome.runtime.sendMessage(message);
  if (!response) {
    throw new Error("扩展后台没有响应，请在扩展管理页重新加载。");
  }
  if (response.ok === false) {
    throw new Error(response.error || "操作失败。");
  }
  return response;
}

async function loadStatus() {
  try {
    const status = await send({ type: "getStatus" });
    renderStatus(status);
  } catch (error) {
    setMessage(error.message || String(error), "error");
  }
}

async function saveSite() {
  if (busy) {
    return;
  }

  let site;
  try {
    site = normalizeSite(el.siteUrl.value);
  } catch (error) {
    setMessage(error.message, "error");
    el.siteUrl.focus();
    return;
  }

  setBusy(true);
  setMessage("正在请求该网站的访问权限…");

  try {
    await send({
      type: "prepareSite",
      pattern: site.pattern,
      siteUrl: site.href,
      timerSelector: el.timerSelector.value,
      playerSelector: el.playerSelector.value,
      targetTime: el.targetTime.value,
      nextSelector: ""
    });

    const granted = await chrome.permissions.request({ origins: [site.pattern] });
    if (!granted) {
      await send({ type: "clearPending" }).catch(() => {});
      setMessage("你取消了授权，面板不会注入该网站。", "error");
      return;
    }

    const result = await send({
      type: "applySite",
      pattern: site.pattern,
      siteUrl: site.href,
      timerSelector: el.timerSelector.value,
      playerSelector: el.playerSelector.value,
      targetTime: el.targetTime.value,
      nextSelector: ""
    });

    renderStatus(result);
    fillInputs(result.config);
    setMessage("已保存。打开页面并刷新后，右下角会出现监测面板。", "success");
  } catch (error) {
    setMessage(error.message || String(error), "error");
  } finally {
    setBusy(false);
    await loadStatus();
  }
}

async function removeSite() {
  if (busy) {
    return;
  }

  setBusy(true);
  setMessage("正在移除授权…");

  try {
    const result = await send({ type: "removeSite" });
    renderStatus(result);
    fillInputs({});
    setMessage("已移除授权和面板。", "success");
  } catch (error) {
    setMessage(error.message || String(error), "error");
  } finally {
    setBusy(false);
  }
}

function openSite() {
  const url = current?.config?.siteUrl;
  if (!url) {
    setMessage("请先保存一个网站地址。", "error");
    return;
  }
  chrome.tabs.create({ url });
}

el.save.addEventListener("click", saveSite);
el.openSite.addEventListener("click", openSite);
el.removeSite.addEventListener("click", removeSite);

el.siteUrl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    saveSite();
  }
});

el.targetTime.addEventListener("change", async () => {
  await chrome.storage.local.set({ targetTime: el.targetTime.value });
});

el.targetTime.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    chrome.storage.local.set({ targetTime: el.targetTime.value });
    setMessage("目标学时已保存", "success");
  }
});

// ── Password auto-fill ──

const pw = {
  card: document.getElementById("pwCard"),
  toggle: document.getElementById("pwToggle"),
  arrow: document.getElementById("pwArrow"),
  body: document.getElementById("pwBody"),
  master: document.getElementById("masterPw"),
  login: document.getElementById("loginPw"),
  loginField: document.getElementById("loginField"),
  hint: document.getElementById("pwHint"),
  save: document.getElementById("pwSave"),
  fill: document.getElementById("pwFill"),
  reset: document.getElementById("pwReset")
};

let pwUnlocked = false;
let pwOpen = false;
let sessionMaster = "";

function setPwMode(hasMaster) {
  if (hasMaster) {
    pw.hint.textContent = "输入主密码解锁已保存的密码。";
    pw.loginField.style.display = "none";
    pw.save.style.display = "none";
    pw.fill.style.display = "";
    pw.reset.style.display = "";
  } else {
    pw.hint.textContent = "首次使用：设置主密码，然后输入要自动填充的登录密码并保存。";
    pw.loginField.style.display = "";
    pw.save.style.display = "";
    pw.fill.style.display = "none";
    pw.reset.style.display = "none";
  }
}

pw.toggle.addEventListener("click", () => {
  pwOpen = !pwOpen;
  pw.body.classList.toggle("open", pwOpen);
  pw.toggle.classList.toggle("open", pwOpen);
});

async function getPwState() {
  const data = await chrome.storage.local.get(["pwHash", "encPassword"]);
  return { hasMaster: Boolean(data.pwHash), encPassword: data.encPassword || null };
}

async function initPw() {
  const state = await getPwState();
  setPwMode(state.hasMaster);
}

pw.master.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const master = pw.master.value;
  if (!master) return;

  const state = await getPwState();

  if (state.hasMaster) {
    const hash = await PwCrypto.hashPassword(master);
    const stored = await chrome.storage.local.get("pwHash");
    if (hash !== stored.pwHash) {
      setMessage("主密码错误", "error");
      return;
    }
    pwUnlocked = true;
    sessionMaster = master;
    pw.hint.textContent = "已解锁。点击「自动填充」在页面中填入密码。";
    pw.master.type = "text";
    pw.master.value = "●●●●●●●●";
    pw.master.disabled = true;
    pw.fill.style.display = "";
    setMessage("主密码验证成功", "success");
  } else {
    if (master.length < 4) {
      setMessage("主密码至少 4 个字符", "error");
      return;
    }
    const loginPw = pw.login.value.trim();
    if (!loginPw) {
      setMessage("请填写要保存的登录密码", "error");
      pw.login.focus();
      return;
    }
    const hash = await PwCrypto.hashPassword(master);
    const encrypted = await PwCrypto.encrypt(loginPw, master);
    await chrome.storage.local.set({ pwHash: hash, encPassword: encrypted });
    pwUnlocked = true;
    sessionMaster = master;
    setPwMode(true);
    pw.master.type = "text";
    pw.master.value = "●●●●●●●●";
    pw.master.disabled = true;
    pw.login.value = "";
    pw.login.disabled = true;
    pw.save.style.display = "none";
    pw.fill.style.display = "";
    pw.reset.style.display = "";
    setMessage("密码已加密保存", "success");
  }
});

pw.fill.addEventListener("click", async () => {
  if (!pwUnlocked || !sessionMaster) {
    setMessage("请先输入主密码解锁", "error");
    return;
  }
  const data = await chrome.storage.local.get("encPassword");
  if (!data.encPassword) {
    setMessage("未找到已保存的密码", "error");
    return;
  }
  try {
    const password = await PwCrypto.decrypt(data.encPassword, sessionMaster);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setMessage("无法获取当前标签页", "error");
      return;
    }
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: (pw) => {
        const fields = document.querySelectorAll(
          'input[type="password"], input[name*="pass" i], input[id*="pass" i], input[name*="pw" i]'
        );
        let filled = 0;
        fields.forEach((f) => {
          const nativeSet = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype, "value"
          ).set;
          nativeSet.call(f, pw);
          f.dispatchEvent(new Event("input", { bubbles: true }));
          f.dispatchEvent(new Event("change", { bubbles: true }));
          filled++;
        });
        return filled;
      },
      args: [password],
      world: "MAIN"
    }).catch(() => {});
    setMessage("密码已填充到页面", "success");
  } catch (err) {
    setMessage("解密失败：" + (err.message || err), "error");
  }
});

pw.reset.addEventListener("click", async () => {
  if (!confirm("确定要重置保存的密码吗？此操作不可恢复。")) return;
  await chrome.storage.local.remove(["pwHash", "encPassword"]);
  pwUnlocked = false;
  sessionMaster = "";
  pw.master.disabled = false;
  pw.master.type = "password";
  pw.master.value = "";
  pw.login.disabled = false;
  pw.login.value = "";
  setPwMode(false);
  setMessage("已重置密码", "success");
});

initPw();

chrome.permissions.onAdded.addListener(() => {
  void loadStatus();
});

chrome.permissions.onRemoved.addListener(() => {
  void loadStatus();
});

loadStatus();
