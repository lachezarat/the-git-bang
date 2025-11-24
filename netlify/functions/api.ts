import serverless from "serverless-http";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env file explicitly for Netlify Functions
config({ path: resolve(__dirname, "../../.env") });

import { createServer } from "../../server";

export const handler = serverless(createServer());
