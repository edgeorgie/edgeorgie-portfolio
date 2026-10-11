import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// No request-time APIs and no Date.now(), so this is prerendered at build.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 }];
}
