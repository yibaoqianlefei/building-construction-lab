import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase 配置未设置。请创建 .env 文件并填入 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY"
  );
}

console.log(
  "📋 请在 Supabase SQL Editor 中执行 src/data/supabase_schema.sql 以创建数据库表"
);

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);
