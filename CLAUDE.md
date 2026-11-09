# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

Always reply to the user in Spanish from Spain (español de España) in this project.

## Project

Arkanoid game in plain HTML, CSS and JavaScript. **Zero dependencies**, no build step, no package manager, no tests/lint. README (Spanish) says the game is not implemented yet — only assets and spec tooling exist so far. No `index.html` yet; open it directly in a browser once created.

## Workflow: spec-driven

Features are built via two project skills (`.agents/skills/`, symlinked into `.claude/skills/`; locked in `skills-lock.json`, source `Klerith/fernando-skills`):

- `/spec <description>` — asks clarifying questions, writes `specs/NN-slug.md` (state `Draft`, template in `.agents/skills/spec/template.md`), seeds `specs/.spec-config.yml`. Writes no code.
- `/spec-impl NN-slug` — only runs if spec state means "Approved" (human flips it; never the agent). Creates/switches to branch `spec-NN-slug` (unless `AutoCreateBranch: false`), then implements one plan step at a time, pausing for diff review. Never commits automatically; no out-of-scope changes; spec ambiguities → stop and ask.
- Spec language must match existing specs (README/specs are Spanish). `specs/` doesn't exist yet.

## Assets

- `assets/spritesheet-breakout.png` + `assets/spritesheet.js`: global (non-module) script. Exposes `SPRITES` (paddle, ball, `blocks.<color>` source rects), `EXPLOSION_FRAMES` (4 frames per color) / `EXPLOSION_DURATION` (150ms), and `loadSpritesheet(cb)`, `drawFrame(ctx, frame, x, y, w, h)`, `drawSprite(ctx, 'block_<color>' | name, x, y, w, h)`.
- Draw calls are no-ops until `loadSpritesheet` callback fires. Image path is hardcoded relative to the page: `assets/spritesheet-breakout.png`, so the HTML page must live at the repo root (this directory).
- `assets/sounds/ball-bounce.mp3`, `break-sound.mp3`.
