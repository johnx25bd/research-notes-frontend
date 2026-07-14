---
type: artifact
title: On-Chain Spatial Computation Benchmark
slug: onchain-spatial-computation-benchmark
artifact_kind: report
date: 2021
tracks: [geocomputation]
tier: note
order: 3
tags: [benchmarks, quadtree, evm]
status: historical
role: Astral (benchmark work commissioned from Tero Labs)
clause: our benchmarks of quadtree-based spatial queries on EVM chains
summary: We benchmarked a quadtree-based spatial query engine for EVM chains -- point and range queries over reference GeoJSON datasets, measured locally and on the Celo Alfajores testnet, with comparisons against FOAM's crypto-spatial coordinates and gas-cost measurements for insertion. The benchmark work was carried out for us by Tero Labs.
purpose: Before pushing spatial computation on-chain, we needed numbers -- what do spatial queries actually cost on an EVM, and how do they scale?
approach: Benchmarks of a quadtree-based spatial query engine -- point and range queries over reference GeoJSON datasets on a local EVM chain and the Celo Alfajores testnet, compared against FOAM's crypto-spatial coordinates, with gas costs for insertion. We commissioned the benchmark work from Tero Labs, whose contribution we gratefully acknowledge.
status_note: Working report, 2021, hosted here as a PDF; includes some unfinished sections.
links:
  - { label: "Read the report (PDF)", url: "/attachments/tero-labs-2021-astral-algorithms-and-benchmarks.pdf" }
published: true
published_at: 2026-07-14
---
