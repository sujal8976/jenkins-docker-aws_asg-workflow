import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../index";
import Link from "../models/Link";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  await Link.deleteMany({});
});

describe("API integration", () => {
  it("shortens a url and redirects", async () => {
    const res = await request(app)
      .post("/shorten")
      .send({ url: "https://example.com" });
    expect(res.status).toBe(200);
    expect(res.body.code).toBeDefined();

    const code = res.body.code;
    const redirect = await request(app).get(`/r/${code}`).redirects(0);
    expect(redirect.status).toBe(302);
    expect(redirect.headers.location).toBe("https://example.com");
  });

  it("lists links", async () => {
    await request(app).post("/shorten").send({ url: "https://1.com" });
    await request(app).post("/shorten").send({ url: "https://2.com" });
    const res = await request(app).get("/links");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});
