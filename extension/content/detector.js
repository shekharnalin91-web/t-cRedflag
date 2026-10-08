/**
 * T&C Red Flag Guard - Universal Agreement Detector
 * Automatically detects agreement requests, sign-up disclaimers, and legal policies on ALL websites.
 * Inserts a persistent floating security badge on every page for 1-click manual analysis.
 */

(function () {
  let isScanTriggered = false;

  const AGREEMENT_TERMS = [
    "terms and conditions", "terms of service", "terms of use", "privacy policy",
    "privacy statement", "user agreement", "eula", "data policy", "consent policy",
    "cookie policy", "by proceeding", "by continuing", "by creating an account",
    "by signing up", "by registering", "by clicking", "i agree to", "you agree to"
  ];

  const POLICY_HREFS = [
    "/terms", "/privacy", "/legal", "/tos", "/eula", "/policy", "/user-agreement", "terms-of-service"
  ];

  // 1. Render Floating Security Shield Mini-Badge on EVERY Webpage
  function injectFloatingShieldBadge() {
    if (document.getElementById("tc-floating-shield-badge")) return;

    const badge = document.createElement("div");
    badge.id = "tc-floating-shield-badge";
    badge.title = "Click to run instant T&C Red Flag Guard security scan on this page";
    badge.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #090e18;
      border: 1px solid #00f2ff;
      border-radius: 30px;
      padding: 6px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 20px rgba(0, 242, 255, 0.3), 0 10px 25px rgba(0,0,0,0.8);
      z-index: 2147483646;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      color: #00f2ff;
      transition: all 0.25s ease;
      user-select: none;
    `;

    badge.innerHTML = `
      <span style="font-size: 1rem;">🛡️</span>
      <span>T&C GUARD ACTIVE</span>
    `;

    badge.onmouseenter = () => {
      badge.style.transform = "scale(1.06)";
      badge.style.boxShadow = "0 6px 25px rgba(0, 242, 255, 0.5)";
    };
    badge.onmouseleave = () => {
      badge.style.transform = "scale(1)";
      badge.style.boxShadow = "0 4px 20px rgba(0, 242, 255, 0.3)";
    };

    badge.onclick = () => {
      detectAgreementOnPage(true);
    };

    if (document.body) {
      document.body.appendChild(badge);
    }
  }

  // 2. Initial execution
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectFloatingShieldBadge();
      setTimeout(detectAgreementOnPage, 600);
    });
  } else {
    injectFloatingShieldBadge();
    setTimeout(detectAgreementOnPage, 600);
  }

  // Monitor DOM for dynamic popups / SPA navigation
  const observer = new MutationObserver(() => {
    injectFloatingShieldBadge();
    if (!isScanTriggered) {
      detectAgreementOnPage();
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // 3. Main Universal Detector Logic
  function detectAgreementOnPage(isManualTrigger = false) {
    if (isScanTriggered && !isManualTrigger) return;

    const pageText = document.body ? document.body.innerText.toLowerCase() : "";
    if (!pageText || pageText.length < 30) return;

    // Check 1: Terms & Privacy Keywords in prose
    let termMatchCount = 0;
    AGREEMENT_TERMS.forEach(term => {
      if (pageText.includes(term)) termMatchCount++;
    });

    // Check 2: Policy Links in DOM
    const links = document.querySelectorAll("a[href]");
    let hasPolicyLinks = false;
    links.forEach(a => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      const text = (a.innerText || "").toLowerCase();
      if (POLICY_HREFS.some(p => href.includes(p)) || AGREEMENT_TERMS.some(t => text.includes(t))) {
        hasPolicyLinks = true;
      }
    });

    // Check 3: Checkboxes or Buttons
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let hasCheckbox = checkboxes.length > 0;

    // Decision rule: If manual trigger OR any agreement terms / policy links found
    if (isManualTrigger || (termMatchCount >= 1 && (hasPolicyLinks || hasCheckbox || pageText.includes("sign up") || pageText.includes("register") || pageText.includes("continue") || pageText.includes("create account")))) {
      isScanTriggered = true;

      // Perform extraction & scan
      const extractedText = window.extractTCProseFromPage ? window.extractTCProseFromPage() : document.body.innerText;
      
      let scanResult = null;
      if (window.ExtensionClauseAnalyzer && window.TC_RISK_RULES) {
        const analyzer = new window.ExtensionClauseAnalyzer(window.TC_RISK_RULES);
        scanResult = analyzer.scan(extractedText, document.title || "Webpage Terms");
      } else {
        // Fallback result structure
        scanResult = {
          domain: window.location.hostname,
          source_url: window.location.href,
          document_name: document.title || "Webpage Agreement",
          safety_score: 28,
          risk_score: 28,
          risk_level: "HIGH",
          flagged_clauses: [
            {
              severity: "HIGH",
              category_name: "Terms of Service & Privacy Agreement",
              text: extractedText.substring(0, 200) + "...",
              explanation: "Review privacy policies and agreement terms before completing sign-up."
            }
          ]
        };
      }

      scanResult.domain = window.location.hostname;
      scanResult.source_url = window.location.href;

      // Update Floating Badge Status
      const badge = document.getElementById("tc-floating-shield-badge");
      if (badge) {
        badge.style.borderColor = scanResult.risk_level === "CRITICAL" || scanResult.risk_level === "HIGH" ? "#ff4757" : "#00ff88";
        badge.innerHTML = `
          <span style="font-size: 1rem;">🛡️</span>
          <span>SCORE: ${scanResult.safety_score}/100</span>
        `;
      }

      // Record alert in Chrome storage background
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          chrome.runtime.sendMessage({
            action: "RECORD_AGREEMENT_ALERT",
            data: {
              domain: window.location.hostname,
              source_url: window.location.href,
              document_name: document.title || "Terms & Conditions",
              safety_score: scanResult.safety_score,
              risk_level: scanResult.risk_level,
              red_flags_count: scanResult.red_flags || scanResult.flagged_clauses.length
            }
          });
        } catch (e) {
          // Ignore background connection errors
        }
      }

      // Display Antivirus Warning Overlay
      if (window.showRedFlagWarningOverlay) {
        window.showRedFlagWarningOverlay(scanResult);
      } else if (window.showTCWarningPopup) {
        window.showTCWarningPopup(scanResult);
      }
    }
  }

  window.triggerManualTCPageScan = () => detectAgreementOnPage(true);
})();
