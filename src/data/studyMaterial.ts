export interface ArticleSection {
  heading: string;
  body: string;
}

export interface StudyTopic {
  id: string;
  label: string;
  tagline: string;
  intro: string;
  sections: ArticleSection[];
  keyPoints: string[];
  relatedTopicIds: string[];
}

export interface StudyChapter {
  id: string;
  number: number;
  label: string;
  description: string;
  topics: StudyTopic[];
}

export const STUDY_CHAPTERS: StudyChapter[] = [
  // ── Chapter 1 ─────────────────────────────────────────────────────────────
  {
    id: 'threat-landscape',
    number: 1,
    label: 'The Logistics Cyber Threat Landscape',
    description: 'Why freight and logistics is a top-ten ransomware target and what the attack surface looks like.',
    topics: [
      {
        id: 'logistics-threat-overview',
        label: 'Why Logistics Is a High-Value Target',
        tagline: 'Three compounding factors that make freight operations unusually exposed.',
        intro: 'The transportation sector has become one of the top ten industries affected by ransomware, with supply-chain-related attacks surging dramatically since 2021. Logistics organisations are no longer merely transporters of goods — they are custodians of IoT sensor feeds, telematics data, customs documentation, and proprietary intelligence. That combination of operational criticality and data richness makes them a high-reward target.',
        sections: [
          {
            heading: 'Vast and fragmented attack surfaces',
            body: 'Logistics depends on digital infrastructure that connects manufacturers, customs brokers, freight forwarders, ocean carriers, and domestic trucking companies — entities with vastly different IT maturity levels. A breach in a minor software supplier can trigger a systemic collapse downstream. The 2020 SolarWinds (SUNBURST) compromise demonstrated exactly this: attackers compromised a single IT monitoring platform and gained undetected access to thousands of downstream targets including logistics and critical infrastructure operators.',
          },
          {
            heading: 'Time pressure and urgency as attack vectors',
            body: 'Logistics operates on strict Service Level Agreements and Just-In-Time manufacturing schedules. Cybercriminals know that transport companies cannot afford downtime — making them highly likely to pay ransoms quickly. The NotPetya attack in 2017 paralysed A.P. Møller-Maersk operations globally, costing hundreds of millions of dollars and demonstrating that a single infection propagating through an interconnected network can halt global shipping.',
          },
          {
            heading: 'High-value transactions and third-party trust',
            body: 'Freight brokers and carriers frequently exchange high-value wire transfers and ACH payments. The trust required to operate load boards and third-party logistics (3PL) networks provides fertile ground for social engineering, impersonation, and payment diversion. Attackers do not need to defeat technology — they need to defeat the workflow, exploiting the routine expectation that payment change requests arrive by email.',
          },
          {
            heading: 'The IT/OT convergence problem',
            body: 'The integration of Information Technology (IT) with Operational Technology (OT) has blurred the lines between digital breaches and physical disruptions. A compromise in a cloud-based Transportation Management System (TMS) or a vulnerability in an Automated Guided Vehicle (AGV) network can halt port operations, delay global shipping, and trigger cascading failures. The attack surface is no longer limited to servers and workstations — it extends to trucks, warehouse robots, temperature sensors, and terminal control systems.',
          },
        ],
        keyPoints: [
          'Logistics is a top-ten ransomware target; attacks surged 431% since 2021 in the sector',
          'Fragmented supplier ecosystems mean a minor vendor breach can cascade to major operators',
          'Time pressure (SLAs, JIT schedules) makes operators likely to pay ransom rather than absorb downtime',
          'IT/OT convergence: a TMS breach can trigger physical operational disruption',
        ],
        relatedTopicIds: ['attack-surfaces-ecosystem', 'apt-nation-state-actors', 'standards-frameworks'],
      },
      {
        id: 'attack-surfaces-ecosystem',
        label: 'Attack Surfaces Across the Logistics Ecosystem',
        tagline: 'Where freight operations are exposed — from load boards to warehouse robotics.',
        intro: 'Each layer of the logistics ecosystem presents a distinct attack surface. Understanding which systems are targeted, and why, is the prerequisite for prioritising defences. The attack surfaces are not uniform: a freight broker faces different threats than a warehouse manager or a fleet dispatcher.',
        sections: [
          {
            heading: 'Freight brokerage and dispatch',
            body: 'Brokerage operations are targeted via load boards, email spoofing, rate confirmation interception, and carrier identity theft. Attackers create fraudulent domains by adding "LLC" or "INC" to legitimate company names (e.g., xyzshipping-inc.com instead of xyzshipping.com). Rate Confirmation interception is a particularly damaging pattern: attackers who compromise a carrier\'s inbox intercept rate confirmation emails, delete them before the real carrier sees them, and impersonate the carrier at the pickup facility to steal the load.',
          },
          {
            heading: 'Fleet and telematics',
            body: 'Fleet operations are vulnerable to Telematics Control Unit (TCU) compromise, Electronic Logging Device (ELD) manipulation, GPS spoofing, and CAN bus exploits. ELDs are connected to vehicle engines and transmit compliance data — making them both a regulatory requirement and a networked attack vector. GPS spoofing can redirect vehicles or falsify location data, which is particularly damaging for high-value or time-sensitive cargo.',
          },
          {
            heading: 'Warehouse and distribution operations',
            body: 'Automated Guided Vehicles (AGVs) and Autonomous Mobile Robots (AMRs) introduce OT risk where a cyber compromise can cause physical harm. Legacy Industrial Control System protocols (Modbus TCP, Profinet) used in conveyor and sortation systems lack built-in authentication and can be manipulated remotely if accessible on the network. IoT temperature sensors in refrigerated warehouses can be falsified, compromising cold-chain compliance without visible system alerts.',
          },
          {
            heading: 'Back office and finance',
            body: 'The back office is the primary target for Business Email Compromise, invoice fraud, and ransomware payload delivery via phishing. Accounts payable staff are targeted because they have both the authority and the process pressure to execute payments quickly. Finance systems connected to TMS platforms create a direct path from an email compromise to a fraudulent wire transfer — the most common and most costly outcome.',
          },
        ],
        keyPoints: [
          'Brokerage: load boards, rate confirmation interception, domain spoofing',
          'Fleet: ELD/telematics exploitation, GPS spoofing, CAN bus attacks',
          'Warehouse: AGV/ICS compromise, legacy protocol vulnerabilities (Modbus, Profinet)',
          'Finance/back office: BEC, invoice fraud, ransomware delivered via phishing',
        ],
        relatedTopicIds: ['social-engineering', 'bec-payment-fraud', 'industrial-protocols-ics'],
      },
    ],
  },

  // ── Chapter 2 ─────────────────────────────────────────────────────────────
  {
    id: 'adversarial-profiling',
    number: 2,
    label: 'Adversarial Profiling and Case Studies',
    description: 'Who attacks logistics, how they operate, and what the historical record shows.',
    topics: [
      {
        id: 'apt-nation-state-actors',
        label: 'Advanced Persistent Threats and Nation-State Actors',
        tagline: 'State-sponsored groups that target ports, shipping, and supply chains for espionage and disruption.',
        intro: 'Advanced Persistent Threat (APT) groups operate with nation-state backing, utilising highly sophisticated techniques to maintain long-term, undetected persistence within target networks. Their objectives in logistics align with geopolitical strategies — intelligence on strategic shipments, military supply movements, and economic disruption of rival nations.',
        sections: [
          {
            heading: 'China-linked actors: Mustang Panda, Volt Typhoon, APT41',
            body: 'Chinese APT groups represent the most documented threat to cargo shipping operations. Mustang Panda uses USB-based initial infections on cargo ships, while APT41 deploys the DUSTTRAP framework for forensic evasion and utilises advanced malware including ShadowPad and VELVETSHELL. Volt Typhoon focuses on critical infrastructure and logistics systems with long-dwell reconnaissance. These groups target cargo shipping companies across Europe, Asia, and global transit hubs.',
          },
          {
            heading: 'Russia-linked actors: APT28 (Fancy Bear)',
            body: 'APT28 targets NATO maritime supply chains and Western transportation companies supporting adversarial geopolitical factions. The group uses spear-phishing and advanced malware for intelligence gathering and disruption, with a focus on organisations that support military logistics and defence supply chains. The NotPetya attack, while attributed to Russia\'s Sandworm group, demonstrated the scale of damage that Russian-linked actors can inflict on global shipping — Maersk lost an estimated $300 million.',
          },
          {
            heading: 'Iran and South Asia threat actors',
            body: 'Iran\'s Charming Kitten (APT35) and Yellow Lideric focus on Mediterranean maritime shipping and transportation logistics using sophisticated supply chain compromises. South Asia actors include SideWinder (targeting maritime facilities across the Middle East and Asia), DONOT/Origami Elephant (targeting defense manufacturing and maritime industries), and Salt Typhoon/Estries, which uses novel backdoors like GHOSTSPIDER malware against telecommunications and logistics infrastructure in Southeast Asia.',
          },
          {
            heading: 'What nation-state activity means for logistics operators',
            body: 'Nation-state actors are not primarily interested in ransom payments — they want data and disruption. Shipment contents, military supply movement intelligence, proprietary routing data, and access to downstream customers are the targets. The implication for logistics operators is that the threat is not only financially motivated: a carrier or broker handling government or defence-adjacent cargo may be targeted for intelligence value regardless of its security posture.',
          },
        ],
        keyPoints: [
          'China (Mustang Panda/Volt Typhoon): USB infections, DUSTTRAP framework, ShadowPad malware',
          'Russia (APT28): NATO maritime supply chain targeting, spear-phishing, espionage',
          'Iran (Charming Kitten): Mediterranean shipping and logistics supply chain compromises',
          'Nation-state targets: shipment intelligence, military logistics data, downstream customer access',
        ],
        relatedTopicIds: ['ransomware-syndicates', 'logistics-threat-overview', 'incident-response'],
      },
      {
        id: 'ransomware-syndicates',
        label: 'Ransomware Syndicates and the Extortion Evolution',
        tagline: 'From encryption-and-demand to data exfiltration-only — how ransomware tactics have shifted.',
        intro: 'Financially motivated cybercriminal syndicates have progressively refined their extortion methodologies. The most significant evolution is the shift from "encrypt and demand" to "leak-only" models that bypass traditional disaster recovery. Understanding these models — and the historical incidents that established them — is essential for understanding why backup strategies alone are insufficient.',
        sections: [
          {
            heading: 'The traditional ransomware model and its limits',
            body: 'Historically, ransomware operators encrypted a victim\'s network and demanded payment for the decryption key. This model caused massive operational downtime — the Toll Group incident, the Expeditors International attack, and the 2020 CMA CGM ransomware attack that compromised online booking systems all demonstrate the pattern. However, the existence of offline backups reduced the leverage that encryption alone provided, forcing ransomware operators to evolve.',
          },
          {
            heading: 'The "leak-only" extortion model',
            body: 'The entity known as the "Coinbase Cartel" exemplifies the strategic shift to data exfiltration without encryption. This group targets transportation and logistics networks exclusively to exfiltrate proprietary routing data, customer manifests, insider partnership programs, and financial records — then threatens to release this data on the dark web unless a ransom is paid. This model bypasses backup strategies entirely: the threat is data exposure, not operational downtime. A major Japanese IT company, NTT Data, was listed on the cartel\'s darknet leak site.',
          },
          {
            heading: 'Double extortion and the backup trap',
            body: 'The most common modern ransomware model is "double extortion" — encrypt the network AND exfiltrate data. Victims who pay for decryption cannot assume their data is safe from public release. Paying a ransom funds criminal operations, guarantees nothing, and may create additional legal liability. The only reliable defence is prevention: immutable, air-gapped backups address the encryption threat, while the data exfiltration threat requires network segmentation and early anomaly detection to prevent the exfiltration from completing.',
          },
          {
            heading: 'Historical case studies in logistics',
            body: 'Key logistics incidents provide the pattern: the 2017 NotPetya attack on Maersk (which spread globally via a Ukrainian accounting software update) cost approximately $300M; the 2020 Radiant Logistics attack isolated Canadian operations; and the series of port attacks on Long Beach, Barcelona, San Diego, and Vancouver beginning in 2018 demonstrated sustained targeting of major transit hubs. The Maritime Cyber Attack Database (MCAD) tracks over 160 cyber incidents in the maritime sector alone since 2001.',
          },
        ],
        keyPoints: [
          '"Coinbase Cartel" uses leak-only extortion against logistics — backups do not help',
          'Double extortion: encrypt + exfiltrate = paying ransom does not prevent data release',
          'NotPetya (2017): ~$300M to Maersk; spread via software supply chain update',
          'MCAD documents 160+ maritime cyber incidents since 2001 — pattern is escalating',
        ],
        relatedTopicIds: ['ransomware', 'incident-response', 'standards-frameworks'],
      },
    ],
  },

  // ── Chapter 3 ─────────────────────────────────────────────────────────────
  {
    id: 'social-engineering-fraud',
    number: 3,
    label: 'Social Engineering and Freight Fraud',
    description: 'Impersonation, load board abuse, double brokering, and the human layer of logistics security.',
    topics: [
      {
        id: 'social-engineering',
        label: 'Social Engineering and Impersonation',
        tagline: 'How attackers exploit urgency, authority, and routine to manipulate logistics workflows.',
        intro: 'Social engineering is the mechanism behind the majority of logistics cyber incidents. It works because logistics operations are high-pressure: decisions must be made quickly, last-minute changes are normal, and many parties expect instructions from people they may never have spoken to before. CISA, NSA, FBI and MS-ISAC define social engineering as attempts to trick someone into revealing information or taking an action that can be used to compromise systems or networks.',
        sections: [
          {
            heading: 'Impersonation patterns specific to logistics',
            body: 'Three categories of impersonation matter most. Identity impersonation — posing as a carrier, broker, vendor, terminal operator, or dispatcher — is used to issue fraudulent pickup instructions or divert loads. Shipping document impersonation involves forging or altering bills of lading, pickup access codes, or proof-of-delivery documents to redirect physical goods. Account impersonation uses a compromised email account or portal login to issue fraudulent instructions that appear to originate from a legitimate insider.',
          },
          {
            heading: 'Rate confirmation interception',
            body: 'A particularly damaging freight-specific pattern: brokers email rate confirmations as PDF attachments. Attackers who have compromised a carrier\'s inbox intercept these emails, delete them so the real carrier never receives them, and impersonate the carrier at the pickup facility to physically steal the load. This is cyber-enabled cargo theft — a digital compromise leading directly to physical theft. Mitigation: route rate confirmations through secure portals requiring identity verification, not email attachments.',
          },
          {
            heading: 'Pre-breach social engineering signals',
            body: 'Social engineering attempts often follow patterns before a breach: unsolicited urgent load requests that push brokers to skip vetting ("this load needs to move right now"), invoices or rate cons sent as .zip or .html files instead of standard PDFs, and email domains that use free providers (Gmail/Outlook) instead of business domains. These are not anomalies to investigate after the fact — they are decision points that warrant immediate process escalation.',
          },
          {
            heading: 'Designing out single-person decision points',
            body: 'CISA\'s phishing guidance emphasises that controls should be mapped to how phishing is actually leveraged — not just "train employees better." The practical implication is to design workflows so that high-risk actions (changing banking details, releasing a load to an unverified carrier, issuing pickup codes) require a second independent verification step. A deceived employee who follows procedure should still fail to complete a fraudulent transaction.',
          },
        ],
        keyPoints: [
          'Rate confirmation interception: email compromise + fake pickup = physical cargo theft',
          'Three impersonation types: identity, shipping documents, account/email',
          'Pre-breach signals: urgent load requests, .zip/.html attachments, Gmail domains',
          'Design out single-decision-point workflows for high-risk actions',
        ],
        relatedTopicIds: ['double-brokering-cargo-theft', 'bec-payment-fraud', 'email-authentication'],
      },
      {
        id: 'double-brokering-cargo-theft',
        label: 'Double Brokering, Load Board Fraud, and Cargo Theft',
        tagline: 'When digital identity fraud results in physical theft — the mechanics and red flags.',
        intro: 'Logistics is unusual in cybersecurity because digital fraud can translate directly into physical theft. The FBI describes strategic cargo theft as using fraud — identity theft, account takeovers, and fraudulent carrier identities — to trick shippers, brokers, and carriers into handing loads to thieves. Double brokering is the most prevalent mechanism.',
        sections: [
          {
            heading: 'How double brokering works',
            body: 'Double brokering occurs when a broker or carrier reassigns a freight load without the knowledge and consent of the shipper or original broker. The "phantom carrier" pattern: a fraudster with a fake or stolen MC number accepts a load, re-brokers it to a legitimate carrier for a lower rate, pockets the payment from the original broker, and the actual carrier who delivers the freight is never paid. The fraudster monitors FMCSA SAFER to identify dormant or recently revoked carrier authorities and exploits compromised DOT PIN numbers to alter official carrier records.',
          },
          {
            heading: 'Cyber cargo theft — from phishing to paperwork',
            body: 'The FBI specifically documents "cyber cargo theft" as phishing emails used to install malware, gain system access, retrieve sensitive shipment data (pickup codes, BoL details, delivery addresses), and print legitimate-looking paperwork for fictitious pickups. The intrusion chain ends with a truck leaving a facility with goods. This is not a separate threat category from cybersecurity — it is the same attack chain with a physical payload at the end.',
          },
          {
            heading: 'Red flags for dispatchers and brokers',
            body: 'Critical red flags for double brokering and carrier impersonation: MC number mismatches or rapid changes to MC authority status in FMCSA SAFER; email addresses using free providers (Gmail) instead of business domains; phone numbers that do not match official FMCSA registration records; refusal to provide live load tracking (MacroPoint or equivalent); drivers who appear at pickup but are not on the carrier\'s authorised list; documentation with varying company names or inconsistent addresses; and artificial urgency used to rush past vetting procedures.',
          },
          {
            heading: 'FMCSA SAFER and verification controls',
            body: 'The FMCSA SAFER registry is a free, authoritative public resource for carrier and broker identity verification. Every carrier tendering process should include a SAFER check against the MC number and USDOT number provided. Certificate of Insurance should be verified directly with the insurance provider — not only from a provided PDF, which can be forged. The TIA (Transportation Intermediaries Association) publishes carrier selection procedures that map these verification steps to the freight onboarding workflow.',
          },
        ],
        keyPoints: [
          'Double brokering: stolen MC/DOT identity → phantom carrier → unpaid legitimate carrier',
          'Cyber cargo theft: phishing → system access → fake pickup documents → physical theft',
          'SAFER verification is mandatory — check MC and USDOT numbers directly, not from provided documents',
          'Red flags: Gmail addresses, urgent load requests, carrier who refuses tracking, identity inconsistencies',
        ],
        relatedTopicIds: ['social-engineering', 'identity-credential-security', 'regulations-sector-guidance'],
      },
      {
        id: 'phishing-recognition-field-guide',
        label: 'Phishing Recognition: Field Guide',
        tagline: 'What every logistics professional needs to spot before they click.',
        intro: 'Phishing is the entry point for the majority of freight fraud, ransomware deployments, and BEC attacks against logistics organisations. Unlike technical exploits, phishing succeeds by targeting human behaviour — urgency, authority, familiarity, and fear. This field guide provides a practical recognition framework built from real attack patterns observed across freight brokerage, fleet operations, and warehouse environments.',
        sections: [
          {
            heading: 'The anatomy of a freight-targeted phishing email',
            body: 'Logistics phishing emails are crafted to look like operational messages: rate confirmation requests, load board notifications, FMCSA compliance alerts, carrier verification requests, or urgent payment update notices. Key structural elements: (1) Display name spoofing — the "From" name shows a trusted company (e.g., "DAT Load Board") but the actual sending address is unrelated (e.g., noreply@datsystem-alerts.net). (2) Domain lookalike — attackers register near-miss domains (dat-board.com, fmcsa-safety-alert.org) that pass casual visual inspection. (3) Urgency + consequence framing — "Your carrier authority will be suspended in 24 hours unless you verify." (4) One-click action — the link leads to a credential harvesting page that mirrors the legitimate site exactly.',
          },
          {
            heading: 'The five pre-click checks',
            body: 'Before clicking any link or opening any attachment in an email: (1) Hover over the link — the actual URL in the status bar must match the expected domain of the sender. If it doesn\'t match, do not click. (2) Verify the sender address — not just the display name, but the full email address. Legitimate carriers use their registered domain. (3) Check the request makes sense — were you expecting this communication? Is this the normal channel for this type of request? (4) Assess urgency pressure — real businesses do not demand immediate action on security or payment changes via email alone. Urgency is a manipulation tactic. (5) Look for attachment extension spoofing — "Rate_Confirmation.pdf.exe" or "Invoice_2024.docx.zip" are malware delivery vectors disguised as business documents.',
          },
          {
            heading: 'Spear phishing in freight operations',
            body: 'Spear phishing is targeted phishing using personal or operational details. Attackers gather intelligence from LinkedIn, load boards, carrier databases, and company websites to craft messages that reference real shipments, real personnel, and real loads. A spear phishing attack on a freight broker might reference the broker\'s actual MC number, name a carrier they regularly use, cite a real load that appeared on a load board, and request payment to a "corrected" banking account. The specificity makes the email feel legitimate. Defence: verify payment change requests by calling a known phone number — never use contact details provided in the suspicious email itself.',
          },
          {
            heading: 'Smishing and vishing in the cab and warehouse',
            body: 'SMS phishing (smishing) and voice phishing (vishing) target drivers and warehouse staff who are less likely to scrutinise digital communications. Common patterns: (1) Fake TMS or ELD update SMS with a link to install malware. (2) Spoofed call from "fleet dispatch" requesting a driver\'s login credentials or delivery PIN. (3) Warehouse dock smishing: "Your delivery access code has expired — click here to renew." Training must extend beyond email awareness to cover all communication channels used in operations.',
          },
          {
            heading: 'When you receive a suspicious email — response protocol',
            body: 'Do not click, do not reply, do not forward, do not call numbers in the email. Steps: (1) Mark as phishing using your email client\'s reporting tool. (2) Alert your IT or security contact — provide the full email including headers if possible. (3) If you clicked a link or entered credentials, assume compromise: report immediately, change passwords from a different device, and notify your security team. (4) If a financial action was taken based on a phishing email, contact your bank immediately to request a recall — the sooner this happens, the higher the recovery probability. Speed is critical: wire transfers become unrecoverable within hours.',
          },
        ],
        keyPoints: [
          'Display name spoofing: the visible sender name can say anything — always verify the actual sending address',
          'Five pre-click checks: hover URL, verify sender domain, check context, assess urgency, inspect attachment extensions',
          'Spear phishing uses real operational data (load numbers, MC details, personnel names) to defeat scepticism',
          'If credentials were entered on a suspicious site: assume compromise and act immediately',
          'Wire recall window is hours — financial phishing requires immediate bank contact, not end-of-day reporting',
        ],
        relatedTopicIds: ['social-engineering', 'bec-payment-fraud', 'identity-credential-security'],
      },
    ],
  },

  // ── Chapter 4 ─────────────────────────────────────────────────────────────
  {
    id: 'bec-payment-security',
    number: 4,
    label: 'Business Email Compromise and Payment Security',
    description: 'BEC mechanics, the three-layer failure model, callback procedures, and payment-control engineering.',
    topics: [
      {
        id: 'bec-payment-fraud',
        label: 'Business Email Compromise and Invoice Fraud',
        tagline: 'The most financially damaging online crime — how it works and how it succeeds in logistics.',
        intro: 'Business Email Compromise (BEC) is a cyberattack where adversaries assume the digital identity of a trusted party — a CEO, a vendor, a carrier, or a factoring company — to trick employees into making fraudulent payments. BEC attacks rarely contain malware, making them difficult for standard security tools to detect. The FBI\'s IC3 recorded 21,442 BEC complaints and $2.77 billion in reported losses in 2024 alone.',
        sections: [
          {
            heading: 'The three-layer failure model',
            body: 'The most damaging BEC incidents occur when weaknesses align across three layers simultaneously. The identity layer: lack of MFA allows attackers to take over an email account, giving them authenticated access that looks legitimate to all downstream systems. The process layer: payment workflows that allow email-only approvals and do not require independent verification of banking detail changes. The human layer: lack of training on high-risk pretexts causes clerks to bypass escalation procedures when faced with perceived urgency from a "known" sender.',
          },
          {
            heading: 'The typical freight BEC pattern',
            body: 'In the standard freight BEC pattern, an attacker either compromises a carrier\'s or vendor\'s email account, or spoofs their domain. They intercept an email thread between a broker and a carrier, then send an updated invoice claiming the factoring company or bank account details have changed. The email looks legitimate — it references real load numbers, uses the expected contact name, and arrives in the normal billing cycle. Without an independent verification step, the AP clerk wires funds to the attacker.',
          },
          {
            heading: 'Email compromise indicators',
            body: 'After taking over a mailbox, attackers configure it to maintain persistent access while concealing their activity. Common post-compromise modifications include: inbox rules that silently forward all mail to an external address, rules that delete messages matching specific keywords (like the attacker\'s own instructions), and rules that move messages to obscure folders. Regular audits of inbox rules for finance, accounts-payable, and operations management accounts are a low-cost, high-value early detection control.',
          },
          {
            heading: 'Indicators in the email itself',
            body: 'BEC emails often pass standard spam filters because they originate from legitimate or near-legitimate sources. Indicators to check: the reply-to address differs from the from address; the sending domain uses a common typo or lookalike (xyzlogistics.co vs xyzlogistics.com); the request introduces urgency ("final payment window closes today," "please process before end of week"); the request asks for a one-time exception to normal procedure; or the email contains a different bank/account number than the one on record in the TMS or ERP.',
          },
        ],
        keyPoints: [
          'IC3 2024: $2.77B in BEC losses; freight/logistics is a primary target sector',
          'Three-layer failure: identity (no MFA) + process (email-only approval) + human (urgency bypasses procedure)',
          'Post-compromise: look for unauthorised inbox forwarding/deletion rules in finance accounts',
          'BEC rarely has malware — passes spam filters and looks legitimate from trusted sources',
        ],
        relatedTopicIds: ['operational-controls', 'email-authentication', 'social-engineering'],
      },
      {
        id: 'operational-controls',
        label: 'Operational Controls and Verification Procedures',
        tagline: 'The payment gates, callback procedures, and dual-approval workflows that stop fraud from completing.',
        intro: 'Operational controls are the procedural gates that prevent fraudulent instructions from succeeding even when deception partially works. In logistics, the most consequential actions — payment instruction changes, carrier assignments, load releases — are also the highest-fraud-risk. Designing these workflows with mandatory verification steps is the practical response to BEC and social engineering.',
        sections: [
          {
            heading: 'The callback verification procedure',
            body: 'The FBI\'s core recommendation: never reply to an email requesting a banking change, and never use the phone number provided in a suspicious email or signature. Instead, look up the vendor\'s established phone number in the internal ERP or TMS — not from the email — and call to verbally verify the requested change. This callback procedure must be standard for every payment-detail change request, regardless of how legitimate the email appears. A vendor who cannot be reached at the number on file is a vendor whose change request waits.',
          },
          {
            heading: 'Dual authorisation',
            body: 'Dual authorisation requires two independent approvers for high-risk transactions: new beneficiaries, new bank accounts, factoring instruction changes, or payments above a defined threshold. The second approver must access the transaction independently (not simply receive a forwarded email), perform their own verification, and not be the same person as the requester. "Positive Pay" with the corporate bank adds a third gate: the bank automatically verifies ACH and check details against an approved list before releasing funds.',
          },
          {
            heading: 'Invoice verification for new vendors',
            body: 'New vendor first-payment situations are the highest-risk invoice events because there is no payment history to compare against. The standard: independently verify the vendor\'s identity using contact information not derived from the invoice, confirm banking details directly using a known contact number, and document the verification step before payment is processed. Existing vendors who request banking changes receive the same new-vendor treatment — any banking change resets the verification requirement.',
          },
          {
            heading: 'Privilege separation',
            body: 'Privilege separation ensures that the accounts used for daily work (email, TMS navigation) are not the same accounts used for payment approvals or system administration. A compromised email account should not grant the ability to approve wire transfers or change system configuration. At the individual level: separate admin credentials for high-privilege actions. At the system level: TMS admin access must not share credentials with external-facing portals or load-board logins.',
          },
        ],
        keyPoints: [
          'Callback procedure: verify banking changes by calling a number from your records — never from the email',
          'Dual authorisation: two independent approvers + Positive Pay = three gates before a fraudulent wire can proceed',
          'New vendor = highest risk: verify identity and banking independently before first payment',
          'Privilege separation: daily-use accounts must not have payment approval or admin rights',
        ],
        relatedTopicIds: ['bec-payment-fraud', 'identity-credential-security', 'incident-response'],
      },
      {
        id: 'bec-recovery-playbook',
        label: 'BEC Recovery: What to Do After a Payment Is Made',
        tagline: 'Hour-by-hour actions when a fraudulent transfer has already gone out.',
        intro: 'Business Email Compromise fraud is devastating precisely because the loss is recognised after the payment has been made. Unlike ransomware — where operations halt and the breach is obvious — BEC losses are often discovered days or weeks later, when a vendor queries non-payment or a bank flags unusual activity. This playbook provides the hour-by-hour response framework for the critical window between discovery and unrecoverable loss.',
        sections: [
          {
            heading: 'The first call: contacting your bank within the golden hour',
            body: 'Wire transfers and ACH payments can be recalled if action is taken before the funds are moved onward. The "golden hour" is the window between the transfer being initiated and the receiving bank releasing funds to the beneficiary. Steps within the first 60 minutes of discovery: (1) Call your bank\'s wire department directly — use a phone number from your bank\'s official website or back of your card, not numbers on any correspondence. (2) Request an immediate wire recall or ACH return — state "I believe this payment was made due to fraud." (3) Ask the bank to place a hold on the beneficiary account and issue a "Financial Fraud Kill Chain" (FFKC) alert if available. (4) Get a case reference number and the name of every person you speak with. International wires are harder to recall; domestic ACH has clearer recall mechanisms. Do not wait for internal approvals before calling the bank.',
          },
          {
            heading: 'Parallel action: FBI Internet Crime Complaint Center (IC3)',
            body: 'File with the FBI IC3 at ic3.gov immediately — do not wait for the bank investigation to conclude. The IC3 operates the Financial Fraud Kill Chain (FFKC) programme, which can freeze mule accounts and flag beneficiary institutions. Provide: exact dollar amount, date and time of transfer, sending and receiving bank routing and account numbers, and all email correspondence with the fraudulent party. FBI field offices also have financial fraud units — for losses above $100K, call the local FBI field office directly in addition to filing online. Law enforcement involvement, even if recovery is uncertain, creates the documentation trail required for insurance claims and potential civil recovery.',
          },
          {
            heading: 'Evidence preservation before remediation',
            body: 'The instinct after discovering BEC fraud is to remediate — change passwords, delete the compromised account, wipe systems. This destroys forensic evidence needed for law enforcement, insurance, and litigation. Before any remediation: (1) Preserve email headers of all communications from the fraudulent party — do not delete, mark as read, or move to trash. (2) Export the full mailbox of the compromised account to a secure location. (3) Screenshot all relevant email conversations, payment instructions, and banking communications. (4) Preserve server logs, VPN access logs, and email gateway logs covering the period of suspected compromise. (5) Do not reuse any systems or accounts involved until forensic imaging is complete. The preservation window is often 24-72 hours before overwrites occur.',
          },
          {
            heading: 'Internal containment and notification',
            body: 'Simultaneously: (1) Identify and isolate the compromised email account — disable it but do not delete it. Change all passwords from a separate, uncompromised device. (2) Check for email forwarding rules the attacker may have set up (forwarding to external addresses, auto-deletion of replies). These are a standard attacker persistence mechanism. (3) Notify your CFO, CEO, and legal counsel — BEC over certain dollar thresholds may trigger regulatory notification obligations. (4) If personal data (employee records, customer data) was accessible via the compromised account, assess whether a data breach notification is required under GDPR, state breach laws, or sector regulations. (5) Notify your cyber insurance carrier — policy conditions typically require prompt notification to preserve coverage.',
          },
          {
            heading: 'Root cause and process hardening',
            body: 'BEC does not end at recovery — it is a signal of a process vulnerability that will be exploited again if not addressed. Post-incident analysis must answer: (1) How did the fraudulent payment instructions reach the person who actioned them? (2) Was there a callback verification step that was skipped, bypassed, or never existed? (3) Which email security controls (DMARC, anti-spoofing) failed or were absent? (4) Was the compromised account MFA-protected? If not, why not? The root cause in the majority of BEC cases is a missing or bypassed verification procedure — not a technical control failure. Process hardening: mandate dual approval for all payment changes, establish an out-of-band callback protocol to pre-registered numbers, implement DMARC at reject policy, and extend MFA to every account with access to payment systems.',
          },
        ],
        keyPoints: [
          'Golden hour recovery: call your bank\'s wire department immediately — delays beyond 60 minutes dramatically reduce recall probability',
          'File IC3.gov report immediately to activate the FBI Financial Fraud Kill Chain programme',
          'Preserve evidence before remediation — changing passwords or deleting accounts destroys the forensic record',
          'Check for attacker-created forwarding rules in the compromised inbox — this is standard BEC persistence',
          'Dual approval + out-of-band callback are the process controls that prevent recurrence',
        ],
        relatedTopicIds: ['bec-payment-fraud', 'operational-controls', 'incident-response'],
      },
    ],
  },

  // ── Chapter 5 ─────────────────────────────────────────────────────────────
  {
    id: 'detection-response',
    number: 5,
    label: 'Pre-Incident Detection and Incident Response',
    description: 'Indicators of compromise, weak signals, and what to do when an incident is confirmed.',
    topics: [
      {
        id: 'pre-incident-indicators',
        label: 'Pre-Incident Indicators and Weak Signals',
        tagline: 'The digital breadcrumbs and operational anomalies that appear before a breach becomes visible.',
        intro: 'Cyber breaches rarely happen without warning. Organisations that detect breaches early contain them at significantly lower cost. The challenge in logistics is that indicators can appear across financial data, network telemetry, telematics feeds, and operational logs simultaneously — and not every indicator is obviously digital.',
        sections: [
          {
            heading: 'Financial micro-signals',
            body: 'Supplier compromises and systemic breaches often precede operational failure with financial early signals. Shifts in a supplier\'s payment behaviour (requesting payment to a new account, changing factoring arrangements, unusual invoice timing), rising short-term debt claims, or unexplained revenue fluctuations in a vendor relationship can indicate that a vendor\'s finance system or email has been compromised. These signals require cross-functional attention — accounts payable staff should be trained to escalate anomalous payment behaviour, not process it.',
          },
          {
            heading: 'Technical Indicators of Compromise (IoCs)',
            body: 'Technical IoCs are forensic artifacts that indicate a potential intrusion. Point anomalies are individual data points that deviate significantly from the norm — a sudden massive spike in API traffic or network requests. Contextual (behavioural) anomalies are events that are normal in one context but anomalous in another — a legitimate TMS user login from a foreign IP address during non-business hours. Collective anomalies are groups of related events that collectively deviate from expected patterns — typically indicating data exfiltration attempts prior to ransomware deployment. Host-level indicators include unknown file hashes, altered registry keys, or unexpected configuration modifications on logistics workstations.',
          },
          {
            heading: 'Load board and operational anomalies',
            body: 'Load board anomalies that precede fraud: a carrier expanding from one truck to thirty in a month (fraud operation ramping up); a carrier repeatedly requesting to reassign loads immediately after booking (double brokering in progress); MC or DOT authority records that show recent or unusual changes; and carriers who become unavailable or unresponsive after a load is tendered. These operational patterns are early warning signals before a load is delivered to the wrong party.',
          },
          {
            heading: 'Telematics pre-incident indicators',
            body: 'Telematics data can signal both mechanical risk and cyber-physical compromise. Erratic braking patterns, sudden acceleration events, or abnormal temperature spikes in refrigerated trailers can indicate either mechanical failure or remote manipulation of vehicle electronic control systems. A CAN bus intrusion via a compromised telematics unit may appear first as anomalous vehicle behaviour data rather than a network alert. Telematics platforms should have anomaly detection configured for these patterns, not only for GPS location.',
          },
        ],
        keyPoints: [
          'Financial anomalies (payment behaviour, new banking details) often precede breach disclosure',
          'IoC types: point anomaly (spike), contextual (foreign login), collective (exfiltration pattern)',
          'Load board fraud signals: rapid carrier growth, load reassignment requests, SAFER mismatches',
          'Telematics anomalies (erratic vehicle behaviour) can indicate CAN bus or TCU compromise',
        ],
        relatedTopicIds: ['incident-response', 'ransomware', 'double-brokering-cargo-theft'],
      },
      {
        id: 'incident-response',
        label: 'Incident Response and Escalation',
        tagline: 'What to do in the first sixty minutes — for financial fraud and for ransomware.',
        intro: 'The first minutes after discovering a fraud or ransomware incident determine whether losses can be recovered or contained. NIST SP 800-61 Rev. 3 frames incident response around building and exercising capabilities rather than following static checklists — because conditions at the time of a real incident never match a script exactly. What matters is having the right decisions pre-made before pressure forces shortcuts.',
        sections: [
          {
            heading: 'If you have already sent money — the first 60 minutes',
            body: 'Wire and ACH payments can sometimes be recalled if action is taken within the same business day. The sequence: contact your bank\'s fraud desk immediately (do not wait for internal approvals); request a recall of the outgoing wire or ACH; provide the destination bank details to the fraud desk for them to contact the receiving institution; and file a complaint with the FBI Internet Crime Complaint Center (IC3) at ic3.gov. The FBI\'s Financial Fraud Kill Chain process can freeze funds in transit — but only if the report arrives quickly. Every hour of delay reduces recovery probability.',
          },
          {
            heading: 'Financial escalation sequence',
            body: 'The escalation sequence must be defined and accessible offline before an incident occurs. Sequence: internal contact (CFO or finance manager first, not IT) → bank fraud desk → FBI IC3 (ic3.gov) → cyber insurance carrier → legal counsel. The sequence is designed to maximise financial recovery and minimise evidence loss — not to assign blame or follow hierarchy. The list must be physically printed and accessible when email and TMS systems are unavailable.',
          },
          {
            heading: 'Ransomware containment — first steps',
            body: 'On detecting ransomware: disconnect affected machines from the network immediately (unplug ethernet, disable Wi-Fi) without powering them off — powered-off machines lose volatile memory that may contain decryption keys or attacker artefacts. Do not attempt to decrypt using unknown third-party tools. Do not pay a ransom without legal and law enforcement consultation. Notify CISA (1-888-282-0870) and the FBI (ic3.gov) — both accept ransomware incident reports and can provide technical assistance.',
          },
          {
            heading: 'Evidence preservation',
            body: 'Incident response fails when evidence is lost during recovery actions. Before wiping or re-imaging any system: preserve full email headers for suspicious messages (right-click → view headers, not the display view), export system event logs and SIEM data from affected machines, preserve browser history and downloaded files from the incident date, and document all communications and invoices related to the fraudulent event. NIST SP 800-61 guidance emphasises that evidence integrity — using WORM storage, cryptographic hashes, and chain-of-custody documentation — is as important as the speed of response.',
          },
        ],
        keyPoints: [
          'Sent money fraudulently: bank fraud desk + IC3 report within the same business day',
          'Escalation sequence accessible offline: CFO → bank → IC3 → insurer → legal',
          'Ransomware: isolate (do not power off), notify CISA/FBI, do not pay without legal guidance',
          'Evidence first: preserve headers, logs, and browser history before any recovery action',
        ],
        relatedTopicIds: ['ransomware', 'bec-payment-fraud', 'operational-controls'],
      },
      {
        id: 'ransomware-full-picture',
        label: 'Ransomware: The Full Incident Picture',
        tagline: 'From initial access to ransom demand — how the attack unfolds and what to do.',
        intro: 'Ransomware has become the defining cyber threat to logistics operations. The transportation sector accounts for a disproportionate share of ransomware victims, partly because operators cannot afford downtime and partly because the interconnected nature of logistics amplifies attacker leverage. Understanding the full attack lifecycle — not just the encryption event — is essential for both prevention and response.',
        sections: [
          {
            heading: 'The ransomware attack chain: seven stages',
            body: 'Modern ransomware does not begin with encryption — it begins weeks or months earlier. The seven stages: (1) Initial access — typically via phishing, RDP exploitation, or compromised credentials purchased on the dark web. (2) Persistence — attackers establish multiple footholds (scheduled tasks, registry keys, backdoors) to survive password resets. (3) Discovery — the attacker maps the network, identifies domain controllers, backup systems, and high-value data stores. (4) Lateral movement — using legitimate credentials and tools (PsExec, WMI, RDP) to spread across the network without triggering alerts. (5) Exfiltration — data is staged and transferred to attacker-controlled infrastructure. This enables "double extortion": pay for decryption AND to prevent public data release. (6) Pre-encryption preparation — backup deletion (vssadmin.exe delete shadows), security tool disablement. (7) Encryption and ransom note deployment — typically triggered on a Friday night or before a public holiday to maximise dwell time before discovery.',
          },
          {
            heading: 'Logistics-specific ransomware impact',
            body: 'Ransomware in logistics is not only a data problem — it is an operations problem. When a TMS or WMS is encrypted, freight cannot be dispatched, deliveries cannot be confirmed, and customer communications fail. The NotPetya attack against A.P. Møller-Maersk in 2017 is the canonical example: 45,000 PCs and 1,000 applications encrypted simultaneously across 130 countries, costing approximately $300 million in damages. Maersk had to reinstall the entire infrastructure from scratch in 10 days using surviving domain controllers recovered from backups. Ransomware in a cold-chain warehouse can lead to temperature excursion of perishable goods. Ransomware in a port TOS (Terminal Operating System) can halt vessel loading and unloading. The financial loss from operational downtime typically exceeds the ransom demand itself.',
          },
          {
            heading: 'Immediate response: the first 4 hours',
            body: 'When ransomware is confirmed: (1) Isolate immediately — disconnect infected systems from the network by physically unplugging Ethernet cables or disabling WiFi. Do not power off (forensic evidence is in RAM). Do not run antivirus scans on infected systems — this can destroy artefacts. (2) Activate your incident response plan and contact your IR retainer or IT security provider. (3) Preserve backups — take offline copies of critical backups immediately and verify their integrity before attempting restoration. Attackers routinely target backup infrastructure first. (4) Establish a clean communication channel — assume your email may be compromised. Use personal devices and personal email for crisis communications. (5) Contact law enforcement (FBI or equivalent) and cyber insurance carrier.',
          },
          {
            heading: 'The ransom payment decision',
            body: 'The decision to pay a ransom involves legal, ethical, operational, and practical dimensions. Legally: in many jurisdictions, paying ransom to sanctioned threat actors (e.g., North Korean groups, Russian-sanctioned organisations) may violate OFAC regulations and expose the victim to civil penalties. Practically: payment does not guarantee decryption, recovery of exfiltrated data, or that attackers have not left persistence mechanisms. Statistically, organisations that pay are more likely to be targeted again. However: for some logistics operators where operational continuity is existential, and when law enforcement and legal counsel have assessed sanctions risk, payment may be the least-bad option. The decision must involve legal counsel, law enforcement liaison, and cyber insurance carrier before funds are transferred.',
          },
          {
            heading: 'Resilience: what prevents ransomware from being catastrophic',
            body: 'Three controls determine whether a ransomware attack is a major incident or a catastrophic one: (1) Offline, air-gapped backups — if backups are network-connected, they will be encrypted or deleted too. The 3-2-1 rule: 3 copies of data, on 2 different media types, with 1 copy offline/offsite. Test restores quarterly. (2) Network segmentation — if warehouse OT networks, TMS servers, and corporate endpoints are all on the same flat network, ransomware spreads without friction. Segmentation contains the blast radius. (3) Tested incident response plan — organisations that have never exercised their IR plan discover critical gaps during an active incident under maximum pressure. Tabletop exercises (TTX) specifically for ransomware scenarios reduce mean time to recovery measurably. Resilience is not about preventing every attack — it is about ensuring the attack is survivable.',
          },
        ],
        keyPoints: [
          'Ransomware begins weeks before encryption — the encryption event is the final stage, not the intrusion',
          'Double extortion: attackers exfiltrate data first, then encrypt — paying the ransom does not recover the stolen data',
          'First 4 hours: isolate (don\'t power off), preserve backups, establish clean communications, contact IR retainer and law enforcement',
          'Ransom payment has sanctions implications — OFAC review required before any payment decision',
          '3-2-1 backup rule + network segmentation + tested IR plan are the three resilience controls that separate survivable from catastrophic',
        ],
        relatedTopicIds: ['ransomware-syndicates', 'incident-response', 'pre-incident-indicators'],
      },
    ],
  },

  // ── Chapter 6 ─────────────────────────────────────────────────────────────
  {
    id: 'identity-authentication',
    number: 6,
    label: 'Identity, Credentials, and Email Authentication',
    description: 'MFA, authentication assurance levels, SPF, DKIM, DMARC, and MTA-STS explained.',
    topics: [
      {
        id: 'identity-credential-security',
        label: 'Identity and Credential Security',
        tagline: 'Why stolen credentials are the most common entry point and how to raise the authentication bar.',
        intro: 'Compromised credentials are the on-ramp for BEC, account takeover, and freight fraud. A stolen username and password for a TMS portal, email account, or load board gives an attacker legitimate-looking access with no need to breach technical defences. The solution is structured: apply higher authentication requirements to higher-risk actions, mapped to the specific roles and systems in your logistics operation.',
        sections: [
          {
            heading: 'Authentication assurance levels (NIST SP 800-63-4)',
            body: 'NIST\'s Digital Identity Guidelines (SP 800-63-4) define Authentication Assurance Level (AAL) as a structured category. AAL1 requires a single authentication factor. AAL2 requires multi-factor authentication — something you know plus something you have (an authenticator app, a hardware key). AAL3 requires hardware-based cryptographic authentication. For logistics operators, the mapping should be: payment approvals and banking detail changes require AAL2 at minimum; TMS and WMS administration requires AAL2; financial portals and email require AAL2; general staff portals require at minimum strong passwords.',
          },
          {
            heading: 'MFA deployment priorities for logistics roles',
            body: 'MFA on email is the single highest-leverage control because email compromise is the prerequisite for most BEC attacks. Role priority for MFA deployment: (1) Finance and accounts-payable staff — direct payment authority, highest risk; (2) TMS and WMS administrators — operational control, high risk; (3) Dispatchers and brokers — operational instruction authority, moderate risk; (4) Field and driver staff — lower direct financial risk but credential-bearing systems that can be pivoted. Authenticator apps are preferred over SMS codes, which can be intercepted via SIM swapping.',
          },
          {
            heading: 'Password policy that works',
            body: 'NIST SP 800-63B guidance moves away from mandatory periodic password resets (which produce predictable patterns like "Password1!") toward length-prioritised passphrases checked against breached-password lists. Four random words strung together ("correct-horse-battery-staple") are both more secure and more memorable than a complex short password. Password managers allow unique, long passwords per system — critical in logistics where staff access multiple portals (TMS, WMS, load boards, email, carrier portals) and password reuse creates cascading breach risk.',
          },
          {
            heading: 'Shared accounts and offboarding',
            body: 'Shared accounts — a single login used by multiple team members — are a persistent logistics operations problem because they are convenient. They are also high-risk: no individual can be held accountable for actions on a shared account, and offboarding one team member does not remove others\' access. The standard for high-risk systems: individual accounts with role-based access control (RBAC), enforcing the principle of least privilege. Offboarding must revoke access on the same day employment ends — not days or weeks later, when attackers with a terminated employee\'s credentials can still operate undetected.',
          },
        ],
        keyPoints: [
          'MFA on email is the single highest-leverage BEC prevention control',
          'NIST SP 800-63-4 AAL tiers: map authentication strength to action risk',
          'Passphrases + password managers beat complex short passwords on both security and usability',
          'Shared accounts + delayed offboarding = persistent access risk after departure',
        ],
        relatedTopicIds: ['email-authentication', 'bec-payment-fraud', 'operational-controls'],
      },
      {
        id: 'email-authentication',
        label: 'Email Security: SPF, DKIM, DMARC, and MTA-STS',
        tagline: 'The four standards that make spoofed and impersonation emails detectable and rejectable.',
        intro: 'Most logistics fraud is email-mediated. The internet email standards community has built a layered set of authentication protocols specifically designed to make spoofed and impersonated emails detectable — and to give domain owners the ability to set binding policies for what receiving servers do with unauthenticated mail. These are not optional enhancements; they are baseline controls for any logistics business that sends or receives payment-related communications.',
        sections: [
          {
            heading: 'SPF — Sender Policy Framework (RFC 7208)',
            body: 'SPF allows a domain to publish a list of the mail servers authorised to send email on its behalf. Receiving servers check whether an incoming message originated from an authorised server. SPF addresses "envelope sender forgery" — the MAIL FROM address used in SMTP, which is less visible than the display-from address users see. Publishing an SPF record means receiving servers can verify that email claiming to come from your domain originated from an authorised source, making domain spoofing harder.',
          },
          {
            heading: 'DKIM — DomainKeys Identified Mail (RFC 6376)',
            body: 'DKIM adds a cryptographic signature to outgoing messages, verified by the receiving server using a public key published in DNS. The signature covers specified message headers and body content, making tampering detectable. DKIM is particularly valuable in freight because it means that a legitimate invoice or rate confirmation carries a verifiable signature — attackers who intercept and modify the email will break the signature, making the modification detectable by compliant receiving mail systems.',
          },
          {
            heading: 'DMARC — Policy and Reporting (RFC 7489)',
            body: 'DMARC builds on SPF and DKIM to let domain owners set binding policy: what should receiving servers do with messages that fail authentication? Policy options are "none" (monitor and report only), "quarantine" (send to spam/junk), or "reject" (discard the message). DMARC also generates aggregate reports sent to the domain owner, showing what mail is being sent using their domain — including spoofing attempts. A DMARC "reject" policy prevents domain-spoofed emails from reaching inboxes entirely.',
          },
          {
            heading: 'MTA-STS — SMTP Transport Security (RFC 8461)',
            body: 'MTA-STS allows a domain to declare that it can receive TLS-encrypted SMTP connections and to instruct sending servers to refuse delivery if a trusted TLS connection is unavailable. This prevents SMTP TLS downgrade attacks — where an attacker between two mail servers strips the encryption to intercept or modify email in transit. For logistics operators handling financial instructions by email, MTA-STS means email destined for your domain cannot be intercepted via this interception method.',
          },
        ],
        keyPoints: [
          'SPF: publishes authorised sending servers — prevents envelope-sender domain forgery',
          'DKIM: cryptographic signature per message — detects tampering and forgery',
          'DMARC: policy layer (quarantine/reject) + reporting — the most visible anti-spoofing control',
          'MTA-STS: enforces TLS encryption on inbound SMTP — prevents in-transit interception',
        ],
        relatedTopicIds: ['identity-credential-security', 'bec-payment-fraud', 'social-engineering'],
      },
    ],
  },

  // ── Chapter 7 ─────────────────────────────────────────────────────────────
  {
    id: 'technical-protocols',
    number: 7,
    label: 'Technical Protocols and Systemic Vulnerabilities',
    description: 'CAN bus, telematics, industrial control systems, and EDI — the protocols behind logistics operations.',
    topics: [
      {
        id: 'vehicular-networks-can',
        label: 'Vehicular Networks: SAE J1939 and the CAN Bus',
        tagline: 'Why heavy trucks are hackable — the unencrypted protocol at the heart of commercial vehicle electronics.',
        intro: 'Medium and heavy-duty commercial vehicles communicate internally via the Controller Area Network (CAN) bus, specifically implementing the SAE J1939 protocol. The protocol was intentionally designed as an open, published standard to enable "plug and play" interoperability between different ECU manufacturers. That openness creates an unencrypted attack surface with documented, real-world exploitability.',
        sections: [
          {
            heading: 'What SAE J1939 is and why it matters',
            body: 'SAE J1939 uses a 29-bit extended identifier field and governs communication between Electronic Control Units (ECUs) managing engine braking, acceleration, transmission, and safety systems. The standard is "open by design" — it was published deliberately to allow third-party parts and accessories to connect. The consequence is that the protocol lacks message authentication and encryption. Any device that can connect to the CAN bus can send and receive all ECU messages.',
          },
          {
            heading: 'Demonstrated attack capabilities',
            body: 'Researchers from Colorado State University have demonstrated "Request Overload" attacks — flooding the network with malicious Parameter Group Numbers (PGNs) targeting destination-specific requests, forcing critical ECUs to drop legitimate operational commands. In real-world demonstrations on a 2014 Kenworth T270 and a 2006 Class-8 semi-tractor, attackers successfully manipulated Engine Control Module messages to remotely disable engine brakes, accelerate the vehicle against the driver\'s input, and lock out physical controls. These are not theoretical vulnerabilities.',
          },
          {
            heading: 'Common initial access vectors',
            body: 'Attackers gain access to the CAN bus through connected systems: compromised Telematics Control Units (the most common vector), malicious code delivered via a USB device or technician laptop during maintenance, tampered third-party add-on devices, or vulnerabilities in fleet management software that has access to the vehicle network. ELD devices are both a regulatory requirement and a connected attack surface — they are plugged directly into the vehicle\'s diagnostic port (OBD-II), which provides CAN bus access.',
          },
          {
            heading: 'Mitigation considerations',
            body: 'Direct CAN bus hardening is difficult without vendor cooperation because J1939 is a foundational standard. Practical mitigations focus on the access points: vetting and securing telematics devices from trusted vendors with auditable firmware, limiting who can connect devices to diagnostic ports during maintenance, and monitoring fleet management platforms for unusual command patterns. ISO/SAE 21434 (see Chapter 8) mandates Threat Analysis and Risk Assessments for vehicle systems — relevant for any logistics operator specifying new fleet equipment.',
          },
        ],
        keyPoints: [
          'SAE J1939/CAN bus: no authentication, no encryption — open by design, exploitable as a consequence',
          'Demonstrated attacks: remote engine brake disable, remote acceleration control on real commercial trucks',
          'ELDs plug into the OBD-II diagnostic port — direct CAN bus access by regulation',
          'Initial access paths: compromised TCU, malicious USB, tampered add-on devices',
        ],
        relatedTopicIds: ['telematics-iot-ota', 'attack-surfaces-ecosystem', 'regulations-sector-guidance'],
      },
      {
        id: 'telematics-iot-ota',
        label: 'Telematics, IoT Security, and OTA Updates',
        tagline: 'How fleets communicate securely with the cloud — and where that security can fail.',
        intro: 'Telematics Control Units (TCUs) are the gateway between a vehicle\'s internal CAN bus networks and external cloud infrastructure. The fleet management IoT market is growing rapidly, and IoT breaches surged to over 112 million globally in 2022. Securing the telematics data chain — from the vehicle to the cloud and back for firmware updates — is a foundational requirement for logistics fleet security.',
        sections: [
          {
            heading: 'How secure telematics data transmission works',
            body: 'Secure telematics relies on Mutual Authentication (Two-Way SSL): both the TCU and the cloud server verify each other\'s digital certificates via Public Key Infrastructure (PKI) before establishing a connection. Data payloads are encrypted using a shared public key and transmitted via the MQTT (Message Queuing Telemetry Transport) protocol over cellular or Wi-Fi. The TCU creates a cryptographic hash of the payload, signs it with its private key to create a Digital Signature, and the cloud performs Digital Signature Verification (DSV) upon receipt to confirm integrity and detect man-in-the-middle tampering.',
          },
          {
            heading: 'Over-The-Air (OTA) firmware update risks',
            body: 'OTA software updates are both a security necessity (patching vulnerabilities) and an attack surface. Secure OTA processes require dynamic session tokens — time-expiring HTTP URLs — and rigorous DSV to ensure that firmware downloaded from the target repository has not been intercepted or replaced. A man-in-the-middle attack on an unprotected OTA channel can deliver malicious firmware to an entire fleet simultaneously. Fleet managers should verify that telematics vendors implement signed updates, hardware code protection, and the ability to roll back compromised firmware.',
          },
          {
            heading: 'IoT device inventory and management',
            body: 'Logistics operations involve large numbers of IoT devices: temperature sensors, barcode scanners, GPS trackers, ELDs, dock door sensors, and warehouse robotics. Each device is a potential entry point. Best practices include maintaining an accurate inventory of all IoT devices with their firmware versions, applying network segmentation to isolate IoT device networks from corporate IT, disabling default credentials on all devices immediately on deployment, and monitoring for devices that are communicating to unexpected external addresses.',
          },
          {
            heading: 'GPS spoofing and location integrity',
            body: 'GPS spoofing — broadcasting false GPS signals to trick a receiver into reporting a false location — is a growing concern for logistics fleet management. Spoofed GPS data can be used to falsify proof-of-delivery, redirect drivers, or mask the location of stolen cargo. Indicators of GPS spoofing include sudden jumps in reported vehicle position, inconsistencies between GPS location and driver-reported location, and location data that contradicts physical tracking from other sources (cell tower data, physical delivery confirmation).',
          },
        ],
        keyPoints: [
          'Secure telematics: Mutual TLS + MQTT + DSV — all three are required for integrity',
          'OTA updates: time-expiring tokens + signed firmware prevent fleet-wide firmware compromise',
          'IoT inventory, network segmentation, and default credential removal are baseline controls',
          'GPS spoofing can falsify proof-of-delivery and mask cargo location — cross-validate location data',
        ],
        relatedTopicIds: ['vehicular-networks-can', 'attack-surfaces-ecosystem', 'ransomware'],
      },
      {
        id: 'industrial-protocols-ics',
        label: 'Industrial Control Systems, Warehouse ICS, and EDI',
        tagline: 'Legacy protocols in warehouses and terminals — Modbus, Profinet, and EDI transmission security.',
        intro: 'Modern distribution centres rely on Industrial Ethernet protocols to automate conveyor systems, sortation, access control, and temperature management. Many of these protocols were engineered decades ago without security-by-design principles. Similarly, Electronic Data Interchange (EDI) — the standard for B2B document exchange — has evolved its transmission security, but legacy implementations remain widespread.',
        sections: [
          {
            heading: 'Modbus TCP — universal but unprotected',
            body: 'Modbus TCP is a master-slave protocol used across warehouse and industrial automation environments. It lacks built-in authentication, session management, or encryption. All function codes — including 0x03 (Read Holding Registers), 0x06 (Write Single Register), and 0x10 (Write Multiple Registers) — are transmitted in plaintext. Function code 0x05 (Force Single Coil) can be weaponised to directly alter physical machinery states: forcing conveyor switches, reversing sortation direction, or triggering emergency stops. If an attacker gains access to the warehouse network, Modbus devices are immediately controllable.',
          },
          {
            heading: 'Profinet — real-time but spoofable',
            body: 'Profinet offers multiple performance classes including Real-Time (RT) and Isochronous Real-Time (IRT). RT traffic relies on unencrypted UDP, and the Discovery and Configuration Protocol (DCP) — used for device configuration and identification — is highly susceptible to spoofing and Denial of Service (DoS) attacks. Security for Profinet must be retrofitted via the overlaying Profisafe protocol, which adds cyclic redundancy checks and sequence numbering but still requires network segmentation as the primary defence.',
          },
          {
            heading: 'Network segmentation as the primary ICS defence',
            body: 'Deep network segmentation is the primary mitigation for industrial protocol vulnerabilities. The OT network (conveyor systems, AGVs, access control) must be isolated from the corporate IT network by firewalls or data diodes. A compromised email account on the corporate network should not have any path to a Modbus or Profinet device. Segmentation must also isolate guest Wi-Fi, corporate IT, and warehouse robotics networks into separate VLANs with access control lists. Segmentation alone — without authentication on the protocols themselves — is the current practical standard.',
          },
          {
            heading: 'EDI transmission security: AS2 and AS4',
            body: 'Electronic Data Interchange handles critical supply chain documents: Bills of Lading (BoL), purchase orders, advance ship notices (ASN), and customs manifests. AS2 (Applicability Statement 2) secures transmission over HTTP/S with payload encryption and digital signatures, suitable for low-to-medium volume integrations. AS4 modernises this with SOAP-based Web Services and WS-Security, offering superior large-payload handling and structured attachment management for mission-critical regulatory exchanges (including Peppol network compliance and SAP integration). The configuration complexity of AS4 leads many smaller suppliers to maintain AS2, creating mixed-security environments.',
          },
        ],
        keyPoints: [
          'Modbus TCP: no authentication, function code 0x05 can force physical machinery states',
          'Profinet: RT traffic over unencrypted UDP, DCP protocol vulnerable to spoofing/DoS',
          'Network segmentation (OT vs. IT) is the primary practical defence for ICS environments',
          'AS2 → AS4 progression: AS4 adds WS-Security and structured compliance, AS2 remains more accessible for smaller partners',
        ],
        relatedTopicIds: ['attack-surfaces-ecosystem', 'standards-frameworks', 'ransomware'],
      },
    ],
  },

  // ── Chapter 8 ─────────────────────────────────────────────────────────────
  {
    id: 'regulatory-frameworks',
    number: 8,
    label: 'Regulatory Frameworks and Sector Standards',
    description: 'IMO, TSA, ISO/SAE 21434, EU NIS2, NIST C-SCRM, and the full regulatory landscape for logistics.',
    topics: [
      {
        id: 'maritime-rail-regulations',
        label: 'Maritime and Rail Cybersecurity Regulations',
        tagline: 'IMO MSC.428(98), IAPH smart port guidelines, TSA Security Directive, and CENELEC TS 50701.',
        intro: 'Maritime and rail logistics operations are subject to specific cybersecurity regulations that go beyond general IT best practices. These frameworks mandate operational cyber risk management as part of safety management — recognising that a digital compromise in navigation, signalling, or cargo management systems is a safety risk, not just a data breach.',
        sections: [
          {
            heading: 'IMO Resolution MSC.428(98) — maritime cyber risk management',
            body: 'The International Maritime Organization (IMO) adopted Resolution MSC.428(98) in 2017, with enforcement from 2021. The resolution mandates that ship owners, operators, and managers integrate comprehensive cyber risk management into their existing International Safety Management (ISM) Code frameworks. Administrations must verify cybersecurity policies during annual Document of Compliance audits. The IMO\'s MSC-FAL.1/Circ.3 guidelines define maritime cyber risk as operational, safety, or security failures caused by systems being corrupted, lost, or compromised — covering cargo handling, access control, and navigation systems.',
          },
          {
            heading: 'IAPH smart port guidelines',
            body: 'The International Association of Ports and Harbors (IAPH) provides cybersecurity guidelines targeting onshore port infrastructure. The IAPH framework specifically addresses threats to smart ports introduced by emerging technologies: encryption-breaking quantum computing risks, AI-generated cyberattacks, drone hacking, 5G network slicing exploitation, AGV automation system vulnerabilities, and IoT device security. For U.S. MTSA-regulated port and terminal facilities, the U.S. Coast Guard\'s NVIC 01-20 provides guidance on computer system vulnerability assessments within Facility Security Plans, directing facilities to use NIST frameworks and NIST SP 800-82.',
          },
          {
            heading: 'TSA Security Directive 1580/82-2022-01 — freight and passenger rail',
            body: 'The Transportation Security Administration (TSA) issued Security Directive 1580/82-2022-01 imposing performance-based cyber risk management requirements on U.S. freight and passenger rail operators. Operators must designate a 24/7 Cybersecurity Coordinator, develop and test incident response plans, and submit detailed vulnerability assessments. The directive specifically mandates that Positive Train Control (PTC) networks be designated as Critical Cyber Systems, requiring TSA-approved Cybersecurity Implementation Plans (CIP) and ongoing Cybersecurity Assessment Programs.',
          },
          {
            heading: 'CENELEC TS 50701 — European rail cybersecurity',
            body: 'In Europe, CENELEC TS 50701 integrates cybersecurity into the traditional RAMS (Reliability, Availability, Maintainability, and Safety) lifecycle for rail systems, rooted in the IEC 62443 industrial automation standard. TS 50701 establishes zone and conduit architectures with Security Levels SL0 through SL4, covering communications, signalling, rolling stock, and fixed installations. Uniquely, TS 50701 allows operators to bypass explicit risk evaluations by adopting a recognised "Code of Practice" — a widely accepted, state-of-the-art security architecture — recognising that a compromise in rail IT directly negates functional physical safety.',
          },
        ],
        keyPoints: [
          'IMO MSC.428(98): cyber risk management required in ISM Code frameworks from 2021',
          'IAPH: smart port guidelines covering AGVs, 5G slicing, quantum risks, and AI-generated attacks',
          'TSA 1580/82: 24/7 Cybersecurity Coordinator + PTC as Critical Cyber System',
          'CENELEC TS 50701: IEC 62443-based, SL0–SL4 security levels for rail systems',
        ],
        relatedTopicIds: ['automotive-aviation-regulations', 'standards-frameworks', 'industrial-protocols-ics'],
      },
      {
        id: 'automotive-aviation-regulations',
        label: 'Automotive, Trucking, and Aviation Cybersecurity Regulations',
        tagline: 'ISO/SAE 21434, UNECE R155/R156, ICAO Annex 17, and EASA Part-IS.',
        intro: 'Road freight cybersecurity is now governed by internationally harmonised standards that directly affect which vehicles can be sold in 54+ countries. Aviation cargo logistics operates under ICAO and EASA frameworks that bind safety and information security together. Understanding these requirements matters for logistics operators specifying fleet equipment and for aviation cargo operations.',
        sections: [
          {
            heading: 'ISO/SAE 21434 — automotive cybersecurity engineering',
            body: 'ISO/SAE 21434 requires original equipment manufacturers (OEMs) and Tier 1 suppliers to execute continuous Threat Analysis and Risk Assessments (TARA) throughout the entire lifecycle of a vehicle — from concept and manufacturing through operation, maintenance, and decommissioning. It mandates multi-layered security including secure design practices, cryptographic roots of trust, and rigorous verification. For logistics fleet managers, ISO/SAE 21434 compliance is the basis for evaluating whether a vehicle vendor\'s cybersecurity engineering meets a defensible standard.',
          },
          {
            heading: 'UNECE Regulations R155 and R156',
            body: 'ISO/SAE 21434 serves as the technical foundation to comply with UNECE Regulations R155 and R156. UNR 155 mandates the implementation of an independently audited Cyber Security Management System (CSMS) covering risk management and incident response. UNR 156 requires a secure Software Update Management System (SUMS) to manage over-the-air firmware patches. Inability to demonstrate compliance with these regulations legally prohibits manufacturers from achieving type approval and selling commercial vehicles in over 54 global markets — making them a de facto requirement for any new fleet equipment in major markets.',
          },
          {
            heading: 'ICAO Annex 17 — aviation cargo security',
            body: 'The International Civil Aviation Organization (ICAO) Annex 17 establishes Standards and Recommended Practices (SARPs) under the Chicago Convention, defining baseline measures to protect civil aviation from unlawful interference — encompassing the protection of critical IT infrastructure, cargo operations, and air traffic control systems. Aviation logistics operators handling air cargo must comply with Annex 17 security measures implemented by national civil aviation authorities, including cybersecurity requirements for cargo management systems.',
          },
          {
            heading: 'EASA Part-IS — European aviation information security',
            body: 'The European Union Aviation Safety Agency (EASA) enforces Part-IS, which binds aviation safety inextricably to information security measures. Part-IS requires aviation organisations to establish Information Security Management Systems, identify and manage information security risks that could affect aviation safety, and report information security events through defined channels. For cargo airlines and ground handling operations in Europe, Part-IS creates formal obligations parallel to the NIST CSF approach — continuous risk management rather than point-in-time compliance.',
          },
        ],
        keyPoints: [
          'ISO/SAE 21434: TARA required across full vehicle lifecycle — evaluate vendor compliance',
          'UNECE R155/R156: CSMS + SUMS required for type approval in 54+ markets',
          'ICAO Annex 17: baseline security for aviation cargo operations globally',
          'EASA Part-IS: formal information security management obligation for EU aviation organisations',
        ],
        relatedTopicIds: ['maritime-rail-regulations', 'vehicular-networks-can', 'standards-frameworks'],
      },
      {
        id: 'transnational-frameworks',
        label: 'Transnational Mandates: EU NIS2, NIST C-SCRM, and CISA CPGs',
        tagline: 'Cross-sector frameworks that apply to the entire logistics sector as critical infrastructure.',
        intro: 'Beyond sector-specific regulations, overarching transnational frameworks create baseline cybersecurity obligations across all modes of transport and all sizes of logistics operator. These frameworks — EU NIS2, NIST C-SCRM, and CISA CPGs — are the governance layer above the technical standards.',
        sections: [
          {
            heading: 'EU NIS2 Directive — essential sector obligations',
            body: 'The European Union\'s NIS2 Directive categorises the entire transport and logistics sector — air, rail, water, and road — as "essential" critical infrastructure. NIS2 raises the EU\'s common level of cybersecurity ambition, expanding scope to include postal and courier services and space sectors. It enforces rigorous mandates on supply chain security, compelling entities to continuously evaluate vendor cyber resilience, secure real-time operational data exchange (including air traffic control and maritime navigation systems), implement strict incident reporting windows, and face heavy financial penalties for non-compliance. NIS2 elevates cybersecurity to a board-level fiduciary responsibility.',
          },
          {
            heading: 'NIST C-SCRM (SP 800-161r1) — supply chain risk management',
            body: 'NIST SP 800-161r1 is the definitive guide for Cybersecurity Supply Chain Risk Management (C-SCRM). It requires organisations to establish a C-SCRM Program Management Office (PMO) and integrate risk management across three tiers: strategic (executive and board), operational (programme and business), and tactical (system and implementation). Appendix A maps specific supply chain controls — Access Control, Incident Response, Personnel Security — to NIST SP 800-53, enabling systematic vetting of software vendors, open-source components, and hardware suppliers. For logistics operators, this framework is the basis for evaluating TMS, WMS, and EDI platform vendors.',
          },
          {
            heading: 'CISA CPGs 2.0 — cross-sector performance goals',
            body: 'CISA\'s Cross-Sector Cybersecurity Performance Goals (CPGs) 2.0 align closely with NIST CSF 2.0 and represent the U.S. government\'s baseline expectations for critical infrastructure operators. The CPGs emphasise the new "Govern" function — board-level accountability for cybersecurity outcomes — and specifically demand: documented network topologies with strict OT/IT segmentation, phishing-resistant MFA implementation, continuous collaboration between IT and OT teams, and vendor/supplier cybersecurity requirements and vulnerability disclosure. For logistics operators without formal compliance obligations, the CPGs provide a practical prioritised starting point.',
          },
          {
            heading: 'Executive sponsorship and board-level accountability',
            body: 'A key finding from NIST C-SCRM research involving organisations like Palo Alto Networks and Seagate Technology: highly mature supply chain risk management programmes require executive sponsorship with boards receiving quarterly or semi-annual updates detailing business impact estimations derived from technical metrics. In EU NIS2 terms, cybersecurity risk is a fiduciary duty — executives can be held personally liable for failures. The practical implication for logistics leadership: cybersecurity metrics must be translated into business risk language (potential revenue loss, regulatory fines, cargo liability) before they are meaningful at board level.',
          },
        ],
        keyPoints: [
          'EU NIS2: entire transport sector = essential infrastructure; board-level fiduciary duty, heavy penalties',
          'NIST C-SCRM SP 800-161r1: three-tier PMO structure; maps controls to SP 800-53 catalog',
          'CISA CPGs 2.0: phishing-resistant MFA + OT/IT segmentation + board accountability as baseline',
          'Board reporting must use business risk language — revenue exposure, regulatory fines, cargo liability',
        ],
        relatedTopicIds: ['standards-frameworks', 'maritime-rail-regulations', 'ransomware-syndicates'],
      },
    ],
  },

  // ── Chapter 9 ─────────────────────────────────────────────────────────────
  {
    id: 'role-playbooks',
    number: 9,
    label: 'Role-Specific Cybersecurity Playbooks',
    description: 'Practical checklists for the accounts payable clerk, dispatcher, warehouse manager, and executive.',
    topics: [
      {
        id: 'playbook-finance-ap',
        label: 'Playbook: Accounts Payable and Finance',
        tagline: 'The BEC, invoice fraud, and payment diversion checklist for finance staff.',
        intro: 'Accounts payable and finance staff are the primary human targets for BEC and invoice fraud. They have the authority to execute payments and operate under process pressure that rewards speed. Cybersecurity for this role is almost entirely procedural — the right controls are verification steps and escalation paths, not technical tools.',
        sections: [
          {
            heading: 'Payment change request procedure',
            body: 'When any vendor, carrier, or factoring company requests a change to banking details: (1) Do not reply to the email. (2) Do not call the number provided in the email or signature. (3) Locate the vendor\'s established phone number in the ERP or TMS — your system of record, not the email. (4) Call the vendor and demand to speak with a known financial contact. (5) Verbally confirm the new routing number or account number. (6) Document the confirmation with timestamp, contact name, and call details. (7) Proceed only after documented confirmation. Any request that cannot be confirmed this way does not proceed until it can be.',
          },
          {
            heading: 'Invoice verification checklist',
            body: 'For every invoice from a new vendor or an existing vendor with changed details: verify the email domain of the incoming invoice (typosquatting like .co vs .com is a common technique); check the invoice number format against historical invoices from that vendor; confirm the bank account matches what is in your ERP — if it differs, trigger the payment change procedure; require dual authorisation for any wire transfer above the defined threshold; implement Positive Pay with the corporate bank for ACH and check disbursements.',
          },
          {
            heading: 'Inbox security and email vigilance',
            body: 'Finance email accounts are high-value compromise targets. Review your own inbox rules monthly: check for rules you did not set up, especially ones that forward mail to external addresses or delete messages matching certain keywords. If you discover a rule you do not recognise, report it to IT immediately — it is a strong indicator of account compromise. Report suspicious payment request emails to IT before acting on them, even if the request appears legitimate.',
          },
          {
            heading: 'What to do if you have already sent money',
            body: 'If you suspect you have completed a fraudulent payment: act within minutes, not hours. Call your bank\'s fraud line and request an immediate recall of the wire or ACH. Do not send follow-up payments. Preserve all related emails, bank confirmations, and communication records immediately (before anything is deleted). Notify your manager and follow the financial escalation sequence: bank → FBI IC3 (ic3.gov) → cyber insurance carrier. Time is the critical variable — same-day action can recover funds; delayed action rarely can.',
          },
        ],
        keyPoints: [
          'Banking change requests: callback to ERP-verified number only — never use the email-provided number',
          'Dual authorisation + Positive Pay = two procedural gates before a fraudulent wire can clear',
          'Review your inbox rules monthly — unauthorised forwarding rules indicate account compromise',
          'Fraudulent payment made: bank fraud line + IC3 report within the same business day',
        ],
        relatedTopicIds: ['bec-payment-fraud', 'operational-controls', 'incident-response'],
      },
      {
        id: 'playbook-dispatcher-broker',
        label: 'Playbook: Fleet Dispatcher and Freight Broker',
        tagline: 'The carrier vetting, load board, and rate confirmation checklist for operations staff.',
        intro: 'Dispatchers and freight brokers make operational decisions that can result in loads being delivered to fraudulent carriers. The primary threats for this role are double brokering, carrier identity theft, and load board scams. The controls are procedural verification steps applied at carrier onboarding and at every load tender.',
        sections: [
          {
            heading: 'Carrier vetting at onboarding',
            body: 'Every new carrier relationship requires verification before the first load is tendered: (1) Verify MC and USDOT numbers directly against the FMCSA SAFER database (safer.fmcsa.dot.gov) — do not rely on the carrier-provided PDF. (2) Confirm Certificate of Insurance directly with the insurance provider using the insurer\'s published contact number, not the contact in the carrier packet. (3) Verify that the carrier\'s contact phone number matches the FMCSA registration record. (4) Check that the carrier\'s authority is currently active (not revoked or pending).',
          },
          {
            heading: 'Red flags at load tender time',
            body: 'At the point of tendering a load, flag and escalate: MC/DOT numbers that do not match SAFER registration or that show recent changes; email addresses from free providers (Gmail, Outlook) instead of business domains; phone numbers that differ from the FMCSA registration; carriers who refuse to provide live load tracking via MacroPoint or equivalent; drivers who appear at pickup but are not on the carrier\'s authorised list; carriers who request immediate load reassignment after acceptance (potential double brokering in progress).',
          },
          {
            heading: 'Rate confirmation security',
            body: 'Sending rate confirmations as standard email PDF attachments creates an interception risk: a compromised email inbox is all an attacker needs to intercept the rate con, impersonate the carrier, and steal the load. Mitigation: use secure portal-based delivery for rate confirmations that requires the carrier to authenticate before accessing the document. If email delivery is unavoidable, call the carrier\'s verified phone number to confirm they have received the rate con before the pickup window opens.',
          },
          {
            heading: 'When something feels wrong at pickup',
            body: 'Trust your operational instinct. If a driver arrives and something is off — different vehicle than the carrier profile lists, driver cannot provide the pickup reference number without prompting, inconsistency between the driver\'s paperwork and the carrier\'s documentation — do not release the load. Contact the carrier at the FMCSA-verified phone number, not the number on the driver\'s paperwork. If you cannot confirm the identity of the carrier and driver via a verified channel, the load does not leave the facility until you can.',
          },
        ],
        keyPoints: [
          'Every new carrier: SAFER check + direct insurance verification + phone number match',
          'Red flags at tender: Gmail domain, phone mismatch, no tracking, immediate reassignment request',
          'Rate confirmations via secure portal with authentication — not email attachments',
          '"When in doubt, don\'t" — no load release without verified carrier identity confirmation',
        ],
        relatedTopicIds: ['double-brokering-cargo-theft', 'social-engineering', 'regulations-sector-guidance'],
      },
      {
        id: 'playbook-warehouse-executive',
        label: 'Playbook: Warehouse Manager and Executive Leadership',
        tagline: 'OT security and network hygiene for warehouse managers; fiduciary duty and programme oversight for executives.',
        intro: 'Warehouse managers face the intersection of physical operations and cyber risk — where a compromised AGV or ICS system can cause physical harm and operational disruption simultaneously. Executives carry the governance and fiduciary accountability that modern frameworks like NIS2 and CISA CPGs explicitly assign to leadership.',
        sections: [
          {
            heading: 'Warehouse manager: OT network segmentation',
            body: 'The warehouse Wi-Fi network must be segmented into three distinct networks at minimum: guest network (visitor access, no corporate connectivity), corporate IT network (workstations, email, TMS access), and operational/robotics network (AGVs, conveyor systems, ICS protocols, IoT sensors). These networks must not be able to communicate with each other without explicit firewall rules. A compromised employee laptop on the corporate network should have zero path to Modbus or Profinet devices. Review the segmentation architecture with IT at least annually.',
          },
          {
            heading: 'Warehouse manager: physical-cyber alignment',
            body: 'Physical security and cyber security must be aligned. Lock down unmonitored server rooms and network equipment closets — physical access to a network switch bypasses all logical access controls. Maintain an accurate OT asset inventory classifying all devices by criticality and connectivity. Implement a physical incident response protocol: if an operational anomaly is detected (conveyor stopping unexpectedly, AGV collision, access control failure), preserve camera footage and physical evidence immediately — before any "helpful" resets that destroy evidence.',
          },
          {
            heading: 'Executive: cyber risk as fiduciary duty',
            body: 'EU NIS2 and NIST C-SCRM both make explicit what was previously implicit: cybersecurity is a board-level fiduciary responsibility. Executives should receive C-SCRM metrics quarterly, framed in business risk language: potential revenue exposure per day of TMS downtime, cargo liability from a load diversion incident, regulatory fine exposure under applicable frameworks, and customer trust impact from a data breach. These are not IT metrics — they are business risk metrics that belong in the same conversation as operational performance.',
          },
          {
            heading: 'Executive: tabletop exercises and compliance',
            body: 'Sponsor tabletop exercises simulating complete WMS/TMS downtime and ransomware negotiation scenarios. The goal is not to test technical staff — it is to test decision-making: who authorises paying a ransom, who approves manual operations mode, who communicates with customers during an incident. Budget for Zero Trust architecture migration: every access request verified regardless of network origin, with phishing-resistant MFA. Ensure compliance with applicable frameworks (TSA Directives for rail, IMO MSC.428 for maritime, NIS2 for EU operations) and assign a named compliance owner.',
          },
        ],
        keyPoints: [
          'Warehouse: three separate networks (guest, corporate IT, OT/robotics) — no cross-connectivity without firewall',
          'Physical-cyber alignment: locked server rooms, OT asset inventory, evidence-first incident response',
          'Executive: cybersecurity metrics translated to business risk language for board reporting',
          'Tabletop exercises test decision-making, not just technical response — include executive scenarios',
        ],
        relatedTopicIds: ['industrial-protocols-ics', 'transnational-frameworks', 'incident-response'],
      },
    ],
  },

  // ── Chapter 10 ────────────────────────────────────────────────────────────
  {
    id: 'advanced-defence',
    number: 10,
    label: 'Advanced Defence and Emerging Technologies',
    description: 'Zero Trust, AI-driven detection, software supply chain transparency, and blockchain lessons.',
    topics: [
      {
        id: 'zero-trust-ai-defence',
        label: 'Zero Trust Architecture and AI-Driven Threat Detection',
        tagline: 'Moving beyond perimeter security — verify every request, detect every anomaly.',
        intro: 'The logistics industry is shifting from perimeter-based security ("trust the internal network") toward continuous-validation architectures. Zero Trust and AI-driven detection are the two pillars of this shift. Both require investment, but both address the fundamental problem that perimeter security fails once a single credential is compromised.',
        sections: [
          {
            heading: 'Zero Trust architecture principles',
            body: 'Zero Trust discards the notion that internal network traffic can be trusted. Every access request — whether from a dispatcher accessing a TMS, an API fetching customs data, or an AGV communicating with a central server — must be authenticated and authorised based on strict role-based access controls (RBAC), contextual factors (device health, location, time), and MFA. The principle is "trust no one, verify everything." In logistics, this means that a compromised warehouse-picker account cannot pivot to finance systems, even if both are "inside" the same corporate network.',
          },
          {
            heading: 'AI and ML for operational threat detection',
            body: 'AI-driven security platforms act as force multipliers in logistics by continuously analysing large volumes of endpoint telemetry, telematics logs, and API requests to identify anomalous behavioural patterns. ML algorithms can detect contextual anomalies (TMS login from a foreign IP), collective anomalies (data exfiltration pattern preceding ransomware), and point anomalies (sudden API traffic spike) faster than human analysts. Automated threat response can isolate a compromised Warehouse Management System or lock down a network segment in milliseconds, drastically reducing the "dwell time" — the period between initial compromise and detection — that enables the most damaging attacks.',
          },
          {
            heading: 'Zero Trust for freight operations in practice',
            body: 'For a logistics operator, Zero Trust migration is incremental. Priority controls: phishing-resistant MFA on all email and TMS/WMS access (replaces implicit trust in a password); least-privilege access control (finance staff cannot access OT systems; warehouse staff cannot access payment systems); device health verification before granting access (an unpatched laptop should not access payment portals); and microsegmentation of the network so that a compromised workstation in dispatch cannot reach the accounts payable system. These controls reduce the blast radius of any single credential compromise.',
          },
          {
            heading: 'Limitations and practical considerations',
            body: 'Zero Trust is an architecture, not a product. "Zero Trust solutions" from vendors are components, not complete implementations. The most common implementation mistake is deploying MFA on external-facing systems while leaving internal systems on implicit trust — attackers who have already achieved an internal foothold are unimpeded. CISA CPGs 2.0 and NIST CSF 2.0 both emphasise that Zero Trust must be implemented comprehensively, including east-west network traffic (between internal systems), not only north-south (inbound external traffic).',
          },
        ],
        keyPoints: [
          'Zero Trust: every access request verified regardless of origin — no implicit internal trust',
          'AI/ML detection: contextual, collective, and point anomalies detected faster than manual review',
          'Zero Trust migration priority: phishing-resistant MFA + least privilege + network microsegmentation',
          'Zero Trust is an architecture, not a vendor product — must cover internal (east-west) traffic too',
        ],
        relatedTopicIds: ['identity-credential-security', 'transnational-frameworks', 'pre-incident-indicators'],
      },
      {
        id: 'software-supply-chain',
        label: 'Software Supply Chain Security and the Blockchain Lesson',
        tagline: 'SBOM, VEX, SLSA, the SolarWinds lesson, and why TradeLens failed.',
        intro: 'Modern logistics software is typically 70–90% third-party code. A compromise in any upstream dependency can propagate to all downstream users simultaneously — the SolarWinds attack demonstrated this at scale. Software supply chain security has matured rapidly in response, introducing new frameworks and transparency tools.',
        sections: [
          {
            heading: 'Software Bill of Materials (SBOM)',
            body: 'An SBOM is a machine-readable inventory of all third-party and open-source components embedded within an application — analogous to a food label for software. SBOM categories cover the full development lifecycle: Design, Source, Build, Analysed, Deployed, and Runtime SBOMs. Advanced logistics operators have extended this concept to Application Bill of Materials (ABOM) for APIs and microservices, Hardware Bill of Materials (HBOM) for IoT and telematics hardware components, and Configurable Bill of Materials (CBOM) for cloud infrastructure. The evolving CycloneDX standard provides a format for comprehensive SBOM tracking.',
          },
          {
            heading: 'VEX and SLSA — filtering noise, ensuring integrity',
            body: 'An SBOM produces a list of components, which produces a list of known vulnerabilities. VEX (Vulnerability Exploitability eXchange) provides contextual assertions about whether a listed vulnerability is actually reachable and exploitable in a specific operational environment — drastically reducing alert fatigue by distinguishing "theoretical vulnerability in an unused library" from "actively exploitable path in production code." SLSA (Supply-chain Levels for Software Artifacts) provides an incremental checklist for preventing code tampering and ensuring build provenance in DevSecOps pipelines — directly addressing the SolarWinds attack pattern.',
          },
          {
            heading: 'The SolarWinds lesson for logistics',
            body: 'The 2020 SUNBURST attack compromised SolarWinds\' Orion software build process, inserting malicious code into a legitimate software update distributed to 18,000+ organisations. Downstream targets included government agencies, logistics infrastructure operators, and critical infrastructure. The attack persisted undetected for months. The implication for logistics operators who use TMS, WMS, or telematics platforms from external vendors: supplier compromise is a real threat vector, vendor security posture should be assessed (SBOM availability, vulnerability disclosure programmes, patch cadence), and update processes should not automatically trust signed updates without independent hash verification.',
          },
          {
            heading: 'The TradeLens lesson: governance beats technology',
            body: 'TradeLens — IBM and Maersk\'s blockchain platform for maritime logistics — proved that cryptographic immutability could secure digital bills of lading and supply chain documents. It failed commercially in 2023 because it could not overcome a governance problem: competing ocean carriers (MSC, CMA CGM) were unwilling to join a platform governed by their rival Maersk. The lesson is not that blockchain failed — it is that technological superiority cannot overcome structural governance failures. Any shared logistics data platform, blockchain or otherwise, must prioritise decentralised governance, open standards, and equitable economic incentives.',
          },
        ],
        keyPoints: [
          'SBOM: machine-readable component inventory; VEX filters theoretical vs. real exploitability',
          'SLSA: build provenance framework — directly addresses the SolarWinds-style supply chain attack',
          'SolarWinds: automatic trust in signed updates is insufficient — independent hash verification required',
          'TradeLens: blockchain worked technically; failed because governance was unacceptable to competitors',
        ],
        relatedTopicIds: ['transnational-frameworks', 'apt-nation-state-actors', 'logistics-threat-overview'],
      },
    ],
  },

  // ── Chapter 11 ────────────────────────────────────────────────────────────
  {
    id: 'cyber-foundations',
    number: 11,
    label: 'Cyber Foundations for Logistics Teams',
    description: 'Network security, access control, and incident response fundamentals — explained through a logistics lens.',
    topics: [
      {
        id: 'network-security-fundamentals',
        label: 'Network Security Fundamentals',
        tagline: 'Segmentation, firewalls, VLANs, and why network architecture is your first line of defence.',
        intro: 'Network security is the practice of controlling who and what can communicate with what across your organisation\'s digital infrastructure. For logistics operators, network architecture directly determines whether a compromised laptop in dispatch can reach your payment systems, and whether a hacked IoT sensor in a warehouse can pivot to your TMS. Getting the basics right makes every other control more effective — and getting them wrong makes every other control irrelevant.',
        sections: [
          {
            heading: 'Why network segmentation matters in logistics',
            body: 'Segmentation divides your network into isolated zones so that a breach in one zone cannot freely move to others. In a flat (unsegmented) logistics network, a phishing attack on a dispatcher\'s laptop gives an attacker a direct path to the payment portal, TMS credentials, and warehouse control systems. With proper segmentation, that same compromised laptop is contained: it can reach email and shared drives, but not payment systems or operational technology. The key principle is "blast radius reduction" — limit how far damage can spread from any single point of failure.',
          },
          {
            heading: 'VLANs and network zones for warehouse operations',
            body: 'Virtual Local Area Networks (VLANs) allow a single physical network switch to carry multiple isolated logical networks. A well-designed warehouse network has at minimum three VLANs: the corporate IT network (workstations, email, TMS), the operational technology (OT) network (AGVs, conveyor controls, IoT sensors, ELDs), and the guest/visitor network (no corporate connectivity). Critically, these VLANs must be enforced by firewall rules at the layer where they connect — not just by VLAN tags, which can be bypassed if network equipment is misconfigured.',
          },
          {
            heading: 'Firewalls, proxies, and traffic inspection',
            body: 'A firewall is a policy enforcement point that permits or denies traffic based on rules — source, destination, port, and protocol. In logistics, the most important firewall boundaries are: between the public internet and internal systems, between corporate IT and OT networks, and between internal systems and cloud-based TMS/WMS platforms. A next-generation firewall (NGFW) also inspects the content of allowed traffic for known threat signatures. Web proxies add a logging and filtering layer for outbound internet requests, providing visibility into what data is leaving the network and blocking access to known-malicious destinations.',
          },
          {
            heading: 'Wireless security in fleet and depot environments',
            body: 'Wireless networks extend the attack surface beyond the building perimeter. In depot and yard environments, Wi-Fi networks must use WPA3 or WPA2-Enterprise (not WPA2-Personal with a shared passphrase that every driver and visitor knows). Fleet telematics and ELD devices that connect via cellular create an additional network boundary that must be managed: firmware must be kept current via authenticated OTA updates, and telematics management consoles must require MFA. GPS and cellular signal spoofing — relevant in port and border crossing environments — should be detected by comparing reported location against other data sources.',
          },
          {
            heading: 'Monitoring and visibility',
            body: 'You cannot defend what you cannot see. Network visibility starts with knowing what is on your network — an accurate asset inventory covering all workstations, servers, printers, IoT devices, AGVs, and telematics gateways. Anomaly-based detection identifies traffic that deviates from established baselines: a warehouse AGV suddenly making outbound internet connections, or a dispatch workstation communicating with a TMS server at 3am. Log retention is the foundation: retain network flow logs for a minimum of 90 days (NIST guidance) so that incident investigations can trace the full path of an attack.',
          },
        ],
        keyPoints: [
          'Segmentation limits blast radius: a compromised laptop must not reach payment systems or OT networks',
          'Three minimum VLANs: corporate IT, OT/robotics, guest — enforced by firewall rules, not just VLAN tags',
          'Firewalls at internet boundary, IT/OT boundary, and cloud service boundaries',
          'Wireless: WPA2-Enterprise or WPA3, not shared passphrases — and monitor for rogue access points',
        ],
        relatedTopicIds: ['attack-surfaces-ecosystem', 'zero-trust-ai-defence', 'industrial-protocols-ics'],
      },
      {
        id: 'access-control-least-privilege',
        label: 'Access Control and Least Privilege',
        tagline: 'Who should access what — and why minimising access rights is a core security control.',
        intro: 'Access control answers a simple question: who is allowed to do what, on which systems? The principle of least privilege — giving every user and system the minimum access needed to perform their function — is one of the highest-impact, lowest-cost security controls available to any logistics operator. It does not require expensive technology; it requires a deliberate decision-making process applied consistently.',
        sections: [
          {
            heading: 'Role-Based Access Control (RBAC) in practice',
            body: 'RBAC assigns permissions to roles, and roles to users — rather than assigning permissions directly to individual users. In a freight brokerage, example roles might be: Dispatcher (can create and assign loads, read rate confirmations, no payment access), Accounts Payable (can process payments, no load creation, no carrier onboarding), Carrier Relations (can onboard new carriers, read SAFER verification results, no payment access), and Administrator (full access, assigned only to named individuals who need it, reviewed quarterly). RBAC makes access changes manageable: when a dispatcher is promoted to operations manager, you change their role assignment rather than editing dozens of individual permissions.',
          },
          {
            heading: 'The principle of least privilege',
            body: 'Least privilege means every user account, service account, and automated process is granted only the permissions it needs to perform its specific function — nothing more. A TMS integration service account that uploads shipping documents has no business having write access to the user database. A driver-facing mobile app has no reason to access headquarters network resources. When least privilege is applied consistently, the compromise of any single credential produces limited damage: an attacker who steals a dispatcher\'s credentials cannot access payment systems, cannot access HR records, and cannot disable security controls.',
          },
          {
            heading: 'Multi-Factor Authentication as an access control layer',
            body: 'MFA requires a second form of identity verification in addition to a password — typically a time-based one-time code (TOTP), a hardware security key (FIDO2/WebAuthn), or a push notification to a verified device. For logistics systems, MFA priority order is: (1) email accounts (highest value target for BEC), (2) TMS and WMS portals (operational critical), (3) payment systems and banking, (4) remote access / VPN. Phishing-resistant MFA (FIDO2 hardware keys or passkeys) provides stronger protection than TOTP codes, which can be intercepted by real-time phishing proxies. CISA guidance recommends phishing-resistant MFA for all high-value accounts.',
          },
          {
            heading: 'Access reviews and offboarding',
            body: 'Access rights accumulate over time as users change roles, join projects, and leave the organisation — without anyone removing the access they no longer need. Quarterly access reviews — where managers confirm that each team member\'s access rights match their current role — are the primary control against privilege accumulation. Offboarding is the critical moment: when an employee leaves, all system access must be revoked before the final day, not after. Shared credentials (team mailboxes, shared admin accounts) should be rotated immediately when any individual with access leaves. CISA data shows that a significant fraction of breaches involve credentials belonging to former employees.',
          },
          {
            heading: 'Service accounts and API keys',
            body: 'Service accounts — automated accounts used by software to access systems — are frequently neglected and overprivileged. A TMS-to-WMS integration should use a dedicated service account with only the permissions that integration requires: read inventory, write shipment events. It should not share credentials with any human user, and its credentials should be rotated on a schedule. API keys follow the same principle: each integration or application receives its own key with the minimum required scope, key usage is logged, and unused keys are revoked. A leaked API key with broad permissions is equivalent to a leaked admin password.',
          },
        ],
        keyPoints: [
          'RBAC: assign permissions to roles, roles to users — never assign permissions directly to individuals',
          'Least privilege: every account gets only what it needs — limiting any single compromise\'s blast radius',
          'MFA priority: email first, then TMS/WMS, then payments — phishing-resistant MFA for high-value accounts',
          'Offboarding is critical: revoke all access before the final day, rotate shared credentials immediately',
        ],
        relatedTopicIds: ['identity-credential-security', 'zero-trust-ai-defence', 'bec-payment-security'],
      },
      {
        id: 'incident-response-basics',
        label: 'Incident Response: The First 24 Hours',
        tagline: 'Contain, communicate, and document — what to do when something goes wrong.',
        intro: 'Incident response is the organised approach to addressing and managing a security breach or cyberattack. In logistics operations where downtime translates directly to revenue loss and customer trust damage, having a pre-planned, rehearsed response capability is as important as any preventive control. Most organisations that suffer serious damage from a breach do so not because they were attacked, but because they did not know what to do in the first hours after detection.',
        sections: [
          {
            heading: 'The five phases of incident response',
            body: 'The NIST incident response lifecycle organises the response into five phases: Preparation (policies, procedures, team assignments, tooling — done before any incident), Detection and Analysis (identifying that an incident is occurring and understanding its scope), Containment (stopping the spread of damage without destroying forensic evidence), Eradication and Recovery (removing the threat and restoring systems to a known-good state), and Post-Incident Activity (root cause analysis, lessons learned, process improvement). For logistics operators, Containment is often the most time-critical phase — a ransomware infection spreading across a network doubles its damage every 15–30 minutes if not contained.',
          },
          {
            heading: 'Detection: knowing something is wrong',
            body: 'Incidents are detected through multiple channels: automated alerts from endpoint detection tools, anomaly detection in network monitoring, user reports ("I can\'t access my files," "I received a suspicious email"), and external notifications (law enforcement, partner companies, customers). The first 15 minutes after a potential incident is detected are the most important: the responder must make a rapid triage decision — is this a real incident or a false alarm? If uncertain, treat it as real and escalate. The cost of an unnecessary escalation is minor; the cost of a real incident treated as a false alarm compounds every minute.',
          },
          {
            heading: 'Containment: stop the spread, preserve evidence',
            body: 'Containment means isolating affected systems to prevent the attack from spreading, while preserving the forensic evidence needed to understand what happened. For ransomware: disconnect affected systems from the network (physically unplug if remote access is compromised), do not power them off (memory contains forensic evidence), do not run antivirus scans that will overwrite malware artefacts. For a compromised email account: revoke active sessions, reset credentials, enable MFA before restoring access — but capture the full email logs first. For a suspected load diversion via carrier impersonation: freeze any pending payments to the suspected carrier while verification is completed.',
          },
          {
            heading: 'Communication during an incident',
            body: 'Communication is the most underestimated aspect of incident response. Internal communication must follow a pre-designated chain: the responder notifies the incident commander, who notifies the executive team and legal counsel. Critically, do NOT use potentially-compromised communication channels (company email, collaboration platforms on affected networks) to discuss the incident — use out-of-band channels (personal mobile, a separate communication platform). External communication — to customers, partners, regulators, and media — must be coordinated through legal and executive leadership, and must meet regulatory notification timelines (NIS2: 72 hours; various US state breach notification laws: 30–72 hours depending on jurisdiction).',
          },
          {
            heading: 'Documentation and post-incident review',
            body: 'Document every action taken during the incident in a timestamped incident log — this is both a legal record and the foundation for the post-incident review. After recovery, conduct a structured review: What was the initial access vector? How long was the attacker present before detection? Which controls failed, and why? What controls would have prevented or limited the damage? The post-incident review is not a blame exercise — it is the primary mechanism for improving the organisation\'s security posture based on real operational data. NIST recommends reviewing and updating incident response procedures after every significant incident.',
          },
        ],
        keyPoints: [
          'Five phases: Preparation, Detection, Containment, Eradication/Recovery, Post-Incident — in that order',
          'Containment: isolate affected systems from the network; do NOT power off — memory contains evidence',
          'Out-of-band communication during incidents: do not use potentially-compromised company channels',
          'Post-incident review is mandatory: identify the access vector, detection gap, and control failures',
        ],
        relatedTopicIds: ['pre-incident-indicators', 'logistics-threat-overview', 'playbook-warehouse-executive'],
      },
    ],
  },

  // ── Chapter 12 ────────────────────────────────────────────────────────────
  {
    id: 'reference',
    number: 12,
    label: 'Standards, Frameworks, and Reference',
    description: 'NIST CSF, ISO 27001, CIS Controls, and the full logistics cybersecurity glossary.',
    topics: [
      {
        id: 'standards-frameworks',
        label: 'Standards and Frameworks Reference',
        tagline: 'NIST CSF 2.0, SP 800-53, SP 800-82, CIS Controls, ISO 27001/28000 — the framework landscape.',
        intro: 'Cybersecurity frameworks provide a common language for describing, assessing, and communicating risk management. For logistics operators, the most relevant frameworks are flexible enough to apply to diverse organisation sizes, address supply-chain and OT risk explicitly, and translate into operational controls. This section summarises the key frameworks and how they relate to logistics operations.',
        sections: [
          {
            heading: 'NIST Cybersecurity Framework (CSF) 2.0',
            body: 'NIST CSF 2.0 organises cybersecurity outcomes into six functions: Govern (new in 2.0), Identify, Protect, Detect, Respond, and Recover. It is explicitly not prescriptive — it does not mandate a single implementation path. For logistics, the CSF is most valuable as a communication tool: shared vocabulary for internal risk conversations and for external conversations with customers, carriers, and insurance carriers. The new Govern function elevates cybersecurity strategy, oversight, and supply chain risk management to the same level as the technical functions.',
          },
          {
            heading: 'NIST SP 800-53 Rev. 5 and SP 800-82 Rev. 3',
            body: 'SP 800-53 provides the comprehensive security and privacy control catalog — the reference for "what controls should we implement?" It is typically used with the CSF and SP 800-161 as the control library. SP 800-82 covers Operational Technology security, addressing the unique reliability, safety, and real-time constraints of ICS, SCADA, and DCS systems in warehouse and terminal environments. SP 800-82 is directly applicable to any logistics operator with automated sortation, cold-chain controls, access control systems, or warehouse robotics.',
          },
          {
            heading: 'CIS Controls v8.1',
            body: 'CIS Controls v8.1 provides a prescriptive, prioritised control set organised into Implementation Groups (IG1 through IG3). IG1 is the "essential cyber hygiene" tier — a minimal baseline appropriate for any organisation, including small logistics operators. IG2 adds controls for organisations managing sensitive data or critical operations. CIS Controls v8.1 explicitly aligns to the NIST CSF 2.0 "Govern" function, making it a practical implementation path for organisations that find the CSF\'s flexibility overwhelming. For logistics operators asking "where do we start?", IG1 is the answer.',
          },
          {
            heading: 'ISO/IEC 27001 and ISO 28000',
            body: 'ISO/IEC 27001 specifies requirements for an Information Security Management System (ISMS) — a management-system approach to continuously managing information security risk, with defined Plan-Do-Check-Act cycles and regular management review. ISO 28000 specifies requirements for Security Management Systems specifically tied to supply chain security assurance. For logistics operators with international trading partners or enterprise customer security requirements, ISO 27001 certification provides a recognised, third-party audited signal of security management maturity. ISO 28000 aligns that signal specifically to supply chain security.',
          },
        ],
        keyPoints: [
          'NIST CSF 2.0: six functions including the new Govern function for strategy and supply chain oversight',
          'SP 800-53: detailed control catalog; SP 800-82: OT-specific controls for warehouse/terminal environments',
          'CIS Controls IG1: essential cyber hygiene — the practical starting point for any logistics operator',
          'ISO 27001/28000: internationally recognised management system standards for ISMS and supply chain security',
        ],
        relatedTopicIds: ['transnational-frameworks', 'maritime-rail-regulations', 'logistics-threat-overview'],
      },
      {
        id: 'glossary-acronyms',
        label: 'Glossary and Key Acronyms',
        tagline: 'Definitions for the terms, standards, protocols, and acronyms used across logistics cybersecurity.',
        intro: 'Logistics cybersecurity uses vocabulary from both the freight industry and the information security field. This reference covers the terms most commonly encountered across training material, regulatory guidance, and security frameworks — with context for how each term applies to logistics operations specifically.',
        sections: [
          {
            heading: 'Threat types and attack patterns',
            body: 'APT (Advanced Persistent Threat): sophisticated, often state-sponsored threat actor maintaining long-term undetected access. BEC (Business Email Compromise): impersonation via email to redirect payments or extract data. Phishing: email-based social engineering to steal credentials or deliver malware. Spear-phishing: targeted phishing using personalised information about the recipient. Smishing: SMS-based phishing. Vishing: voice/phone-based social engineering. Ransomware: malware that encrypts or exfiltrates data and demands payment. Double brokering: re-tendering a load to a second carrier without the shipper\'s knowledge. IoC (Indicator of Compromise): forensic artifact (IP address, file hash, behaviour pattern) indicating potential intrusion.',
          },
          {
            heading: 'Identity, authentication, and access control',
            body: 'MFA (Multi-Factor Authentication): authentication requiring two or more independent factors. IAL (Identity Assurance Level): NIST SP 800-63 category for identity proofing strength. AAL (Authentication Assurance Level): NIST SP 800-63 category for authentication strength. RBAC (Role-Based Access Control): access restriction based on user role, enforcing least privilege. Zero Trust: architecture requiring continuous verification of every access request regardless of network origin. USDOT number: unique identifier for carriers and brokers, verifiable via FMCSA SAFER. SAFER (Safety and Fitness Electronic Records): FMCSA public registry for carrier and broker verification.',
          },
          {
            heading: 'Email and network security protocols',
            body: 'SPF (Sender Policy Framework, RFC 7208): domain authorises sending servers. DKIM (DomainKeys Identified Mail, RFC 6376): cryptographic message signature. DMARC (Domain-based Message Authentication, Reporting, and Conformance, RFC 7489): policy layer on SPF/DKIM with reporting. MTA-STS (MTA Strict Transport Security, RFC 8461): enforces TLS on inbound SMTP. TLS (Transport Layer Security): cryptographic protocol for network communication. PKI (Public Key Infrastructure): certificate management for mutual authentication. DSV (Digital Signature Verification): process of verifying a message signature using the sender\'s public key. MQTT (Message Queuing Telemetry Transport): lightweight IoT messaging protocol.',
          },
          {
            heading: 'Logistics and operational technology terms',
            body: 'TMS (Transportation Management System): freight operations platform. WMS (Warehouse Management System): warehouse inventory and fulfilment platform. EDI (Electronic Data Interchange): standardised B2B document exchange. ELD (Electronic Logging Device): connected device recording hours-of-service compliance data. BoL (Bill of Lading): shipping contract and goods receipt document. POD (Proof of Delivery): delivery confirmation document or electronic record. AGV (Automated Guided Vehicle): warehouse robot navigating via programmed routes. AMR (Autonomous Mobile Robot): warehouse robot with real-time path planning. TCU (Telematics Control Unit): vehicle gateway between CAN bus and cloud. OTA (Over-The-Air): remote firmware/software update delivery. CAN (Controller Area Network): vehicle internal network bus. SAE J1939: CAN-based protocol for commercial vehicle ECU communication. ICS (Industrial Control System): control systems for physical processes. SCADA (Supervisory Control and Data Acquisition): industrial monitoring and control platform. Modbus TCP / Profinet: Industrial Ethernet protocols used in warehouse and distribution automation.',
          },
          {
            heading: 'Frameworks, standards, and regulatory acronyms',
            body: 'NIST (National Institute of Standards and Technology): U.S. federal standards agency. CSF (Cybersecurity Framework): NIST\'s flexible risk management taxonomy. ISMS (Information Security Management System): ISO/IEC 27001 management framework. C-SCRM (Cybersecurity Supply Chain Risk Management): NIST SP 800-161r1. SBOM (Software Bill of Materials): machine-readable software component inventory. VEX (Vulnerability Exploitability eXchange): contextual exploitability assertion protocol. SLSA (Supply-chain Levels for Software Artifacts): build provenance and integrity framework. TARA (Threat Analysis and Risk Assessment): ISO/SAE 21434 vehicle lifecycle methodology. CSMS (Cyber Security Management System): UNECE R155 requirement. SUMS (Software Update Management System): UNECE R156 requirement. CISA (Cybersecurity and Infrastructure Security Agency): U.S. cyber agency. IC3 (Internet Crime Complaint Center): FBI cybercrime reporting portal. ENISA (EU Agency for Cybersecurity): European counterpart to CISA. FMCSA (Federal Motor Carrier Safety Administration): U.S. carrier/broker regulator. IMO (International Maritime Organization): UN shipping safety body. IAPH (International Association of Ports and Harbors): port industry body. TSA (Transportation Security Administration): U.S. transport security agency. EASA (European Union Aviation Safety Agency): EU aviation regulator. NIS2: EU Network and Information Systems Directive v2.',
          },
        ],
        keyPoints: [
          'BEC, phishing, ransomware, double brokering, APT: the core logistics attack vocabulary',
          'SPF + DKIM + DMARC: layered email authentication — all three together for full coverage',
          'TMS, WMS, EDI, ELD, AGV, TCU: the operational technology that creates the logistics attack surface',
          'SAFER (free, public): authoritative carrier/broker identity verification — use it before every new tender',
        ],
        relatedTopicIds: ['email-authentication', 'logistics-threat-overview', 'standards-frameworks'],
      },
    ],
  },
];

// Flat lookup by topic ID
export function findTopic(topicId: string): { topic: StudyTopic; chapter: StudyChapter } | null {
  for (const chapter of STUDY_CHAPTERS) {
    const topic = chapter.topics.find(t => t.id === topicId);
    if (topic) return { topic, chapter };
  }
  return null;
}
