---
title: Why Freight Is More Exposed on Mobile Than Most Industries
type: threat-brief
topics:
  - Mobile Device and BYOD Security
source_trust: T1
freshness_cycle: 6mo
---

# Why Freight Is More Exposed on Mobile Than Most Industries

In most industries, the most sensitive work happens at a desk. In freight, it happens in a cab at 65 mph, at a dock during a tight appointment window, in a brokerage office where one person is fielding calls and working three load boards simultaneously. The work is mobile by design — and so is the exposure.

## The Structural Problem

Corporate IT security is built around a model where employees work on managed computers inside a controlled network. That model does not describe freight. Drivers log HOS on ELD companion apps. Dispatchers book loads on DAT Mobile from their personal iPhones while on the road. Owner-operators run their entire operation from one phone — receiving load offers via text, managing BOLs in a document app, communicating with shippers on WhatsApp, and checking fuel card balances between stops. No IT department. No MDM. No managed device policy.

The phone is the business. And that phone is running unmanaged, on personal accounts, connecting to the same systems that control freight worth tens of thousands of dollars per load.

## What's Actually on Those Phones

When a dispatcher or driver uses a personal phone for work, that device typically holds:

- Active load board sessions (DAT, Truckstop) with saved credentials
- TMS app access with carrier, shipper, and load data
- Freight-related email and text chains including payment instructions and shipper contacts
- BOL photos and carrier documentation
- Fuel card and payment app credentials

This is not a theoretical data set. This is exactly the information that cargo theft networks target. According to CargoNet's Q1 2025 data, BEC-enabled cargo theft has shifted away from identity document fraud and toward account compromise — attackers are stealing the logins that control freight rather than forging the paperwork. The phone carrying those logins is the most exposed surface in the chain.

## The Owner-Operator Reality

An owner-operator running independently has no IT team to call. Their personal phone is simultaneously their dispatch terminal, their HOS logging device, their invoice system, and their communication channel with brokers and shippers. When that phone is compromised — through a smishing link, a fake app, or a stolen credential — the attacker gets access to the entire business.

Small brokerages are similarly exposed. A three-person brokerage office may have no MDM, no formal device policy, and employees using personal phones for all DAT access and customer communication. A single compromised device in that environment can expose the firm's carrier relationships, active freight, and payment routing.

## ELD Devices Are Part of This Risk

ELD systems are networked computers with cellular radios, not passive logbooks. NMFTA researchers have cataloged real vulnerabilities in ELD systems — CVE-2024-12054 is one example. These are real, registered vulnerabilities in devices that are physically present in hundreds of thousands of commercial trucks. The ORBCOMM ransomware attack in September 2023 demonstrated what happens when those systems are successfully targeted: ELD systems were offline for three weeks across major carriers, drivers were forced to paper logs, and FMCSA had to issue emergency HOS exemptions.

The mobile risk in freight is not hypothetical. It is structural, ongoing, and getting more targeted.
