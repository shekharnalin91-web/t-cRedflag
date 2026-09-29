/**
 * T&C Red Flag Guard - Multi-Signal Agreement Detector
 * Monitors DOM mutations and visible text to detect when a webpage asks users to agree to terms.
 */

(function () {
  let isScanTriggered = false;

  const AGREEMENT_TERMS = [
    "terms and conditions", "terms of service", "terms of use", "privacy policy",
    "user agreement", "eula", "data policy", "consent policy", "cookie policy"
  ];

  const AGREEMENT_BUTTONS = [
    "i agree", "agree", "accept", "accept all", "accept & continue", "accept and continue",
    "continue", "confirm", "consent", "allow", "subscribe", "create account", "sign up", "join"
  ];

  // Run initial detection scan
  setTimeout(detectAgreementOnPage, 800);

  // Monitor dynamic DOM changes (modals, popups)
  const observer = new MutationObserver(() => {
    if (!isScanTriggered) {
      detectAgreementOnPage();
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function detectAgreementOnPage() {
    if (isScanTriggered) return;

    const pageText = document.body ? document.body.innerText.toLowerCase() : "";
    if (!pageText || pageText.length < 50) return;

    // Signal 1: Terms/Privacy Keywords
    let termMatchCount = 0;
    AGREEMENT_TERMS.forEach(term => {
      if (pageText.includes(term)) termMatchCount++;
    });

    // Signal 2: Agreement Checkbox / Form Inputs
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let hasAgreementCheckbox = false;
    checkboxes.forEach(cb => {
      const parentText = (cb.parentElement ? cb.parentElement.innerText : "").toLowerCase();
      if (AGREEMENT_TERMS.some(t => parentText.includes(t))) {
        hasAgreementCheckbox = true;
      }
    });

    // Signal 3: Agreement Buttons
    const buttons = document.querySelectorAll('button, input[type="submit"], a.btn, .button, [role="button"]');
    let hasConsentButton = false;
    buttons.forEach(btn => {
      const btnText = (btn.innerText || btn.value || "").toLowerCase().trim();
      if (AGREEMENT_BUTTONS.some(b => btnText.includes(b))) {
        hasConsentButton = true;
      }
    });

    // Multi-signal decision formula
    const confidence = (termMatchCount * 25) + (hasAgreementCheckbox ? 35 : 0) + (hasConsentButton ? 25 : 0);

    if (confidence >= 50 && termMatchCount >= 1) {
      isScanTriggered = true;

      // Extract text and execute local scanner
      const extractedText = window.extractTCProseFromPage ? window.extractTCProseFromPage() : document.body.innerText;
      const analyzer = new window.ExtensionClauseAnalyzer(window.TC_RISK_RULES);
      const scanResult = analyzer.scan(extractedText, document.title || "Webpage Terms");

      scanResult.domain = window.location.hostname;
      scanResult.source_url = window.location.href;

      // Record alert event in extension background storage
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          action: "RECORD_AGREEMENT_ALERT",
          data: {
            domain: window.location.hostname,
            source_url: window.location.href,
            document_name: document.title || "Terms & Conditions",
            safety_score: scanResult.safety_score,
            risk_level: scanResult.risk_level,
            red_flags_count: scanResult.red_flags
          }
        });
      }

      // Display Antivirus Security Warning Popup
      if (window.showTCWarningPopup) {
        window.showTCWarningPopup(scanResult);
      }
    }
  }

  window.triggerManualTCPageScan = detectAgreementOnPage;
})();
