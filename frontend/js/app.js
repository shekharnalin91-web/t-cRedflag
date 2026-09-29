/**
 * CorruptX - Shared Application Logic
 * Offline-first Architecture & Client Utilities
 */

const AppState = {
  apiBase: "",
  isBackendAvailable: false,
  offlineMode: false
};

// SVG Icon Collection (Zero CDN dependencies)
const ICONS = {
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  externalLink: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  detectBackendStatus();
  highlightActiveNav();
});

/**
 * Mobile navigation drawer
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector(".mobile-menu-btn");
  const nav = document.querySelector(".main-nav");
  if (toggleBtn && nav) {
    toggleBtn.addEventListener("click", () => {
      nav.classList.toggle("mobile-open");
    });
  }
}

/**
 * Active navigation link highlighter
 */
function highlightActiveNav() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href && (path.endsWith(href) || (href === "/" && (path === "/" || path.endsWith("index.html"))))) {
      link.classList.add("active");
    }
  });
}

/**
 * Detect whether the local Flask backend is reachable.
 * If not, gracefully switch to the built-in offline engine.
 */
async function detectBackendStatus() {
  const statusEl = document.getElementById("system-status-indicator");
  const statusText = document.getElementById("system-status-text");

  // Determine potential API roots
  let candidates = ["/api/health"];
  if (window.location.protocol === "file:" || window.location.port !== "5000") {
    candidates.unshift("http://127.0.0.1:5000/api/health");
  }

  let healthy = false;
  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: "GET", mode: "cors", cache: "no-cache" });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "healthy") {
          AppState.isBackendAvailable = true;
          AppState.apiBase = url.replace("/api/health", "");
          healthy = true;
          break;
        }
      }
    } catch (e) {
      // Backend not running on this candidate
    }
  }

  if (healthy) {
    if (statusText) statusText.textContent = "ENGINE ONLINE (FLASK)";
  } else {
    AppState.isBackendAvailable = false;
    AppState.offlineMode = true;
    if (statusText) statusText.textContent = "OFFLINE ENGINE ACTIVE";
    if (statusEl) {
      statusEl.style.borderColor = "rgba(0, 242, 255, 0.4)";
      statusEl.style.color = "var(--accent-cyan)";
      const dot = statusEl.querySelector(".status-dot");
      if (dot) {
        dot.style.background = "var(--accent-cyan)";
        dot.style.boxShadow = "0 0 8px var(--accent-cyan)";
      }
    }
  }
}

/**
 * Toast Notification System
 */
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * LocalStorage Scan History & Active Scan Manager
 * Includes memory fallback and auto-pruning to prevent QuotaExceededError
 */
const HISTORY_KEY = "corruptx_tc_scan_history";
const CURRENT_SCAN_KEY = "corruptx_tc_active_scan";

// In-memory global fallback to ensure scan is never lost during page transitions
window.__CORRUPTX_ACTIVE_SCAN__ = null;

function getScanHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read scan history:", e);
    return [];
  }
}

/**
 * Creates a lightweight version of scan data for persistent history storage
 */
function createLightweightScanRecord(scanResult) {
  // Prune large repetitive content to prevent LocalStorage quota overflow
  const cleanResult = { ...scanResult };
  
  // Keep only up to 50 clauses in all_clauses for history preview to keep size small
  if (Array.isArray(cleanResult.all_clauses) && cleanResult.all_clauses.length > 50) {
    cleanResult.all_clauses = cleanResult.all_clauses.slice(0, 50).map(c => ({
      index: c.index,
      snippet: (c.text || "").substring(0, 150) + "...",
      is_flagged: c.is_flagged
    }));
  }

  return {
    id: "scan_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    document_name: scanResult.document_name || "Submitted Policy",
    analyzed_at: scanResult.analyzed_at || new Date().toISOString(),
    risk_score: scanResult.risk_score,
    risk_level: scanResult.risk_level,
    clauses_analyzed: scanResult.clauses_analyzed,
    red_flags: scanResult.red_flags,
    severity_counts: scanResult.severity_counts,
    full_data: cleanResult
  };
}

function saveScanToHistory(scanResult) {
  try {
    const history = getScanHistory();
    const record = createLightweightScanRecord(scanResult);

    // Prepend new scan
    history.unshift(record);
    // Keep last 20 scans max
    let trimmed = history.slice(0, 20);

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (quotaErr) {
      console.warn("LocalStorage quota reached, pruning older history items...");
      // Strip full_data from older items if quota is tight
      trimmed = trimmed.slice(0, 5).map((item, idx) => {
        if (idx > 0 && item.full_data) {
          delete item.full_data.all_clauses;
        }
        return item;
      });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    }
    return record.id;
  } catch (e) {
    console.error("Failed to save scan history:", e);
  }
}

function deleteScanHistoryItem(id) {
  try {
    const history = getScanHistory().filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to delete item:", e);
  }
}

function clearScanHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error("Failed to clear history:", e);
  }
}

function setActiveScan(scanResult) {
  // Always update in-memory cache
  window.__CORRUPTX_ACTIVE_SCAN__ = scanResult;
  try {
    sessionStorage.setItem(CURRENT_SCAN_KEY, JSON.stringify(scanResult));
  } catch (e) {
    console.warn("SessionStorage failed to set active scan, falling back to in-memory/localStorage:", e);
    try {
      // Try saving lightweight version if session storage full
      const light = createLightweightScanRecord(scanResult).full_data;
      sessionStorage.setItem(CURRENT_SCAN_KEY, JSON.stringify(light));
    } catch (e2) {
      console.warn("SessionStorage quota exceeded completely. Active scan preserved in memory.");
    }
  }
}

function getActiveScan() {
  if (window.__CORRUPTX_ACTIVE_SCAN__) {
    return window.__CORRUPTX_ACTIVE_SCAN__;
  }
  try {
    const raw = sessionStorage.getItem(CURRENT_SCAN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      window.__CORRUPTX_ACTIVE_SCAN__ = parsed;
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load active scan from sessionStorage:", e);
  }

  // Fallback to latest history scan
  const history = getScanHistory();
  if (history.length > 0 && history[0].full_data) {
    window.__CORRUPTX_ACTIVE_SCAN__ = history[0].full_data;
    return history[0].full_data;
  }

  return null;
}
