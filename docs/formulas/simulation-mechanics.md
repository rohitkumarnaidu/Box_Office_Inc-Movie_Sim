# CineVerse -- Game Mechanics and Formulas Guide

This document outlines the core mathematical models and formulas used by the simulation engines in CineVerse.

---

## 1. Movie Quality Score

A movie's base quality is computed when it is greenlit (or created), aggregating the scores of the script, director, lead actor, and crew.

The quality score is a weighted sum:

\[Quality = (ScriptQuality \times 0.35) + (DirectorCreativity \times 0.25) + (LeadActorSkill \times 0.20) + (CrewTechnicalQuality \times 0.20)\]

### Modifiers
- **Creative Chemistry**: Working relationships can apply up to a +10 bonus (for high chemistry) or up to a -15 penalty (for low chemistry or conflicting personalities).

---

## 2. Box Office Simulation Engine

The box office model computes the opening weekend gross and weekly ticket depreciation.

### Step 1: Base Opening Weekend Gross
The base opening weekend potential is calculated using the movie's quality, hype, and the lead actor's star power:

\[BaseOpening = (Quality \times 1.5 + Hype \times 2.0 + ActorStarPower \times 1.0) \times BaseScaleMultiplier\]

*Note: BaseScaleMultiplier is configured dynamically based on overall simulation balance.*

### Step 2: Market Climate & Genre Multipliers
If any active trend matches the movie's genre list, a trend multiplier is applied:
- **Active Trend Boost**: +20% to +40% revenue per matching trend.
- **Fatigue Penalty**: -15% to -30% revenue if the market is saturated with the genre.

\[FinalOpening = BaseOpening \times TrendMultiplier \times ClashPenalty\]

- **Clash Penalty**: If multiple blockbusters are scheduled on the same release week, a clash penalty between 20% and 35% is applied.

### Step 3: Weekly Depreciation (Decay)
After the opening weekend, theatrical ticket sales decay week-over-week. The weekly drop is driven by the film's critic and audience reviews:

\[DropPercentage = BaseDrop - (AudienceScore \times 0.2) + (CompetitionFactor \times 10)\]

- High audience scores lead to "legs" (smaller weekly drops, sustaining long runs).
- Poor reviews result in a "front-loaded" run (drops exceeding 60% in week 2).

---

## 3. Studio Growth & Reputation

Releasing successful movies boosts the studio's cash reserves, fans, and prestige.

### Cash Additions
The studio receives a share of the domestic and international gross:

\[StudioShare = TheatricalGross \times DistributionCut\]

- **Distribution Cut**: Default cut is 50% for domestic theatrical runs and 40% for international runs.

### Fan Base and Prestige Growth
- **New Fans**: Earned based on the film's worldwide gross and quality score:
  \[NewFans = WorldwideGross \times (Quality / 100) \times FanConversionMultiplier\]
- **Prestige Change**: Based on critical reception.
  - A critically acclaimed movie increases prestige by up to +10.
  - A major flop reduces prestige by up to -15.

---

## 4. Talent Progression & Career Impact

During each weekly simulation tick, signed talent can experience progression or regression.

- **Progression Chance**: Talent on active projects has a 5% chance per week to gain stats (e.g. +1 skill or +1 creativity) as they gain experience on set.
- **Regression/Aging**: Unemployed talent above the age of 60 has a 10% chance per year to experience minor stat decay due to aging, eventually leading to retirement at age 70.
