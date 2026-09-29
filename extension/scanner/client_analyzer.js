/**
 * T&C Red Flag Guard - Extension Local NLP Analysis Engine
 * Evaluates extracted DOM prose locally inside browser context.
 */
class ExtensionClauseAnalyzer {
  constructor(rulesData) {
    const globalRules = typeof window !== "undefined" ? window.TC_RISK_RULES : (typeof globalThis !== "undefined" ? globalThis.TC_RISK_RULES : null);
    this.rulesData = rulesData || globalRules || { categories: [] };
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

  segmentClauses(text) {
    const cleaned = this.cleanText(text);
    if (!cleaned) return [];

    const lines = cleaned.split("\n");
    const clauses = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length >= 15) {
        clauses.push(trimmed);
      }
    });

    return clauses.length > 0 ? clauses : [cleaned];
  }

  analyzeClause(clauseText, index) {
    const clauseLower = clauseText.toLowerCase();
    const matchedCategories = [];

    for (const rule of this.compiledRules) {
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

    if (matchedCategories.length > 0) {
      matchedCategories.sort((a, b) => {
        const rankDiff = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
        return rankDiff !== 0 ? rankDiff : b.weight - a.weight;
      });

      const topMatch = matchedCategories[0];
      return {
        index,
        text: clauseText,
        is_flagged: true,
        category_id: topMatch.category_id,
        category_name: topMatch.category_name,
        severity: topMatch.severity,
        weight: topMatch.weight,
        color: topMatch.color,
        explanation: topMatch.explanation,
        why_it_matters: topMatch.why_it_matters,
        recommendation: topMatch.recommendation
      };
    } else {
      return {
        index,
        text: clauseText,
        is_flagged: false,
        severity: "SAFE"
      };
    }
  }

  calculateRiskScores(totalClauses, flaggedClauses) {
    if (totalClauses <= 0 || !flaggedClauses.length) {
      return { safety_score: 98, overall_score: 98 };
    }

    const critCount = flaggedClauses.filter(c => c.severity === "CRITICAL").length;
    const highCount = flaggedClauses.filter(c => c.severity === "HIGH").length;
    const medCount = flaggedClauses.filter(c => c.severity === "MEDIUM").length;
    const lowCount = flaggedClauses.filter(c => c.severity === "LOW").length;

    const rawPenalty = (critCount * 22) + (highCount * 15) + (medCount * 8) + (lowCount * 4);
    const density = flaggedClauses.length / Math.max(totalClauses, 1);
    const densityPenalty = Math.min(20, Math.floor(density * 35));

    const totalPenalty = Math.floor((rawPenalty * 0.85) + densityPenalty);
    let safetyScore = Math.max(0, Math.min(100, 100 - totalPenalty));

    if (critCount >= 2 || (critCount >= 1 && highCount >= 2)) {
      safetyScore = Math.min(safetyScore, 38);
    } else if (critCount >= 1) {
      safetyScore = Math.min(safetyScore, 52);
    } else if (highCount >= 3) {
      safetyScore = Math.min(safetyScore, 62);
    }

    return { safety_score: safetyScore, overall_score: safetyScore };
  }

  determineRiskLevel(safetyScore) {
    if (safetyScore >= 80) return "SAFE";
    if (safetyScore >= 60) return "LOW";
    if (safetyScore >= 40) return "MEDIUM";
    if (safetyScore >= 20) return "HIGH";
    return "CRITICAL";
  }

  scan(text, documentName = "Scanned Page") {
    const clauseItems = this.segmentClauses(text);
    const totalClauses = clauseItems.length;

    const analyzedClauses = [];
    const flaggedClauses = [];

    clauseItems.forEach((item, idx) => {
      const res = this.analyzeClause(item, idx);
      analyzedClauses.append ? analyzedClauses.append(res) : analyzedClauses.push(res);
      if (res.is_flagged) {
        flaggedClauses.push(res);
      }
    });

    const scores = this.calculateRiskScores(totalClauses, flaggedClauses);
    const safetyScore = scores.safety_score;
    const level = this.determineRiskLevel(safetyScore);

    return {
      document_name: documentName,
      safety_score: safetyScore,
      risk_score: safetyScore,
      risk_level: level,
      clauses_analyzed: totalClauses,
      red_flags: flaggedClauses.length,
      flagged_clauses: flaggedClauses,
      all_clauses: analyzedClauses
    };
  }
}

if (typeof window !== "undefined") {
  window.ExtensionClauseAnalyzer = ExtensionClauseAnalyzer;
}
