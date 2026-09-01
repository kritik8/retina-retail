-- Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Shops table
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('kirana', 'supermarket', 'pharmacy', 'other')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  number_of_counters INT NOT NULL DEFAULT 1,
  expected_cameras INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Devices table
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('camera', 'sensor')),
  pairing_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'online', 'offline')),
  last_heartbeat TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Automatic Profile Creation Trigger on New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution link
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Shops RLS Policies
CREATE POLICY "Users can view own shops"
  ON public.shops FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own shops"
  ON public.shops FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own shops"
  ON public.shops FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own shops"
  ON public.shops FOR DELETE
  USING (owner_id = auth.uid());

-- Devices RLS Policies
CREATE POLICY "Users can view own shop devices"
  ON public.devices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE public.shops.id = public.devices.shop_id
      AND public.shops.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own shop devices"
  ON public.devices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE public.shops.id = public.devices.shop_id
      AND public.shops.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own shop devices"
  ON public.devices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE public.shops.id = public.devices.shop_id
      AND public.shops.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own shop devices"
  ON public.devices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE public.shops.id = public.devices.shop_id
      AND public.shops.owner_id = auth.uid()
    )
  );
