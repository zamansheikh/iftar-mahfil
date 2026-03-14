You are an expert full-stack Next.js developer. Build a complete, production-ready Next.js 14+ (App Router) web application in TypeScript with Tailwind CSS, Mongoose (MongoDB), and shadcn/ui components.

**Project Name:** কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ এর ইফতার মাহফিল

**Requirements:**

- Entire website must be in **Bengali language** (all texts, buttons, labels, messages in proper Bengali).
- Fully **mobile responsive** (Tailwind mobile-first).
- **Islamic elegant theme**: Primary color emerald-700 (#10b981), accent gold-500 (#d4af37), dark elegant background with subtle Islamic geometric pattern (use CSS or background image). Use Noto Sans Bengali + Inter font. Hero section with mosque/lantern/iftar aesthetic (use Unsplash or placeholder images with alt text in Bengali).
- Use Server Actions, React Hook Form + Zod for all forms.
- MongoDB Atlas connection via Mongoose (provide .env.example).
- Simple admin authentication (hardcoded for demo): username = "admin", password = "iftar2025" (use httpOnly cookie + JWT or next-auth Credentials provider — choose the simplest secure way).

**Database Models (Mongoose):**

1. EventInfo (single document)
   - title, date (string), time (string), location (string), description (string)

2. Member
   - name (unique, string)
   - phone (optional)
   - totalContribution (Number, default 0)

3. PendingContribution
   - name (string)
   - amount (Number)
   - paymentMethod (string)
   - transactionId (string, optional)
   - phone (string)
   - message (string, optional)
   - submittedAt (Date)
   - status: "pending" | "approved" | "rejected"

4. Expense
   - description (string)
   - amount (Number)
   - date (Date)

**Pages & Features:**

**Public Pages:**

1. **/** (Homepage)
   - Navbar (logo + links: হোম, সদস্যবৃন্দ, চাঁদা জমা, হিসাব-নিকাশ)
   - Hero banner with event title + beautiful Islamic design
   - Event details (date, time, location) — editable by admin
   - Live summary cards: মোট জমা, মোট খরচ, অবশিষ্ট টাকা, সদস্য সংখ্যা
   - Islamic dua/quote section

2. **/members**
   - Table: নাম | জমাকৃত টাকা | ফেরত পাবেন (refund amount)
   - Refund calculation: (Total Collected - Total Expense) / Number of Members = প্রতি সদস্যের ফেরত

3. **/contribute** (চাঁদা জমা)
   - Public form:
     - নাম (exact match with member list)
     - ফোন নম্বর
     - চাঁদার পরিমাণ (টাকা)
     - পেমেন্টের মাধ্যম (dropdown: নগদ, বিকাশ, নগদ, রকেট, অন্যান্য)
     - ট্রানজেকশন আইডি (optional)
     - মন্তব্য (optional)
   - On submit → goes to PendingContribution (status: pending)
   - Success message: “আপনার চাঁদা জমা অনুরোধ পাঠানো হয়েছে। অ্যাডমিন অনুমোদন করলে দেখা যাবে।”

4. **/accounts** (হিসাব-নিকাশ)
   - All public summary:
     - মোট জমা
     - খরচের বিস্তারিত তালিকা
     - অবশিষ্ট টাকা
     - প্রতি সদস্য ফেরতের পরিমাণ (clearly displayed)
     - Download button (optional CSV)

**Admin Panel (/admin)** — protected route:

- Login page first
- Dashboard with tabs:
  1. Event Info (edit date, time, location, description)
  2. সদস্য ব্যবস্থাপনা (add new member, edit, delete)
  3. Pending চাঁদা (list all pending submissions with details)
     - Approve button → add amount to corresponding Member.totalContribution + change status to approved
     - Reject button
  4. খরচ যোগ করুন (add/edit/delete expenses)
  5. Overall Summary + Refund Calculator (live update)
  6. All members list with contribution + individual refund amount

**Additional Requirements:**

- Real-time totals update after every approve/expense change (use revalidatePath or server components).
- All forms have proper validation (Zod).
- Loading states, success/error toasts (use sonner).
- After all expenses, clearly show “খরচ শেষ। এখন প্রতি সদস্য ফেরত পাবেন ___ টাকা” in public accounts page.
- Beautiful, clean, modern Islamic design (no childish look).
- SEO friendly meta tags (title, description in Bengali).
- Include .env.example, README.md with setup instructions (MongoDB, npm run dev).
- Folder structure should be clean and scalable.

**Generate the complete project** with all files, components, API routes (or server actions), layout, and Tailwind config. Start by creating the Next.js app structure and then implement everything step by step.

**Start building now.**
