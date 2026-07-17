---
title: Open Challenges in Spatial Governance for Intelligent Machines
slug: open-challenges-spatial-governance
area: research
status: fragment
summary: A draft research agenda — arguing that spatial governance for intelligent machines is a distinct field, and setting out a taxonomy of open challenges across verification, policy, accountability, institutions, and ethics.
published: true
created: 2026-07-17
---

## Abstract

Intelligent machines — embodied robots, autonomous vehicles and vessels, drones, and increasingly agentic digital systems with physical effectors — are being deployed into a world where what is appropriate, lawful, and safe depends on where you are. Human behavior is governed by overlapping, location-contingent layers of law, regulation, custom, and norm; machines currently have no reliable way to know where they are in a verifiable sense, discover what rules apply there, or demonstrate compliance without surveillance. We argue that spatial governance for intelligent machines constitutes a distinct field of study at the intersection of technical AI alignment, AI governance, and geography. We present a taxonomy of N open challenges spanning verification, policy specification, accountability, institutions, and ethics, and for each we state the problem, explain why it is hard, and describe what progress would look like. We close with the research infrastructure the field needs.

---

## 1. Introduction

- Opening frame: as AI systems gain physical agency, the consequences of misalignment become kinetic, not informational. A wrong answer is recalled; a wrong manoeuvre is not.
- Behavior is contingent on context, and context is partly spatial. Humans navigate this with embodied social knowledge; machines have nothing equivalent.
- Trend lines making this urgent: (a) embodied AI and robotics scaling; (b) multi-agent deployments from heterogeneous manufacturers sharing physical space; (c) autonomy in under-governed domains (high seas, polar regions, orbit); (d) hardware-enabled governance emerging in the compute governance literature, demonstrating that physical-world verification is now tractable.
- The default trajectory if nothing is done: proprietary, manufacturer-defined location behaviour; no democratic input; jurisdictional arbitrage ("flags of convenience for the AI age").
- Thesis: this is a field, not a feature. No single discipline owns it; progress requires coordinated work across cryptography, formal methods, law, political science, geography, and AI safety.
- Contributions: (1) a definition and scoping of the field; (2) a taxonomy of N open challenges; (3) a map of adjacent literatures; (4) a research infrastructure agenda.

## 2. Definitions and Scope

