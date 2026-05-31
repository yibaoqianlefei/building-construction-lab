-- 用户资料表
-- 手动迁移现有数据：
--   ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
--   ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user','developer'));
--   UPDATE profiles SET role = 'user' WHERE role NOT IN ('user','developer');
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('user','developer')) DEFAULT 'user',
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- 自动为新注册用户创建 profile（默认角色 user）
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (new.id, 'user', COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- ── textbook & node content tables ──
CREATE TABLE textbook_sections (
  section_id text PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE node_definitions (
  node_id text PRIMARY KEY,
  title text NOT NULL,
  category text,
  description text,
  node_data jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE textbook_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read textbook sections" ON textbook_sections FOR SELECT USING (true);
CREATE POLICY "Anyone can read node definitions" ON node_definitions FOR SELECT USING (true);

CREATE POLICY "Developers can insert textbook sections" ON textbook_sections FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer'));

CREATE POLICY "Developers can update textbook sections" ON textbook_sections FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer'));

CREATE POLICY "Developers can delete textbook sections" ON textbook_sections FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer'));

CREATE POLICY "Developers can insert node definitions" ON node_definitions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer'));

CREATE POLICY "Developers can update node definitions" ON node_definitions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer'));

CREATE POLICY "Developers can delete node definitions" ON node_definitions FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer'));

-- ── course sections (hierarchical chapter tree) ──
CREATE TABLE IF NOT EXISTS course_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id uuid REFERENCES course_sections(id) ON DELETE CASCADE,
  module_id text,
  title text NOT NULL,
  description text,
  content text,
  diagram_image_url text,
  node_ids jsonb DEFAULT '[]',
  sort_order int DEFAULT 0,
  slug text UNIQUE,              -- human-readable ID from code (e.g. "roof-membrane")
  available boolean DEFAULT false,
  deleted_at timestamptz,         -- soft-delete: NULL = active, non-NULL = in trash
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_sections_parent ON course_sections(parent_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_module ON course_sections(module_id);

ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;

/* Regular users: only see non-deleted sections */
CREATE POLICY "Anyone can read active course_sections" ON course_sections
  FOR SELECT USING (deleted_at IS NULL);

/* Developers: see all (including deleted) for recovery */
CREATE POLICY "Developers can read all course_sections" ON course_sections
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer'));

CREATE POLICY "Developers can manage course_sections" ON course_sections FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer'));

-- ── media table ──
CREATE TABLE IF NOT EXISTS media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name text,
  storage_path text,
  public_url text,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read media" ON media FOR SELECT USING (true);
CREATE POLICY "Developers can insert media" ON media FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer'));
CREATE POLICY "Developers can delete media" ON media FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer'));

-- ── RLS fix: simpler policies for course_sections ──
-- Run these if you get 400 errors on course_sections queries:
-- ALTER TABLE course_sections DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Anyone can read active course_sections" ON course_sections;
-- DROP POLICY IF EXISTS "Developers can read all course_sections" ON course_sections;
-- DROP POLICY IF EXISTS "Developers can manage course_sections" ON course_sections;
-- DROP POLICY IF EXISTS "read_all" ON course_sections;
-- DROP POLICY IF EXISTS "manage_all" ON course_sections;
-- CREATE POLICY "read_all" ON course_sections FOR SELECT USING (true);
-- CREATE POLICY "manage_all" ON course_sections FOR ALL USING (true);

-- ── activity log ──
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all" ON activity_log FOR SELECT USING (true);
CREATE POLICY "manage_all" ON activity_log FOR ALL USING (true);

-- ── user roles ──
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'developer', 'content_editor', 'user')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all" ON user_roles FOR SELECT USING (true);
CREATE POLICY "manage_all" ON user_roles FOR ALL USING (true);
