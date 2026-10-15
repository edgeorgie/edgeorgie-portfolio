/**
 * Submit this site's URLs to IndexNow (Bing, Yandex, Seznam, Naver — one
 * shared endpoint). This is a push: instead of waiting to be crawled, the
 * engines are told a URL changed.
 *
 * Google does NOT participate in IndexNow. It still needs Search Console,
 * which requires the owner's Google account.
 *
 * Usage:
 *   npm run indexnow            # submit every route in the sitemap
 *   npm run indexnow -- --dry   # print what would be sent, send nothing
 *
 * The key must already be live at {SITE_URL}/{key}.txt — the script checks
 * that first and refuses to submit if it is missing or does not match, since
 * IndexNow rejects the whole batch in that case anyway.
 */
import { INDEXNOW_KEY, SITE_URL } from "../src/lib/site.ts";

const ENDPOINT = "https://api.indexnow.org/IndexNow";

async function main() {
  const dryRun = process.argv.includes("--dry");
  const host = new URL(SITE_URL).host;
  const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

  // Read the routes from the deployed sitemap rather than a second hardcoded
  // list, so a new page is submitted the moment it is indexable.
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const sitemapRes = await fetch(sitemapUrl);
  if (!sitemapRes.ok) {
    throw new Error(`sitemap ${sitemapUrl} returned ${sitemapRes.status}`);
  }
  const xml = await sitemapRes.text();
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (urlList.length === 0) throw new Error("sitemap contained no <loc> entries");

  // Verify ownership proof is actually reachable before submitting.
  const keyRes = await fetch(keyLocation);
  const keyBody = keyRes.ok ? (await keyRes.text()).trim() : "";
  if (keyBody !== INDEXNOW_KEY) {
    throw new Error(
      `key file at ${keyLocation} is missing or stale (status ${keyRes.status}, body "${keyBody.slice(0, 32)}"). ` +
        `Deploy public/${INDEXNOW_KEY}.txt before submitting.`
    );
  }
  console.log(`key verified at ${keyLocation}`);

  const payload = { host, key: INDEXNOW_KEY, keyLocation, urlList };
  console.log(`submitting ${urlList.length} URL(s):`);
  for (const u of urlList) console.log(`  ${u}`);

  if (dryRun) {
    console.log("\n--dry: nothing sent.");
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  // 200 = accepted, 202 = accepted, key validation pending. Both are success.
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow returned ${res.status}: ${body.slice(0, 200)}`);
  }
  console.log(`\nIndexNow accepted the batch (HTTP ${res.status}).`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
