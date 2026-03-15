import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMember extends Document {
  name: string;
  alternativeName?: string;
  phone?: string;
  totalContribution: number;
}

const MemberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    alternativeName: { type: String, trim: true },
    phone: { type: String, trim: true },
    totalContribution: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;
