import { expect, test } from "bun:test";
import { PACKAGE_NAME } from "../src/index.ts";

test("package entry is reachable", () => {
  expect(PACKAGE_NAME).toBe("carnojs-better-auth");
});
