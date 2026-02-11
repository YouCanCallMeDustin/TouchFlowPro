# Accuracy Assassin — Game Documentation

## Overview

**Accuracy Assassin (Arcade Mode)** is a zero-tolerance typing game. Type the prompted text flawlessly under time pressure. One wrong character = instant death. Survive as many rounds as possible while difficulty ramps up.

## Rules

1. Each round presents a text prompt to type within **15 seconds**
2. **Any wrong character** causes immediate death (no tolerance)
3. Backspace is **disabled by default** (configurable in settings)
4. Difficulty ramps after each flawless round:
   - L1: Common words
   - L2: Longer words
   - L3: Capitalization
   - L4: Punctuation
   - L5: Numbers
   - L6: Symbols
5. Press **R** anytime to restart instantly
6. Press **Enter** to start from the menu

## Scoring

```
score = streak × avgNetWPM × difficultyMultiplier
```

Difficulty multipliers: L1=1.0, L2=1.2, L3=1.5, L4=1.8, L5=2.2, L6=2.8

## Architecture

```
games/accuracy-assassin/
├── engine/           # Pure TS — no React deps
│   ├── types.ts      # All type definitions
│   ├── config.ts     # Tunable constants
│   ├── rng.ts        # Seeded PRNG (mulberry32)
│   ├── gameEngine.ts # State machine
│   ├── promptGenerator.ts
│   ├── analyticsLogger.ts
│   └── api.ts        # Backend stubs
├── input/
│   └── inputHandler.ts  # Low-level keyboard handler
├── render/
│   ├── PromptRenderer.tsx  # DOM-based (no React re-render per key)
│   └── Effects.tsx         # Shake, flash, glitch
├── audio/
│   └── soundManager.ts    # Web Audio API synth
├── ui/
│   ├── AccuracyAssassinPage.tsx  # Main orchestrator
│   ├── PreGame.tsx
│   ├── HUD.tsx
│   ├── DeathScreen.tsx
│   ├── ResultsScreen.tsx
│   └── accuracy-assassin.css
├── data/
│   └── wordBank.ts
└── README.md         # (this file)
```

### Performance Design

- **Keystroke hot path** uses DOM manipulation via refs — no `setState` per key
- **HUD updates** at ~12fps via `requestAnimationFrame` loop
- **React state** only changes on phase transitions (idle/countdown/playing/dead/results)
- **Sound** uses Web Audio API oscillators (synthesized, no files)

## Adding a New Game

1. Create `games/your-game/` with the same directory structure
2. Add your game's stage(s) to the `Stage` type union in `App.tsx`
3. Add a card to `GamesLanding.tsx`
4. Add route block(s) in `App.tsx`'s render section

## Backend Wiring (Future)

The `engine/api.ts` file contains stub functions:

- `submitScore(runSummary)` → POST `/api/games/accuracy-assassin/scores`
- `fetchLeaderboard(mode)` → GET `/api/games/accuracy-assassin/leaderboard`

To implement:

1. Add a `GameScore` model to `backend/prisma/schema.prisma`
2. Create `backend/src/routes/games.ts` with Express routes
3. Replace the stubs in `api.ts` with actual `apiFetch()` calls
4. Add JWT auth middleware to the routes

## Analytics

Run data is stored in `localStorage` under key `aa_runs_v1`. Each run includes:
- Per-keystroke timestamps, expected vs typed chars, inter-key intervals
- Run summary with streak, WPM, accuracy, difficulty, score

Export via the "Export Last Run JSON" button on the results screen.
