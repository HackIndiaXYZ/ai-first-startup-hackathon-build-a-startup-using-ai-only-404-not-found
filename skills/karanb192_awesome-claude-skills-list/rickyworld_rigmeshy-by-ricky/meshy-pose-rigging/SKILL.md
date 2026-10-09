---
name: meshy-pose-rigging
description: "Guidance for shooting/posing a character photo before turning it into a rigged, animation-ready 3D model with Meshy AI's Auto-Rig — covers the ideal T-pose/A-pose reference shot, the full Image/Text-to-3D to Auto-Rig workflow, a troubleshooting table for common rigging failures (collapsing shoulders, fused fingers, asymmetric deformation, floating/sinking models), and UniRig as a free self-hosted alternative. Use this whenever the user wants to rig a character in Meshy, is preparing a reference photo for a humanoid/creature 3D model, mentions T-pose, A-pose, Meshy Auto-Rig, Mixamo-compatible export, or wants a self-hosted/open-source auto-rigging pipeline."
---

# Meshy Pose & Rigging Guide

Practical checklist for getting clean, animation-ready rigs out of Meshy AI's
Auto-Rig — from the reference photo all the way to a Mixamo-compatible export,
plus a free self-hosted fallback.

If the `meshy` MCP tools (`meshy_image_to_3d`, `meshy_text_to_3d`, `meshy_rig`,
`meshy_animate`, `meshy_remesh`) are available, use this guide to steer the
*inputs* to those tools (pose, framing, skeleton type) rather than just their
parameters — most rig failures come from the source photo/mesh, not the rig
step itself. Follow the meshy MCP server's own cost-confirmation rule before
calling any credit-consuming tool.

## 1. The ideal reference photo

**T-pose is recommended** (arms straight out to the sides, ~90° from torso).
**A-pose is an acceptable alternative** (arms at a ~45° downward angle) when
the character's design doesn't support a strict T-pose (e.g. a cape or
shoulder armor that would clip).

Checklist for the shot:

- **Arms clearly separated from the body** — each limb must be visually
  distinct. An arm pressed against the torso fuses the meshes there and
  breaks the rig at that joint.
- **Facing the camera, slight 3/4 tolerated** — avoid high or low camera
  angles (looking down/up at the subject); Meshy infers depth poorly from
  those angles.
- **Subject fills 70-90% of the frame** — not cropped, minimal empty margin.
- **Soft, diffuse lighting** — studio-style, no hard shadows. A hard shadow
  gets baked into the generated texture and won't move with the rig.
- **Neutral expression, feet on the ground, symmetrical silhouette** — this
  makes the automatic deformation-weight calculation much more reliable.
- **Bonus: multi-view** — front / profile / back shots via Meshy's
  Multi-View input noticeably improve geometry on every side, especially the
  back of the model.

**Avoid:** clenched/fused fingers, a cape or loose clothing pressed against
the body, hard directional lighting, low/high camera angles, a busy
background.

## 2. Auto-rigging workflow in Meshy

1. **Get the model in** — import an existing FBX/OBJ/GLB, or generate it
   directly with Text-to-3D / Image-to-3D. No need to export and re-import.
2. **Texture before rigging** — apply PBR textures/materials *before* the rig
   step so the final look is locked in.
3. **Pick the skeleton type** — Humanoid, Quadruped, or Smart-Rig (for
   atypical/non-standard creatures).
4. **Center and orient the model** — facing forward, feet on the ground —
   then run Auto-Rig (~30 seconds).
5. **Inspect the skeleton overlay** — fine-tune in the built-in bone editor
   if joints look off.
6. **Animate or export** — apply one of 600+ built-in animations, or export
   FBX/GLB with Mixamo-compatible bone naming to reuse Mixamo animations.

## 3. Troubleshooting

| Symptom | Fix |
|---|---|
| Shoulders/hips collapse | Regenerate the model in a strict T-pose or A-pose |
| Asymmetric deformation | Add "symmetrical" to the generation prompt |
| Tearing at joints | Run a Remesh pass before rigging |
| Fingers or a cape fused to the body | Regenerate with explicit separation instructions in the prompt |
| Model floats or sinks into the ground | Recenter/reposition the model before running Auto-Rig |

## 4. Free self-hosted alternative — UniRig

**VAST-AI-Research/UniRig** ("One Model to Rig Them All", SIGGRAPH 2025) is a
single autoregressive model that rigs humanoids, quadrupeds, and atypical
creatures from a raw mesh. It's the same class of technique Meshy uses
internally for generative rigging. Free, weights published on Hugging Face —
worth it if the user wants a self-hosted pipeline with no credits/usage
limits, or needs to batch-rig many assets via a Python script.

Repo: `github.com/VAST-AI-Research/UniRig`

## Sources

- Meshy — AI Auto-Rigging (feature page)
- Meshy — full Auto-Rigging guide (2026)
- Meshy — Rigging API docs
- Meshy — Improving Image-to-3D results
- Meshy — Pose/face/hands troubleshooting
- GitHub — `meshy-dev/Meshy-guide` (official tutorial hub)
- GitHub — `VAST-AI-Research/UniRig`
- GitHub Topics — `auto-rigging`

Guide compiled August 2026 — re-check against Meshy's docs if their rigging
tool has since changed.
