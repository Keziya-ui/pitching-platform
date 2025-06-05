## Getting Started

**Project setup**
```bash
git clone https://github.com/keziya-ui/pitching-platform
cd pitching-platform
npm install

# Run Development Server
npm run dev

# Build static pages
npm run build

# Run start
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Live Deployment - [here](https://pitching-platform.vercel.app)

## Tech Documentation

### Next.js

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

### Supabase

- [Supabase Docs](https://supabase.com/docs) - learn about supabase

**_Supabase Setup_**
- Register and login into supabase platform [here](https://supabase.com/dashboard/sign-in?returnTo=%2Forg)
- Create a project under dashboard.
- Get project's supabase url and anon key.
- Store it in pitching-paltform project's root directory in `.env` file.
- _**Example**_
``` bash
NEXT_PUBLIC_SUPABASE_URL="your supabase project url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your supabase project anon key"
```

**_Supabase buckets name used_**
- avatars
- uploads

### Database tables - PostgreSQL
- Refer [here](PostgreSQL_Tables.sql)
- Need to execute the sql table commands in order, based on above refrence file.

## Tech Stack

- **Next.js** – Framework for frontend and routing.
- **Typescript** - Provides static typing for better developer experience and code safety.
- **Supabase** – Direct backend service (no custom routes used currently).
  - Use Next.js API builin routes for custom backend logic if needed.
- **Database** – PostgreSQL (via Supabase).
- **Storage** – Supabase buckets for avatars, pitch decks, screenshots, etc.
- **Styling** – TailwindCSS for UI design.

## Logic Flow

### ✅ 1. Authentication (Login / Signup)
- User logs in via Supabase Auth (email + password).
- Supabase stores the user in `auth.users`.
- A row is created in the `profiles` table with data like name, avatar, and role (founder/investor).

### ✅ 2. Post-Login Routing (Role-Based Setup)
- After login:
  - If user role is `founder` → redirect to `/founder/dashboard`
  - If user role is `investor` → redirect to `/investor/dashboard`

### ✅ 3. Founder Flow

#### 🔹 Dashboard (`/founder/dashboard`)
- Show all pitches by this founder.

#### 🔹 Create Pitch
- Form inputs: title, tagline, problem, solution, funding goal, etc.
- Optional file uploads: pitch deck, product screenshots, video URL.
- Data goes to `pitches` table; files uploaded to Supabase Storage.

#### 🔹 View / Edit / Delete Pitch
- View full pitch details.
- Edit or delete the pitch.
- Update files or re-upload.

#### 🔹 View Investor Interests
- See investors who showed interest.
- Accept or reject interest.

### ✅ 4. Investor Flow

### 🔹 Dashboard (`/investor/dashboard`)
- Show all pitches (except those by the investor themselves).

#### 🔹 View Pitch
- View full pitch content and founder details.

#### 🔹 Express / Withdraw Interest
- Insert/delete from `investor_interests`.
- Founder can update status to accepted/rejected.

### ✅ 5. Database Tables

- `auth.users`: Supabase Auth users
- `profiles`: metadata (user id, name, avatar, role)
- `pitches`: pitch data linked to founder
- `investor_interests`: tracks investor interest and status

### ✅ 6. Storage Buckets

- For:
  - Avatars
  - Pitch decks
  - Product screenshots
- Uploaded to Supabase Storage

# Code Considerations
- The current code may require future refactoring for optimization and maintainability.
- This may represents the structural flow of the pitching platform website, not a complete entire website.
- The implementation is based on the project description and a tech stack chosen to best suit its goals.
