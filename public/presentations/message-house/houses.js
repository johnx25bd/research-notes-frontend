/* ============================================================
   Message House — content
   ============================================================

   This file is the copy. index.html is the machinery: it reads
   HOUSES below and builds the slides. To edit the deck's words,
   edit this file only.

   Every house has the same shape, which is the point of the deck:

     core      the main message — the roof
     rooms[3]  the three sub-messages — the rooms
       tag       one word, used on the room's door and its spine
                 when you are standing in one of the other rooms
       head      the sub-message headline, verbatim from the source
       lines[]   the supporting points, verbatim from the source
     evidence[] the foundation, split into its separate proofs

   All six houses run Risk -> (pressure / gap / evidence) ->
   Verification. That shared spine is what makes them comparable.
   ============================================================ */

const HOUSES = [
    /* ---------- General public ---------------------------------- */
    {
        id: "public-a",
        audience: "General public",
        variant: "A",
        name: "Safely",
        core: "Helping humanity develop advanced AI safely, so that AI goes well for everyone.",
        rooms: [
            {
                tag: "Risk",
                head: "The risks grow as AI gets more capable.",
                lines: [
                    "Systems that can help cure diseases can also help design weapons or cyberattacks.",
                    "The more capable they become, the more they act on their own, and the harder it gets to keep them doing what we intended.",
                    "Handled badly, the outcome could be catastrophic; handled well, the upside is enormous.",
                ],
            },
            {
                tag: "Pressure",
                head: "Competitive pressure makes it hard to slow down.",
                lines: [
                    "Every company and every country feels it has to move faster than the next one.",
                    "Even those who would prefer a safer pace can't act on it, because they can't tell whether anyone else is doing the same.",
                ],
            },
            {
                tag: "Verification",
                head: "Verification changes that.",
                lines: [
                    "The most powerful AI runs on vast amounts of specialised hardware, and today nobody outside a company can check where that hardware is or what it's being used for.",
                    "We're researching and developing technologies that verify exactly those facts, without revealing anyone's secrets.",
                    "When they can be checked rather than taken on faith, it becomes possible to agree to slow down together, and that makes a good outcome far more likely.",
                ],
            },
        ],
        evidence: [
            "Sweden's national research institute (RISE) and Lucid Computing working together",
            "Verification built into the hardware itself",
            "Everything published openly",
            "Independently tested by security researchers trying to break it",
            "Growing international participation",
        ],
    },

    {
        id: "public-b",
        audience: "General public",
        variant: "B",
        name: "Brake and steering wheel",
        core: "Building the brake and steering wheel for advanced AI, so we reach the good outcomes and avoid the bad ones.",
        rooms: [
            {
                tag: "Risk",
                head: "The world has a gas pedal for AI, but not much of a brake or a steering wheel.",
                lines: [
                    "As AI gets more capable, the risks get more serious: misuse to build biological or cyber weapons, systems that pursue goals nobody set, and power concentrating in whoever gets there first.",
                    "Racing ahead without the choice to slow down or steer is very dangerous.",
                ],
            },
            {
                tag: "Pressure",
                head: "Nobody wants to slow down alone.",
                lines: [
                    "If one company or country eases off while others race ahead, it loses.",
                    "So everyone races, even when they know it's risky.",
                ],
            },
            {
                tag: "Verification",
                head: "You can only agree to slow down if you can check that others have too.",
                lines: [
                    "We're building technology that verifies where AI computing hardware is and what it's being used for, so that promises about AI development can be checked.",
                    "That makes it possible to choose a safer pace together and gives humanity a real say in how this goes.",
                ],
            },
        ],
        evidence: [
            "As Variant A",
            "The gas pedal / brake line is the memorable hook",
            "The evidence layer makes clear the technology exists and is being tested now",
        ],
    },

    /* ---------- Scientific / technical --------------------------- */
    {
        id: "sci-a",
        audience: "Scientific / technical",
        variant: "A",
        name: "The missing primitive",
        core: "Making safe development of advanced AI achievable in practice by building the technology to verify it.",
        rooms: [
            {
                tag: "Risk",
                head: "Risk scales with capability.",
                lines: [
                    "Frontier systems are moving toward uplift for biological and cyber attacks, toward autonomous agents with long-horizon goals, and toward loss-of-control scenarios including misaligned or rogue agents.",
                ],
            },
            {
                tag: "Instability",
                head: "Unverifiable commitments are unstable under competitive pressure.",
                lines: [
                    "Every safety commitment made today rests on self-reporting.",
                    "Any agreement to pace development creates an incentive to cheat, and without verification there's no way to detect cheating.",
                    "Racing is the predictable result.",
                ],
            },
            {
                tag: "Verification",
                head: null,
                lines: [
                    "We're researching and developing technologies that verify key properties of AI infrastructure — where it is, which devices are involved, what workloads they're running, who submitted them — in a way that preserves confidentiality.",
                    "Claims are falsifiable statements over measurable parameters, attested from hardware, checkable by a party that does not trust the operator.",
                    "This is what makes credible pacing agreements technically possible.",
                    "We're politically neutral: we build the toolbox, others decide how to use it.",
                ],
            },
        ],
        evidence: [
            "Confidential computing and hardware attestation on current accelerators",
            "HSM-based location verification",
            "A formal claims framework: run/commit between two mutually untrusting parties, eight measurable parameters",
            "Open designs progressing from 10-page to 100-page specifications and proof-of-concepts",
            "An adversarial red-team programme",
            "Responsible disclosure of hardware and firmware findings",
            "Open-source licensing",
        ],
    },

    {
        id: "sci-b",
        audience: "Scientific / technical",
        variant: "B",
        name: "Falsifiable claims about infrastructure",
        core: "Giving the world verifiable evidence about how advanced AI is developed, so that safety can rest on more than trust.",
        rooms: [
            {
                tag: "Risk",
                head: "Capability growth is outpacing oversight.",
                lines: [
                    "Bio and cyber uplift, autonomous agents, and loss-of-control risks all rise with capability, and the trajectory is steep.",
                    "These are not hypothetical categories; they are the ones frontier labs' own safety frameworks are built around.",
                ],
            },
            {
                tag: "Evidence",
                head: "The core engineering problem is evidence an adversary can't fake.",
                lines: [
                    "Today the only evidence that developers are behaving responsibly is their own word.",
                    "In a race with an incentive to cheat, only hardware-rooted evidence about infrastructure holds up: which devices, where, running what, submitted by whom.",
                ],
            },
            {
                tag: "Verification",
                head: "Verified evidence turns pacing from a hope into an option.",
                lines: [
                    "We're developing open, red-teamed verification tooling for AI infrastructure, with confidentiality preserved, so that when actors want to coordinate, the technical basis exists.",
                    "With credible verification technologies, coordination becomes rational rather than naive.",
                ],
            },
        ],
        evidence: [
            "As Variant A",
            "Added emphasis on the claims formalism",
            "Measurement timing and validity semantics",
            "Disclosure practice",
        ],
    },

    /* ---------- Policy ------------------------------------------- */
    {
        id: "policy-a",
        audience: "Policy",
        variant: "A",
        name: "Making stronger agreements possible",
        core: "Giving governments the technical means to make stronger agreements about advanced AI, if and when they choose to.",
        rooms: [
            {
                tag: "Risk",
                head: "The risks of advanced AI are serious and shared across borders.",
                lines: [
                    "Advanced AI could give state and non-state actors uplift for biological and cyber weapons, could concentrate decisive economic and military advantage, and could produce systems that escape meaningful human control.",
                    "None of these respect jurisdictions, and no country can manage them alone.",
                ],
            },
            {
                tag: "Gap",
                head: "Today's tools stop short of technical verification.",
                lines: [
                    "Export controls are enforced through licensing, end-use checks, and reporting, and they matter.",
                    "But once compute is deployed, there is currently no technical means to continuously verify where it is or what it's being used for.",
                    "Diversion cases show the gap, and any future agreement on pacing or compute thresholds would face the same limit.",
                ],
            },
            {
                tag: "Verification",
                head: null,
                lines: [
                    "We're researching and developing technologies to verify key properties of AI infrastructure — location, identity of devices, workloads, and who submitted them — while preserving confidentiality.",
                    "The aim is to raise the technology readiness level of AI infrastructure verification, so that if governments want stronger export controls, compute agreements, or treaties, the verification layer exists.",
                    "As with nuclear safeguards, credible verification is what turns an agreement into something that holds.",
                    "We're neutral on what those agreements should contain.",
                ],
            },
        ],
        evidence: [
            "RISE (Sweden's national research institute) and Lucid Computing",
            "Open deliverables to the international verification community",
            "Engagement with the Swedish Ministry for Foreign Affairs and the Dutch workshop",
            "Export-control and EU regulatory compliance designed in from the start",
            "Independent red-teaming",
        ],
    },

    {
        id: "policy-b",
        audience: "Policy",
        variant: "B",
        name: "Reducing the pressure to race",
        core: "Reducing the pressure to race ahead recklessly, so the world can reach the benefits of advanced AI safely.",
        rooms: [
            {
                tag: "Risk",
                head: "Capabilities are advancing faster than the ability to oversee them.",
                lines: [
                    "With each generation the stakes rise: biological and cyber weapons uplift, destabilising concentrations of power, and systems that act beyond human control.",
                    "The risks are shared across countries, and so is the incentive to cut corners to stay ahead.",
                ],
            },
            {
                tag: "Racing",
                head: "Racing is driven by uncertainty about what others are doing.",
                lines: [
                    "Restraint looks like a unilateral sacrifice when compliance can't be checked.",
                    "Verifiable commitments change the calculation: when each party can confirm the others are keeping to an agreement, restraint stops being a disadvantage.",
                ],
            },
            {
                tag: "Verification",
                head: "We're building the verification layer.",
                lines: [
                    "Technologies that let states confirm where AI compute is and what it's being used for, without exposing proprietary models or data.",
                    "That gives policymakers real options on pacing, export controls, and international agreements, and strengthens mutual assurance between countries.",
                    "Which options to use is a political choice; our job is to make sure the tools are ready.",
                ],
            },
        ],
        evidence: [
            "As Variant A",
            "Parallels to IAEA safeguards and arms-control verification regimes, where technical verification enabled agreements that would otherwise not have been credible",
        ],
    },
];

