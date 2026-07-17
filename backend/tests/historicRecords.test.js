import "./helpers/testEnv.js";

import test, { before, after } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import HistoricRecord from "../src/models/HistoricRecord.js";
import { addHistoricRecord } from "../src/services/simulation/helpers/historicRecordHelper.js";

let mongod;
let server;
let baseUrl;

before(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  const { default: app } = await import("../src/app.js");
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

const registerUser = async (username, email, studioName) => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      password: "password123",
      studioName,
    }),
  });
  return res.json();
};

test("Historic Records Hall of Fame API", async (t) => {
  const { token } = await registerUser("test_records_user", "records@example.com", "Records Studio");
  assert.ok(token);

  await t.test("Inserts records and caps at top 50, verifying sorting and metrics", async () => {
    // Insert 55 dummy records with different values
    for (let i = 1; i <= 55; i++) {
      await HistoricRecord.create({
        title: `Movie ${i}`,
        studioId: `studio-${i}`,
        studioName: `Studio ${i}`,
        worldwideGross: i * 100000,      // Range: 100k to 5.5M
        openingWeekend: i * 30000,       // Range: 30k to 1.65M
        roi: i * 0.1,                    // Range: 0.1 to 5.5
        releaseWeek: i,
        year: 1,
        isRival: i % 2 === 0,
      });
    }

    // 1. Check Worldwide Gross
    const resGross = await fetch(`${baseUrl}/api/records?metric=worldwideGross`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(resGross.status, 200);
    const dataGross = await resGross.json();
    assert.strictEqual(dataGross.success, true);
    assert.strictEqual(dataGross.records.length, 50);
    // Should be sorted desc, meaning index 0 is the highest (Movie 55)
    assert.strictEqual(dataGross.records[0].title, "Movie 55");
    assert.strictEqual(dataGross.records[0].worldwideGross, 5500000);
    // Verifying descending order
    for (let i = 0; i < 49; i++) {
      assert.ok(dataGross.records[i].worldwideGross >= dataGross.records[i + 1].worldwideGross);
    }

    // 2. Check Opening Weekend
    const resOpening = await fetch(`${baseUrl}/api/records?metric=openingWeekend`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(resOpening.status, 200);
    const dataOpening = await resOpening.json();
    assert.strictEqual(dataOpening.records.length, 50);
    assert.strictEqual(dataOpening.records[0].title, "Movie 55");
    assert.strictEqual(dataOpening.records[0].openingWeekend, 1650000);
    for (let i = 0; i < 49; i++) {
      assert.ok(dataOpening.records[i].openingWeekend >= dataOpening.records[i + 1].openingWeekend);
    }

    // 3. Check ROI
    const resRoi = await fetch(`${baseUrl}/api/records?metric=roi`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(resRoi.status, 200);
    const dataRoi = await resRoi.json();
    assert.strictEqual(dataRoi.records.length, 50);
    assert.strictEqual(dataRoi.records[0].title, "Movie 55");
    assert.ok(Math.abs(dataRoi.records[0].roi - 5.5) < 0.01);
    for (let i = 0; i < 49; i++) {
      assert.ok(dataRoi.records[i].roi >= dataRoi.records[i + 1].roi);
    }
  });

  await t.test("addHistoricRecord helper correctly filters entries outside top 50", async () => {
    // Currently, there are 55 records in database. The lowest top 50 worldwide gross is Movie 6 (600,000).
    // Let's try to add a movie with 500,000 gross, 10,000 opening, 0.01 ROI.
    // This should NOT qualify.
    await addHistoricRecord({
      title: "Poor Performer",
      studioId: "studio-poor",
      studioName: "Poor Studio",
      worldwideGross: 500000,
      openingWeekend: 10000,
      roi: 0.01,
      releaseWeek: 60,
      isRival: false
    });

    const recordCheck = await HistoricRecord.findOne({ title: "Poor Performer" });
    assert.strictEqual(recordCheck, null);

    // Now try to add a movie with 6,000,000 gross (beats highest).
    // This should qualify and get inserted.
    await addHistoricRecord({
      title: "All-Time Smash Hit",
      studioId: "studio-hit",
      studioName: "Hit Studio",
      worldwideGross: 6000000,
      openingWeekend: 2000000,
      roi: 10.0,
      releaseWeek: 61,
      isRival: false
    });

    const recordCheck2 = await HistoricRecord.findOne({ title: "All-Time Smash Hit" });
    assert.ok(recordCheck2);
    assert.strictEqual(recordCheck2.worldwideGross, 6000000);
  });
});
