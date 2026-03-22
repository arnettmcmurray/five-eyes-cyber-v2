---
title: Practice Questions — Mobile Device and BYOD Security (28 questions)
module: Mobile Device and BYOD Security
---

# Practice Questions: Mobile Device and BYOD Security

All questions are scenario-based. Format: stem + 4 options. Correct answer marked *.

---

**Q1.** You are a dispatcher at a small three-person brokerage. You use your personal iPhone to access DAT, communicate with carriers, and manage loads. Your company has no MDM and no formal device policy. Which of the following best describes your situation?

A) Your personal phone doesn't count as a work device because it isn't company-issued.
B) Because you're a small company, the security risks are smaller and less targeted.
*C) Your personal phone is an unmanaged device with access to freight systems that cargo theft networks specifically target — you are exposed even without a company IT policy.
D) As long as you have a screen lock, your device is adequately secured for freight work.

---

**Q2.** An owner-operator uses one personal phone to receive load offers via text, communicate with brokers on WhatsApp, manage BOLs with a document app, and check her fuel card balance. According to CargoNet Q1 2025 data, what is the primary risk this creates?

A) The phone may run out of battery during a long haul, disrupting communication.
B) Multiple freight apps on one device will slow performance and cause operational errors.
*C) That phone is the attack surface for account compromise — stolen credentials from any one of those apps can cascade to the others and give an attacker access to active loads and payment routing.
D) Using personal devices for work creates licensing problems with freight app providers.

---

**Q3.** A small carrier's fleet manager is reviewing their BYOD situation. Drivers use personal Android phones for the Samsara ELD companion app and for receiving dispatch texts. Which of the following is the most significant security gap?

A) Android devices are inherently less secure than iPhones and should be replaced.
*B) Without MDM enrollment and a work profile enforcing screen lock and app restrictions, those devices have unmanaged access to ELD data and dispatch communications — and the carrier has no way to remotely wipe them if a driver's phone is lost or stolen.
C) The carrier should require drivers to buy company phones out of their per-mile compensation.
D) Dispatch texts are low-value targets because they don't contain load financial details.

---

**Q4.** A broker's new hire says she already uses her personal phone for everything and doesn't want to install an MDM agent that gives the company any visibility into her device. She argues that her personal data should remain private. What is the correct response?

A) The company should back down — BYOD policies that touch personal devices are not legally enforceable.
B) Install the full MDM agent on her device anyway without telling her about it.
*C) Explain that BYOD enrollment applies only work-profile management and remote wipe of work data only — personal data outside the work profile is protected. If she declines enrollment, she cannot access company freight systems on her personal device.
D) Allow her to use the device unmanaged, since the risk of losing one employee outweighs the security concern.

---

**Q5.** You receive a text from an unknown number that reads: "Your DAT Mobile app version is out of date and your account may be suspended. Download the latest version here: [link]." What do you do?

A) Tap the link — it's probably a real notification from DAT, just sent through an automated SMS system.
B) Forward the link to IT and then tap it to see if it goes to a real DAT page.
*C) Do not tap the link. Open the App Store or Google Play directly and check if an update is available there. If concerned, call DAT's published support line to verify.
D) Uninstall your current DAT app first, then tap the link to reinstall the latest version.

---

**Q6.** You're at a truck stop and you see a bulletin board flyer that says "Download our free fuel discount app — scan the QR code below." You scan the code and your phone shows the URL before opening it: "fuel-rewards-drivers.net/app-install." What should you do?

A) Proceed — the URL mentions fuel and drivers, which matches the flyer.
*B) Do not proceed. You have no way to verify that domain is associated with any legitimate fuel program. QR codes at public locations are a known attack vector for malicious app installations. Look up the fuel program directly through a known source.
C) Download the app but don't enter any personal information to stay safe.
D) Ask another driver if they've used the app before, then decide.

---

**Q7.** Someone emails you an APK file with the message: "Our company has switched to a new TMS app. Install this on your Android instead of the Play Store version — the Play Store version is old." What do you do?

*A) Refuse to install it. Legitimate enterprise apps either come from official app stores or from a verified MDM-pushed deployment — not from APK files sent over email. Report this to IT.
B) Install it — APKs are just Android install files and are safe as long as you trust the sender.
C) Install it after scanning it with your antivirus app first.
D) Check if the file is smaller than 50MB — if it's small, it's probably safe.

---

**Q8.** You download a load board app from the Google Play Store. During installation, it requests permission to access your contacts, microphone, SMS messages, and camera. Which of these permissions is the most suspicious for a freight load board app?

