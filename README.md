# ☕ Cafe Cursor

> A modern, secure credit distribution system for Cursor community events.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- **🔐 Secure Registration** - Only pre-approved attendees can claim credits
- **📧 Email Notifications** - Automatic email with credit details via Resend
- **🌍 Multi-language** - Spanish and English support
- **📱 Responsive Design** - Beautiful dark theme, works on all devices
- **👤 Admin Panel** - Manage credits and users with ease
- **🐦 Social Sharing** - One-click share to X (Twitter)
- **⚡ Fast & Modern** - Built with Next.js 14 App Router

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/cafe-cursor.git
cd cafe-cursor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database (for local development)
DATABASE_URL="file:./dev.db"

# Resend API (get free key at resend.com)
RESEND_API_KEY="re_your_api_key"
FROM_EMAIL="Your Event <onboarding@resend.dev>"

# Admin credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your_secure_password"
SESSION_SECRET="a_unique_random_value_of_at_least_32_characters"
```

`RESEND_API_KEY` can stay empty during local development. Emails are then
simulated in the development-server terminal. Production requires a real
Resend API key.

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed with sample data (optional)
npx tsx prisma/seed.ts
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📊 Admin Panel

Access the admin panel at `/admin`:

- **Dashboard** - View credit statistics and user registrations
- **User Management** - See who claimed credits
- **Credit Management** - Track available and used credits

Default credentials: `admin` / `cafecursor2024`

## 📦 Data Import

Use the non-destructive importer for real event data. It creates or updates
records without deleting existing claims and does not add test data.

### Import Credits (CSV)

Create `prisma/credits.csv` with your Cursor referral links:

```csv
link
https://cursor.com/referral?code=ABC123
https://cursor.com/referral?code=DEF456
```

### Import Eligible Users (CSV)

Create `prisma/users.csv` with pre-approved attendees, or upload the same file from `/admin` → Importar CSV:

```csv
email,name,company,role,approval_status
john@email.com,John Doe,Acme Inc,Developer,approved
jane@email.com,Jane Smith,Tech Corp,Designer,approved
```

The real CSV files are ignored by Git and must not be committed. Import them
into the local database with:

```bash
npm run db:import
```

To import into the production PostgreSQL database, configure
`POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` in your local `.env`, then
run:

```bash
npm run db:import:production
```

Unlike `db:seed`, the import commands are safe to run again and do not clear
assignments. `npm run db:seed` remains a destructive local reset tool that also
adds sample and test records.

## 🌐 Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/cafe-cursor.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Create a persistent PostgreSQL database and add these values to your local
   `.env` for the one-time schema setup:
   - `POSTGRES_PRISMA_URL` - Pooled PostgreSQL connection string
   - `POSTGRES_URL_NON_POOLING` - Direct PostgreSQL connection string

3. Create the production tables:

```bash
npm run db:push:production
```

4. Add environment variables in the Vercel dashboard:
   - `POSTGRES_PRISMA_URL` - Pooled PostgreSQL connection string
   - `POSTGRES_URL_NON_POOLING` - Direct PostgreSQL connection string
   - `RESEND_API_KEY` - Your Resend API key
   - `FROM_EMAIL` - Sender on your verified Resend domain
   - `ADMIN_USERNAME` - Admin username
   - `ADMIN_PASSWORD` - Unique password of at least 12 characters
   - `SESSION_SECRET` - Unique random value of at least 32 characters

5. Deploy! 🚀

Production builds use `prisma/schema.production.prisma`; local development
continues to use SQLite through `prisma/schema.prisma`. Real credit links are
only sent by email and are never returned by the public registration API.

### Recommended Database Providers

- **[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)** - Seamless integration
- **[Supabase](https://supabase.com)** - Free tier available
- **[Neon](https://neon.tech)** - Serverless Postgres

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 14](https://nextjs.org) | React framework with App Router |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [Prisma](https://prisma.io) | Database ORM |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [Resend](https://resend.com) | Email delivery |
| [Zod](https://zod.dev) | Schema validation |

## 📁 Project Structure

```
cafe-cursor/
├── app/
│   ├── admin/           # Admin panel pages
│   ├── api/             # API routes
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/          # React components
├── lib/                 # Utilities and helpers
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
└── public/              # Static assets
```

## 🎨 Customization

### Change Event Name

Update the translations in `lib/translations.ts`:

```typescript
"pt-BR": {
  title: "Your Event Name",
  // ...
}
```

### Change Logo

Replace the SVG in `app/page.tsx` or add your logo to `public/`.

### Change Colors

Edit CSS variables in `app/globals.css`:

```css
:root {
  --foreground: #your-color;
  --background: #your-color;
  /* ... */
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your community events!

## 💚 Credits

Made by **Chris & Alex** and adapted for Buenos Aires by **Luciano**.

---

<p align="center">
  <a href="https://cursor.com">
    <img src="https://cursor.com/favicon.ico" width="32" height="32" alt="Cursor" />
  </a>
  <br />
  Powered by <a href="https://cursor.com">Cursor</a>
</p>
