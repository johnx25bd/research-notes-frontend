---
area: research
artifact_kind: paper
created: 2026-07-14
date: 2026-07
fits: The second input to a location-contingent decision -- verification says where
  something is, and the registry says what geometry and policy it is evaluated against.
  This note maps the design space.
published: true
published_at: 2026-07-14
research_note: obsidian://open?vault=research-notes&file=research/Verifiable%20Spatial%20Data%20Registries
role: Lead author
slug: verifiable-spatial-data-registries
source_note: obsidian://open?vault=xo&file=Research/hoopes-2026-verifiable-spatial-data-registries/NOTES
status: working
summary: Working notes toward a paper on verifiable spatial data registries -- systems
  of signed, identified spatial records whose integrity, write authority, and history
  can be checked without trusting the operator or the writers.
tags: []
tier: card
tracks:
- spatial-registries
order: 3
title: Verifiable Spatial Data Registries
url: https://johnx.co/research/verifiable-spatial-data-registries
---
*Working notes toward a paper. The structure and claims below are provisional; we post them to invite correction.*

## Abstract

Verified location claims are evaluated against reference geometries -- geofences, jurisdictions, corridors, parcels. Today those geometries often live in mutable, siloed databases with no integrity guarantees, no auditable history, and no independent means of checking who asserted a geometry or whether it has changed. We outline **verifiable spatial data registries**: systems of signed, identified spatial records with governed write authority, in which record integrity, writer authority, and registry history can be checked by parties who trust neither the registry's operator nor its writers. We articulate the design properties such registries require and examine their technical and political implications — in particular *sovereign administration*: a common data model and substrate in which mutually untrusting parties each control their own records, with no common administrator. Several problems remain open, including the maintenance of topological invariants across independently administered records, privacy guarantees for registered geometries, and the recognition of contested claims. This note is closer to a research agenda than a specification. Together with [composable location verification](https://www.johnx.co/research/location-verification-framework.pdf), verifiable spatial data registries are foundational for the spatial governance of intelligent machines.

## 1. Introduction

