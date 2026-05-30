import { supabase } from "../lib/supabaseClient";

/* ── textbook sections ── */

export async function getTextbookSection(sectionId) {
  try {
    const { data, error } = await supabase
      .from("textbook_sections")
      .select("title, content")
      .eq("section_id", sectionId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function listTextbookSections() {
  try {
    const { data, error } = await supabase
      .from("textbook_sections")
      .select("section_id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  } catch {
    return [];
  }
}

export async function upsertTextbookSection(sectionId, title, content) {
  const { data, error } = await supabase
    .from("textbook_sections")
    .upsert({ section_id: sectionId, title, content, updated_at: new Date().toISOString() }, { onConflict: "section_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTextbookSection(sectionId) {
  const { error } = await supabase.from("textbook_sections").delete().eq("section_id", sectionId);
  if (error) throw error;
}

/* ── node definitions ── */

export async function getNodeDefinition(nodeId) {
  try {
    const { data, error } = await supabase
      .from("node_definitions")
      .select("title, category, description, node_data")
      .eq("node_id", nodeId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function listNodeDefinitions() {
  try {
    const { data, error } = await supabase
      .from("node_definitions")
      .select("node_id, title, category, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  } catch {
    return [];
  }
}

export async function upsertNodeDefinition(nodeId, title, category, description, nodeData) {
  const { data, error } = await supabase
    .from("node_definitions")
    .upsert({ node_id: nodeId, title, category, description, node_data: nodeData, updated_at: new Date().toISOString() }, { onConflict: "node_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNodeDefinition(nodeId) {
  const { error } = await supabase.from("node_definitions").delete().eq("node_id", nodeId);
  if (error) throw error;
}

/* ── course sections (hierarchical tree) ── */

export async function getSectionTree(moduleId) {
  try {
    const { data, error } = await supabase
      .from("course_sections")
      .select("*")
      .eq("module_id", moduleId)
      .order("sort_order", { ascending: true })
      .limit(200);
    if (error) throw error;
    return (data || []).filter((s) => !s.deleted_at);
  } catch {
    return [];
  }
}

export async function getSectionWithChildren(sectionId) {
  try {
    const { data, error } = await supabase
      .from("course_sections")
      .select("*, children:course_sections!parent_id(*)")
      .eq("id", sectionId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function getSectionById(sectionId) {
  try {
    /* try slug match first (human-readable ID like "roof-membrane") */
    let { data, error } = await supabase
      .from("course_sections")
      .select("id, title, content, slug, module_id, node_ids, available, description, diagram_image_url, parent_id, sort_order")
      .eq("slug", sectionId)
      .limit(1)
      .maybeSingle();
    if (!error && data) return data;

    /* try UUID match */
    ({ data, error } = await supabase
      .from("course_sections")
      .select("id, title, content, slug, module_id, node_ids, available, description, diagram_image_url, parent_id, sort_order")
      .eq("id", sectionId)
      .limit(1)
      .maybeSingle());
    if (!error && data) return data;

    return null;
  } catch (e) {
    console.warn("[contentService] getSectionById failed:", e.message || e);
    return null;
  }
}

export async function createSection(sectionData) {
  const { data, error } = await supabase
    .from("course_sections")
    .insert(sectionData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSection(sectionId, updates) {
  const { data, error } = await supabase
    .from("course_sections")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", sectionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSection(sectionId) {
  const { error } = await supabase
    .from("course_sections")
    .delete()
    .eq("id", sectionId);
  if (error) throw error;
}

/* soft-delete: mark as deleted instead of hard delete */
export async function softDeleteSection(sectionId) {
  return updateSection(sectionId, { deleted_at: new Date().toISOString() });
}

/* restore from trash */
export async function restoreSection(sectionId) {
  return updateSection(sectionId, { deleted_at: null });
}

export async function listAllSections(includeDeleted = false) {
  try {
    let query = supabase
      .from("course_sections")
      .select("*")
      .order("sort_order", { ascending: true });
    /* non-developer users: DB RLS already filters deleted_at IS NULL.
       For developer: if includeDeleted is true, we need the DB RLS to allow it
       (handled by developer policy). We filter client-side for the toggle. */
    const { data, error } = await query;
    if (error) throw error;
    if (!includeDeleted) {
      return (data || []).filter((s) => !s.deleted_at);
    }
    return data || [];
  } catch {
    return [];
  }
}

export async function importSectionsFromCode(sectionsData) {
  const { data, error } = await supabase
    .from("course_sections")
    .insert(sectionsData)
    .select();
  if (error) throw error;
  return data;
}

export async function getSectionsForModule(moduleId) {
  try {
    const { data, error } = await supabase
      .from("course_sections")
      .select("*")
      .eq("module_id", moduleId)
      .is("parent_id", null)
      .order("sort_order", { ascending: true })
      .limit(100);
    if (error) {
      console.warn("[contentService] getSectionsForModule failed:", error.message);
      return [];
    }
    /* client-side filter: exclude soft-deleted rows if deleted_at column exists */
    return (data || []).filter((s) => !s.deleted_at);
  } catch (e) {
    console.warn("[contentService] getSectionsForModule error:", e.message || e);
    return [];
  }
}

export async function getChildSections(parentId) {
  try {
    const { data, error } = await supabase
      .from("course_sections")
      .select("*")
      .eq("parent_id", parentId)
      .order("sort_order", { ascending: true })
      .limit(100);
    if (error) {
      console.warn("[contentService] getChildSections failed:", error.message);
      return [];
    }
    return (data || []).filter((s) => !s.deleted_at);
  } catch (e) {
    console.warn("[contentService] getChildSections error:", e.message || e);
    return [];
  }
}

/* ── media ── */

export async function listMediaFiles() {
  try {
    const { data, error } = await supabase.storage.from("media").list();
    if (error) throw error;
    return data.map((f) => ({
      name: f.name,
      url: supabase.storage.from("media").getPublicUrl(f.name).data.publicUrl,
    }));
  } catch {
    return [];
  }
}

export async function uploadMedia(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from("media").upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const publicUrl = supabase.storage.from("media").getPublicUrl(fileName).data.publicUrl;

  /* record in media table */
  await supabase.from("media").insert({
    file_name: file.name,
    storage_path: fileName,
    public_url: publicUrl,
  });

  return publicUrl;
}
