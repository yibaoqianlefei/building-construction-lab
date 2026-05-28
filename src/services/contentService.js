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
