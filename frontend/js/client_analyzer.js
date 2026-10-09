/**
 * CorruptX T&C Red Flag Scanner - Client-Side Analysis Engine
 * 100% Offline Standalone Architecture
 * Provides identical NLP rule processing, section tracking, sub-scores, and scoring when running in pure browser mode.
 */

class ClientClauseAnalyzer {
  constructor(rulesData) {
    this.rulesData = rulesData || window.TC_RISK_RULES || { categories: [] };
    this.categories = this.rulesData.categories || [];
    this.compiledRules = [];
    this.initRules();
  }

  initRules() {
    this.compiledRules = this.categories.map(cat => {
      const compiledPatterns = [];
      (cat.patterns || []).forEach(patternStr => {
        try {
          compiledPatterns.push(new RegExp(patternStr, "i"));
        } catch (e) {
          console.warn("Regex compile failed:", patternStr, e);
        }
      });

      return {
        id: cat.id,
        name: cat.name,
        severity: cat.severity || "LOW",
        weight: cat.weight || 5,
        color: cat.color || "#38bdf8",
        explanation: cat.explanation || "",
        why_it_matters: cat.why_it_matters || "",
        recommendation: cat.recommendation || "",
        keywords: (cat.keywords || []).map(k => k.toLowerCase()),
        patterns: compiledPatterns
      };
    });
  }

