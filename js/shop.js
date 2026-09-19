import { supabase } from "./supabaseClient.js";
import { getCurrentUser, wireNav } from "./auth.js";
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
      <a class="card" href="product.html?id=${encodeURIComponent(product.id)}">
        <img class="product-thumb" src="${escapeHtml(product.image_url ?? "")}" alt="${escapeHtml(product.name)}" onerror="this.style.background='var(--cream)'">
        <p class="product-name">${escapeHtml(product.name)}</p>
        <p class="product-desc">${escapeHtml(product.description ?? "")}</p>
        <p class="product-price">${formatCurrency(product.price)}</p>
        <span class="btn block">구매하기</span>
      </a>
    `
    )
    .join("");
}
