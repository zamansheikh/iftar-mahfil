'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import EventInfo from '@/models/EventInfo';
import Member from '@/models/Member';
import PendingContribution from '@/models/PendingContribution';
import Expense from '@/models/Expense';
import ModerationRequest from '@/models/ModerationRequest';
import Note from '@/models/Note';
import { requireAdmin, requireModerator } from '@/lib/auth';
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
  exactDate: z.string().optional(),
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
    exactDate: (formData.get('exactDate') as string) || '',
    time: formData.get('time') as string,
    location: formData.get('location') as string,
    description: formData.get('description') as string,
  };
  console.log('[updateEventInfo] exactDate received:', JSON.stringify(data.exactDate));
  const parsed = eventInfoSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { exactDate, ...restData } = parsed.data;
  const updateOps: any = { $set: restData };
  if (exactDate && exactDate.trim() !== '') {
    updateOps.$set.exactDate = new Date(exactDate);
  } else {
    updateOps.$unset = { exactDate: 1 };
  }

  await EventInfo.findOneAndUpdate({}, updateOps, { upsert: true });
  revalidatePath('/');
  revalidatePath('/accounts');
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
  const members = await Member.find().select('name alternativeName').lean();
  return members.map((m) => ({ name: m.name as string, alternativeName: (m as any).alternativeName as string | undefined }));
}

export async function getCollectors() {
  await dbConnect();
  const collectors = await Member.find({ isCollector: true }).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(collectors));
}

export async function getCollectorsForForms() {
  await dbConnect();
  const collectors = await Member.find({ isCollector: true })
    .select('_id name alternativeName phone')
    .sort({ name: 1 })
    .lean();
  return JSON.parse(JSON.stringify(collectors));
}

export async function getSharedNotes() {
  await requireModerator();
  await dbConnect();
  const notes = await Note.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(notes));
}

const memberSchema = z.object({
  name: z.string().min(1, 'নাম প্রয়োজন'),
  alternativeName: z.string().optional(),
  phone: z.string().optional(),
  isCollector: z.boolean().optional(),
  totalContribution: z.number().min(0).optional(),
});

const collectorAssignmentSchema = z.object({
  memberId: z.string().min(1, 'সদস্য নির্বাচন করুন'),
  isCollector: z.boolean(),
});

const sharedNoteSchema = z.object({
  content: z.string().trim().min(1, 'নোট লিখুন').max(1000, 'নোট ১০০০ অক্ষরের বেশি হতে পারবে না'),
  memberId: z.string().optional(),
});

