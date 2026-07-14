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
fits: Early evidence on the practical limits of on-chain geocomputation -- the cost and latency realities that pushed later work toward verifiable compute off-chain.
links:
  - { label: "Read the report (PDF)", url: "/attachments/tero-labs-2021-astral-algorithms-and-benchmarks.pdf" }
published: true
published_at: 2026-07-14
---
Before pushing spatial computation on-chain, we needed numbers. In 2021 Astral benchmarked a quadtree-based web3-native GIS engine -- geographic data stored on-chain and in decentralized storage -- measuring point and range queries over reference datasets on a local EVM chain and the Celo Alfajores testnet, with a comparison against FOAM's crypto-spatial coordinate scheme and gas costs for point insertion. We commissioned the benchmark work from Tero Labs, whose contribution we gratefully acknowledge. The report is a working document and includes some unfinished sections.

[Read the report (PDF) →](/attachments/tero-labs-2021-astral-algorithms-and-benchmarks.pdf)
