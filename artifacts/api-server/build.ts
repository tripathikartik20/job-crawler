import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { build as esbuild } from "esbuild";
import { rm, readFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times without risking some
// packages that are not bundle compatible
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  const distDir = path.resolve(__dirname, "dist");
  await rm(distDir, { recursive: true, force: true });

  console.log("building server...");
  const pkgPath = path.resolve(__dirname, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter(
    (dep) =>
      !allowlist.includes(dep) &&
      !(pkg.dependencies?.[dep]?.startsWith("workspace:")),
  );

  await esbuild({
    entryPoints: [path.resolve(__dirname, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: path.resolve(distDir, "index.cjs"),
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    // Polyfill import.meta.url for any remaining ESM constructs in the CJS bundle
    banner: {
      js: `const __importMetaUrl = require("url").pathToFileURL(__filename).href; const importMeta = { url: __importMetaUrl };`,
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

async function buildFrontend() {
  const frontendDir = path.resolve(__dirname, "..", "job-crawler");
  console.log("building frontend...");
  execSync("pnpm --filter @workspace/job-crawler run build", {
    stdio: "inherit",
    env: {
      ...process.env,
      BASE_PATH: "/",
      // PORT is only needed by the dev server, not the build
    },
  });
  console.log("frontend built → artifacts/job-crawler/dist/public/");
}

async function main() {
  await buildAll();
  if (process.argv.includes("--with-frontend")) {
    await buildFrontend();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
