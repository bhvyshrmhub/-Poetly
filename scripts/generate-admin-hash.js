#!/usr/bin/env node

/**
 * Generate admin password hash and salt for Poetly admin authentication.
 *
 * Usage:
 *   node scripts/generate-admin-hash.js <password>
 *
 * Then paste the output values into your .env.local or Vercel environment.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require("crypto");

const iterations = 100000;
const keyLength = 32;
const digest = "sha256";

function generate() {
  const password = process.argv[2];
  if (!password) {
    console.error("Usage: node scripts/generate-admin-hash.js <password>");
    process.exit(1);
  }

  const salt = crypto.randomBytes(32);
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest);

  console.log("");
  console.log("ADMIN_PASSWORD_HASH=" + hash.toString("hex"));
  console.log("ADMIN_PASSWORD_SALT=" + salt.toString("hex"));
  console.log("");
  console.log("Add these to your .env.local or Vercel environment variables.");
  console.log("DO NOT commit them to Git.");
}

generate();
