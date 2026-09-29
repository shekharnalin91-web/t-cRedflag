/**
 * CorruptX - Scan History Controller
 * Manages persistent client-side scan logs with localStorage,
 * badge icons (Website 🌐, PDF 📄, Screenshot 🖼️, Text 📝), restoration into Results dashboard, deletion, and export.
 */

document.addEventListener("DOMContentLoaded", () => {
  renderHistoryView();
  initHistoryControls();
});

function renderHistoryView() {
  const history = getScanHistory();
  const listContainer = document.getElementById("history-list-container");
  const emptyState = document.getElementById("history-empty-state");

  const statTotalScans = document.getElementById("stat-total-scans");
  const statAvgScore = document.getElementById("stat-avg-score");
  const statHighRiskScans = document.getElementById("stat-high-risk-scans");

  if (!listContainer) return;

  const total = history.length;
  const avg = total > 0 ? Math.round(history.reduce((acc, h) => acc + (h.safety_score !== undefined ? h.safety_score : (h.risk_score || 0)), 0) / total) : 0;
  const highRiskCount = history.filter(h => ["HIGH", "CRITICAL", "HIGH RISK"].includes(h.risk_level)).length;

  if (statTotalScans) statTotalScans.textContent = total;
  if (statAvgScore) statAvgScore.textContent = `${avg}/100`;
  if (statHighRiskScans) statHighRiskScans.textContent = highRiskCount;

  if (total === 0) {
    if (emptyState) emptyState.style.display = "block";
    listContainer.innerHTML = "";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  listContainer.innerHTML = history.map(item => {
    const score = item.safety_score !== undefined ? item.safety_score : (item.risk_score || 0);
    const level = item.risk_level || "SAFE";

    let badgeClass = "badge-safe";
    if (level === "CRITICAL") badgeClass = "badge-critical";
    else if (level === "HIGH" || level === "HIGH RISK") badgeClass = "badge-high";
    else if (level === "MEDIUM" || level === "CAUTION") badgeClass = "badge-medium";
    else if (level === "LOW") badgeClass = "badge-low";

    const dateFormatted = item.timestamp ? new Date(item.timestamp).toLocaleString() : (item.analyzed_at ? new Date(item.analyzed_at).toLocaleString() : "Recent");

    let sourceIcon = "📝 Text";
    if (item.source_type === "website" || (item.source_url && item.source_url.startsWith("http"))) sourceIcon = "🌐 Website";
    else if (item.source_type === "pdf") sourceIcon = "📄 PDF";
    else if (item.source_type === "image") sourceIcon = "🖼️ Screenshot";

    const decisionTag = item.user_decision ? `<span class="badge badge-medium" style="margin-left: 8px;">Accepted: ${item.user_decision}</span>` : "";

    return `
      <div class="card history-card" id="hist-item-${item.id}" style="margin-bottom: 16px; padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 54px; height: 54px; border-radius: 10px; background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-card); display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <span style="font-size: 1.25rem; font-weight: 800; color: #fff; line-height: 1;">${score}</span>
              <span style="font-size: 0.6rem; color: var(--text-dim); font-family: var(--font-mono);">/100</span>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="location-tag">${sourceIcon}</span>
                <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0;">${escapeHtml(item.document_name || item.full_data?.document_name || "Analyzed Document")}</h3>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; font-size: 0.8rem; color: var(--text-dim); font-family: var(--font-mono);">
                <span>${dateFormatted}</span>
                <span>•</span>
                <span>${item.full_data?.clauses_analyzed || 0} Clauses</span>
                <span>•</span>
                <span>${item.full_data?.red_flags || 0} Red Flags</span>
                ${decisionTag}
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="badge ${badgeClass}">${level} RISK</span>
            <button class="btn btn-outline btn-sm btn-view-scan" data-id="${item.id}">
              Open Analysis
            </button>
            <button class="btn btn-outline btn-sm btn-delete-scan" data-id="${item.id}" title="Delete Record">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  listContainer.querySelectorAll(".btn-view-scan").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const record = history.find(h => h.id === id);
      if (record && record.full_data) {
        setActiveScan(record.full_data);
        window.location.href = "results.html";
      }
    });
  });

  listContainer.querySelectorAll(".btn-delete-scan").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      deleteHistoryItem(id);
    });
  });
}

function deleteHistoryItem(id) {
  let history = getScanHistory();
  history = history.filter(h => h.id !== id);
  localStorage.setItem("corruptx_tc_scan_history", JSON.stringify(history));
  showToast("Scan record deleted", "info");
  renderHistoryView();
}

function initHistoryControls() {
  const btnClearAll = document.getElementById("btn-clear-history");
  if (btnClearAll) {
    btnClearAll.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all scan history logs?")) {
        localStorage.removeItem("corruptx_tc_scan_history");
        showToast("Cleared all scan history", "info");
        renderHistoryView();
      }
    });
  }
}