export async function addSharedNote(_prev: unknown, formData: FormData) {
  const session = await requireModerator();
  await dbConnect();

  const memberIdRaw = formData.get('memberId')?.toString().trim() || '';
  const data = {
    content: formData.get('content')?.toString() || '',
    memberId: memberIdRaw || undefined,
  };

  const parsed = sharedNoteSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let memberName: string | undefined;
  if (parsed.data.memberId) {
    const member = await Member.findById(parsed.data.memberId).lean();
    if (!member) return { error: 'সদস্য পাওয়া যায়নি।' };
    memberName = member.name as string;
  }

  await Note.create({
    content: parsed.data.content,
    memberId: parsed.data.memberId || undefined,
    memberName,
    createdBy: String(session.username || session.role),
    createdByRole: session.role === 'admin' ? 'admin' : 'moderator',
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/moderator/dashboard');

  return {
    success: 'নোট সংরক্ষণ হয়েছে।',
    timestamp: Date.now(),
  };
}

export async function toggleMemberCollector(_prev: unknown, formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const data = {
    memberId: formData.get('memberId')?.toString() || '',
    isCollector: formData.get('isCollector')?.toString() === 'true',
  };

  const parsed = collectorAssignmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const member = await Member.findById(parsed.data.memberId);
  if (!member) return { error: 'সদস্য পাওয়া যায়নি।' };

  const updated = await Member.findByIdAndUpdate(
    parsed.data.memberId,
    { $set: { isCollector: parsed.data.isCollector } },
    { new: true }
  ).lean();

  if (!updated) return { error: 'Collector status আপডেট করা যায়নি।' };

  revalidatePath('/admin/dashboard');
  revalidatePath('/moderator/dashboard');
  revalidatePath('/contribute');
  revalidatePath('/accounts');
  return {
    success: updated.isCollector
      ? 'সদস্যকে collector হিসেবে সেট করা হয়েছে।'
      : 'Collector দায়িত্ব থেকে সরানো হয়েছে।',
    isCollector: Boolean(updated.isCollector),
    memberId: String(updated._id),
    timestamp: Date.now(),
  };
}

export async function addMember(_prev: unknown, formData: FormData) {
  await requireAdmin();
  await dbConnect();
  const data = {
    name: formData.get('name')?.toString().trim(),
    alternativeName: formData.get('alternativeName')?.toString().trim() || '',
    phone: formData.get('phone')?.toString().trim() || '',
    totalContribution: Number(formData.get('totalContribution')) || 0,
  };
  const parsed = memberSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await Member.findOne({ name: parsed.data.name });
  if (existing) return { error: 'এই নামে ইতিমধ্যে সদস্য আছেন।' };

  await Member.create(parsed.data);
  revalidatePath('/members');
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  revalidatePath('/accounts');
  return { success: 'সদস্য যোগ করা হয়েছে।', timestamp: Date.now() };
}

export async function updateMember(_prev: unknown, formData: FormData) {
  await requireAdmin();
  await dbConnect();
  const id = formData.get('id') as string;
  const data = {
    name: formData.get('name')?.toString().trim(),
    alternativeName: formData.get('alternativeName')?.toString().trim() || '',
    phone: formData.get('phone')?.toString().trim() || '',
    totalContribution: Number(formData.get('totalContribution')) || 0,
  };
  const parsed = memberSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await Member.findByIdAndUpdate(id, parsed.data);
  revalidatePath('/members');
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  revalidatePath('/accounts');
  return { success: 'সদস্য তথ্য আপডেট হয়েছে।', timestamp: Date.now() };
}

export async function deleteMember(id: string) {
  await requireAdmin();
  await dbConnect();
  await Member.findByIdAndDelete(id);
  revalidatePath('/members');
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  revalidatePath('/accounts');
  return { success: 'সদস্য মুছে ফেলা হয়েছে।' };
}

const moderatorAddMemberSchema = z.object({
  name: z.string().min(1, 'নাম প্রয়োজন'),
  alternativeName: z.string().optional(),
  phone: z.string().optional(),
});

export async function moderatorAddMember(_prev: unknown, formData: FormData) {
  await requireModerator();
  await dbConnect();

  const data = {
    name: formData.get('name')?.toString().trim(),
    alternativeName: formData.get('alternativeName')?.toString().trim() || '',
    phone: formData.get('phone')?.toString().trim() || '',
  };

  const parsed = moderatorAddMemberSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await Member.findOne({ name: parsed.data.name });
  if (existing) return { error: 'এই নামে ইতিমধ্যে সদস্য আছেন।' };

  await Member.create({ ...parsed.data, totalContribution: 0 });
  revalidatePath('/members');
  revalidatePath('/contacts');
  revalidatePath('/accounts');
  revalidatePath('/moderator/dashboard');
  revalidatePath('/admin/dashboard');
  return { success: 'সদস্য যোগ করা হয়েছে।', timestamp: Date.now() };
}

const moderatorUpdatePhoneSchema = z.object({
  id: z.string().min(1, 'সদস্য নির্বাচন করুন'),
  phone: z.string().min(1, 'ফোন নম্বর প্রয়োজন'),
});

export async function moderatorUpdateMemberPhone(_prev: unknown, formData: FormData) {
  await requireModerator();
  await dbConnect();

  const data = {
    id: formData.get('id')?.toString() || '',
    phone: formData.get('phone')?.toString().trim() || '',
  };

  const parsed = moderatorUpdatePhoneSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await Member.findByIdAndUpdate(parsed.data.id, { phone: parsed.data.phone });
  revalidatePath('/members');
  revalidatePath('/contacts');
  revalidatePath('/moderator/dashboard');
  revalidatePath('/admin/dashboard');
  return { success: 'ফোন নম্বর আপডেট হয়েছে।', timestamp: Date.now() };
}

const contributionAdjustmentSchema = z.object({
  memberId: z.string().min(1, 'সদস্য নির্বাচন করুন'),
  collectorId: z.string().min(1, 'Collector নির্বাচন করুন'),
  operation: z.enum(['add', 'set']),
  amount: z.number().min(0, 'টাকার পরিমাণ সঠিক হতে হবে'),
  note: z.string().optional(),
});

export async function createContributionAdjustmentRequest(_prev: unknown, formData: FormData) {
  const session = await requireModerator();
  await dbConnect();

  const data = {
    memberId: formData.get('memberId')?.toString() || '',
    collectorId: formData.get('collectorId')?.toString() || '',
    operation: (formData.get('operation')?.toString() || 'add') as 'add' | 'set',
    amount: Number(formData.get('amount')),
    note: formData.get('note')?.toString().trim() || '',
  };

  const parsed = contributionAdjustmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const member = await Member.findById(parsed.data.memberId).lean();
  if (!member) return { error: 'সদস্য পাওয়া যায়নি।' };

  const collector = await Member.findOne({ _id: parsed.data.collectorId, isCollector: true }).lean();
  if (!collector) return { error: 'সঠিক collector নির্বাচন করুন।' };

  await ModerationRequest.create({
    type: 'member_contribution_update',
    status: 'pending',
    requestedBy: String(session.username || 'moderator'),
    requestedByRole: session.role === 'admin' ? 'admin' : 'moderator',
    note: parsed.data.note,
    payload: {
      memberId: parsed.data.memberId,
      memberName: member.name,
      collectorId: parsed.data.collectorId,
      collectorName: collector.name,
      operation: parsed.data.operation,
      amount: parsed.data.amount,
    },
  });

  revalidatePath('/moderator/dashboard');
  revalidatePath('/admin/dashboard');
  return { success: 'চাঁদা পরিবর্তনের অনুরোধ পাঠানো হয়েছে।' };
}

const expenseRequestSchema = z.object({
  description: z.string().min(1, 'বিবরণ প্রয়োজন'),
  amount: z.number().min(0, 'পরিমাণ সঠিক হতে হবে'),
  date: z.string().min(1, 'তারিখ প্রয়োজন'),
  collectorId: z.string().min(1, 'Collector নির্বাচন করুন'),
  note: z.string().optional(),
});

export async function createExpenseRequest(_prev: unknown, formData: FormData) {
  const session = await requireModerator();
  await dbConnect();

  const data = {
    description: formData.get('description')?.toString().trim() || '',
    amount: Number(formData.get('amount')),
    date: formData.get('date')?.toString() || '',
    collectorId: formData.get('collectorId')?.toString() || '',
    note: formData.get('note')?.toString().trim() || '',
  };

  const parsed = expenseRequestSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const collector = await Member.findOne({ _id: parsed.data.collectorId, isCollector: true }).lean();
  if (!collector) return { error: 'সঠিক collector নির্বাচন করুন।' };

  await ModerationRequest.create({
    type: 'expense_add',
    status: 'pending',
    requestedBy: String(session.username || 'moderator'),
    requestedByRole: session.role === 'admin' ? 'admin' : 'moderator',
    note: parsed.data.note,
    payload: {
      description: parsed.data.description,
      amount: parsed.data.amount,
      date: parsed.data.date,
      spentBy: collector.name,
      collectorId: String(collector._id),
      collectorName: collector.name,
    },
  });

  revalidatePath('/moderator/dashboard');
  revalidatePath('/admin/dashboard');
  return { success: 'খরচ যোগের অনুরোধ পাঠানো হয়েছে।' };
}

// ─── Contributions ─────────────────────────────────────────────────────────────

const contributionSchema = z.object({
  name: z.string().min(1, 'নাম প্রয়োজন'),
  phone: z.string().min(1, 'ফোন নম্বর প্রয়োজন'),
  amount: z.number().min(1, 'চাঁদার পরিমাণ কমপক্ষে ১ টাকা হতে হবে'),
  paymentMethod: z.string().min(1, 'পেমেন্টের মাধ্যম বেছে নিন'),
  collectorId: z.string().min(1, 'Collector নির্বাচন করুন'),
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
    collectorId: formData.get('collectorId') as string,
    transactionId: formData.get('transactionId') as string,
    message: formData.get('message') as string,
  };
  const parsed = contributionSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const collector = await Member.findOne({ _id: parsed.data.collectorId, isCollector: true }).lean();
  if (!collector) return { error: 'Collector নির্বাচন সঠিক নয়। আবার নির্বাচন করুন।' };

  await PendingContribution.create({
    ...parsed.data,
    collectorName: collector.name,
    submittedAt: new Date(),
  });
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
  revalidatePath('/');
  revalidatePath('/accounts');
  revalidatePath('/members');
  return { success: 'চাঁদা প্রত্যাখ্যান করা হয়েছে।' };
}

export async function getModerationRequests() {
  await requireAdmin();
  await dbConnect();
  const requests = await ModerationRequest.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(requests));
}

export async function getMyModerationRequests() {
  const session = await requireModerator();
  await dbConnect();
  const username = String(session.username || 'moderator');
  const requests = await ModerationRequest.find({ requestedBy: username })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(requests));
}

