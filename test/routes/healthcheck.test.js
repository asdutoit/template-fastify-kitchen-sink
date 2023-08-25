import { build } from "../helper.js";
import assert from "assert";
// import { PrismaClient } from "@prisma/client";
// import chalk from "chalk";

describe("Healthcheck is OK", () => {
  let app;

  // Before the tests, build your app
  before(async () => {
    app = await build();
  });

  // After the tests, close your app
  after(() => {
    app.close();
  });

  it("Should return statusCode 200", async () => {
    const response = await app.inject("/healthcheck");
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: "OK" });
  });
  it("Should return OK", async () => {
    const response = await app.inject("/healthcheck");
    assert.deepEqual(response.json(), { status: "OK" });
  });
});
