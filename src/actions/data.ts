'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import EventInfo from '@/models/EventInfo';
import Member from '@/models/Member';
import PendingContribution from '@/models/PendingContribution';
import Expense from '@/models/Expense';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

// ─── Event Info ────────────────────────────────────────────────────────────────

export async function getEventInfo() {
  await dbConnect();
  let event = await EventInfo.findOne().lean();
  if (!event) {
    event = await EventInfo.create({});
    event = await EventInfo.findOne().lean();
  }
  return JSON.parse(JSON.stringify(event));
}

const eventInfoSchema = z.object({
  title: z.string().min(1, 'শিরোনাম প্রয়োজন'),
  date: z.string().min(1, 'তারিখ প্রয়োজন'),
  time: z.string().min(1, 'সময় প্রয়োজন'),
  location: z.string().min(1, 'স্থান প্রয়োজন'),
  description: z.string(),
});

export async function updateEventInfo(_prev: unknown, formData: FormData) {
  await requireAdmin();
  await dbConnect();
  const data = {
    title: formData.get('title') as string,
    date: formData.get('date') as string,
    time: formData.get('time') as string,
    location: formData.get('location') as string,
    description: formData.get('description') as string,
  };
  const parsed = eventInfoSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await EventInfo.findOneAndUpdate({}, parsed.data, { upsert: true });
  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  return { success: 'ইভেন্ট তথ্য সংরক্ষণ হয়েছে।' };
}

// ─── Members ───────────────────────────────────────────────────────────────────

export async function getMembers() {
  await dbConnect();
  const members = await Member.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(members));
}

export async function getMemberNames() {
  await dbConnect();
  const members = await Member.find().select('name').lean();
  return members.map((m) => m.name);
}

const memberSchema = z.object({
  name: z.string().min(1, 'নাম প্রয়োজন'),
  phone: z.string().optional(),
  totalContribution: z.number().min(0).optional(),
});

export async function addMember(_prev: unknown, formData: FormData) {
  await requireAdmin();
  await dbConnect();
  const data = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    totalContribution: Number(formData.get('totalContribution')) || 0,
  };
  const parsed = memberSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await Member.findOne({ name: parsed.data.name });
  if (existing) return { error: 'এই নামে ইতিমধ্যে সদস্য আছেন।' };

  await Member.create(parsed.data);
  revalidatePath('/members');
  revalidatePath('/admin/dashboard');
  return { success: 'সদস্য যোগ করা হয়েছে।' };
}

export async function updateMember(_prev: unknown, formData: FormData) {
  await requireAdmin();
  await dbConnect();
  const id = formData.get('id') as string;
  const data = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    totalContribution: Number(formData.get('totalContribution')) || 0,
  };
  const parsed = memberSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await Member.findByIdAndUpdate(id, parsed.data);
  revalidatePath('/members');
  revalidatePath('/admin/dashboard');
  return { success: 'সদস্য তথ্য আপডেট হয়েছে।' };
}

export async function deleteMember(id: string) {
  await requireAdmin();
  await dbConnect();
  await Member.findByIdAndDelete(id);
  revalidatePath('/members');
  revalidatePath('/admin/dashboard');
  return { success: 'সদস্য মুছে ফেলা হয়েছে।' };
}

// ─── Contributions ─────────────────────────────────────────────────────────────

const contributionSchema = z.object({
  name: z.string().min(1, 'নাম প্রয়োজন'),
  phone: z.string().min(1, 'ফোন নম্বর প্রয়োজন'),
  amount: z.number().min(1, 'চাঁদার পরিমাণ কমপক্ষে ১ টাকা হতে হবে'),
  paymentMethod: z.string().min(1, 'পেমেন্টের মাধ্যম বেছে নিন'),
  transactionId: z.string().optional(),
  message: z.string().optional(),
});

export type ContributeFormState = {
  error?: string;
  success?: string;
};

