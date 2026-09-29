/**
 * CorruptX T&C Risk Taxonomy - Client-Side Rule Definitions
 * Bundled for 100% true offline standalone capability (18 Categories, 5 Severities).
 */
window.TC_RISK_RULES = {
  "version": "2.0.0",
  "taxonomy_name": "CorruptX CyberSecurity T&C Risk Taxonomy (18 Categories)",
  "categories": [
    {
      "id": "data_collection",
      "name": "Privacy & Data Collection",
      "severity": "HIGH",
      "weight": 14,
      "color": "#f97316",
      "description": "Broad or invasive collection of personal data, device identifiers, or browsing activity.",
      "patterns": [
        "collect(?:s|ed|ing)?\\s+(?:personal|sensitive|user|private)\\s+(?:data|information|details)",
        "gather(?:s|ed|ing)?\\s+(?:information|data)\\s+about\\s+you",
        "access(?:es)?\\s+(?:your\\s+)?(?:contacts|device\\s+info|browser\\s+history|apps)",
        "scrape(?:s|d|ing)?\\s+(?:data|information|content)",
        "collect(?:s|ed|ing)?\\s+(?:all|any)\\s+information\\s+you\\s+(?:transmit|submit|upload|post|create)"
      ],
      "keywords": [
        "collect personal data",
        "gather information about you",
        "access device info",
        "collect sensitive data",
        "scrape user data"
      ],
      "explanation": "This clause allows the company to gather extensive personal details, device attributes, and usage data.",
      "why_it_matters": "Excessive collection expands your attack surface if the provider suffers a data breach or unauthorized leak.",
      "recommendation": "Review app permissions and limit optional profile fields or data submission."
    },
    {
      "id": "location_tracking",
      "name": "Location Tracking",
      "severity": "HIGH",
      "weight": 13,
      "color": "#f97316",
      "description": "Real-time, background, or continuous physical location tracking and GPS monitoring.",
      "patterns": [
        "collect(?:s|ed|ing)?\\s+(?:precise|exact|real-time|continuous)?\\s*(?:location|geolocation|gps)\\s+data",
        "location\\s+(?:even\\s+when\\s+the\\s+app\\s+is\\s+closed|in\\s+the\\s+background)",
        "track(?:s|ed|ing)?\\s+(?:your\\s+physical\\s+location|whereabouts|movements)",
        "derive\\s+location\\s+from\\s+(?:ip\\s+address|wi-fi\\s+access\\s+points|cell\\s+towers|bluetooth)"
      ],
      "keywords": [
        "precise geolocation data",
        "location in the background",
        "track your physical location",
        "real-time location tracking"
      ],
      "explanation": "The provider tracks or logs your real-world physical location and movement patterns.",
      "why_it_matters": "Location logs expose daily routines, residence, workplace, and sensitive movement habits.",
      "recommendation": "Set system location permissions to 'Only While Using App' or disable location access entirely."
    },
    {
      "id": "biometric_data",
      "name": "Personal & Biometric Data",
      "severity": "CRITICAL",
      "weight": 18,
      "color": "#dc2626",
      "description": "Collection, processing, or retention of facial scans, fingerprints, voiceprints, or biological identifiers.",
      "patterns": [
        "collect(?:s|ed|ing)?\\s+(?:biometric|face|facial|fingerprint|voiceprint|retina|iris|dna|health|genetic)\\s+(?:data|identifiers|templates|records)",
        "facial\\s+recognition",
        "biometric\\s+(?:verification|authentication|scan)",
        "voice\\s+recognition\\s+data"
      ],
      "keywords": [
        "biometric data",
        "facial recognition",
        "fingerprint template",
        "voiceprint records",
        "genetic information"
      ],
      "explanation": "The service collects sensitive biometric or biological identity markers.",
      "why_it_matters": "Biometric data cannot be changed like a password; compromised biometrics pose permanent identity theft risks.",
      "recommendation": "Avoid providing biometric consent unless strictly mandated and cryptographically isolated locally."
    },
    {
      "id": "data_sharing",
      "name": "Third-Party Data Sharing",
      "severity": "CRITICAL",
      "weight": 17,
      "color": "#dc2626",
      "description": "Selling, renting, sharing, or transferring personal data to third parties, advertisers, or data brokers.",
      "patterns": [
        "share(?:s|d|ing)?\\s+(?:your|user|personal|sensitive)\\s+(?:information|data|details)\\s+with\\s+third\\s+parties",
        "disclose(?:s|d|ing)?\\s+(?:your|personal|user)\\s+(?:information|data)\\s+to\\s+(?:third\\s+parties|affiliates|partners|advertisers)",
        "sell(?:s|ing)?\\s+(?:or\\s+rent(?:s|ing)?\\s+)?(?:your|personal|user)\\s+(?:data|information)",
        "transfer(?:s|red|ring)?\\s+(?:your|personal)\\s+data\\s+to\\s+(?:other\\s+entities|third\\s+parties|external)",
        "commercial\\s+partners\\s+may\\s+(?:receive|access|use)\\s+your\\s+data",
        "monetize(?:s|d|ing)?\\s+(?:user|personal)\\s+information",
        "in\\s+the\\s+event\\s+of\\s+a\\s+merger(?:,|\\s+or)\\s+(?:acquisition|sale|bankruptcy).*data.*transferred"
      ],
      "keywords": [
        "sell your data",
        "share your information with third parties",
        "disclose personal data to partners",
        "monetize user information",
        "share with advertisers"
      ],
      "explanation": "The company may sell, share, or monetize your personal details with third-party vendors or data brokers.",
      "why_it_matters": "Once shared with external partners, you lose control over how your information is stored, secured, or re-sold.",
      "recommendation": "Look for explicit privacy opt-out toggles or refrain from using the platform."
    },
    {
      "id": "advertising_profiling",
      "name": "Advertising & Profiling",
      "severity": "HIGH",
      "weight": 12,
      "color": "#f97316",
      "description": "Behavioral ad targeting, demographic profiling, session replay, or cross-site tracking pixels.",
      "patterns": [
        "personalized\\s+(?:advertisements|ads|marketing|promotions)",
        "interest-based\\s+advertising",
        "create\\s+(?:a\\s+)?profile\\s+about\\s+you",
        "target(?:ed)?\\s+advertising\\s+based\\s+on\\s+your\\s+(?:preferences|activity|browsing)",
        "track(?:s|ed|ing)?\\s+your\\s+(?:browsing|activity|behavior|online\\s+habits)",
        "fingerprint(?:ing)?\\s+(?:your\\s+device|hardware|browser)",
        "cross-site\\s+tracking",
        "beacon(?:s)?|pixel\\s+tags?|web\\s+bugs?",
        "record(?:s|ing)?\\s+(?:your\\s+screen|keystrokes|mouse\\s+movements|session\\s+replay)"
      ],
      "keywords": [
        "personalized advertisements",
        "interest-based advertising",
        "targeted advertising",
        "cross-site tracking",
        "device fingerprinting",
        "session replay"
      ],
      "explanation": "Your browsing behavior and interactions are tracked to build targeted ad profiles and behavioral segments.",
      "why_it_matters": "Ad profiling can track your online habits across multiple sites and build persistent digital dossiers.",
      "recommendation": "Use tracker-blocking browser extensions and opt out of interest-based ad profiling."
    },
    {
      "id": "auto_renewal",
      "name": "Automatic Renewal & Subscriptions",
      "severity": "HIGH",
      "weight": 14,
      "color": "#f97316",
      "description": "Automatic recurring subscription renewals, recurring charges, and automatic payment method billing.",
      "patterns": [
        "auto(?:matically)?-?renew(?:s|ed|ing)?",
        "renew(?:s|ed|ing)?\\s+automatically\\s+unless\\s+cancelled",
        "recurring\\s+(?:billing|charge|subscription|fee)",
        "charge(?:s|d)?\\s+your\\s+(?:payment\\s+method|credit\\s+card)\\s+without\\s+(?:additional|further)\\s+authorization",
        "cancel(?:lation)?\\s+at\\s+least\\s+\\d+\\s+(?:hours|days)\\s+prior\\s+to\\s+(?:the\\s+end|renewal)"
      ],
      "keywords": [
        "automatically renew",
        "recurring subscription",
        "charge without further authorization",
        "automatically billed until cancelled"
      ],
      "explanation": "Your subscription automatically renews and charges your credit card unless manually cancelled before the deadline.",
      "why_it_matters": "Users frequently get trapped in automatic recurring fees due to obscure renewal windows.",
      "recommendation": "Set calendar reminders 3 days before renewal dates or use virtual payment cards."
    },
    {
      "id": "hidden_charges",
      "name": "Hidden Charges & Cancellation Fees",
      "severity": "MEDIUM",
      "weight": 10,
      "color": "#f59e0b",
      "description": "Undisclosed fees, early termination penalties, processing surcharges, or non-refundable setup costs.",
      "patterns": [
        "early\\s+termination\\s+fee(?:s)?",
        "penalt(?:y|ies)\\s+for\\s+(?:early\\s+)?cancellation",
        "additional\\s+(?:processing|administrative|maintenance|service)\\s+fee(?:s)?",
        "subject\\s+to\\s+additional\\s+charges\\s+without\\s+prior\\s+notice",
        "non-refundable\\s+(?:setup|administrative|processing)\\s+fee"
      ],
      "keywords": [
        "early termination fee",
        "cancellation penalty",
        "additional processing fee",
        "non-refundable setup fee"
      ],
      "explanation": "The service imposes mandatory extra charges, administrative fees, or penalties upon cancellation.",
      "why_it_matters": "Hidden fees increase the true cost of service and create financial friction when attempting to cancel.",
      "recommendation": "Verify all fee schedules and cancellation terms before entering billing details."
    },
    {
      "id": "payment_billing",
      "name": "Payment & Billing Terms",
      "severity": "MEDIUM",
      "weight": 8,
      "color": "#f59e0b",
      "description": "Unilateral price changes, automatic billing updates, or immediate authorization of card charges.",
      "patterns": [
        "price(?:s)?\\s+(?:and|or)\\s+fees\\s+(?:are\\s+)?subject\\s+to\\s+change\\s+at\\s+any\\s+time",
        "authorize\\s+us\\s+to\\s+charge\\s+(?:any\\s+)?updated\\s+payment\\s+method",
        "billing\\s+errors\\s+must\\s+be\\s+reported\\s+within\\s+\\d+\\s+days",
        "late\\s+payment\\s+interest|interest\\s+on\\s+overdue\\s+balances"
      ],
      "keywords": [
        "prices subject to change",
        "authorize charge to payment method",
        "billing errors reported within",
        "late payment fee"
      ],
      "explanation": "The provider reserves rights to modify pricing, update stored cards, or apply interest to unpaid amounts.",
      "why_it_matters": "Unilateral rate changes can quietly increase monthly expenses without requiring explicit re-confirmation.",
      "recommendation": "Review monthly invoice emails and monitor bank statements for unexpected charge increases."
    },
    {
      "id": "account_termination",
      "name": "Account Suspension & Termination",
      "severity": "HIGH",
      "weight": 13,
      "color": "#f97316",
      "description": "Unilateral account bans, immediate service suspension, or forfeiture of data/content without notice.",
      "patterns": [
        "terminate\\s+(?:or\\s+suspend\\s+)?(?:your\\s+account|access)\\s+at\\s+(?:any\\s+time|our\\s+sole\\s+discretion)",
        "(?:terminate|suspend)\\s+without\\s+(?:prior\\s+)?notice\\s+(?:or\\s+liability)?",
        "for\\s+any\\s+reason\\s+or\\s+(?:for\\s+)?no\\s+reason",
        "forfeit(?:ure)?\\s+(?:of\\s+)?(?:all|any)\\s+(?:content|credits|funds|data)\\s+upon\\s+termination",
        "no\\s+obligation\\s+to\\s+refund\\s+(?:unused\\s+)?fees"
      ],
      "keywords": [
        "terminate at our sole discretion",
        "suspend without notice",
        "for any reason or no reason",
        "forfeit content upon termination"
      ],
      "explanation": "The provider can ban your account, block access, or wipe stored content without advance warning or explanation.",
      "why_it_matters": "Sudden termination can cause unrecoverable loss of files, purchases, business records, or contacts.",
      "recommendation": "Keep independent local backups of all important files, data, and receipts."
    },
    {
      "id": "arbitration",
      "name": "Arbitration & Dispute Resolution",
      "severity": "CRITICAL",
      "weight": 16,
      "color": "#dc2626",
      "description": "Mandatory binding arbitration, jury trial waivers, and class action lawsuit bans.",
      "patterns": [
        "binding\\s+arbitration",
        "waive(?:r|s|d)?\\s+(?:any\\s+right\\s+to\\s+)?(?:a\\s+)?jury\\s+trial",
        "waive(?:r|s|d)?\\s+(?:any\\s+right\\s+to\\s+participate\\s+in\\s+a\\s+)?class\\s+action",
        "class\\s+action\\s+waiver",
        "disputes?\\s+shall\\s+be\\s+resolved\\s+(?:exclusively\\s+)?(?:by|through)\\s+(?:confidential|individual|binding)?\\s*arbitration",
        "no\\s+class\\s+or\\s+representative\\s+actions?",
        "agree\\s+not\\s+to\\s+sue\\s+in\\s+court"
      ],
      "keywords": [
        "binding arbitration",
        "class action waiver",
        "waive jury trial",
        "resolve disputes through arbitration",
        "agree not to sue in court"
      ],
      "explanation": "You surrender your right to sue the company in court or participate in class action lawsuits.",
      "why_it_matters": "Binding arbitration locks disputes into private proceedings that heavily favor corporations over individual consumers.",
      "recommendation": "Check if the policy permits submitting an arbitration opt-out notice within 30 days."
    },
    {
      "id": "jurisdiction_governing_law",
      "name": "Jurisdiction & Governing Law",
      "severity": "MEDIUM",
      "weight": 7,
      "color": "#f59e0b",
      "description": "Forcing legal disputes to be litigated in specific distant foreign courts or out-of-state jurisdictions.",
      "patterns": [
        "governed\\s+by\\s+the\\s+laws\\s+of\\s+[A-Za-z\\s]+",
        "exclusive\\s+jurisdiction\\s+of\\s+the\\s+courts\\s+of",
        "submit\\s+to\\s+the\\s+personal\\s+jurisdiction\\s+of",
        "venue\\s+for\\s+any\\s+dispute\\s+shall\\s+be"
      ],
      "keywords": [
        "governed by the laws of",
        "exclusive jurisdiction of courts in",
        "personal jurisdiction",
        "venue for any dispute"
      ],
      "explanation": "Legal disputes must be filed under the specific laws and courts of a pre-selected state or country.",
      "why_it_matters": "Filing claims in distant jurisdictions adds extreme travel and legal expense if litigation becomes necessary.",
      "recommendation": "Be aware of where the corporate entity is registered and which courts govern the agreement."
    },
    {
      "id": "unilateral_changes",
      "name": "Changes to Terms Without Notice",
      "severity": "CRITICAL",
      "weight": 16,
      "color": "#dc2626",
      "description": "Reserving rights to modify agreement terms or privacy policies at any time without notifying users.",
      "patterns": [
        "reserve\\s+the\\s+right\\s+to\\s+(?:modify|change|alter|update)\\s+(?:these\\s+terms|this\\s+agreement|policy)\\s+at\\s+(?:any\\s+time|our\\s+sole\\s+discretion)",
        "(?:modify|change|update)\\s+without\\s+(?:prior\\s+)?notice",
        "continued\\s+use\\s+(?:of\\s+the\\s+service\\s+)?(?:constitutes|shall\\s+constitute|signifies)\\s+(?:your\\s+)?acceptance",
        "without\\s+obligation\\s+to\\s+notify\\s+you",
        "effective\\s+immediately\\s+upon\\s+posting"
      ],
      "keywords": [
        "modify without prior notice",
        "at our sole discretion without notice",
        "continued use constitutes acceptance",
        "change these terms at any time"
      ],
      "explanation": "The company can alter legal terms, fees, or data rules at any time, treating continued app use as automatic consent.",
      "why_it_matters": "Terms can become significantly more restrictive or costly over time without you receiving explicit notice.",
      "recommendation": "Bookmark the terms URL or use web monitoring tools to detect silent policy revisions."
    },
    {
      "id": "refund_cancellation",
      "name": "Refund & Cancellation Policies",
      "severity": "HIGH",
      "weight": 11,
      "color": "#f97316",
      "description": "Strict 'no-refund' policies, forfeiture of pre-paid balances, or complex multi-step cancellation flows.",
      "patterns": [
        "all\\s+(?:sales|payments|fees)\\s+are\\s+final\\s+and\\s+non-refundable",
        "no\\s+refunds\\s+or\\s+credits\\s+will\\s+be\\s+provided",
        "cancellation\\s+(?:must\\s+be\\s+made|only\\s+accepted)\\s+via\\s+(?:certified\\s+mail|phone|written\\s+notice)",
        "must\\s+provide\\s+(?:at\\s+least\\s+)?\\d+\\s+days\\s+written\\s+notice\\s+to\\s+cancel"
      ],
      "keywords": [
        "non-refundable",
        "no refunds or credits",
        "all sales are final",
        "cancel only by phone or certified mail"
      ],
      "explanation": "The provider enforces strict no-refund terms and imposes cumbersome manual procedures for cancellation.",
      "why_it_matters": "If you are unhappy with the service or charge, you cannot recover prepaid fees.",
      "recommendation": "Start with monthly billing instead of annual commitments to test service quality first."
    },
    {
      "id": "liability_limitations",
      "name": "Liability Limitations & Disclaimers",
      "severity": "HIGH",
      "weight": 12,
      "color": "#f97316",
      "description": "Broad liability disclaimers for security breaches, software bugs, data loss, or service downtime.",
      "patterns": [
        "provided\\s+[\"']?as\\s+is[\"']?\\s+and\\s+[\"']?as\\s+available[\"']?",
        "disclaim(?:s)?\\s+(?:all|any)\\s+warranties",
        "(?:under\\s+no\\s+circumstances\\s+shall|in\\s+no\\s+event\\s+shall)\\s+(?:the\\s+company|we|us|our\\s+affiliates)\\s+be\\s+liable\\s+for\\s+(?:any\\s+)?(?:direct|indirect|incidental|consequential|punitive)\\s+damages",
        "limit(?:ation)?\\s+of\\s+liability\\s+shall\\s+not\\s+exceed\\s+(?:the\\s+amount\\s+paid|\\$\\d+|one\\s+hundred\\s+dollars)",
        "not\\s+liable\\s+for\\s+(?:any\\s+)?(?:data\\s+loss|security\\s+breaches|unauthorized\\s+access)"
      ],
      "keywords": [
        "provided as is",
        "in no event shall we be liable",
        "disclaim all warranties",
        "not liable for data loss or breach",
        "limitation of liability"
      ],
      "explanation": "The service is offered 'as-is' and completely disclaims legal financial liability for data loss or software failures.",
      "why_it_matters": "If a data breach or system bug causes financial or reputational damage, the company cannot be held liable.",
      "recommendation": "Maintain independent offline backups of critical data assets."
    },
    {
      "id": "data_retention_deletion",
      "name": "Data Retention & Erasure Restrictions",
      "severity": "MEDIUM",
      "weight": 9,
      "color": "#f59e0b",
      "description": "Retaining personal data indefinitely on servers even after account deletion requests.",
      "patterns": [
        "retain(?:s|ed|ing)?\\s+(?:your\\s+)?(?:data|information|content)\\s+(?:indefinitely|for\\s+an\\s+unlimited\\s+period|as\\s+long\\s+as\\s+we\\s+deem\\s+necessary)",
        "may\\s+retain\\s+(?:archived|backup|residual)\\s+copies\\s+even\\s+after\\s+(?:you\\s+delete|account\\s+closure)",
        "no\\s+obligation\\s+to\\s+delete\\s+(?:your\\s+)?(?:information|data)",
        "retain\\s+and\\s+use\\s+your\\s+information\\s+to\\s+comply\\s+with\\s+legal\\s+obligations"
      ],
      "keywords": [
        "retain data indefinitely",
        "retain backup copies even after deletion",
        "as long as we deem necessary",
        "no obligation to delete"
      ],
      "explanation": "Account deletion does not guarantee complete erasure of your personal data from company archives.",
      "why_it_matters": "Retained residual data remains vulnerable to future leaks, court subpoenas, or data broker sales.",
      "recommendation": "Submit explicit statutory data erasure requests (GDPR/CCPA) if supported."
    },
    {
      "id": "intellectual_property",
      "name": "Intellectual Property Rights",
      "severity": "HIGH",
      "weight": 13,
      "color": "#f97316",
      "description": "Surrendering copyright, granting broad perpetual global licenses, or assigning work ownership to vendor.",
      "patterns": [
        "grant(?:s)?\\s+(?:us\\s+)?(?:a\\s+)?(?:worldwide|perpetual|irrevocable|royalty-free|unrestricted)\\s+(?:license|right)\\s+to\\s+(?:use|reproduce|modify|publish|distribute)",
        "waive(?:s|d)?\\s+(?:all\\s+)?moral\\s+rights",
        "you\\s+assign\\s+(?:all\\s+)?(?:ownership|intellectual\\s+property|rights)\\s+to\\s+us",
        "we\\s+own\\s+all\\s+(?:feedback|submissions|content|ideas)\\s+provided\\s+by\\s+you",
        "right\\s+to\\s+sublicense\\s+and\\s+commercialize\\s+your\\s+content"
      ],
      "keywords": [
        "perpetual irrevocable royalty-free license",
        "worldwide license to use and modify",
        "waive moral rights",
        "assign all intellectual property",
        "sublicense and commercialize your content"
      ],
      "explanation": "You grant the vendor perpetual, worldwide rights to modify, distribute, or commercialize your uploaded content.",
      "why_it_matters": "You may lose exclusive ownership or commercial control over your original creative media, files, or ideas.",
      "recommendation": "Avoid uploading proprietary, copyrighted, or sensitive creative work without checking IP terms."
    },
    {
      "id": "ai_data_training",
      "name": "AI & Model Training Clauses",
      "severity": "CRITICAL",
      "weight": 17,
      "color": "#dc2626",
      "description": "Using your private documents, code, images, or communications to train machine learning and AI models.",
      "patterns": [
        "train(?:ing)?\\s+(?:our\\s+)?(?:ai|artificial\\s+intelligence|machine\\s+learning|llm|models)",
        "use\\s+(?:your\\s+)?(?:content|data|text|files|images|inputs)\\s+to\\s+(?:improve|develop|train)\\s+(?:our\\s+)?services",
        "ai\\s+model\\s+training",
        "generative\\s+ai\\s+training",
        "automated\\s+analysis\\s+to\\s+train\\s+algorithms"
      ],
      "keywords": [
        "train AI models",
        "machine learning model training",
        "use content to develop AI",
        "train algorithms",
        "generative AI training"
      ],
      "explanation": "Your submitted text, files, images, or data are ingested to train the provider's AI and machine learning models.",
      "why_it_matters": "Confidential documents or proprietary code could end up embedded in public LLM responses or training sets.",
      "recommendation": "Check if an AI data opt-out switch is available before uploading confidential or proprietary files."
    },
    {
      "id": "broad_permissions",
      "name": "Unusually Broad Permissions",
      "severity": "HIGH",
      "weight": 12,
      "color": "#f97316",
      "description": "One-sided rights, broad blanket waivers, or unconstrained administrative power over user accounts.",
      "patterns": [
        "reserve\\s+the\\s+right\\s+to\\s+take\\s+any\\s+action",
        "at\\s+our\\s+sole\\s+and\\s+absolute\\s+discretion",
        "without\\s+limitation|without\\s+restriction",
        "full\\s+power\\s+and\\s+authority\\s+to",
        "blanket\\s+waiver"
      ],
      "keywords": [
        "sole and absolute discretion",
        "reserve right to take any action",
        "without limitation",
        "blanket waiver"
      ],
      "explanation": "The provider grants itself blanket administrative authority to take any action without user recourse.",
      "why_it_matters": "One-sided permissions give the vendor total discretion over how rules are interpreted and enforced.",
      "recommendation": "Exercise caution when agreeing to agreements with unconstrained vendor authority."
    }
  ]
};
