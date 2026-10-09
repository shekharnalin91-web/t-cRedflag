"""
T&C Red Flag Scanner - Flask Server
Team: CorruptX
Cybersecurity Hackathon Platform
"""

import os
import sys
import json
import re
from urllib.parse import urlparse
import urllib.request
import urllib.error
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from bs4 import BeautifulSoup

from analyzer import ClauseAnalyzer

# Setup Flask application
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)  # Allow cross-origin requests for local dev / dual-mode hosting

# Initialize Analyzer engine
analyzer = ClauseAnalyzer(os.path.join(BASE_DIR, "risk_rules.json"))

# Load Sample Policies
SAMPLE_POLICIES_PATH = os.path.join(BASE_DIR, "sample_policies.json")
try:
    with open(SAMPLE_POLICIES_PATH, "r", encoding="utf-8") as f:
        SAMPLE_POLICIES = json.load(f).get("samples", [])
except Exception as e:
    print(f"Warning: Could not load sample policies: {e}")
    SAMPLE_POLICIES = []


# -------------------------------------------------------------
# FRONTEND STATIC ROUTES
# -------------------------------------------------------------

@app.route("/")
def serve_index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/scanner")
def serve_scanner():
    return send_from_directory(FRONTEND_DIR, "scanner.html")

@app.route("/results")
def serve_results():
    return send_from_directory(FRONTEND_DIR, "results.html")

@app.route("/history")
def serve_history():
    return send_from_directory(FRONTEND_DIR, "history.html")

@app.route("/about")
def serve_about():
    return send_from_directory(FRONTEND_DIR, "about.html")


# -------------------------------------------------------------
# HELPER FUNCTIONS FOR WEBSITE FETCHING & CONTENT EXTRACTION
# -------------------------------------------------------------

def extract_tc_from_html(html_content: str, url: str = "") -> Dict[str, Any]:
    """
    Extract clean Terms & Conditions prose from raw HTML by removing
    nav, footers, ad blocks, cookie banners, buttons, and UI chrome.
    """
    soup = BeautifulSoup(html_content, "html.parser")

    # Extract Page Title
    page_title = "Terms & Conditions"
    if soup.title and soup.title.string:
        page_title = soup.title.string.strip()
    elif soup.find("h1"):
        page_title = soup.find("h1").get_text(strip=True)

    # Strip noisy non-content elements
    for element in soup([
        "script", "style", "meta", "noscript", "svg", "nav", "aside", "menu"
    ]):
        element.extract()

    # Strip by class/id keywords related to UI noise
    noise_selectors = [
        ".cookie-banner", "#cookie-notice", ".cookie-consent", ".ad", ".advertisement",
        ".navigation", ".nav-bar", ".site-footer", ".menu", ".sidebar", ".modal"
    ]
    for selector in noise_selectors:
        for match in soup.select(selector):
            match.extract()

    # Extract text block with paragraph separation
    text_lines = []
    for p in soup.find_all(["p", "h1", "h2", "h3", "h4", "h5", "li", "div"]):
        line = p.get_text(separator=" ", strip=True)
        if line and len(line) > 10:
            text_lines.append(line)

    extracted_text = "\n\n".join(text_lines)
    if not extracted_text:
        extracted_text = soup.get_text(separator="\n\n", strip=True)

    # Detect if page actually appears to contain T&C text
    tc_keywords = ["terms", "condition", "privacy", "policy", "agreement", "dispute", "arbitration", "shall", "service", "user", "rights", "liability"]
    lower_text = extracted_text.lower()
    tc_matches = sum(1 for kw in tc_keywords if kw in lower_text)

    is_valid_tc = tc_matches >= 3 and len(extracted_text.split()) >= 40

    return {
        "page_title": page_title,
        "extracted_text": extracted_text,
        "is_valid_tc": is_valid_tc,
        "word_count": len(extracted_text.split())
    }


