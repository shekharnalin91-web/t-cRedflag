/**
 * T&C Red Flag Guard - Antivirus Security Warning Popup Component
 * Renders floating cybersecurity warning card when an agreement is detected on target websites.
 */

(function () {
  function showTCWarningPopup(scanResult) {
    if (document.getElementById("tc-redflag-guard-overlay")) return;

    const score = scanResult.safety_score !== undefined ? scanResult.safety_score : (scanResult.risk_score || 0);
    const level = scanResult.risk_level || "HIGH";
    const flagged = scanResult.flagged_clauses || [];

    const levelEmoji = level === "CRITICAL" ? "⛔" : (level === "HIGH" ? "🔴" : (level === "MEDIUM" ? "🟠" : "🟢"));

    // Extract top 4 detected red flag categories for summary
    const topCategories = flagged.slice(0, 4).map(c => {
      const emoji = c.severity === "CRITICAL" ? "⛔" : (c.severity === "HIGH" ? "🔴" : (c.severity === "MEDIUM" ? "🟠" : "🟡"));
      return `<li>${emoji} ${c.category_name}</li>`;
    }).join("");

    const warningHtml = `
      <div id="tc-redflag-guard-overlay" style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 380px;
        max-width: calc(100vw - 32px);
        background: #090e18;
        border: 2px solid ${level === 'CRITICAL' || level === 'HIGH' ? '#dc2626' : '#f59e0b'};
        border-radius: 14px;
        box-shadow: 0 0 35px rgba(0, 242, 255, 0.25), 0 20px 40px rgba(0,0,0,0.9);
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #e2e8f0;
        padding: 20px;
        box-sizing: border-box;
      ">
        <!-- Card Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.9rem; color: #00f2ff; letter-spacing: 0.05em;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#00f2ff" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            T&C RED FLAG GUARD
          </div>
          <button id="tc-guard-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 1.4rem; cursor: pointer; line-height: 1;">&times;</button>
        </div>

        <!-- Warning Title & Status -->
        <div style="font-size: 0.76rem; font-family: monospace; color: #00f2ff; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; margin-bottom: 4px;">
          AGREEMENT DETECTED
        </div>
        <div style="font-size: 0.92rem; color: #cbd5e1; margin-bottom: 14px;">
          This website is asking you to accept Terms & Conditions.
        </div>

        <!-- Risk Level Box -->
        <div style="background: rgba(255, 51, 102, 0.1); border: 1px solid rgba(255, 51, 102, 0.3); border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.7rem; font-family: monospace; color: #94a3b8;">RISK LEVEL</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: ${level === 'CRITICAL' || level === 'HIGH' ? '#ff3366' : '#f59e0b'};">
              ${levelEmoji} ${level} RISK
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.7rem; font-family: monospace; color: #94a3b8;">SAFETY SCORE</div>
            <div style="font-size: 1.3rem; font-weight: 900; color: #fff; font-family: monospace;">
              ${score}/100
            </div>
          </div>
        </div>

        <!-- Detected Red Flags List -->
        <div style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 6px;">
          We detected ${flagged.length} potential red flags:
        </div>
        <ul style="list-style: none; padding: 0; margin: 0 0 18px 0; display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: #e2e8f0;">
          ${topCategories || "<li>🟢 No major critical red flags detected</li>"}
        </ul>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="tc-guard-btn-review" style="
            flex: 1;
            background: linear-gradient(135deg, #00d2df, #0077ff);
            border: none;
            color: #000;
            font-weight: 800;
            font-size: 0.82rem;
            padding: 10px 12px;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
          ">🔍 REVIEW RISKS</button>

          <button id="tc-guard-btn-continue" style="
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.2);
            color: #cbd5e1;
            font-size: 0.82rem;
            padding: 10px 12px;
            border-radius: 6px;
            cursor: pointer;
          ">CONTINUE ANYWAY</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", warningHtml);

    // Event listeners
    document.getElementById("tc-guard-close-btn").onclick = dismissPopup;
    document.getElementById("tc-guard-btn-continue").onclick = dismissPopup;
    document.getElementById("tc-guard-btn-review").onclick = () => {
      dismissPopup();
      openInPageRiskReviewer(scanResult);
    };
  }

  function dismissPopup() {
    const el = document.getElementById("tc-redflag-guard-overlay");
    if (el) el.remove();
  }

  function openInPageRiskReviewer(scanResult) {
    if (document.getElementById("tc-guard-reviewer-drawer")) return;

    const flagged = scanResult.flagged_clauses || [];
    const itemsHtml = flagged.map(f => `
      <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.1); border-left: 4px solid ${f.color || '#ff3366'}; border-radius: 8px; padding: 14px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-weight: 700; font-size: 0.9rem; color: #fff;">${f.category_name}</span>
          <span style="font-size: 0.72rem; font-family: monospace; padding: 2px 6px; border-radius: 4px; background: rgba(255,51,102,0.2); color: #ff3366;">${f.severity}</span>
        </div>
        <div style="font-size: 0.82rem; font-family: monospace; color: #94a3b8; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px; margin-bottom: 8px;">
          "${f.text}"
        </div>
        <div style="font-size: 0.84rem; color: #e2e8f0; margin-bottom: 6px;">
          <strong>Why Flagged:</strong> ${f.explanation}
        </div>
        <div style="font-size: 0.82rem; color: #38bdf8;">
          <strong>Potential Impact:</strong> ${f.why_it_matters}
        </div>
        <button class="tc-btn-show-clause" data-text="${encodeURIComponent(f.text)}" style="margin-top: 10px; background: rgba(0,242,255,0.1); border: 1px solid #00f2ff; color: #00f2ff; padding: 6px 10px; border-radius: 4px; font-size: 0.78rem; cursor: pointer;">
          📄 SHOW CLAUSE
        </button>
      </div>
    `).join("");

    const drawerHtml = `
      <div id="tc-guard-reviewer-drawer" style="
        position: fixed;
        top: 0;
        right: 0;
        width: 440px;
        max-width: 100vw;
        height: 100vh;
        background: #090e18;
        border-left: 2px solid #00f2ff;
        box-shadow: -10px 0 50px rgba(0,0,0,0.9);
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #e2e8f0;
        display: flex;
        flex-direction: column;
      ">
        <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: 800; font-size: 1rem; color: #00f2ff;">🛡️ DETECTED AGREEMENT RISKS</div>
          <button id="tc-drawer-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 1.6rem; cursor: pointer;">&times;</button>
        </div>
        <div style="padding: 20px; flex: 1; overflow-y: auto;">
          <div style="font-size: 0.84rem; color: #94a3b8; margin-bottom: 16px;">
            Target Site: <strong style="color: #fff;">${scanResult.domain}</strong> &bull; Safety Score: <strong style="color: #00f2ff;">${scanResult.safety_score}/100</strong>
          </div>
          ${itemsHtml || "<p>No critical red flags detected.</p>"}
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", drawerHtml);

    document.getElementById("tc-drawer-close-btn").onclick = () => {
      const d = document.getElementById("tc-guard-reviewer-drawer");
      if (d) d.remove();
    };

    document.querySelectorAll(".tc-btn-show-clause").forEach(btn => {
      btn.onclick = () => {
        const clauseText = decodeURIComponent(btn.getAttribute("data-text"));
        if (window.highlightAndScrollToClause) {
          window.highlightAndScrollToClause(clauseText);
        }
      };
    });
  }

  window.showTCWarningPopup = showTCWarningPopup;
  window.showRedFlagWarningOverlay = function (customResult) {
    const defaultResult = customResult || {
      domain: "novacloud-demo.com",
      safety_score: 18,
      risk_score: 18,
      risk_level: "CRITICAL",
      flagged_clauses: [
        {
          severity: "CRITICAL",
          category_name: "Arbitration & Dispute Resolution",
          text: "ANY DISPUTE OR CLAIM SHALL BE RESOLVED EXCLUSIVELY THROUGH BINDING ARBITRATION IN THE CAYMAN ISLANDS. YOU WAIVE RIGHT TO CLASS ACTION.",
          explanation: "Strips your constitutional right to sue in court or join class actions."
        },
        {
          severity: "CRITICAL",
          category_name: "AI Model Training License",
          text: "You grant NovaCloud a perpetual, irrevocable, worldwide license to train AI and machine learning models on any text or images uploaded.",
          explanation: "Gives company unlimited rights to train AI models on your private data."
        },
        {
          severity: "HIGH",
          category_name: "Data Selling & Ad Broker Sharing",
          text: "NovaCloud reserves the right to sell, lease, and share your personal profile data and browsing history to third-party ad brokers.",
          explanation: "Your personal information can be commercialized and sold to advertisers."
        },
        {
          severity: "HIGH",
          category_name: "Auto-Renewal & Recurring Billing",
          text: "Free trial automatically converts after 7 days into an annual plan billed at $299/month without prior notice.",
          explanation: "Charges high recurring subscription fees automatically after trial."
        }
      ]
    };
    showTCWarningPopup(defaultResult);
  };
})();
