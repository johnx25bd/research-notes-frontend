# Speaker notes

## title
- About 20 minutes of talking, then Q&A

## agenda
- Articulate the state of play
- Highlight crux uncertainties
- Invite feedback, critique, collaboration

## intro
- Background, work, future

## lucid
- Mission: advance the TRL of verification technologies as quickly as possible
- What Lucid is building, and why
- How: a portfolio, because there is no single technical solution

## lucid-labs
- Where it ends: the Verifiable Reference Architecture
	- a reference architecture of verification mechanisms that you can deploy on standard GPU clusters to make them measurably more verifiable
	- V1 is focused on the retrofit kit: most of the compute exists already
	- there's only so much you can do with retrofitting
	- with much more powerful AI, international treaties and very sophisticated threat actors, you need to design from the ground up. De novo design
	- we'll deploy it on our clusters, but it'll also be open source. If you want to do it for yours, you can
- Research bets: tamper-evident logging, location verification, inference classification, resource exhaustion, and more
- Verifiable Studio: research infrastructure to get a signal quickly. Does this work? If not, back to the drawing board
- Red team: internal always, external for the most promising. 
- Production cluster: a standard GPU cluster, retrofitted. Production operations inform experimental designs
- Version 1 is a retrofit kit for standard clusters
- Open source: we will only ever run a small share of the world's compute
- De novo: retrofitting only goes so far; the second family is designed from the ground up
- No team is big enough alone: researchers on the bets, governments on the red team, partners on de novo design
- Location verification: the bet the rest of this talk is about

## lv-requirements
- LV plus spatial policy enable credible location-contingent commitments
- Compute governance is a special, static case within a wider field
- Spatial governance also includes mobile sensitive deployments
	- Lethal autonomous weapons systems
	- DNA synthesizers
	- Autonomous vehicles
	- etc

## operating-model
- This framework is how I have decomposed the problem into pieces we can work on
- Strategic frames: the situations we might be serving
- Goals: what a policy regime wants. Goals shift with politics
	- One big uncertainty I personally have is the state of the policy conversation wrt LV, and how we can design for that
- Claims: statements about the world that an outside party can check and that are falsifiable
- Capabilities: the things we can offer to verify. Each is a composition of claims
- Location verification is the worked example for the rest of the talk
- Designs: particular architectures for delivering a capability. There can be several per capability and some will be abandoned
- Mechanisms: compositions of one or more primitives, plus an argument for why they deliver part of a claim
- Some diversity is valuable because it avoids common-mode failures
- Primitives: reusable building blocks. A measurement, a cryptographic operation, a physical property, a protocol step
- Requirements come down from the top. Primitives compose upward

## multilateration
- Each ring: the maximum possible distance at a given round trip time
- Likely maximum and likely minimum distance
- Probability, where the rings overlap

## lv-a-01
- Proposed design, not implemented
- The timed path crosses the operator's network and host
- Declared Facility: everything inside the box is at the declared facility
- GPU Host: operator-administered. Enrolled GPU: the device the claim is about
- Landmark Node, inside: verifier-installed appliance
- Landmark Measurement Software: generates challenges, measures elapsed time, verifies responses, writes records
- Network: the operator can delay, relay, suppress
- Attestation Client: open source; the operator administers it; not independently trusted
- NVIDIA Driver: the client asks it for a report; GPU in CC mode
- Security Function: device-bound key; signs a report bound to the nonce
- A valid identity response does not itself establish location
- Signed response: returns over the same operator-controlled path
- Assurance Service: remote evidence assessment, policy evaluation
- Evidence Log: evidence from different landmarks all writing to the same log
- Landmark Nodes, outside: geographically distributed, all report back to the assurance service
- Relying Party: where the evidence is used
- Control: the operator controls the whole declared facility; the verifier controls the service, the landmarks outside, and inside only the node
- Crux: the Security Function. Low latency GPU identification primitives

## lv-l-01
- One pass of the lifecycle
- Enrollment: install, connect, record. Enrollment Record: verified vs declared
- Evidence Collection: challenge, time, verify, record. Measurement Records: all challenges, including failed
- Evidence Assessment: behavior, changes, limits. Assessment Report: method, comparison, limits
- Policy Evaluation: apply agreed requirements. The relying party decides which events matter
- Outcomes: continue, request information, investigate
- Crux: secure enrollment

## lv-l-03
- One timed challenge, end to end
- A genuine relayed response can pass every cryptographic check; timing is the only thing that notices, and timing is noisy
- Schedule the challenge, generate a fresh nonce, start the timer, send
- Crosses the open internet, then the operator network: the operator can delay, relay or suppress
- Attestation Client: on the GPU host, operator-administered
- Sign Nonce, Return Report: the device identity key
- Stop the timer on receipt: the timed interval includes network and processing delays
- Match the response to the challenge. Every challenge leaves a record; failures and gaps are part of the evidence
- Crux: every operator-controlled section. Operator inflation is unavoidable and, to an extent, undetectable
- Crux: Sign Nonce, Return Report. Leads into signing latency

## signing-latency
- Signing time against the round trip in the same cage, for three driver versions
- About 100 km of fiber for each millisecond of round trip

## coarse-resolution
- Signing time is included in there, so it's likely much less than that
- We don't know how much of the signing time is irreducible
- Three stock drivers already differ by 2.6 ms, about 260 km
- A motivated attacker who reduces signing time buys themselves latency budget
- This coarse resolution limits the value of ping-based location verification based on current NVIDIA architecture
- Not focusing on multilateration mechanisms right now
- Experimenting with other mechanisms: heartbeat verification, RTT change detection
- Still may be value in multiple landmarks, and RTT may carry some signal
- Very interested in reliable, mature, low latency GPU identification primitives
- Would love NVIDIA to ship an update with lower latency ways of signing challenge nonces

## red-team
- How accurately can we detect diversion attempts?
- LV system on the Luleå cluster; move it, or connect it to a different network
- Lifecycle events: “hiding” the diversion in the noise
- Continuity: flags gaps when a GPU is offline

## testbed
- A platform to rapidly experiment with location verification designs and primitives
- Likely an RTX and other GPUs too
- One landmark server in the same rack, one located nearby
- We can whitelist remote landmark nodes
- Reproduce others' work, run our own experiments
- Red team with RISE and other groups
- Email me for now

## close
- Cruxes: secure enrollment; low latency GPU identification primitives; evidence collection mechanism; operation in production setting; designs for different strategic frames
- Invite feedback, critique, collaboration
