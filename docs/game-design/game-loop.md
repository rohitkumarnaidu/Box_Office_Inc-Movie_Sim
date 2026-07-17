# Game Loop Design

## Overview

Box Office Inc is a turn-based simulation game where each turn represents one week in the game world. Players manage their studio through alternating phases of **planning** and **simulation**.

## Core Loop

```
┌─────────────────────────────────────────────────────────┐
│                        WEEK START                        │
│  • View current studio finances and stats                │
│  • Review active productions and talent pipeline         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    PLANNING PHASE                         │
│  • Browse and purchase scripts from marketplace          │
│  • Hire/fire talent (writers, directors, actors, crew)   │
│  • Start new movie productions                           │
│  • Launch marketing campaigns                            │
│  • Manage studio upgrades and loans                      │
│  • Train talent at the academy                           │
│  • Commission TV shows                                   │
│  • Accept streaming deals                                │
│  • Release ready movies                                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    SIMULATION PHASE                       │
│  • Player clicks "Simulate Week"                         │
│  • Backend processes one or more weeks                   │
│  • During simulation:                                    │
│    ├─ Production progresses                              │
│    ├─ Talent works on projects                           │
│    ├─ Payroll is deducted                                │
│    ├─ Loan payments processed                            │
│    ├─ Market trends update                               │
│    ├─ Random events fire                                 │
│    ├─ AI rival studios make decisions                    │
│    ├─ Streaming deals generated                          │
│    ├─ Awards season evaluated                            │
│    └─ News articles generated                            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    REVIEW PHASE                           │
│  • View simulation results                               │
│  • Read news articles                                    │
│  • Check notifications                                   │
│  • Review updated finances and stats                     │
│  • Plan next week's actions                              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
                   RETURN TO TOP
```

## Game Actions by Category

### Studio Management
- Update studio name and profile
- Take loans (3 tiers available)
- Purchase permanent upgrades
- View financial history and projections

### Talent Management
- Hire talent from marketplace (actors, directors, writers, crew)
- Fire talent (with penalties based on contract status)
- Train talent at the academy
- View talent profiles with career history

### Movie Production Pipeline

```
Script Purchase → Director Project → Movie Creation → Production → Post-Production → Ready for Release → Release
     │                │                    │               │              │                    │              │
     ▼                ▼                    ▼               ▼              ▼                    ▼              ▼
  Market or     Director adds          Combine all     Multi-week     Fine-tuning,     Marketing ops,     Box Office,
  Owned         script vision          assets into    production     VFX, scoring     fan events         Reviews,
                                        Movie doc      pipeline                                            Verdict
```

### Script & Writing
- Browse scripts in the marketplace
- Hire writers to create custom scripts via writing projects
- Purchase and sell scripts
- Assign scripts to directors

### Marketing & Promotion
- Launch marketing campaigns for upcoming movies
- Each campaign costs money and boosts hype
- Campaign effectiveness varies by genre match
- Multiple campaigns can stack per movie

### Release & Distribution
- Choose theatrical or streaming release
- Accept streaming deals when offered
- Movies earn box office revenue based on quality, hype, and market conditions
- Verdict ranges from Disaster to All-Time Blockbuster

### Merchandise
- Released movies generate ongoing merchandise revenue
- Merchandise decays over time (0.9^weeks)
- Boost merchandise level to increase revenue

### Espionage
- Purchase spy reports on rival studios
- Reveals rival's active movies, history, and strategy

## Economy System

### Revenue Sources
| Source | Description | Timing |
|--------|-------------|--------|
| Box Office | Theatrical release revenue | One-time at release |
| Streaming Deals | Platform licensing | When deal is accepted |
| Merchandise | Ongoing licensing revenue | Weekly |
| TV Shows | Platform licensing | Weekly while airing |
| Loans | Borrowed capital | One-time at loan origination |

### Expenses
| Expense | Description | Timing |
|---------|-------------|--------|
| Payroll | Weekly talent salaries | Weekly |
| Loan Repayments | Principal + interest | Weekly |
| Production Costs | Movie budget + marketing | At creation |
| Talent Firing | Severance penalties | When firing |
| Training | Academy fees | When training |
| Espionage | Spy reports | On purchase |
| Upgrades | Studio improvements | On purchase |

## Progression System

### Studio Levels
Studios progress through 10 levels based on accumulated prestige:

| Level | Title | Prestige Required |
|-------|-------|-------------------|
| 1 | Independent | 0 |
| 2 | Regional | 50 |
| 3 | National | 150 |
| 4 | Major | 300 |
| 5 | Blockbuster | 500 |
| 6 | Empire | 800 |
| 7 | Legendary | 1,200 |
| 8 | Iconic | 1,800 |
| 9 | Global Giant | 2,500 |
| 10 | Universal | 3,500 |

### Prestige Sources
- Movie release: +5
- Hit movie: +15
- Blockbuster: +30
- Award won: +50
- Franchise established: +20
- Studio upgrade: +25
- Awards campaign: +15

## Save System

Game state is saved automatically after each action and simulation step. There is no manual save/load system. The game state is persisted in MongoDB and reloaded on login.
