/* Upload all GLB models from public/models/ to Supabase Storage "models" bucket.
   Usage: node scripts/upload-models.js
   Prerequisite: Create bucket "models" in Supabase Dashboard → Storage (make it public). */
const fs = require("fs");
const path = require("path");

/* read .env */
const env = {};
fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8")
  .split("\n")
  .forEach((l) => {
    const m = l.match(/^VITE_(\w+)=(.+)/);
    if (m) env["VITE_" + m[1]] = m[2];
  });

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;
const BUCKET = "models";

async function uploadFile(filePath, storagePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
  const mime = ext === ".glb" ? "model/gltf-binary" : "application/octet-stream";

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": mime,
      "x-upsert": "true",
    },
    body: buf,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${res.status} ${err}`);
  }

  /* return public URL */
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

async function main() {
  const modelsDir = path.join(__dirname, "..", "public", "models");
  const files = [];

  function walk(dir, prefix) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        walk(full, prefix + entry + "/");
      } else if (entry.endsWith(".glb") || entry.endsWith(".gltf")) {
        files.push({ path: full, name: prefix + entry });
      }
    }
  }
  walk(modelsDir, "");

  console.log(`Found ${files.length} GLB files to upload...\n`);

  for (const f of files) {
    try {
      const url = await uploadFile(f.path, f.name);
      console.log(`✅ ${f.name}`);
      console.log(`   ${url}\n`);
    } catch (e) {
      console.error(`❌ ${f.name}: ${e.message}\n`);
    }
  }

  console.log("Done.");
}

main();
