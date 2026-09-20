import { supabase } from "./supabaseClient.js";
import { getCurrentUser, wireNav } from "./auth.js";
import { TOSS_CLIENT_KEY } from "./config.js";
import { escapeHtml, formatCurrency } from "./utils.js";

let user = await getCurrentUser();
wireNav();

const productId = new URLSearchParams(window.location.search).get("id");
let product = null;
let widgets = null;

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

  if (!user) {
    detailEl.innerHTML = `
      <img class="detail-thumb" src="${escapeHtml(product.image_url ?? "")}" alt="${escapeHtml(product.name)}" onerror="this.style.background='var(--cream)'">
      <p class="product-name">${escapeHtml(product.name)}</p>
      <p class="product-desc">${escapeHtml(product.description ?? "")}</p>
      <p class="product-price">${formatCurrency(product.price)}</p>
      <button class="btn block" id="buy-btn">구매하기</button>
    `;
    document.getElementById("buy-btn")?.addEventListener("click", () => {
      window.location.href = "login.html";
    });
    return;
  }

  detailEl.innerHTML = `
    <img class="detail-thumb" src="${escapeHtml(product.image_url ?? "")}" alt="${escapeHtml(product.name)}" onerror="this.style.background='var(--cream)'">
    <p class="product-name">${escapeHtml(product.name)}</p>
    <p class="product-desc">${escapeHtml(product.description ?? "")}</p>
    <p class="product-price">${formatCurrency(product.price)}</p>
    <div class="payment-widget-block" id="payment-method"></div>
    <div class="payment-widget-block" id="agreement"></div>
    <button class="btn block" id="buy-btn">결제하기</button>
  `;

  document.getElementById("buy-btn")?.addEventListener("click", buyProduct);
  await renderPaymentWidget();
}

async function renderPaymentWidget() {
  const tossPayments = TossPayments(TOSS_CLIENT_KEY);
  widgets = tossPayments.widgets({ customerKey: user.id });
  await widgets.setAmount({ currency: "KRW", value: product.price });
  await Promise.all([
    widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
    widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
  ]);
}

async function buyProduct() {
  const errorEl = document.getElementById("detail-error");
  errorEl.hidden = true;

  try {
    const { data, error } = await supabase.functions.invoke("create-order", {
      body: { productId: product.id, quantity: 1 },
    });
    if (error) throw error;

    const { orderId, orderName } = data;
    const dir = window.location.pathname.replace(/[^/]*$/, "");
    const resultUrl = `${window.location.origin}${dir}checkout-result.html`;

    await widgets.requestPayment({
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
