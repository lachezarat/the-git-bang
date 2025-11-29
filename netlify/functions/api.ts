import serverless from "serverless-http";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env file explicitly for Netlify Functions
config({ path: resolve(__dirname, "../../.env") });

import { createServer } from "../../server";

export const handler = serverless(createServer(), {
    request: (req: any, event: any, context: any) => {
        // Netlify/AWS sometimes passes the body as a string in event.body
        // and express.json() might miss it if headers aren't perfect.
        // We manually parse it here if req.body is empty.
        if (event.body && typeof event.body === "string" && (!req.body || Object.keys(req.body).length === 0)) {
            try {
                req.body = JSON.parse(event.body);
            } catch (e) {
                console.error("Failed to parse event body in serverless handler:", e);
            }
        }
    },
});
