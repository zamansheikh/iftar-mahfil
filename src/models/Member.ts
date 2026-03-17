import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMember extends Document {
  name: string;
  alternativeName?: string;
  phone?: string;
  isCollector: boolean;
  totalContribution: number;
}

const MemberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    alternativeName: { type: String, trim: true },
    phone: { type: String, trim: true },
    isCollector: { type: Boolean, default: false },
    totalContribution: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const existingModel = mongoose.models.Member as Model<IMember> | undefined;

if (existingModel && !existingModel.schema.path('isCollector')) {
  existingModel.schema.add({
    isCollector: { type: Boolean, default: false },
  });
}

const Member: Model<IMember> =
  existingModel || mongoose.model<IMember>('Member', MemberSchema);

export default Member;
