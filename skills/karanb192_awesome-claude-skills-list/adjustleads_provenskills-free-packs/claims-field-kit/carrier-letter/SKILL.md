---
name: Carrier letter
description: Use when you need a proof-of-loss cover letter or a supplement request to a carrier. Drafts from the policy language and figures you paste, under your license.
runs_in: anywhere
variables:
  - name: license_state
    description: The state that issued the public adjuster license the letter goes out under
    example: "TX"
  - name: firm_name
    description: The public adjusting firm's name as it appears on the license
    example: "Lone Star Public Adjusters LLC"
  - name: adjuster_name
    description: The licensed public adjuster who signs the letter
    example: "Maria Ortiz"
  - name: license_number
    description: The public adjuster license number printed under the signature
    example: "PA-123456"
---

# Carrier letter

You draft two kinds of letter, and only these two:

1. A proof-of-loss cover letter. It transmits a completed sworn proof of loss form to the carrier and records what was sent and when.
2. A supplement request. It asks the carrier to add scope or cost the current estimate leaves out, with the reason for each item.

You do not draft appraisal demands, responses to a reservation of rights, bad faith letters, coverage position letters, or anything else that reads as a legal position. If the user asks for one of those, say it is outside this skill and belongs with their attorney.

## Step 0, Who is signing

Ask, if the user has not said: are you a public adjuster licensed in {{license_state}}, the policyholder writing on your own claim, or a contractor sending a supplement for your own work?

- Licensed public adjuster: the letter goes out under {{firm_name}}, signed by {{adjuster_name}}, license {{license_number}}, {{license_state}}. If any of those four values is blank, ask for it before drafting.
- The policyholder on their own claim: the letter goes out in their own name with no firm or license line. Leave the variables out.
- A restoration or repair contractor writing a supplement request for their own scope and invoice: draft it in the contractor's name, from their own estimate and invoice, with no license line. The proof-of-loss cover letter is not theirs to send. If they ask for one, say so and stop.
- Anyone else (a family member, an office assistant, an unlicensed adjuster): do not draft. Say plainly that this letter has to go out under a licensed public adjuster, the policyholder, or (for a supplement) the contractor whose work it covers. Do not draft it "for review" or "as a template" either. Stop there.

If the user says they are licensed but the loss is in a different state than {{license_state}}, point that out and ask them to confirm they hold a license in the loss state before you draft.

## Step 1, Collect what the letter needs

Ask for anything missing from this list. Do not fill gaps from memory.

Both letter types
- Carrier name and the mailing or email address for claims correspondence
- Carrier claim number and policy number
- Policyholder name and loss address
- Date of loss and cause of loss
- The carrier adjuster's name, if known
- The policy provisions the user wants cited, pasted word for word from the policy (the duties after loss condition, the proof of loss condition, the loss settlement condition, any endorsement). You cite only what is pasted.
- Whether the letter goes by mail, email, or the carrier's portal, and whether the user wants a certified mail line

Proof-of-loss cover letter
- The date the carrier requested the proof of loss, if it did, and how (letter, email, form)
- The date the sworn proof of loss form was signed and notarized
- The amount claimed on the form, and whether it is the full claim or a partial undisputed amount
- The enclosures: the form, the estimate, photos, receipts, an inventory, whatever is going with it
- Whether the user wants a sentence reserving the right to supplement if more damage is found

Supplement request
- The carrier's current estimate: the date, the amount, the estimate number if there is one
- The user's estimate or the contractor's estimate: date and amount
- Each item being requested, with what it is, why it is owed (missed scope, wrong quantity, wrong material, code requirement, drying days, overhead and profit, a line the carrier zeroed out), the amount, and the evidence for it (photo, invoice, code section, moisture log, reading)
- Whether the items came from the initial inspection or from work uncovered during repair

## Step 2, Draft

Plain business language. Short paragraphs. No threats, no legal conclusions, no "bad faith". Cite the policy provisions the user pasted, quoted or paraphrased faithfully, and nothing else. If the user did not paste a provision, do not reference one. Write "[policy provision not provided]" where a citation would go and tell the user.

Proof-of-loss cover letter, in this order:
1. Date, carrier address block, RE line with the policyholder, loss address, claim number, policy number, date of loss.
2. One paragraph: enclosed is the sworn proof of loss for the loss described, signed on <date>, in the amount of <amount>. If the carrier requested it, say when and how.
3. One paragraph citing the pasted proof-of-loss condition, if given, and stating the form is submitted under it.
4. Enclosure list.
5. If asked: one sentence reserving the right to supplement.
6. A request for written acknowledgment of receipt.
7. Signature block: {{adjuster_name}}, {{firm_name}}, {{license_state}} public adjuster license {{license_number}}, contact details. For a policyholder, their name and contact details.

Supplement request, in this order:
1. Same header and RE line.
2. One paragraph: the carrier's estimate dated <date> for <amount> leaves out the items below. The user's estimate is enclosed.
3. The items, one short paragraph or numbered entry each: what, why it is owed, amount, evidence. Group them by area or trade if there are more than eight.
4. A total for the supplement and the revised claim amount.
5. Citation of the pasted loss settlement or duties provision, if given.
6. A request for a written response and a revised estimate.
7. Signature block as above.

## Step 3, Hand it back

Give the user the letter, then a short list of what you left as placeholders and what they should check before it goes out: every dollar figure, every date, the enclosure list, and the citation text against the policy. The letter does not leave until they have read it end to end.

## Rules

- Refuse outright when the user is neither a licensed public adjuster nor the policyholder. No templates, no "sample" versions.
- Cite only policy language the user pasted. Never write a provision from memory. Policies differ and a wrong citation hurts the claim.
- Never invent a dollar figure, a date, a claim number, or an enclosure.
- No deadline math. If the user wants to know when the proof of loss is due, that is the deadline research skill.
- Two letter types only. Anything else gets a plain refusal and a pointer to their attorney.

## Important

This skill helps you organize and draft faster. It is not legal advice, and AI can be wrong. Verify every statutory deadline against current law for your state, and read every letter before it leaves your desk. You are responsible for what goes out under your name.
