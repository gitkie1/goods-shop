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

function showInstallBanner(message, onInstall) {
  const banner = document.createElement("div");
  banner.className = "pwa-install-banner";
  banner.innerHTML = `
    <span>${message}</span>
    <div class="pwa-install-actions">
      ${onInstall ? '<button type="button" class="pwa-install-btn">설치</button>' : ""}
      <button type="button" class="pwa-install-close" aria-label="닫기">&times;</button>
    </div>
  `;
  document.body.appendChild(banner);

  banner.querySelector(".pwa-install-close").addEventListener("click", () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    banner.remove();
  });

  if (onInstall) {
    banner.querySelector(".pwa-install-btn").addEventListener("click", () => {
      banner.remove();
      onInstall();
    });
  }
}

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = /android/i.test(navigator.userAgent);

if (!isStandalone() && !isDismissed() && (isIOS || isAndroid)) {
  if (isIOS) {
    showInstallBanner("Safari 공유 버튼을 누른 뒤 '홈 화면에 추가'를 선택해보세요.");
  } else {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      showInstallBanner("홈 화면에 추가하고 앱처럼 사용해보세요.", () => event.prompt());
    });
  }
}
