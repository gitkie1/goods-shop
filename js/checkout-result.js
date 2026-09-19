import { supabase } from "./supabaseClient.js";
import { requireLogin } from "./auth.js";
import { formatCurrency } from "./utils.js";

await requireLogin();

const resultCard = document.getElementById("result-card");
const params = new URLSearchParams(window.location.search);
const orderId = params.get("orderId");
const paymentKey = params.get("paymentKey");
const amount = params.get("amount");
const code = params.get("code");
const message = params.get("message");

const success = Boolean(orderId && paymentKey && amount) && !code;

try {
  const { data, error } = await supabase.functions.invoke("confirm-payment", {
    body: success
      ? { orderId, success: true, paymentKey }
      : { orderId, success: false, failMessage: message },
  });

  if (error) throw error;

  if (data.status === "paid") {
    resultCard.innerHTML = `
      <p>결제가 완료됐어요! 금액: ${formatCurrency(data.amount)}</p>
      <a class="btn block" href="orders.html">내 결제내역 보기</a>
    `;
  } else {
    resultCard.innerHTML = `
      <p class="error-text">결제에 실패했어요.</p>
      <a class="btn block" href="index.html">상품 목록으로</a>
    `;
  }
} catch (err) {
  resultCard.innerHTML = `
    <p class="error-text">결제 결과를 확인하지 못했어요.</p>
    <a class="btn block" href="orders.html">내 결제내역 보기</a>
  `;
}
