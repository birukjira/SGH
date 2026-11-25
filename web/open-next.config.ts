import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default Cloudflare adapter settings. The app has no ISR/revalidation cache
// configured, so the built-in defaults are enough.
export default defineCloudflareConfig();
