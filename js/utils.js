export const STATUS_LABEL = { pending: "대기중", paid: "결제완료", failed: "실패" };

export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

export function formatCurrency(amount) {
  return amount != null ? `${Number(amount).toLocaleString()}원` : "-";
}

export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("ko-KR");
}

export function statusBadge(status) {
  return `<span class="badge ${status}">${STATUS_LABEL[status] ?? status}</span>`;
}

// columns: [{ value: (order) => string }] — orders.js/admin.js가 각자 컬럼을 넘기고,
// 이 함수는 "비어있음 vs 행 렌더링" 분기 + row 빌드 루프만 공용화한다(호출부 2곳 뿐이라 과한 추상화는 피함).
export function renderOrdersTable({ tbody, emptyEl, orders, columns }) {
  if (!orders?.length) {
    tbody.innerHTML = "";
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  tbody.innerHTML = orders
    .map((order) => `<tr>${columns.map((col) => `<td>${col.value(order)}</td>`).join("")}</tr>`)
    .join("");
}
