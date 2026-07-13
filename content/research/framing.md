---
title: Why verifiable location
slug: framing
area: research
status: working
summary: The framing behind my research -- why credible location-contingent commitments matter, and what it takes to make them work.
published: true
published_at: 2026-07-13
created: 2026-07-13
---
My research focuses on verifiable geospatial technologies and their relevance to the spatial governance of intelligent machines.

For several years I have been building and prototyping at the intersection of spatial data science, secure hardware, cryptographic protocols, smart contracts, and decentralized data protocols -- DIDs and verifiable credentials, IPFS, and the like. That work has spanned maritime security, arms control, climate monitoring, and transport. A few core insights have held across all of it:

- Verifying location is only part of the challenge. The real crux is the credible location-contingent commitment -- a technical mechanism that enforces a location-based policy, rather than merely asserting where something is.
- Making that commitment credible means defining the spatial extent and the policies that apply within it, then evaluating a location against those policies to produce a predicate -- a clear result that a system can act on.
- Technically robust verification matters most exactly where someone has an incentive to lie or mislead. In low-stakes settings a self-reported coordinate is fine; in high-stakes ones it is worthless without a way to raise the cost of faking it.
- Spatial data has quirks that resist naive treatment. Coordinates are continuous and imprecise, regions are extents rather than points, and the same measurement can mean different things to different verifiers.
- Location is often sensitive, so verification has to work without forcing disclosure. Privacy-preserving techniques -- zero-knowledge proofs among them -- let a system establish that a location predicate holds without revealing the underlying coordinates.

These patterns hold across use cases even when the mechanisms differ. A drone proving a delivery and a data center proving where its chips run face the same underlying problem -- convincing a skeptical, remote verifier of a claim about where something happened -- and reach for different tools to solve it.

Right now my focus is on advancing the frontier of technical capability, specifically verifying the location of sensitive, static AI deployments: the advanced chips whose whereabouts are becoming a governance lever.

## A note on the web3 framing

Much of my earlier work carries a "decentralized" or "web3" framing. A lot of it was designed to integrate with smart-contract applications, so that vocabulary came along with the tools.

I have come to think of blockchains as useful in a narrow but real set of cases: where mutually untrusting agents need a shared digital system to coordinate around, as markets and nation states do. Smart contracts also share an interesting property with AI agents. Data submitted to them cannot simply be trusted -- a coordinate is just a number, and nothing about receiving it tells you it is true. The usual client-server assumption, where a server trusts its own inputs, does not hold. That property, rather than any enthusiasm for blockchains as such, is the through-line connecting this earlier work to the questions I care about now.
