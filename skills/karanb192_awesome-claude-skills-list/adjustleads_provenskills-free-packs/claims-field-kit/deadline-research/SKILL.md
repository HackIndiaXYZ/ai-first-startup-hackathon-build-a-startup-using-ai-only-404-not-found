---
name: Deadline research
description: Use when someone asks what clock applies to a claim in a state. Researches current statute and policy conditions, cites each source, lists deadlines to confirm.
runs_in: anywhere
---

# Deadline research

Someone wants to know what clock applies to a claim: when the proof of loss is due, how long the policyholder has to sue, how long the carrier has to acknowledge or pay, when notice of a claim has to be given. Research the answer for that state and that policy, cite where every number came from and when the source was published, and hand back a list the user confirms before relying on it. You never state a deadline from memory. A number without a citation is not an answer here.

## Step 1, Get the facts

Ask for these if they were not given:
- The state where the property sits (the loss state, not the firm's state)
- The date of loss
- The cause of loss (some states treat storm losses or flood differently)
- The kind of policy (homeowners, dwelling, commercial property, condo unit owner, flood)
- The policy conditions pasted word for word: the duties after loss condition, the proof of loss condition, the suit against us condition, any endorsement that changes them
- Any letter from the carrier that states a deadline or requests a proof of loss, with its date
- Which clock the user cares about, if it is one specific question

If the user wants an answer without pasting the policy, say the policy language usually controls proof-of-loss timing and the suit period within what the state allows, so the answer will be incomplete until they paste it. Then do the statutory part anyway.

## Step 2, Research the state

If your AI app can search the web, search for the current law in that state for each of these, one at a time:

1. Proof of loss: any statute or regulation on when a sworn proof of loss is due or how the carrier must request it, and any rule that the carrier has to supply the form.
2. Suit limitation: the statute setting the shortest period a policy may allow for suit on a property claim, and any statute that overrides a shorter policy period.
3. Notice of claim: any statute on how soon a claim must be reported, or on what counts as prompt notice.
4. Carrier response clocks: the state's unfair claims settlement practices act or prompt payment statute, for how long the carrier has to acknowledge the claim, how long to decide it, how long to pay.
5. Anything specific to the cause of loss, such as a storm claim reporting window or a hurricane deductible rule.

Prefer the state legislature's own site, the state insurance department, or the administrative code. Secondary sources (law firm blogs, adjuster forums) can point you to the statute, but cite the statute, not the blog. Note the date on the source. Statutes change, and a 2019 blog post can be wrong today.

If your AI app cannot search the web, say so at the top of your answer. Then list the deadline types above with no numbers, tell the user which part of that state's insurance code to look in, and read the pasted policy conditions for what they say. Do not fill in numbers from memory to be helpful. That is the one thing this skill must not do.

## Step 3, Read the policy

From the pasted conditions, pull every time period and every trigger: "within 60 days after our request", "within two years after the date of loss", "as soon as practicable". Quote it. Note which ones the state statute overrides or sets a floor under, based on what you found in Step 2. If a policy period is shorter than the statutory minimum you found, say so and cite both.

## Step 4, List the candidate deadlines

For each clock you found, one entry, in this shape:

`<deadline type>: <rule in plain words>, trigger: <what starts the clock>, likely date: <computed from the loss date or the trigger date the user gave, or "trigger date unknown">, source: <statute or policy section>, <link if any>, <source date>. CONFIRM before relying on it.`

Rules for the list:
- Every entry has a source. No source, no entry. Write "not found" for a clock you could not source, and say what you searched.
- Compute the likely date only when the user gave you the trigger date. Show the math ("60 days from the carrier's request dated March 3 is May 2").
- Where the policy and the statute disagree, list both and say which one usually controls, with the citation for why.
- Never present the list as a table and never boil it down into a chart. Each entry stands on its own with its citation next to it.
- If the source is more than a year old, say so.

End with one line naming the earliest clock and what the user should do about it this week, and one line telling them to confirm every date against the current statute and with their attorney before relying on it.

## Rules

- Never assert a number without a citation. Not a day count, not a year, not "usually". If you cannot source it, say you could not.
- No deadline table. No general summary of state deadlines. Research this claim, this state, this policy.
- The loss state controls, not the state where the user's office is.
- Do the research and flag it for confirmation. "Check with your attorney" on its own is not an answer. The research plus the flag is the answer.
- Never say a deadline has passed. Show the computed date and the source and let the user draw that conclusion with their attorney.

## Important

This skill helps you organize and draft faster. It is not legal advice, and AI can be wrong. Verify every statutory deadline against current law for your state, and read every document before it leaves your desk. You are responsible for what goes out under your name.