# -------------------------------------------------------------
# REST API ENDPOINTS
# -------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health & capability probe."""
    return jsonify({
        "status": "healthy",
        "app": "T&C Red Flag Scanner",
        "team": "CorruptX",
        "version": "2.0.0",
        "offline_capable": True,
        "engine": "Modular Cybersecurity Rule-Based NLP",
        "active_categories": len(analyzer.categories)
    })

@app.route("/api/rules", methods=["GET"])
def get_rules():
    """Return active risk taxonomy and scoring rules."""
    return jsonify(analyzer.rules_data)

@app.route("/api/demo", methods=["GET"])
def get_demo_policies():
    """Return realistic demo policies for instant hackathon evaluation."""
    return jsonify({
        "status": "success",
        "count": len(SAMPLE_POLICIES),
        "samples": SAMPLE_POLICIES
    })

@app.route("/api/scan-url", methods=["POST"])
def scan_website_url():
    """
    Direct Website / T&C Link Scanner Endpoint.
    Accepts JSON body: { "url": "https://example.com/terms" }
    """
    try:
        data = request.get_json(silent=True) or {}
        raw_url = data.get("url", "").strip()

        if not raw_url:
            return jsonify({
                "status": "UNABLE_TO_ANALYZE",
                "error": "URL is empty. Please enter a valid website link.",
                "reasons": ["Invalid URL", "Empty input"]
            }), 400

        if not raw_url.startswith(("http://", "https://")):
            raw_url = "https://" + raw_url

        parsed = urlparse(raw_url)
        domain = parsed.netloc or parsed.path

        if not domain or "." not in domain:
            return jsonify({
                "status": "UNABLE_TO_ANALYZE",
                "error": "Invalid domain format.",
                "reasons": ["Invalid URL syntax", "Host unreachable"]
            }), 400

        # Fetch Webpage
        req = urllib.request.Request(
            raw_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                final_url = response.geturl()
                content_type = response.headers.get("Content-Type", "")

                if "text/html" not in content_type and "text/plain" not in content_type:
                    return jsonify({
                        "status": "UNABLE_TO_ANALYZE",
                        "error": "The destination URL does not return HTML or text content.",
                        "reasons": ["Content loaded dynamically", "Non-text response format"]
                    }), 400

                html_bytes = response.read()
                try:
                    html_text = html_bytes.decode("utf-8")
                except UnicodeDecodeError:
                    html_text = html_bytes.decode("latin-1", errors="ignore")

        except urllib.error.HTTPError as e:
            reasons = ["Website blocks automated access", "Authentication required"] if e.code in [401, 403] else ["Website unavailable", f"HTTP Error {e.code}"]
            return jsonify({
                "status": "UNABLE_TO_ANALYZE",
                "error": f"Could not retrieve webpage (HTTP {e.code}).",
                "reasons": reasons
            }), 400
        except Exception as e:
            return jsonify({
                "status": "UNABLE_TO_ANALYZE",
                "error": f"Network access failure: {str(e)}",
                "reasons": ["Website unavailable", "Network error", "Connection timed out"]
            }), 400

        # Extract T&C Content
        extracted_data = extract_tc_from_html(html_text, final_url)
        extracted_text = extracted_data["extracted_text"]
        page_title = extracted_data["page_title"]
        word_count = extracted_data["word_count"]

        if not extracted_text or word_count < 20:
            return jsonify({
                "status": "UNABLE_TO_ANALYZE",
                "error": "Page does not contain accessible Terms & Conditions text.",
                "reasons": ["Content loaded dynamically", "Authentication required", "Empty page body"]
            }), 400

        analysis_status = "COMPLETE" if extracted_data["is_valid_tc"] and word_count >= 150 else "PARTIAL"
        status_message = (
            "Complete analysis — the accessible Terms & Conditions content was analyzed."
            if analysis_status == "COMPLETE"
            else "⚠️ Partial analysis — only part of this webpage could be extracted. The score may not represent the complete Terms & Conditions."
        )

        # Run extracted text through SAME scanner engine
        doc_name = f"{domain} — {page_title}"
        result = analyzer.scan(extracted_text, doc_name, final_url)

        result["analysis_status"] = analysis_status
        result["status_message"] = status_message
        result["source_type"] = "website"
        result["website_info"] = {
            "domain": domain,
            "page_title": page_title,
            "source_url": final_url,
            "status_badge": "✅ Complete Analysis" if analysis_status == "COMPLETE" else "⚠️ Partial Analysis",
            "words_analyzed": word_count,
            "clauses_detected": result["clauses_analyzed"],
            "red_flags": result["red_flags"],
            "high_risk_clauses": result["severity_counts"].get("CRITICAL", 0) + result["severity_counts"].get("HIGH", 0)
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "status": "UNABLE_TO_ANALYZE",
            "error": f"Unexpected URL scanning exception: {str(e)}",
            "reasons": ["Network error", "Parsing failure"]
        }), 500


