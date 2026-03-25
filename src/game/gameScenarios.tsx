import React, { ReactNode } from "react";
import { Target, Lock, Users, Skull, Database, Mail, AlertTriangle, Shuffle } from "lucide-react";

// ============================================================
// TYPES & INTERFACES
// ============================================================

export type Category =
  | "phishing"
  | "password"
  | "social-engineering"
  | "ransomware"
  | "data-breach"
  | "email-security"
  | "incident-response"
  | "mixed";

export interface Scenario {
  id: number;
  category: Category;
  title: string;
  situation: string;
  question: string;
  options: { text: string; correct: boolean; feedback: string }[];
  difficulty: "beginner" | "intermediate" | "advanced";
  points: number;
  impact?: number; // Financial cost in USD if ignored or failed
  isCustom?: boolean; // For Prophet Injects (AI-generated)
}

export interface PowerUp {
  id: string;
  name: string;
  icon: string;
  description: string;
  used: boolean;
}

export interface Player {
  id: number;
  name: string;
  color: string;
  position: number;
  score: number;
  budget: number; // Company funds starting at $1M
  streak: number;
  powerUps: PowerUp[];
}

export interface GameState {
  currentPlayer: number;
  players: Player[];
  isRolling: boolean;
  diceValue: number | null;
  showScenario: boolean;
  currentScenario: Scenario | null;
  selectedAnswer: number | null;
  showFeedback: boolean;
  gameOver: boolean;
  winner: Player | null;
  turnPhase: "roll" | "moving" | "scenario" | "feedback";
  hiddenOptions: number[];
  timerFrozen: boolean;
  doublePoints: boolean;
  timeRemaining: number;
}

// ============================================================
// CONSTANTS
// ============================================================

export const QUESTION_TIME = 30;

export const DEFAULT_POWERUPS: PowerUp[] = [
  {
    id: "fifty-fifty",
    name: "50/50",
    icon: "✂️",
    description: "Remove two wrong answers",
    used: false,
  },
  {
    id: "time-freeze",
    name: "Time Freeze",
    icon: "❄️",
    description: "Stop the timer",
    used: false,
  },
  {
    id: "double-points",
    name: "Double Points",
    icon: "✨",
    description: "Double points this question",
    used: false,
  },
];

export const SECURITY_CATEGORIES: Record<
  Category,
  {
    name: string;
    shortName: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    icon: string;
  }
> = {
  phishing: {
    name: 'Phishing',
    shortName: 'PHI',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    description: 'Email & messaging attacks',
    icon: '🎣',
  },
  password: {
    name: 'Password Security',
    shortName: 'PWD',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    description: 'Credentials & authentication',
    icon: '🔐',
  },
  'social-engineering': {
    name: 'Social Engineering',
    shortName: 'SOC',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    description: 'Human manipulation tactics',
    icon: '🎭',
  },
  ransomware: {
    name: 'Ransomware',
    shortName: 'RAN',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    description: 'Malware & encryption attacks',
    icon: '💀',
  },
  'data-breach': {
    name: 'Data Breach',
    shortName: 'DAT',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50',
    description: 'Data protection & response',
    icon: '📊',
  },
  'email-security': {
    name: 'Email Security',
    shortName: 'EML',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/50',
    description: 'SPF, DKIM, DMARC protocols',
    icon: '📧',
  },
  'incident-response': {
    name: 'Incident Response',
    shortName: 'INC',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    description: 'Detection & response procedures',
    icon: '🚨',
  },
  mixed: {
    name: 'Mixed Challenge',
    shortName: 'MIX',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/50',
    description: 'Multi-category scenarios',
    icon: '🎯',
  },
};

export const CategoryIcons: Record<string, ReactNode> = {
  phishing: <Target className='w-5 h-5' />,
  password: <Lock className='w-5 h-5' />,
  'social-engineering': <Users className='w-5 h-5' />,
  ransomware: <Skull className='w-5 h-5' />,
  'data-breach': <Database className='w-5 h-5' />,
  'email-security': <Mail className='w-5 h-5' />,
  'incident-response': <AlertTriangle className='w-5 h-5' />,
  mixed: <Shuffle className='w-5 h-5' />,
};

export const CATEGORY_DEFINITIONS: Record<
  Category,
  { definition: string; examples: string[]; tips: string[] }
> = {
  phishing: {
    definition: "Phishing is a cyberattack where criminals impersonate trusted entities via email, text, or fake websites to trick victims into revealing sensitive information.",
    examples: ["Fake bank emails", "Prize claims", "Urgent IT requests"],
    tips: ["Check sender domains", "Hover links", "Verify directly"],
  },
  password: {
    definition: "Password security involves creating and protecting credentials to prevent unauthorized access. Weak passwords are a leading cause of breaches.",
    examples: ["Reused passwords", "Weak patterns", "Sticky notes"],
    tips: ["12+ characters", "Never reuse", "Use password managers"],
  },
  "social-engineering": {
    definition: "Social engineering manipulates people into breaking security procedures. Attackers exploit human psychology rather than technical flaws.",
    examples: ["Pretending to be IT", "Tailgating", "Pretexting"],
    tips: ["Verify identity", "Follow procedures", "Report suspicion"],
  },
  ransomware: {
    definition: "Ransomware encrypts files and demands payment. It spreads through phishing, malicious downloads, or vulnerabilities.",
    examples: ["Files encrypted", "Ransom note", "Bitcoin demands"],
    tips: ["Offline backups", "Never pay", "Report immediately"],
  },
  "data-breach": {
    definition: "A data breach occurs when sensitive data is exposed to unauthorized users through hacking, insiders, or accidents.",
    examples: ["Stolen customer records", "Accidental emails", "Lost unencrypted gear"],
    tips: ["Encrypt data", "Least privilege", "Have an IR plan"],
  },
  "email-security": {
    definition: "Email security protocols (SPF, DKIM, DMARC) authenticate senders and prevent spoofing by verifying sources in DNS.",
    examples: ["SPF records", "DKIM signatures", "DMARC policies"],
    tips: ["Use all three", "Monitor reports", "Audit sources"],
  },
  "incident-response": {
    definition: "Incident response is a structured approach to managing security events to limit damage and reduce recovery time.",
    examples: ["Intrusion detection", "Containment", "Forensics"],
    tips: ["Have an IR plan", "Know contacts", "Preserve evidence"],
  },
  mixed: {
    definition: "Mixed challenges combine multiple concepts, testing your ability to handle complex multi-vector scenarios.",
    examples: ["Phishing that leads to ransomware", "Social engineering bypassing MFA"],
    tips: ["Think holistically", "Layered defense", "Stay alert"],
  },
};

export const TEAM_OPTIONS = [
  { name: "Blue Team", color: "bg-blue-500" },
  { name: "Red Team", color: "bg-orange-500" },
  { name: "Green Team", color: "bg-emerald-500" },
  { name: "Purple Team", color: "bg-purple-500" },
];

const getCategorySpace = (cat: Category) => ({
  type: cat,
  label: SECURITY_CATEGORIES[cat].shortName,
  color: `${SECURITY_CATEGORIES[cat].bgColor} ${SECURITY_CATEGORIES[cat].borderColor} border`,
});

export const boardSpaces = [
  { type: "start", label: "GO", color: "bg-green-500/30 border border-green-500/50" },
  getCategorySpace("phishing"),
  getCategorySpace("password"),
  getCategorySpace("social-engineering"),
  { type: "bonus", label: "+5", color: "bg-yellow-500/30 border border-yellow-500/50" },
  getCategorySpace("ransomware"),
  getCategorySpace("data-breach"),
  getCategorySpace("email-security"),
  getCategorySpace("mixed"),
  { type: "skip", label: "SKIP", color: "bg-gray-500/30 border border-gray-500/50" },
  getCategorySpace("incident-response"),
  getCategorySpace("phishing"),
  getCategorySpace("password"),
  { type: "bonus", label: "+5", color: "bg-yellow-500/30 border border-yellow-500/50" },
  getCategorySpace("social-engineering"),
  getCategorySpace("ransomware"),
  getCategorySpace("mixed"),
  getCategorySpace("data-breach"),
  getCategorySpace("email-security"),
  { type: "finish", label: "WIN", color: "bg-yellow-500/40 border border-yellow-400" },
];

