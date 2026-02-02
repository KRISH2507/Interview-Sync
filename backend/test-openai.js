import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('Testing OpenAI API...');
console.log('API Key present:', !!process.env.OPENAI_API_KEY);
console.log('API Key length:', process.env.OPENAI_API_KEY?.length);
console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');

try {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Say "API works!" in JSON format with a field called "message".' }
    ],
    response_format: { type: 'json_object' },
  });
  
  console.log('\n✓ OpenAI API is working!');
  console.log('Response:', response.choices[0].message.content);
} catch (error) {
  console.error('\n✗ OpenAI API Error:');
  console.error('Message:', error.message);
  console.error('Status:', error.status);
  console.error('Type:', error.type);
  console.error('Code:', error.code);
}
