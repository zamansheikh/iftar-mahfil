import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  description: string;
  amount: number;
  date: Date;
  collectorId?: string;
  collectorName?: string;
  spentBy: string;
  isExpended: boolean;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    collectorId: { type: String, trim: true },
    collectorName: { type: String, trim: true },
    spentBy: { type: String, required: true, trim: true },
    isExpended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
