/* Compress GLB models with Draco + texture optimization.
   Usage: node scripts/compress-models.cjs

   Two passes:
   1. Texture compression (resize → 1024, convert → WebP) via sharp
   2. Draco mesh compression (encodeSpeed=1, decodeSpeed=1)

   Only wall-model.glb gets texture compression (other models are already small). */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { NodeIO } = require("@gltf-transform/core");
const { draco, textureCompress } = require("@gltf-transform/functions");
const { KHRONOS_EXTENSIONS } = require("@gltf-transform/extensions");
const draco3d = require("draco3d");

const TEXTURE_OPTS = {
  encoder: sharp,
  resize: [1024, 1024],
  targetFormat: "webp",
  quality: 85,
  /* exclude normal maps from lossy format conversion */
  slots: /^(?!normalTexture).*$/,
};

async function compressGLB(filePath, io, doTextures) {
  const originalSize = fs.statSync(filePath).size;

  /* skip tiny files (LFS pointers or already compressed) */
  if (originalSize < 2000) {
    console.log(`  SKIP (${originalSize} B, likely LFS pointer) — ${path.basename(filePath)}`);
    return;
  }

  const doc = await io.read(filePath);

  /* ── Pass 1: texture compression ── */
  if (doTextures) {
    console.log(`  Textures: resizing → ${TEXTURE_OPTS.resize[0]}px, converting → ${TEXTURE_OPTS.targetFormat} (q=${TEXTURE_OPTS.quality})...`);
    await doc.transform(textureCompress(TEXTURE_OPTS));
  }

  /* ── Pass 2: Draco mesh compression ── */
  await doc.transform(draco({ encodeSpeed: 1, decodeSpeed: 1 }));

  /* temp file MUST end in .glb so io.write() detects binary format */
  const compressedPath = filePath.replace(/\.glb$/, ".compressed.glb");
  await io.write(compressedPath, doc);

  const compressedSize = fs.statSync(compressedPath).size;
  const pct = Math.round((1 - compressedSize / originalSize) * 100);
  const origMB = (originalSize / 1048576).toFixed(1);
  const compKB = (compressedSize / 1024).toFixed(0);

  fs.renameSync(compressedPath, filePath);
  console.log(`  ${origMB} MB → ${compKB} KB (${pct}% smaller) — ${path.basename(filePath)}`);
}

async function main() {
  /* build encoder module and register it as a dependency */
  console.log("Initializing Draco encoder (WASM)...");
  const encoderModule = await draco3d.createEncoderModule();
  const io = new NodeIO()
    .registerExtensions(KHRONOS_EXTENSIONS)
    .registerDependencies({
      "draco3d.encoder": encoderModule,
      "draco3d.decoder": await draco3d.createDecoderModule(),
    });
  console.log("Encoder ready.\n");

  const modelsDir = path.join(__dirname, "..", "public", "models");
  const files = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith(".glb")) files.push(full);
    }
  }
  walk(modelsDir);

  console.log(`Compressing ${files.length} models...\n`);
  for (const f of files) {
    try {
      /* Only run texture compress on wall-model (55 textures, 19MB).
         Other models are small and textureCompress is slow with sharp. */
      const doTextures = path.basename(f) === "wall-model.glb";
      await compressGLB(f, io, doTextures);
    } catch (e) {
      console.error(`  FAILED: ${path.basename(f)} — ${e.message}`);
    }
  }
  console.log("\nDone.");
}

main();
