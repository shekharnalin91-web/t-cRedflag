/**
 * T&C Red Flag Guard - Page Text Extractor
 * Extracts readable T&C and Privacy prose from main page or consent dialogs.
 */

(function () {
  function extractTCProseFromPage() {
    // Check if visible modal/dialog contains T&C text first
    const modals = document.querySelectorAll('.modal, .dialog, [role="dialog"], .popup, .consent-box, #cookie-consent');
    for (const modal of modals) {
      const modalText = modal.innerText || "";
      if (modalText.length > 100 && (modalText.toLowerCase().includes("terms") || modalText.toLowerCase().includes("privacy"))) {
        return modalText;
      }
    }

    // Fallback: Extract body text excluding header/nav/footer noise
    const cloneBody = document.body.cloneNode(true);
    const noiseSelectors = ["script", "style", "nav", "footer", "header", "svg", "button", "input"];

    noiseSelectors.forEach(sel => {
      cloneBody.querySelectorAll(sel).forEach(el => el.remove());
    });

    return cloneBody.innerText || document.body.innerText;
  }

  window.extractTCProseFromPage = extractTCProseFromPage;
})();
