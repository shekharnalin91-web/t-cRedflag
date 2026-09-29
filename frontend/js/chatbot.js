/**
 * CorruptX - RedFlag Assistant AI Chatbot 🤖
 * Specific to currently scanned T&C, referencing original section headings and clause text.
 */

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    injectChatbotUI();
    initChatbotEvents();
  });

  function injectChatbotUI() {
    if (document.getElementById("tc-chatbot-widget")) return;

    const widgetHtml = `
      <div id="tc-chatbot-widget">
        <button id="tc-chatbot-toggle" title="Open RedFlag Assistant">
          <div class="chatbot-toggle-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span class="chatbot-toggle-text">RedFlag Assistant 🤖</span>
          <span class="chatbot-pulse-dot"></span>
        </button>

        <div id="tc-chatbot-modal" class="chatbot-modal hidden">
          <div class="chatbot-header">
            <div class="chatbot-header-info">
              <div class="chatbot-avatar">🤖</div>
              <div>
                <div class="chatbot-title">RedFlag Assistant</div>
                <div class="chatbot-status"><span class="status-indicator-dot"></span> Active Policy Assistant</div>
              </div>
            </div>
            <div class="chatbot-header-actions">
              <button id="chatbot-clear-btn" title="Clear Chat History">🗑️</button>
              <button id="chatbot-close-btn" title="Close Panel">✕</button>
            </div>
          </div>

          <div id="chatbot-messages" class="chatbot-messages">
            <div class="chat-message assistant">
              <div class="message-content">
                👋 Hello! I am your <b>RedFlag Assistant 🤖</b>.<br><br>
                Ask me questions based specifically on your currently scanned Terms & Conditions!
              </div>
            </div>
          </div>

          <!-- Suggested Question Chips Bar -->
          <div id="chatbot-chips" class="chatbot-chips">
            <button class="chip-btn" data-query="Is my data being shared?">🔒 Is my data shared?</button>
            <button class="chip-btn" data-query="Can they automatically charge me?">💳 Auto charges?</button>
            <button class="chip-btn" data-query="Can I cancel anytime?">❌ Cancel anytime?</button>
            <button class="chip-btn" data-query="What happens if I delete my account?">🗑️ Delete account?</button>
            <button class="chip-btn" data-query="Can they terminate my account?">🚫 Account termination?</button>
            <button class="chip-btn" data-query="Can they change these terms?">📝 Changes without notice?</button>
            <button class="chip-btn" data-query="What are the biggest red flags?">🚨 Biggest red flags?</button>
            <button class="chip-btn" data-query="Explain this clause like I'm 15.">💡 Explain like I'm 15</button>
          </div>

          <div class="chatbot-footer">
            <input type="text" id="chatbot-input" placeholder="Ask a question about this scanned T&C..." autocomplete="off" />
            <button id="chatbot-send-btn" title="Send Message">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", widgetHtml);
  }

  function initChatbotEvents() {
    const toggleBtn = document.getElementById("tc-chatbot-toggle");
    const closeBtn = document.getElementById("chatbot-close-btn");
    const clearBtn = document.getElementById("chatbot-clear-btn");
    const modal = document.getElementById("tc-chatbot-modal");
    const sendBtn = document.getElementById("chatbot-send-btn");
    const inputEl = document.getElementById("chatbot-input");
    const chipsContainer = document.getElementById("chatbot-chips");

    if (!toggleBtn || !modal) return;

    toggleBtn.addEventListener("click", () => {
      modal.classList.toggle("hidden");
      if (!modal.classList.contains("hidden")) {
        inputEl.focus();
        scrollToBottom();
      }
    });

    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    clearBtn.addEventListener("click", () => {
      const messagesEl = document.getElementById("chatbot-messages");
      messagesEl.innerHTML = `
        <div class="chat-message assistant">
          <div class="message-content">
            Conversation cleared. Ask me any question about your scanned document!
          </div>
        </div>
      `;
    });

    sendBtn.addEventListener("click", () => handleUserSend());

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleUserSend();
      }
    });

    if (chipsContainer) {
      chipsContainer.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip-btn");
        if (chip) {
          const query = chip.getAttribute("data-query");
          if (query) {
            inputEl.value = query;
            handleUserSend();
          }
        }
      });
    }
  }

  async function handleUserSend() {
    const inputEl = document.getElementById("chatbot-input");
    const text = inputEl ? inputEl.value.trim() : "";
    if (!text) return;

    appendMessage("user", text);
    inputEl.value = "";

    const typingId = appendTypingIndicator();
    scrollToBottom();

    await sleep(350);

    let responseHtml = "";
    if (window.AppState && window.AppState.isBackendAvailable) {
      try {
        const activeScan = window.getActiveScan ? window.getActiveScan() : null;
        const res = await fetch((window.AppState.apiBase || "") + "/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, active_scan: activeScan })
        });
        if (res.ok) {
          const data = await res.json();
          responseHtml = data.reply;
        }
      } catch (e) {
        // Fallback to client response
      }
    }

    if (!responseHtml) {
      responseHtml = generateClientResponse(text);
    }

    removeTypingIndicator(typingId);
    appendMessage("assistant", responseHtml);
    scrollToBottom();
  }

  function generateClientResponse(query) {
    const activeScan = window.getActiveScan ? window.getActiveScan() : null;
    const msgLower = query.toLowerCase();

    if (!activeScan) {
      return `Please perform a document or website scan first in the <a href="scanner.html" style="color:var(--accent-cyan);">Scanner</a>.`;
    }

    const docName = activeScan.document_name || "scanned document";
    const allClauses = activeScan.all_clauses || [];
    const flagged = activeScan.flagged_clauses || [];

    // 1. Data Sharing query
    if (msgLower.includes("data") && (msgLower.includes("share") || msgLower.includes("sold") || msgLower.includes("third party") || msgLower.includes("broker"))) {
      const match = allClauses.find(c => ["share", "disclose", "sell", "monetize", "third part"].some(k => c.text.toLowerCase().includes(k)));
      if (match) {
        return `🤖 According to <b>${match.section_title || 'Section'}</b> in <i>'${docName}'</i>:<br><br>
<i>"${match.text}"</i><br><br>
<b>Impact:</b> ${match.explanation || 'The company permits sharing or monetizing user information.'}`;
      } else {
        return `✅ The scanned Terms in <b>'${docName}'</b> do not contain explicit data sharing or data selling clauses.`;
      }
    }

    // 2. Auto Renewal / Charges query
    if (msgLower.includes("charge") || msgLower.includes("renew") || msgLower.includes("subscription") || msgLower.includes("billing") || msgLower.includes("fee")) {
      const match = allClauses.find(c => ["renew", "subscription", "recurring", "charge", "billing", "fee"].some(k => c.text.toLowerCase().includes(k)));
      if (match) {
        return `🤖 According to <b>${match.section_title || 'Section'}</b> in <i>'${docName}'</i>:<br><br>
<i>"${match.text}"</i><br><br>
<b>Check:</b> ${match.recommendation || 'Verify subscription renewal dates.'}`;
      } else {
        return `The scanned Terms do not clearly answer this question regarding recurring charges.`;
      }
    }

    // 3. Cancel anytime query
    if (msgLower.includes("cancel")) {
      const match = allClauses.find(c => ["cancel", "refund", "termination", "non-refundable"].some(k => c.text.toLowerCase().includes(k)));
      if (match) {
        return `🤖 According to <b>${match.section_title || 'Section'}</b> in <i>'${docName}'</i>:<br><br>
<i>"${match.text}"</i><br><br>
<b>Summary:</b> ${match.explanation || 'Review cancellation window.'}`;
      } else {
        return `The scanned Terms do not clearly answer this question regarding cancellation terms.`;
      }
    }

    // 4. Delete account query
    if (msgLower.includes("delete account") || msgLower.includes("delete my account") || msgLower.includes("erasure")) {
      const match = allClauses.find(c => ["delete", "retain", "erasure", "residual", "backup"].some(k => c.text.toLowerCase().includes(k)));
      if (match) {
        return `🤖 According to <b>${match.section_title || 'Section'}</b> in <i>'${docName}'</i>:<br><br>
<i>"${match.text}"</i><br><br>
<b>Note:</b> ${match.explanation || 'Data retention policies dictate post-deletion storage.'}`;
      } else {
        return `The scanned Terms do not clearly answer this question regarding account deletion.`;
      }
    }

    // 5. Account termination query
    if (msgLower.includes("terminate") || msgLower.includes("suspend") || msgLower.includes("ban")) {
      const match = allClauses.find(c => ["terminate", "suspend", "forfeit", "sole discretion"].some(k => c.text.toLowerCase().includes(k)));
      if (match) {
        return `🤖 According to <b>${match.section_title || 'Section'}</b> in <i>'${docName}'</i>:<br><br>
<i>"${match.text}"</i><br><br>
<b>Warning:</b> ${match.explanation || 'The company reserves rights to suspend access at discretion.'}`;
      } else {
        return `The scanned Terms do not clearly answer this question regarding account termination.`;
      }
    }

    // 6. Change terms query
    if (msgLower.includes("change") || msgLower.includes("modify") || msgLower.includes("update") || msgLower.includes("without notice")) {
      const match = allClauses.find(c => ["modify", "change", "update", "at any time", "without notice"].some(k => c.text.toLowerCase().includes(k)));
      if (match) {
        return `🤖 According to <b>${match.section_title || 'Section'}</b> in <i>'${docName}'</i>:<br><br>
<i>"${match.text}"</i><br><br>
<b>Note:</b> ${match.explanation || 'Terms may be updated without individual notification.'}`;
      } else {
        return `The scanned Terms do not clearly answer this question regarding policy updates.`;
      }
    }

    // 7. Biggest red flags
    if (msgLower.includes("red flag") || msgLower.includes("biggest") || msgLower.includes("worst")) {
      if (flagged.length > 0) {
        const top = flagged[0];
        return `🚨 <b>Top Red Flag in '${docName}' (${top.severity} Severity):</b><br><br>
Section: <b>${top.section_title || 'Flagged Provision'}</b> — <i>"${top.text}"</i><br><br>
<b>Why it matters:</b> ${top.why_it_matters}`;
      } else {
        return `🟢 No major red flags were detected in <b>'${docName}'</b>.`;
      }
    }

    // 8. Explain like I'm 15
    if (msgLower.includes("15") || msgLower.includes("simple") || msgLower.includes("eli5")) {
      const score = activeScan.safety_score !== undefined ? activeScan.safety_score : activeScan.risk_score;
      return `💡 <b>Simple English Summary for '${docName}':</b><br><br>
This contract has a Safety Rating of <b>${score}/100</b> with <b>${activeScan.red_flags} warning flags</b>.<br>
Click any flagged card on the dashboard to read the plain English explanation and suggested actions!`;
    }

    // 9. Which clauses should I read
    if (msgLower.includes("read before accepting") || msgLower.includes("which clauses")) {
      if (flagged.length > 0) {
        const list = flagged.slice(0, 3).map(f => `• <b>${f.section_title || 'Section'}:</b> ${f.category_name} (${f.severity})`).join("<br>");
        return `📖 <b>Key Clauses to Read in '${docName}':</b><br><br>${list}`;
      } else {
        return `No high-risk clauses were flagged in the document.`;
      }
    }

    return `The scanned Terms do not clearly answer this question.`;
  }

  function appendMessage(sender, htmlContent) {
    const messagesEl = document.getElementById("chatbot-messages");
    if (!messagesEl) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = `<div class="message-content">${htmlContent}</div>`;
    messagesEl.appendChild(msgDiv);
  }

  function appendTypingIndicator() {
    const messagesEl = document.getElementById("chatbot-messages");
    if (!messagesEl) return null;

    const id = "typing_" + Date.now();
    const typingDiv = document.createElement("div");
    typingDiv.id = id;
    typingDiv.className = "chat-message assistant typing";
    typingDiv.innerHTML = `
      <div class="message-content">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    messagesEl.appendChild(typingDiv);
    return id;
  }

  function removeTypingIndicator(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom() {
    const messagesEl = document.getElementById("chatbot-messages");
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
})();