A) Camera — load board apps don't need to take photos.
B) Location — a load board app has no reason to know where you are.
*C) Contacts and SMS — a load board app has no operational need to read your contact list or text messages. These permissions suggest data harvesting beyond the app's freight function.
D) Microphone — this is needed for in-app voice calls with shippers.

---

**Q9.** The ELD on your truck starts displaying a login screen asking for your carrier account credentials. You've been using this ELD for 14 months and it has never asked you to log in through the screen — login was set up through the companion app. What do you do?

A) Enter your credentials — it's probably a software update that reset your login settings.
B) Try your credentials and if they don't work, call the ELD vendor's support line.
*C) Do not enter your credentials. Call your dispatcher immediately and describe exactly what you're seeing. This is an anomaly that matches behaviors seen in real ELD security incidents. Do not interact with the unexpected screen until the situation is assessed.
D) Do a factory reset of the ELD to clear whatever is causing the unusual screen.

---

**Q10.** You're a fleet manager reviewing your ELD vendor contract. You ask the vendor how quickly they issue firmware patches when a vulnerability is discovered in their system. The vendor rep says "we push updates when they're ready — usually quarterly." How should you evaluate this answer?

A) Quarterly updates are industry-standard and acceptable.
B) Quarterly is better than most vendors — accept it.
*C) Quarterly is too slow for critical security vulnerabilities. The NMFTA has cataloged real ELD CVEs. A vendor without a faster critical patch cadence leaves your fleet running known vulnerabilities for months. Push for a defined SLA: critical patches within 30 days, security patches within 90 days at most.
D) Firmware updates are only relevant if you've had a security incident — don't push the vendor.

---

**Q11.** During a break at a rest stop, a driver notices his ELD is reporting a location 40 miles off from where he actually is. He's never seen this before. What should he do?

A) Ignore it — GPS systems sometimes have temporary errors that resolve on their own.
B) Try restarting the ELD and see if the location corrects itself.
*C) Report it to his dispatcher immediately along with the time he noticed it, his actual location, and what the ELD is displaying. GPS reporting anomalies in ELD systems can indicate compromise or unauthorized configuration changes and should be documented and assessed.
D) Post about it in a driver forum to see if others have had the same issue with this ELD model.

---

**Q12.** A carrier is recovering from the ORBCOMM-style scenario where their ELD vendor's system is offline due to a security incident. What immediate operational problem does this create?

A) Drivers can't call dispatch — ELD systems control the communication radio.
*B) Drivers cannot electronically record HOS — they must revert to paper logs. Without advance preparation, drivers who haven't used paper logs in years may struggle with compliance, and the carrier loses real-time fleet visibility.
C) The trucks automatically enter limp mode when ELD connectivity is lost.
D) FMCSA automatically suspends carrier operating authority when ELD systems go offline.

---

**Q13.** A newer driver receives a text: "FMCSA Compliance Alert: Your ELD data shows a 47-minute HOS violation from last Tuesday. You must review and certify your correction within 12 hours to avoid a citation. Click here to access your records." The driver is anxious because she knows she ran close to her limit that day. What should she do?

*A) Do not tap the link. FMCSA does not contact drivers via unsolicited SMS. Call your dispatcher using the number you already have and report the text. If there's a real HOS issue, it will show up in your ELD companion app and be addressed through your carrier's compliance process.
B) Tap the link quickly — if there's a real violation, 12 hours isn't much time.
C) Reply to the text asking them to confirm it's really FMCSA.
D) Call 911 to report a potential compliance problem before the window closes.

---

**Q14.** You receive a text from a number you don't recognize: "Urgent load: $6.50/mile, Chicago IL to Miami FL, 1,450 miles. Available for pickup tomorrow 0600. Reply YES to hold or tap here for details." You're not currently in a load search on any board. What do you do?

A) Tap the link — load opportunities come from unexpected contacts all the time in this industry.
*B) Do not tap the link. Unsolicited high-rate load offers via SMS from unknown numbers are a known smishing vector. If you're interested in loads from that origin, search for them directly on DAT or Truckstop through the official apps.
C) Reply YES to hold the load while you investigate the contact further.
D) Forward the text to your dispatcher so they can tap the link on your behalf.

---

**Q15.** A WhatsApp contact with the display name "Hartman Foods — Shipping Dept" sends you a message offering a consistent weekly lane from their facility. You don't have Hartman Foods in your contacts and you've never worked with them. They're asking you to submit your carrier packet through a link they sent. What's the red flag here?

