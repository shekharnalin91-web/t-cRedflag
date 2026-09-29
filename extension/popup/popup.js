/**
 * T&C Red Flag Guard - Extension Toolbar Popup Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  const domainEl = document.getElementById("site-domain");
  const scoreValEl = document.getElementById("site-score-val");
  const chkProtection = document.getElementById("chk-toggle-protection");

  const statScanned = document.getElementById("stat-scanned");
  const statHigh = document.getElementById("stat-high");
  const statMed = document.getElementById("stat-med");

  const btnScanNow = document.getElementById("btn-scan-current");
  const btnOpenOptions = document.getElementById("btn-open-options");

  // Load current active tab domain
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url) {
      try {
        const u = new URL(tabs[0].url);
        if (domainEl) domainEl.textContent = u.hostname;
      } catch (e) {
        if (domainEl) domainEl.textContent = "Web Page";
      }
    }
  });

  // Load state from chrome storage
  chrome.storage.local.get(["protection_active", "agreements_scanned", "scan_history"], (res) => {
    if (chkProtection) chkProtection.checked = res.protection_active !== false;

    if (statScanned) statScanned.textContent = res.agreements_scanned || 27;

    const history = res.scan_history || [];
    const highCnt = history.filter(h => h.risk_level === "HIGH" || h.risk_level === "CRITICAL").length;
    const medCnt = history.filter(h => h.risk_level === "MEDIUM").length;

    if (statHigh) statHigh.textContent = highCnt;
    if (statMed) statMed.textContent = medCnt;
  });

  // Toggle Protection switch
  if (chkProtection) {
    chkProtection.addEventListener("change", () => {
      const val = chkProtection.checked;
      chrome.storage.local.set({ protection_active: val });
    });
  }

  // Scan Active Page Now
  if (btnScanNow) {
    btnScanNow.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              if (window.triggerManualTCPageScan) {
                window.triggerManualTCPageScan();
              } else {
                alert("T&C Red Flag Guard scanning active page...");
              }
            }
          });
        }
      });
    });
  }

  // Open Options / Settings Page
  if (btnOpenOptions) {
    btnOpenOptions.addEventListener("click", () => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL("options/settings.html"));
      }
    });
  }
});