/* ------------------------------------------------------------
   Johanna's kickoff draft. Kept for reference and comparison,
   not presented as a variant: its third sub-message slot is
   open, which is the slot the six houses above fill with the
   verification pillar.
   ------------------------------------------------------------ */
const SESSION_DRAFT = {
    label: "Session draft (RISE slide, 260908)",
    core: "Lucid AI control is about using AI for the global good and ensuring that AI is not becoming a life-threatening power on our planet. VAI is about creating trust through transparent verification of AI. We want to give hope based on robust science and international coordination.",
    rooms: [
        {
            tag: "Science",
            lines: [
                "Help humanity to develop advanced AI safely.",
                "Tools to control the speed of development.",
                "Enable AI export control and verification.",
                "Verifying evidence supporting.",
            ],
        },
        {
            tag: "International assurance",
            lines: ["Enable AI governance.", "Reduce the competitive pressure."],
        },
        { tag: null, lines: [], open: true },
    ],
    evidence: "Evidence: to be filled.",
};

/* ------------------------------------------------------------
   Short, agreed statements anyone on the project can use.
   ------------------------------------------------------------ */
const RIGHT_NOW = [
    {
        prompt: "VAI is…",
        line: "a joint RISE and Lucid Computing research project developing technologies that verify key properties of AI infrastructure, such as where it is and what it's being used for, while keeping the operator's models and data confidential.",
    },
    {
        prompt: "VAI is going to…",
        line: "produce open designs, open-source implementations, and independently red-teamed proof-of-concepts for AI infrastructure verification, and share them with the international verification community.",
    },
    {
        prompt: "Lucid does / is / aims…",
        line: "to build hardware-rooted verification for AI compute so that agreements about AI development can be checked rather than taken on trust.",
    },
    {
        prompt: "RISE's role is…",
        line: "to contribute security and cryptography research, adversarial red-teaming, and a European, publicly funded research institute's independence and rigour.",
    },
    {
        prompt: "Together they…",
        line: "combine Lucid's verification designs with RISE's independent scrutiny, so the results are credible to governments, labs, and researchers who don't trust either party alone.",
    },
    {
        prompt: "This project will…",
        line: "raise the technology readiness level of AI infrastructure verification, so that if governments and companies want to coordinate on the pace of AI development, the tools exist.",
    },
];

/* ------------------------------------------------------------
   Lines that work in any room of any house.
   ------------------------------------------------------------ */
const CROSS_CUTTING = [
    {
        tag: "Remit",
        line: "We're a technical group. We don't set policy; we make sure the tools exist when policymakers want them.",
    },
    { tag: "Posture", line: "Lucid about the risks, hopeful about the outcome." },
    {
        tag: "Scope",
        line: "This is about verifying infrastructure — where AI hardware is and what it's being used for — not about checking whether an AI's answers are correct.",
    },
    {
        tag: "Pacing",
        line: "On “should we slow down?” — our view is that the world should have the option, and that today it doesn't. We're working on the technology that would make that option real.",
    },
];
