# কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ — ইফতার মাহফিল

একটি সম্পূর্ণ Next.js 14+ ওয়েব অ্যাপ্লিকেশন যা ইফতার মাহফিল আয়োজনের চাঁদা সংগ্রহ, সদস্য ব্যবস্থাপনা এবং হিসাব-নিকাশের জন্য তৈরি।

## 🚀 Features

- **সদস্য ব্যবস্থাপনা** — সদস্য যোগ, সম্পাদনা, মুছুন
- **চাঁদা সংগ্রহ** — পাবলিক ফর্মে চাঁদা জমার অনুরোধ
- **অ্যাডমিন অনুমোদন** — পেন্ডিং চাঁদা অনুমোদন/প্রত্যাখ্যান
- **খরচ ব্যবস্থাপনা** — খরচ যোগ ও মুছুন
- **লাইভ হিসাব** — মোট জমা, খরচ, অবশিষ্ট ও প্রতি সদস্য ফেরতের পরিমাণ
- **CSV ডাউনলোড** — সম্পূর্ণ হিসাব ডাউনলোড

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (jose) + httpOnly cookies
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
cd iftar-mahfil
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/iftar-mahfil
JWT_SECRET=your-64-char-random-secret-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=iftar2025
```

**MongoDB Setup:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free cluster
2. Create a database user with read/write access
3. Whitelist your IP (or 0.0.0.0/0 for development)
4. Get the connection string and paste it as `MONGODB_URI`

**JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Admin Panel

Go to [http://localhost:3000/admin](http://localhost:3000/admin)

- **Username**: `admin` (or whatever you set in ADMIN_USERNAME)
- **Password**: `iftar2025` (or whatever you set in ADMIN_PASSWORD)

## 📁 Project Structure

```
src/
├── actions/          # Server Actions
│   ├── auth.ts       # Login/logout
│   └── data.ts       # CRUD operations
├── app/
│   ├── (public)/     # Public pages
│   │   ├── page.tsx          # Homepage
│   │   ├── members/          # সদস্যবৃন্দ
│   │   ├── contribute/       # চাঁদা জমা
│   │   └── accounts/         # হিসাব-নিকাশ
│   ├── admin/        # Admin panel
│   │   ├── page.tsx          # Login
│   │   └── dashboard/        # Dashboard
│   ├── globals.css
│   └── layout.tsx
├── components/       # Shared components
├── lib/
│   ├── auth.ts       # JWT utilities
│   └── db.ts         # MongoDB connection
├── middleware.ts     # Route protection
└── models/           # Mongoose models
    ├── EventInfo.ts
    ├── Member.ts
    ├── PendingContribution.ts
    └── Expense.ts
```

## 🌐 Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with event info + live summary |
| `/members` | সদস্যবৃন্দ তালিকা |
| `/contribute` | চাঁদা জমার ফর্ম |
| `/accounts` | হিসাব-নিকাশ |
| `/admin` | অ্যাডমিন লগইন |
| `/admin/dashboard` | অ্যাডমিন প্যানেল |

## 🔒 Security Notes

- Admin credentials are stored in `.env.local` (never commit this file)
- JWT tokens use httpOnly cookies (XSS-protected)
- All admin server actions verify the session before executing
- Middleware protects the `/admin/dashboard` route

## 🚢 Production Deployment

```bash
npm run build
npm start
```

For production, deploy to **Vercel** (recommended):
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!
