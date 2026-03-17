import mongoose, { Document, Model, Schema } from 'mongoose';

export type ModerationRequestType = 'member_contribution_update' | 'expense_add';
export type ModerationRequestStatus = 'pending' | 'approved' | 'rejected';

export interface IModerationRequest extends Document {
  type: ModerationRequestType;
  status: ModerationRequestStatus;
  requestedBy: string;
  requestedByRole: 'moderator' | 'admin';
  note?: string;
  payload: Record<string, unknown>;
  reviewedBy?: string;
  reviewedAt?: Date;
}

const ModerationRequestSchema = new Schema<IModerationRequest>(
  {
    type: {
      type: String,
      enum: ['member_contribution_update', 'expense_add'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    requestedBy: { type: String, required: true, trim: true },
    requestedByRole: {
      type: String,
      enum: ['moderator', 'admin'],
      required: true,
    },
    note: { type: String, trim: true },
    payload: { type: Schema.Types.Mixed, required: true },
    reviewedBy: { type: String, trim: true },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

const ModerationRequest: Model<IModerationRequest> =
  mongoose.models.ModerationRequest ||
  mongoose.model<IModerationRequest>('ModerationRequest', ModerationRequestSchema);

export default ModerationRequest;