A) Shippers don't communicate via WhatsApp — all legitimate freight contact happens by phone or email.
*B) You have no way to verify the display name "Hartman Foods — Shipping Dept" — it was set by whoever created the account. The phone number is the only identifier, and you have no prior relationship with this contact. Verify by calling Hartman Foods' publicly listed number directly before submitting any carrier documentation.
C) The offer of a consistent weekly lane is too good to be true — real shippers only offer spot loads.
D) Carrier packets are public information and safe to submit anywhere — the risk only comes with payment details.

---

**Q16.** A dispatcher receives a WhatsApp message from what appears to be the office manager's number asking her to log in to the TMS and update the payment routing for a carrier. The message says the office manager is in a meeting and needs this done in the next 30 minutes. What should the dispatcher do?

A) Complete the request — it's from the office manager's number and TMS updates are routine.
*B) Stop. Call the office manager directly on a known number — not a number provided in the WhatsApp message — to verify the request before making any payment or routing changes. Payment instruction fraud via impersonation is a documented freight threat. The 30-minute urgency is a social engineering signal.
C) Ask the office manager's WhatsApp contact to provide a code word to verify identity.
D) Update the routing as requested but flag it internally so IT can review the change later.

---

**Q17.** Your phone goes missing at a truck stop. You last saw it about 2 hours ago. You've spent 30 minutes looking for it and you're starting to think it was stolen. What is the most important next step?

*A) Report it to IT immediately — you are already inside the 4-hour reporting window, and every additional minute of delay leaves your active DAT, TMS, and email sessions exposed. Report first, keep looking second.
B) Check Find My (iPhone) or Find My Device (Android) first, locate the phone, then report to IT once you've confirmed it's really gone.
C) Try to log in to your freight apps from another device and change your passwords before reporting so the attacker can't use them.
D) File a police report at the truck stop and give IT the report number when you call them.

---

**Q18.** When reporting a lost device to IT, which piece of information is most critical for them to initiate the right response?

A) Your carrier's MC number and DOT number for their records.
*B) Which freight apps had active sessions or saved credentials on the device — this tells IT which accounts are at risk and which passwords need to be reset immediately.
C) The serial number of the device, which you probably don't have memorized.
D) The last cell tower location the phone pinged, which you can get from your carrier.

---

**Q19.** Your personal phone (BYOD, enrolled with a work profile) goes missing. You're worried about your personal photos, banking app, and text messages. Under the BYOD policy, what happens when IT initiates a remote wipe?

A) The entire device is wiped, including all personal data — this is unavoidable when using BYOD.
B) Only your personal data is wiped — IT cannot access the work profile.
*C) Only the work profile and work-related data are wiped. Personal data outside the work profile is protected. This was disclosed at enrollment, and it is why BYOD policies use containerization rather than full-device management.
D) Nothing on your personal device can be wiped without a court order — IT can only lock the work profile remotely.

---

**Q20.** After reporting a lost device, your IT team tells you they've issued the remote wipe command and will send you re-enrollment instructions. While waiting, you realize your DAT account was logged in on the missing phone. What should you do?

A) Wait for IT to reset your DAT password as part of their account remediation process.
*B) Change your DAT password immediately, without waiting for IT to get to it. Then review your DAT account for any unauthorized activity — new logins, modified loads, changed contact information. Speed matters.
C) Call DAT's support line and ask them to put a freeze on your account until you get a new phone.
D) Don't change the password yet — changing it before the remote wipe completes could interfere with the wipe process.

---

**Q21.** You've been using SMS codes as your MFA method for your Truckstop account. Your fleet manager asks if you should switch to an authenticator app. What's the honest answer?

A) SMS codes are the most secure MFA method because they require physical possession of the phone.
*B) Authenticator apps are more secure than SMS codes because SMS is vulnerable to SIM-swapping attacks — an attacker who successfully redirects your phone number receives your SMS codes. Switch to an authenticator app if Truckstop supports it.
C) It doesn't matter — any MFA is equally secure as long as you don't share the codes.
D) Authenticator apps only work on Wi-Fi, which makes them impractical for drivers who are often in areas with limited connectivity.

---

**Q22.** A driver sets up Google Authenticator for his DAT account. Three weeks later, he drops his phone in a fuel spill at a truck stop and it's destroyed. He can't log in to DAT because he doesn't have his authenticator. What should he have done during setup to prepare for this?