- **Intelligent machines**: autonomous or semi-autonomous systems with physical presence or physical effectors — robots, vehicles, vessels, aircraft, fabrication equipment — plus situated digital agents whose actions have location-contingent legal effect.
- **Spatial governance**: the specification, discovery, application, and enforcement of location-contingent rules for machine behaviour.
- **Spatial alignment**: ensuring deployed AI systems behave in accordance with the norms, laws, and preferences relevant to the places in which they operate. Positioned as complement to value alignment, not substitute.
- Relationship to adjacent fields (one paragraph each, with citations):
    - AI alignment (outer/inner alignment; this work as deployment-context alignment)
    - AI governance and policy (Dafoe's agenda; frontier model regulation)
    - Compute governance and hardware-enabled mechanisms (chip location verification, flexHEG — the nearest existing literature)
    - Agent infrastructure (agent IDs, visibility into AI agents)
    - Geography and critical GIS (code/space, algorithmic geographies, geofencing scholarship)
    - Robot ethics and law (autonomous vehicles, drone regulation, LAWS debates)
    - Arms control verification (precedent for adversarial verification regimes)
- Out of scope: content geo-blocking and data residency as ends in themselves (covered as motivating precedents only); indoor consumer location services; general robot safety not contingent on location.

## 3. Method: How the Challenges Were Selected

- Half page. Criteria: (a) progress is necessary for spatial governance to function at scale; (b) no existing field owns the problem; (c) tractable enough that progress milestones can be stated. Note the taxonomy is a claim, and invite dispute of it.

---

# The Challenges

_Each challenge follows a fixed template: **Problem** / **Why it is hard** / **What progress looks like** / **Adjacent work** / **Disciplines needed**. Template keeps sections parallel and makes co-author assignments clean._

## Cluster I — Establishing Spatial Facts

### Challenge 1: Adversarially robust location verification

- **Problem**: Producing evidence of a device's location that remains credible against a motivated, well-resourced adversary — including the device's own operator. GNSS is trivially spoofable; most positioning systems were designed for cooperative settings.
- **Why hard**: The verifier usually cannot observe the device directly; all signals pass through hardware the adversary may control; physical-layer attacks (signal simulation, relay/wormhole attacks) defeat naive schemes; threat models vary enormously by domain (consumer check-in vs. sanctioned vessel).
- **What progress looks like**: A public threat-model taxonomy for proof-of-location; published forgery-cost estimates per technique; red-team benchmarks (the "spoofing CTF"); at least one deployed system with quantified adversarial guarantees.
- **Adjacent work**: distance-bounding protocols; chip location verification via network latency (compute governance literature); WitnessChain-style infrastructure attestation; secure hardware attestation; GNSS authentication (Galileo OSNMA).
- **Disciplines**: cryptography, RF engineering, security research, secure hardware.

### Challenge 2: Calibrated, composable spatial evidence

- **Problem**: No common framework exists for combining heterogeneous location evidence (sensor, network, witness, institutional) into a calibrated assessment of a location claim — or for comparing the strength of different proof-of-location systems at all.
- **Why hard**: Evidence sources have correlated failure modes that naive fusion treats as independent; "confidence" must be meaningful across systems with incompatible assumptions; formal foundations are unsettled (Bayesian fusion vs. Dempster–Shafer vs. bespoke evidence functions); no ground-truth datasets exist for calibration under adversarial conditions.
- **What progress looks like**: A formal evidence-composition framework with proven properties (information monotonicity, non-additivity of redundant evidence); benchmark datasets with known ground truth and known attacks; an interoperable schema for location claims and evidence adopted by more than one implementation.
- **Adjacent work**: sensor fusion literature; subjective logic; Astral's credibility-vector framework; trust and reputation systems.
- **Disciplines**: statistics, formal epistemology, geospatial science, distributed systems.

## Cluster II — Specifying the Rules

### Challenge 3: Machine-legible spatial policy

- **Problem**: Location-contingent rules today live in statutes, bylaws, customs, and signage written for humans. Machines need formal, executable representations of "what is permitted here" — without flattening the ambiguity that law deliberately preserves.
- **Why hard**: Legal rules resist formalisation (open texture, standards vs. rules, exceptions); spatial boundaries of legal authority are themselves contested and layered; over-formalisation creates brittle, gameable systems; expressiveness trades off against verifiability.
- **What progress looks like**: A policy language (or family) for spatial rules with formal semantics; demonstrations encoding real regulatory regimes (e.g., a marine protected area, a drone no-fly structure, a city's sidewalk-robot ordinance); analysis of what classes of law can and cannot be encoded.
- **Adjacent work**: computational law and Rules as Code; ODRL and policy languages; geofencing standards (e.g., UTM/U-space for drones); smart legal contracts.
- **Disciplines**: computational law, formal methods, legal theory, GIScience.

### Challenge 4: Policy discovery, registries, and authority

- **Problem**: A device anywhere on Earth needs to ask "what rules apply here, and says who?" and receive a complete, current, authenticated answer. No such discovery infrastructure exists.
- **Why hard**: Authority is layered (international, national, municipal, private property, customary); registries require governance of their own (who can publish, amend, revoke); availability and integrity requirements are extreme (offline operation, tamper-evidence); authenticating that a rule genuinely issues from the claimed authority is an unsolved PKI-for-jurisdictions problem.
- **What progress looks like**: Reference architecture for federated spatial-policy registries; a working pilot with at least one real authority publishing machine-readable rules; resolution semantics for overlapping and conflicting claims of authority.
- **Adjacent work**: DNS governance as precedent; land registries and cadastres; aviation NOTAM systems; certificate transparency.
- **Disciplines**: distributed systems, public administration, standards bodies, law.

### Challenge 5: Legitimacy — who writes the rules of a place

- **Problem**: Ensuring the values encoded in spatial policies reflect the people who live in and use those places — not just manufacturers, platforms, or the loudest jurisdiction.
- **Why hard**: Participation mechanisms are expensive and easily captured; affected populations are not coterminous with formal jurisdictions; defaults set by vendors become de facto law; power asymmetries between Global North rule-writers and Global South rule-takers risk a new colonialism of defaults.
- **What progress looks like**: Documented participatory processes for spatial rule-setting piloted at municipal scale; normative criteria for when a spatial policy is legitimate; empirical study of who currently sets machine-behaviour defaults and how.
- **Adjacent work**: deliberative democracy and mini-publics; participatory GIS; platform governance scholarship; commons governance (Ostrom).
- **Disciplines**: political theory, human geography, STS, participatory design.

## Cluster III — Demonstrating Compliance

### Challenge 6: Credible location-aware commitments

- **Problem**: Enabling a machine to prove in advance, to a sceptical verifier, that it will obey location-contingent policies — and to produce auditable evidence afterwards that it did.
- **Why hard**: Commitments must bind the deployed system, not just its stated configuration; hardware-enabled mechanisms raise their own security and governance questions (who holds the keys to the governor?); over-rigid commitments create safety hazards of their own (a vessel that cannot cross a boundary in an emergency); verification must survive software updates and model changes.
- **What progress looks like**: Working prototypes of hardware-anchored spatial commitments on real platforms (a drone, a vessel, a fabrication device); a framework for exception handling and emergency override with accountability; analysis connecting this to the flexHEG/compute-governance mechanism literature.
- **Adjacent work**: hardware-enabled guarantees for AI chips; remote attestation and TEEs; safety cases and assurance arguments; arms control compliance mechanisms.
- **Disciplines**: secure hardware, safety engineering, AI governance, cryptography.

### Challenge 7: Privacy-preserving accountability

- **Problem**: Demonstrating compliance with spatial rules without building a surveillance infrastructure — proving "I did not enter the protected zone" without revealing a movement trace.
- **Why hard**: Accountability and privacy pull in opposite directions by default; zero-knowledge location proofs are young and costly; aggregate compliance evidence can still deanonymise (small-cell problems); the institutions demanding accountability often prefer the surveillance version.
- **What progress looks like**: Practical ZK or TEE-based selective-disclosure schemes for spatial compliance at realistic performance; a disclosure-minimisation framework specifying what each verifier class actually needs to see; legal analysis of whether minimal proofs satisfy existing evidentiary standards.
- **Adjacent work**: zero-knowledge proof systems; differential privacy for location data; privacy-preserving contact tracing (precedent for the politics); data protection law.
- **Disciplines**: cryptography, privacy law, surveillance studies.

### Challenge 8: Enforcement, remedies, and liability

- **Problem**: Determining what happens when a machine violates a spatial rule — detection, attribution, remedy, and the allocation of liability across operator, manufacturer, model developer, and rule-maker.
- **Why hard**: Attribution across the autonomy supply chain is genuinely contested; remote enforcement mechanisms (geofence kill switches) are themselves dangerous and attackable; remedies designed for human violators (fines, licence revocation) map poorly onto fleets; insurance markets lack the actuarial data to price spatial-compliance risk.
- **What progress looks like**: Liability frameworks tested against concrete scenarios; analysis of enforcement mechanism failure modes; insurance and bonding instruments as soft enforcement (precedent: maritime P&I clubs); graduated-response designs that avoid kill-switch brittleness.
- **Adjacent work**: autonomous vehicle liability literature; maritime and aviation liability regimes; cyber insurance; smart contract dispute resolution.
- **Disciplines**: tort and insurance law, economics, safety engineering.

## Cluster IV — Hard Places

### Challenge 9: The global commons

- **Problem**: Governing machine behaviour where no single authority governs — high seas, polar regions, outer space, and international airspace — precisely the domains where autonomous systems are proliferating fastest.
- **Why hard**: Existing commons regimes (UNCLOS, the Outer Space Treaty, the Antarctic Treaty) predate autonomy and bind states, not devices; flag-state enforcement is already weak for crewed vessels; verification without territorial jurisdiction has no enforcement backstop; first movers are setting de facto norms now.
- **What progress looks like**: Mapping of how existing commons regimes do and do not reach autonomous systems; proposals for device-level governance compatible with state-based international law; at least one pilot in a real commons context (e.g., autonomous vessel compliance with marine protected areas on the high seas).
- **Adjacent work**: law of the sea scholarship; space situational awareness and debris governance; Antarctic inspection regimes; IUU fishing enforcement technology.
- **Disciplines**: international law, IR, maritime and space policy.

### Challenge 10: Conflict of laws and jurisdictional arbitrage

- **Problem**: Handling rule conflicts — between overlapping authorities, across borders a machine crosses in seconds, and between jurisdictions competing to attract autonomous systems with minimal oversight.
- **Why hard**: Conflict-of-laws doctrine evolved over centuries for humans and ships, not machine fleets; regulatory competition creates race-to-the-bottom dynamics with no obvious floor; extraterritorial assertions (a manufacturer's home state reaching into deployment states) generate sovereignty disputes; harmonisation is slow while deployment is fast.
- **What progress looks like**: Doctrinal analysis of choice-of-law for autonomous system behaviour; game-theoretic models of jurisdictional competition and identification of stable floors; model interoperability agreements or mutual-recognition regimes.
- **Adjacent work**: private international law; flags of convenience scholarship; data localisation and GDPR extraterritoriality as precedent; tax competition literature.
- **Disciplines**: conflict of laws, game theory, political economy.

### Challenge 11: Security applications and autonomous weapons

- **Problem**: Spatial governance is most urgently demanded, and most dangerous, in military and security contexts — geofenced weapons, no-strike zones, demilitarised corridors — where verification operates against nation-state adversaries.
- **Why hard**: Adversaries here are at the top of the threat-model spectrum; the same geofence that prevents harm becomes a target (defeat the fence, redirect the system); verification regimes require adversary cooperation that may be strategically withheld; the LAWS policy debate is politically gridlocked and a technical-standards track could either help or be co-opted.
- **What progress looks like**: Honest analysis of what spatial constraints can and cannot guarantee against state-level adversaries; arms-control-style verification protocols for spatial commitments (drawing on inspection regime precedent); engagement between the spatial verification and LAWS policy communities.
- **Adjacent work**: LAWS debates (CCW/GGE); arms control verification literature; drone warfare scholarship; nuclear command-and-control as precedent for high-stakes geofencing.
- **Disciplines**: security studies, arms control, international humanitarian law.

## Cluster V — Systemic Risks and Foundations

### Challenge 12: The control plane as a threat vector

- **Problem**: The infrastructure that makes spatial governance possible — verified location, policy registries, compliance attestation — is itself dual-use. The same stack enables totalitarian movement control, automated exclusion, and surveillance at unprecedented granularity.
- **Why hard**: Safeguards must be architectural, not promissory, because operators change; centralised registries and key hierarchies create single points of capture; democratic states build infrastructure that authoritarian successors inherit; the absence of the infrastructure is also harmful, so abstention is not safe either.
- **What progress looks like**: A threat model treating the governance infrastructure itself as the adversary's objective; design patterns that make abusive uses technically costly (decentralisation, key ceremony design, transparency logs, contestability rights); criteria for when spatial governance infrastructure should not be built.
- **Adjacent work**: surveillance studies; lessons from digital identity systems (Aadhaar debates); censorship-resistance research; constitutional limits on movement control.
- **Disciplines**: critical geography, security engineering, civil liberties law, political theory.

### Challenge 13: Multi-agent spatial dynamics and interoperability

- **Problem**: Shared physical spaces will host machines from many manufacturers running different policies, models, and update cadences. Local compliance by each does not guarantee acceptable collective behaviour — and there are no interoperability standards for spatial coordination across vendors.
- **Why hard**: Emergent multi-agent behaviour is hard to predict from individual specifications; standards processes are slow and vendor-captured; a machine's compliance depends partly on others' behaviour (right-of-way, congestion, evasive manoeuvres); simulation environments for mixed-fleet spatial governance barely exist.
- **What progress looks like**: Open simulation testbeds for multi-vendor spatial governance scenarios; minimum viable interoperability standards (the "common spatial protocol" question — interoperable standards, not a single system); empirical study of early mixed-autonomy environments (ports, mines, warehouse districts, low-altitude airspace).
- **Adjacent work**: cooperative AI; UTM/U-space airspace integration; multi-agent RL safety; standards-body case studies (OGC, IEEE, ISO TC 204).
- **Disciplines**: multi-agent systems, standards engineering, transport studies.

---

## Research Infrastructure the Field Needs

- **Benchmarks and datasets**: adversarial proof-of-location benchmarks; ground-truth movement datasets with documented attacks; a public forgery-cost leaderboard.
- **Testbeds**: at least one physical testbed (a port, campus, or airfield) and one high-fidelity simulation environment for mixed-fleet spatial governance.
- **Standards engagement**: a coordinated presence in OGC, IETF, IEEE, and relevant ISO committees so the field shapes rather than reacts.
- **Institutional homes**: the work currently lacks one; candidates include AI governance institutes, geography departments, and law-and-technology centres. Funding mechanisms discussed.
- **Community**: a recurring workshop; a shared bibliography; this paper's author group as the seed.

## Conclusion and Call to Action

- Restate: by-default vs. by-design spatial governance; the window for shaping defaults is now, while deployment is early.
- Specific asks, by audience: AI safety funders (the kinetic-consequences case); governance institutions (an owned research stream); technical researchers (the benchmark and testbed agenda); standards bodies and regulators (pilot partnerships).

## Appendices (candidates)

- A. Glossary of terms (claim, stamp, evidence, proof, credibility vector, certainty spectrum).
- B. The certainty spectrum (L0–L5) for location assurance.
- C. Mapping table: each challenge against adjacent research agendas (Dafoe 2018; Cooperative AI; ML safety; compute governance) showing what is and is not covered elsewhere — the "this is actually new" exhibit.
- D. Scenario bank: the recurring worked examples used throughout (autonomous vessel / marine protected area; DNA synthesizer / authorized facility; delivery drone / municipal corridor; geofenced weapon / no-strike zone). Pick 3–4 and reuse them across all challenges for coherence.
