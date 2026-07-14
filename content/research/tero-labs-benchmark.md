---
type: artifact
title: "Tero Labs: On-Chain Spatial Computation Benchmarks"
slug: tero-labs-benchmark
artifact_kind: report
date: 2021
tracks: [geocomputation]
tier: note
order: 3
tags: [benchmarks, quadtree, evm]
status: historical
role: Commissioned by Astral
clause: commissioned benchmarks of quadtree-based spatial queries on EVM chains
summary: A working report commissioned by Astral benchmarking a quadtree-based spatial query engine for EVM chains -- point and range queries over reference GeoJSON datasets, measured locally and on the Celo Alfajores testnet, with comparisons against FOAM's crypto-spatial coordinates and gas-cost measurements for insertion.
fits: Early evidence on the practical limits of on-chain geocomputation -- the cost and latency realities that pushed later work toward verifiable compute off-chain.
links:
  - { label: "Read the report (PDF)", url: "/attachments/tero-labs-2021-astral-algorithms-and-benchmarks.pdf" }
published: true
published_at: 2026-07-14
---
This report was commissioned by Astral from Tero Labs in 2021, in the context of requirements for the Kolektivo project. It describes a web3-native GIS engine using quadtrees to store geographic data on-chain and in decentralized storage, and benchmarks point and range queries over reference datasets on a local EVM chain and the Celo Alfajores testnet, including a comparison with FOAM's crypto-spatial coordinate scheme and gas costs for point insertion. It is a working document and includes some unfinished sections.

[Read the report (PDF) →](/attachments/tero-labs-2021-astral-algorithms-and-benchmarks.pdf)
