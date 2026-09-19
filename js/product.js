import { supabase } from "./supabaseClient.js";
import { getCurrentUser, wireNav } from "./auth.js";
import { TOSS_CLIENT_KEY } from "./config.js";
import { escapeHtml, formatCurrency } from "./utils.js";

let user = await getCurrentUser();
wireNav();

const productId = new URLSearchParams(window.location.search).get("id");
let product = null;

await loadProduct();

async function loadProduct() {
  const detailEl = document.getElementById("product-detail");
  const errorEl = document.getElementById("detail-error");
  errorEl.hidden = true;

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, image_url")
    .eq("id", productId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    errorEl.textContent = "상품을 찾을 수 없어요.";
    errorEl.hidden = false;
    return;
  }

  product = data;
  detailEl.innerHTML = `
    <img class="detail-thumb" src="${escapeHtml(product.image_url ?? "")}" alt="${escapeHtml(product.name)}" onerror="this.style.background='var(--cream)'">
    <p class="product-name">${escapeHtml(product.name)}</p>
    <p class="product-desc">${escapeHtml(product.description ?? "")}</p>
    <p class="product-price">${formatCurrency(product.price)}</p>
    <button class="btn block" id="buy-btn">구매하기</button>
  `;

  document.getElementById("buy-btn")?.addEventListener("click", buyProduct);
}

async function buyProduct() {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const errorEl = document.getElementById("detail-error");
  errorEl.hidden = true;

  try {
    const { data, error } = await supabase.functions.invoke("create-order", {
      body: { productId: product.id, quantity: 1 },
    });
    if (error) throw error;

    const { orderId, amount, orderName } = data;
    const dir = window.location.pathname.replace(/[^/]*$/, "");
    const resultUrl = `${window.location.origin}${dir}checkout-result.html`;

    const tossPayments = TossPayments(TOSS_CLIENT_KEY);
    const payment = tossPayments.payment({ customerKey: user.id });
    await payment.requestPayment({
      method: "CARD",
      amount: { currency: "KRW", value: amount },
      orderId,
      orderName,
      successUrl: resultUrl,
      failUrl: resultUrl,
    });
  } catch (err) {
    errorEl.textContent = "결제를 시작하지 못했어요.";
    errorEl.hidden = false;
  }
}
