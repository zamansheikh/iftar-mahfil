import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  phone: { type: String },
  totalContribution: { type: Number, default: 0 },
});

const Member = mongoose.models.Member || mongoose.model('Member', MemberSchema);

const membersData = [
  { name: 'কাউসার', phone: '01798-021438' },
  { name: 'অজয়', phone: '01795-608096' },
  { name: 'আকিব', phone: '01833-485105' },
  { name: 'আজাহার', phone: '01314-935451' },
  { name: 'আজিজুল', phone: '01329-980322' },
  { name: 'আতাবুদ্দিন', phone: '01629-476690' },
  { name: 'আতিকুল ', phone: '01626-503561' },
  { name: 'আবুতাহের', phone: '01627-653879' },
  { name: 'আরিফুল', phone: '01631-140820' },
  { name: 'আলামিন (বানারপাড়)', phone: '01635-415459' },
  { name: 'ইব্রাহীম বাহার', phone: '01738-727542' },
  { name: 'ইমরান', phone: '01762-014706' },
  { name: 'জসীম', phone: '01623-362187' },
  { name: 'জহিরুল', phone: '01623-361614' },
  { name: 'জামান', phone: '01735-069723' },
  { name: 'তৌহিদ', phone: '01629-402911' },
  { name: 'নাইম(বানারপাড়)', phone: '01635-415461' },
  { name: 'নাঈম (লাঙ্গলশিমুল)', phone: '01629-476679' },
  { name: 'নাঈম(হরিনহাটা)', phone: 'Abroad' },
  { name: 'ফয়সাল', phone: '01902-541858' },
  { name: 'বায়োজিদ', phone: '01639-338920' },
  { name: 'বিল্লাল', phone: '01827-817044' },
  { name: 'মনির', phone: '01304-490858' },
  { name: 'মাছুম', phone: '01761-920810' },
  { name: 'মানিক', phone: '01710-581522' },
  { name: 'মামুন', phone: '01707-933609' },
  { name: 'মামুন (ভাটিপাড়া)', phone: '01740-209772' },
  { name: 'মাসিদুল', phone: '01792-570443' },
  { name: 'মাহবুব (মারছিবুল)', phone: '01726-779530' },
  { name: 'মিনহাজ (কান্দানিয়া)', phone: '' },
  { name: 'মিনহাজ (ভাটিপাড়া)', phone: '01402-291877' },
  { name: 'মেহেদী', phone: '01317-328929' },
  { name: 'মোক্তার', phone: '' },
  { name: 'মোজাহিদ', phone: '01633-139159' },
  { name: 'মোবারক', phone: '01768-962704' },
  { name: 'মোরশেদুল ইসলাম হৃদয়', phone: '01640-941302' },
  { name: 'মোরাদ', phone: '01642-243222' },
  { name: 'মোস্তাক', phone: '01606-669461' },
  { name: 'রকিব (বানারপাড়)', phone: '' },
  { name: 'রকিব (লাঙ্গল শিমুল)', phone: 'Abroad' },
  { name: 'রবি', phone: '' },
  { name: 'রবিন (জীবন) (লাঙ্গলশিমুল)', phone: '01639-716103' },
  { name: 'রবিন (ভাটিপাড়া)', phone: '01810-735441' },
  { name: 'রবিন(লাঙ্গল শিমুল)(পিচ্চি)', phone: '01635-105295' },
  { name: 'রিয়াজ', phone: '01754-518807' },
  { name: 'রিশাদ', phone: '01767-716490' },
  { name: 'লতিফ', phone: '01632-924824' },
  { name: 'লিখন', phone: '01628-793310' },
  { name: 'লিমন', phone: '01799-020183' },
  { name: 'শাকিল', phone: '01632-564926' },
  { name: 'শাহিজুল', phone: '01614-590020' },
  { name: 'শুভ', phone: '01742-979795' },
  { name: 'সজিব (বটে)', phone: '' },
  { name: 'সাইদুল ইসলাম সানি', phone: 'Abroad' },
  { name: 'সাকিব', phone: '01635-416692' },
  { name: 'সানি', phone: '01819-851929' },
  { name: 'সানোয়ার ', phone: '01959-331884' },
  { name: 'সাব্বির (ভীরু)', phone: '' },
  { name: 'সিরাজুল', phone: 'Abroad' },
  { name: 'সুজন', phone: '01633-726218' },
  { name: 'সুমন', phone: '01610-331288' },
  { name: 'সোলাইমান', phone: '01819-851852' },
  { name: 'সোহাগ (কোনাবাখাইল)', phone: '01600-248884' },
  { name: 'হিমেল', phone: '01610-331278' },
];

async function seed() {
  await mongoose.connect(MONGO_URI as string);
  console.log('Connected to db');
  
  let added = 0;
  for (const m of membersData) {
    const exists = await Member.findOne({ name: m.name.trim() });
    if (!exists) {
      await Member.create({ name: m.name.trim(), phone: m.phone.trim() });
      added++;
    }
  }
  console.log(`Added ${added} new members.`);
  process.exit(0);
}

seed().catch(console.error);
