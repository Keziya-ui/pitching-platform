-- Table: public.profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['founder', 'investor'])),
  bio text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Table: public.pitches
CREATE TABLE public.pitches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  founder_id uuid,
  title text NOT NULL,
  description text,
  video_url text,
  funding_goal numeric NOT NULL,
  tags text[],  -- Corrected from ARRAY
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  financial_projections jsonb,
  tagline text,
  problem text,
  solution text,
  market_size text,
  business_model text,
  team_bios jsonb,
  current_funding_status numeric,
  equity_offered numeric,
  pitch_deck_url text,
  product_screenshots text[],  -- Corrected from ARRAY
  company_logo_url text,
  CONSTRAINT pitches_pkey PRIMARY KEY (id),
  CONSTRAINT pitches_founder_id_fkey FOREIGN KEY (founder_id) REFERENCES public.profiles(id)
);

-- Table: public.financial_projections
CREATE TABLE public.financial_projections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pitch_id uuid,
  year integer NOT NULL,
  revenue numeric NOT NULL,
  expenses numeric NOT NULL,
  profit numeric GENERATED ALWAYS AS (revenue - expenses) STORED,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT financial_projections_pkey PRIMARY KEY (id),
  CONSTRAINT financial_projections_pitch_id_fkey FOREIGN KEY (pitch_id) REFERENCES public.pitches(id)
);

-- Table: public.funding_transactions
CREATE TABLE public.funding_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pitch_id uuid,
  investor_id uuid,
  amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'completed', 'failed'])),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT funding_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT funding_transactions_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.profiles(id),
  CONSTRAINT funding_transactions_pitch_id_fkey FOREIGN KEY (pitch_id) REFERENCES public.pitches(id)
);

-- Table: public.investor_interests
CREATE TABLE public.investor_interests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  investor_id uuid,
  pitch_id uuid,
  status text DEFAULT 'interested',
  message text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT investor_interests_pkey PRIMARY KEY (id),
  CONSTRAINT investor_interests_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.profiles(id),
  CONSTRAINT investor_interests_pitch_id_fkey FOREIGN KEY (pitch_id) REFERENCES public.pitches(id)
);

-- Table: public.messages
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pitch_id uuid,
  sender_id uuid,
  receiver_id uuid,
  content text NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  read boolean DEFAULT false,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_pitch_id_fkey FOREIGN KEY (pitch_id) REFERENCES public.pitches(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
  CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id)
);

