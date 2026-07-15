# Database Schema Documentation

## Overview

The application uses MongoDB with Mongoose 9 for schema validation and data modeling. The database consists of the following collections:

## Collections

### Users (`users`)

Stores player account information.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | String | Yes | Unique username (3-30 chars, alphanumeric + underscores) |
| `email` | String | Yes | Unique email address |
| `password` | String | Yes | Bcrypt-hashed password |
| `refreshTokens` | Array | No | Array of `{ tokenHash, createdAt, expiresAt }` for session management |
| `isDisabled` | Boolean | No | Flag to disable user account |
| `studio` | ObjectId | No | Reference to the user's Studio document |

**Indexes:** `username` (unique), `email` (unique)

---

### Studios (`studios`)

Tracks player studio state.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `owner` | ObjectId | Yes | Reference to User |
| `name` | String | Yes | Studio display name |
| `money` | Number | No | Current balance (default: 10,000,000) |
| `prestige` | Number | No | Studio reputation score |
| `fans` | Number | No | Fan base count |
| `studioLevel` | Number | No | Studio level (1-10) |
| `highestGrossingMovie` | ObjectId | No | Reference to Movie with highest gross |
| `mostProfitableMovie` | ObjectId | No | Reference to Movie with highest profit |
| `bestReviewedMovie` | ObjectId | No | Reference to Movie with best critic score |
| `stats` | Object | No | Aggregated studio statistics |
| `stats.moviesReleased` | Number | - | Total movies released |
| `stats.hits` | Number | - | Total hit movies |
| `stats.blockbusters` | Number | - | Total blockbuster movies |
| `stats.flops` | Number | - | Total flop movies |
| `stats.revenue` | Number | - | Total revenue earned |
| `stats.profit` | Number | - | Total profit |
| `stats.avgCriticScore` | Number | - | Average critic score |
| `stats.avgAudienceScore` | Number | - | Average audience score |
| `stats.awardsWon` | Number | - | Total awards won |
| `financialHistory` | Array | No | Array of weekly financial records |
| `seasonStats` | Array | No | Array of seasonal statistics |
| `merchandiseIncomeHistory` | Array | No | Array of weekly merchandise income records |
| `loans` | Array | No | Array of active loans `{ amount, interestRate, weeklyRepayment, weeksRemaining, takenWeek }` |
| `negativeCashWeeks` | Number | No | Consecutive weeks with negative balance |
| `isBankrupt` | Boolean | No | Bankruptcy flag |

---

### Movies (`movies`)

Stores movie production and release data.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Movie title |
| `studioId` | ObjectId | Yes | Reference to Studio |
| `scriptId` | String | Yes | ID of the script used |
| `directorId` | String | Yes | Director talent ID |
| `directorName` | String | No | Human-readable director name (backfilled) |
| `leadActorId` | String | Yes | Lead actor talent ID |
| `leadActorName` | String | No | Human-readable actor name (backfilled) |
| `supportingActorIds` | [String] | No | Array of supporting actor IDs |
| `crewTeamId` | String | Yes | Crew team ID |
| `crewTeamName` | String | No | Human-readable crew name (backfilled) |
| `budget` | Number | No | Total production budget |
| `marketingBudget` | Number | No | Marketing campaign budget |
| `marketingCampaigns` | [String] | No | Array of campaign IDs |
| `quality` | Number | No | Overall quality score (0-100) |
| `hype` | Number | No | Pre-release hype level (0-100) |
| `criticScore` | Number | No | Critic score (0-100) |
| `criticLabel` | String | No | Critic score label |
| `audienceScore` | Number | No | Audience score (0-100) |
| `audienceLabel` | String | No | Audience score label |
| `boxOffice` | Number | No | Worldwide gross revenue |
| `openingWeekend` | Number | No | Opening weekend gross |
| `domesticGross` | Number | No | Domestic box office |
| `internationalGross` | Number | No | International box office |
| `worldwideGross` | Number | No | Total worldwide gross (same as boxOffice) |
| `profit` | Number | No | Net profit |
| `roi` | Number | No | Return on investment ratio |
| `verdict` | String | No | Box office verdict label |
| `status` | String | No | Production status (enum: PLANNING through RELEASED_STREAMING) |
| `releaseType` | String | No | THEATRICAL or STREAMING |
| `streamingDeal` | Object | No | Streaming deal details |
| `createdWeek` | Number | Yes | Week number when production started |
| `releaseWeek` | Number | No | Week number when released |
| `productionProgress` | Number | No | Current production progress |
| `remainingWeeks` | Number | No | Weeks remaining in production |
| `franchiseId` | ObjectId | No | Reference to Franchise |
| `sequelNumber` | Number | No | Sequel number in franchise |

