---
created: 2025-12-17
featured: false
featured_order: null
published: true
published_at: 2025-12-18
research_note: obsidian://open?vault=research-notes&file=notes/State%20of%20Provenance%20Verification%20for%20Remote%20Sensing%20Imagery
source_note: obsidian://open?vault=xo&file=Notes/State%20of%20Provenance%20Verification%20for%20Remote%20Sensing%20Imagery
status:
- working
summary: How can we trust our eyes in the sky?
tags:
- geospatial
title: State of Provenance Verification for Remote Sensing Imagery
url: https://johnx.co/notes/state-of-provenance-verification-for-remote-sensing-imagery
---
There is growing demand for verifiable satellite imagery. Customers — particularly in government, insurance, and media — are asking questions that providers cannot currently answer: _How do I know this image hasn't been tampered with? Can you prove this is what the satellite actually captured?_

The honest answer, today, is: not really.

Rich metadata exists. File transfer checksums exist. Transport encryption exists. But there is no broadly adopted, interoperable, end-to-end, customer-facing provenance standard for commercial earth observation (EO) imagery or other geospatial datasets. 

Instead, the industry relies on contractual relationships and institutional trust. This has worked well up until now, but as a growing number of commercial players broaden out the Earth observation data market, and new pressures and security risks emerge, verifiability is becoming more and more important.

The building blocks are emerging, though they're immature. The [Coalition for Content Provenance and Authenticity](https://c2pa.org/) (C2PA) provides a provenance architecture for content credentials. [SpatioTemporal Asset Catalogs](https://stacspec.org/en) (STAC) provide the dominant metadata standard and a natural integration point. The Open Geospatial Consortium is developing an [EO-specific verification framework](https://www.ogc.org/blog-article/navigating-synthetic-imagery-trust-geospatial-data/). But no standards-based operational system has emerged that delivers interoperable, customer-facing provenance across commercial EO providers.

This may change gradually as standards mature. Or it may change rapidly — triggered by a prominent geospatial deepfake, a major procurement mandate, or an insurance claim gone wrong. The underlying demand is nascent, but my read is that it's real and growing. The question is when, not whether, the industry responds.

## 1. Introduction

Generative AI has made synthetic imagery trivially easy to produce. This creates an obvious problem for a domain where imagery is used for important decision-making — about environmental conditions, infrastructure status, military movements, treaty compliance, insurance claims.

Satellite imagery has historically benefited from an implicit trust model: the technical barriers to producing it were high enough, and legal contracts were sufficient, that authenticity was assumed. That assumption is eroding. Customers are starting to ask hard questions about chain of custody, and providers are discovering they lack good answers. A growing and decentralizing data supply chain is expanding the security / risk surface area. 

The use cases driving this demand are varied: 

**Defense and intelligence.** Verifying that imagery of contested regions hasn't been manipulated between capture and analysis. The concern isn't just external threat actors — it's the integrity of data flowing through multi-stakeholder pipelines involving commercial providers, allied partners, and potentially adversarial ground infrastructure. 

**Media verification.** News organizations increasingly rely on commercial satellite imagery for stories involving conflict, disaster, or environmental change. Authenticity matters for credibility — and for liability.

**Parametric insurance.** Automated payouts triggered by satellite-derived metrics (crop damage, flood extent, drought indices) create obvious incentives for manipulation. Insurers need confidence in the data triggering their exposure.

**Legal and evidentiary use.** The Berkeley Protocol (2022) established frameworks for using open-source digital evidence in international justice contexts. Satellite imagery is increasingly presented in legal proceedings. Current chain-of-custody practices — often just cryptographic hashing (if verification exists at all) — are increasingly acknowledged as inadequate.[^berkeley]

**Regulatory compliance.** EUDR deforestation monitoring, carbon credit verification, and other compliance regimes depend on satellite-derived data. The stakes of manipulation are significant.

The gap between what customers are asking and what providers can deliver is real. This note examines that gap: what exists today, what's hard about closing it, and where things are headed.
## 2. Current State of Provider Practices

Major satellite imagery providers deliver rich metadata with their products. A common STAC-compliant delivery includes acquisition timestamps, sensor parameters, processing levels, cloud cover assessments, geometric accuracy metrics, and more. This metadata is valuable for understanding what you're looking at.

But it doesn't prove the imagery is authentic.

**What providers offer:**

