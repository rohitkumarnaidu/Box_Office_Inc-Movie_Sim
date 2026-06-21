import test from 'node:test';
import assert from 'node:assert';
import {
  getMarketplaceTalent,
  resolveTalent,
  invalidateUserCache,
} from '../src/utils/marketplaceHelper.js';

// --- Helper to generate dummy talent ---
const makeTalent = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: `talent-${i}`,
    name: `Talent ${i}`,
    age: 20 + (i % 50),
    salary: 50000 + i * 10000,
    popularity: i % 100,
    rarity: i % 5 === 0 ? 'Epic' : 'Common',
  }));

// ---------------------------------------------------------------------------
// getMarketplaceTalent
// ---------------------------------------------------------------------------
test('getMarketplaceTalent returns paginated results', () => {
  const items = makeTalent(50);
  const result = getMarketplaceTalent(items, { page: '2', limit: '10' });
  assert.strictEqual(result.page, 2);
  assert.strictEqual(result.limit, 10);
  assert.strictEqual(result.total, 50);
  assert.strictEqual(result.totalPages, 5);
  assert.strictEqual(result.items.length, 10);
});

test('getMarketplaceTalent defaults to page 1, limit 24', () => {
  const items = makeTalent(30);
  const result = getMarketplaceTalent(items, {});
  assert.strictEqual(result.page, 1);
  assert.strictEqual(result.limit, 24);
  assert.strictEqual(result.items.length, 24);
});

test('getMarketplaceTalent filters by search', () => {
  const items = makeTalent(100);
  const result = getMarketplaceTalent(items, { search: 'Talent 5', limit: '200' });
  // Matches: "Talent 5", "Talent 50"..."Talent 59" = 11 items
  assert.ok(result.items.every((t) => t.name.toLowerCase().includes('talent 5')));
});

test('getMarketplaceTalent filters by age range', () => {
  const items = makeTalent(100);
  const result = getMarketplaceTalent(items, { minAge: '30', maxAge: '40', limit: '200' });
  assert.ok(result.items.every((t) => t.age >= 30 && t.age <= 40));
});

test('getMarketplaceTalent filters by salary range', () => {
  const items = makeTalent(50);
  const result = getMarketplaceTalent(items, { minSalary: '100000', maxSalary: '200000', limit: '200' });
  assert.ok(result.items.every((t) => t.salary >= 100000 && t.salary <= 200000));
});

test('getMarketplaceTalent filters by rarity', () => {
  const items = makeTalent(50);
  const result = getMarketplaceTalent(items, { rarity: 'Epic', limit: '200' });
  assert.ok(result.items.every((t) => t.rarity === 'Epic'));
});

test('getMarketplaceTalent sorts ascending', () => {
  const items = makeTalent(20);
  const result = getMarketplaceTalent(items, { sortBy: 'salary', sortOrder: 'asc', limit: '200' });
  for (let i = 1; i < result.items.length; i++) {
    assert.ok(result.items[i].salary >= result.items[i - 1].salary);
  }
});

test('getMarketplaceTalent caps limit at 100', () => {
  const items = makeTalent(200);
  const result = getMarketplaceTalent(items, { limit: '999' });
  assert.strictEqual(result.limit, 100);
});

test('getMarketplaceTalent clamps page to valid range', () => {
  const items = makeTalent(10);
  const result = getMarketplaceTalent(items, { page: '999', limit: '5' });
  assert.strictEqual(result.page, 2); // totalPages = 2
});

test('getMarketplaceTalent preserves _originalIndex', () => {
  const items = makeTalent(10);
  const result = getMarketplaceTalent(items, { limit: '200' });
  result.items.forEach((item) => {
    assert.strictEqual(typeof item._originalIndex, 'number');
  });
});

// ---------------------------------------------------------------------------
// resolveTalent
// ---------------------------------------------------------------------------
test('resolveTalent resolves by numeric index', () => {
  const list = makeTalent(10);
  const { item, index } = resolveTalent(list, '3');
  assert.strictEqual(index, 3);
  assert.strictEqual(item.id, 'talent-3');
});

test('resolveTalent resolves by UUID', () => {
  const list = makeTalent(10);
  const { item, index } = resolveTalent(list, 'talent-7');
  assert.strictEqual(index, 7);
  assert.strictEqual(item.id, 'talent-7');
});

test('resolveTalent returns null for missing item', () => {
  const list = makeTalent(5);
  const { item, index } = resolveTalent(list, 'does-not-exist');
  assert.strictEqual(item, null);
  assert.strictEqual(index, -1);
});

test('resolveTalent handles out-of-range numeric index as UUID fallback', () => {
  const list = makeTalent(5);
  const { item, index } = resolveTalent(list, '999');
  assert.strictEqual(item, null);
  assert.strictEqual(index, -1);
});
