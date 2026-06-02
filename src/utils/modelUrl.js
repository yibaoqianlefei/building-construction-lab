/* Resolve model paths: Supabase Storage first, local fallback.
   Model files are uploaded to Supabase Storage "models" bucket.
   Local files remain in public/models/ for dev fallback. */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const STORAGE_BASE = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/models/`
  : null;

const BASE_URL = import.meta.env.BASE_URL || "/";

/**
 * Resolve a model path. If Supabase is configured, use CDN URL.
 * Otherwise fall back to local public/models/ path.
 *
 * @param {string} name - Model filename or path, e.g. "wall-model.glb" or "flat-roof-01/layer_01_protection.glb"
 * @returns {string} Full URL to the model
 */
export function modelUrl(name) {
  /* strip any leading /models/ or / prefix */
  const clean = name.replace(/^\/?(models\/)?/, "");

  if (STORAGE_BASE) {
    return STORAGE_BASE + clean;
  }

  /* fallback: local path with base URL */
  return (BASE_URL + "models/" + clean).replace(/\/+/g, "/");
}
