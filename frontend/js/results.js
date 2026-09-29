/**
 * CorruptX - Results Dashboard Controller
 * Circular Risk Gauge, Website Source Header, Sub-Risk Metrics,
 * Filterable Red Flag Cards, Interactive Policy Highlighting,
 * Clause Explainer Drawer, and Security Acceptance Popup Flow.
 */

document.addEventListener("DOMContentLoaded", () => {
  let scanData = getActiveScan();

  if (!scanData) {
    const history = getScanHistory();
    if (history.length > 0) {
      scanData = history[0].full_data;
    } else if (window.ClientClauseAnalyzer && window.TC_SAMPLE_POLICIES && window.TC_SAMPLE_POLICIES.length > 0) {
      const demo = window.TC_SAMPLE_POLICIES[0];
      const analyzer = new window.ClientClauseAnalyzer(window.TC_RISK_RULES);
      scanData = analyzer.scan(demo.content, demo.title);
      saveScanToHistory(scanData);
      setActiveScan(scanData);
    }
  }

  if (!scanData) {
    window.location.href = "scanner.html";
    return;
  }

  // Render components
  renderWebsiteSourceHeader(scanData);
  renderOverview(scanData);
  renderSubRiskMetrics(scanData);
  renderRedFlagCards(scanData);
  renderPolicyHighlighter(scanData);
  renderCategoryBreakdown(scanData);

  initTabNavigation();
  initActions(scanData);
  initAcceptanceFlow(scanData);
  initClauseExplainerDrawer(scanData);
});

/**
 * Render Website T&C Source Information Banner
 */
function renderWebsiteSourceHeader(data) {
  const banner = document.getElementById("website-source-banner");
  if (!banner) return;

  const isWebsite = data.source_type === "website" || (data.source_url && data.source_url.startsWith("http"));
  if (!isWebsite) {
    banner.style.display = "none";
    return;
  }

  banner.style.display = "block";

  const domainEl = document.getElementById("web-source-domain");
  const pageEl = document.getElementById("web-source-page");
  const badgeEl = document.getElementById("web-analysis-status-badge");
  const linkEl = document.getElementById("web-source-url-link");

  const wordsEl = document.getElementById("web-words-analyzed");
  const clausesEl = document.getElementById("web-clauses-detected");
  const redflagsEl = document.getElementById("web-red-flags");
  const highRiskEl = document.getElementById("web-high-risk");

  const info = data.website_info || {};
  const urlStr = data.source_url || info.source_url || "https://example.com/terms";

  let domain = info.domain;
  if (!domain && urlStr) {
    try {
      domain = new URL(urlStr).hostname;
    } catch (e) {
      domain = "Website Scan";
    }
  }

  if (domainEl) domainEl.textContent = domain || "example.com";
  if (pageEl) pageEl.textContent = info.page_title || data.document_name || "Terms of Service";
  if (linkEl) {
    linkEl.href = urlStr;
    linkEl.textContent = urlStr;
  }

  const status = data.analysis_status || info.status_badge || "COMPLETE";
  if (badgeEl) {
    if (status.includes("PARTIAL") || status === "PARTIAL") {
      badgeEl.className = "badge badge-medium";
      badgeEl.textContent = "⚠️ Partial Analysis";
    } else {
      badgeEl.className = "badge badge-safe";
      badgeEl.textContent = "✅ Complete Analysis";
    }
  }

  if (wordsEl) wordsEl.textContent = (data.word_count || info.words_analyzed || 0).toLocaleString();
  if (clausesEl) clausesEl.textContent = (data.clauses_analyzed || info.clauses_detected || 0).toLocaleString();
  if (redflagsEl) redflagsEl.textContent = (data.red_flags || info.red_flags || 0).toLocaleString();

  const critHighCount = (data.severity_counts?.CRITICAL || 0) + (data.severity_counts?.HIGH || 0);
  if (highRiskEl) highRiskEl.textContent = critHighCount;

  // Header buttons
  const btnOpenWeb = document.getElementById("btn-open-original-website");
  const btnViewText = document.getElementById("btn-view-extracted-tc");
  const btnViewFlags = document.getElementById("btn-view-red-flags-source");
  const btnAskAssistant = document.getElementById("btn-ask-redflag-assistant");

  if (btnOpenWeb) btnOpenWeb.href = urlStr;
  if (btnViewText) {
    btnViewText.addEventListener("click", () => {
      const highlighterTab = document.querySelector('[data-tab="highlighter"]');
      if (highlighterTab) highlighterTab.click();
    });
  }
  if (btnViewFlags) {
    btnViewFlags.addEventListener("click", () => {
      const flagsTab = document.querySelector('[data-tab="cards"]');
      if (flagsTab) flagsTab.click();
    });
  }
  if (btnAskAssistant) {
    btnAskAssistant.addEventListener("click", () => {
      const chatToggle = document.getElementById("chatbot-toggle-btn");
      if (chatToggle) chatToggle.click();
    });
  }
}

