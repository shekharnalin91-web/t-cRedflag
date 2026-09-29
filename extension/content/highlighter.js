/**
 * T&C Red Flag Guard - In-Page Clause Highlighter
 * Scrolls to and highlights the target clause directly on the webpage.
 */

(function () {
  function highlightAndScrollToClause(targetText) {
    if (!targetText) return;

    // Search for DOM element containing target text snippet
    const snippet = targetText.substring(0, 40).trim();

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    let matchNode = null;

    while (node = walker.nextNode()) {
      if (node.nodeValue && node.nodeValue.toLowerCase().includes(snippet.toLowerCase())) {
        matchNode = node.parentElement;
        break;
      }
    }

    if (matchNode) {
      matchNode.scrollIntoView({ behavior: "smooth", block: "center" });

      // Apply red highlight animation box
      const originalBg = matchNode.style.backgroundColor;
      const originalOutline = matchNode.style.outline;

      matchNode.style.transition = "all 0.4s ease";
      matchNode.style.backgroundColor = "rgba(255, 51, 102, 0.3)";
      matchNode.style.outline = "2px solid #ff3366";
      matchNode.style.borderRadius = "4px";

      setTimeout(() => {
        matchNode.style.backgroundColor = originalBg;
        matchNode.style.outline = originalOutline;
      }, 5000);
    } else {
      alert("Flagged clause snippet:\n\n\"" + targetText + "\"\n\n(Text is present in contract body).");
    }
  }

  window.highlightAndScrollToClause = highlightAndScrollToClause;
})();
