import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INote extends Document {
  content: string;
  memberId?: mongoose.Types.ObjectId;
  memberName?: string;
  createdBy: string;
  createdByRole: 'admin' | 'moderator';
}

const NoteSchema = new Schema<INote>(
  {
    content: { type: String, required: true, trim: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    memberName: { type: String, trim: true },
    createdBy: { type: String, required: true, trim: true },
    createdByRole: {
      type: String,
      enum: ['admin', 'moderator'],
      required: true,
    },
  },
  { timestamps: true }
);

const existingModel = mongoose.models.Note as Model<INote> | undefined;

if (existingModel) {
  if (!existingModel.schema.path('memberId')) {
    existingModel.schema.add({ memberId: { type: Schema.Types.ObjectId, ref: 'Member' } });
  }
  if (!existingModel.schema.path('memberName')) {
    existingModel.schema.add({ memberName: { type: String, trim: true } });
  }
}

const Note: Model<INote> = existingModel || mongoose.model<INote>('Note', NoteSchema);

export default Note;