/**
 * T&C Red Flag Guard - Background Service Worker (Manifest V3)
 * Manages extension state, storage, protection settings, and background messaging.
 */

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    protection_active: true,
    protection_mode: "medium_high", // 'always_warn' | 'medium_high' | 'silent' | 'disabled'
    local_scanner_active: true,
    cloud_analysis_enabled: false,
    agreements_scanned: 27,
    scan_history: [
      {
        id: "hist_1",
        domain: "unknown-site.com",
        source_url: "https://unknown-site.com/terms",
        document_name: "Terms of Service",
        safety_score: 42,
        risk_level: "HIGH",
        timestamp: new Date().toISOString(),
        red_flags_count: 5
      },
      {
        id: "hist_2",
        domain: "example-shop.com",
        source_url: "https://example-shop.com/privacy",
        document_name: "Privacy Policy",
        safety_score: 63,
        risk_level: "MEDIUM",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        red_flags_count: 3
      },
      {
        id: "hist_3",
        domain: "safe-site.com",
        source_url: "https://safe-site.com/terms",
        document_name: "Terms of Use",
        safety_score: 91,
        risk_level: "LOW",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        red_flags_count: 0
      }
    ]
  });
  console.log("T&C Red Flag Guard Service Worker Initialized.");
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_SETTINGS") {
    chrome.storage.local.get([
      "protection_active",
      "protection_mode",
      "local_scanner_active",
      "cloud_analysis_enabled"
    ], (res) => sendResponse(res));
    return true;
  }

  if (message.action === "RECORD_AGREEMENT_ALERT") {
    chrome.storage.local.get(["scan_history", "agreements_scanned"], (res) => {
      const history = res.scan_history || [];
      const totalScanned = (res.agreements_scanned || 0) + 1;

      const record = {
        id: "hist_" + Date.now(),
        domain: message.data.domain,
        source_url: message.data.source_url,
        document_name: message.data.document_name,
        safety_score: message.data.safety_score,
        risk_level: message.data.risk_level,
        timestamp: new Date().toISOString(),
        red_flags_count: message.data.red_flags_count,
        user_decision: message.data.user_decision || "alerted"
      };

      history.unshift(record);
      chrome.storage.local.set({
        scan_history: history.slice(0, 50),
        agreements_scanned: totalScanned
      });
      sendResponse({ status: "success", totalScanned });
    });
    return true;
  }

  if (message.action === "TOGGLE_PROTECTION") {
    chrome.storage.local.set({ protection_active: message.value }, () => {
      sendResponse({ status: "success", protection_active: message.value });
    });
    return true;
  }
});