- **Metadata.** STAC or proprietary formats describing acquisition and processing parameters. Comprehensive, standardized, useful as descriptive claims.
- **File transfer checksums.** Cryptographic hashes published alongside downloads. These verify that the file you downloaded matches what the server sent. They say nothing about whether that file was tampered with before distribution.
- **Transport encryption.** HTTPS for API access, encrypted downlinks from satellites. Protects data in transit.

**What's absent:**

- Public key infrastructure / identity system associating public keys with organizations involved in the EO data value chain
- Cryptographic signatures binding imagery to claims about its origin
- Signed attestations at capture, processing, or distribution points
- Verifiable processing history that can be independently audited
- Any mechanism for detecting tampering that occurred before distribution

The European Space Agency's (ESA) Copernicus Sentinel program is a prominent example. Each Sentinel-2 product includes a `manifest.safe` file listing every component file with a SHA3-256 checksum.[^sentinel] This is better than nothing, but these checksums are generated at the distribution point. They prove your download of final processed imagery wasn't corrupted, leaving everything "upstream" of that inscrutable and unverifiable.

The distinction matters. A file transfer checksum answers: "Did this file arrive intact?" A provenance verification system answers: "Is this the data that < entity X > claims to have captured/processed, and has it been modified since? By whom? By what algorithms" The first is a network reliability check. The second is tamper detection with chain of custody. The industry currently does the first and calls it integrity verification.

## 3. Key Challenges

The absence of provenance verification for satellite imagery isn't an oversight. It's hard, and hasn't been a big enough problem to be worth solving. Several interlocking challenges explain why this problem remains unsolved.

### 3.1 The Processing Pipeline Problem

Satellite imagery undergoes extensive legitimate transformation before it reaches customers. Raw sensor data is radiometrically corrected to account for sensor characteristics. It's geometrically corrected through orthorectification — a process that adjusts pixel positions based on terrain elevation models and lens angles to remove distortions from viewing angle and topography. Atmospheric correction removes haze and scattering effects. Pan-sharpening fuses high-resolution panchromatic data with lower-resolution multispectral bands. Format conversion produces deliverable file types.

Each of these steps produces genuinely different data. Because the bytes change, a typical cryptographic hash of orthorectified imagery will have zero relationship to a hash of the raw capture.

This breaks the simplest approach to integrity verification: hash at capture, verify hash at delivery. That only works if the data doesn't change. Satellite imagery, by its nature, changes a lot between capture and delivery.

**The sub-image problem.** Customers often don't receive full scenes. They receive clipped Areas of Interest — a subset of a larger capture, extracted to cover their specific geography. How do you cryptographically associate a clipped sub-image with the parent image it was derived from?

Potential approaches include:

- Pre-tiled imagery with per-tile provenance chains, so customers receive tiles that were signed as discrete units
- Merkle tree structures that allow proof that a sub-region belongs to a signed whole, without requiring the whole
- Trust-based architectures where the provider offers verification guarantees for derived products, backed by auditable processes

None of these are standardized or widely implemented.

**Perceptual hashing.** One intuitive approach is perceptual hashing — algorithms that produce similar hashes for visually similar images, robust to minor transformations. These are used for near-duplicate detection in content moderation and copyright enforcement.

Toomey et al. explored perceptual hashing for satellite imagery verification and found it unsuitable.[^toomey] These algorithms are designed to detect whether two images are "basically the same" — not to provide cryptographic integrity guarantees. They lack the security properties required for evidentiary or defense applications. A perceptual hash might not change when an image is subtly manipulated in ways that matter (altered coordinates, removed objects, synthetic insertions). As they stand, Toomey found a fundamental mismatch between perceptual hashing algorithms and the job to be done — though perhaps innovation in that family of algorithms could provide useful tools for verification.

### 3.2 Multi-Stakeholder Chain of Custody

A typical satellite image passes through multiple organizations before reaching the end customer:

1. **Satellite operator** — owns and controls the spacecraft, operates ground stations
2. **Ground station** — receives downlinked data, may be operated by the satellite owner or a third party
3. **Processing facility** — applies corrections and produces distributable products
4. **Distributor or aggregator** — may source from multiple providers, offers unified access
5. **End customer** — receives and uses the imagery

Trust boundaries don't align with data flow. An aggregator can attest to what they received from upstream providers and what processing they applied. They cannot make claims about what happened before the data reached them — that's outside their visibility and control.

