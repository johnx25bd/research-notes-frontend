---
created: 2026-06-11
featured: true
featured_order: 1
published: true
published_at: 2026-06-12
research_note: obsidian://open?vault=research-notes&file=notes/FlexHEGs%20and%20the%20location%20gap
source_note: obsidian://open?vault=xo&file=Notes/FlexHEGs%20and%20the%20location%20gap
status: fragment
summary: Orienting myself in the AI governance conversation on an LHR → DEN flight
tags: []
title: FlexHEGs and the location gap
url: https://johnx.co/notes/flexhegs-and-the-location-gap
---

I spent most of my flight from London to Denver (where I'm going to my 20th high school reunion 😳) doing a deep dive on my research area: spatial governance of intelligent machines.

I'll be writing more about the research agenda as it's taking shape. I'm fleshing it out now, looking at different angles, and doing my homework so I can enter the conversation with a solid footing. Rather than sit on all of this in isolation, I want to share notes along the way, to think in public and invite comments, criticism and collaborators.

## FlexHEGs

Towards the end of my reading session, I started digging into the proposals for Flexible Hardware-Enabled Guarantees, a proposal to develop open source hardware that gets integrated in frontier AI chips so they can be monitored and governed remotely. I won't go into explaining technical details -- I'm still getting my head around them, and want to keep my eyes on some of the insights and questions I have -- but if you're interested, these are the papers I've been looking at over the past few days:
- Flexible Hardware-Enabled Guarantees for AI Compute (Petrie, Aarne, Ammann, davidad), Parts [1](https://arxiv.org/abs/2506.15093), [2](https://arxiv.org/abs/2506.03409) and [3](https://arxiv.org/abs/2506.15100)
- [Embedded Off-Switches for AI Compute](https://arxiv.org/pdf/2509.07637) (Petrie)
- https://flexheg.com/

I'm struck by a few things, both in the sophistication of the work, and in how my work may fill in some of the intentional gaps the authors left. 

First, the flexHEG architecture being developed -- especially its remotely-issued cryptographically-verifiable authorization certificates, and the technical / governance requirements to make those work well -- is at once very ambitious and (to my eye) tractable. Its capability set maps closely onto ideas I've been developing for several years about how secure hardware technologies could be used to govern sensitive compute operations. 

I've mostly been thinking about this in the context of mobile autonomous agents, with an eventual eye towards autonomous weapons. My approach has been to break the problem down into the key primitives needed to implement governance policies along an underexplored dimension: location. (I wrote a bit about this in this [SoTA letter](http://sotaletters.substack.com/p/spatial-alignment) a couple of months ago, and will be sharing a lot more here over the coming weeks.) 

I came to those primitives by inference rather than from hardware engineering experience, so it is reassuring to see that the affordances I had assumed were possible are largely the ones this architecture provides -- the downstream reasoning I've done about building and configuring location-aware governance systems rests on firmer ground than I could previously claim.

![[flexhegs-and-the-location-gap-1.png]]
*From* Part II: Technical Options for Flexible Hardware-Enabled Guarantees *(Petrie and Aarne 2025, pg3)*

## The gap below the frontier

On FlexHEGs and technical AI governance more generally, I'm also struck by how heavily the discourse focuses on governance of frontier chips, with the aim of providing verifiable assurances to adversarial state-level actors about the nature and extent of AI development taking place. It makes a lot of sense: mitigating the development of non-aligned frontier models is of paramount importance, and such verification systems also *may* (heavy on may ... politically this might be very difficult) provide an interesting policy lever to coordinate the verifiable slowdown that's resurfaced in the discourse just [last week](https://www.anthropic.com/institute/recursive-self-improvement). 

A major gap I see -- and it appears that the authors see it too, and rightfully kept their focus on the task at hand -- involves the governance of sensitive applications of AI that don't quite punch up to the level of "frontier model training", such as the operation of autonomous weapons / military systems, critical infrastructure, transport networks, some biotechnology functions, environmental state verification, and so on. This set of sub-frontier sensitive applications is a much longer tail, and it's harder to monitor / verify because it doesn't have the same scale requirements that frontier model training does. Plus, sensitive applications can be hard to distinguish from non-sensitive ones.

As you may have guessed, I'm particularly interested in the use cases where the location of these devices impacts the set of rules they are expected to follow. So far, my read of the discourse is that current thinking around location verification focuses on coarse-but-extremely-"hard" (as in hard-to-forge or spoof) techniques that leverage [delay-based measurements](https://www.iaps.ai/research/location-verification-for-ai-chips) to situate a chip or chip cluster. These are useful when policy zones are approximately city to country-scale: the privacy afforded by imprecision can be a feature, not a bug. Latency-based strategies are less useful (on their own at least) when they're neighborhood scale down, let alone street or sidewalk scale. 

![[flexhegs-and-the-location-gap-2.svg|75%]]
*High durability / high precision location proofs are a major unlock for verifiable spatial governance of mobile sensitive AI deployments.*

I recognize this is a glimpse into some things I'm thinking about without a lot of surrounding context, but I'll post it anyway -- I'm pushing myself to think in public and not boil the ocean. 
## Orienting myself 

Clearly there's a lot for me to digest here. Next steps involve continuing my background research -- I think it would take me at least a few weeks of full time reading to get through the papers I've now collected for my initial survey, and I'm sure each one will surface several more, and others will be published while I'm researching. I also would love to secure some funding from some of the AI safety orgs to do the initial work required to start pulling this together as a new field. 

I'm still in the orienting phase, but it feels like there's a gap here, sitting at the intersection of technical AI safety, AI governance, and geography, with hooks into computer science, hardware security, international security, law, participatory governance and more. 

Lots more to say ... if you want to chat about this, feel free to reach out (john at johnx.co).