@app.route("/api/scan", methods=["POST"])
def scan_policy():
    """
    Main analysis endpoint.
    Accepts JSON body: { "text": "...", "document_name": "..." }
    or multipart file upload with key 'file' and optional 'document_name'.
    """
    try:
        raw_text = ""
        doc_name = "Submitted Document"
        source_type = "text"

        if "file" in request.files:
            uploaded_file = request.files["file"]
            filename = uploaded_file.filename or "uploaded_policy.txt"
            doc_name = request.form.get("document_name", filename)
            source_type = "pdf" if filename.lower().endswith(".pdf") else ("image" if filename.lower().endswith((".png", ".jpg", ".jpeg")) else "text")

            content_bytes = uploaded_file.read()

            if filename.lower().endswith(".pdf"):
                # Try pypdf or PyPDF2 extraction
                pdf_text = ""
                try:
                    import io
                    try:
                        import pypdf
                        reader = pypdf.PdfReader(io.BytesIO(content_bytes))
                        for page in reader.pages:
                            pdf_text += page.extract_text() + "\n\n"
                    except ImportError:
                        try:
                            import PyPDF2
                            reader = PyPDF2.PdfReader(io.BytesIO(content_bytes))
                            for page in reader.pages:
                                pdf_text += page.extract_text() + "\n\n"
                        except ImportError:
                            pdf_text = content_bytes.decode("utf-8", errors="ignore")
                except Exception:
                    pdf_text = content_bytes.decode("utf-8", errors="ignore")

                raw_text = pdf_text if pdf_text.strip() else "PDF document text extracted."

            elif filename.lower().endswith((".html", ".htm")):
                try:
                    file_content = content_bytes.decode("utf-8")
                except UnicodeDecodeError:
                    file_content = content_bytes.decode("latin-1", errors="ignore")
                ext = extract_tc_from_html(file_content)
                raw_text = ext["extracted_text"]

            else:
                try:
                    raw_text = content_bytes.decode("utf-8")
                except UnicodeDecodeError:
                    raw_text = content_bytes.decode("latin-1", errors="ignore")

        elif request.is_json:
            data = request.get_json(silent=True) or {}
            raw_text = data.get("text", "")
            doc_name = data.get("document_name", "Pasted Policy")

        elif request.form:
            raw_text = request.form.get("text", "")
            doc_name = request.form.get("document_name", "Submitted Policy")

        if not raw_text or len(raw_text.strip()) == 0:
            return jsonify({
                "error": "Input text is empty. Please provide Terms & Conditions text or upload a document.",
                "risk_score": 100,
                "risk_level": "SAFE",
                "clauses_analyzed": 0,
                "red_flags": 0
            }), 400

        if len(raw_text.strip()) < 15:
            return jsonify({
                "error": "The supplied text is too short to perform a meaningful Terms & Conditions risk assessment.",
                "risk_score": 100,
                "risk_level": "SAFE",
                "clauses_analyzed": 0,
                "red_flags": 0
            }), 400

        if len(raw_text) > 500000:
            raw_text = raw_text[:500000]

        result = analyzer.scan(raw_text, doc_name)
        result["source_type"] = source_type
        return jsonify(result), 200

    except Exception as e:
        print(f"Error during scan: {str(e)}", file=sys.stderr)
        return jsonify({
            "error": f"Internal scan engine exception: {str(e)}",
            "risk_score": 0,
            "risk_level": "ERROR"
        }), 500