export const scenarios: Scenario[] = [
  // ============================================================
  // PHISHING SCENARIOS (10)
  // ============================================================
  {
    id: 1,
    category: "phishing",
    title: "Suspicious Email Alert",
    situation:
      'You receive an urgent email from "IT-Support@company-secure.net" stating your password expires in 24 hours. The email contains a link to reset your password.',
    question: "What is your FIRST action?",
    options: [
      {
        text: "Click the link immediately to avoid losing access",
        correct: false,
        feedback:
          "Never click links in unsolicited emails. This is a classic phishing tactic using urgency.",
      },
      {
        text: "Check the sender domain - it doesnt match your company",
        correct: true,
        feedback:
          'Correct! The domain "company-secure.net" is suspicious. Legitimate IT uses your actual company domain.',
      },
      {
        text: "Forward it to all colleagues as a warning",
        correct: false,
        feedback:
          "Do not forward suspicious emails - this spreads the threat. Report to IT security instead.",
      },
      {
        text: "Reply asking if this is legitimate",
        correct: false,
        feedback:
          "Never reply to suspicious emails - this confirms your email is active to attackers.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 2,
    category: "phishing",
    title: "CEO Wire Transfer Request",
    situation:
      'You receive an email appearing to be from your CEO requesting an urgent wire transfer of $50,000 to a new vendor. The CEO is traveling and "cant be reached by phone."',
    question: "How should you handle this request?",
    options: [
      {
        text: "Process it quickly since the CEO is traveling",
        correct: false,
        feedback:
          "This is Business Email Compromise (BEC). Urgency and inability to verify are red flags.",
      },
      {
        text: "Verify through a separate channel like calling the CEOs known number",
        correct: true,
        feedback:
          "Correct! Always verify unusual financial requests through a separate, known communication channel.",
      },
      {
        text: "Email back to confirm the account details",
        correct: false,
        feedback:
          "The attacker controls the email - they will confirm their own fraudulent details.",
      },
      {
        text: "Ask a colleague what they think",
        correct: false,
        feedback:
          "While consultation is good, proper protocol requires verification with the requester through known channels.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 3,
    category: "phishing",
    title: "Package Delivery Notice",
    situation:
      'You receive a text message: "UPS: Your package could not be delivered. Click here to reschedule: bit.ly/ups-reschedule-7742"',
    question:
      "What indicates this is likely a smishing (SMS phishing) attempt?",
    options: [
      {
        text: "UPS doesnt use shortened URLs in official communications",
        correct: true,
        feedback:
          "Correct! Legitimate delivery services use their official domains, not URL shorteners which hide the true destination.",
      },
      {
        text: "The message is too short",
        correct: false,
        feedback:
          "Message length alone doesnt indicate phishing - the suspicious URL is the key indicator.",
      },
      {
        text: "You didnt order anything",
        correct: false,
        feedback:
          'Even if you did order something, shortened URLs from "delivery services" are suspicious.',
      },
      {
        text: "Its a text message not an email",
        correct: false,
        feedback:
          "Phishing can occur through any channel - SMS, email, social media, or phone calls.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 21,
    category: "phishing",
    title: "LinkedIn Connection Trap",
    situation:
      'You receive a LinkedIn message from a recruiter at a major tech company offering a dream job. They ask you to click a link to "complete your application" on an external site.',
    question: "What should concern you about this message?",
    options: [
      {
        text: "Legitimate recruiters conduct initial conversations on LinkedIn, not external links",
        correct: true,
        feedback:
          'Correct! Real recruiters build rapport on LinkedIn first. External links for "applications" are often credential harvesting.',
      },
      {
        text: "The job sounds too good - all offers on LinkedIn are fake",
        correct: false,
        feedback:
          "Many legitimate jobs come through LinkedIn. The issue is the external link, not the platform.",
      },
      {
        text: "Recruiters never use LinkedIn for hiring",
        correct: false,
        feedback:
          "LinkedIn is commonly used for recruiting. The red flag is directing you to external sites immediately.",
      },
      {
        text: "Nothing wrong - this is normal recruiting behavior",
        correct: false,
        feedback:
          "Legitimate recruiters typically discuss opportunities on LinkedIn before moving to external systems.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 22,
    category: "phishing",
    title: "Fake Microsoft 365 Login",
    situation:
      'You click a link in an email to view a "shared document" and are presented with a Microsoft 365 login page. The URL shows: login.microsoftonline-secure.com',
    question: "Is this login page legitimate?",
    options: [
      {
        text: "No - the legitimate Microsoft domain is microsoftonline.com, not microsoftonline-secure.com",
        correct: true,
        feedback:
          'Correct! Attackers add words like "secure" or "login" to domains. Real Microsoft uses login.microsoftonline.com.',
      },
      {
        text: 'Yes - it has "microsoftonline" in the URL',
        correct: false,
        feedback:
          "The domain is microsoftonline-SECURE.com - a completely different domain owned by attackers.",
      },
      {
        text: "Yes - it looks exactly like the Microsoft login page",
        correct: false,
        feedback:
          "Phishing pages are designed to look identical. Always verify the URL, not the appearance.",
      },
      {
        text: "It doesnt matter since you have MFA enabled",
        correct: false,
        feedback:
          "Sophisticated phishing can capture and replay MFA codes in real-time. URL verification is still critical.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 23,
    category: "phishing",
    title: "Vendor Invoice Scam",
    situation:
      "Your accounts payable department receives an email from a known vendor stating their bank account has changed. They request updating payment information for future invoices.",
    question: "What is the correct procedure?",
    options: [
      {
        text: "Update the account since the email is from a known vendor",
        correct: false,
        feedback:
          "Vendor impersonation is common. Never update banking details based solely on email requests.",
      },
      {
        text: "Call the vendor using the phone number in your records (not from the email) to verify",
        correct: true,
        feedback:
          "Correct! Always verify banking changes through previously established contact methods, never info from the request itself.",
      },
      {
        text: "Ask them to send the request on company letterhead",
        correct: false,
        feedback:
          "Letterhead can be easily forged. Phone verification using known numbers is required.",
      },
      {
        text: "Process it but set a reminder to verify next month",
        correct: false,
        feedback:
          "Verification must happen BEFORE any changes. Delayed verification means money already sent to attackers.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 24,
    category: "phishing",
    title: "QR Code Phishing",
    situation:
      "You see a flyer in the break room with a QR code offering free coffee at a local shop. A colleague scanned it and was asked to enter their employee email to claim the offer.",
    question: "What is the risk here?",
    options: [
      {
        text: "QR codes can lead to credential phishing sites just like malicious links",
        correct: true,
        feedback:
          "Correct! QR codes are just another delivery mechanism for malicious URLs. Never enter credentials after scanning unknown QR codes.",
      },
      {
        text: "No risk - QR codes are always safe",
        correct: false,
        feedback:
          "QR codes can link to any URL, including phishing sites. Treat them with same caution as email links.",
      },
      {
        text: "The risk is only the free coffee might be low quality",
        correct: false,
        feedback:
          "The real risk is credential theft. Entering work email on unknown sites exposes your account.",
      },
      {
        text: "QR codes cant contain malicious content",
        correct: false,
        feedback:
          "QR codes can link to malware downloads, phishing pages, or malicious sites just like any URL.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 25,
    category: "phishing",
    title: "Charity Scam During Crisis",
    situation:
      'After a major natural disaster, you receive emails from "Red-Cross-Emergency-Relief@gmail.com" requesting donations. The email has compelling images and urgent language.',
    question: "What indicates this may be fraudulent?",
    options: [
      {
        text: "Legitimate charities use official domains, not free email services like Gmail",
        correct: true,
        feedback:
          "Correct! Red Cross would use redcross.org, not Gmail. Scammers exploit disasters with fake charity appeals.",
      },
      {
        text: "Charities never send email requests",
        correct: false,
        feedback:
          "Charities do send emails, but from official domains. The Gmail address is the red flag.",
      },
      {
        text: "The images prove its legitimate",
        correct: false,
        feedback:
          "Images are easily copied from legitimate sources. They prove nothing about authenticity.",
      },
      {
        text: "Urgent language is normal for disaster relief",
        correct: false,
        feedback:
          "While urgency is common, combined with a non-official domain, this indicates a scam.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 26,
    category: "phishing",
    title: "Spear Phishing Recognition",
    situation:
      "You receive an email referencing a project you are working on, mentioning your managers name, and asking you to review an attached document. The sender claims to be from a partner company.",
    question: "Why is this more dangerous than generic phishing?",
    options: [
      {
        text: "Personalized details make it harder to recognize as phishing",
        correct: true,
        feedback:
          "Correct! Spear phishing uses researched details to build trust. Always verify unexpected attachments regardless of personalization.",
      },
      {
        text: "It is not more dangerous - all phishing is the same",
        correct: false,
        feedback:
          "Spear phishing has much higher success rates because personalization bypasses suspicion.",
      },
      {
        text: "Using your managers name proves its legitimate",
        correct: false,
        feedback:
          "Names are easily found on LinkedIn, company websites, or previous breaches. Personalization proves nothing.",
      },
      {
        text: "Partner companies never send suspicious emails",
        correct: false,
        feedback:
          "Attackers specifically target known business relationships to exploit trust.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 27,
    category: "phishing",
    title: "Voicemail Phishing (Vishing)",
    situation:
      "You receive a voicemail claiming to be from your bank. It says your account is compromised and you must call back immediately at the number provided to verify your identity.",
    question: "What is the safest response?",
    options: [
      {
        text: "Call the number provided since it sounds urgent",
        correct: false,
        feedback:
          "The provided number connects to scammers. Never use contact info from unsolicited messages.",
      },
      {
        text: "Look up your banks official number and call that instead",
        correct: true,
        feedback:
          "Correct! Always use contact information you independently verify, never info from the suspicious message itself.",
      },
      {
        text: "Text the number to see if its real",
        correct: false,
        feedback:
          "Any contact with scammer-provided numbers puts you at risk. Use official channels only.",
      },
      {
        text: "Wait for them to call back",
        correct: false,
        feedback:
          "This doesnt address the potential threat. Verify through official channels if you have concerns about your account.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },

  // ============================================================
  // PASSWORD SECURITY SCENARIOS (10)
  // ============================================================
  {
    id: 4,
    category: "password",
    title: "Password Storage Discovery",
    situation:
      'During a team meeting, you notice a colleague has a sticky note on their monitor with "Banking: Summer2024!" written on it.',
    question: "What is the most appropriate response?",
    options: [
      {
        text: "Ignore it - its not your responsibility",
        correct: false,
        feedback:
          "Security is everyones responsibility. This creates risk for the entire organization.",
      },
      {
        text: "Privately suggest they use a password manager instead",
        correct: true,
        feedback:
          "Correct! A private, helpful conversation addresses the risk without embarrassing them publicly.",
      },
      {
        text: "Report them to HR immediately",
        correct: false,
        feedback:
          "Education first. Escalate only if the behavior continues after coaching.",
      },
      {
        text: "Take a photo as evidence",
        correct: false,
        feedback:
          "This violates their privacy and trust. Direct conversation is the appropriate first step.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 5,
    category: "password",
    title: "Credential Sharing Request",
    situation:
      'Your manager is out sick and their assistant asks for your managers login credentials to access an urgent report. "They always share it with me when needed."',
    question: "What should you do?",
    options: [
      {
        text: "Share the credentials since its urgent and the assistant is trusted",
        correct: false,
        feedback:
          "Never share credentials. Each person should have their own access based on their role.",
      },
      {
        text: "Refuse and suggest they contact IT for temporary access",
        correct: true,
        feedback:
          "Correct! IT can provide legitimate temporary access or delegate permissions properly.",
      },
      {
        text: "Ask the manager via text if its okay to share",
        correct: false,
        feedback:
          "Credentials should never be shared, even with manager approval. This violates security policy.",
      },
      {
        text: "Share it but change the password afterward",
        correct: false,
        feedback:
          "Sharing credentials is never appropriate. The assistant should have proper access configured.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 6,
    category: "password",
    title: "Password Breach Notification",
    situation:
      'You receive a legitimate alert from HaveIBeenPwned that your work email was found in a data breach. The compromised password was "Company2023!" which you use for multiple work systems.',
    question: "What is your IMMEDIATE priority?",
    options: [
      {
        text: "Wait until IT sends official guidance",
        correct: false,
        feedback:
          "Do not wait - credential compromise requires immediate action to prevent unauthorized access.",
      },
      {
        text: "Change passwords on ALL systems where you used this password",
        correct: true,
        feedback:
          "Correct! Password reuse means one breach compromises multiple systems. Change all immediately and use unique passwords.",
      },
      {
        text: "Just change your email password",
        correct: false,
        feedback:
          "If you reused this password, ALL those systems are now vulnerable. Change them all.",
      },
      {
        text: "Delete the notification - its probably spam",
        correct: false,
        feedback:
          "HaveIBeenPwned is legitimate. Ignoring breach notifications leaves you vulnerable.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 28,
    category: "password",
    title: "Password Complexity Question",
    situation:
      'IT policy requires passwords of at least 12 characters with complexity. A colleague asks which is more secure: "P@ssw0rd!" or "correct-horse-battery-staple"?',
    question: "Which password approach is generally more secure?",
    options: [
      {
        text: 'The passphrase "correct-horse-battery-staple" is stronger due to length and memorability',
        correct: true,
        feedback:
          "Correct! Long passphrases are harder to crack and easier to remember than short complex passwords with substitutions.",
      },
      {
        text: "P@ssw0rd! is stronger because it has special characters",
        correct: false,
        feedback:
          "Common substitutions (@ for a, 0 for o) are well-known to attackers. Length beats complexity.",
      },
      {
        text: "They are equally secure",
        correct: false,
        feedback:
          "The passphrase is significantly harder to crack due to length, even without special characters.",
      },
      {
        text: "Neither is secure enough for work use",
        correct: false,
        feedback:
          "A 28-character passphrase is extremely secure. Length is the primary factor in password strength.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 29,
    category: "password",
    title: "MFA Fatigue Attack",
    situation:
      'You receive multiple MFA push notifications on your phone even though you are not trying to log in. Someone keeps pressing "Request Again" on a login screen.',
    question: "What should you do?",
    options: [
      {
        text: "Approve one to stop the notifications",
        correct: false,
        feedback:
          "This is exactly what attackers want. Approving grants them access to your account.",
      },
      {
        text: "Deny all requests and immediately report to IT security",
        correct: true,
        feedback:
          "Correct! This is an MFA fatigue attack. Deny all requests and report - someone has your password.",
      },
      {
        text: "Turn off your phone to stop the notifications",
        correct: false,
        feedback:
          "This doesnt address the attack. Your password is compromised and needs immediate attention.",
      },
      {
        text: "Wait and see if they stop",
        correct: false,
        feedback:
          "Waiting allows the attack to continue. Report immediately and change your password.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 30,
    category: "password",
    title: "Password Manager Benefits",
    situation:
      'Your team is debating whether to adopt a password manager. Some are concerned about "putting all eggs in one basket."',
    question: "What is the primary security benefit of password managers?",
    options: [
      {
        text: "They enable unique, complex passwords for every account without memorization",
        correct: true,
        feedback:
          "Correct! The main benefit is eliminating password reuse, which is a far greater risk than password manager compromise.",
      },
      {
        text: "They are completely unhackable",
        correct: false,
        feedback:
          "No system is unhackable, but password managers are far more secure than human password habits.",
      },
      {
        text: "They automatically change passwords weekly",
        correct: false,
        feedback:
          "Password managers store and generate passwords but dont typically auto-rotate them.",
      },
      {
        text: "They eliminate the need for MFA",
        correct: false,
        feedback:
          "MFA is still essential. Password managers complement MFA, they dont replace it.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 31,
    category: "password",
    title: "Service Account Credentials",
    situation:
      'A developer hardcodes database credentials in source code because "its just for the dev environment." The code is pushed to a private GitHub repository.',
    question: "What is the security risk?",
    options: [
      {
        text: "Credentials in code can be exposed if the repo becomes public or is compromised",
        correct: true,
        feedback:
          "Correct! Private repos can be leaked, and credentials in code history persist even after removal. Use environment variables or secrets managers.",
      },
      {
        text: "No risk since the repository is private",
        correct: false,
        feedback:
          "Private repos can become public accidentally, be accessed by too many people, or be compromised in breaches.",
      },
      {
        text: "Dev environment credentials dont matter",
        correct: false,
        feedback:
          "Dev environments often mirror production. Compromised dev credentials can lead to production access.",
      },
      {
        text: "GitHub automatically removes credentials",
        correct: false,
        feedback:
          "GitHub has secret scanning but doesnt automatically remove credentials from code.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 32,
    category: "password",
    title: "Password Reset Verification",
    situation:
      "The help desk receives a call from someone claiming to be an executive who is locked out and needs an immediate password reset. They know the executives name, department, and employee ID.",
    question: "What is the correct procedure?",
    options: [
      {
        text: "Reset immediately - they have verified information",
        correct: false,
        feedback:
          "This information is easily obtained through social engineering or data breaches. Identity verification requires more.",
      },
      {
        text: "Follow established identity verification procedures regardless of claimed seniority",
        correct: true,
        feedback:
          'Correct! Everyone must follow the same verification process. Attackers exploit pressure from "executives" to bypass security.',
      },
      {
        text: "Reset it but with a temporary password",
        correct: false,
        feedback:
          "Any password reset without proper verification could give an attacker account access.",
      },
      {
        text: "Ask their manager to approve the reset",
        correct: false,
        feedback:
          "The caller could have impersonated the manager too. Follow standard verification procedures.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 33,
    category: "password",
    title: "Biometric Authentication",
    situation:
      "Your company is considering replacing passwords with fingerprint authentication for laptop login. An employee asks if this eliminates password vulnerabilities.",
    question: "What is accurate about biometric authentication?",
    options: [
      {
        text: "Biometrics are a factor you ARE, complementing but not replacing passwords entirely",
        correct: true,
        feedback:
          "Correct! Biometrics are one authentication factor. They have different vulnerabilities than passwords and work best in combination.",
      },
      {
        text: "Fingerprints are completely unforgeable",
        correct: false,
        feedback:
          "Fingerprints can be lifted from surfaces and replicated with various techniques.",
      },
      {
        text: "Biometrics eliminate the need for any other security measures",
        correct: false,
        feedback:
          "Defense in depth requires multiple factors. Biometrics alone are not sufficient.",
      },
      {
        text: "If your fingerprint is compromised you can change it",
        correct: false,
        feedback:
          "Unlike passwords, you cannot change your biometrics. Compromised biometrics are a permanent issue.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 34,
    category: "password",
    title: "Single Sign-On Security",
    situation:
      "Your organization implements SSO (Single Sign-On) for all corporate applications. An employee is concerned this creates a single point of failure.",
    question: "How should this concern be addressed?",
    options: [
      {
        text: "SSO reduces password fatigue and enables stronger central authentication controls like MFA",
        correct: true,
        feedback:
          "Correct! While SSO concentrates authentication, it enables consistent MFA enforcement and reduces weak password risks across many accounts.",
      },
      {
        text: "The concern is invalid - SSO has no security downsides",
        correct: false,
        feedback:
          "SSO does create a high-value target, which is why strong MFA on SSO is critical.",
      },
      {
        text: "SSO should be avoided for security reasons",
        correct: false,
        feedback:
          "SSO with strong MFA is generally more secure than multiple weak passwords across many applications.",
      },
      {
        text: "Users should still create separate passwords for each app",
        correct: false,
        feedback:
          "This defeats the purpose of SSO and reintroduces password management problems.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },

  // ============================================================
  // SOCIAL ENGINEERING SCENARIOS (10)
  // ============================================================
  {
    id: 7,
    category: "social-engineering",
    title: 'Phone Call from "IT Support"',
    situation:
      "You receive a call from someone claiming to be IT support. They say theres unusual activity on your account and need you to verify your identity by providing your password.",
    question: "What is the correct response?",
    options: [
      {
        text: "Provide the password since IT needs it to help",
        correct: false,
        feedback:
          "Legitimate IT staff NEVER ask for your password. They have administrative access.",
      },
      {
        text: "Hang up and call IT using the official number you have on file",
        correct: true,
        feedback:
          "Correct! Always verify through official channels. Never use contact info provided by the caller.",
      },
      {
        text: "Ask them to prove theyre from IT by answering security questions",
        correct: false,
        feedback:
          "Attackers may have researched answers. Verification must be through YOUR known channels.",
      },
      {
        text: "Give a fake password to test them",
        correct: false,
        feedback:
          "This confirms youre a viable target. End the call and verify through official channels.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 8,
    category: "social-engineering",
    title: "Tailgating Attempt",
    situation:
      'Someone in business attire approaches the secure door behind you, hands full of coffee and files. They say "Can you hold the door? I forgot my badge upstairs."',
    question: "What is the appropriate action?",
    options: [
      {
        text: "Hold the door - they look professional",
        correct: false,
        feedback:
          "Appearance means nothing. Social engineers often dress professionally to gain trust.",
      },
      {
        text: "Politely decline and suggest they contact reception",
        correct: true,
        feedback:
          "Correct! Physical security is critical. Each person must authenticate independently.",
      },
      {
        text: "Ask to see their employee ID",
        correct: false,
        feedback:
          "IDs can be faked. The correct protocol is that everyone badges in individually.",
      },
      {
        text: "Let them in but follow them to see where they go",
        correct: false,
        feedback:
          "This is not your role and creates risk. Report suspicious behavior to security.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 9,
    category: "social-engineering",
    title: "Pretexting Attack",
    situation:
      "A caller identifies themselves as being from your companys external auditing firm. They need to verify employee records and request you email them a staff directory with contact information.",
    question: "How should you respond?",
    options: [
      {
        text: "Send it - auditors need this information",
        correct: false,
        feedback:
          "Auditors work through official channels with management approval, not cold calls to employees.",
      },
      {
        text: "Ask your manager to verify the audit request through official channels",
        correct: true,
        feedback:
          "Correct! All audit requests should be verified through management and official company communications.",
      },
      {
        text: "Send only names without contact details",
        correct: false,
        feedback:
          "Any employee information can be used for further attacks. Verify the request first.",
      },
      {
        text: "Ask them to email you first to confirm their identity",
        correct: false,
        feedback:
          "Attackers can spoof email addresses. Verification must go through your company contacts.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 35,
    category: "social-engineering",
    title: "Baiting Attack",
    situation:
      'You find a USB drive in the parking lot labeled "Employee Salary Data 2024." You are curious about whether your salary is competitive.',
    question: "What should you do with this USB drive?",
    options: [
      {
        text: "Plug it into your computer to check if it belongs to HR",
        correct: false,
        feedback:
          "Never plug in unknown USB drives. They can contain malware that executes automatically.",
      },
      {
        text: "Turn it in to security without connecting it to any device",
        correct: true,
        feedback:
          "Correct! Baiting attacks use curiosity as a weapon. Unknown USB drives should be treated as malicious.",
      },
      {
        text: "Use a personal computer to check it so work systems stay safe",
        correct: false,
        feedback:
          "This just compromises your personal computer. The drive is likely malicious regardless of which system you use.",
      },
      {
        text: "Throw it away since its probably lost",
        correct: false,
        feedback:
          "Security should examine it - this could be a targeted attack worth investigating.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 36,
    category: "social-engineering",
    title: "Authority Exploitation",
    situation:
      "Someone calls claiming to be from the FBI investigating a crime. They demand you immediately provide customer account information to assist their investigation.",
    question: "What is the correct procedure?",
    options: [
      {
        text: "Comply immediately - its the FBI",
        correct: false,
        feedback:
          "Legitimate law enforcement follows proper legal channels with subpoenas and works with your legal department.",
      },
      {
        text: "Ask for a callback number, verify through official FBI channels, and involve your legal team",
        correct: true,
        feedback:
          "Correct! Any legitimate law enforcement request will go through proper legal channels. Verify independently.",
      },
      {
        text: "Ask for their badge number as verification",
        correct: false,
        feedback:
          "Badge numbers can be fabricated. Verification must be through independent official channels.",
      },
      {
        text: "Provide limited information to help the investigation",
        correct: false,
        feedback:
          "Even limited information release requires proper verification and legal review.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 37,
    category: "social-engineering",
    title: "Dumpster Diving Prevention",
    situation:
      "You notice maintenance staff collecting trash from offices, but you dont recognize them and they are paying close attention to paper documents.",
    question: "What action should you take?",
    options: [
      {
        text: "Nothing - maintenance staff have access to all areas",
        correct: false,
        feedback:
          'Unknown personnel should always be verified. Document theft through "dumpster diving" is common.',
      },
      {
        text: "Politely ask for identification and verify with facilities management",
        correct: true,
        feedback:
          "Correct! All personnel should be verifiable. Attackers often pose as maintenance to access sensitive areas.",
      },
      {
        text: "Confront them aggressively to catch them off guard",
        correct: false,
        feedback:
          "Aggressive confrontation is inappropriate and could escalate. Professional verification is correct.",
      },
      {
        text: "Follow them to see what they do with the documents",
        correct: false,
        feedback:
          "This is not your role and could be unsafe. Verify their identity through proper channels.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 38,
    category: "social-engineering",
    title: "Watering Hole Attack",
    situation:
      "Your company discovers that a industry forum website frequently visited by employees was compromised to serve malware to visitors.",
    question: "What type of attack is this?",
    options: [
      {
        text: "Watering hole attack - compromising sites targets are known to visit",
        correct: true,
        feedback:
          "Correct! Watering hole attacks target websites frequented by a specific group to compromise those visitors.",
      },
      {
        text: "Phishing - because it involves websites",
        correct: false,
        feedback:
          "Phishing involves deceptive emails/messages. This is a watering hole attack targeting known browsing habits.",
      },
      {
        text: "Brute force attack",
        correct: false,
        feedback:
          "Brute force involves password guessing. This attack exploits trusted websites.",
      },
      {
        text: "DDoS attack",
        correct: false,
        feedback:
          "DDoS disrupts availability. This attack uses compromised sites to deliver malware.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 39,
    category: "social-engineering",
    title: "Shoulder Surfing",
    situation:
      "While working in a coffee shop, you notice someone nearby seems to be watching your screen as you enter passwords and review confidential documents.",
    question: "What precautions should you take?",
    options: [
      {
        text: "Use a privacy screen filter and be aware of surroundings when handling sensitive data",
        correct: true,
        feedback:
          "Correct! Privacy screens and situational awareness protect against visual eavesdropping in public spaces.",
      },
      {
        text: "Public spaces are fine as long as you use HTTPS",
        correct: false,
        feedback:
          "HTTPS protects network transmission but not visual observation of your screen.",
      },
      {
        text: "Confronting the person will stop shoulder surfing",
        correct: false,
        feedback:
          "Prevention is better than confrontation. Use privacy screens and avoid sensitive work in public.",
      },
      {
        text: "Shoulder surfing is not a real threat",
        correct: false,
        feedback:
          "Visual eavesdropping is a significant threat, especially for credentials and sensitive information.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 40,
    category: "social-engineering",
    title: "Deepfake Video Call",
    situation:
      "You receive a video call from what appears to be your CEO asking you to urgently transfer funds. The video quality is slightly off and there is minor audio lag.",
    question: "What should concern you about this call?",
    options: [
      {
        text: "Deepfake technology can create convincing video impersonations",
        correct: true,
        feedback:
          "Correct! AI-generated deepfakes are increasingly realistic. Unusual requests require verification through known channels regardless of video appearance.",
      },
      {
        text: "Video calls cannot be faked",
        correct: false,
        feedback:
          "Deepfake technology can create convincing real-time video impersonations of anyone.",
      },
      {
        text: "The CEO would never call about finances",
        correct: false,
        feedback:
          "CEOs may discuss finances, but urgent fund transfer requests via video call should always be verified.",
      },
      {
        text: "Poor video quality confirms it is legitimate since deepfakes are perfect",
        correct: false,
        feedback:
          "Deepfakes often have subtle quality issues. Poor quality does not confirm authenticity.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 41,
    category: "social-engineering",
    title: "Quid Pro Quo Attack",
    situation:
      "Someone calls offering free technical support, saying they noticed your computer is running slowly on the network. They offer to fix it if you install their remote access software.",
    question: "What type of attack is this?",
    options: [
      {
        text: "Quid pro quo - offering something in exchange for access or information",
        correct: true,
        feedback:
          "Correct! Quid pro quo attacks offer something of value (free support) in exchange for something that compromises security (remote access).",
      },
      {
        text: "This is legitimate IT support",
        correct: false,
        feedback:
          "Legitimate IT does not cold-call offering to install remote access software. This is a social engineering attack.",
      },
      {
        text: "This is a baiting attack",
        correct: false,
        feedback:
          "Baiting uses physical items like USB drives. This is quid pro quo using a service exchange.",
      },
      {
        text: "Free technical support is always safe",
        correct: false,
        feedback:
          "Unsolicited offers of support are a common attack vector. Never install software based on unsolicited calls.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },

  // ============================================================
  // RANSOMWARE SCENARIOS (10)
  // ============================================================
  {
    id: 10,
    category: "ransomware",
    title: "Ransomware Detection",
    situation:
      "Your computer suddenly displays a red screen stating your files are encrypted and demanding 2 Bitcoin for the decryption key. A countdown timer shows 48 hours remaining.",
    question: "What is your FIRST action?",
    options: [
      {
        text: "Pay the ransom quickly before files are deleted",
        correct: false,
        feedback:
          "Never pay! Payment encourages attackers and doesnt guarantee file recovery.",
      },
      {
        text: "Immediately disconnect from the network and call IT security",
        correct: true,
        feedback:
          "Correct! Network isolation prevents spread. IT can assess damage and initiate recovery procedures.",
      },
      {
        text: "Try to restart the computer to clear the message",
        correct: false,
        feedback:
          "Restarting may worsen the situation or trigger additional encryption/deletion.",
      },
      {
        text: "Start copying files to a USB drive",
        correct: false,
        feedback:
          "This could spread the ransomware and the files are likely already encrypted.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 11,
    category: "ransomware",
    title: "Suspicious Attachment",
    situation:
      'You receive an email with an attached invoice named "Invoice_Dec2024.docm" from a vendor you occasionally work with. The email asks you to enable macros to view the document.',
    question: "What should raise suspicion?",
    options: [
      {
        text: "The .docm extension and macro request are red flags",
        correct: true,
        feedback:
          "Correct! .docm files contain macros which can execute malicious code. Legitimate invoices are typically PDFs.",
      },
      {
        text: "Nothing - invoices often require macros",
        correct: false,
        feedback:
          "Legitimate invoices should never require macros. This is a common ransomware delivery method.",
      },
      {
        text: "The file name looks normal",
        correct: false,
        feedback:
          "The filename is designed to look normal. The file TYPE (.docm with macros) is the danger.",
      },
      {
        text: "You should enable macros to verify the content",
        correct: false,
        feedback:
          "Never enable macros in unexpected documents - this executes the malicious payload.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 12,
    category: "ransomware",
    title: "Post-Incident Recovery",
    situation:
      "After a ransomware attack, your team has restored systems from backups. Management asks what additional steps should be taken before resuming normal operations.",
    question: "What is the most critical step before resuming operations?",
    options: [
      {
        text: "Resume immediately - backups are restored",
        correct: false,
        feedback:
          "The attack vector may still exist. Without addressing root cause, reinfection is likely.",
      },
      {
        text: "Identify and remediate the initial entry point",
        correct: true,
        feedback:
          "Correct! Understanding HOW attackers got in and closing that vulnerability prevents reinfection.",
      },
      {
        text: "Change all passwords as the only measure needed",
        correct: false,
        feedback:
          "Password changes help but dont address the technical vulnerability exploited.",
      },
      {
        text: "Send a company-wide email about the attack",
        correct: false,
        feedback:
          "Communication is important but technical remediation must come first.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 42,
    category: "ransomware",
    title: "Ransomware Payment Decision",
    situation:
      "Your company is hit by ransomware. The attackers demand $500,000 in Bitcoin. Management asks whether paying the ransom is a viable option to restore operations quickly.",
    question: "What should management consider about paying ransoms?",
    options: [
      {
        text: "Payment doesnt guarantee file recovery and funds criminal operations",
        correct: true,
        feedback:
          "Correct! Many organizations pay but never receive working decryption keys. Payment also funds further attacks.",
      },
      {
        text: "Paying is the fastest way to restore operations",
        correct: false,
        feedback:
          "Many organizations that pay never recover data. Backup restoration is often faster and more reliable.",
      },
      {
        text: "Ransomware operators always provide decryption keys after payment",
        correct: false,
        feedback:
          "There is no guarantee. Some provide faulty keys, some demand more, some never respond.",
      },
      {
        text: "Insurance will always cover ransom payments",
        correct: false,
        feedback:
          "Many insurance policies now exclude ransom payments, and regulatory pressure is increasing against payment.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 43,
    category: "ransomware",
    title: "Backup Infection Risk",
    situation:
      "During ransomware recovery, you discover your backup files are also encrypted because the backup drive was continuously connected to an infected machine.",
    question: "What backup strategy would have prevented this?",
    options: [
      {
        text: "Air-gapped or offline backups that are not continuously connected",
        correct: true,
        feedback:
          "Correct! The 3-2-1 rule includes keeping one copy offline/air-gapped so ransomware cannot reach it.",
      },
      {
        text: "More frequent backups would solve this",
        correct: false,
        feedback:
          "Frequency doesnt help if backups are immediately accessible to ransomware on the network.",
      },
      {
        text: "Backup to the same computer in a different folder",
        correct: false,
        feedback:
          "Same-machine backups are encrypted along with other files. Offline separation is required.",
      },
      {
        text: "Cloud backups are always safe from ransomware",
        correct: false,
        feedback:
          "Cloud backups with continuous sync can also be encrypted. Proper versioning and air-gapping are needed.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 44,
    category: "ransomware",
    title: "Double Extortion Ransomware",
    situation:
      "Attackers not only encrypted your files but also stole sensitive data. They threaten to publish the data online if you dont pay, even if you restore from backups.",
    question: "What is this attack technique called?",
    options: [
      {
        text: "Double extortion - combining encryption with data theft threats",
        correct: true,
        feedback:
          "Correct! Double extortion adds data theft to encryption, pressuring payment even when backups exist.",
      },
      {
        text: "Simple ransomware",
        correct: false,
        feedback:
          "Simple ransomware only encrypts. This adds the threat of data publication.",
      },
      {
        text: "Phishing attack",
        correct: false,
        feedback:
          "Phishing may be the initial vector, but the technique described is double extortion ransomware.",
      },
      {
        text: "DDoS attack",
        correct: false,
        feedback:
          "DDoS affects availability. This is data theft combined with encryption for double extortion.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 45,
    category: "ransomware",
    title: "Ransomware Spread Prevention",
    situation:
      "One workstation in your department shows signs of ransomware infection. Files are being renamed with strange extensions and CPU usage is very high.",
    question: "What is the immediate priority?",
    options: [
      {
        text: "Isolate the infected machine from the network immediately",
        correct: true,
        feedback:
          "Correct! Network isolation prevents spread to file shares and other systems. Speed is critical.",
      },
      {
        text: "Run antivirus scan while connected to see the extent",
        correct: false,
        feedback:
          "Keeping the machine connected allows continued spread. Isolate first, then assess.",
      },
      {
        text: "Turn off all computers in the department",
        correct: false,
        feedback:
          "Mass shutdown is disruptive and unnecessary. Isolate the infected machine specifically.",
      },
      {
        text: "Wait to see if the antivirus catches it",
        correct: false,
        feedback:
          "If ransomware is actively encrypting, waiting causes more damage. Immediate isolation is required.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 46,
    category: "ransomware",
    title: "RaaS Understanding",
    situation:
      'Your security team reports that the ransomware attacking your organization is offered as "Ransomware-as-a-Service" (RaaS) on dark web forums.',
    question: "What does RaaS mean for the threat landscape?",
    options: [
      {
        text: "Even unskilled criminals can launch sophisticated ransomware attacks",
        correct: true,
        feedback:
          "Correct! RaaS lowers barriers to entry. Criminal groups sell ransomware tools to affiliates who carry out attacks.",
      },
      {
        text: "RaaS means the ransomware is easier to defeat",
        correct: false,
        feedback:
          "RaaS ransomware is often highly sophisticated, developed by skilled criminals and licensed to others.",
      },
      {
        text: "Only large organizations are targeted by RaaS",
        correct: false,
        feedback:
          "RaaS affiliates target organizations of all sizes. Small businesses are frequent victims.",
      },
      {
        text: "RaaS attacks can be traced more easily",
        correct: false,
        feedback:
          "RaaS actually complicates attribution because multiple affiliates use the same ransomware.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 47,
    category: "ransomware",
    title: "Endpoint Protection Bypass",
    situation:
      "Ransomware successfully executed on a workstation despite having enterprise antivirus installed. The malware used a fileless technique running entirely in memory.",
    question: "Why did traditional antivirus fail?",
    options: [
      {
        text: "Fileless malware operates in memory without touching disk where AV typically scans",
        correct: true,
        feedback:
          "Correct! Traditional AV scans files on disk. Fileless malware lives in memory, evading signature-based detection.",
      },
      {
        text: "The antivirus subscription had expired",
        correct: false,
        feedback:
          "The question specifies enterprise AV was installed. The issue is the fileless technique.",
      },
      {
        text: "Antivirus cannot detect any ransomware",
        correct: false,
        feedback:
          "AV can detect many ransomware variants. Fileless techniques specifically evade traditional file scanning.",
      },
      {
        text: "The user must have disabled the antivirus",
        correct: false,
        feedback:
          "The scenario indicates AV was present. Fileless techniques are designed to bypass even active AV.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 48,
    category: "ransomware",
    title: "Ransomware Tabletop Exercise",
    situation:
      "Your organization is planning a ransomware tabletop exercise. The exercise should test your incident response capabilities.",
    question: "What should be included in the exercise scenario?",
    options: [
      {
        text: "Decision points for containment, communication, recovery, and potential ransom payment",
        correct: true,
        feedback:
          "Correct! Effective exercises test real decisions: isolating systems, notifying stakeholders, backup restoration, and payment policies.",
      },
      {
        text: "Only technical recovery steps",
        correct: false,
        feedback:
          "Ransomware response involves business decisions, communications, and legal considerations beyond technical recovery.",
      },
      {
        text: "Just reading the incident response plan aloud",
        correct: false,
        feedback:
          "Effective exercises test decision-making under pressure, not just plan awareness.",
      },
      {
        text: "Only IT department participation",
        correct: false,
        feedback:
          "Ransomware response involves legal, communications, executive leadership, and business operations.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 49,
    category: "ransomware",
    title: "Network Segmentation Value",
    situation:
      "After a ransomware attack, investigation reveals that the malware spread rapidly because all systems were on a flat network with no segmentation.",
    question: "How does network segmentation help prevent ransomware spread?",
    options: [
      {
        text: "Segmentation limits lateral movement by restricting which systems can communicate",
        correct: true,
        feedback:
          "Correct! Segmented networks contain breaches. Ransomware in one segment cannot easily reach others.",
      },
      {
        text: "Segmentation prevents all ransomware infections",
        correct: false,
        feedback:
          "Segmentation limits spread but doesnt prevent initial infection. It is a containment control.",
      },
      {
        text: "Segmentation only helps with network performance",
        correct: false,
        feedback:
          "While segmentation can help performance, its primary security value is limiting breach impact.",
      },
      {
        text: "Segmentation makes recovery more difficult",
        correct: false,
        feedback:
          "Segmentation actually aids recovery by limiting the scope of systems affected.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },

  // ============================================================
  // DATA BREACH SCENARIOS (10)
  // ============================================================
  {
    id: 13,
    category: "data-breach",
    title: "Exposed Sensitive Data",
    situation:
      "You discover a spreadsheet containing customer PII (names, SSNs, addresses) has been uploaded to a public-facing shared drive accessible via link.",
    question: "What is the correct order of response?",
    options: [
      {
        text: "Document it, tell your manager, let them handle it",
        correct: false,
        feedback:
          "Containment must happen FIRST. Every minute of exposure increases risk.",
      },
      {
        text: "Remove public access immediately, then report to security team",
        correct: true,
        feedback:
          "Correct! Contain first (stop the bleeding), then report for proper incident handling.",
      },
      {
        text: "Delete the file entirely to remove all evidence",
        correct: false,
        feedback:
          "Deletion destroys evidence needed for investigation and may violate retention policies.",
      },
      {
        text: "Email the file owner to let them know",
        correct: false,
        feedback:
          "While notification is needed, immediate containment takes priority over communication.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 14,
    category: "data-breach",
    title: "Third-Party Breach Notification",
    situation:
      'A vendor that processes your customer data notifies you theyve experienced a data breach. They are "still investigating the scope."',
    question: "What should your organization do immediately?",
    options: [
      {
        text: "Wait for the vendor to complete their investigation",
        correct: false,
        feedback:
          "Waiting leaves your organization and customers vulnerable. Proactive response is required.",
      },
      {
        text: "Activate your incident response plan and assess potential impact",
        correct: true,
        feedback:
          "Correct! Even third-party breaches require your IR plan activation to protect your data and customers.",
      },
      {
        text: "Immediately terminate the vendor relationship",
        correct: false,
        feedback:
          "Termination may be warranted later but immediate focus must be on containment and assessment.",
      },
      {
        text: "Post about the breach on social media to warn customers",
        correct: false,
        feedback:
          "Premature disclosure without facts can cause panic and legal issues. Follow proper procedures.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 50,
    category: "data-breach",
    title: "Breach Notification Requirements",
    situation:
      "Your organization confirms a data breach affecting customer personal information. Legal asks about notification timeline requirements.",
    question: "What generally determines breach notification requirements?",
    options: [
      {
        text: "Applicable laws vary by jurisdiction and data type - legal counsel should determine specific requirements",
        correct: true,
        feedback:
          "Correct! GDPR requires 72-hour notification, various US state laws differ. Consult legal for specific requirements.",
      },
      {
        text: "There is a universal 24-hour notification requirement",
        correct: false,
        feedback:
          "Notification timelines vary significantly by jurisdiction and law. There is no universal standard.",
      },
      {
        text: "Notification is only required for financial data breaches",
        correct: false,
        feedback:
          "Many laws require notification for various types of personal information, not just financial data.",
      },
      {
        text: "Companies can choose whether to notify or not",
        correct: false,
        feedback:
          "Breach notification is legally required in most jurisdictions. Failure to notify has legal consequences.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 51,
    category: "data-breach",
    title: "Data Classification Importance",
    situation:
      "During a security review, you find that employees store various sensitivity levels of data in the same locations without any classification system.",
    question: "Why is data classification important for breach prevention?",
    options: [
      {
        text: "Classification enables appropriate security controls based on data sensitivity",
        correct: true,
        feedback:
          "Correct! Classification ensures sensitive data gets stronger protection. Without it, you cannot prioritize security resources.",
      },
      {
        text: "Classification is only needed for regulatory compliance",
        correct: false,
        feedback:
          "While compliance requires classification, the primary benefit is enabling appropriate security controls.",
      },
      {
        text: "All data should be treated with maximum security regardless of type",
        correct: false,
        feedback:
          "This is impractical and expensive. Classification enables efficient allocation of security resources.",
      },
      {
        text: "Classification only matters for government organizations",
        correct: false,
        feedback:
          "All organizations benefit from classifying data to protect what matters most.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 52,
    category: "data-breach",
    title: "Insider Threat Detection",
    situation:
      "DLP (Data Loss Prevention) alerts show an employee downloading unusually large amounts of customer data. They gave notice last week and their last day is Friday.",
    question: "What action should be taken?",
    options: [
      {
        text: "Investigate immediately and consider restricting access pending review",
        correct: true,
        feedback:
          "Correct! Departing employee data exfiltration is a common insider threat. Prompt investigation and access review is essential.",
      },
      {
        text: "Wait until their last day to avoid confrontation",
        correct: false,
        feedback:
          "Waiting allows continued data theft. Immediate action protects company data.",
      },
      {
        text: "DLP alerts are usually false positives",
        correct: false,
        feedback:
          "DLP alerts combined with resignation notice are high-priority. This pattern warrants immediate investigation.",
      },
      {
        text: "They probably just need the data to finish projects",
        correct: false,
        feedback:
          "Large data downloads by departing employees should always be investigated regardless of apparent justification.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 53,
    category: "data-breach",
    title: "Data Minimization Principle",
    situation:
      'A new application project proposes collecting extensive customer data "in case we need it later for analytics."',
    question: "Why is this approach problematic from a security perspective?",
    options: [
      {
        text: "Collecting unnecessary data increases breach impact without business benefit",
        correct: true,
        feedback:
          "Correct! Data minimization reduces breach risk. Only collect data with a current, legitimate purpose.",
      },
      {
        text: "More data is always better for business decisions",
        correct: false,
        feedback:
          "Unnecessary data creates liability without benefit. Collect only what you need and can protect.",
      },
      {
        text: "Storage is cheap so there is no cost to keeping extra data",
        correct: false,
        feedback:
          "The cost is not storage - its breach liability, compliance burden, and security responsibility for that data.",
      },
      {
        text: "Analytics teams should decide what data to collect",
        correct: false,
        feedback:
          "Data collection decisions should involve security, privacy, and legal considerations, not just analytics desires.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 54,
    category: "data-breach",
    title: "Breach Investigation Forensics",
    situation:
      "After discovering a potential breach, the security team needs to investigate how data was accessed and exfiltrated.",
    question: "What is critical for effective breach forensics?",
    options: [
      {
        text: "Comprehensive logging that was enabled before the incident occurred",
        correct: true,
        feedback:
          "Correct! You cannot investigate what wasnt logged. Logging must be configured before incidents, not after.",
      },
      {
        text: "Interviewing employees about what they saw",
        correct: false,
        feedback:
          "Interviews help but technical evidence from logs is essential for accurate forensic investigation.",
      },
      {
        text: "Deleting suspicious files to stop the breach",
        correct: false,
        feedback:
          "Deleting files destroys forensic evidence. Preserve first, then investigate.",
      },
      {
        text: "Waiting until the breach is fully contained before investigating",
        correct: false,
        feedback:
          "Investigation and containment should happen in parallel. Evidence collection should not wait.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 55,
    category: "data-breach",
    title: "Data at Rest Encryption",
    situation:
      "A laptop with unencrypted hard drive containing employee records is stolen. The laptop was password protected.",
    question: "Why is password protection insufficient in this scenario?",
    options: [
      {
        text: "The hard drive can be removed and read directly, bypassing the password",
        correct: true,
        feedback:
          "Correct! Password protection only prevents booting. The disk can be read by connecting to another system. Full-disk encryption is required.",
      },
      {
        text: "The password was probably weak",
        correct: false,
        feedback:
          "Even a strong password doesnt protect data if the disk is not encrypted. Physical access bypasses OS passwords.",
      },
      {
        text: "Password protection is just as good as encryption",
        correct: false,
        feedback:
          "Passwords protect OS access. Encryption protects data even when physically removed from the device.",
      },
      {
        text: "This is not a breach since the laptop was password protected",
        correct: false,
        feedback:
          "Unencrypted data on a stolen device is a presumed breach. Password protection provides no data protection.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 56,
    category: "data-breach",
    title: "Cloud Misconfiguration Breach",
    situation:
      'Security researchers report that one of your companys S3 buckets is publicly accessible, exposing customer data. IT says "it was needed for a temporary project."',
    question: "What process failure does this represent?",
    options: [
      {
        text: "Lack of security review for cloud configurations and temporary exceptions",
        correct: true,
        feedback:
          'Correct! Cloud configurations should be reviewed by security. "Temporary" exceptions often become permanent vulnerabilities.',
      },
      {
        text: "Cloud storage is inherently insecure",
        correct: false,
        feedback:
          "Cloud storage is secure when properly configured. This is a configuration management failure.",
      },
      {
        text: "Security researchers should not be testing companies",
        correct: false,
        feedback:
          "Responsible security researchers help identify vulnerabilities. The failure is the misconfiguration.",
      },
      {
        text: "S3 buckets cannot be made private",
        correct: false,
        feedback:
          "S3 buckets can be configured as private. The failure is configuring it as public without security review.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 57,
    category: "data-breach",
    title: "API Data Exposure",
    situation:
      "A security assessment reveals that your mobile apps API returns full customer records even when only a summary is needed by the app.",
    question: "Why is this over-exposure of data problematic?",
    options: [
      {
        text: "APIs should return minimum necessary data to reduce breach impact if compromised",
        correct: true,
        feedback:
          "Correct! API data minimization limits exposure. If the API is attacked, only necessary data is at risk.",
      },
      {
        text: "The mobile app will filter out unnecessary data anyway",
        correct: false,
        feedback:
          "Client-side filtering doesnt protect data. The full data is transmitted and can be intercepted or captured.",
      },
      {
        text: "API performance is more important than data minimization",
        correct: false,
        feedback:
          "Well-designed APIs can be both efficient and secure. Returning excess data creates unnecessary risk.",
      },
      {
        text: "This only matters for public-facing APIs",
        correct: false,
        feedback:
          "All APIs should minimize data exposure. Internal APIs can also be attacked or accidentally exposed.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 58,
    category: "data-breach",
    title: "Breach Tabletop Preparation",
    situation:
      "Your organization is preparing for a data breach tabletop exercise. Leadership asks what roles should be included beyond IT.",
    question: "Which non-IT roles are essential for breach response?",
    options: [
      {
        text: "Legal, communications/PR, human resources, and executive leadership",
        correct: true,
        feedback:
          "Correct! Breach response involves legal obligations, public communications, employee notifications, and business decisions beyond technical recovery.",
      },
      {
        text: "Only the security team needs to participate",
        correct: false,
        feedback:
          "Breach response is a business-wide activity requiring coordination across multiple departments.",
      },
      {
        text: "IT can handle all aspects of breach response",
        correct: false,
        feedback:
          "IT handles technical response, but legal, communications, and business decisions are equally critical.",
      },
      {
        text: "External parties should handle breach response to avoid bias",
        correct: false,
        feedback:
          "While external help may be needed, internal stakeholders must lead the response. Exercises prepare them for this.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },

  // ============================================================
  // EMAIL SECURITY SCENARIOS (10)
  // ============================================================
  {
    id: 15,
    category: "email-security",
    title: "SPF Failure Alert",
    situation:
      'Your email security system flags an incoming email from a known partner. The alert shows "SPF: FAIL" but the email address looks correct.',
    question: "What does this SPF failure indicate?",
    options: [
      {
        text: "The email was definitely sent by an attacker",
        correct: false,
        feedback:
          "SPF failure indicates the server isnt authorized, but could also be a misconfiguration. Further investigation needed.",
      },
      {
        text: "The sending server is not authorized in the senders SPF record",
        correct: true,
        feedback:
          "Correct! SPF validates that the sending server is authorized. Failure requires verification before trusting.",
      },
      {
        text: "The email contains a virus",
        correct: false,
        feedback:
          "SPF checks sender authorization, not content. Separate scanning checks for malware.",
      },
      {
        text: "Nothing important - SPF failures are common and safe",
        correct: false,
        feedback:
          "SPF failures should never be ignored. They indicate potential spoofing attempts.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 16,
    category: "email-security",
    title: "DMARC Policy Question",
    situation:
      "Your security team is implementing DMARC and asks what policy to start with for your domain.",
    question: "What is the recommended approach for initial DMARC deployment?",
    options: [
      {
        text: "Start with p=reject to block all failures immediately",
        correct: false,
        feedback:
          "Starting with reject can block legitimate email if not properly configured. Gradual rollout is safer.",
      },
      {
        text: "Start with p=none to monitor, then progress to quarantine and reject",
        correct: true,
        feedback:
          "Correct! DMARC deployment should be gradual: monitor (none) -> quarantine -> reject, validating at each stage.",
      },
      {
        text: "DMARC isnt necessary if you have SPF",
        correct: false,
        feedback:
          "DMARC builds on SPF and DKIM, providing policy enforcement and reporting that SPF alone doesnt offer.",
      },
      {
        text: "Skip to p=quarantine as a middle ground",
        correct: false,
        feedback:
          "Without monitoring phase, you risk quarantining legitimate emails from misconfigured sources.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 59,
    category: "email-security",
    title: "DKIM Signature Purpose",
    situation:
      "Your email administrator is explaining the organizations email authentication setup and mentions DKIM signatures on outgoing emails.",
    question: "What does DKIM provide that SPF does not?",
    options: [
      {
        text: "DKIM cryptographically signs message content, proving it wasnt modified in transit",
        correct: true,
        feedback:
          "Correct! DKIM verifies message integrity. SPF only validates the sending server, not the message content.",
      },
      {
        text: "DKIM encrypts the email content",
        correct: false,
        feedback:
          "DKIM signs but doesnt encrypt. TLS encrypts in transit, and S/MIME or PGP encrypt content.",
      },
      {
        text: "DKIM and SPF do the same thing",
        correct: false,
        feedback:
          "SPF validates sending servers. DKIM validates message integrity. Together with DMARC, they provide comprehensive authentication.",
      },
      {
        text: "DKIM blocks spam emails",
        correct: false,
        feedback:
          "DKIM provides authentication, not spam filtering. It helps receivers verify legitimate senders.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 60,
    category: "email-security",
    title: "Email Header Analysis",
    situation:
      'You receive a suspicious email and want to analyze its headers to determine if it is legitimate. You examine the "Received" headers.',
    question: "What information do Received headers provide?",
    options: [
      {
        text: "They show the path the email took through mail servers from origin to destination",
        correct: true,
        feedback:
          "Correct! Received headers trace the emails path. Inconsistencies or suspicious servers can indicate spoofing.",
      },
      {
        text: "They only show the final delivery server",
        correct: false,
        feedback:
          "Each server adds a Received header, creating a complete trace of the emails journey.",
      },
      {
        text: "They are easily faked and provide no useful information",
        correct: false,
        feedback:
          "While headers can be forged, analyzing the full chain often reveals inconsistencies in spoofed emails.",
      },
      {
        text: "They contain the senders password",
        correct: false,
        feedback:
          "Received headers never contain credentials. They show server names, IPs, and timestamps.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 61,
    category: "email-security",
    title: "Business Email Compromise Prevention",
    situation:
      "Your finance department processes many wire transfer requests. They ask what technical controls can help prevent CEO fraud/BEC attacks.",
    question: "Which control is most effective against BEC?",
    options: [
      {
        text: "Mandatory out-of-band verification for financial transactions above a threshold",
        correct: true,
        feedback:
          "Correct! Technical email controls alone cant prevent social engineering. Procedural controls requiring phone verification are essential.",
      },
      {
        text: "Stronger spam filters will catch all BEC attempts",
        correct: false,
        feedback:
          "BEC emails often bypass spam filters because they contain no malware and look legitimate.",
      },
      {
        text: "Training employees to recognize phishing is sufficient",
        correct: false,
        feedback:
          "Training helps but procedural controls provide a safety net when training fails.",
      },
      {
        text: "Blocking all emails from outside the organization",
        correct: false,
        feedback:
          "This is impractical for business. External email is necessary but verification procedures are required.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 62,
    category: "email-security",
    title: "Email Gateway Security",
    situation:
      "Your organization is evaluating email security gateways. The team is comparing different protection capabilities.",
    question: "Which capability is most important for modern email threats?",
    options: [
      {
        text: "Sandboxing to detonate and analyze suspicious attachments",
        correct: true,
        feedback:
          "Correct! Modern malware evades signature detection. Sandboxing executes attachments safely to observe behavior.",
      },
      {
        text: "Signature-based virus scanning only",
        correct: false,
        feedback:
          "Signature scanning misses new/unknown malware. Behavioral analysis and sandboxing are essential.",
      },
      {
        text: "Blocking all attachments",
        correct: false,
        feedback:
          "Blocking all attachments is impractical. Sandboxing allows safe attachments while catching malicious ones.",
      },
      {
        text: "Encrypting all emails automatically",
        correct: false,
        feedback:
          "Encryption protects privacy but doesnt detect malicious content. Both are needed.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 63,
    category: "email-security",
    title: "Lookalike Domain Protection",
    situation:
      "Your company is acme-corp.com. You discover someone registered acme-c0rp.com and acmecorp.net to impersonate you.",
    question: "What proactive measure could have prevented this?",
    options: [
      {
        text: "Registering defensive domains that could be confused with yours",
        correct: true,
        feedback:
          "Correct! Registering lookalike domains prevents attackers from using them. Monitor for new registrations of similar domains.",
      },
      {
        text: "You cannot prevent others from registering domains",
        correct: false,
        feedback:
          "While you cant control all domains, registering obvious variations prevents their misuse.",
      },
      {
        text: "DMARC prevents all domain impersonation",
        correct: false,
        feedback:
          "DMARC protects YOUR domain. It doesnt prevent attackers from using similar-looking different domains.",
      },
      {
        text: "Training users to spot lookalike domains is sufficient",
        correct: false,
        feedback:
          "Training helps but proactive domain registration prevents the attack vector entirely.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 64,
    category: "email-security",
    title: "Email Encryption for Sensitive Data",
    situation:
      "An employee needs to send sensitive customer financial data to an external partner. They ask how to do this securely.",
    question: "What is the most appropriate approach?",
    options: [
      {
        text: "Use the organizations approved secure file transfer method with encryption",
        correct: true,
        feedback:
          "Correct! Sensitive data should use approved secure transfer methods. Standard email lacks end-to-end encryption.",
      },
      {
        text: "Regular email with a password-protected ZIP file is secure enough",
        correct: false,
        feedback:
          "Password-protected ZIPs are easily cracked. Approved secure transfer provides proper encryption and audit trails.",
      },
      {
        text: "Gmail or Outlook automatically encrypt all attachments",
        correct: false,
        feedback:
          "Standard email encryption (TLS) protects in transit but not at rest. End-to-end encryption requires additional tools.",
      },
      {
        text: "Sensitive data should never be shared externally",
        correct: false,
        feedback:
          "Legitimate business needs require external sharing. The solution is proper encryption and approved methods.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 65,
    category: "email-security",
    title: "Phishing Simulation Results",
    situation:
      "Your monthly phishing simulation shows 25% of employees clicked the link. Security team asks how to use these results.",
    question: "What is the most constructive use of phishing simulation data?",
    options: [
      {
        text: "Identify training needs and target awareness efforts to vulnerable groups",
        correct: true,
        feedback:
          "Correct! Simulations identify where training is needed. Punishing clickers is less effective than education.",
      },
      {
        text: "Publicly shame employees who clicked",
        correct: false,
        feedback:
          "Shaming creates fear and reduces reporting. Constructive training improves security culture.",
      },
      {
        text: "Terminate employees who repeatedly fail",
        correct: false,
        feedback:
          "Training and controls are more effective than termination. Persistent failures may indicate training gaps.",
      },
      {
        text: "The data is only useful for compliance reporting",
        correct: false,
        feedback:
          "Simulation data should drive continuous improvement in awareness programs, not just compliance checkboxes.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 66,
    category: "email-security",
    title: "External Email Warning Banner",
    situation:
      'Your organization adds a warning banner to all emails from external sources: "[EXTERNAL] This email originated outside the organization."',
    question: "How does this control help security?",
    options: [
      {
        text: "It prompts users to be more cautious with external messages that may be impersonating internal contacts",
        correct: true,
        feedback:
          "Correct! External banners help users recognize when an email claiming to be from a colleague is actually external.",
      },
      {
        text: "It blocks all external phishing emails",
        correct: false,
        feedback:
          "Banners are awareness tools, not blocking controls. Users must still exercise judgment.",
      },
      {
        text: "Users will ignore it because it appears on every external email",
        correct: false,
        feedback:
          'While banner fatigue is real, it still catches attention when an "internal" request comes from external.',
      },
      {
        text: "This is purely for compliance with no security benefit",
        correct: false,
        feedback:
          "External banners have proven effective at helping users identify impersonation attempts.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 67,
    category: "email-security",
    title: "Reply-To Manipulation",
    situation:
      "An email appears to be from your CEO with a display name matching. However, the reply-to address is different from the from address.",
    question: "Why is a mismatched reply-to address concerning?",
    options: [
      {
        text: "Attackers set different reply-to addresses so responses go to them instead of the spoofed sender",
        correct: true,
        feedback:
          "Correct! Reply-to manipulation is a common BEC technique. Always check that reply addresses match expected domains.",
      },
      {
        text: "Reply-to addresses are always the same as from addresses",
        correct: false,
        feedback:
          "They can legitimately differ, but in executive impersonation contexts, mismatches are red flags.",
      },
      {
        text: "This is normal for executives who use assistants",
        correct: false,
        feedback:
          "While assistants may send on behalf of executives, suspicious requests with mismatched addresses should be verified.",
      },
      {
        text: "Email clients always show the reply-to address prominently",
        correct: false,
        feedback:
          "Many email clients hide reply-to addresses, which is why this manipulation is effective.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },

  // ============================================================
  // INCIDENT RESPONSE SCENARIOS (10)
  // ============================================================
  {
    id: 17,
    category: "incident-response",
    title: "Incident Classification",
    situation:
      "An employee reports their laptop was stolen from their car. The laptop had full-disk encryption enabled and required a password to boot.",
    question: "How should this incident be classified?",
    options: [
      {
        text: "Not a security incident since the laptop was encrypted",
        correct: false,
        feedback:
          "Physical theft is always a security incident. Encryption mitigates but doesnt eliminate risk.",
      },
      {
        text: "Security incident requiring investigation and potential breach notification assessment",
        correct: true,
        feedback:
          "Correct! Even with encryption, this requires incident response: remote wipe, access review, and breach assessment.",
      },
      {
        text: "Just an IT issue for laptop replacement",
        correct: false,
        feedback:
          "Security must be involved to assess data risk, revoke access, and potentially notify if data was at risk.",
      },
      {
        text: "Police matter only - not IT security concern",
        correct: false,
        feedback:
          "While police should be notified, IT security must also respond to protect company data and access.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 18,
    category: "incident-response",
    title: "Evidence Preservation",
    situation:
      "During an investigation, you identify a compromised server. The security team asks about next steps.",
    question: "What is the correct approach for preserving evidence?",
    options: [
      {
        text: "Immediately shut down the server to stop the attack",
        correct: false,
        feedback:
          "Improper shutdown can destroy volatile evidence (memory, active connections) critical for investigation.",
      },
      {
        text: "Create forensic images of memory and disk before any changes",
        correct: true,
        feedback:
          "Correct! Forensic imaging preserves evidence. Memory first (volatile), then disk, maintaining chain of custody.",
      },
      {
        text: "Delete the malware to clean the system quickly",
        correct: false,
        feedback:
          "Deleting evidence hinders investigation and may not fully remediate the compromise.",
      },
      {
        text: "Let the server keep running normally to observe the attacker",
        correct: false,
        feedback:
          "Without proper monitoring capabilities, this risks further damage and data exfiltration.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 68,
    category: "incident-response",
    title: "Incident Response Team Activation",
    situation:
      "You detect what appears to be a significant security incident outside of business hours. The on-call rotation shows a junior analyst is primary.",
    question: "What should the junior analyst do first?",
    options: [
      {
        text: "Follow escalation procedures to notify senior team members and management",
        correct: true,
        feedback:
          "Correct! Significant incidents require escalation regardless of time. Junior analysts should engage seniors per the IR plan.",
      },
      {
        text: "Try to handle it alone to avoid bothering people at night",
        correct: false,
        feedback:
          "Major incidents require experienced personnel. Delayed escalation can increase damage.",
      },
      {
        text: "Wait until morning when more people are available",
        correct: false,
        feedback:
          "Security incidents dont wait for business hours. Immediate escalation limits damage.",
      },
      {
        text: "Send an email update and continue monitoring",
        correct: false,
        feedback:
          "Email is insufficient for urgent escalation. Phone/page senior personnel for active incidents.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 69,
    category: "incident-response",
    title: "Containment Strategies",
    situation:
      "An active attacker is detected in your network. They have compromised several systems and appear to be moving laterally toward sensitive databases.",
    question: "What containment strategy should be considered?",
    options: [
      {
        text: "Network isolation of compromised systems while maintaining evidence collection",
        correct: true,
        feedback:
          "Correct! Containment balances stopping spread with preserving evidence. Isolate affected systems at network level.",
      },
      {
        text: "Immediately wipe all potentially affected systems",
        correct: false,
        feedback:
          "Wiping destroys evidence and may not stop an attacker with persistent access elsewhere.",
      },
      {
        text: "Shut down the entire network to be safe",
        correct: false,
        feedback:
          "Full shutdown is disruptive and may not stop attacks that have external persistence. Targeted containment is better.",
      },
      {
        text: "Monitor without interference to learn the attackers methods",
        correct: false,
        feedback:
          "Allowing continued access risks data exfiltration. Containment must prioritize protection.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 70,
    category: "incident-response",
    title: "Communication During Incidents",
    situation:
      "During an active security incident, various stakeholders are asking for updates: executives, legal, IT staff, and external partners.",
    question: "How should incident communications be handled?",
    options: [
      {
        text: "Designate a communications lead to provide consistent, approved updates to all parties",
        correct: true,
        feedback:
          "Correct! Centralized communication prevents confusion and ensures accuracy. All updates should be coordinated.",
      },
      {
        text: "Let each team member update their own stakeholders",
        correct: false,
        feedback:
          "Uncoordinated communication leads to inconsistent messages and potential legal or PR problems.",
      },
      {
        text: "Refuse all communications until the incident is fully resolved",
        correct: false,
        feedback:
          "Stakeholders need updates. Silence creates more problems than controlled communication.",
      },
      {
        text: "Post all updates to social media for transparency",
        correct: false,
        feedback:
          "Public communication during active incidents should be carefully managed by communications professionals.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 71,
    category: "incident-response",
    title: "Lessons Learned Process",
    situation:
      "A security incident has been resolved. Management wants to move on, but the security team insists on a lessons learned meeting.",
    question: "Why is a post-incident review essential?",
    options: [
      {
        text: "It identifies process improvements to prevent similar incidents and improve response",
        correct: true,
        feedback:
          "Correct! Post-incident reviews are critical for continuous improvement. They identify gaps in prevention and response.",
      },
      {
        text: "It is only needed for compliance documentation",
        correct: false,
        feedback:
          "While documentation helps compliance, the primary value is learning and improving security.",
      },
      {
        text: "Its an opportunity to assign blame to responsible parties",
        correct: false,
        feedback:
          "Effective reviews are blameless, focusing on process improvement rather than individual fault.",
      },
      {
        text: "It can be skipped if the incident was minor",
        correct: false,
        feedback:
          "Even minor incidents offer learning opportunities. The review depth should match incident severity.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 72,
    category: "incident-response",
    title: "Third-Party Notification",
    situation:
      "Investigation reveals the attackers accessed customer data through a vulnerability in a third-party integration.",
    question: "What third-party notifications may be required?",
    options: [
      {
        text: "Affected customers, the third party vendor, and potentially regulators depending on data type",
        correct: true,
        feedback:
          "Correct! Breach notifications typically include affected individuals, involved vendors, and regulatory bodies as required by law.",
      },
      {
        text: "Only the vendor needs to know since it was their vulnerability",
        correct: false,
        feedback:
          "Customer notification is typically your responsibility regardless of where the vulnerability was.",
      },
      {
        text: "No notifications are needed for third-party issues",
        correct: false,
        feedback:
          "You are responsible for protecting customer data regardless of the technical source of compromise.",
      },
      {
        text: "Notify only if customers specifically ask about their data",
        correct: false,
        feedback:
          "Proactive notification is typically required by law, not reactive response to inquiries.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 73,
    category: "incident-response",
    title: "CSIRT Authority",
    situation:
      "During an active incident, the Computer Security Incident Response Team (CSIRT) determines that a business-critical system must be taken offline immediately.",
    question: "What authority should CSIRT have in this situation?",
    options: [
      {
        text: "Pre-authorized authority to take systems offline during active incidents to limit damage",
        correct: true,
        feedback:
          "Correct! CSIRT needs pre-defined authority to act quickly. Waiting for approvals during active attacks increases damage.",
      },
      {
        text: "They must get CEO approval before any system changes",
        correct: false,
        feedback:
          "Executive approval processes are too slow for incident response. Pre-authorization is essential.",
      },
      {
        text: "Business operations always take priority over security actions",
        correct: false,
        feedback:
          "During active attacks, security containment may require temporary business impact to prevent greater harm.",
      },
      {
        text: "CSIRT can only make recommendations, not take action",
        correct: false,
        feedback:
          "Effective incident response requires action authority. Advisory-only CSIRT cannot contain active threats.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 74,
    category: "incident-response",
    title: "Indicator of Compromise Sharing",
    situation:
      "Your team identifies specific malware indicators of compromise (IOCs) during incident investigation. Other organizations may be targeted by the same threat.",
    question: "Should IOCs be shared externally?",
    options: [
      {
        text: "Share through appropriate channels like ISACs to help others detect and prevent similar attacks",
        correct: true,
        feedback:
          "Correct! IOC sharing through trusted channels helps the security community. Anonymized sharing protects your organization while helping others.",
      },
      {
        text: "Never share - this reveals your security weaknesses",
        correct: false,
        feedback:
          "Sharing IOCs doesnt reveal weaknesses. It helps others while your organization benefits from their sharing too.",
      },
      {
        text: "Only share after the incident is fully resolved",
        correct: false,
        feedback:
          "Timely sharing helps others during active campaigns. Waiting reduces the value of the intelligence.",
      },
      {
        text: "Post all technical details publicly immediately",
        correct: false,
        feedback:
          "Sharing should be through appropriate channels. Public disclosure may help attackers or cause legal issues.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 75,
    category: "incident-response",
    title: "Business Continuity Integration",
    situation:
      "A major incident requires taking critical business systems offline. Operations is asking when systems will be restored.",
    question: "How should IR and business continuity (BC) work together?",
    options: [
      {
        text: "IR and BC plans should be integrated with predefined recovery priorities and communication channels",
        correct: true,
        feedback:
          "Correct! IR and BC must work together. Recovery priorities should be established before incidents occur.",
      },
      {
        text: "Security handles the incident; business continuity is a separate concern",
        correct: false,
        feedback:
          "IR and BC are interconnected. Security decisions affect business operations and vice versa.",
      },
      {
        text: "Business operations resume immediately regardless of security status",
        correct: false,
        feedback:
          "Premature restoration before proper remediation risks reinfection or continued attacker access.",
      },
      {
        text: "BC plans are only for natural disasters, not security incidents",
        correct: false,
        feedback:
          "Modern BC planning includes security incidents. Cyber events can impact availability as much as natural disasters.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 76,
    category: "incident-response",
    title: "Root Cause Analysis",
    situation:
      "After containing an incident, investigation identifies that an unpatched vulnerability was exploited. But the patch had been available for months.",
    question: "What root cause question should be asked?",
    options: [
      {
        text: "Why did the patching process fail to apply this critical update in time?",
        correct: true,
        feedback:
          'Correct! Root cause analysis asks "why" repeatedly to find process failures, not just technical ones.',
      },
      {
        text: "Who forgot to apply the patch so they can be disciplined?",
        correct: false,
        feedback:
          "Blame-focused analysis doesnt improve processes. Ask why the system allowed the gap, not who made the mistake.",
      },
      {
        text: "The vendor is responsible for releasing the vulnerability",
        correct: false,
        feedback:
          "Vulnerabilities exist; patching is your responsibility. Focus on why your process didnt address it.",
      },
      {
        text: "Root cause analysis is unnecessary since we know it was an unpatched system",
        correct: false,
        feedback:
          "The unpatched system is the immediate cause. Root cause asks why it wasnt patched - process, resources, prioritization.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },

  // ============================================================
  // MIXED/COMPREHENSIVE SCENARIOS (10)
  // ============================================================
  {
    id: 19,
    category: "mixed",
    title: "Multi-Vector Attack",
    situation:
      "Your organization experiences simultaneous events: phishing emails to executives, a DDoS attack on your website, and reports of suspicious phone calls to the help desk.",
    question: "What does this pattern suggest?",
    options: [
      {
        text: "Three separate unrelated incidents",
        correct: false,
        feedback:
          "Simultaneous multi-vector attacks are often coordinated. DDoS may be a distraction for the real attack.",
      },
      {
        text: "A coordinated attack using multiple vectors - likely a distraction tactic",
        correct: true,
        feedback:
          "Correct! Sophisticated attackers use multiple vectors simultaneously. DDoS often distracts from phishing/social engineering.",
      },
      {
        text: "Just a busy day for the security team",
        correct: false,
        feedback:
          "Coincidental timing of multiple attack types is extremely rare. Assume coordination.",
      },
      {
        text: "Focus only on the DDoS since its the most visible",
        correct: false,
        feedback:
          "Visible attacks often distract from quieter, more damaging attacks like targeted phishing.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 20,
    category: "mixed",
    title: "Security Awareness Training",
    situation:
      'After completing security awareness training, an employee asks why they need to follow these procedures when "nothing bad has ever happened here."',
    question: "What is the best response?",
    options: [
      {
        text: "Agree that the training might be excessive for your organization",
        correct: false,
        feedback:
          "Complacency is a major security risk. Training prevents incidents, not responds to them.",
      },
      {
        text: "Security controls work because people follow them - breaches happen when vigilance drops",
        correct: true,
        feedback:
          "Correct! The absence of incidents often means controls are working. Relaxing them invites problems.",
      },
      {
        text: "Tell them to just follow the rules without questioning",
        correct: false,
        feedback:
          'Understanding the "why" creates genuine security culture. Blind compliance is less effective.',
      },
      {
        text: "Share examples of breaches at other companies to scare them",
        correct: false,
        feedback:
          "Fear-based training is less effective than explaining how their actions protect everyone.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 77,
    category: "mixed",
    title: "Shadow IT Discovery",
    situation:
      'You discover that a department has been using an unapproved cloud storage service to share files with external partners because the approved system is "too slow."',
    question: "How should this shadow IT be addressed?",
    options: [
      {
        text: "Understand the business need, then provide a secure approved alternative that meets it",
        correct: true,
        feedback:
          "Correct! Shadow IT emerges when approved tools dont meet needs. Address the need with secure solutions.",
      },
      {
        text: "Block the service and discipline the users",
        correct: false,
        feedback:
          "Punitive responses drive shadow IT further underground. Address the underlying business need.",
      },
      {
        text: "Allow it since business productivity is more important",
        correct: false,
        feedback:
          "Unapproved services bypass security controls. The need is valid but the solution must be secure.",
      },
      {
        text: "Shadow IT is not a security concern",
        correct: false,
        feedback:
          "Shadow IT creates unmonitored data exposure, compliance risks, and potential attack vectors.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 78,
    category: "mixed",
    title: "Security vs Usability Balance",
    situation:
      'A new security control is proposed that would significantly impact productivity. Users are already complaining about "too much security."',
    question: "How should this tension be resolved?",
    options: [
      {
        text: "Evaluate the risk reduction versus productivity impact and find acceptable balance",
        correct: true,
        feedback:
          "Correct! Security must enable business, not block it. Controls should be proportionate to risk.",
      },
      {
        text: "Security always comes first regardless of business impact",
        correct: false,
        feedback:
          "Extreme security that prevents business operation fails its purpose. Balance is necessary.",
      },
      {
        text: "Remove security controls if users complain",
        correct: false,
        feedback:
          "User complaints should prompt review, not automatic removal. Understand the risk before changing controls.",
      },
      {
        text: "User experience is not a security concern",
        correct: false,
        feedback:
          "Poor UX drives workarounds that bypass security. Usable security is more effective security.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 79,
    category: "mixed",
    title: "Zero Trust Principles",
    situation:
      "Your organization is moving toward a zero trust architecture. An executive asks what this means in practical terms.",
    question: "Which statement best describes zero trust?",
    options: [
      {
        text: "Never trust, always verify - require authentication and authorization for every access request",
        correct: true,
        feedback:
          "Correct! Zero trust assumes no implicit trust based on network location. Every access must be verified.",
      },
      {
        text: "Install more firewalls at the network perimeter",
        correct: false,
        feedback:
          "Zero trust moves beyond perimeter-based security to identity and access verification at every point.",
      },
      {
        text: "Trust no employees with any system access",
        correct: false,
        feedback:
          "Zero trust is about verification, not denial. Legitimate users get access after verification.",
      },
      {
        text: "Remove all security controls and start over",
        correct: false,
        feedback:
          "Zero trust augments existing controls with continuous verification, not replacement.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 80,
    category: "mixed",
    title: "Compliance vs Security",
    situation:
      "Your organization is compliant with all regulatory requirements. A board member asks if this means the organization is secure.",
    question: "What is the relationship between compliance and security?",
    options: [
      {
        text: "Compliance is the minimum baseline - true security requires going beyond checkbox requirements",
        correct: true,
        feedback:
          "Correct! Compliance frameworks are minimums, often lagging behind current threats. Security requires continuous improvement.",
      },
      {
        text: "Full compliance equals complete security",
        correct: false,
        feedback:
          "Compliance standards are minimum baselines that may not address all relevant threats to your specific organization.",
      },
      {
        text: "Compliance is unnecessary if you have good security",
        correct: false,
        feedback:
          "Compliance and security serve different purposes. Both are necessary - legal requirements and actual protection.",
      },
      {
        text: "Security and compliance are completely unrelated",
        correct: false,
        feedback:
          "Compliance often drives security investment and establishes baseline controls. They overlap significantly.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 81,
    category: "mixed",
    title: "Security Champion Program",
    situation:
      "Your security team is small and cannot review every project. Someone suggests creating a security champion program with trained representatives in each department.",
    question: "What is the value of security champions?",
    options: [
      {
        text: "They extend security awareness and provide local expertise for their teams",
        correct: true,
        feedback:
          "Correct! Security champions scale security knowledge, catch issues early, and promote security culture in their teams.",
      },
      {
        text: "They can replace the need for a security team",
        correct: false,
        feedback:
          "Champions complement but dont replace security professionals. They are force multipliers, not replacements.",
      },
      {
        text: "Champions have no real authority so they are ineffective",
        correct: false,
        feedback:
          "Champions influence through expertise and relationships. Formal authority is not required for impact.",
      },
      {
        text: "Only IT staff should be security champions",
        correct: false,
        feedback:
          "Champions from all departments bring security awareness to their specific contexts and workflows.",
      },
    ],
    difficulty: "beginner",
    points: 10,
    impact: 50000,
  },
  {
    id: 82,
    category: "mixed",
    title: "Risk Acceptance Decision",
    situation:
      "A critical vulnerability exists in a legacy system. The fix requires significant downtime and the system is needed for month-end processing. Management considers accepting the risk temporarily.",
    question: "What should risk acceptance require?",
    options: [
      {
        text: "Documented decision by appropriate authority with defined review date and compensating controls",
        correct: true,
        feedback:
          "Correct! Risk acceptance must be documented, approved at appropriate level, time-limited, and include mitigating measures.",
      },
      {
        text: "Verbal agreement from the IT director is sufficient",
        correct: false,
        feedback:
          "Risk acceptance requires documented, formal approval with clear accountability and timeline.",
      },
      {
        text: "Security team can accept risks on behalf of the business",
        correct: false,
        feedback:
          "Business owns the risk and must make acceptance decisions. Security advises but doesnt own business risk.",
      },
      {
        text: "Risk acceptance means ignoring the issue",
        correct: false,
        feedback:
          "Acceptance requires understanding the risk, implementing compensating controls, and planning remediation.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
  {
    id: 83,
    category: "mixed",
    title: "Security Metrics",
    situation:
      'Leadership asks the security team to report on "how secure" the organization is. They want a single number or grade.',
    question: "How should security be measured and reported?",
    options: [
      {
        text: "Multiple metrics across prevention, detection, and response provide meaningful insight",
        correct: true,
        feedback:
          "Correct! Security is multidimensional. Effective metrics include patching rates, detection times, training completion, and incident trends.",
      },
      {
        text: "A single letter grade captures overall security posture",
        correct: false,
        feedback:
          "Single grades oversimplify complex topics. Different security aspects require different metrics.",
      },
      {
        text: "Security cannot be measured",
        correct: false,
        feedback:
          "While perfect measurement is impossible, meaningful metrics help track improvement and identify gaps.",
      },
      {
        text: "Count of security tools installed is the best metric",
        correct: false,
        feedback:
          "Tool count says nothing about effectiveness. Outcome-based metrics are more meaningful.",
      },
    ],
    difficulty: "intermediate",
    points: 15,
    impact: 500000,
  },
  {
    id: 84,
    category: "mixed",
    title: "Supply Chain Security",
    situation:
      "News breaks about a major software vendor being compromised, with malicious updates distributed to customers. Your organization uses this vendors software.",
    question: "What does this scenario illustrate?",
    options: [
      {
        text: "Supply chain attacks compromise trusted software to reach many targets at once",
        correct: true,
        feedback:
          "Correct! Supply chain attacks target trusted vendors to distribute malware through legitimate channels. Trust verification is critical.",
      },
      {
        text: "Only use software from unknown vendors to avoid such attacks",
        correct: false,
        feedback:
          "Unknown vendors are higher risk. The solution is vendor security assessment and monitoring, not avoidance of major vendors.",
      },
      {
        text: "Automatic updates should always be disabled",
        correct: false,
        feedback:
          "Disabling updates creates different vulnerabilities. Better approach is vendor assessment and monitoring.",
      },
      {
        text: "This only affects software, not hardware or services",
        correct: false,
        feedback:
          "Supply chain attacks can target hardware, software, and services. All vendor relationships require security consideration.",
      },
    ],
    difficulty: "advanced",
    points: 20,
  },
];
