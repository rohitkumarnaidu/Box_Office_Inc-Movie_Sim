/**
 * @fileoverview Marketplace Helper
 *
 * Provides reusable server-side filtering, sorting, and pagination for any
 * talent marketplace array stored inside a GameState document
 * (e.g. marketActors, marketDirectors, marketCrewTeams, etc.).
 *
 * Also includes a lightweight in-memory TTL cache to avoid redundant DB
 * reads when the same user hits the same marketplace endpoint repeatedly
 * in a short window (e.g. filter tweaks, page flips).
 */

// ---------------------------------------------------------------------------
// In-memory TTL cache
// ---------------------------------------------------------------------------
const _cache = new Map();
const CACHE_TTL_MS = 5_000; // 5 seconds

/**
 * Returns a cached value or `undefined` if not present / expired.
 * @param {string} key
 */
const cacheGet = (key) => {
  const entry = _cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    _cache.delete(key);
    return undefined;
  }
  return entry.value;
};

/**
 * Stores a value in the cache.
 * @param {string} key
 * @param {*} value
 */
const cacheSet = (key, value) => {
  _cache.set(key, { value, ts: Date.now() });
};

/**
 * Invalidates all cache entries for a given user.
 * Call this after any mutation (hire / fire).
 * @param {string} userId
 */
export const invalidateUserCache = (userId) => {
  for (const key of _cache.keys()) {
    if (key.startsWith(userId)) {
      _cache.delete(key);
    }
  }
};

// ---------------------------------------------------------------------------
// Filter / Sort / Paginate
// ---------------------------------------------------------------------------

/**
 * Applies query-string driven filtering, sorting, and pagination to a
 * talent array. Works for actors, directors, writers, and crew teams.
 *
 * Recognised query params (all optional):
 *  - `search`     - case-insensitive substring match on `name`
 *  - `minAge`     - integer
 *  - `maxAge`     - integer
 *  - `minSalary`  - integer
 *  - `maxSalary`  - integer
 *  - `rarity`     - exact match (e.g. "Common", "Epic")
 *  - `sortBy`     - field name (default "popularity")
 *  - `sortOrder`  - "asc" | "desc" (default "desc")
 *  - `page`       - 1-indexed page number (default 1)
 *  - `limit`      - items per page (default 24, max 100)
 *
 * @param {Array} items   - The full talent array from GameState.
 * @param {object} query  - Express `req.query`.
 * @returns {{ items: Array, page: number, limit: number, total: number, totalPages: number }}
 */
export const getMarketplaceTalent = (items, query = {}) => {
  let filtered = items.map((item, idx) => {
    const obj = item.toObject ? item.toObject() : { ...item };
    obj._originalIndex = idx;
    return obj;
  });

  // --- Filters ---
  const search = (query.search || "").trim().toLowerCase();
  if (search) {
    filtered = filtered.filter((t) => (t.name || "").toLowerCase().includes(search));
  }

  const minAge = parseInt(query.minAge, 10);
  const maxAge = parseInt(query.maxAge, 10);
  if (!isNaN(minAge)) filtered = filtered.filter((t) => (t.age || 0) >= minAge);
  if (!isNaN(maxAge)) filtered = filtered.filter((t) => (t.age || 0) <= maxAge);

  const minSalary = parseInt(query.minSalary, 10);
  const maxSalary = parseInt(query.maxSalary, 10);
  if (!isNaN(minSalary)) filtered = filtered.filter((t) => (t.salary || 0) >= minSalary);
  if (!isNaN(maxSalary)) filtered = filtered.filter((t) => (t.salary || 0) <= maxSalary);

  if (query.rarity) {
    filtered = filtered.filter((t) => t.rarity === query.rarity);
  }

  // --- Sort ---
  const sortBy = query.sortBy || "popularity";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  filtered.sort((a, b) => {
    const aRaw = a[sortBy];
    const bRaw = b[sortBy];

    // Numeric fields (popularity, salary, age) compare numerically; string
    // fields (name, rarity) fall back to a locale-aware string compare so they
    // sort correctly instead of coercing to NaN and silently no-oping.
    if (typeof aRaw === "number" || typeof bRaw === "number") {
      const aVal = Number(aRaw) || 0;
      const bVal = Number(bRaw) || 0;
      return (aVal - bVal) * sortOrder;
    }

    const aStr = String(aRaw ?? "");
    const bStr = String(bRaw ?? "");
    return aStr.localeCompare(bStr) * sortOrder;
  });

  // --- Paginate ---
  const total = filtered.length;
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 24, 1), 100);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(parseInt(query.page, 10) || 1, 1), totalPages);
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return { items: paged, page, limit, total, totalPages };
};

/**
 * Resolves a talent item from a GameState array by either its array index
 * (legacy `:index` route param) **or** its UUID `id` string.
 *
 * @param {Array} list   - GameState sub-array (e.g. marketActors).
 * @param {string} key   - The route param value (could be numeric index or UUID).
 * @returns {{ item: object|null, index: number }} The matched item and its real index.
 */
export const resolveTalent = (list, key) => {
  // Try as numeric index first (legacy)
  const numericIndex = Number(key);
  if (!isNaN(numericIndex) && Number.isInteger(numericIndex) && numericIndex >= 0 && numericIndex < list.length) {
    return { item: list[numericIndex], index: numericIndex };
  }

  // Fall back to UUID lookup
  const idx = (list || []).findIndex((t) => t.id === key);
  if (idx !== -1) {
    return { item: list[idx], index: idx };
  }

  return { item: null, index: -1 };
};
