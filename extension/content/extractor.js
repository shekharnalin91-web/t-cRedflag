/**
 * T&C Red Flag Guard - Universal Page Text & Prose Extractor
 * Robustly extracts complete legal prose, consent disclaimers, form text, and modal policy text from any website.
 */

(function () {
  function extractTCProseFromPage() {
    let extractedChunks = [];

    // 1. Check for Active Modal Dialogs or Consent Popups
    const modalSelectors = [
      '.modal', '.dialog', '[role="dialog"]', '.popup', '.consent-box',
      '#cookie-consent', '.terms-modal', '.privacy-popup', '#terms-content', '.legal-container'
    ];
    modalSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(modal => {
        const modalText = (modal.innerText || modal.textContent || "").trim();
        if (modalText.length > 50) {
          extractedChunks.push(modalText);
        }
      });
    });

    // 2. Collect Form Disclaimers & Label Text
    const formElements = document.querySelectorAll('form, .signup-form, .register-box, fieldset, label, .terms-label');
    formElements.forEach(form => {
      const formText = (form.innerText || form.textContent || "").trim();
      if (formText.length > 20) {
        extractedChunks.push(formText);
      }
    });

    // 3. Collect Main Body Text (Preserving Form & Button Context)
    if (document.body) {
      // Get raw body text directly without stripping inputs/buttons
      const rawBodyText = document.body.innerText || document.body.textContent || "";
      if (rawBodyText.trim().length > 0) {
        extractedChunks.push(rawBodyText);
      }

      // Also search shadow DOMs / iframe text if accessible
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          if (iframeDoc && iframeDoc.body) {
            const iframeText = iframeDoc.body.innerText || iframeDoc.body.textContent || "";
            if (iframeText.trim().length > 50) {
              extractedChunks.push(iframeText);
            }
          }
        } catch (e) {
          // Cross-origin iframe security restriction
        }
      });
    }

    // 4. Combine and Clean Extracted Chunks
    let fullText = extractedChunks.join("\n\n");
    fullText = fullText
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return fullText.length > 20 ? fullText : (document.body ? document.body.innerText : "");
  }

  window.extractTCProseFromPage = extractTCProseFromPage;
})();
