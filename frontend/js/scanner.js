/**
 * CorruptX - Scanner Page Controller
 * Handles URL analysis, document intake, file drag/drop, sample loading,
 * multi-step scan animation, status state notifications, and offline/online API dispatch.
 */

document.addEventListener("DOMContentLoaded", () => {
  const policyTextarea = document.getElementById("policy-text");
  const docNameInput = document.getElementById("doc-name-input");
  const tcUrlInput = document.getElementById("tc-url-input");
  const charCountEl = document.getElementById("char-count");
  const wordCountEl = document.getElementById("word-count");
  const clauseEstimateEl = document.getElementById("clause-estimate");

  const btnPaste = document.getElementById("btn-paste");
  const btnClear = document.getElementById("btn-clear");
  const btnLoadDemo = document.getElementById("btn-load-demo");
  const btnTriggerDemo = document.getElementById("btn-trigger-demo");
  const btnScan = document.getElementById("btn-start-scan");
  const btnAnalyzeUrl = document.getElementById("btn-analyze-url");

  const fileInput = document.getElementById("file-upload-input");
  const dropzone = document.getElementById("file-dropzone");

  const scanningOverlay = document.getElementById("scanning-overlay");
  const progressFill = document.getElementById("scan-progress-fill");

  const websiteStatusBanner = document.getElementById("website-status-banner");
  const websiteStatusIcon = document.getElementById("website-status-icon");
  const websiteStatusTitle = document.getElementById("website-status-title");
  const websiteStatusDesc = document.getElementById("website-status-desc");
  const websiteReasonsList = document.getElementById("website-reasons-list");

  // Multi-step elements
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");
  const step3 = document.getElementById("step-3");
  const step4 = document.getElementById("step-4");

  // Tab switching
  const tabBtns = document.querySelectorAll(".tab-btn[data-tab]");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const targetMode = btn.dataset.tab;

      if (targetMode === "url") {
        document.getElementById("panel-url-input").style.display = "block";
        if (websiteStatusBanner) websiteStatusBanner.style.display = "none";
      } else if (targetMode === "file") {
        document.getElementById("panel-url-input").style.display = "none";
        if (fileInput) fileInput.click();
      } else {
        document.getElementById("panel-url-input").style.display = "none";
        if (policyTextarea) policyTextarea.focus();
      }
    });
  });

  // Fallback buttons inside status error banner
  const fallbackBtns = document.querySelectorAll(".fallback-btn");
  fallbackBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (websiteStatusBanner) websiteStatusBanner.style.display = "none";
      if (target === "text") {
        tabBtns.forEach(b => b.classList.toggle("active", b.id === "tab-btn-text"));
        document.getElementById("panel-url-input").style.display = "none";
        if (policyTextarea) policyTextarea.focus();
      } else if (target === "pdf" || target === "image") {
        tabBtns.forEach(b => b.classList.toggle("active", b.id === (target === "pdf" ? "tab-btn-pdf" : "tab-btn-image")));
        document.getElementById("panel-url-input").style.display = "none";
        if (fileInput) fileInput.click();
      }
    });
  });

  // Query parameter check
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("demo")) {
    loadDemoPolicy("high_risk_social");
  }

  // Textarea input event
  if (policyTextarea) {
    policyTextarea.addEventListener("input", updateStats);
    updateStats();
  }

  function updateStats() {
    const text = policyTextarea.value || "";
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const clauses = text.trim() ? Math.max(1, text.split(/[.!?\n]+/).filter(s => s.trim().length > 10).length) : 0;

    if (charCountEl) charCountEl.textContent = chars.toLocaleString();
    if (wordCountEl) wordCountEl.textContent = words.toLocaleString();
    if (clauseEstimateEl) clauseEstimateEl.textContent = `~${clauses}`;
  }

  // Paste button
  if (btnPaste) {
    btnPaste.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipText = await navigator.clipboard.readText();
          if (clipText) {
            policyTextarea.value = clipText;
            updateStats();
            showToast("Policy text pasted from clipboard", "success");
            return;
          }
        }
      } catch (e) {
        // Clipboard fallback
      }
      if (policyTextarea) policyTextarea.focus();
      showToast("Please use Ctrl+V / Cmd+V to paste text", "info");
    });
  }

  // Clear button
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      if (policyTextarea) policyTextarea.value = "";
      if (docNameInput) docNameInput.value = "";
      if (tcUrlInput) tcUrlInput.value = "";
      if (websiteStatusBanner) websiteStatusBanner.style.display = "none";
      updateStats();
      showToast("Cleared workspace", "info");
    });
  }

  // Load Demo Policy
  if (btnLoadDemo) {
    btnLoadDemo.addEventListener("click", () => {
      loadDemoPolicy("high_risk_social");
    });
  }

  if (btnTriggerDemo) {
    btnTriggerDemo.addEventListener("click", () => {
      loadDemoPolicy("high_risk_social");
      triggerScanExecution();
    });
  }

  function loadDemoPolicy(sampleId = "high_risk_social") {
    let sample = null;
    if (window.TC_SAMPLE_POLICIES && window.TC_SAMPLE_POLICIES.length > 0) {
      sample = window.TC_SAMPLE_POLICIES.find(s => s.id === sampleId) || window.TC_SAMPLE_POLICIES[0];
    }

    if (sample) {
      if (policyTextarea) policyTextarea.value = sample.content;
      if (docNameInput) docNameInput.value = sample.title;
      updateStats();
      showToast(`Loaded realistic demo: "${sample.title}"`, "success");
    }
  }

  // File Dropzone & Browse
  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFileUpload(fileInput.files[0]);
      }
    });
  }

  function handleFileUpload(file) {
    if (!file) return;
    const filename = file.name;
    if (docNameInput) docNameInput.value = filename.replace(/\.[^/.]+$/, "");

    const ext = filename.split(".").pop().toLowerCase();
    showToast(`Loaded file: ${filename}`, "info");

    if (["txt", "md", "html", "htm"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let content = e.target.result || "";
        if (ext.startsWith("htm")) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, "text/html");
          content = doc.body ? doc.body.innerText : content;
        }
        policyTextarea.value = content;
        updateStats();
      };
      reader.readAsText(file);
    } else {
      // PDF or Image file notice
      policyTextarea.value = `[Uploaded File Content from '${filename}']\n\nFile format (${ext.toUpperCase()}) received and queued for local extraction.`;
      updateStats();
    }
  }

  // URL Analyze Button
  if (btnAnalyzeUrl) {
    btnAnalyzeUrl.addEventListener("click", async () => {
      const urlStr = tcUrlInput ? tcUrlInput.value.trim() : "";
      if (!urlStr) {
        showToast("Please enter a valid website URL", "warning");
        return;
      }

      showScanningOverlay();

      try {
        let result = null;
        if (AppState.isBackendAvailable) {
          const res = await fetch(`${AppState.apiBase}/api/scan-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlStr })
          });
          result = await res.json();
        }

        if (!result || result.status === "UNABLE_TO_ANALYZE" || result.error) {
          hideScanningOverlay();
          renderWebsiteErrorBanner(result || {
            error: "We couldn't access this Terms & Conditions page.",
            reasons: ["Invalid URL", "Website unavailable", "Website blocks automated access", "Content loaded dynamically"]
          });
          return;
        }

        completeScanAndNavigate(result);

      } catch (err) {
        hideScanningOverlay();
        renderWebsiteErrorBanner({
          error: `Website analysis failed: ${err.message}`,
          reasons: ["Network error", "Website unavailable", "Content loaded dynamically"]
        });
      }
    });
  }

  function renderWebsiteErrorBanner(data) {
    if (!websiteStatusBanner) return;
    websiteStatusBanner.className = "website-status-banner status-unable";
    websiteStatusBanner.style.display = "block";

    if (websiteStatusTitle) websiteStatusTitle.textContent = "🔴 UNABLE TO ANALYZE";
    if (websiteStatusDesc) websiteStatusDesc.textContent = data.error || "We couldn't access this Terms & Conditions page.";

    if (websiteReasonsList) {
      websiteReasonsList.innerHTML = "";
      const reasons = data.reasons || ["Invalid URL", "Website unavailable", "Authentication required", "Website blocks automated access", "Content loaded dynamically", "Network error"];
      reasons.forEach(r => {
        const span = document.createElement("span");
        span.className = "reason-tag";
        span.textContent = `• ${r}`;
        websiteReasonsList.appendChild(span);
      });
    }
  }

  // Start Scan Button
  if (btnScan) {
    btnScan.addEventListener("click", () => {
      const text = policyTextarea ? policyTextarea.value.trim() : "";
      if (!text) {
        showToast("Please paste text, upload a document, or enter a website URL first.", "warning");
        return;
      }
      triggerScanExecution();
    });
  }

  async function triggerScanExecution() {
    const rawText = policyTextarea ? policyTextarea.value.trim() : "";
    const docName = docNameInput ? docNameInput.value.trim() : "Submitted Document";

    showScanningOverlay();

    setTimeout(async () => {
      let result = null;

      if (AppState.isBackendAvailable) {
        try {
          const res = await fetch(`${AppState.apiBase}/api/scan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: rawText, document_name: docName })
          });
          if (res.ok) {
            result = await res.json();
          }
        } catch (e) {
          console.warn("Backend scan failed, using client engine fallback:", e);
        }
      }

      if (!result) {
        const clientAnalyzer = new ClientClauseAnalyzer(window.TC_RISK_RULES);
        result = clientAnalyzer.scan(rawText, docName);
      }

      completeScanAndNavigate(result);
    }, 1200);
  }

  function showScanningOverlay() {
    if (scanningOverlay) scanningOverlay.classList.add("active");
    if (progressFill) progressFill.style.width = "20%";

    setStepStatus(step1, "active");
    setStepStatus(step2, "pending");
    setStepStatus(step3, "pending");
    setStepStatus(step4, "pending");

    setTimeout(() => {
      setStepStatus(step1, "done");
      setStepStatus(step2, "active");
      if (progressFill) progressFill.style.width = "50%";
    }, 400);

    setTimeout(() => {
      setStepStatus(step2, "done");
      setStepStatus(step3, "active");
      if (progressFill) progressFill.style.width = "80%";
    }, 800);

    setTimeout(() => {
      setStepStatus(step3, "done");
      setStepStatus(step4, "active");
      if (progressFill) progressFill.style.width = "100%";
    }, 1100);
  }

  function hideScanningOverlay() {
    if (scanningOverlay) scanningOverlay.classList.remove("active");
  }

  function completeScanAndNavigate(result) {
    if (window.saveActiveScan) {
      window.saveActiveScan(result);
    } else {
      localStorage.setItem("corruptx_tc_active_scan", JSON.stringify(result));
    }

    setTimeout(() => {
      window.location.href = "results.html";
    }, 300);
  }

  function setStepStatus(stepEl, status) {
    if (!stepEl) return;
    stepEl.className = `scan-step-item ${status}`;
    const indicator = stepEl.querySelector(".step-icon-indicator");
    if (!indicator) return;

    if (status === "done") {
      indicator.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent-green)" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (status === "active") {
      indicator.innerHTML = `<div class="step-spinner"></div>`;
    } else {
      indicator.innerHTML = `•`;
    }
  }
});
