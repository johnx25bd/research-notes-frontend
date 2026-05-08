---
created: 2026-05-08
featured: false
featured_order: null
published: true
published_at: 2026-05-08
source_note: obsidian://open?vault=xo&file=Notes/Evaluating%20agentic%20RAG
status: fragment
summary: Is it really about the journey -- or just the destination?
tags: []
title: Evaluating agentic RAG -- journey or destination?
---

I've been building an agentic system for one of my business partners -- a RAG application over maintenance manuals for the equipment they operate. The work has led me down into the depths how how to build production agents in 2026, and to the inevitable conclusion that building evals well is a key element of any system. 

Today's question: when you evaluate an agent, do you evaluate the steps it takes inside the loop, or only the final response it returns to the user?

## How the system evolved

I started with a vanilla pipeline: question in, retrieve relevant chunks (pages from the technical manual we ingested), stuff them into a prompt, generate a response. Once that was working end-to-end, I moved to a more sophisticated design -- an agent loop where the model can call tools to gather additional context if it doesn't find what it needs in the initial retrieval.

A representative evaluation question from the suite illustrates why this matters:

> _Why is my boiler's low water cut-off relay not resetting after a shutdown, and what manual reset procedure should I follow?_

The page of the manual that deals most directly with this question ends with a pointer:

> _Technicians should reference Section 4 for detailed maintenance procedures related to these control systems._

If Section 4 isn't in the first *k* chunks retrieved, a vanilla RAG system is stuck. It has been told it needs more information, but has no way to go get it. Tool calls fix this: the agent can recognize the gap, call a retrieval tool to fetch Section 4, and incorporate the result into its final answer.

This is also, incidentally, a textbook case for graph retrieval. If you map cross-references between chunks at ingestion time, fetching one chunk automatically pulls in the ones it points to. So we have two design options on the table:

1. **Ingestion-time graph construction** — detect references between chunks during ingestion and encode them into a graph structure. Complexity scales with data volume and reference patterns.
2. **Generation-time tool use** — let the agent decide at runtime whether it needs to fetch more content.

There's value in both, and we're scoping each. But at the same time, I don't want additional features to hold up the train -- the priority is rapid prototyping and getting the product into users' hands as quickly as possible.

## The evaluation question

This brought me to the design question I want to think through: should the eval suite measure what happens *inside* the agent loop, or only the final output?

For clarity: when an AI agent is given a task or prompt, it can respond directly, or choose to take other actions -- fetching data, making API calls, etc -- that it thinks are necessary to achieve its goal. These actions are exposed through "tools"; the agent is given a list of available tools and instructions on how to use them.

The question here is whether to peer into the internal process the agent goes through to get to the answer, or to evaluate it simply on its final result.

My initial instinct was that there would be value in crafting eval examples that _require_ tool calls — for instance, questions like the boiler example above, where the agent should be forced to look up Section 4 at some point. The eval would then check whether the agent actually made that call.

After thinking it through, in this case I decided to evaluate outputs only.

The reason is that there are multiple valid paths to the right answer, and prescribing one is a form of picking winners. If the agent gets to a correct, well-grounded response without retrieving Section 4 — perhaps because the surrounding context was sufficient, or because a different chunk covered the same ground — penalizing it for not following the path I expected doesn't measure system performance. It measures conformance to my mental model of how the system _should_ work, which is a different thing.

I did build a logging system so we can inspect the agent's reasoning and tool use, and hand-check that things look reasonable (vibes-based evaluation I usually try to avoid). But for automated evaluation at scale, we're not peeking into the agent's internal reasoning or marking it down for taking an unexpected route.

## A middle path

That said, capturing data about what happens inside the loop opens up a useful middle ground. Things like the number of tool calls made, time to answer, whether the agent attempted to use blocked tools, or how many retrieval rounds it took — these let us evaluate _efficiency_ without prescribing the path. The agent is free to choose its route; we just notice when one route is consistently more expensive than another.

This feels like the right call for a general-purpose system: grade the destination, observe the journey.

## Where this might not hold

I suspect the calculus changes for more regulated or higher-risk use cases. If an agent is operating in a domain where specific procedures must be followed — clinical decision support, financial advice, safety-critical maintenance — then the path probably _is_ part of what you need to evaluate. "Got the right answer the wrong way" might not be acceptable when the wrong way is itself a compliance failure.

I haven't encountered that yet in this engagement, but I think the case for path-level evaluation gets stronger as the cost of a wrong step rises. 