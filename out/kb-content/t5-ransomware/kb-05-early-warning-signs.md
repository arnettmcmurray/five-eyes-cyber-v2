---
title: Recognizing Ransomware Before It Locks Everything
type: training-content
topics:
  - Ransomware & Operational Resilience
source_trust: T0
freshness_cycle: 6mo
---

# Recognizing Ransomware Before It Locks Everything

The ransom note is not the beginning of the attack — it is the end of the quiet phase. By the time a ransomware message appears on screen, the attackers have typically been inside the network for hours or days, mapping systems, stealing credentials, and positioning their encryption tools for maximum effect. Between their initial access and that final trigger, there is a window. Recognizing what happens during that window can mean the difference between catching an intrusion early and losing the entire operation.

## Behavioral Indicators: What to Watch For

**Antivirus or endpoint security alerts.** If your system's security software flags a file, quarantines something, or throws a warning — that is not routine noise to dismiss. Attackers use tools that sometimes trigger detection during the reconnaissance phase. A dismissed alert today can be the missed warning that precedes encryption tomorrow. Report antivirus alerts to IT every time.

**Unusual system slowness.** Ransomware staging and encryption processes consume significant CPU and disk resources. A workstation that has become noticeably slower over hours without a clear explanation — no large downloads, no known software updates — may have background processes running that shouldn't be there.

**Network drives becoming inaccessible.** If shared drives that were reachable an hour ago suddenly fail to load, or return "access denied" errors, it may indicate ransomware has already begun encrypting files on those shares. This is often one of the first observable signs for users who aren't on the initially infected machine.

**New files with unknown extensions.** Ransomware renames encrypted files with new extensions — sometimes random strings, sometimes the ransomware group's brand name. If files in a folder that previously contained PDFs or spreadsheets now show unfamiliar extensions and won't open, treat it as a confirmed incident.

**Unexpected administrative tools or processes.** If Task Manager shows processes running that shouldn't be there — system utilities you didn't launch, command prompt windows that appear briefly, or network traffic to unfamiliar destinations — something is executing without your knowledge.

## Freight-Specific Warning Signals

**TMS behavior that doesn't match normal patterns.** Unexplained login failures on dispatch accounts, sessions dropping repeatedly, or data that appears different from what was entered recently may indicate credential harvesting or system compromise.

**ELD communications dropping across multiple units simultaneously.** A single ELD going offline can be a device or connectivity issue. If multiple ELDs across different drivers lose connectivity at the same time and there is no known network outage, that pattern warrants immediate IT notification — the backend systems they connect to may be under attack.

**Login failures on dispatch accounts.** Attackers test stolen credentials before deploying ransomware. Multiple failed logins on active accounts — especially outside normal working hours — may indicate credential stuffing or a compromised account being used to probe the network.

## What NOT to Do If You Suspect Ransomware Is Active

**Do not turn off the computer.** This feels instinctive, but a hard shutdown destroys forensic evidence — volatile memory that may contain information about how attackers got in, what they accessed, and which systems are clean. Forensic investigators and IT need that information. Shutting down should happen only on explicit IT direction.

**Do not continue working.** If you suspect the system is compromised, every additional action — including saving files, opening applications, or browsing the network — may spread the infection or overwrite evidence.

**Do not try to fix it yourself.** Attempting to remove suspicious files, disable processes, or "clean" the system without IT involvement can trigger the final encryption phase early, spread the infection, or destroy the evidence needed for recovery.

## What TO Do: The 5-Minute Decision Window

When you observe something that could be ransomware, the sequence is: **Recognize → Report → Isolate**.

1. **Recognize** what you are seeing. Write down — on paper — what is happening, what you observed first, what time it is, and which device or system is affected. Do this immediately, before anything changes.

2. **Report** immediately to your IT contact or security reporting line. Do not send an email from the potentially compromised system — call. Give IT the device name, what you observed, and when.

3. **Isolate** if instructed by IT. This typically means unplugging the ethernet cable from the workstation and disabling Wi-Fi. Do not isolate without IT direction unless you cannot reach IT and you have confirmed you are seeing encryption in progress.

Five minutes of rapid, correct action at this stage can stop an attack that would otherwise become a three-week operational shutdown.
