import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventInfo extends Document {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

const EventInfoSchema = new Schema<IEventInfo>(
  {
    title: { type: String, required: true, default: 'কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ ইফতার মাহফিল' },
    date: { type: String, required: true, default: '১৫ রমজান ১৪৪৬' },
    time: { type: String, required: true, default: 'মাগরিবের আযানের ৩০ মিনিট পূর্বে' },
    location: { type: String, required: true, default: 'কান্দানিয়া উচ্চ বিদ্যালয় মাঠ' },
    description: { type: String, default: 'আমাদের প্রিয় বন্ধুদের সাথে একত্রে ইফতার করার এই আনন্দময় আয়োজনে আপনাকে স্বাগতম।' },
  },
  { timestamps: true }
);

const EventInfo: Model<IEventInfo> =
  mongoose.models.EventInfo || mongoose.model<IEventInfo>('EventInfo', EventInfoSchema);

export default EventInfo;