A) Enabled SMS backup codes so the authenticator isn't the only option.
B) Written down his DAT password on paper and stored it in his truck.
*C) Saved the backup codes generated by DAT during MFA enrollment in a secure location separate from the phone — such as printed copies kept in a safe place, or stored in a password manager on a separate device. These codes allow account recovery when the authenticator is unavailable.
D) Nothing — account recovery for MFA lockouts requires calling DAT customer service regardless of what you do during setup.

---

**Q23.** An ELD fleet software vendor tells a carrier they don't support MFA for the fleet manager portal because "the portal is only accessible from inside your network." What is the problem with this reasoning?

A) There's no problem — network restrictions are a valid substitute for MFA.
*B) Network perimeter assumptions are not reliable. Attackers who compromise a device inside the network, or who gain VPN access through other means, would face no MFA barrier. For any portal controlling compliance data and fleet operations, MFA is required regardless of network access restrictions.
C) The vendor is correct — MFA is only necessary for public-facing consumer applications.
D) This would only be a problem if the carrier had remote employees working from home.

---

**Q24.** A load board app you've been using for a year sends you an in-app notification: "Important security update — please re-enter your credentials to verify your account." The notification looks exactly like the app's normal interface. What do you do?

A) Re-enter your credentials — security updates that require credential verification are standard practice.
*B) Be cautious. Close the notification, go directly to your account settings within the app, and check for any real security alerts. If the app legitimately needs you to verify your credentials, that action will be accessible from within the authenticated app — not just through a pop-up prompt. If unsure, call DAT or Truckstop support on their published number.
C) Screenshot the notification and email it to IT before doing anything.
D) Uninstall and reinstall the app — a credential re-verification prompt means the app has been compromised.

---

**Q25.** A dispatcher notices that her load board account shows a load posted to DAT that she didn't create — a dry van load from Dallas to Denver, posted 20 minutes ago. She's currently in Chicago. What does this indicate and what should she do?

*A) Her DAT account credentials have likely been compromised. She should immediately change her DAT password, contact DAT to report the unauthorized activity and have the fraudulent load removed, and review her account for other unauthorized changes. She should also check any other accounts that share the same password.
B) This is probably a system error — load boards occasionally duplicate or mispost loads. Contact DAT support to delete it.
C) A co-worker probably posted the load using her account while she was away from her desk.
D) This could be a display bug — wait to see if the load disappears on its own before taking action.

---

**Q26.** You're at a rest stop and you use the USB charging station built into the table to charge your phone. When you pick up your phone 20 minutes later, you get a pop-up asking if you want to "Trust This Computer." What happened and what should you do?

A) This is a normal iOS/Android message that appears when battery gets low — dismiss it and move on.
*B) The USB port you connected to is a data-capable port, not just a power port. "Trust This Computer" means the port initiated a data connection attempt with your device. You should decline/not trust, disconnect immediately, and in the future use an AC adapter or your own power bank. This is a juice-jacking vector.
C) Accept the trust request — you need the charging connection and it's just asking for permission to charge.
D) Your phone has a virus. Wipe it immediately and reinstall your apps.

---

**Q27.** An owner-operator gets a call from someone claiming to be from "FMCSA compliance services" saying he needs to update his ELD device registration online before his renewal date or face a fine. They offer to walk him through it and ask him to navigate to a website they spell out. What should he do?

A) Follow their instructions — FMCSA does sometimes call carriers directly about compliance matters.
*B) Do not navigate to any website the caller directs him to. Hang up. Look up the FMCSA's official contact number at fmcsa.dot.gov and call directly to verify whether there is any real compliance action pending. Cold calls directing you to websites are a vishing (voice phishing) pattern regardless of what agency the caller claims to represent.
C) Ask the caller to send an email with the link instead — email is more trustworthy than a verbal URL.
D) Go to the website but don't enter any personal information — just see what comes up.

---

**Q28.** A freight company is assessing their overall mobile security posture. They have 12 drivers using company-issued Android phones, 4 dispatchers using personal iPhones for freight work, and 1 owner-operator partner who does not use company systems. Which group represents the highest uncontrolled risk?

A) The company-issued Android phones — Android has more vulnerabilities than iOS.
B) The owner-operator — they operate outside the company's control entirely.
*C) The dispatchers using personal iPhones without MDM enrollment — they have unmanaged access to the company's DAT accounts, TMS, and freight email on devices the company cannot monitor, update-enforce, or remotely wipe. The company-issued phones can be managed through MDM. The owner-operator doesn't access company systems. The BYOD dispatchers are the gap.
D) All groups present equal risk — device type matters more than management status.
