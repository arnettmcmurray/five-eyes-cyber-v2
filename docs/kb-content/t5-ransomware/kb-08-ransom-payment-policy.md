---
title: "Should We Pay? Policy, FinCEN Obligations, and the Decision Process"
type: faq
topics:
  - Ransomware & Operational Resilience
source_trust: T0
freshness_cycle: 6mo
---

# Should We Pay? Policy, FinCEN Obligations, and the Decision Process

---

**Q: Should we pay the ransom?**

No. The default policy position is that ransom payments are not authorized.

Paying a ransom funds criminal operations and directly finances the infrastructure used to attack other freight carriers, logistics providers, and critical infrastructure operators. Payment does not guarantee that decryption works — ransomware groups have delivered non-functional decryption tools, demanded additional payments after the first was made, or simply disappeared with the payment. Payment also signals to attackers that your organization will pay, increasing the probability of being targeted again.

---

**Q: Are there legal obligations we need to know about before any payment could be made?**

Yes. Two distinct federal frameworks apply.

**OFAC (Office of Foreign Assets Control):** Many ransomware groups are designated on the OFAC Specially Designated Nationals (SDN) list — paying them, even unknowingly, can result in civil penalties under the International Emergency Economic Powers Act. OFAC has stated that it has "strict liability" for sanctions violations, meaning a good-faith mistake does not eliminate liability. Any payment decision requires OFAC screening of the ransomware group by legal counsel before any funds are transferred.

**FinCEN (Financial Crimes Enforcement Network):** FinCEN guidance establishes that companies making ransomware payments may have obligations under the Bank Secrecy Act, including filing a Suspicious Activity Report (SAR). Financial institutions processing ransom payments also have independent SAR filing obligations. Legal counsel must advise on BSA obligations before a payment decision is finalized.

These are not theoretical risks. They are enforceable federal obligations that apply regardless of the circumstances of the attack.

---

**Q: What if we have no backups and the business genuinely cannot continue without paying?**

This situation requires immediate engagement of the cyber insurance carrier and legal counsel — in that order, and simultaneously if possible.

Cyber insurance policies often cover ransomware payments and provide access to negotiators with specific expertise in dealing with ransomware groups. Experienced negotiators can often reduce demanded amounts significantly. They also have intelligence on which groups typically follow through on decryption and which do not.

This is never a decision that operations staff, dispatchers, fleet managers, or even operations leadership should make unilaterally. The decision requires:

- Confirmation of insurance coverage and coverage conditions
- OFAC screening of the ransomware group by legal counsel
- A negotiation strategy developed with expert guidance

Making a payment without this framework in place is not faster — it is more expensive, legally exposed, and less likely to result in actual recovery.

---

**Q: Who has authority to make a payment decision?**

Executive leadership with legal counsel and cyber insurance involvement. No one else.

This is not a matter of trust — it is a matter of regulatory complexity and financial exposure. The OFAC and FinCEN obligations require legal expertise to navigate. The financial decision requires insurance coordination. Operations staff who attempt to make this decision independently — even with the best intentions, even under extreme operational pressure — create additional liability for themselves and the organization.

If you are being pressured by anyone inside or outside the organization to authorize or facilitate a ransom payment without legal and executive involvement, escalate immediately.

---

**Q: What do we do instead of paying?**

In order of priority:

1. **Restore from backup.** A tested, offline backup is the primary alternative to payment. This is why backup discipline and quarterly restore testing are non-negotiable requirements.

2. **Engage an incident response firm.** IR firms have access to decryption tools for some ransomware variants, intelligence on attacker behavior, and experience recovering systems without paying. The cyber insurance carrier can provide pre-approved IR vendors.

3. **Activate cyber insurance.** Insurance covers IR costs, business interruption, and in some cases ransom payments after legal review. Notify the insurer immediately.

4. **Notify law enforcement.** FBI IC3 and CISA have intelligence on ransomware groups and may be able to assist with recovery. Law enforcement engagement does not obligate you to a specific course of action — it provides additional resources.

5. **Operate on contingency procedures.** Paper-based dispatch, phone-based driver check-in, and manual HOS logs can sustain operations for a limited period. The goal is survival until systems are restored, not permanent manual operation.

---

**Q: Is it ever acceptable to pay?**

In extreme circumstances, with legal, insurance, and executive authorization, and after OFAC screening, some organizations do pay ransoms. That decision requires the full framework described above. It is never a shortcut to faster recovery — it is a last resort with legal, financial, and ethical consequences that require expert guidance to navigate responsibly.