A point-in-geofence decision is only as trustworthy as the geofence. Proposals for AI compute governance assume verifiable jurisdictional boundaries; autonomous systems operate under rules attached to corridors and zones; and any application that evaluates a location claim against reference geometry inherits the question of whether to believe the geometry. [A previous note](https://www.johnx.co/research/location-verification-framework.pdf) addressed the verification of location claims. This one concerns the reference data those claims are evaluated against.

In [Towards a decentralized geospatial web](https://osf.io/bg2uq_v1) we proposed three pillars: proof-of-location, verifiable geocomputation, and peer-to-peer spatial data management. We now think the third pillar was misnamed. The property of interest was never the peer-to-peer architecture; it is verifiable and sovereign administration of spatial data. Registries — curated collections of spatial records with governed write access, [first sketched in 2021](https://ethereum-magicians.org/t/verifiable-spatial-data-registries/6688) — are the setting where the substantive problems concentrate, and they are the scope of this paper. Registries of raster and other spatiotemporal assets raise related but distinct questions and are deferred.

The present state of authoritative spatial data, across very different institutions, reduces to self-assertion plus publication. A drone manufacturer operating a de facto global geofence registry can reclassify an entire national restricted-zone layer in a single vendor decision, with no versioned public record of the change. The ITU's Master International Frequency Register records assignments the ITU cannot verify were ever brought into use; its review board has held that it is ["not to question the wording of a sovereign State"](https://www.nyulawglobal.org/globalex/paper_satellites_free_use_outer_space.html). Between these extremes — private vendors and treaty bodies — we have not found a spatial data system offering tamper-evident history or content verifiable by outsiders.

## 2. Definitions

Terms we are working with, stated provisionally:

- **Spatial record** — a spatial data object (a geometry, or a commitment to one — see §5) with metadata, an identifier, and one or more signatures.
- **Spatial data registry** — a curated collection of spatial records under a common data model and spatial reference system convention, with defined write authority.
- **Verifiable spatial data registry** — a spatial data registry in which record integrity, writer authority, and registry history can be checked without trusting the operator or the writers.
- **Write authority** — the rule mapping principals to the records they may create or modify.
- **Topological invariant** — a predicate over sets of records (for example: no two records in a layer intersect) that a registry maintains or surfaces.
- **Custodian / substrate** — whatever maintains availability and ordering: a ledger, a transparency log, a federation, a database with a public log. The framework is deliberately neutral on this.

An early design decision with consequences throughout: whether a record asserts a geometry as fact or registers it as a claim. Our present inclination is toward registries of claims, with recognition handled contextually (§4), but we hold this loosely.

## 3. Is spatial data special?

The term is deliberately close to prior art. A "verifiable data registry" is an established role in the [W3C decentralized identifier architecture](https://www.w3.org/TR/did-core/), and the null hypothesis deserves its strongest form: a verifiable *spatial* data registry may be nothing more than a verifiable data registry with a geometry field — a claim type on existing rails.

The existing definitions are thin. DID Core defines a verifiable data registry as "any such system that supports recording DIDs and returning data necessary to produce DID documents," explicitly including "databases of any kind"; the [VC Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/) notes that some registries "might just act as namespaces for identifiers," and is explicit that verifiability "does not imply the truth of claims encoded therein." No requirements are placed on the registry itself, and none concern relations between records.

We suspect the null hypothesis fails, for four reasons — each a structural property of spatial data rather than an appeal to its importance:

1. **Inter-record constraints.** DID documents are mutually independent; one record cannot conflict with another. Spatial records stand in geometric relations — overlap, containment, adjacency — and the validity of a registry can depend on predicates over sets of records. Uniqueness in a namespace is string comparison; exclusivity in continuous space is a computation over record content. Nothing in the existing architecture expresses this.
2. **Continuity and error.** Namespaces are discrete; space is continuous. Whether two records describe the same geometry depends on precision, coordinate reference system, and datum. Record equality is a computation with error bounds, not a lookup.
3. **Correspondence.** An identifier is self-referential; the registry entry is the thing. A spatial record refers to Earth, which exists independently and is contested. A registry can be perfectly verifiable and wrong about the world. Attestation against reality is a separate layer — the interface to proof-of-location — with no analogue in identifier registries.
4. **Political weight.** Registering geometry is registering claims about territory and jurisdiction. The legitimacy requirements differ in kind, not degree.

Much of the existing machinery transfers: signatures, identifiers, content addressing, revocation. Spatial applications of it exist — [GeoDIDs](https://astral-protocol.gitbook.io/astral/archive/geodids), [DIDs for Earth observation products in OGC Testbed-20](https://docs.ogc.org/per/24-033.html), the [Location Protocol](https://spec.decentralizedgeo.org) — but these identify and integrity-protect individual records. To our knowledge none address the inter-record problem, and we have found no published analysis of the verifiable data registry concept itself. We would welcome pointers to work we have missed.

## 4. Design properties

The intended core of the paper: properties stated precisely, each with technical and political implications. Current formulations:

**Integrity.** Any party can verify a record is unaltered since signing. Technically cheap — signatures, content addressing. It rules out silent rewrites, and says nothing about whether the signed content was ever correct.

**Authenticity and authority.** Any party can verify who asserted a record and that they were entitled to write it under the registry's authority rule. The machinery here is key infrastructure and delegation; decentralized identifiers and verifiable credentials are one natural instantiation, trusted-issuer registries another. We prescribe neither. The authority rule is where governance lives; most of what is contentious about a registry concentrates in it.

**Sovereign administration.** The authority rule can partition write access among mutually untrusting principals such that no principal — and no operator — can modify another's records: a common data model and substrate, administered severally. Institutions of this shape already exist. Mutually untrusting states jointly operate the [ICAO Public Key Directory](https://www.icao.int/icao-pkd/frequently-asked-questions) for passport signing keys; each state charts its own waters against a common standard under the IHO's regime, which prohibits overlapping coverage; the ITU register coordinates sovereign frequency assignments under interference constraints. What these systems lack is verifiability — integrity rests on institutional assertion, and none offer tamper-evident history. A verifiable spatial data registry extends an institutional pattern states already accept with guarantees they currently do without.

**Auditability.** Any party can verify what the registry stated at a given time and enumerate changes since. Disputes about when a boundary changed become checkable; agreements can reference registry state at a moment.

**Topological consistency.** A registry may maintain declared invariants over sets of records — non-intersection within a layer, containment hierarchies, coverage — with the verification status of each invariant itself part of registry state. A substrate that enforces non-intersection replaces a function that otherwise requires a central registrar; this is, in our view, the technically distinctive capability. It is also politically fraught: strict non-overlap encodes a settled world, and real territorial claims overlap. A registry can hold claims with conflicts explicit, or facts with conflicts excluded; verifiers or institutions can then determine which claims they recognize. We are wary of treating verifier-side recognition as sufficient — a governance system requires legitimacy, not only configurability — and expect to present this as an unresolved tension between technical neutrality and political legitimacy.

**Privacy.** A registry should support records whose geometry is committed rather than disclosed, while preserving the other properties against the commitment. The components exist: zero-knowledge point-in-polygon has been implemented for the case of a private point and public zone ([zkMaps](https://github.com/zkMaps), 2022; more rigorously, [ZKLP](https://arxiv.org/abs/2404.14983)); zero-knowledge sets provide a commit-then-query template; trusted execution environments provide the functionality under a hardware trust assumption. To our knowledge, the composition required here — public, non-interactive proofs of containment or non-intersection against a committed, never-revealed geometry — has not been published. A limit must be acknowledged: the answer to a containment query is itself information about the hidden zone, and an adversary with unlimited cheap queries could reconstruct a boundary by adaptive search. The nearest formal work concerns [reconstruction of encrypted databases from range queries](https://dl.acm.org/doi/10.1145/3372297.3417275). How far such attacks carry under realistic constraints — queries requiring physical presence, results encrypted for specific consumers, query authorization — is unestablished in either direction. Privacy is not a peripheral concern: parties will not publish sensitive geometries, and commitments may be the condition under which a shared registry can exist at all.

**Neutrality.** Records use open encodings aligned with existing geospatial standards; the framework is unopinionated about substrate and about which properties a given registry instantiates. Different registries will select different subsets; the properties are a menu, not a stack.

## 5. Illustrative cases

Two settings, matching those in the location verification paper. **Jurisdictional boundaries for compute governance**: static, high-stakes, authority-anchored; each state administers its own record; auditability lets a governance regime reference the boundary as registered at a given time; correspondence is handled by treaty and recognition rather than by the registry. **Drone corridors and geofences**: dynamic, machine-queried; the contrast between vendor-administered geofence databases and the EU's U-space arrangement — where the state is the writer and the vendor a consumer — indicates the direction; sensitive-site geofences motivate committed geometries with containment proofs. In each case some properties are active and others inert, which is the intended usage.

## 6. Open questions

The ones we currently consider most pressing:

1. **Invariants over committed geometries.** Can non-intersection be maintained between records whose geometries are hidden? Interactive two-party protocols for private geometric intersection [date to 2001](https://en.wikipedia.org/wiki/Secure_multi-party_geometric_computation); nothing non-interactive, transferable, and registry-grade appears to exist.
2. **Privacy bounds.** What privacy claims about registered geometries are honest under which query threat models? What are the query-complexity bounds for boundary reconstruction through a containment oracle, and which defenses avoid leaking through their own refusals?
3. **Recognition and legitimacy.** Who decides which records a verifier respects? What institutional arrangements — mutual recognition lists, treaty anchoring — could confer legitimacy on top of a technically neutral registry?
4. **Contested claims.** What data-model and invariant semantics best represent overlapping claims?
5. **Correspondence.** How should proof-of-location evidence attach to registry records — what does it mean for a registered geometry to be attested against reality, and by whom?
6. **Authority rule design space.** From single writer through federation to token curation: what does each design inherit from the failure modes of its institutional ancestors — participation gaps, unverifiable declarations, unrecognized writers?
7. **Substrate requirements.** What does each property actually demand of the substrate, and what is the minimal substrate for a given property subset?
8. **Standards.** Whether and when alignment with OGC standards, or an ERC, is worth pursuing, and the relation to the [Location Protocol](https://spec.decentralizedgeo.org).

## 7. Next steps

Formalizing invariant semantics; a minimal registry instantiating integrity, authority, and auditability; and a companion note on verifiable geocomputation — registries hold verified state, geocomputation produces verified answers over it. If you work on land administration, airspace systems, compute governance, transparency infrastructure, or applied zero-knowledge, we would like to compare notes: [johnx.co](https://www.johnx.co).
