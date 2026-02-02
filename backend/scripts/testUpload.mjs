import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config();

const filePath = './test-resume.txt';
fs.writeFileSync(filePath, 'Test resume content');

async function run() {
  const form = new FormData();
  form.append('resume', fs.createReadStream(filePath));
  form.append('name', 'Test User');
  form.append('email', 'testuser@example.com');

  try {
    const res = await fetch('https://interview-sync-ldw4.onrender.com/api/resume/upload', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });
    console.log('STATUS', res.status);
    console.log(await res.text());
  } catch (err) {
    console.error('UPLOAD ERROR', err.message);
  }
}

run().finally(() => fs.unlinkSync(filePath));
