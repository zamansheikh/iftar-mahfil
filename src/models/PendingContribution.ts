import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPendingContribution extends Document {
  name: string;
  amount: number;
  paymentMethod: string;
  collectorId?: string;
  collectorName?: string;
  transactionId?: string;
  phone: string;
  message?: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

const PendingContributionSchema = new Schema<IPendingContribution>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: { type: String, required: true },
    collectorId: { type: String, trim: true },
    collectorName: { type: String, trim: true },
    transactionId: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const PendingContribution: Model<IPendingContribution> =
  mongoose.models.PendingContribution ||
  mongoose.model<IPendingContribution>('PendingContribution', PendingContributionSchema);

export default PendingContribution;
