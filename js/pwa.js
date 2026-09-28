if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

const INSTALLED_KEY = "pwa-installed";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

// 설치된 앱으로 열렸으면 "설치됨"으로 기억 (안드로이드는 브라우저와 기록을 공유함)
if (isStandalone()) localStorage.setItem(INSTALLED_KEY, "1");

function isInstalled() {
  return isStandalone() || localStorage.getItem(INSTALLED_KEY) === "1";
}

let closed = false;

function showInstallButton(onClick) {
  if (closed || document.querySelector(".pwa-install")) return;
  const wrap = document.createElement("div");
  wrap.className = "pwa-install";
  wrap.innerHTML = `
    <button type="button" class="pwa-install-btn">&#8595; 앱 설치</button>
    <button type="button" class="pwa-install-close" aria-label="닫기">&times;</button>
  `;
  document.body.appendChild(wrap);

  // 닫기는 지금 보는 페이지에서만 숨김 (설치 전까지 다음 페이지·방문 때 다시 뜸)
  wrap.querySelector(".pwa-install-close").addEventListener("click", () => {
    closed = true;
    wrap.remove();
  });

  wrap.querySelector(".pwa-install-btn").addEventListener("click", (e) => onClick(e.currentTarget));
}

const ua = navigator.userAgent;
const isIOS = /iphone|ipad|ipod/i.test(ua);
const isMobile = isIOS || /android|mobile/i.test(ua);
const isInApp = /kakaotalk|naver|instagram|fban|fbav|line\//i.test(ua);

let installPrompt = null;

function onInstallClick(btn) {
  if (installPrompt) {
    // 크롬·엣지·삼성인터넷: 설치 확인 창이 뜸 (설치되면 appinstalled 에서 버튼 제거)
    installPrompt.prompt();
    installPrompt = null;
  } else if (isInApp) {
    btn.textContent = "크롬·사파리로 열어서 설치해주세요";
  } else if (isIOS) {
    btn.textContent = "공유 → '홈 화면에 추가'";
  } else {
    btn.textContent = "메뉴(⋮) → '홈 화면에 추가'";
  }
}

// 모바일은 설치 전까지 항상 버튼을 보여줌
if (isMobile && !isInstalled()) showInstallButton(onInstallClick);

// 브라우저가 "설치 가능"이라고 알려주면 = 아직 설치 안 된 상태 (지웠다면 기록도 초기화)
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  localStorage.removeItem(INSTALLED_KEY);
  installPrompt = event;
  if (!isStandalone()) showInstallButton(onInstallClick);
});

window.addEventListener("appinstalled", () => {
  localStorage.setItem(INSTALLED_KEY, "1");
  document.querySelector(".pwa-install")?.remove();
});
