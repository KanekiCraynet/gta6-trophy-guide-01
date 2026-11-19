# GTA VI Trophy Guide — make.fun Entry

[![make.fun](https://img.shields.io/badge/make.fun-bounty-6366F1?logo=github&style=for-the-badge)](https://make.fun)
[![Competition](https://img.shields.io/badge/competition-gta6--trophy--guide--01-8B5CF6?style=for-the-badge)](https://make.fun/c/gta6-trophy-guide-01)
[![Status](https://img.shields.io/badge/status-submitted-success?style=for-the-badge)]()

> **Static web app** — 55 trophy guide with localStorage tracker, progress ring, filters, roadmap, and missables checklist. Built for the make.fun bounty competition.

## Live Demo
https://kanekicraynet.github.io/gta6-trophy-guide-01/

## Features
- ✅ **55 Trophy Guides** — Complete coverage (Platinum, 2 Gold, 9 Silver, 43 Bronze)
- ✅ **Progress Ring** — Visual completion percentage with platinum badge animation
- ✅ **Smart Filters** — By Grade (Platinum/Gold/Silver/Bronze), Kind (Story/Activities/Collectibles/Missable), Spoiler toggle
- ✅ **Roadmap View** — 5-stage progression (Early Game → 100% / Platinum)
- ✅ **Missables Checklist** — 7 missable trophies highlighted with warning badges
- ✅ **localStorage Persistence** — Checkmarks, spoiler preference, theme saved locally
- ✅ **Export/Import** — Backup & restore progress as JSON
- ✅ **Dual Theme** — Light (paper) / Dark (night) with Coral accent
- ✅ **Keyboard Shortcuts** — `T` theme, `F` filters, `S` spoiler, `E` export, `I` import, `?` help
- ✅ **Print Styles** — Clean checklist export for physical tracking
- ✅ **Responsive** — Mobile-first, works on all viewports
- ✅ **Zero Dependencies** — Vanilla ES modules, no build step

## Quick Start
```bash
# Serve locally
npx serve .
# or
python3 -m http.server 8080
```
Open `http://localhost:8080` (or served port).

## Project Structure
```
├── index.html          # Main HTML (135 lines)
├── app.js              # App logic (527 lines, ES module)
├── style.css           # Styling (665 lines, dual theme)
├── shots.json          # Screenshot config for make.fun
├── dossier.json        # Built submission dossier (559 KB)
├── app/data/
│   ├── trophies.json   # 55 trophy definitions (kind, missable, roadmapStage)
│   └── guides.json     # 55 detailed guides (steps, sources, missableDetail)
├── screenshots/        # 3 required screenshots
├── vendor/             # Minimal deps (none required)
├── LICENSE             # MIT
└── README.md           # This file
```

## Data Sources
- [Exophase GTA VI Trophy List](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
- [PSNProfiles GTA VI Trophies](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
- Official trophy descriptions (in-game)

## Roadmap Stages
| Stage | Description | Trophies |
|-------|-------------|----------|
| 1 | Early Game (Ch. 1-2, Tutorial) | 5 |
| 2 | Open World Unlocked | 15 |
| 3 | Mid-Game (Ch. 3-4, Side Content) | 18 |
| 4 | Late Game / Completionist | 12 |
| 5 | Platinum / 100% | 5 |

## Missable Trophies (7)
⚠️ **Do these before finishing Chapter 4**
- Road to Rehabilitation (Andy strand)
- This Was No Boat Accident (Kenton strand)
- The Lone Rider (Billy strand)
- Strangers & Freaks (All 8 strands — Silver)
- Supply & Demand (Randy strand)
- Spin On This! (Tyrone strand)
- Fair Game (Bret unique animal)

## Competition Requirements Met
- ✅ Public GitHub repo with OSI license (MIT)
- ✅ GitHub About topic: `makefun`
- ✅ README with make.fun badge
- ✅ 3 screenshots (checklist, roadmap, missables)
- ✅ Static web app, localStorage tracker
- ✅ Built with agent assistance (recording: `01a1f405-2f7f-7522-bce3-29aca0cdb2e0`)

## License
MIT — see [LICENSE](LICENSE)

---

*Built for make.fun competition `gta6-trophy-guide-01` • Deadline: 2026-11-21T11:10:00Z*