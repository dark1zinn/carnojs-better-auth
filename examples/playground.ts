import { Carno } from "@carno.js/core";
import { CarnoBetterAuth } from "../src";
import { memoryAdapter } from "better-auth/adapters/memory";

const app = new Carno();

app.use(
  CarnoBetterAuth({
    baseURL: "http://localhost:3000",
    database: memoryAdapter({
      user: [],
      session: [],
      account: [],
      verification: [],
    }),
    emailAndPassword: {
      enabled: true,
    },
  }),
);

app.listen(3000);

console.log("Listening on http://localhost:3000");