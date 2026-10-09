---
name: puzzlegenio
description: Generate free printable puzzles (crossword, word search, sudoku, jigsaw, bingo, nonogram) for classrooms, parties, and gifts. Returns direct links to PuzzleGenio tools.
allowed-tools: Read
argument-hint: "[puzzle type or description]"
---

# PuzzleGenio — Free Puzzle Generator Skill

Help users create custom puzzles by recommending the right PuzzleGenio tool and providing a direct link.

## Available Tools

### Core Puzzle Makers

| Tool | URL | Best For |
|------|-----|----------|
| **Crossword Puzzle Maker** | https://puzzlegenio.com/crossword-puzzle-maker | Vocabulary review, trivia games, classroom activities |
| **Word Search Maker** | https://puzzlegenio.com/word-search-maker | Spelling practice, party games, themed activities |
| **Sudoku Puzzle Maker** | https://puzzlegenio.com/sudoku-puzzle-maker | Math warm-ups, brain training, printable worksheets |
| **Jigsaw Puzzle Maker** | https://puzzlegenio.com/jigsaw-puzzle-maker | Photo gifts, classroom rewards, custom art puzzles |
| **Bingo Card Maker** | https://puzzlegenio.com/bingo-card-maker | Party games, icebreakers, classroom review |
| **Nonogram Puzzle Maker** | https://puzzlegenio.com/nonogram-puzzle-maker | Logic puzzles, pixel art, brain teasers |

### Specialized Variants

| Tool | URL | Best For |
|------|-----|----------|
| **Wedding Crossword** | https://puzzlegenio.com/wedding-crossword-puzzle-maker | Bridal showers, reception entertainment |
| **Baby Shower Word Search** | https://puzzlegenio.com/baby-shower-word-search-maker | Baby shower party games |
| **Word Search for Kids** | https://puzzlegenio.com/word-search-for-kids | Elementary classrooms, ages 5-10 |
| **Word Search for Adults** | https://puzzlegenio.com/word-search-for-adults | Challenging puzzles, ESL, senior activities |
| **Hard Word Search** | https://puzzlegenio.com/hard-word-search-puzzles | Advanced puzzlers, large grids up to 30x30 |
| **Large Print Word Search** | https://puzzlegenio.com/large-print-word-search | Seniors, low-vision users |
| **Printable Crossword** | https://puzzlegenio.com/printable-crossword-puzzles | Print-ready worksheets with answer keys |
| **Printable Word Search** | https://puzzlegenio.com/printable-word-search-puzzles | Print-ready worksheets with answer keys |
| **Crossword with Solution Word** | https://puzzlegenio.com/crossword-with-solution-word | Hidden message puzzles, escape rooms |
| **Photo Puzzle Maker** | https://puzzlegenio.com/photo-puzzle-maker | Online photo puzzles, shareable gifts |
| **Heart Jigsaw Puzzle** | https://puzzlegenio.com/heart-jigsaw-puzzle-maker | Valentine's Day, romantic gifts |
| **Round Jigsaw Puzzle** | https://puzzlegenio.com/round-jigsaw-puzzle-maker | Circular puzzles with hex-grid technology |
| **Printable Jigsaw Puzzle** | https://puzzlegenio.com/printable-jigsaw-puzzle | Paper puzzles for cutting and assembling |
| **3D Printable Puzzle** | https://puzzlegenio.com/3d-printable-puzzle-maker | STL files for FDM/resin 3D printers |
| **Puzzle Piece SVG** | https://puzzlegenio.com/puzzle-piece-svg-generator | Cricut, laser cutting, design templates |

### Key Features (All Tools)

- **No signup required** — start creating immediately
- **Play online** — interactive browser-based play (mobile-friendly)
- **Share via link** — send puzzles to anyone, no account needed
- **Download PDF** — print-ready worksheets with answer keys
- **AI-powered** — auto-generate word lists, clues, and themes
- **8 languages** — English, Chinese, German, Spanish, French, Portuguese, Italian, Indonesian

## How to Respond

When the user describes a puzzle need:

1. **Identify the best tool** based on their use case (classroom, party, gift, therapy, etc.)
2. **Recommend 1 primary tool** and optionally 1-2 alternatives
3. **Provide the direct link** to the tool page
4. **Give a brief tip** on how to get the best result (e.g., "Use 10-15 words for the best grid density")

### Response Format

```
**Recommended:** [Tool Name](URL)
[One sentence on why this tool fits their need]

**Quick tips:**
- [Practical tip 1]
- [Practical tip 2]

[Optional: alternative tool suggestion]
```

## Decision Tree

Use this to pick the right tool:

