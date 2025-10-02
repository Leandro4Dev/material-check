import { serve } from "bun";
import index from "./index.html";
import { readFileSync } from "fs";

const server = serve({
  routes: {
    "/*": index,
  },


  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