export async function approveModerationRequest(id: string) {
  const session = await requireAdmin();
  await dbConnect();

  const request = await ModerationRequest.findById(id);
  if (!request) return { error: 'অনুরোধ পাওয়া যায়নি।' };
  if (request.status !== 'pending') return { error: 'এই অনুরোধ ইতিমধ্যে প্রক্রিয়া করা হয়েছে।' };

  if (request.type === 'member_contribution_update') {
    const payload = request.payload as {
      memberId: string;
      operation: 'add' | 'set';
      amount: number;
    };
    if (payload.operation === 'add') {
      await Member.findByIdAndUpdate(payload.memberId, { $inc: { totalContribution: payload.amount } });
    } else {
      await Member.findByIdAndUpdate(payload.memberId, { totalContribution: payload.amount });
    }
    revalidatePath('/members');
    revalidatePath('/accounts');
    revalidatePath('/contacts');
  }

  if (request.type === 'expense_add') {
    const payload = request.payload as {
      description: string;
      amount: number;
      date: string;
      spentBy: string;
      collectorId?: string;
      collectorName?: string;
    };
    await Expense.create({
      description: payload.description,
      amount: payload.amount,
      date: new Date(payload.date),
      spentBy: payload.spentBy,
      collectorId: payload.collectorId || undefined,
      collectorName: payload.collectorName || payload.spentBy,
      isExpended: true,
    });
    revalidatePath('/accounts');
  }

  request.status = 'approved';
  request.reviewedBy = String(session.username || 'admin');
  request.reviewedAt = new Date();
  await request.save();

  revalidatePath('/admin/dashboard');
  revalidatePath('/moderator/dashboard');
  revalidatePath('/');
  return { success: 'মডারেটর অনুরোধ অনুমোদন হয়েছে।' };
}

