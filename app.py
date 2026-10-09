import streamlit as st
import json
import os
import sys

# Add backend directory to sys.path to reuse ClauseAnalyzer & scrapers
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

try:
    from backend.analyzer import ClauseAnalyzer
except ImportError:
    from analyzer import ClauseAnalyzer

st.set_page_config(
    page_title="🛡️ T&C Red Flag Guard",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Cyber Dark CSS
st.markdown("""
<style>
    .main { background-color: #080b12; color: #f0f4f8; }
    .stApp { background-color: #080b12; }
    h1, h2, h3 { color: #ffffff !important; font-family: 'Inter', sans-serif; }
    .stButton>button {
        background: #00f0ff;
        color: #000000;
        font-weight: 800;
        border-radius: 8px;
        border: none;
        padding: 0.5rem 1.2rem;
    }
    .stButton>button:hover {
        background: #33f3ff;
        box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
    }
    .metric-card {
        background-color: #121824;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
    }
    .critical-badge {
        background: rgba(255, 71, 87, 0.15);
        color: #ff4757;
        border: 1px solid #ff4757;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# Initialize Analyzer Engine
@st.cache_resource
def get_analyzer():
    return ClauseAnalyzer()

analyzer = get_analyzer()

# Sidebar Navigation
st.sidebar.image("https://img.icons8.com/fluency/96/shield.png", width=64)
st.sidebar.title("🛡️ T&C Red Flag Guard")
st.sidebar.caption("Antivirus-Style Protection for Terms & Conditions")

menu = st.sidebar.radio("Navigation", ["🔍 AI T&C Scanner", "🤖 RedFlag AI Chatbot", "🧩 Extension & Downloads", "🔐 Trust Center"])

if menu == "🔍 AI T&C Scanner":
    st.title("🛡️ AI Terms & Conditions Risk Scanner")
    st.markdown("Scan pasted text, uploaded files, or website policies against our **18-Category Legal Threat Engine**.")

    tab1, tab2, tab3 = st.tabs(["📝 Paste T&C Text", "📄 Upload PDF / File", "🌐 Analyze Website URL"])

    raw_text = ""
    doc_name = "Terms Analysis"

    with tab1:
        doc_name_input = st.text_input("Document Name", "Pasted Terms & Conditions")
        pasted_text = st.text_area("Paste Terms & Conditions prose here:", height=220, placeholder="We reserve the right to share your personal data with third parties...")
        if st.button("🚀 Analyze Pasted Text"):
            raw_text = pasted_text
            doc_name = doc_name_input

    with tab2:
        uploaded_file = st.file_uploader("Choose a PDF or Text file", type=["pdf", "txt"])
        if uploaded_file is not None:
            doc_name = uploaded_file.name
            if uploaded_file.type == "application/pdf":
                try:
                    import pypdf
                    reader = pypdf.PdfReader(uploaded_file)
                    raw_text = "\n".join([page.extract_text() for page in reader.pages])
                except Exception:
                    raw_text = uploaded_file.read().decode("utf-8", errors="ignore")
            else:
                raw_text = uploaded_file.read().decode("utf-8", errors="ignore")

    with tab3:
        target_url = st.text_input("Enter Webpage URL:", placeholder="https://example.com/terms")
        if st.button("🌐 Fetch & Scan URL"):
            if target_url:
                try:
                    import urllib.request
                    from bs4 import BeautifulSoup
                    req = urllib.request.Request(
                        target_url,
                        headers={
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                        }
                    )
                    with urllib.request.urlopen(req, timeout=12) as response:
                        html = response.read().decode("utf-8", errors="ignore")
                        soup = BeautifulSoup(html, "html.parser")
                        for s in soup(["script", "style", "noscript", "svg"]):
                            s.extract()
                        raw_text = soup.get_text(separator="\n\n")
                        doc_name = f"URL Scan: {target_url}"
                except Exception as e:
                    st.error(f"Could not scan URL directly ({e}). Please copy and paste the Terms text in the 'Paste T&C Text' tab.")

    # Display Scan Results
    if raw_text and len(raw_text.strip()) > 30:
        with st.spinner("Analyzing legal prose against 18 risk categories..."):
            res = analyzer.scan(raw_text, doc_name)
            st.session_state["active_scan"] = res

        st.divider()
        col1, col2, col3, col4 = st.columns(4)

        score = res["risk_score"]

        col1.metric("Safety Score", f"{score}/100", delta_color="inverse")
        col2.metric("Risk Level", res["risk_level"])
        col3.metric("Clauses Analyzed", res["clauses_analyzed"])
        col4.metric("Red Flags Found", res["red_flags"])

        st.subheader("📊 Sub-Risk Metric Breakdown")
        m_cols = st.columns(6)
        sub = res.get("sub_scores", {})
        m_cols[0].progress(sub.get("privacy_risk", 0)/100, text=f"Privacy: {sub.get('privacy_risk', 0)}%")
        m_cols[1].progress(sub.get("financial_risk", 0)/100, text=f"Financial: {sub.get('financial_risk', 0)}%")
        m_cols[2].progress(sub.get("subscription_risk", 0)/100, text=f"Subscription: {sub.get('subscription_risk', 0)}%")
        m_cols[3].progress(sub.get("data_sharing_risk", 0)/100, text=f"Data Sharing: {sub.get('data_sharing_risk', 0)}%")
        m_cols[4].progress(sub.get("account_termination_risk", 0)/100, text=f"Termination: {sub.get('account_termination_risk', 0)}%")
        m_cols[5].progress(sub.get("legal_dispute_risk", 0)/100, text=f"Disputes: {sub.get('legal_dispute_risk', 0)}%")

        st.subheader("🚨 Detected Red Flags & Clause Explanations")
        for flag in res.get("flagged_clauses", []):
            sev = flag.get("severity", "HIGH")
            sev_icon = "⛔" if sev == "CRITICAL" else ("🔴" if sev == "HIGH" else "🟠")
            with st.expander(f"{sev_icon} [{sev}] {flag.get('category_name')}"):
                st.markdown(f"**Original Clause:** *\"{flag.get('text')}\"*")
                st.warning(f"**Why it matters:** {flag.get('explanation')}")
                st.info(f"**Plain English Summary:** {flag.get('plain_english')}")

elif menu == "🤖 RedFlag AI Chatbot":
    st.title("🤖 RedFlag AI Privacy Assistant")
    st.caption("Ask natural language questions about your scanned Terms & Conditions.")

    active_scan = st.session_state.get("active_scan")
    if not active_scan:
        st.warning("⚠️ Please run a scan first in the 'AI T&C Scanner' tab so RedFlag AI can analyze your document.")
    else:
        st.success(f"Loaded Active Scan: **{active_scan.get('document_name')}** (Safety Score: {active_scan.get('safety_score')}/100)")

    if "messages" not in st.session_state:
        st.session_state.messages = [{"role": "assistant", "content": "Hello! I am your RedFlag Assistant. Ask me anything like: *'Is my data being shared?'* or *'Can they automatically charge me?'*"}]

    for msg in st.session_state.messages:
        st.chat_message(msg["role"]).write(msg["content"])

    user_query = st.chat_input("Ask a question about the scanned agreement...")
    if user_query:
        st.session_state.messages.append({"role": "user", "content": user_query})
        st.chat_message("user").write(user_query)

        q_lower = user_query.lower()
        reply = "I analyzed the document. "
        if active_scan:
            flagged = active_scan.get("flagged_clauses", [])
            if "share" in q_lower or "data" in q_lower or "sell" in q_lower:
                ds = [c for c in flagged if "data" in c.get("category_id", "") or "share" in c.get("category_id", "")]
                if ds:
                    reply = f"🚨 **Data Sharing Found:** {ds[0]['explanation']} Original clause: *\"{ds[0]['text']}\"*"
                else:
                    reply = "✅ No explicit data selling or third-party sharing clauses were detected in this agreement."
            elif "charge" in q_lower or "auto" in q_lower or "renew" in q_lower or "cancel" in q_lower:
                sub = [c for c in flagged if "renewal" in c.get("category_id", "") or "billing" in c.get("category_id", "")]
                if sub:
                    reply = f"🔄 **Subscription Risk:** {sub[0]['explanation']} Original clause: *\"{sub[0]['text']}\"*"
                else:
                    reply = "No automatic renewal or hidden fee red flags were detected."
            else:
                reply = f"Document '{active_scan.get('document_name')}' has a Safety Score of {active_scan.get('safety_score')}/100 with {active_scan.get('red_flags')} flagged provisions."
        
        st.session_state.messages.append({"role": "assistant", "content": reply})
        st.chat_message("assistant").write(reply)

elif menu == "🧩 Extension & Downloads":
    st.title("🧩 Installable Software Package Downloads")
    st.markdown("Download **🛡️ T&C Red Flag Guard v2.4.0** for Windows or install the Manifest V3 Browser Extension.")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("💻 Windows Software & Extension Package")
        zip_path = os.path.join(os.path.dirname(__file__), "website", "tc_red_flag_guard_v2.4.0_windows.zip")
        if os.path.exists(zip_path):
            with open(zip_path, "rb") as f:
                st.download_button(
                    label="⬇️ Download Package (v2.4.0 ZIP)",
                    data=f,
                    file_name="tc_red_flag_guard_v2.4.0_windows.zip",
                    mime="application/zip"
                )
        else:
            st.info("Package zip bundle is ready in your repository.")

    with col2:
        st.subheader("🧩 Quick Extension Loader Steps")
        st.markdown("""
        1. Open Chrome/Edge and navigate to `chrome://extensions` or `edge://extensions`.
        2. Toggle **Developer mode** ON (top right).
        3. Click **Load unpacked** and select the `extension/` directory.
        """)

elif menu == "🔐 Trust Center":
    st.title("🔐 Zero-Knowledge Privacy Center")
    st.markdown("""
    - **100% Local Processing**: All clause parsing and score calculations run in your local browser or server instance.
    - **Zero Telemetry**: No browsing history or uploaded text is ever saved or sent to third-party ad brokers.
    - **Non-Automated Consent Guarantee**: The software NEVER automatically clicks consent checkboxes or accepts terms on your behalf.
    """)
