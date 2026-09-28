if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

const DISMISS_KEY = "pwa-install-dismissed-v2";
const DISMISS_DAYS = 14;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isDismissed() {
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
  if (!dismissedAt) return false;
  const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return days < DISMISS_DAYS;
}

function showInstallButton(onClick) {
  const wrap = document.createElement("div");
  wrap.className = "pwa-install";
  wrap.innerHTML = `
    <button type="button" class="pwa-install-btn">&#8595; 앱 설치</button>
    <button type="button" class="pwa-install-close" aria-label="닫기">&times;</button>
  `;
  document.body.appendChild(wrap);

  wrap.querySelector(".pwa-install-close").addEventListener("click", () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    wrap.remove();
  });

  wrap.querySelector(".pwa-install-btn").addEventListener("click", (e) => onClick(e.currentTarget, wrap));
}

const ua = navigator.userAgent;
const isIOS = /iphone|ipad|ipod/i.test(ua);
const isMobile = isIOS || /android|mobile/i.test(ua);
const isInApp = /kakaotalk|naver|instagram|fban|fbav|line\//i.test(ua);

let installPrompt = null;

function onInstallClick(btn, wrap) {
  if (installPrompt) {
    // 크롬·엣지: 바로 설치 창이 뜸
    wrap.remove();
    installPrompt.prompt();
  } else if (isInApp) {
    btn.textContent = "크롬·사파리로 열어서 설치해주세요";
  } else if (isIOS) {
    btn.textContent = "공유 → '홈 화면에 추가'";
  } else {
    btn.textContent = "메뉴(⋮) → '홈 화면에 추가'";
  }
}

if (!isStandalone() && !isDismissed()) {
  // 모바일은 항상 버튼을 보여줌 (설치 창을 못 띄우는 브라우저면 누를 때 방법 안내)
  if (isMobile) showInstallButton(onInstallClick);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    if (!document.querySelector(".pwa-install")) showInstallButton(onInstallClick);
  });
}

window.addEventListener("appinstalled", () => {
  document.querySelector(".pwa-install")?.remove();
});