export async function rejectModerationRequest(id: string) {
  const session = await requireAdmin();
  await dbConnect();

  const request = await ModerationRequest.findById(id);
  if (!request) return { error: 'অনুরোধ পাওয়া যায়নি।' };
  if (request.status !== 'pending') return { error: 'এই অনুরোধ ইতিমধ্যে প্রক্রিয়া করা হয়েছে।' };

  request.status = 'rejected';
  request.reviewedBy = String(session.username || 'admin');
  request.reviewedAt = new Date();
  await request.save();

  revalidatePath('/admin/dashboard');
  revalidatePath('/moderator/dashboard');
  return { success: 'মডারেটর অনুরোধ প্রত্যাখ্যান হয়েছে।' };
}

// ─── Expenses ──────────────────────────────────────────────────────────────────

export async function getExpenses() {
  await dbConnect();
  const expenses = await Expense.find().sort({ date: -1 }).lean();
  return JSON.parse(JSON.stringify(expenses));
}

export async function getPublicExpenses() {
  await dbConnect();
  const expenses = await Expense.find({ isExpended: true }).sort({ date: -1 }).lean();
  return JSON.parse(JSON.stringify(expenses));
}

const expenseSchema = z.object({
  description: z.string().min(1, 'বিবরণ প্রয়োজন'),
  amount: z.number().min(0, 'পরিমাণ সঠিক হতে হবে'),
  date: z.string().min(1, 'তারিখ প্রয়োজন'),
  collectorId: z.string().min(1, 'Collector নির্বাচন করুন'),
  isExpended: z.boolean(),
});

