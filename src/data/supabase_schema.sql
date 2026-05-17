-- 用户资料表
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('teacher','student')) DEFAULT 'student',
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- 自动为新注册用户创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (new.id, 'student', new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 班级表
CREATE TABLE public.classes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  join_code text UNIQUE NOT NULL,
  teacher_id uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 班级成员表
CREATE TABLE public.class_members (
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (class_id, student_id)
);

-- 任务表
CREATE TABLE public.assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  node_ids jsonb NOT NULL DEFAULT '[]',
  due_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 学生进度表
CREATE TABLE public.student_progress (
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  node_id text NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  status text CHECK (status IN ('not_started','in_progress','completed')) DEFAULT 'not_started',
  last_interacted_at timestamptz DEFAULT now(),
  PRIMARY KEY (student_id, node_id, class_id)
);

-- RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Teachers can insert classes" ON classes FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Members can view their classes" ON classes FOR SELECT USING (
  id IN (SELECT class_id FROM class_members WHERE student_id = auth.uid())
  OR teacher_id = auth.uid()
);
CREATE POLICY "Members can view assignments" ON assignments FOR SELECT USING (
  class_id IN (SELECT class_id FROM class_members WHERE student_id = auth.uid())
  OR class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
);
CREATE POLICY "Students can update own progress" ON student_progress FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Students can read own progress" ON student_progress FOR SELECT USING (student_id = auth.uid());
