/* Helper to prepend the base path for assets in public/ directory.
   In dev: "/" → "/models/..."
   On GitHub Pages: "/building-construction-lab/" → "/building-construction-lab/models/..." */
const BASE = import.meta.env.BASE_URL || "/";

export function assetPath(path) {
  if (!path.startsWith("/")) return path;
  return (BASE + path).replace(/\/+/g, "/");
}

export default BASE;