export async function submitContribution(
  _prev: ContributeFormState,
  formData: FormData
): Promise<ContributeFormState> {
  await dbConnect();
  const data = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    amount: Number(formData.get('amount')),
    paymentMethod: formData.get('paymentMethod') as string,
    transactionId: formData.get('transactionId') as string,
    message: formData.get('message') as string,
  };
  const parsed = contributionSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await PendingContribution.create({ ...parsed.data, submittedAt: new Date() });
  revalidatePath('/contribute');
  return { success: 'আপনার চাঁদা জমা অনুরোধ পাঠানো হয়েছে। অ্যাডমিন অনুমোদন করলে দেখা যাবে।' };
}

export async function getPendingContributions() {
  await requireAdmin();
  await dbConnect();
  const contributions = await PendingContribution.find()
    .sort({ submittedAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(contributions));
}

export async function approveContribution(id: string) {
  await requireAdmin();
  await dbConnect();
  const contribution = await PendingContribution.findById(id);
  if (!contribution) return { error: 'চাঁদা পাওয়া যায়নি।' };
  if (contribution.status !== 'pending') return { error: 'এটি ইতিমধ্যে প্রক্রিয়া করা হয়েছে।' };

  let member = await Member.findOne({ name: contribution.name });
  
  if (!member) {
    await Member.create({
      name: contribution.name,
      phone: contribution.phone,
      totalContribution: contribution.amount
    });
  } else {
    await Member.findByIdAndUpdate(member._id, {
      $inc: { totalContribution: contribution.amount },
    });
  }

  await PendingContribution.findByIdAndUpdate(id, { status: 'approved' });

  revalidatePath('/members');
  revalidatePath('/accounts');
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  return { success: 'চাঁদা অনুমোদন হয়েছে।' };
}

export async function rejectContribution(id: string) {
  await requireAdmin();
  await dbConnect();
  await PendingContribution.findByIdAndUpdate(id, { status: 'rejected' });
  revalidatePath('/admin/dashboard');
  return { success: 'চাঁদা প্রত্যাখ্যান করা হয়েছে।' };
}

// ─── Expenses ──────────────────────────────────────────────────────────────────

export async function getExpenses() {
  await dbConnect();
  const expenses = await Expense.find().sort({ date: -1 }).lean();
  return JSON.parse(JSON.stringify(expenses));
}

const expenseSchema = z.object({
  description: z.string().min(1, 'বিবরণ প্রয়োজন'),
  amount: z.number().min(0, 'পরিমাণ সঠিক হতে হবে'),
  date: z.string().min(1, 'তারিখ প্রয়োজন'),
  spentBy: z.string().min(1, 'কে খরচ করেছে তা উল্লেখ করুন'),
});

export async function addExpense(_prev: unknown, formData: FormData) {
  await requireAdmin();
  await dbConnect();
  const data = {
    description: formData.get('description') as string,
    amount: Number(formData.get('amount')),
    date: formData.get('date') as string,
    spentBy: formData.get('spentBy') as string,
  };
  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await Expense.create({ ...parsed.data, date: new Date(parsed.data.date) });
  revalidatePath('/accounts');
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  return { success: 'খরচ যোগ করা হয়েছে।' };
}

export async function deleteExpense(id: string) {
  await requireAdmin();
  await dbConnect();
  await Expense.findByIdAndDelete(id);
  revalidatePath('/accounts');
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  return { success: 'খরচ মুছে ফেলা হয়েছে।' };
}

// ─── Summary ───────────────────────────────────────────────────────────────────

export async function getSummary() {
  await dbConnect();
  const members = await Member.find().lean();
  const expenses = await Expense.find().lean();

  const totalCollected = members.reduce((sum, m) => sum + m.totalContribution, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalCollected - totalExpense;
  const memberCount = members.length;
  const perMemberRefund = memberCount > 0 ? Math.floor(remaining / memberCount) : 0;

  return {
    totalCollected,
    totalExpense,
    remaining,
    memberCount,
    perMemberRefund,
  };
}
