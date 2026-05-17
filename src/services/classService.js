import { supabase } from "../lib/supabaseClient";

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createClass(name) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("请先登录");

  const { data, error } = await supabase
    .from("classes")
    .insert({ name, join_code: randomCode(), teacher_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function joinClass(code) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("请先登录");

  const { data: cls, error: findErr } = await supabase
    .from("classes")
    .select("id")
    .eq("join_code", code.toUpperCase())
    .single();

  if (findErr || !cls) throw new Error("加入码无效");

  const { error: joinErr } = await supabase
    .from("class_members")
    .insert({ class_id: cls.id, student_id: user.id });

  if (joinErr) {
    if (joinErr.code === "23505") throw new Error("您已在此班级中");
    throw joinErr;
  }

  return cls;
}

export async function getMyClasses() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: taught }, { data: enrolled }] = await Promise.all([
    supabase.from("classes").select("*, profiles(full_name)").eq("teacher_id", user.id),
    supabase
      .from("class_members")
      .select("class_id, classes(*, profiles(full_name))")
      .eq("student_id", user.id),
  ]);

  const result = [];

  if (taught) {
    for (const c of taught) {
      const { count } = await supabase
        .from("class_members")
        .select("*", { count: "exact", head: true })
        .eq("class_id", c.id);
      result.push({
        id: c.id,
        name: c.name,
        join_code: c.join_code,
        teacher_name: c.profiles?.full_name || "未知",
        member_count: count || 0,
        role: "teacher",
      });
    }
  }

  if (enrolled) {
    for (const row of enrolled) {
      if (!row.classes) continue;
      const c = row.classes;
      const { count } = await supabase
        .from("class_members")
        .select("*", { count: "exact", head: true })
        .eq("class_id", c.id);
      result.push({
        id: c.id,
        name: c.name,
        join_code: c.join_code,
        teacher_name: c.profiles?.full_name || "未知",
        member_count: count || 0,
        role: "student",
      });
    }
  }

  return result;
}

export async function getClassDetail(classId) {
  const { data: cls, error } = await supabase
    .from("classes")
    .select("*, profiles(full_name)")
    .eq("id", classId)
    .single();

  if (error) throw error;

  const { data: members } = await supabase
    .from("class_members")
    .select("*, profiles(full_name)")
    .eq("class_id", classId);

  return {
    ...cls,
    teacher_name: cls.profiles?.full_name || "未知",
    members: members || [],
  };
}
