---
area: research
artifact_kind: paper
created: 2026-07-14
date: 2026-07
purpose: The framework sets out an architecture; turning it into rigorous, measurable
  foundations requires a defined program of work.
approach: A research agenda in three strands -- a taxonomy of location verification
  systems, a composition theory for heterogeneous evidence, and durability mechanisms
  that raise the cost of lying about location.
status_note: Published as working notes, July 2026.
published: true
published_at: 2026-07-14
research_note: obsidian://open?vault=research-notes&file=research/composable-location-verification-research-agenda
role: Author
slug: location-verification-research-agenda
source_note: obsidian://open?vault=xo&file=Research/hoopes-2026-location-verification-research-agenda/composable-location-verification-research-agenda
status: fragment
summary: What comes next after the framework -- formalizing location verification
  systems, composition theory, and durability mechanisms into rigorous foundations.
tags: []
tier: card
tracks:
- location-verification
order: 3
title: A Research Agenda for Composable Location Verification
url: https://johnx.co/research/location-verification-research-agenda
---

## Overview

"Where are you?" is one of the first questions asked in any coordination task involving the physical world. And yet there is still no reliable way to make credible claims about the location of devices, people, assets, or events.

Location data is ubiquitous and almost entirely unverified. GPS coordinates can be spoofed with commodity hardware. IP addresses can be rewritten with a consumer VPN. There is no standard for composing evidence from heterogeneous sources, no theory for modeling independence between signals, and no method for quantifying forgery cost. As embodied AI systems enter governed physical spaces at scale, this gap becomes a critical vulnerability: any capability that conditions behavior on where something happened first requires location evidence that a skeptical party can evaluate and trust.

