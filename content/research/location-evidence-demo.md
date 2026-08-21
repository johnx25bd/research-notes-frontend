---
type: artifact
title: Location Evidence
slug: location-evidence-demo
artifact_kind: demo
date: 2026-08
tracks: [location-verification]
tier: card
order: 2
tags: [location-verification, evidence-evaluation]
status: active
role: Author
clause: an interactive demo of evidence evaluation dynamics
summary: Demo visualizing evidence evaluation dynamics of latency-based location verification. Developed at the CAISH Hardware Assurance Programme, August 2026.
purpose: The framework treats location verification as evidence evaluation, but the dynamics -- how signed receipts move belief, what anchor geometry and trust contribute, what an evasive attester can and cannot fake -- are easier to feel than to read.
approach: An interactive map-based sandbox for the evidence evaluation stage. Anchors probe a simulated attester and sign latency receipts; each receipt erases the outside of a lightspeed circle, and the posterior concentrates by exclusion. Guided presets walk through baseline convergence, anchor geometry, anchor trust, the delay allowance, and an evasive attester.
status_note: Built August 2026 at the CAISH Hardware Assurance Programme; presented alongside the Verifying Compute Location talk.
links:
  - { label: "Open the demo", url: "https://johnx.co/demos/location-evidence-evals" }
  - { label: "Talk: Verifying compute location", url: "/presentations/verifying-compute-location" }
published: true
published_at: 2026-08-21
---
An interactive visualization of the evidence evaluation stage of the [location verification framework](/research/location-verification-framework): signed latency receipts from anchor machines become a posterior belief map over where a machine is.

The demo simulates the full loop on a real map. Anchors at known coordinates probe an attester and sign the round-trip times they measure; because nothing outruns light, each receipt excludes everything outside a circle, and belief concentrates as circles intersect. The verifier's side of the model is explicit and adjustable -- the delay allowance, interior fade, per-anchor compromise priors ε_a -- and so is the simulator's ground truth, so you can watch what an inflating, deflating, or fabricating adversary does to the map, and what the evaluation's assumptions cost when they are violated.

Developed at the CAISH Hardware Assurance Programme, August 2026, alongside the [Verifying Compute Location talk](/presentations/verifying-compute-location).
