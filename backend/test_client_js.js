const fs = require('fs');
const path = require('path');

// Global browser mocks
global.window = {};
global.console = console;

// Load rules_data and client_analyzer
const rulesCode = fs.readFileSync(path.join(__dirname, '../frontend/js/rules_data.js'), 'utf8');
const analyzerCode = fs.readFileSync(path.join(__dirname, '../frontend/js/client_analyzer.js'), 'utf8');

eval(rulesCode);
eval(analyzerCode);

const analyzer = new global.window.ClientClauseAnalyzer(global.window.TC_RISK_RULES);

const sampleText = `
We reserve the right to share your personal information with third parties.
We track your browsing activity and device fingerprinting across external websites.
All disputes shall be resolved exclusively through confidential binding arbitration.
You waive any right to participate in a class action.
We may modify these terms at any time without prior notice.
`;

const result = analyzer.scan(sampleText, "Node JS Offline Test");

console.log("--- CLIENT-SIDE JS ENGINE TEST RESULT ---");
console.log("Document:", result.document_name);
console.log("Risk Score:", result.risk_score, "/ 100");
console.log("Risk Level:", result.risk_level);
console.log("Clauses Analyzed:", result.clauses_analyzed);
console.log("Red Flags Detected:", result.red_flags);
console.log("Sub-Risk Scores:", JSON.stringify(result.sub_scores));

if (result.red_flags > 0 && result.sub_scores) {
  console.log("SUCCESS: 100% OFFLINE CLIENT-SIDE JS ENGINE IS OPERATIONAL & TESTED PASSED!");
} else {
  console.error("FAILURE in client JS engine test");
  process.exit(1);
}
