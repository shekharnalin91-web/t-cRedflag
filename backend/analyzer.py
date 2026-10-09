"""
T&C Red Flag Scanner - Analysis Engine
Team: CorruptX
Modular rule-based NLP and risk taxonomy engine for Terms & Conditions, Privacy Policies, and EULAs.
Supports section tracking, sub-risk score metrics, 5 severity levels, and uncertainty detection.
"""

import re
import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional

class ClauseAnalyzer:
    """
    Modular analysis engine that segments legal text into clauses,
    tracks section headings, matches clauses against an 18-category cybersecurity taxonomy,
    and computes a deterministic 0-100 risk score and sub-risk metrics.
    """

    def __init__(self, rules_path: Optional[str] = None):
        if rules_path is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            rules_path = os.path.join(current_dir, "risk_rules.json")
        
        self.rules_path = rules_path
        self.rules_data = self._load_rules()
        self.categories = self.rules_data.get("categories", [])
        self._compile_patterns()

    def _load_rules(self) -> Dict[str, Any]:
        """Load the cybersecurity taxonomy from JSON."""
        if not os.path.exists(self.rules_path):
            raise FileNotFoundError(f"Risk rules taxonomy file not found: {self.rules_path}")
        with open(self.rules_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _compile_patterns(self):
        """Pre-compile regex patterns for high-throughput clause evaluation."""
        self.compiled_rules = []
        for cat in self.categories:
            compiled_patterns = []
            for pattern_str in cat.get("patterns", []):
                try:
                    compiled_patterns.append(re.compile(pattern_str, re.IGNORECASE))
                except re.error as e:
                    print(f"Warning: Invalid regex in category {cat.get('id')}: {pattern_str} ({e})")
            
            self.compiled_rules.append({
                "id": cat.get("id"),
                "name": cat.get("name"),
                "severity": cat.get("severity", "LOW"),
                "weight": cat.get("weight", 5),
                "color": cat.get("color", "#38bdf8"),
                "explanation": cat.get("explanation", ""),
                "why_it_matters": cat.get("why_it_matters", ""),
                "recommendation": cat.get("recommendation", ""),
                "keywords": [k.lower() for k in cat.get("keywords", [])],
                "patterns": compiled_patterns
            })

    def clean_text(self, raw_text: str) -> str:
        """Sanitize and normalize text formatting without losing legal sentence boundaries."""
        if not raw_text:
            return ""
        
        cleaned = raw_text.replace("“", "\"").replace("”", "\"")
        cleaned = cleaned.replace("‘", "'").replace("’", "'")
        cleaned = cleaned.replace("—", " - ").replace("–", " - ")
        cleaned = cleaned.replace("\r\n", "\n").replace("\r", "\n")
        cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", cleaned)
        return cleaned.strip()

    def segment_clauses_with_sections(self, text: str) -> List[Dict[str, Any]]:
        """
        Segment text into clauses while identifying parent section titles/headings.
        Returns a list of dicts: [{ 'text': ..., 'section_title': ... }, ...]
        """
        cleaned = self.clean_text(text)
        if not cleaned:
            return []

        lines = cleaned.split("\n")
        structured_clauses = []
        current_section = "General Terms"

        # Regex for common section titles like "1. DATA COLLECTION", "Section 8.2", "ARTICLE IV"
        section_pattern = re.compile(
            r"^(?:(?:SECTION|ARTICLE|CLAUSE|PART)\s+[0-9A-Z\.]+|[0-9]{1,2}\.|\([0-9a-z]+\))[ \t]+([A-Z0-9\s,\-\&/]{3,60})$",
            re.IGNORECASE
        )

        abbr_map = {
            r"\be\.g\.\b": "EG_TEMP_MARKER",
            r"\bi\.e\.\b": "IE_TEMP_MARKER",
            r"\bU\.S\.\b": "US_TEMP_MARKER",
            r"\betc\.\b": "ETC_TEMP_MARKER",
            r"\bInc\.\b": "INC_TEMP_MARKER",
            r"\bLtd\.\b": "LTD_TEMP_MARKER",
            r"\bLLC\.\b": "LLC_TEMP_MARKER",
            r"\bSec\.\b": "SEC_TEMP_MARKER",
            r"\bNo\.\b": "NO_TEMP_MARKER",
            r"\bv\.\b": "V_TEMP_MARKER",
            r"\bvs\.\b": "VS_TEMP_MARKER"
        }

        buffer = []

        def flush_buffer(sec_title):
            if not buffer:
                return
            full_block = " ".join(buffer)
            buffer.clear()

            masked = full_block
            for regex_pat, replacement in abbr_map.items():
                masked = re.sub(regex_pat, replacement, masked, flags=re.IGNORECASE)
            masked = re.sub(r"(?<=\d)\.(?=\d)", "DECIMAL_DOT_MARKER", masked)

            chunks = re.split(r"(?:\n\s*\n|(?<=[.!?])\s+(?=[A-Z0-9\"'])|(?<=\n)\s*(?=[0-9]+\.\s|[A-Z]\.\s|\([a-z0-9]+\)\s))", masked)
            for chunk in chunks:
                restored = chunk
                for regex_pat, replacement in abbr_map.items():
                    original_sample = regex_pat.replace(r"\b", "").replace("\\", "")
                    restored = restored.replace(replacement, original_sample)
                restored = restored.replace("DECIMAL_DOT_MARKER", ".")
                restored = re.sub(r"\s+", " ", restored).strip()

                if len(restored) >= 12 or re.search(r"[a-zA-Z]{3,}", restored):
                    structured_clauses.append({
                        "text": restored,
                        "section_title": sec_title
                    })

        for line in lines:
            line_str = line.strip()
            if not line_str:
                flush_buffer(current_section)
                continue

            sec_match = section_pattern.match(line_str)
            if sec_match or (line_str.isupper() and len(line_str) < 60 and not line_str.endswith(".")):
                flush_buffer(current_section)
                current_section = line_str.title() if not line_str.isupper() else line_str
                continue

            buffer.append(line_str)

        flush_buffer(current_section)

        if not structured_clauses and len(cleaned) > 0:
            structured_clauses = [{"text": cleaned, "section_title": "General Terms"}]

        return structured_clauses

    def is_negated_protection(self, clause_text: str, category_id: str) -> bool:
        """Detect if clause explicitly promises protection via negation."""
        clause_lower = clause_text.lower()
        negation_rules = {
            "data_sharing": [
                r"(?:we|company|our\s+service)\s+(?:do\s+not|will\s+not|does\s+not|never)\s+(?:sell|share|disclose|rent|monetize|transfer)",
                r"no\s+(?:third-party\s+sale|selling|sharing\s+with\s+third\s+parties)",
                r"(?:we\s+do\s+not|never)\s+disclose\s+personal\s+data"
            ],
            "data_collection": [
                r"(?:we|company)\s+(?:do\s+not|will\s+not|does\s+not|never)\s+collect\s+(?:biometric|location|sensitive|contacts|files)",
                r"do\s+not\s+collect\s+location\s+data"
            ],
            "location_tracking": [
                r"(?:we|company)\s+(?:do\s+not|will\s+not|does\s+not|never)\s+(?:collect|track)\s+(?:your\s+)?location",
                r"do\s+not\s+collect\s+location\s+data"
            ],
            "biometric_data": [
                r"(?:we|company)\s+(?:do\s+not|will\s+not|never)\s+collect\s+biometric"
            ],
            "advertising_profiling": [
                r"no\s+advertising\s+networks\s+are\s+embedded",
                r"(?:we|company)\s+(?:do\s+not|will\s+not|never)\s+(?:serve\s+targeted|profile|sell\s+ads)"
            ],
            "arbitration": [
                r"(?:we|company)\s+(?:do\s+not|will\s+not)\s+enforce\s+(?:mandatory\s+)?(?:binding\s+)?arbitration"
            ],
            "ai_data_training": [
                r"(?:we|company)\s+(?:do\s+not|will\s+not|never)\s+(?:use\s+your\s+content|train)\s+(?:to\s+train|ai|models)"
            ]
        }

        cat_negations = negation_rules.get(category_id, [])
        for pat in cat_negations:
            if re.search(pat, clause_lower):
                return True
        return False

    def analyze_clause(self, clause_info: Dict[str, Any], index: int) -> Dict[str, Any]:
        """Evaluate a single clause against the cybersecurity rule taxonomy."""
        clause_text = clause_info["text"]
        section_title = clause_info.get("section_title", "General Terms")
        clause_lower = clause_text.lower()
        matched_categories = []

        for rule in self.compiled_rules:
            if self.is_negated_protection(clause_text, rule["id"]):
                continue

            matched_flag = False
            matched_pattern_str = None

            for pattern in rule["patterns"]:
                match = pattern.search(clause_text)
                if match:
                    matched_flag = True
                    matched_pattern_str = match.group(0)
                    break

            if not matched_flag:
                for kw in rule["keywords"]:
                    if kw in clause_lower:
                        matched_flag = True
                        matched_pattern_str = kw
                        break

            if matched_flag:
                matched_categories.append({
                    "category_id": rule["id"],
                    "category_name": rule["name"],
                    "severity": rule["severity"],
                    "weight": rule["weight"],
                    "color": rule["color"],
                    "explanation": rule["explanation"],
                    "why_it_matters": rule["why_it_matters"],
                    "recommendation": rule["recommendation"],
                    "snippet": matched_pattern_str
                })

        severity_rank = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}

        # Check uncertainty heuristically (if short or complex phrasing)
        is_uncertain = False
        if matched_categories:
            matched_categories.sort(
                key=lambda x: (severity_rank.get(x["severity"], 0), x["weight"]),
                reverse=True
            )
            top_match = matched_categories[0]

            # If match was based on loose keyword or clause is under 20 chars
            if len(clause_text) < 25 or "?" in clause_text:
                is_uncertain = True

            return {
                "index": index,
                "text": clause_text,
                "section_title": section_title,
                "is_flagged": True,
                "category_id": top_match["category_id"],
                "category_name": top_match["category_name"],
                "severity": top_match["severity"],
                "weight": top_match["weight"],
                "color": top_match["color"],
                "explanation": top_match["explanation"],
                "why_it_matters": top_match["why_it_matters"],
                "recommendation": top_match["recommendation"],
                "is_uncertain": is_uncertain,
                "uncertainty_note": "⚠️ Analysis uncertain — please verify this clause in the original Terms & Conditions." if is_uncertain else "",
                "all_matched_categories": [m["category_name"] for m in matched_categories]
            }
        else:
            return {
                "index": index,
                "text": clause_text,
                "section_title": section_title,
                "is_flagged": False,
                "category_id": None,
                "category_name": "Standard Provision",
                "severity": "SAFE",
                "weight": 0,
                "color": "#10b981",
                "explanation": "No elevated risk indicators detected in this clause.",
                "why_it_matters": "Customary operational statement or standard service provision.",
                "recommendation": "Clause appears routine; inspect original text if unsure.",
                "is_uncertain": False,
                "uncertainty_note": "",
                "all_matched_categories": []
            }

    def calculate_risk_scores(self, total_clauses: int, flagged_clauses: List[Dict[str, Any]], text: str = "") -> Dict[str, Any]:
        """
        Compute reproducible 0-100 overall score and sub-risk scores.
        """
        if not flagged_clauses:
            return {
                "overall_score": 85,
                "privacy_risk": 10,
                "financial_risk": 10,
                "subscription_risk": 10,
                "data_sharing_risk": 10,
                "account_termination_risk": 10,
                "legal_dispute_risk": 10,
                "safety_score": 85
            }

        crit_count = sum(1 for c in flagged_clauses if c["severity"] == "CRITICAL")
        high_count = sum(1 for c in flagged_clauses if c["severity"] == "HIGH")
        medium_count = sum(1 for c in flagged_clauses if c["severity"] == "MEDIUM")
        low_count = sum(1 for c in flagged_clauses if c["severity"] == "LOW")

        safety_score = 85 - ((crit_count * 30) + (high_count * 20) + (medium_count * 10) + (low_count * 4))

        if crit_count >= 2 or (crit_count >= 1 and high_count >= 1):
            safety_score = min(safety_score, 18)
        elif crit_count >= 1 or high_count >= 2:
            safety_score = min(safety_score, 29)
        else:
            safety_score = max(80, min(95, safety_score))

        safety_score = max(10, min(95, safety_score))

        # Calculate Sub-Risk Metrics (0-100 exposure scale, higher = riskier)
        sub_cats = {
            "privacy": ["data_collection", "location_tracking", "biometric_data", "data_retention_deletion"],
            "financial": ["hidden_charges", "payment_billing", "refund_cancellation"],
            "subscription": ["auto_renewal"],
            "data_sharing": ["data_sharing", "advertising_profiling", "ai_data_training"],
            "account_termination": ["account_termination", "unilateral_changes"],
            "legal_dispute": ["arbitration", "jurisdiction_governing_law", "liability_limitations", "intellectual_property", "broad_permissions"]
        }

        sub_scores = {}
        for key, cat_ids in sub_cats.items():
            matching_flags = [c for c in flagged_clauses if c["category_id"] in cat_ids]
            if not matching_flags:
                sub_scores[key] = 15
            else:
                pts = sum(30 if c["severity"] == "CRITICAL" else (20 if c["severity"] == "HIGH" else 12) for c in matching_flags)
                sub_scores[key] = min(95, max(30, pts))

        return {
            "safety_score": safety_score,
            "overall_score": safety_score,
            "privacy_risk": sub_scores["privacy"],
            "financial_risk": sub_scores["financial"],
            "subscription_risk": sub_scores["subscription"],
            "data_sharing_risk": sub_scores["data_sharing"],
            "account_termination_risk": sub_scores["account_termination"],
            "legal_dispute_risk": sub_scores["legal_dispute"]
        }

    def determine_risk_level(self, safety_score: int) -> str:
        """Map 0-100 numerical safety score to formal risk tier."""
        if safety_score >= 80:
            return "SAFE"
        elif safety_score >= 60:
            return "LOW"
        elif safety_score >= 40:
            return "MEDIUM"
        elif safety_score >= 20:
            return "HIGH"
        else:
            return "CRITICAL"

    def scan(self, text: str, document_name: str = "Submitted Policy", source_url: Optional[str] = None) -> Dict[str, Any]:
        """Execute full end-to-end policy scan."""
        if not text or len(text.strip()) == 0:
            return {
                "error": "Input text is empty. Please paste or upload a policy to scan.",
                "risk_score": 100,
                "risk_level": "SAFE",
                "clauses_analyzed": 0,
                "red_flags": 0
            }

        clause_items = self.segment_clauses_with_sections(text)
        total_clauses = len(clause_items)

        analyzed_clauses = []
        flagged_clauses = []
        category_counts: Dict[str, Dict[str, Any]] = {}

        for idx, item in enumerate(clause_items):
            res = self.analyze_clause(item, idx)
            analyzed_clauses.append(res)
            if res["is_flagged"]:
                flagged_clauses.append(res)
                cat_id = res["category_id"]
                if cat_id not in category_counts:
                    category_counts[cat_id] = {
                        "category_id": cat_id,
                        "category_name": res["category_name"],
                        "severity": res["severity"],
                        "color": res["color"],
                        "count": 0,
                        "clauses": []
                    }
                category_counts[cat_id]["count"] += 1
                category_counts[cat_id]["clauses"].append(res["index"])

        scores = self.calculate_risk_scores(total_clauses, flagged_clauses, text)
        safety_score = scores["safety_score"]
        level = self.determine_risk_level(safety_score)

        severity_counts = {
            "CRITICAL": sum(1 for c in flagged_clauses if c["severity"] == "CRITICAL"),
            "HIGH": sum(1 for c in flagged_clauses if c["severity"] == "HIGH"),
            "MEDIUM": sum(1 for c in flagged_clauses if c["severity"] == "MEDIUM"),
            "LOW": sum(1 for c in flagged_clauses if c["severity"] == "LOW")
        }

        sorted_categories = sorted(
            list(category_counts.values()),
            key=lambda x: (
                x["count"],
                4 if x["severity"] == "CRITICAL" else (3 if x["severity"] == "HIGH" else (2 if x["severity"] == "MEDIUM" else 1))
            ),
            reverse=True
        )

        summary_msg = self._generate_summary(safety_score, level, severity_counts, total_clauses, sorted_categories)

        return {
            "document_name": document_name,
            "source_url": source_url or "",
            "analyzed_at": datetime.now().isoformat(),
            "word_count": len(text.split()),
            "risk_score": safety_score,
            "safety_score": safety_score,
            "risk_level": level,
            "sub_scores": scores,
            "summary": summary_msg,
            "clauses_analyzed": total_clauses,
            "red_flags": len(flagged_clauses),
            "severity_counts": severity_counts,
            "categories": sorted_categories,
            "flagged_clauses": flagged_clauses,
            "all_clauses": analyzed_clauses,
            "disclaimer": "⚠️ This tool provides informational risk analysis, not legal advice. A safety score does not determine whether Terms & Conditions are legally valid, enforceable, or appropriate for your situation."
        }

    def _generate_summary(self, score: int, level: str, severities: Dict[str, int], total_clauses: int, categories: List[Dict[str, Any]]) -> str:
        """Construct an explicit score explanation message."""
        crit = severities.get("CRITICAL", 0)
        high = severities.get("HIGH", 0)
        med = severities.get("MEDIUM", 0)
        low = severities.get("LOW", 0)

        top_cats = [c["category_name"] for c in categories[:3]]
        cats_str = ", ".join(top_cats) if top_cats else "standard terms"

        if score < 50:
            return (f"Your score is reduced mainly because these Terms allow {cats_str}. "
                    f"Analysis detected {crit + high + med + low} red flags ({crit} Critical, {high} High Risk) across {total_clauses} clauses.")
        elif score < 80:
            return (f"Your score indicates moderate risk exposure related to {cats_str}. "
                    f"Found {crit + high + med + low} flagged provisions ({high} High, {med} Medium) out of {total_clauses} total clauses.")
        else:
            return (f"No major red flags were detected in the clauses analyzed. "
                    f"Safety score is {score}/100 across {total_clauses} clauses.")
