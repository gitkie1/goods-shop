if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

const DISMISS_KEY = "pwa-install-dismissed";
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

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

if (!isStandalone() && !isDismissed()) {
  if (isIOS) {
    // 아이폰은 자동 설치가 안 돼서, 누르면 방법을 안내
    showInstallButton((btn) => {
      btn.textContent = "공유 → '홈 화면에 추가'";
    });
  } else {
    // 크롬·엣지(PC/안드로이드): 누르면 바로 설치 창이 뜸
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      if (document.querySelector(".pwa-install")) return;
      showInstallButton((btn, wrap) => {
        wrap.remove();
        event.prompt();
      });
    });
  }
}

window.addEventListener("appinstalled", () => {
  document.querySelector(".pwa-install")?.remove();
});