The [framework for composable location verification](https://johnx.co/research/location-verification-framework) sets out the conceptual architecture: [location verification systems](https://johnx.co/research/location-verification-framework) produce signals that are processed into signed *location stamps*; stamps compose into *location evidence* supporting a spatiotemporal *location claim*; *evidence functions* evaluate that evidence to produce multidimensional *credibility assessments*; and application-specific decision rules map assessments to decisions. That framework is deliberately unopinionated -- it standardizes how evidence is structured while leaving evaluation contextual, so independent systems can compose and forgery cost accumulates across channels.

This note describes the research agenda that follows: the work required to turn that architecture into rigorous, measurable foundations. Location claims are decision tools, contextual to the nature of the interaction and the risk tolerance of the verifier. The goal is not to declare what is true; it is to *raise the cost of lying* about where things happened, and to make the evidence legible enough that system designers and verifiers can make informed decisions about what they are willing to accept.

## Where we are, and where we are going

Verifiable location reporting today is weak in five specific ways.

| Question | Current state | Goal |
|---|---|---|
| How does an agent describe where something happened? | A wide range of formats, coordinate systems, projections, and conventions. Agents built by different teams can't reliably interpret each other's spatial claims. | A self-describing, machine-readable format for location claims that any agent can interpret regardless of who built it. |
| How does an agent know whether to believe a location claim? | Trust is implicit or binary. No rigorous way to assess how hard a claim would be to forge. | A multidimensional assessment of evidence quality -- how accurate, how independent, how resistant to forgery -- that a verifier can evaluate against its own policy. |
| What happens when multiple sources of evidence are available? | Each system produces output in its own format. No standard way to combine or compare them; sensor fusion is proprietary and opaque. | A formal framework for composing heterogeneous evidence, modeling which sources are genuinely independent, and producing a unified assessment. |
| How hard is it to lie about where something happened? | Largely unquantified. Consumer VPNs are ubiquitous; GPS spoofing equipment costs a few hundred dollars. No systematic way to reason about forgery difficulty or relate it to the value at stake. | Forgery cost characterized across technical, economic, and social dimensions -- legible enough that an agent can decide whether the evidence is strong enough for the interaction. |
| How can a claim be verified without trusting the claimant? | Very limited options: IP address lookup, perhaps a mobile device signature. Little cryptographic verification of location evidence. | Verifiable artifacts with digital signatures, reproducible evaluation, and privacy-preserving verification -- the claimant proves where they were without revealing exact coordinates. |

## The problem, in brief

Machines already sense their own position well. LIDAR, optical cameras, GNSS receivers, and inertial sensors let a vehicle transit dense urban environments (Waymo, 2024) or a drone fly through a forest (Loquercio et al., 2021). Intra-agent positional awareness is well developed and improving quickly.

The unsolved problem is *inter-agent* location reporting -- especially when the verifying agent has reason to be skeptical. This has been explored for decades (Saroiu & Wolman, 2009; Chandran et al., 2009; Foamspace, 2018; Zafar & Khan, 2016), but verifiable positioning and reporting protocols remain in their infancy. Most prior work builds an individual verification system around a single signal type. None has engaged with the practical core of the problem: a location claim is a decision tool, contextual to the interaction and the risk tolerance of the verifier.

A large portion of what it means to verify a cyber-physical process *is* location verification. Did the robot perform this procedure? That is largely a question of whether the right components were in the right places at the right times. Did the delivery happen? Did the sensor reading come from the protected area? Did the drone enter restricted airspace? Making credible claims about location to skeptical counterparties is an essential element of coordinating multi-agent cyber-physical systems -- and where there are incentives to lie, to access privileged information, get paid, avoid liability, or enter restricted areas, little technical effort has gone toward secure protocols for reporting where things happen, and less toward verification in adversarial contexts.

## The framework, condensed

To address this, we have been developing a framework for the creation and verification of multi-factor location evidence. We are not designing new location verification systems; we are focused on how evidence collected from different systems can be composed and organized into machine-readable, user-controlled verifiable artifacts.

A *location claim* is a tuple $(x, L, T)$ -- entity $x$ was in region $L$ during time interval $T$. Evidence is created from observable *signals* collected by independent location verification systems and processed into verifiable *location stamps*. A *location manifest* bundles a claim with the location evidence supporting it -- the pair $(C, E)$ that a prover submits to a verifier. (In the [Astral Protocol](https://docs.astral.global/concepts/location-proofs) implementation, these composed artifacts are surfaced to developers as "location proofs." We're moving away from that term because it is imprecise and misleading, especially to cryptographers and mathematicians.)

A verifier processes the manifest with an *evidence function*, which weighs the evidence against the claim along several factors:

- **Robustness** -- the intrinsic reliability of each contributing system, including calibration accuracy, error bounds, and resistance to forgery or manipulation.
- **Independence** -- the degree to which constituent systems provide distinct information rather than redundant signals.
- **Fit to the claim** -- how directly the collected evidence pertains to the specific entity, region, and time interval asserted.

The evidence function is a variable in the framework, not a fixed formula. Verifiers vary in the value they place on different sources -- some weight evidence from official sources heavily, while in other contexts such evidence does nothing to increase trust. The framework standardizes how evidence is structured so that evaluation becomes tractable; it does not prescribe the evaluation itself. The output is a *credibility assessment*: a multidimensional characterization of how well the evidence supports the claim, which an application-specific decision rule then maps to a scalar for comparison against a threshold.

The compositional insight is the payoff. Forgery cost scales non-linearly with the number and diversity of independent systems an attacker must simultaneously defeat. To forge a multi-factor manifest, an attacker might need to spoof GNSS signals, fake a WiFi fingerprint, forge an NFC proximity check, and manipulate network latency measurements at once -- each requiring different equipment, different expertise, and a physical co-presence that conflicts with remote attack vectors. The difficulty of maintaining a coherent lie across independent channels grows faster than the sum of the individual forgery costs.

## The research program

The focus of this agenda is to establish the formal foundations for composable location verification as rigorous infrastructure. Three strands run in parallel.

### A taxonomy of location verification systems

We have conducted an inclusive survey of location verification systems, organizing them into seven categories by their underlying trust mechanisms and forgery models:

1. **Authority-based.** Mobile network operators, government registries, institutional attestations. Trust derives from the authority's reputation.
2. **Social / peer witness.** Co-location attestation by other agents or humans. Trust derives from the independence and honesty of witnesses.
3. **Near-field machine.** NFC, Bluetooth Low Energy, Ultra-Wideband ranging, distance-bounding protocols. Trust derives from physics -- radio propagation constraints.
4. **Network multilateration.** WiFi RTT, cellular TDOA, network latency proofs. Trust derives from the difficulty of simultaneously spoofing multiple independent network paths.
5. **Sensor data.** GNSS (including authenticated signals via Galileo OSNMA), barometric pressure, magnetic field fingerprints, audio environment signatures. Trust derives from the difficulty of fabricating consistent multi-sensor readings.
6. **Legal.** Notarized attestations, jurisdiction-derived claims, address registrations. Trust derives from legal accountability.
7. **Delegated.** Trusted third-party assertions -- Find My networks, assisted GPS, carrier-provided location. Trust derives from the service provider's infrastructure and incentives.

This taxonomy needs to be made rigorous. The first research output is a systematic survey that identifies the *irreducible dimensions* along which location verification systems vary -- the dimensions that will inform the structure of the credibility assessment. Each system has a distinct forgery-cost profile and set of durability properties, and the critical insight is this: combining stamps from *independent* categories raises the difficulty of forgery because the attack vectors are physically unrelated. The work will formalize the patterns across, and unique to, these systems, and provide a systematic approach to assessing and onboarding new ones.

### A composition theory

How does location evidence compose? Two GNSS-derived stamps share a similar root signal -- if an attacker spoofs that signal, both are compromised at once. But a GNSS stamp and an NFC proximity check are independent: different physical phenomena, different attack surfaces. A composition theory must formally characterize:

- when two stamp types provide genuinely independent evidence versus redundant signals from a shared or correlated root;
- how independent evidence combines to raise the difficulty of forgery;
- what mathematical formalisms are appropriate -- Dempster-Shafer belief functions, Bayesian networks, information-theoretic approaches, or something new.

This is open research. Rigorously quantifying the independence between heterogeneous location verification systems is, as far as we can determine, an unsolved problem. We plan to investigate information-theoretic approaches (mutual information between stamp outputs given shared inputs) and structural approaches (dependency graphs over signal sources).

### Durability mechanisms

What are the levers available to raise the cost or difficulty of lying? They split into two categories.

*Intrinsic mechanisms* are properties of the signal and hardware; they apply universally regardless of context. Pushing cryptographic verifiability further up the signal supply chain is the primary technical lever: signed OSNMA signals are harder to forge than unsigned GPS; secure peripherals -- sensors cryptographically bound to a secure element -- are harder to circumvent than unattested sensors; evidence processed in a trusted execution environment carries hardware-backed guarantees that software alone cannot provide.

*Extrinsic mechanisms* are consequences imposed by context; they depend on who is involved and what is at stake. A legal affidavit carries a forgery cost proportional to the penalties for perjury in the relevant jurisdiction. A reputational system imposes a social cost -- a corporate entity discovered issuing fraudulent location claims faces stock price impact, regulatory scrutiny, and lost partnerships. Economic bonds or insurance requirements create financial stakes.

The distinction matters because the same evidence bundle has different effective forgery costs in different settings. The evidence function must be able to surface both intrinsic and extrinsic properties without prescribing how they are weighed. This is what lets the credibility assessment stay portable while the decision stays contextual -- we standardize the evidence structure so that evaluation becomes a tractable problem, and leave the weighting to the verifier's own risk model.

## Technical risks and open unknowns

- **Correlation modeling.** Measuring independence between systems that may share partial signal overlap -- GNSS-derived stamps with different processing chains, or WiFi positioning calibrated against GPS ground truth -- requires a formal framework that does not yet exist. The fallback is empirical correlation measurement using controlled experiments with known ground truth.
- **Credibility assessment dimensionality.** The irreducible dimensions may be context-dependent rather than universal. If principled dimensionality reduction proves elusive, the fallback is domain-specific credibility profiles rather than a single canonical structure.
- **Normalization.** A three-meter GPS fix, a city-level network latency proof, and a binary NFC proximity check operate at fundamentally different spatial scales with different semantics. Making these commensurable without collapsing meaningful distinctions is a genuine calibration challenge.
- **Signal supply chain.** The strength of a manifest is bounded by the weakest link between the physical signal and the signed output. Pushing verifiability toward the source (secure peripherals, authenticated signals) raises forgery cost substantially but depends on hardware decisions by chipset manufacturers and OEMs largely outside our influence. The framework must work with today's hardware while accommodating stronger guarantees as they emerge.
- **Ecosystem dependence.** The highest-value mechanisms -- authenticated satellite signals, secure sensor attestation -- require upstream decisions by space agencies, chipset vendors, and device manufacturers. We can define interfaces and demonstrate value; we cannot compel adoption.

## Intended impact

- **Local alignment.** Location-aware safety specifications -- parameterizing what constitutes "aligned" behavior based on where an agent operates -- depend on verifiable location as a precondition.
- **Governance of autonomous systems.** Provably-compliant spatial policies for drones, autonomous vehicles, and robotic systems operating in regulated physical spaces.
- **Machine-enforceable spatially-constrained agreements.** Location-contingent contracts and treaties where compliance can be verified cryptographically rather than adjudicated after the fact.

Reliable location verification is required for credible location-contingent commitments, and foundational for the spatial governance of intelligent machines. The timing -- embodied AI deploying now, formal standards not yet set -- makes this the moment to establish the foundations.

## References

Chandran, N., Goyal, V., Moriarty, R., Ostrovsky, R. (2009). Position Based Cryptography. *CRYPTO 2009*.

Foamspace Corp. (2018). FOAM Whitepaper.

Hoopes, J. (2025). [Towards Harder Location Proofs](https://collective.flashbots.net/t/towards-stronger-location-proofs/5323). Flashbots Collective Forum.

Hoopes, J., & Oshan, T. (2025). [Towards a Decentralized Geospatial Web](https://osf.io/bg2uq_v1). GISRUK 2025.

Humphreys, T., et al. (2008). Assessing the Spoofing Threat: Development of a Portable GPS Civilian Spoofer. *ION GNSS 2008*.

Loquercio, A., et al. (2021). Learning High-Speed Flight in the Wild. *Science Robotics*.

Rawson, P., & Borreani, L. (2026). [Topocurrencies: When Money Learns Where It Is](https://ecofrontiers.xyz/topocurrencies). Ecofrontiers.

Saroiu, S., & Wolman, A. (2009). Enabling New Mobile Applications with Location Proofs. *HotMobile 2009*.

Waymo. (2024). Waymo One: Autonomous Ride-Hailing in San Francisco, Phoenix, and Los Angeles.

Zafar, F., & Khan, A. (2016). A Survey of Location Verification Techniques for IoT. *IEEE Communications Surveys & Tutorials*.
