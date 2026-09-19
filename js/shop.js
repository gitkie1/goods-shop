import { supabase } from "./supabaseClient.js";
import { getCurrentUser, wireNav } from "./auth.js";
import { TOSS_CLIENT_KEY } from "./config.js";
import { escapeHtml, formatCurrency } from "./utils.js";

let user = await getCurrentUser();
wireNav();
loadProducts();

async function loadProducts() {
  const grid = document.getElementById("product-grid");
  const errorEl = document.getElementById("shop-error");
  errorEl.hidden = true;

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, description, price, image_url")
    .eq("is_active", true)
    .order("created_at");

  if (error) {
    errorEl.textContent = "상품을 불러오지 못했어요.";
    errorEl.hidden = false;
    return;
  }

  grid.innerHTML = products
    .map(
      (product) => `
      <div class="card">
        <img class="product-thumb" src="${escapeHtml(product.image_url ?? "")}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.style.background='var(--cream)'">
        <p class="product-name">${escapeHtml(product.name)}</p>
        <p class="product-desc">${escapeHtml(product.description ?? "")}</p>
        <p class="product-price">${formatCurrency(product.price)}</p>
        <button class="btn block" data-product-id="${product.id}">구매하기</button>
      </div>
    `
    )
    .join("");

  grid.querySelectorAll("button[data-product-id]").forEach((btn) => {
    const product = products.find((p) => p.id === btn.dataset.productId);
    btn.addEventListener("click", () => buyProduct(product));
  });
}

async function buyProduct(product) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const errorEl = document.getElementById("shop-error");
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
