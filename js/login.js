import { supabase } from "./supabaseClient.js";
import { signIn, signUp } from "./auth.js";

const {
  data: { user },
} = await supabase.auth.getUser();
if (user) {
  window.location.href = "shop.html";
}

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    await signIn(email, password);
    window.location.href = "shop.html";
  } catch (err) {
    loginError.textContent = "로그인에 실패했어요. 이메일/비밀번호를 확인해주세요.";
    loginError.hidden = false;
  }
});

const signupForm = document.getElementById("signup-form");
const signupError = document.getElementById("signup-error");
const signupNotice = document.getElementById("signup-notice");

signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupError.hidden = true;
  signupNotice.hidden = true;
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  try {
    await signUp(email, password);
    signupNotice.textContent = "가입 완료! 위에서 로그인해주세요.";
    signupNotice.hidden = false;
    signupForm.reset();
  } catch (err) {
    signupError.textContent = "회원가입에 실패했어요. 다시 시도해주세요.";
    signupError.hidden = false;
  }
});