@app.route("/api/chat", methods=["POST"])
def chat_assistant():
    """
    AI Privacy Assistant Chatbot Endpoint (RedFlag Assistant 🤖).
    Answers specifically based on currently scanned T&C.
    """
    try:
        data = request.get_json(silent=True) or {}
        user_msg = data.get("message", "").strip()
        active_scan = data.get("active_scan")

        if not user_msg:
            return jsonify({"reply": "Please ask a question about the scanned Terms & Conditions."}), 400

        msg_lower = user_msg.lower()

        # If active scan is available, search specific clauses
        if active_scan and isinstance(active_scan, dict):
            all_clauses = active_scan.get("all_clauses", [])
            flagged = active_scan.get("flagged_clauses", [])
            doc_name = active_scan.get("document_name", "the scanned policy")

            # Intent: Data Sharing
            if any(w in msg_lower for w in ["share", "sharing", "third party", "third-party", "sell", "monetize", "data"]):
                matches = [c for c in (flagged if flagged else all_clauses) if any(k in c["text"].lower() for k in ["share", "disclose", "sell", "third party", "third-party", "monetize"])]
                if matches:
                    m = matches[0]
                    sec = m.get("section_title", "General Provisions")
                    reply = (f"🤖 According to <b>{sec}</b> in <i>'{doc_name}'</i>:<br><br>"
                             f"<i>\"{m['text']}\"</i><br><br>"
                             f"<b>Impact:</b> {m.get('explanation', 'The company reserves rights to share or monetize user information with third-party entities.')}")
                else:
                    reply = f"✅ The scanned Terms in <b>'{doc_name}'</b> do not contain explicit data sharing or data selling clauses."
                return jsonify({"reply": reply})

            # Intent: Auto Renewal / Charges
            if any(w in msg_lower for w in ["auto renew", "charge", "subscription", "recurring", "fee", "cost", "billing"]):
                matches = [c for c in all_clauses if any(k in c["text"].lower() for k in ["renew", "subscrip", "billing", "charge", "fee", "payment"])]
                if matches:
                    m = matches[0]
                    sec = m.get("section_title", "Billing Terms")
                    reply = (f"🤖 According to <b>{sec}</b> in <i>'{doc_name}'</i>:<br><br>"
                             f"<i>\"{m['text']}\"</i><br><br>"
                             f"<b>Check:</b> {m.get('recommendation', 'Set calendar alerts before subscription renewal dates.')}")
                else:
                    reply = f"The scanned Terms do not clearly answer this question regarding recurring charges."
                return jsonify({"reply": reply})

            # Intent: Cancellation / Refund
            if any(w in msg_lower for w in ["cancel", "refund", "money back", "stop subscription"]):
                matches = [c for c in all_clauses if any(k in c["text"].lower() for k in ["cancel", "refund", "non-refundable", "termination"])]
                if matches:
                    m = matches[0]
                    sec = m.get("section_title", "Cancellation Terms")
                    reply = (f"🤖 According to <b>{sec}</b> in <i>'{doc_name}'</i>:<br><br>"
                             f"<i>\"{m['text']}\"</i><br><br>"
                             f"<b>Summary:</b> {m.get('explanation', 'Review cancellation deadlines carefully.')}")
                else:
                    reply = f"The scanned Terms do not clearly answer this question regarding cancellation terms."
                return jsonify({"reply": reply})

            # Intent: Account Termination / Deletion
            if any(w in msg_lower for w in ["delete account", "terminate", "suspend", "banned"]):
                matches = [c for c in all_clauses if any(k in c["text"].lower() for k in ["terminate", "suspend", "delete account", "close account"])]
                if matches:
                    m = matches[0]
                    sec = m.get("section_title", "Account Rules")
                    reply = (f"🤖 According to <b>{sec}</b> in <i>'{doc_name}'</i>:<br><br>"
                             f"<i>\"{m['text']}\"</i><br><br>"
                             f"<b>Warning:</b> {m.get('explanation', 'Account access can be suspended at company discretion.')}")
                else:
                    reply = f"The scanned Terms do not clearly answer this question regarding account deletion."
                return jsonify({"reply": reply})

            # Intent: Policy Changes / Unilateral Modifications
            if any(w in msg_lower for w in ["change these terms", "modify", "update policy", "without notice"]):
                matches = [c for c in all_clauses if any(k in c["text"].lower() for k in ["modify", "change", "update", "at any time", "without notice"])]
                if matches:
                    m = matches[0]
                    sec = m.get("section_title", "Amendments")
                    reply = (f"🤖 According to <b>{sec}</b> in <i>'{doc_name}'</i>:<br><br>"
                             f"<i>\"{m['text']}\"</i><br><br>"
                             f"<b>Note:</b> {m.get('explanation', 'Terms may be updated without individual user notice.')}")
                else:
                    reply = f"The scanned Terms do not clearly answer this question."
                return jsonify({"reply": reply})

            # Intent: Biggest Red Flags
            if any(w in msg_lower for w in ["biggest red flag", "top risk", "worst clause", "summary"]):
                if flagged:
                    top = flagged[0]
                    sec = top.get("section_title", "Flagged Provisions")
                    reply = (f"🚨 <b>Top Red Flag in '{doc_name}' ({top.get('severity', 'HIGH')} Severity):</b><br><br>"
                             f"Section: <b>{sec}</b> — <i>\"{top['text']}\"</i><br><br>"
                             f"<b>Why it matters:</b> {top.get('why_it_matters', '')}")
                else:
                    reply = f"🟢 No major red flags were detected in <b>'{doc_name}'</b>."
                return jsonify({"reply": reply})

            # Intent: Explain like I'm 15
            if "like i'm 15" in msg_lower or "explain simple" in msg_lower or "eli5" in msg_lower:
                score = active_scan.get("safety_score", active_scan.get("risk_score", 100))
                red_cnt = active_scan.get("red_flags", 0)
                reply = (f"💡 <b>Simple English Summary for '{doc_name}':</b><br><br>"
                         f"Imagine signing a contract: this document has a Safety Rating of <b>{score}/100</b> with <b>{red_cnt} warnings</b>.<br>"
                         f"Check out the red flags panel to see exactly which clauses surrenders rights or charges recurring fees.")
                return jsonify({"reply": reply})

        # Fallback response if no specific match or no active scan
        if any(w in msg_lower for w in ["arbitration", "court", "lawsuit"]):
            reply = "⚖️ <b>Mandatory Arbitration:</b> Clauses requiring binding arbitration strip away your right to sue in court or join class actions."
        else:
            reply = "The scanned Terms do not clearly answer this question."

        return jsonify({"reply": reply}), 200

    except Exception as e:
        return jsonify({"reply": f"Sorry, encountered an error processing your query: {str(e)}"}), 500


# -------------------------------------------------------------
# ENTRY POINT
# -------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("=" * 60)
    print("  CORRUPTX - T&C RED FLAG SCANNER v2.0")
    print("  Cybersecurity Hackathon Engine")
    print(f"  Serving on http://127.0.0.1:{port}")
    print("=" * 60)
    app.run(host="0.0.0.0", port=port, debug=True)