/**
 * Render Overview Banner and Circular Safety Score Gauge
 */
function renderOverview(data) {
  const docTitleEl = document.getElementById("res-doc-title");
  const docDateEl = document.getElementById("res-doc-date");
  const riskBadgeEl = document.getElementById("res-risk-badge");
  const summaryTextEl = document.getElementById("res-summary-text");

  const metricClausesEl = document.getElementById("metric-clauses");
  const metricRedflagsEl = document.getElementById("metric-redflags");
  const metricCritEl = document.getElementById("metric-critical");
  const metricHighEl = document.getElementById("metric-high");
  const metricMedEl = document.getElementById("metric-med");
  const metricLowEl = document.getElementById("metric-low");

  if (docTitleEl) docTitleEl.textContent = data.document_name || "Analyzed Policy";
  if (docDateEl) {
    const dateStr = data.analyzed_at ? new Date(data.analyzed_at).toLocaleString() : new Date().toLocaleString();
    docDateEl.textContent = `Scanned: ${dateStr}`;
  }

  const score = data.safety_score !== undefined ? data.safety_score : (data.risk_score || 0);
  const level = data.risk_level || "SAFE";

  let badgeClass = "badge-safe";
  let gaugeColor = "var(--accent-green)";

  if (level === "CRITICAL") {
    badgeClass = "badge-critical";
    gaugeColor = "#dc2626";
  } else if (level === "HIGH" || level === "HIGH RISK") {
    badgeClass = "badge-high";
    gaugeColor = "#f97316";
  } else if (level === "MEDIUM" || level === "CAUTION") {
    badgeClass = "badge-medium";
    gaugeColor = "#f59e0b";
  } else if (level === "LOW") {
    badgeClass = "badge-low";
    gaugeColor = "#eab308";
  }

  if (riskBadgeEl) {
    riskBadgeEl.className = `badge ${badgeClass} risk-level-badge`;
    riskBadgeEl.textContent = `${level} RISK`;
  }

  if (summaryTextEl) {
    summaryTextEl.textContent = data.summary || "";
  }

  if (metricClausesEl) metricClausesEl.textContent = data.clauses_analyzed || 0;
  if (metricRedflagsEl) metricRedflagsEl.textContent = data.red_flags || 0;
  if (metricCritEl) metricCritEl.textContent = data.severity_counts?.CRITICAL || 0;
  if (metricHighEl) metricHighEl.textContent = data.severity_counts?.HIGH || 0;
  if (metricMedEl) metricMedEl.textContent = data.severity_counts?.MEDIUM || 0;
  if (metricLowEl) metricLowEl.textContent = data.severity_counts?.LOW || 0;

  animateCircularGauge(score, gaugeColor);
}

function animateCircularGauge(score, strokeColor) {
  const fillPath = document.getElementById("gauge-fill-path");
  const scoreText = document.getElementById("gauge-score-value");

  if (!fillPath || !scoreText) return;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  fillPath.style.strokeDasharray = `${circumference}`;
  fillPath.style.strokeDashoffset = `${circumference}`;
  fillPath.style.stroke = strokeColor;

  setTimeout(() => {
    const targetOffset = circumference - (score / 100) * circumference;
    fillPath.style.strokeDashoffset = `${targetOffset}`;

    let current = 0;
    const stepTime = 1200 / Math.max(score, 1);
    const counter = setInterval(() => {
      if (current >= score) {
        scoreText.textContent = score;
        clearInterval(counter);
      } else {
        current++;
        scoreText.textContent = current;
      }
    }, Math.max(10, stepTime));
  }, 100);
}

/**
 * Render Sub-Risk Progress Bars
 */