Examples from the defense industry illustrates this: a military consumer's concern may not be that the distributor might tamper with imagery, but that imagery might be manipulated somewhere in the upstream chain before it ever reached the distributor. The hardest part of the problem is the part furthest from the customer.

End-to-end verification for a sophisticated data supply chain requires coordination across organizational boundaries, and buy-in from the hardware designers and operators. That's not primarily a technical problem — it's an institutional and commercial one.

### 3.3 Space Segment Constraints

Signing imagery at the point of capture — on the satellite itself — would provide the strongest possible provenance guarantee. It would also be the hardest to implement.

The challenges are substantial:

- **Hardware requirements.** Cryptographic signing requires secure key storage. Radiation-hardened secure enclaves are specialized components that weren't standard in satellite designs until recently (and still aren't universal).
- **Key management.** Keys on satellites need to be issued, potentially rotated, and revocable if compromised. Key management infrastructure for space assets is complex — you can't just swap out a hardware security module in orbit.
- **Retrofit infeasibility.** Satellites already in orbit cannot feasibly be upgraded with new hardware. Given 5-15 year operational lifetimes and multi-year development cycles, most current constellations weren't designed with this capability and can't acquire it.
- **Where in the pipeline?** Even on-board, data undergoes processing — compression, preliminary corrections, formatting for downlink. Signing the raw sensor readout might not be practical or meaningful. Signing the post-compression data means the signature covers a processed product.

Though not identical, Global Navigation Satellite Systems (GNSS) are instructive here. Galileo's OSNMA (Open Service Navigation Message Authentication) broadcasts signed navigation messages from satellites. Receivers can verify authenticity and reject spoofed signals.[^osnma] But retrofitting verifiability into an existing system took quite a lot of work. In addition, GNSS systems have much different design requirements — challenging in their own right, but different.

The near-term reality is that space-segment signing will only become available as new satellites are designed and launched with this capability. That's a multi-year horizon at minimum.

### 3.4 Verification Usability

A signature is only valuable if someone actually verifies it. This raises practical questions that don't have good answers yet.

**Tooling.** What software does a customer use to verify imagery provenance? For C2PA-signed photos, browsers and image viewers are beginning to display Content Credentials. For satellite imagery, equivalent tooling doesn't exist (yet). Verification today would mean custom code or manual processes.

**Workflow integration.** Imagery goes into GIS systems, analysis pipelines, machine learning workflows. Adding a verification step adds friction. If verification isn't seamless, it won't happen consistently.

**Failure modes.** What happens when verification fails? Is the imagery rejected? Quarantined for investigation? How do you distinguish a legitimate processing variation from actual tampering? False positives could be highly disruptive; false negatives defeat the purpose.

**Expertise requirements.** Meaningful verification requires understanding what the claims actually mean and what the signatures actually prove. A "verified" badge is only useful if users understand its scope and limitations.

These are solvable problems, but they're not solved yet. Standards for EO provenance will need to address usability alongside cryptographic architecture.

### 3.5 Standards Development In Progress

There is no ratified industry standard for Earth observation provenance verification. Work is underway, but productization is still ahead.

The coordination problem is real:

- **Providers** face uncertainty about the strength of demand and the specific requirements. Investing in provenance infrastructure has unclear ROI until the market crystallizes.
- **Customers** face uncertainty about what's technically feasible, what it would cost, and how to write procurement requirements for something that doesn't have standard terminology.
- **Standards bodies** are working toward solutions, but adoption requires critical mass of implementers and users.

This creates inertia. But the conditions for rapid change are present. The entire industry could adopt provenance verification in a relatively compressed timeframe given the right trigger — a prominent geospatial deepfake[^geo-deepfake] causing significant harm, a major government procurement mandate, or ratification of a clear standard that gives providers a target to implement against.

## 4. Elements of a Provenance Architecture

What would a provenance verification system for satellite imagery actually look like? Several components would need to work together.

### 4.1 Data Integrity