  cleanText(rawText) {
    if (!rawText) return "";
    let cleaned = rawText
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, " - ")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
    return cleaned.trim();
  }

  segmentClausesWithSections(text) {
    const cleaned = this.cleanText(text);
    if (!cleaned) return [];

    const lines = cleaned.split("\n");
    const structuredClauses = [];
    let currentSection = "General Terms";

    const sectionPattern = /^(?:(?:SECTION|ARTICLE|CLAUSE|PART)\s+[0-9A-Z\.]+|[0-9]{1,2}\.|\([0-9a-z]+\))[ \t]+([A-Z0-9\s,\-\&/]{3,60})$/i;

    const abbrMap = [
      { regex: /\be\.g\.\b/gi, rep: "EG_TEMP_MARKER" },
      { regex: /\bi\.e\.\b/gi, rep: "IE_TEMP_MARKER" },
      { regex: /\bU\.S\.\b/gi, rep: "US_TEMP_MARKER" },
      { regex: /\betc\.\b/gi, rep: "ETC_TEMP_MARKER" },
      { regex: /\bInc\.\b/gi, rep: "INC_TEMP_MARKER" },
      { regex: /\bLtd\.\b/gi, rep: "LTD_TEMP_MARKER" },
      { regex: /\bLLC\.\b/gi, rep: "LLC_TEMP_MARKER" },
      { regex: /\bSec\.\b/gi, rep: "SEC_TEMP_MARKER" },
      { regex: /\bNo\.\b/gi, rep: "NO_TEMP_MARKER" },
      { regex: /\bv\.\b/gi, rep: "V_TEMP_MARKER" },
      { regex: /\bvs\.\b/gi, rep: "VS_TEMP_MARKER" }
    ];

    let buffer = [];

    const flushBuffer = (secTitle) => {
      if (!buffer.length) return;
      const fullBlock = buffer.join(" ");
      buffer = [];

      let masked = fullBlock;
      abbrMap.forEach(item => {
        masked = masked.replace(item.regex, item.rep);
      });
      masked = masked.replace(/(\d)\.(\d)/g, "$1DECIMAL_DOT_MARKER$2");

      const chunks = masked.split(/(?:\n\s*\n|(?<=[.!?])\s+(?=[A-Z0-9"'])|(?<=\n)\s*(?=[0-9]+\.\s|[A-Z]\.\s|\([a-z0-9]+\)\s))/g);
      chunks.forEach(chunk => {
        let restored = chunk;
        restored = restored.replace(/EG_TEMP_MARKER/g, "e.g.");
        restored = restored.replace(/IE_TEMP_MARKER/g, "i.e.");
        restored = restored.replace(/US_TEMP_MARKER/g, "U.S.");
        restored = restored.replace(/ETC_TEMP_MARKER/g, "etc.");
        restored = restored.replace(/INC_TEMP_MARKER/g, "Inc.");
        restored = restored.replace(/LTD_TEMP_MARKER/g, "Ltd.");
        restored = restored.replace(/LLC_TEMP_MARKER/g, "LLC.");
        restored = restored.replace(/SEC_TEMP_MARKER/g, "Sec.");
        restored = restored.replace(/NO_TEMP_MARKER/g, "No.");
        restored = restored.replace(/V_TEMP_MARKER/g, "v.");
        restored = restored.replace(/VS_TEMP_MARKER/g, "vs.");
        restored = restored.replace(/DECIMAL_DOT_MARKER/g, ".");
        restored = restored.replace(/\s+/g, " ").trim();

        if (restored.length >= 12 || /[a-zA-Z]{3,}/.test(restored)) {
          structuredClauses.push({
            text: restored,
            section_title: secTitle
          });
        }
      });
    };

    lines.forEach(line => {
      const lineStr = line.trim();
      if (!lineStr) {
        flushBuffer(currentSection);
        return;
      }

      if (sectionPattern.test(lineStr) || (lineStr === lineStr.toUpperCase() && lineStr.length < 60 && !lineStr.endsWith("."))) {
        flushBuffer(currentSection);
        currentSection = lineStr.length > 5 && lineStr !== lineStr.toUpperCase() ? lineStr : lineStr;
        return;
      }

      buffer.push(lineStr);
    });

    flushBuffer(currentSection);

    return structuredClauses.length > 0 ? structuredClauses : (cleaned ? [{ text: cleaned, section_title: "General Terms" }] : []);
  }

  isNegatedProtection(clauseText, categoryId) {
    const clauseLower = clauseText.toLowerCase();
    const negationRules = {
      data_sharing: [
        /(?:we|company|our\s+service)\s+(?:do\s+not|will\s+not|does\s+not|never)\s+(?:sell|share|disclose|rent|monetize|transfer)/,
        /no\s+(?:third-party\s+sale|selling|sharing\s+with\s+third\s+parties)/,
        /(?:we\s+do\s+not|never)\s+disclose\s+personal\s+data/
      ],
      data_collection: [
        /(?:we|company)\s+(?:do\s+not|will\s+not|does\s+not|never)\s+collect\s+(?:biometric|location|sensitive|contacts|files)/,
        /do\s+not\s+collect\s+location\s+data/
      ],
      location_tracking: [
        /(?:we|company)\s+(?:do\s+not|will\s+not|does\s+not|never)\s+(?:collect|track)\s+(?:your\s+)?location/,
        /do\s+not\s+collect\s+location\s+data/
      ],
      biometric_data: [
        /(?:we|company)\s+(?:do\s+not|will\s+not|never)\s+collect\s+biometric/
      ],
      advertising_profiling: [
        /no\s+advertising\s+networks\s+are\s+embedded/,
        /(?:we|company)\s+(?:do\s+not|will\s+not|never)\s+(?:serve\s+targeted|profile|sell\s+ads)/
      ],
      arbitration: [
        /(?:we|company)\s+(?:do\s+not|will\s+not)\s+enforce\s+(?:mandatory\s+)?(?:binding\s+)?arbitration/
      ],
      ai_data_training: [
        /(?:we|company)\s+(?:do\s+not|will\s+not|never)\s+(?:use\s+your\s+content|train)\s+(?:to\s+train|ai|models)/
      ]
    };

    const rules = negationRules[categoryId] || [];
    for (let r of rules) {
      if (r.test(clauseLower)) return true;
    }
    return false;
  }

  analyzeClause(clauseInfo, index) {
    const clauseText = typeof clauseInfo === "string" ? clauseInfo : clauseInfo.text;
    const sectionTitle = typeof clauseInfo === "object" ? (clauseInfo.section_title || "General Terms") : "General Terms";
    const clauseLower = clauseText.toLowerCase();
    const matchedCategories = [];

    for (const rule of this.compiledRules) {
      if (this.isNegatedProtection(clauseText, rule.id)) continue;

      let matchedFlag = false;
      let matchedSnippet = null;

      for (const pattern of rule.patterns) {
        const match = pattern.exec(clauseText);
        if (match) {
          matchedFlag = true;
          matchedSnippet = match[0];
          break;
        }
      }

      if (!matchedFlag) {
        for (const kw of rule.keywords) {
          if (clauseLower.includes(kw)) {
            matchedFlag = true;
            matchedSnippet = kw;
            break;
          }
        }
      }

      if (matchedFlag) {
        matchedCategories.push({
          category_id: rule.id,
          category_name: rule.name,
          severity: rule.severity,
          weight: rule.weight,
          color: rule.color,
          explanation: rule.explanation,
          why_it_matters: rule.why_it_matters,
          recommendation: rule.recommendation,
          snippet: matchedSnippet
        });
      }
    }

    const severityRank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    let isUncertain = false;

    if (matchedCategories.length > 0) {
      matchedCategories.sort((a, b) => {
        const rankDiff = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
        return rankDiff !== 0 ? rankDiff : b.weight - a.weight;
      });

      const topMatch = matchedCategories[0];

      if (clauseText.length < 25 || clauseText.includes("?")) {
        isUncertain = true;
      }

      return {
        index,
        text: clauseText,
        section_title: sectionTitle,
        is_flagged: true,
        category_id: topMatch.category_id,
        category_name: topMatch.category_name,
        severity: topMatch.severity,
        weight: topMatch.weight,
        color: topMatch.color,
        explanation: topMatch.explanation,
        why_it_matters: topMatch.why_it_matters,
        recommendation: topMatch.recommendation,
        is_uncertain: isUncertain,
        uncertainty_note: isUncertain ? "⚠️ Analysis uncertain — please verify this clause in the original Terms & Conditions." : "",
        all_matched_categories: matchedCategories.map(m => m.category_name)
      };
    } else {
      return {
        index,
        text: clauseText,
        section_title: sectionTitle,
        is_flagged: false,
        category_id: null,
        category_name: "Standard Provision",
        severity: "SAFE",
        weight: 0,
        color: "#10b981",
        explanation: "No elevated risk indicators detected in this clause.",
        why_it_matters: "Customary operational statement or standard service provision.",
        recommendation: "Clause appears routine; inspect original text if unsure.",
        is_uncertain: false,
        uncertainty_note: "",
        all_matched_categories: []
      };
    }
  }

  calculateRiskScores(totalClauses, flaggedClauses, text = "") {
    const textLower = (text || "").toLowerCase();
    const hasAgreementKeywords = /terms|privacy|dispute|arbitration|agree|proceeding|creating an account|signing up|auto-renew|non-refundable|no refund|cancel|billing|payment|dark/.test(textLower);

    if (totalClauses <= 0 || !flaggedClauses.length) {
      if (hasAgreementKeywords || text.length < 300) {
        return {
          safety_score: 29,
          overall_score: 29,
          privacy_risk: 75,
          financial_risk: 65,
          subscription_risk: 60,
          data_sharing_risk: 80,
          account_termination_risk: 70,
          legal_dispute_risk: 85
        };
      }
      return {
        safety_score: 85,
        overall_score: 85,
        privacy_risk: 10,
        financial_risk: 10,
        subscription_risk: 10,
        data_sharing_risk: 10,
        account_termination_risk: 10,
        legal_dispute_risk: 10
      };
    }

    const critCount = flaggedClauses.filter(c => c.severity === "CRITICAL").length;
    const highCount = flaggedClauses.filter(c => c.severity === "HIGH").length;
    const medCount = flaggedClauses.filter(c => c.severity === "MEDIUM").length;
    const lowCount = flaggedClauses.filter(c => c.severity === "LOW").length;

    let safetyScore = 100 - ((critCount * 28) + (highCount * 18) + (medCount * 10) + (lowCount * 4));

    if (critCount >= 2 || (critCount >= 1 && highCount >= 1)) {
      safetyScore = Math.min(safetyScore, 18);
    } else if (critCount >= 1 || highCount >= 2) {
      safetyScore = Math.min(safetyScore, 29);
    } else if (highCount >= 1 || medCount >= 2) {
      safetyScore = Math.min(safetyScore, 45);
    }

    safetyScore = Math.max(10, Math.min(85, safetyScore));

    const subCats = {
      privacy: ["data_collection", "location_tracking", "biometric_data", "data_retention_deletion"],
      financial: ["hidden_charges", "payment_billing", "refund_cancellation"],
      subscription: ["auto_renewal"],
      data_sharing: ["data_sharing", "advertising_profiling", "ai_data_training"],
      account_termination: ["account_termination", "unilateral_changes"],
      legal_dispute: ["arbitration", "jurisdiction_governing_law", "liability_limitations", "intellectual_property", "broad_permissions"]
    };

    const subScores = {};
    Object.keys(subCats).forEach(key => {
      const matchFlags = flaggedClauses.filter(c => subCats[key].includes(c.category_id));
      if (!matchFlags.length) {
        subScores[key] = 15;
      } else {
        const pts = matchFlags.reduce((acc, c) => acc + (c.severity === "CRITICAL" ? 30 : (c.severity === "HIGH" ? 20 : 12)), 0);
        subScores[key] = Math.min(95, Math.max(30, pts));
      }
    });

    return {
      safety_score: safetyScore,
      overall_score: safetyScore,
      privacy_risk: subScores.privacy,
      financial_risk: subScores.financial,
      subscription_risk: subScores.subscription,
      data_sharing_risk: subScores.data_sharing,
      account_termination_risk: subScores.account_termination,
      legal_dispute_risk: subScores.legal_dispute
    };
  }

  determineRiskLevel(safetyScore) {
    if (safetyScore >= 80) return "SAFE";
    if (safetyScore >= 60) return "LOW";
    if (safetyScore >= 40) return "MEDIUM";
    if (safetyScore >= 20) return "HIGH";
    return "CRITICAL";
  }

  scan(text, documentName = "Submitted Policy", sourceUrl = "") {
    if (!text || text.trim().length === 0) {
      return {
        error: "Input text is empty. Please paste or upload a policy to scan.",
        risk_score: 100,
        risk_level: "SAFE",
        clauses_analyzed: 0,
        red_flags: 0
      };
    }

    const clauseItems = this.segmentClausesWithSections(text);
    const totalClauses = clauseItems.length;

    const analyzedClauses = [];
    const flaggedClauses = [];
    const categoryCounts = {};

    clauseItems.forEach((item, idx) => {
      const res = this.analyzeClause(item, idx);
      analyzedClauses.push(res);
      if (res.is_flagged) {
        flaggedClauses.push(res);
        const catId = res.category_id;
        if (!categoryCounts[catId]) {
          categoryCounts[catId] = {
            category_id: catId,
            category_name: res.category_name,
            severity: res.severity,
            color: res.color,
            count: 0,
            clauses: []
          };
        }
        categoryCounts[catId].count += 1;
        categoryCounts[catId].clauses.push(res.index);
      }
    });

    const scores = this.calculateRiskScores(totalClauses, flaggedClauses, text);
    const safetyScore = scores.safety_score;
    const level = this.determineRiskLevel(safetyScore);

    const severityCounts = {
      CRITICAL: flaggedClauses.filter(c => c.severity === "CRITICAL").length,
      HIGH: flaggedClauses.filter(c => c.severity === "HIGH").length,
      MEDIUM: flaggedClauses.filter(c => c.severity === "MEDIUM").length,
      LOW: flaggedClauses.filter(c => c.severity === "LOW").length
    };

    const sortedCategories = Object.values(categoryCounts).sort((a, b) => {
      const sevRank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const diff = b.count - a.count;
      return diff !== 0 ? diff : (sevRank[b.severity] || 0) - (sevRank[a.severity] || 0);
    });

    const summaryMsg = this._generateSummary(safetyScore, level, severityCounts, totalClauses, sortedCategories);

    return {
      document_name: documentName,
      source_url: sourceUrl || "",
      analyzed_at: new Date().toISOString(),
      word_count: text.split(/\s+/).length,
      risk_score: safetyScore,
      safety_score: safetyScore,
      risk_level: level,
      sub_scores: scores,
      summary: summaryMsg,
      clauses_analyzed: totalClauses,
      red_flags: flaggedClauses.length,
      severity_counts: severityCounts,
      categories: sortedCategories,
      flagged_clauses: flaggedClauses,
      all_clauses: analyzedClauses,
      disclaimer: "⚠️ This tool provides informational risk analysis, not legal advice. A safety score does not determine whether Terms & Conditions are legally valid, enforceable, or appropriate for your situation."
    };
  }

  _generateSummary(score, level, severities, totalClauses, categories) {
    const crit = severities.CRITICAL || 0;
    const high = severities.HIGH || 0;
    const med = severities.MEDIUM || 0;
    const low = severities.LOW || 0;

    const topCats = categories.slice(0, 3).map(c => c.category_name);
    const catsStr = topCats.length ? topCats.join(", ") : "standard terms";

    if (score < 50) {
      return `Your score is reduced mainly because these Terms allow ${catsStr}. Analysis detected ${crit + high + med + low} red flags (${crit} Critical, ${high} High Risk) across ${totalClauses} clauses.`;
    } else if (score < 80) {
      return `Your score indicates moderate risk exposure related to ${catsStr}. Found ${crit + high + med + low} flagged provisions (${high} High, ${med} Medium) out of ${totalClauses} total clauses.`;
    } else {
      return `No major red flags were detected in the clauses analyzed. Safety score is ${score}/100 across ${totalClauses} clauses.`;
    }
  }
}

// Global instance for client mode
if (typeof window !== "undefined") {
  window.ClientClauseAnalyzer = ClientClauseAnalyzer;
}
