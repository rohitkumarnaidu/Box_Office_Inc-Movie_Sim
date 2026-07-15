# Review Formulas: Critic & Audience Scores

## Overview

When a movie is released, the `reviewEngine` generates two review scores:
- **Critic Score** (0–100): Professional critical reception
- **Audience Score** (0–100): General public reception

These scores influence box office legs, long-term revenue, and studio reputation.

## Critic Score Calculation

### Base Formula

```
criticScore = (quality * 0.40) + (directorReputation * 0.20) + (scriptOriginality * 0.15) + (leadActorSkill * 0.15) + (crewTechnical * 0.10)
```

### Inputs

| Input | Weight | Source |
|-------|--------|--------|
| Movie Quality | 40% | Computed from script, director, actor, crew during creation |
| Director Reputation | 20% | Director's reputation score (0–100) |
| Script Originality | 15% | Script's originality score (0–100) |
| Lead Actor Skill | 15% | Lead actor's acting skill (0–100) |
| Crew Technical Quality | 10% | Crew team's technical quality (0–100) |

### Random Variance

A small random variance is applied to prevent identical scores:
```
variance = random(-5, +5)
criticScore = clamp(criticScore + variance, 0, 100)
```

## Audience Score Calculation

### Base Formula

```
audienceScore = (quality * 0.30) + (hype * 0.30) + (leadActorPopularity * 0.20) + (marketingEffective * 0.20)
```

### Inputs

| Input | Weight | Source |
|-------|--------|--------|
| Movie Quality | 30% | Computed quality score |
| Pre-release Hype | 30% | Hype accumulated before release |
| Lead Actor Popularity | 20% | Actor's popularity (0–100) |
| Marketing Effectiveness | 20% | Based on marketing budget and campaigns |

### Random Variance

```
variance = random(-3, +8)   // Audience scores are slightly positively biased
audienceScore = clamp(audienceScore + variance, 0, 100)
```

## Score Labels

### Critic Labels

| Score Range | Label | Description |
|-------------|-------|-------------|
| 0–19 | Unbearable | Critically panned |
| 20–39 | Terrible | Strongly negative reviews |
| 40–49 | Mixed | Divided critical reception |
| 50–59 | Average | Mediocre reviews |
| 60–69 | Decent | Generally favorable |
| 70–79 | Good | Positive reviews |
| 80–89 | Excellent | Highly praised |
| 90–100 | Masterpiece | Near-universal acclaim |

### Audience Labels

| Score Range | Label | Description |
|-------------|-------|-------------|
| 0–19 | Unanimous Dislike | Audience hated it |
| 20–39 | Mostly Disliked | Strongly negative word of mouth |
| 40–49 | Mixed | Divided audience reception |
| 50–59 | Average | Acceptable entertainment |
| 60–69 | Decent | Good entertainment value |
| 70–79 | Liked | Positive word of mouth |
| 80–89 | Highly Rated | Strong audience approval |
| 90–100 | Beloved | Near-universal audience love |

## Impact on Box Office

The review scores affect the **legs factor** in box office calculations:

```
legs = (audienceScore / 100 * 5) + (criticScore / 100 * 2) + random(0, 2)
worldwideGross = openingWeekend * (1.5 + legs)
```

- High audience scores → longer theatrical run → higher gross
- Critic scores have less impact on legs but affect prestige
- The legs factor ranges from approximately 2.5x to 9x the opening weekend

## Implementation Reference

The review generation logic is located at:
- `backend/src/services/simulation/engines/reviewEngine.js`

Threshold constants are defined in:
- `backend/src/constants/verdicts.js`
