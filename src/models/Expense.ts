import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  description: string;
  amount: number;
  date: Date;
  spentBy: string;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    spentBy: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