**Virtual Fields:** `totalGross` (maps to `boxOffice`)

---

### GameStates (`gamestates`)

Central game state document containing all dynamic game data.

| Field | Type | Description |
|-------|------|-------------|
| `user` | ObjectId | Reference to User |
| `currentWeek` | Number | Current simulation week |
| `lastSimulatedWeek` | Number | Last week that was simulated |
| `randomEvents` | Mixed | Event cooldowns and history |
| `ownedScripts` | [SubDoc] | Scripts owned by the player |
| `marketScripts` | [SubDoc] | Scripts available for purchase |
| `activeMovies` | [ObjectId] | References to in-production movies |
| `movieHistory` | [ObjectId] | References to released movies |
| `preProductionMovies` | [SubDoc] | Movies in pre-production |
| `marketWriters` | [SubDoc] | Writers available in the market |
| `ownedWriters` | [SubDoc] | Contracted writers |
| `ownedDirectors` | [SubDoc] | Contracted directors |
| `ownedActors` | [SubDoc] | Contracted actors |
| `ownedCrewTeams` | [SubDoc] | Contracted crew teams |
| `activeDirectorProjects` | [SubDoc] | Active directing projects |
| `activeActorProjects` | [SubDoc] | Active acting projects |
| `activeWritingProjects` | [SubDoc] | Active writing projects |
| `rivalStudios` | [SubDoc] | AI rival studio data |
| `marketTrends` | Mixed | Active market trends and cooldowns |
| `streamingPlatforms` | [SubDoc] | Available streaming platforms |

---

### Market Talent Collections

#### MarketActors (`marketactors`)
#### MarketDirectors (`marketdirectors`)
#### MarketCrewTeams (`marketcrewteams`)

These collections store talent available in the marketplace (extracted from GameState for performance). Each document contains:

| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId | Owner user reference |
| Talent-specific stats | Mixed | Same structure as embedded talent in GameState |
| `salaryHistory` | Array | Historical salary records |
| `careerHistory` | Array | Career milestone records |

---

### Franchises (`franchises`)

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Franchise name |
| `studioId` | ObjectId | Owner studio |
| `movies` | [ObjectId] | Movie references in the franchise |
| `totalRevenue` | Number | Cumulative franchise revenue |
| `fanbaseMultiplier` | Number | Fanbase growth multiplier |
| `prestigeBonus` | Number | Prestige bonus per installment |

---

### Notifications (`notifications`)

| Field | Type | Description |
|-------|------|-------------|
| `gameStateId` | ObjectId | Reference to GameState |
| `type` | String | Notification type |
| `message` | String | Notification message |
| `read` | Boolean | Read status |

---

### AuthEvents (`authevents`)

Security audit log for authentication events.

| Field | Type | Description |
|-------|------|-------------|
| `user` | ObjectId | Reference to User |
| `eventType` | String | Login/logout/refresh/failure events |
| `reason` | String | Failure reason |
| `identifier` | String | User identifier used |
| `ipAddress` | String | Client IP |
| `userAgent` | String | Client user agent |
| `metadata` | Mixed | Additional event data |

**Indexes:** `{ user, createdAt }` compound index

---

### TV Shows (`tvshows`)

| Field | Type | Description |
|-------|------|-------------|
| `studioId` | ObjectId | Owner studio |
| `title` | String | Show title |
| `genre` | String | Show genre |
| `seasons` | Number | Number of seasons |
| `episodesPerSeason` | Number | Episodes per season |
| `budget` | Number | Production budget |
| `quality` | Number | Quality score (0-100) |
| `popularity` | Number | Popularity score |
| `platformId` | String | Streaming platform ID |
| `status` | String | IN_PRODUCTION/AIRING/ENDED/CANCELLED |

---

### Relations Diagram

```
User (1) ──→ Studio (1)
User (1) ──→ GameState (1)
Studio (1) ──→ Movie (N)
Studio (1) ──→ Franchise (N)
Studio (1) ──→ TVShow (N)
GameState (1) ──→ Notification (N)
Movie (N) ──→ Franchise (N)  (via franchiseId)
User (1) ──→ AuthEvent (N)
User (1) ──→ MarketActor (N)
User (1) ──→ MarketDirector (N)
User (1) ──→ MarketCrewTeam (N)
```
