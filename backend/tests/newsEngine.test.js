import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateNewsFromRelease,
  generateNewsFromTrend,
  generateNewsFromEvent,
} from "../src/services/simulation/engines/newsEngine.js";
import NewsItem from "../src/models/NewsItem.js";

test("newsEngine generateNewsFromRelease creates hit news article", async () => {
  const originalCreate = NewsItem.create;
  let createdPayload = null;

  NewsItem.create = async (payload) => {
    createdPayload = payload;
    return payload;
  };

  try {
    const movie = {
      title: "Super Hit",
      verdict: "HIT",
      worldwideGross: 15000000,
      budget: 5000000,
    };
    const studio = { name: "Paramount Works" };
    await generateNewsFromRelease(movie, studio, 5);

    assert.equal(createdPayload.type, "box_office");
    assert.ok(createdPayload.headline.includes("SUCCESS"));
    assert.ok(createdPayload.body.includes("Paramount Works"));
    assert.ok(createdPayload.body.includes("Super Hit"));
    assert.equal(createdPayload.week, 5);
  } finally {
    NewsItem.create = originalCreate;
  }
});

test("newsEngine generateNewsFromTrend creates trend alert article", async () => {
  const originalCreate = NewsItem.create;
  let createdPayload = null;

  NewsItem.create = async (payload) => {
    createdPayload = payload;
    return payload;
  };

  try {
    const trend = { genre: "Sci-Fi" };
    await generateNewsFromTrend(trend, 10);

    assert.equal(createdPayload.type, "trend");
    assert.ok(createdPayload.headline.includes("Sci-Fi"));
    assert.equal(createdPayload.week, 10);
  } finally {
    NewsItem.create = originalCreate;
  }
});