function renderSubRiskMetrics(data) {
  const sub = data.sub_scores || {};

  const map = {
    "privacy": document.getElementById("sr-bar-privacy"),
    "financial": document.getElementById("sr-bar-financial"),
    "subscription": document.getElementById("sr-bar-subscription"),
    "data_sharing": document.getElementById("sr-bar-datasharing"),
    "account_termination": document.getElementById("sr-bar-account"),
    "legal_dispute": document.getElementById("sr-bar-legal")
  };

  const valMap = {
    "privacy": document.getElementById("sr-val-privacy"),
    "financial": document.getElementById("sr-val-financial"),
    "subscription": document.getElementById("sr-val-subscription"),
    "data_sharing": document.getElementById("sr-val-datasharing"),
    "account_termination": document.getElementById("sr-val-account"),
    "legal_dispute": document.getElementById("sr-val-legal")
  };

  const subKeyMap = {
    "privacy": sub.privacy_risk || 10,
    "financial": sub.financial_risk || 10,
    "subscription": sub.subscription_risk || 10,
    "data_sharing": sub.data_sharing_risk || 10,
    "account_termination": sub.account_termination_risk || 10,
    "legal_dispute": sub.legal_dispute_risk || 10
  };

  Object.keys(map).forEach(key => {
    const val = subKeyMap[key] || 10;
    if (map[key]) {
      setTimeout(() => {
        map[key].style.width = `${val}%`;
      }, 200);
    }
    if (valMap[key]) {
      valMap[key].textContent = `${val} / 100`;
    }
  });
}

/**
 * Render Detected Red Flag Cards
 */
function renderRedFlagCards(data) {
  const container = document.getElementById("red-flags-container");
  if (!container) return;

  const flagged = data.flagged_clauses || [];

  const flagsCountBadge = document.getElementById("tab-count-flags");
  if (flagsCountBadge) flagsCountBadge.textContent = flagged.length;

  if (flagged.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 48px 24px;">
        <div style="color: var(--accent-green); margin-bottom: 12px;">${ICONS.checkCircle}</div>
        <h3 style="color: #fff; margin-bottom: 8px;">🟢 LOW RISK DETECTED</h3>
        <p style="max-width: 480px; margin: 0 auto;">No major red flags were detected in the clauses we analyzed for this document.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = flagged.map((flag) => {
    const sevLower = flag.severity.toLowerCase();
    const sectionTag = flag.section_title ? `Section: ${flag.section_title}` : `Clause #${flag.index + 1}`;
    const uncertainNotice = flag.is_uncertain ? `<div class="uncertainty-banner" style="margin-top: 10px;">⚠️ Analysis uncertain — please verify this clause in the original Terms & Conditions.</div>` : "";

    return `
      <div class="red-flag-card severity-${flag.severity}" data-severity="${flag.severity}" id="flag-card-${flag.index}">
        <div class="rf-header">
          <div class="rf-title-group">
            <span class="rf-category-name">${escapeHtml(flag.category_name)}</span>
            <span class="badge badge-${sevLower}">${flag.severity} RISK</span>
            <span class="location-tag">📍 ${escapeHtml(sectionTag)}</span>
          </div>
          <button type="button" class="btn btn-secondary btn-sm btn-open-explainer-drawer" data-clause-index="${flag.index}">
            Inspect Explainer Drawer
          </button>
        </div>

        <div class="rf-clause-text">
          "${escapeHtml(flag.text)}"
        </div>

        <div class="rf-explanation">
          <strong>What it means:</strong> ${escapeHtml(flag.explanation)}
        </div>

        <div class="rf-why-it-matters">
          <strong>Why it matters:</strong> ${escapeHtml(flag.why_it_matters)}
        </div>

        <div class="rf-recommendation">
          <strong>What to check:</strong> ${escapeHtml(flag.recommendation)}
        </div>

        ${uncertainNotice}
      </div>
    `;
  }).join("");

  // Attach drawer openers
  container.querySelectorAll(".btn-open-explainer-drawer").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-clause-index"), 10);
      openClauseExplainerDrawer(data.flagged_clauses.find(c => c.index === idx) || data.all_clauses[idx]);
    });
  });

  initFilters();
}

function initFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      const cards = document.querySelectorAll(".red-flag-card");

      cards.forEach(card => {
        const sev = card.getAttribute("data-severity");
        if (filter === "all" || sev === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/**
 * Render Interactive Policy Analysis (Full Text with Clause Highlighting)
 */
function renderPolicyHighlighter(data) {
  const docContainer = document.getElementById("policy-full-text-container");
  if (!docContainer) return;

  const allClauses = data.all_clauses || [];

  if (allClauses.length === 0) {
    docContainer.textContent = "No document text available.";
    return;
  }

  docContainer.innerHTML = allClauses.map(clause => {
    let highlightClass = "highlight-safe";
    if (clause.is_flagged) {
      if (clause.severity === "CRITICAL") highlightClass = "highlight-critical";
      else if (clause.severity === "HIGH") highlightClass = "highlight-high";
      else if (clause.severity === "MEDIUM") highlightClass = "highlight-medium";
      else if (clause.severity === "LOW") highlightClass = "highlight-low";
    }

    return `<span class="clause-span ${highlightClass}" data-clause-index="${clause.index}" title="${clause.is_flagged ? `${clause.category_name} (${clause.severity})` : 'Standard provision'}">${escapeHtml(clause.text)}</span> `;
  }).join("");

  docContainer.querySelectorAll(".clause-span").forEach(span => {
    span.addEventListener("click", () => {
      const idx = parseInt(span.getAttribute("data-clause-index"), 10);
      const clauseObj = allClauses[idx];
      inspectClauseInPanel(clauseObj, span);
      openClauseExplainerDrawer(clauseObj);
    });
  });
}

function inspectClauseInPanel(clause, targetSpan) {
  document.querySelectorAll(".clause-span").forEach(el => el.classList.remove("active-inspected"));
  if (targetSpan) targetSpan.classList.add("active-inspected");

  const pane = document.getElementById("inspector-content-pane");
  const placeholder = document.getElementById("inspector-placeholder");

  if (!pane || !placeholder) return;

  placeholder.style.display = "none";
  pane.style.display = "flex";

  const sevLower = (clause.severity || "safe").toLowerCase();

  pane.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <span class="badge badge-${sevLower}">${clause.severity} RISK</span>
      <span class="location-tag">📍 ${escapeHtml(clause.section_title || `Clause #${clause.index + 1}`)}</span>
    </div>

    <div>
      <h4 style="font-size: 1.05rem; color: #fff; margin-bottom: 4px;">${escapeHtml(clause.category_name || "Standard Provision")}</h4>
    </div>

    <div style="background: rgba(8, 12, 20, 0.8); border: 1px solid var(--border-card); border-radius: 6px; padding: 12px; font-size: 0.85rem; color: #cbd5e1; max-height: 140px; overflow-y: auto;">
      "${escapeHtml(clause.text)}"
    </div>

    <div class="analysis-callout" style="padding: 10px;">
      <div class="callout-header">${ICONS.info} <span>In simple English</span></div>
      <div class="callout-text" style="font-size: 0.84rem;">${escapeHtml(clause.explanation)}</div>
    </div>

    <div class="analysis-callout" style="padding: 10px;">
      <div class="callout-header" style="color: var(--accent-crimson);">${ICONS.alertTriangle} <span>Why it Matters</span></div>
      <div class="callout-text" style="font-size: 0.84rem;">${escapeHtml(clause.why_it_matters)}</div>
    </div>

    <button type="button" class="btn btn-primary btn-sm btn-trigger-drawer" style="width: 100%;">
      Open Explainer Drawer
    </button>
  `;

  const btnDrawer = pane.querySelector(".btn-trigger-drawer");
  if (btnDrawer) {
    btnDrawer.addEventListener("click", () => openClauseExplainerDrawer(clause));
  }
}

/**
 * Clause Explainer Drawer Panel
 */
function initClauseExplainerDrawer(data) {
  const drawer = document.getElementById("clause-explainer-drawer");
  const btnClose = document.getElementById("btn-close-drawer");

  if (btnClose && drawer) {
    btnClose.addEventListener("click", () => {
      drawer.classList.remove("active");
    });
  }
}

function openClauseExplainerDrawer(clause) {
  if (!clause) return;
  const drawer = document.getElementById("clause-explainer-drawer");
  if (!drawer) return;

  const origEl = document.getElementById("drawer-original-clause");
  const simpleEl = document.getElementById("drawer-simple-english");
  const whyEl = document.getElementById("drawer-why-matters");
  const badgeEl = document.getElementById("drawer-risk-badge");
  const locationEl = document.getElementById("drawer-source-location");
  const checkEl = document.getElementById("drawer-what-to-check");
  const uncertainEl = document.getElementById("drawer-uncertain-warning");

  if (origEl) origEl.textContent = `"${clause.text}"`;
  if (simpleEl) simpleEl.textContent = clause.explanation || "No elevated risk detected.";
  if (whyEl) whyEl.textContent = clause.why_it_matters || "Customary legal statement.";
  if (checkEl) checkEl.textContent = clause.recommendation || "Verify context if unsure.";

  const sevLower = (clause.severity || "SAFE").toLowerCase();
  if (badgeEl) {
    badgeEl.className = `badge badge-${sevLower}`;
    badgeEl.textContent = `${clause.severity} RISK`;
  }

  if (locationEl) {
    locationEl.textContent = clause.section_title || `Clause #${clause.index + 1}`;
  }

  if (uncertainEl) {
    uncertainEl.style.display = clause.is_uncertain ? "block" : "none";
  }

  drawer.classList.add("active");

  const btnOpenOriginal = document.getElementById("btn-drawer-open-clause");
  if (btnOpenOriginal) {
    btnOpenOriginal.onclick = () => {
      drawer.classList.remove("active");
      const highlighterTab = document.querySelector('[data-tab="highlighter"]');
      if (highlighterTab) highlighterTab.click();

      setTimeout(() => {
        const span = document.querySelector(`.clause-span[data-clause-index="${clause.index}"]`);
        if (span) {
          span.scrollIntoView({ behavior: "smooth", block: "center" });
          span.click();
        }
      }, 200);
    };
  }
}

/**
 * Render Category Risk Breakdown Chart
 */
function renderCategoryBreakdown(data) {
  const container = document.getElementById("category-breakdown-container");
  if (!container) return;

  const categories = data.categories || [];

  if (categories.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 32px;">No risk categories flagged.</p>`;
    return;
  }

  const maxCount = Math.max(...categories.map(c => c.count), 1);

  container.innerHTML = `
    <div class="breakdown-list">
      ${categories.map(cat => {
        const percent = Math.min(100, Math.round((cat.count / maxCount) * 100));
        const sevLower = cat.severity.toLowerCase();
        let color = "var(--accent-blue)";
        if (cat.severity === "CRITICAL") color = "#dc2626";
        else if (cat.severity === "HIGH") color = "#f97316";
        else if (cat.severity === "MEDIUM") color = "#f59e0b";

        return `
          <div class="breakdown-item">
            <div class="breakdown-item-header">
              <div class="breakdown-category-label">
                <span>${escapeHtml(cat.category_name)}</span>
                <span class="badge badge-${sevLower}">${cat.severity}</span>
              </div>
              <div class="breakdown-counts">
                <span>${cat.count} clause${cat.count > 1 ? 's' : ''} flagged</span>
              </div>
            </div>
            <div class="breakdown-track">
              <div class="breakdown-fill" style="width: ${percent}%; background: ${color}; box-shadow: 0 0 10px ${color};"></div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

/**
 * Tab Navigation (Red Flags vs Highlighter vs Breakdown)
 */
function initTabNavigation() {
  const tabs = document.querySelectorAll(".tab-btn");
  const views = {
    cards: document.getElementById("view-red-flags"),
    highlighter: document.getElementById("view-policy-analysis"),
    breakdown: document.getElementById("view-category-breakdown")
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.getAttribute("data-tab");
      Object.keys(views).forEach(k => {
        if (views[k]) {
          views[k].style.display = (k === target) ? "block" : "none";
        }
      });
    });
  });
}