At the foundation is the digital signature. A [hash function](https://en.wikipedia.org/wiki/Hash_function) accepts a large input file and outputs a fixed-size digest — change any bit, the hash changes. A signature binds that hash to a specific key pair: anyone with the public key can verify that whoever holds the corresponding private key signed that exact data. 

Hashing detects tampering; signatures add non-repudiation and create an anchor for attribution. Establishing that a given key pair belongs to a specific entity — that this public key really is Maxar's, for example — is a separate problem, addressed through certificate authorities, PKI, secure hardware, or other trust frameworks.

A critical question is _where_ and _when_ the signature is generated, because that determines what it proves:

| Signed at...                         | Proves...                                             |
| ------------------------------------ | ----------------------------------------------------- |
| Distribution point                   | File wasn't corrupted in transit (download integrity) |
| Post-processing output               | Data changes are proper since processing completed    |
| Ground station receipt               | Data changes are proper since downlink                |
| On-board capture (furthest upstream) | Data changes are proper since acquisition             |

Current industry practice mostly involves the first category. When a provider says "we provide checksums for integrity verification," it's worth asking: integrity since _when_?

**Why this is hard.** Satellite imagery moves through a multi-stakeholder supply chain — operator, ground station, processing facility, aggregator, customer — with legitimate transformations at each step. Tracking those transformations in credible, verifiable, and eventually consistent ways is the core challenge: who did what, using which algorithms, with what parameters, producing what outputs? When the algorithms are proprietary, when handoffs cross organizational boundaries, and when each entity has limited visibility into what happened upstream, building a trustworthy chain becomes genuinely difficult.

### 4.2 Provenance Manifests

Beyond verifying that data hasn't changed, provenance systems need to record _what happened_ to produce that data. A provenance manifest is a structured record of the processing chain: inputs consumed, algorithms applied, parameters used, software versions, outputs produced.

**Existing approaches:**

- **STAC Processing Extension.** Adds fields like `processing:lineage` and `processing:software` to STAC metadata. Useful for recording processing history, but the core fields are descriptive metadata. Work on cryptographic binding within the STAC ecosystem may be underway. (If you know of anything going on here, please reach out! I'm curious.)[^stac-processing]

- **C2PA.** The Content Credentials model uses signed manifests containing assertions (claims about the content), actions (what was done to it), and hash references (binding claims to specific data). This architecture is directly applicable to EO imagery (complexities are explored later).[^c2pa]

- **STACD.** New academic work extending STAC with DAG-based workflow tracking, algorithm versioning, and support for selective recomputation. More rigorous provenance model, but not commercially deployed.[^stacd]

The key distinction is whether the manifest is merely recorded or cryptographically bound to the data it describes. Recording is useful for audit trails. Binding enables verification.

### 4.3 The Verification Spectrum

Not all verification is equal. There's a spectrum of assurance levels, from implicit trust to cryptographic proof of computation:

**Level 1: Trust assertion.** "The provider says it's authentic." This is the current industry default. It relies entirely on the provider's reputation and the legal/contractual accountability that creates. Provides no cryptographic verification.

**Level 2: Logged provenance.** Processing history is recorded and available for audit. STAC Processing Extension operates here. An audit trail exists, but there's no cryptographic binding — you're trusting that the logs are accurate.

**Level 3: Signed attestations.** Each entity in the chain signs claims about what they received and what they did. Signatures provide tamper detection and non-repudiation. If a signature verifies, the claim wasn't modified after signing. This is where C2PA operates.

**Level 4: Chained signatures.** Each transformation cryptographically references the previous state. The output signature covers both the new data and the input signature. This creates an auditable chain where each link is independently verifiable.

**Level 5: Reproducible processing.** Given the inputs and the algorithm specification, a verifier can reproduce the output. If the reproduced output matches the delivered output, the processing was correct. This requires deterministic algorithms and access to inputs — not always feasible.

**Level 6: Verifiable compute.** Cryptographic proof that a computation was performed correctly, without needing to reproduce it. Zero-knowledge proofs and trusted execution environments (TEEs) enable this in principle. For satellite imagery processing, this remains research-stage.

**Inverse processing.** Toomey et al. proposed an approach where, for certain invertible transformations, the verifier reverses the processing and checks the result against an original signature.[^toomey] This eliminates the need to access the original data — you verify by undoing the transformation. It's limited to invertible operations, which excludes lossy compression and many complex processing steps, but it's a clever approach for applicable segments of the chain.

For practical near-term implementation, levels 3-4 (signed attestations and chained signatures) represent the realistic target. They provide meaningful verification without requiring breakthroughs in verifiable computation.

### 4.4 Identity and Trust Anchors

Signatures require verifiable identity. When imagery is signed by "Maxar," how do you know it was actually signed by Maxar and not someone claiming to be Maxar?

This is a solved problem in other contexts. Public key infrastructure (PKI), certificate authorities, and established identity verification practices exist. The question is how they apply to the EO context.

The good news is that enterprise and government use cases actually simplify this. Customers typically have contractual relationships with their imagery providers. There's already an established identity context — business registration, contracts, legal liability — upon which to build a trust model. (A fully decentralized trust model for identity verification increases complexity considerably.) Hierarchical trust, where a recognized authority vouches for provider identities, mirrors existing business relationships.

Key management remains important: how are signing keys issued? How are they protected? What's the rotation policy? What happens if a key is compromised? These are operational questions with established answers in other industries.

**Provider trust frameworks.** Beyond cryptographic identity, there's a broader question of provider trustworthiness. MITRE's Architecture Score Index (ASI) provides a framework for scoring the cybersecurity posture of commercial space providers — combining compliance certification (CMMC), operational metrics (patch cadence), and incident response performance into a quantitative trust score.[^mitre-asi] This addresses "will their systems get breached?" rather than "is their data authentic?" — but the framework approach could inform analogous assessments of provenance practices. It's not clear how well developed or implemented MITRE's approach is. 

## 5. Standards and Research Landscape

### 5.1 Adjacent Standards

**C2PA (Coalition for Content Provenance and Authenticity).** C2PA defines a technical standard for content credentials — cryptographically signed manifests that travel with media files, recording provenance and editing history. The coalition includes Adobe, Google, Microsoft, BBC, and others. Adoption is growing for photographs, video, and AI-generated content. Browsers and platforms are beginning to surface Content Credentials to users.[^c2pa]

To my knowledge, there is no production implementation of C2PA for Earth observation imagery. C2PA is designed for digital content with a different production workflow, which may introduce technical barriers to its application to EO data products. In principle, the architecture — manifests, assertions, hash binding, signature chains — applies directly. For example, C2PA already supports sidecar manifests and ‘collection hashing’ for multiple-file assets, which maps more naturally to EO bundle deliveries than single-image workflows. But in practice things might be more complicated. Exploratory work is underway, and it seems that non-trivial integration work is required for multi-file EO products, geospatial metadata conventions, and GIS tooling — not to mention verification scripts and UI components to make C2PA manifest for geospatial data actually actionable.

**STAC (SpatioTemporal Asset Catalog).** STAC has become the dominant metadata standard for EO imagery. Its extension mechanism allows domain-specific additions. The Processing Extension provides fields for recording processing history, but as noted, these are descriptive rather than cryptographic.[^stac-processing]

STAC is the natural integration point for any provenance layer. A future "STAC Provenance Extension" or similar could define how cryptographic signatures and verification metadata are represented within the STAC ecosystem.

### 5.2 OGC Testbed Work

The Open Geospatial Consortium has been exploring EO data verification through its testbed program.

**Testbed 19, 20, 21.** Each testbed cycle has included threads related to data quality, traceability, and integrity. The DQ4IPT (Data Quality for Integrity, Provenance, and Trust) testbeds have been developing schemas for EO Verifiable Claims, drawing on verifiable credentials concepts.[^ogc-testbed]

Scenarios explored include:

- Parametric insurance requiring verified imagery for claim triggers
- Carbon market verification where satellite-derived measurements affect credit issuance
- EUDR compliance using deforestation monitoring data

This work is producing specifications and reference implementations, but it remains in the testbed phase. Transition to ratified standards and commercial deployment is still ahead.

**OGC Blockchain and DLT Domain Working Group.** This working group provides a coordination point for standards work involving distributed ledger technologies and related verification approaches. It's a venue for cross-organizational discussion on where standards should go.

### 5.3 Prior Research and Proofs of Concept

**ESA BC4SA (Blockchain for Space Activities).** In 2019-2020, ESA ran a proof-of-concept with Guardtime using KSI blockchain for EO data provenance. The project demonstrated technical feasibility — data could be hashed, timestamps anchored to a blockchain, integrity verified. It was never productized or operationalized.[^bc4sa] The gap between proof-of-concept and production remains.

**Sandia National Laboratories.** Toomey et al.'s work on verification for untrusted ground stations addresses a specific threat model: what if the ground station processing your satellite data is compromised or adversarial?[^toomey] The inverse processing approach — reversing transformations to check against original signatures — offers a path to verification through legitimate processing steps, at least for invertible operations. The paper also documents the limitations of perceptual hashing for this application.

**STACD.** Academic work from IIT Delhi extending STAC with more rigorous provenance tracking — DAG-based workflow representation, algorithm versioning, selective recomputation.[^stacd] Represents what a more complete provenance model could look like, though it's not commercially deployed.

**Berkeley Protocol.** Published by the UN Human Rights Office and UC Berkeley, this protocol provides a framework for digital open-source investigations, including handling of satellite imagery as evidence.[^berkeley] It documents current practices (which often rely on cryptographic hashing) and points toward needs for stronger chain-of-custody mechanisms.

### 5.4 Related Domains

**GNSS authentication.** Navigation signals face spoofing threats analogous to imagery manipulation. Galileo's OSNMA and GPS's CHIMERA represent operational or near-operational authentication systems for satellite-broadcast data.[^osnma] The design requirements differ substantially — real-time verification, broadcast model, receiver constraints — but these systems demonstrate that space-segment authentication is achievable when designed in from the start.

### 5.5 Alternative Approaches

Cryptographic provenance isn't the only path. Machine learning-based deepfake detection offers a complementary approach — training classifiers to identify synthetic or manipulated imagery based on artifacts, inconsistencies, or statistical anomalies. Recent work has applied this specifically to [geospatial imagery](https://www.darkreading.com/threat-intelligence/why-17-year-old-built-ai-expose-deepfake-maps), detecting manipulated satellite images and maps.

The appeal is lower coordination overhead. Detection can happen downstream, without requiring upstream providers to implement new infrastructure. A customer or platform can run detection independently.

The limitation is that these approaches are probabilistic, not deterministic. A classifier gives you a confidence score, not a verifiable proof. And they're subject to the [Red Queen effect](https://en.wikipedia.org/wiki/Red_Queen_hypothesis): any detection method that GANs can learn about, GANs can learn to evade. The arms race favors the attacker over time.

## 6. Paths Forward

### 6.1 Near-Term Opportunities

Several things are buildable now, without waiting for new standards or upstream provider changes:

**C2PA for EO.** The C2PA specification exists. Libraries exist. Tooling exists. An imagery provider or aggregator could implement C2PA signing for their deliverables today. This wouldn't provide end-to-end verification from capture, but it would provide signed attestation of what the provider is delivering — far more than currently exists.

**Aggregator-level provenance.** Organizations that source imagery from multiple providers are well-positioned to implement provenance practices. They can:

- Sign imagery upon receipt from upstream ("this is what we received from [provider] on [date], with hash [X]")
- Log and sign their own processing steps
- Deliver to customers with a complete manifest of the aggregator-controlled portion of the chain

This creates partial chain of custody. It also creates pressure on upstream providers to offer similar capabilities, extending the chain backward over time.

**Transparent logging.** Even without cryptographic binding, systematic logging of provenance information — published and auditable — establishes practices and surfaces requirements. What claims matter? What format should they take? What do customers actually want to verify? Logging-first implementations can inform later cryptographic implementations.

**Cryptographic + ML approaches.** If designed properly, cryptographic approaches offer determinism — a valid signature is valid, full stop — but require coordination across the supply chain. Detection approaches offer independence but degrade as adversaries adapt.

The path forward is clearly defense-in-depth: cryptographic provenance where achievable, detection-based methods as a complementary layer, and operational practices (source diversity, anomaly flagging, human review for high-stakes use cases) filling remaining gaps. No single mechanism will be sufficient.

### 6.2 Industry Coordination Needs

Some problems require coordination across the industry:

**EO-specific profiles.** C2PA and verifiable credentials are general-purpose. EO imagery has specific characteristics — processing levels, sensor types, geometric and radiometric properties, the sub-image problem. An EO profile would define how these domain-specific claims are represented and verified.

**Interoperability.** If each provider implements provenance differently, customers face integration complexity and can't compare across providers. Common formats and verification procedures are needed.

**Procurement language.** Government customers have significant market influence. Clear procurement requirements for provenance capabilities — written into RFPs and contract language — would create unambiguous demand signals. This requires procurement officials to understand what's feasible and how to specify it.

### 6.3 Longer-Term Infrastructure

Some capabilities require sustained investment:

**Provider-level signing.** Major operators (Maxar, Planet, Airbus, etc.) implementing signing at their processing output. This requires internal infrastructure investment and, likely, confidence that the market will value it.

**Ground station signing.** Moving the signature point earlier — to ground station data receipt rather than post-processing output. Requires ground infrastructure changes.

**Space-segment signing.** Next-generation satellites designed with on-board signing capability. This is happening incrementally as new systems are designed, but it's a long cycle.

**Verifiable compute.** As zero-knowledge proof and TEE technologies mature, they may eventually enable cryptographic verification of complex processing pipelines. This remains research-stage for imagery.

### 6.4 Trigger Scenarios

Industry adoption could be gradual — or it could flip rapidly. Potential triggers:

- **A prominent geospatial deepfake** causing reputational, financial, or security harm. The equivalent of a major disinformation incident, but with satellite imagery. This hasn't happened yet in a way that achieved widespread attention. When it does, the demand for verification will spike.
- **Procurement mandates.** A major customer (NGA, NRO, ESA, a large insurance consortium) requiring provenance capabilities as a condition of contract. This converts latent demand into hard requirements.
- **Standards ratification.** An OGC or equivalent standard reaching ratification gives providers a clear implementation target. Reduces uncertainty about what to build.
- **Liability events.** Litigation or regulatory action where inability to demonstrate imagery authenticity causes material harm. Creates defensive incentive to implement provenance practices.

## 7. Conclusion

The need for verifiable satellite imagery is real and growing, though it's only just coming into the light. The technical building blocks exist, with significant caveats and implementation complexities. The gap is coordination and market demand.

Today's state:

- Rich metadata, but not cryptographically bound
- Transfer checksums, but not provenance verification
- Implicit trust models that rely on provider reputation

What's needed:

- Signed attestations at multiple points in the chain
- Provenance manifests recording processing history
- Standards that enable interoperability and clear requirements
- Tooling that makes verification practical
- Robust cross-verification systems

This will happen. The pressure from deepfakes, regulatory requirements, legal evidentiary standards, and customer demand makes it inevitable. The question is whether the industry moves proactively — shaping standards, building capability, establishing competitive advantage — or reactively, scrambling after a crisis.

## References

[^berkeley]: UC Berkeley Human Rights Center and UN Human Rights Office, "Berkeley Protocol on Digital Open Source Investigations," 2022.

[^sentinel]: ESA, "Update of Copernicus Sentinel-2 Level-1C and Level-2A Processing Baselines," Sentinel Online, 2021. Documents transition from MD5 to SHA3-256 checksums in manifest.safe. [Link](https://sentinels.copernicus.eu/-/update-of-copernicus-sentinel-2-level-1c-and-level-2a-processing-baselines-1).

[^toomey]: J. Toomey, "A Step Toward Working with Untrusted Ground Stations," Sandia National Laboratories, SAND2022-5368, 2022.

[^osnma]: European GNSS Agency, "Galileo Open Service Navigation Message Authentication (OSNMA)." See also Septentrio, "OSNMA: The Latest in GNSS Anti-Spoofing Security."

[^geo-deepfake]: Cartography and Geographic Information Science, "Deep fake geography? When geospatial data encounter Artificial Intelligence." Zhao et al.

[^stac-processing]: STAC Processing Extension, https://github.com/stac-extensions/processing

[^stacd]: "STACD: Spatial Temporal Asset Catalog with Directed Acyclic Graph," PROPL 2025 / IIT Delhi research.

[^c2pa]: Coalition for Content Provenance and Authenticity, C2PA Technical Specification, https://c2pa.org/specifications/

[^ogc-testbed]: OGC Testbed-20, INTEGRITY, PROVENANCE, AND TRUST (IPT) REPORT, 2024. [Link](https://docs.ogc.org/per/24-033.pdf).

[^bc4sa]: ESA, "Blockchain for Space Activities (BC4SA)," 2019-2020.

[^mitre-asi]: S. Kinser et al., "Scoring Trust Across Hybrid-Space: A Quantitative Framework Designed to Calculate Cybersecurity Ratings, Measures, and Metrics to Inform a Trust Score," MITRE Corporation / US Space Force, 34th Annual Small Satellite Conference, 2020.

---

_This document is intended as a research note for the OGC community and broader Earth observation industry. Comments and corrections welcome._