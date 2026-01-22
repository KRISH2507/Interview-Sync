import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { startInterview } from '../src/controllers/interviewController.js';

await mongoose.connect(process.env.MONGO_URI);

const fakeReq = { body: { userId: '695e42fae1e0e78522e51650' } };

const fakeRes = {
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(obj) {
    console.log('RESPONSE', this.statusCode || 200, JSON.stringify(obj, null, 2));
    return obj;
  },
};

try {
  await startInterview(fakeReq, fakeRes);
} catch (err) {
  console.error('Unhandled error calling startInterview:', err);
}

await mongoose.disconnect();
