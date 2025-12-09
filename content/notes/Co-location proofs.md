---
author:
- '[[Me]]'
categories:
- '[[Posts]]'
created: 2025-12-09
published: true
published_at: 2025-12-09
source_note: obsidian://open?vault=xo&file=Notes/Co-location%20proofs
status: fragment
summary: How do we verify if internet nodes run in the same data center?
tags: []
title: Co-location proofs
topics: []
url: null
---
One question that's come up in conversations with some clients: how can we verify whether two nodes are co-located — that is, running in the same data center or site? 

Co-located nodes are especially exposed to correlated risks — a power cut, natural disaster, or single malicious actor is more likely to impact them together. Given our goal of building systems resilient to the widest imaginable range of risks, there's reason to figure this out. 

So, a question comes up: how can we **verify** whether nodes are co-located? Terraform manifests and legal contracts serve as a form of evidence, but we want to challenge ourselves to go a layer deeper, to work out how to generate evidence sources that aren't based on [[Trust-conscious vs. trustless|naive trust]]. 

This deserves a deep dive. One idea: outside of data centers, devices can collect signals from across the radiofrequency spectrum — WiFi BSSIDs, Bluetooth identifi
# Co-location proofs

Your research note content here...
ers, etc. The contents and strength of these signals constitute a unique environmental "fingerprint", which is very hard to recreate ... I wonder what kinds of network signals we might be able to collect — including if we were to run some kind of verification node in major data centers around the world. ... 🤔