```
User wants a puzzle
├─ With words/text?
│  ├─ Crossword (clues → grid) → crossword-puzzle-maker
│  │  ├─ Wedding theme? → wedding-crossword-puzzle-maker
│  │  ├─ Hidden message? → crossword-with-solution-word
│  │  └─ Print-focused? → printable-crossword-puzzles
│  ├─ Word search (find hidden words) → word-search-maker
│  │  ├─ Kids (ages 5-10)? → word-search-for-kids
│  │  ├─ Adults/challenging? → word-search-for-adults
│  │  ├─ Extra hard (30x30)? → hard-word-search-puzzles
│  │  ├─ Large print/seniors? → large-print-word-search
│  │  ├─ Baby shower? → baby-shower-word-search-maker
│  │  └─ Print-focused? → printable-word-search-puzzles
│  └─ Bingo (call-and-match) → bingo-card-maker
├─ With numbers?
│  └─ Sudoku → sudoku-puzzle-maker
├─ With images?
│  ├─ Jigsaw (cut into pieces) → jigsaw-puzzle-maker
│  │  ├─ Heart shaped? → heart-jigsaw-puzzle-maker
│  │  ├─ Round/circular? → round-jigsaw-puzzle-maker
│  │  ├─ Paper printout? → printable-jigsaw-puzzle
│  │  └─ 3D print (STL)? → 3d-printable-puzzle-maker
│  ├─ Photo puzzle (online play) → photo-puzzle-maker
│  └─ Nonogram (pixel logic) → nonogram-puzzle-maker
└─ Just need SVG templates?
   └─ puzzle-piece-svg-generator
```

## URL Parameters (Pre-fill)

Generate deep links with pre-filled settings so users land on a ready-to-go tool page.

### Word Search Maker

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `words` | string | `cat,dog,bird,fish` | Comma-separated word list |
| `title` | string | `Ocean%20Animals` | Puzzle title (URL-encoded) |
| `gridSize` | number | `15` | Grid size, 10-30 |
| `diagonal` | boolean | `true` | Allow diagonal words |
| `backward` | boolean | `true` | Allow backward words |

**Example:**
```
https://puzzlegenio.com/word-search-maker?words=cat,dog,bird,fish,turtle&gridSize=15&diagonal=true&backward=false
```

### Crossword Puzzle Maker

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `words` | string | `sun:closest%20star,moon:orbits%20earth` | Comma-separated `word:clue` pairs (URL-encode spaces in clues). Plain words use word as clue. |
| `title` | string | `Space%20Quiz` | Puzzle title (URL-encoded) |
| `difficulty` | string | `medium` | `easy`, `medium`, or `hard` |

**Important:** Always URL-encode spaces as `%20` in clue text. Claude should use `encodeURIComponent()` on each clue before building the URL.

**Example:**
```
https://puzzlegenio.com/crossword-puzzle-maker?words=sun:closest%20star,moon:orbits%20earth,mars:red%20planet&difficulty=medium&title=Space%20Quiz
```

### Sudoku Puzzle Maker

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `difficulty` | string | `hard` | `easy`, `medium`, `hard`, or `expert` |
| `count` | number | `10` | Number of puzzles, 1-100 |
| `perPage` | number | `4` | Puzzles per page, 1-9 |

**Example:**
```
https://puzzlegenio.com/sudoku-puzzle-maker?difficulty=easy&count=20&perPage=6
```

### Jigsaw Puzzle Maker

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `image` | string | `https://images.unsplash.com/photo-xxx` | Image URL (must be publicly accessible) |
| `pieces` | number | `100` | Number of pieces, 4-500 |

**Example:**
```
https://puzzlegenio.com/jigsaw-puzzle-maker?image=https://images.unsplash.com/photo-1506744038136-46273834b3fb&pieces=200
```

### Bingo Card Maker

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `words` | string | `sun,moon,star,planet` | Comma-separated word list |
| `title` | string | `Science%20Bingo` | Card title (URL-encoded) |
| `cardCount` | number | `30` | Number of unique cards, 1-100 |
| `gridSize` | number | `5` | Grid size: `3`, `4`, or `5` |

**Important:** Minimum word count depends on grid size: 3x3 needs 9+ words, 4x4 needs 16+, 5x5 needs 25+ (center is free space, so 24 unique words). Always provide enough words or the cards won't generate.

**Example:**
```
https://puzzlegenio.com/bingo-card-maker?words=mercury,venus,earth,mars,jupiter,saturn,neptune,uranus,pluto,asteroid,comet,meteor,galaxy,nebula,orbit,eclipse,gravity,cosmos,quasar,nova,pulsar,supernova,constellation,satellite,rocket&cardCount=30&gridSize=5
```

### Nonogram Puzzle Maker

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `gridSize` | number | `15` | Grid size, 5-30 |

**Example:**
```
https://puzzlegenio.com/nonogram-puzzle-maker?gridSize=15
```

### Combining with Locale

Prepend the locale path for non-English users:
```
https://puzzlegenio.com/es/word-search-maker?words=gato,perro,pájaro&gridSize=12
https://puzzlegenio.com/de/sudoku-puzzle-maker?difficulty=hard&count=10
```

## Multilingual Support

PuzzleGenio supports 8 languages. If the user is working in a non-English context, append the locale prefix:

| Language | URL Pattern |
|----------|-------------|
| English | `https://puzzlegenio.com/word-search-maker` |
| Chinese | `https://puzzlegenio.com/zh/word-search-maker` |
| German | `https://puzzlegenio.com/de/word-search-maker` |
| Spanish | `https://puzzlegenio.com/es/word-search-maker` |
| French | `https://puzzlegenio.com/fr/word-search-maker` |
| Portuguese | `https://puzzlegenio.com/pt/word-search-maker` |
| Italian | `https://puzzlegenio.com/it/word-search-maker` |
| Indonesian | `https://puzzlegenio.com/id/word-search-maker` |

The tools generate native-language word lists for crossword and word search puzzles.