function getFormValue(formData: FormData, field: string) {
  if (formData.has(field)) return formData.get(field);
  for (const [key, value] of formData.entries()) {
    if (key.endsWith(`_${field}`)) return value;
  }
  return null;
}

function getFormBoolean(formData: FormData, field: string) {
  const values = [];
  if (formData.has(field)) {
    const v = formData.getAll(field);
    values.push(...v);
  }
  for (const [key, value] of formData.entries()) {
    if (key.endsWith(`_${field}`)) values.push(value);
  }
  return values.includes('true');
}

export async function addExpense(_prev: unknown, formData: FormData) {
  await requireAdmin();
  await dbConnect();
  const isExpended = getFormBoolean(formData, 'isExpended');
  const data = {
    description: getFormValue(formData, 'description') as string,
    amount: Number(getFormValue(formData, 'amount')),
    date: getFormValue(formData, 'date') as string,
    collectorId: (getFormValue(formData, 'collectorId') as string) || '',
    isExpended,
  };
  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const collector = await Member.findOne({ _id: parsed.data.collectorId, isCollector: true }).lean();
  if (!collector) return { error: 'সঠিক collector নির্বাচন করুন।' };

  await Expense.create({
    ...parsed.data,
    date: new Date(parsed.data.date),
    spentBy: collector.name,
    collectorName: collector.name,
  });
  revalidatePath('/accounts');
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  return { success: 'খরচ যোগ করা হয়েছে。' };
}

export async function updateExpense(_prev: unknown, formData: FormData) {
  await requireAdmin();
  await dbConnect();
  const id = getFormValue(formData, 'id') as string;
  const isExpended = getFormBoolean(formData, 'isExpended');
  const data = {
    description: getFormValue(formData, 'description') as string,
    amount: Number(getFormValue(formData, 'amount')),
    date: getFormValue(formData, 'date') as string,
    collectorId: (getFormValue(formData, 'collectorId') as string) || '',
    isExpended,
  };
  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const collector = await Member.findOne({ _id: parsed.data.collectorId, isCollector: true }).lean();
  if (!collector) return { error: 'সঠিক collector নির্বাচন করুন।' };

  console.log('[updateExpense] parsed.data:', parsed.data);
  await Expense.findByIdAndUpdate(id, {
    ...parsed.data,
    date: new Date(parsed.data.date),
    spentBy: collector.name,
    collectorName: collector.name,
  });
  revalidatePath('/accounts');
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  return { success: `খরচ আপডেট করা হয়েছে। isExpended=${parsed.data.isExpended}`, timestamp: Date.now() };
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
  const expenses = await Expense.find({ isExpended: true }).lean();

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
