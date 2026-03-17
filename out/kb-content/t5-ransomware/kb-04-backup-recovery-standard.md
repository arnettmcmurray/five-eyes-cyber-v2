---
title: Backup and Recovery Standard
type: policy
topics:
  - Ransomware & Operational Resilience
source_trust: T0
freshness_cycle: 12mo
---

# Backup and Recovery Standard

Backups are the primary recovery mechanism after a ransomware attack. A carrier with good backups can decline to pay and restore operations. A carrier with no backups — or backups that were also encrypted — has no leverage and no options except paying or rebuilding from scratch.

This standard defines the minimum backup requirements for freight operations systems.

## The 3-2-1 Rule

All critical business data must follow the 3-2-1 backup rule:

- **3 copies** of the data (the live system plus two backups)
- **2 different media types** (for example: local disk and cloud storage, or local disk and tape)
- **1 copy offsite or offline**, isolated from the production network

The 3-2-1 rule is not aspirational — it is the minimum standard. A single backup copy that fails during restoration leaves the organization with no options.

## Why "Offsite" Must Mean Offline or Air-Gapped

A backup drive connected to the same network as the systems being backed up is reachable by ransomware. Ransomware specifically targets mapped network drives and backup shares during encryption. Backups stored on a network-accessible share are not protected backups — they are additional data for the attacker to encrypt.

Offsite backup must mean one of:
- A cloud backup service with immutable storage enabled (the backup files cannot be modified or deleted by a network-connected process)
- Physical media (external drive, tape) stored in a location physically disconnected from the network
- A backup system behind an air gap that has no persistent network connection to production systems

If the backup system can be reached from the infected network, it will be encrypted.

## What Must Be Backed Up

At minimum, backup coverage must include:

- **TMS database and configuration:** load history, carrier records, customer records, rate tables, and routing data
- **Customer and carrier contact records:** required for offline operations when TMS is unavailable
- **Dispatch history:** supports post-incident reconstruction of load status and billing
- **Financial records:** accounts receivable, accounts payable, and transaction history
- **BOL and POD archives:** required for audit, dispute resolution, and shipper billing
- **Email and communication archives:** as required by applicable record retention policies

## Recovery Time and Recovery Point Objectives

**Recovery Time Objective (RTO)** defines how long the business can survive without a given system. For TMS, the operational RTO is 24–48 hours at most — beyond that, manual dispatch degrades shipper relationships and driver compliance becomes unmanageable. Recovery planning must account for this.

**Recovery Point Objective (RPO)** defines how much data loss is acceptable. A daily backup means up to 24 hours of data may be lost in a worst-case scenario. Operations with high transaction volume — multiple dispatches per hour — may require more frequent backup intervals to stay within acceptable RPO.

Backup frequency must be set based on actual RPO requirements, not default software settings.

## Restore Testing

A backup that has never been restored is a backup with unknown value. Restoration failures during an actual incident — due to file corruption, configuration errors, or media failure — are catastrophic because they eliminate the primary recovery path at the worst possible moment.

**All backups must be tested by performing a complete restoration to a test environment at least once per quarter.** The test must verify that:

- Restored data is complete and uncorrupted
- Restored systems are functional and operational
- The restoration process can be completed within the defined RTO

## Ownership

The IT Operations role (or designated equivalent) owns backup verification and testing. This responsibility must be formally assigned — it cannot be left as an implied responsibility shared among the operations team. Quarterly test results must be documented and available for review.
