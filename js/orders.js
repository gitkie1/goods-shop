import { supabase } from "./supabaseClient.js";
import { requireLogin, wireNav } from "./auth.js";
import { escapeHtml, formatCurrency, formatDateTime, statusBadge, renderOrdersTable } from "./utils.js";

const user = await requireLogin();
if (user) {
  wireNav();
  loadOrders(user.id);
}

const columns = [
  { value: (o) => escapeHtml(o.products?.name ?? "-") },
  { value: (o) => o.quantity },
  { value: (o) => formatCurrency(o.amount) },
  { value: (o) => statusBadge(o.status) },
  { value: (o) => formatDateTime(o.created_at) },
];

async function loadOrders(userId) {
  const tbody = document.getElementById("orders-body");
  const emptyEl = document.getElementById("orders-empty");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, quantity, amount, status, created_at, products(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    emptyEl.textContent = "결제내역을 불러오지 못했어요.";
    emptyEl.hidden = false;
    return;
  }

  renderOrdersTable({ tbody, emptyEl, orders, columns });
}
