#!/usr/bin/env node
/**
 * Post-deploy smoke check — talks to the deployed site the way a browser does.
 *
 * Why this exists: staging was recorded as green while login, the residence
 * calendar, favourites and the header's city search were all returning 500. The
 * checks that passed had called the backend on its own hostname and read an SSR
 * page, and both of those keep working when the frontend's `/api/*` proxy is
 * broken — server-side fetching reads the runtime env, the proxy is baked at
 * build time. Nothing in the verification ever went through the front's own
 * origin, so nothing noticed.
 *
 * So: every request here is same-origin against the frontend, unauthenticated,
 * exactly what a logged-out visitor's browser sends on first load.
 *
 *   node scripts/smoke.mjs [origin]
 *
 * Exits non-zero if any check fails, so it can gate a deploy.
 */

const origin = (process.argv[2] || "https://lidomatrip.liara.run").replace(/\/$/, "");

// A 401 is a pass. These endpoints are reached logged-out, and "correctly
// refused" is the healthy answer — what must never appear is a 5xx, which is
// what a dead proxy produces for every route indiscriminately.
const checks = [
  { name: "home page (SSR)", path: "/", ok: [200] },
  { name: "popular destinations", path: "/api/search/destinations/popular", ok: [200] },
  { name: "search page-data (no city)", path: "/api/search/page-data?slug=s", ok: [200] },
  { name: "search page-data (shiraz)", path: "/api/search/page-data?slug=shiraz", ok: [200] },
  { name: "home page-data", path: "/api/home/page-data", ok: [200] },
  { name: "residence detail", path: "/api/residences/42255", ok: [200] },
  { name: "residence calendar", path: "/api/residences/42255/calendar?from=2026-01-01&to=2026-12-31", ok: [200] },
  { name: "favourites (logged out)", path: "/api/favourites", ok: [200, 401, 403] },
  {
    name: "password login (bad credentials)",
    path: "/api/auth/login/password",
    method: "POST",
    body: { phone: "09000000000", password: "definitely-not-a-real-password" },
    ok: [400, 401, 403, 404, 422, 429],
  },
];

async function run(check) {
  const started = Date.now();
  try {
    const res = await fetch(origin + check.path, {
      method: check.method || "GET",
      headers: check.body ? { "Content-Type": "application/json" } : undefined,
      body: check.body ? JSON.stringify(check.body) : undefined,
      redirect: "manual",
      // Node's default connect timeout is 10s, which a home connection to Liara
      // trips often enough to make this cry wolf — it failed all nine checks
      // once while curl was answering 200 in 240ms. The retry loop below is the
      // real defence; this stops one slow handshake from failing a good deploy.
      signal: AbortSignal.timeout(Number(process.env.SMOKE_TIMEOUT_MS || 30000)),
    });
    return { ...check, status: res.status, ms: Date.now() - started, pass: check.ok.includes(res.status) };
  } catch (err) {
    return { ...check, status: err.code || "ERR", ms: Date.now() - started, pass: false, err: err.message };
  }
}

// A container that has just been released answers before it is warm. Retrying
// the whole suite is simpler than retrying failures individually and cannot
// report a stale pass.
const ATTEMPTS = Number(process.env.SMOKE_ATTEMPTS || 5);
const GAP_MS = Number(process.env.SMOKE_GAP_MS || 10000);

let results = [];
for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  // Sequential rather than Promise.all: nine simultaneous TLS handshakes over a
  // home connection fail in ways the deployed app is not responsible for.
  results = [];
  for (const check of checks) results.push(await run(check));
  if (results.every((r) => r.pass)) break;
  if (attempt < ATTEMPTS) {
    console.log(`attempt ${attempt}/${ATTEMPTS} had failures, retrying in ${GAP_MS / 1000}s…`);
    await new Promise((r) => setTimeout(r, GAP_MS));
  }
}

// Which build actually answered.
//
// A green run says the site is healthy, not that it is running your code — and
// those look identical. This check passed nine out of nine directly after a
// deploy that had failed in `yarn install`, because the old build was still up
// and serving perfectly well. Printing the build id makes "did my deploy land"
// answerable: if it has not changed since the previous run, it did not.
async function buildId() {
  try {
    const html = await fetch(origin + "/", {
      signal: AbortSignal.timeout(Number(process.env.SMOKE_TIMEOUT_MS || 30000)),
    }).then((r) => r.text());
    return JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)?.[1] ?? "{}")
      .buildId;
  } catch {
    return null;
  }
}

const build = await buildId();

console.log(`\nsmoke check — ${origin}`);
console.log(`build: ${build ?? "unknown"}\n`);
for (const r of results) {
  console.log(
    `  ${r.pass ? "PASS" : "FAIL"}  ${String(r.status).padEnd(5)} ${String(r.ms + "ms").padEnd(8)} ${r.name}` +
      (r.err ? `\n        ${r.err}` : "")
  );
}

const failed = results.filter((r) => !r.pass);
if (failed.length) {
  console.error(`\n${failed.length} of ${results.length} checks failed.`);
  if (failed.some((r) => typeof r.status === "number" && r.status >= 500)) {
    console.error(
      "\nA 5xx on every /api/* route means the front is proxying somewhere that is not\n" +
        "answering. Check the baked rewrite destination, not the panel env:\n" +
        "  liara logs -a lidomatrip | grep 'Failed to proxy'"
    );
  }
  process.exit(1);
}
console.log(`\nAll ${results.length} checks passed.`);
