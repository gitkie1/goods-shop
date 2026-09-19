import { supabase } from "./supabaseClient.js";
import { signIn, signUp } from "./auth.js";

const {
  data: { user },
} = await supabase.auth.getUser();
if (user) {
  window.location.href = "index.html";
}

const form = document.getElementById("auth-form");
const errorEl = document.getElementById("auth-error");
const noticeEl = document.getElementById("auth-notice");

function getCredentials() {
  return {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
  };
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  noticeEl.hidden = true;
  const { email, password } = getCredentials();

  try {
    await signIn(email, password);
    window.location.href = "index.html";
  } catch (err) {
    errorEl.textContent = "로그인에 실패했어요. 이메일/비밀번호를 확인해주세요.";
    errorEl.hidden = false;
  }
});

document.getElementById("signup-btn")?.addEventListener("click", async () => {
  errorEl.hidden = true;
  noticeEl.hidden = true;
  const { email, password } = getCredentials();

  try {
    await signUp(email, password);
    noticeEl.textContent = "가입 완료! 로그인 버튼을 눌러주세요.";
    noticeEl.hidden = false;
  } catch (err) {
    errorEl.textContent = "회원가입에 실패했어요. 다시 시도해주세요.";
    errorEl.hidden = false;
  }
});