/**
 * Acceptance Security Modal & Checkbox Flow
 */
function initAcceptanceFlow(data) {
  const chkAgree = document.getElementById("chk-agree-tc");
  const modal = document.getElementById("acceptance-security-modal");
  const btnCloseModal = document.getElementById("btn-close-modal");

  const btnViewFlags = document.getElementById("btn-modal-view-flags");
  const btnUnderstand = document.getElementById("btn-modal-understand");
  const btnContinue = document.getElementById("btn-modal-continue");

  const scoreNumEl = document.getElementById("modal-score-num");
  const issuesTitleEl = document.getElementById("modal-issues-title");
  const issuesBreakdownEl = document.getElementById("modal-issues-breakdown");
  const concernsListEl = document.getElementById("modal-concerns-list");

  if (!chkAgree || !modal) return;

  chkAgree.addEventListener("change", () => {
    if (chkAgree.checked) {
      populateSecurityModal(data);
      modal.classList.add("active");
    }
  });

  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", () => {
      modal.classList.remove("active");
      chkAgree.checked = false;
    });
  }

  function populateSecurityModal(scan) {
    const score = scan.safety_score !== undefined ? scan.safety_score : (scan.risk_score || 0);
    const redCnt = scan.red_flags || 0;
    const crit = scan.severity_counts?.CRITICAL || 0;
    const high = scan.severity_counts?.HIGH || 0;
    const med = scan.severity_counts?.MEDIUM || 0;
    const low = scan.severity_counts?.LOW || 0;

    if (scoreNumEl) {
      const emoji = score >= 80 ? "🟢" : (score >= 50 ? "🟠" : "🔴");
      scoreNumEl.textContent = `${emoji} ${score} / 100`;
    }

    if (issuesTitleEl) {
      if (score >= 80) {
        issuesTitleEl.textContent = "🟢 LOW RISK DETECTED";
      } else {
        issuesTitleEl.textContent = `⚠️ ${redCnt} issues detected`;
      }
    }

    if (issuesBreakdownEl) {
      if (score >= 80) {
        issuesBreakdownEl.textContent = "No major red flags were detected in the clauses we analyzed.";
      } else {
        const parts = [];
        if (crit) parts.push(`⛔ ${crit} Critical`);
        if (high) parts.push(`🔴 ${high} High`);
        if (med) parts.push(`🟠 ${med} Medium`);
        if (low) parts.push(`🟡 ${low} Low`);
        issuesBreakdownEl.textContent = parts.join(" • ") || `${redCnt} Red Flags`;
      }
    }

    if (concernsListEl) {
      concernsListEl.innerHTML = "";
      const cats = scan.categories || [];
      if (cats.length === 0) {
        concernsListEl.innerHTML = `<li>• Customary service terms & privacy guarantees</li>`;
      } else {
        cats.slice(0, 4).forEach(c => {
          const li = document.createElement("li");
          li.textContent = `• ${c.category_name} (${c.count} clause${c.count > 1 ? 's' : ''})`;
          concernsListEl.appendChild(li);
        });
      }
    }
  }

  if (btnViewFlags) {
    btnViewFlags.addEventListener("click", () => {
      modal.classList.remove("active");
      const flagsTab = document.querySelector('[data-tab="cards"]');
      if (flagsTab) flagsTab.click();
    });
  }

  if (btnUnderstand) {
    btnUnderstand.addEventListener("click", () => {
      modal.classList.remove("active");
      const checklistCard = document.querySelector(".checklist-card");
      if (checklistCard) checklistCard.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (btnContinue) {
    btnContinue.addEventListener("click", () => {
      modal.classList.remove("active");
      recordAcceptanceDecision(data, "continued_anyway");
      showToast("Acceptance decision recorded in scan history.", "success");
    });
  }
}

function recordAcceptanceDecision(scanData, decision) {
  const history = getScanHistory();
  const record = {
    id: `scan_${Date.now()}`,
    document_name: scanData.document_name,
    timestamp: new Date().toISOString(),
    source_type: scanData.source_type || "text",
    source_url: scanData.source_url || "",
    safety_score: scanData.safety_score || scanData.risk_score || 0,
    risk_level: scanData.risk_level || "SAFE",
    user_decision: decision,
    full_data: scanData
  };

  history.unshift(record);

  // Prune older scans if localStorage exceeds limits
  try {
    localStorage.setItem("corruptx_tc_scan_history", JSON.stringify(history.slice(0, 30)));
  } catch (e) {
    console.warn("Storage write failed:", e);
  }
}

/**
 * Export & Actions handlers
 */
function initActions(data) {
  const btnExport = document.getElementById("btn-export-report");
  const btnCopy = document.getElementById("btn-copy-summary");

  if (btnExport) {
    btnExport.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `corruptx_tc_report_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Security report exported as JSON", "success");
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const summaryMarkdown = `
# CORRUPTX T&C SECURITY REPORT
**Target:** ${data.document_name}
**Safety Score:** ${data.safety_score || data.risk_score}/100 [${data.risk_level}]
**Analyzed Clauses:** ${data.clauses_analyzed}
**Red Flags Identified:** ${data.red_flags}

## Critical Red Flags:
${(data.flagged_clauses || []).map(f => `- **${f.category_name} (${f.severity})**: "${f.text.substring(0, 100)}..." -> ${f.explanation}`).join("\n")}

*Generated by CorruptX T&C Red Flag Scanner (Cybersecurity Engine)*
      `.trim();

      navigator.clipboard.writeText(summaryMarkdown).then(() => {
        showToast("Executive summary copied to clipboard", "success");
      }).catch(() => {
        showToast("Clipboard copy failed", "error");
      });
    });
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
