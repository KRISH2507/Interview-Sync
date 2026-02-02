import dotenv from 'dotenv';
import { generateInterviewQuestions } from './src/services/interviewAIService.js';

dotenv.config();

const sampleResume = `
John Doe
Software Engineer

EXPERIENCE:
- 3 years of experience with JavaScript, React, and Node.js
- Built scalable REST APIs using Express and MongoDB
- Implemented CI/CD pipelines using Docker and AWS
- Strong knowledge of SQL databases and query optimization

SKILLS:
JavaScript, React, Node.js, Express, MongoDB, SQL, AWS, Docker, Git
`;

console.log('='.repeat(60));
console.log('TESTING QUESTION GENERATION WITH FALLBACK');
console.log('='.repeat(60));

console.log('\n📝 OpenAI API Key Status:');
console.log('Present:', !!process.env.OPENAI_API_KEY);
console.log('Length:', process.env.OPENAI_API_KEY?.length);
console.log('Starts with:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');

async function test() {
  try {
    console.log('\n🚀 Generating questions...\n');
    
    const questions = await generateInterviewQuestions(sampleResume);
    
    console.log('\n✅ Generated Questions:');
    console.log('='.repeat(60));
    
    questions.forEach((q, index) => {
      console.log(`\n${index + 1}. ${q.question}`);
      console.log(`   Topic: ${q.topic} | Difficulty: ${q.difficulty}`);
      q.options.forEach((opt, i) => {
        const marker = i === q.correctAnswerIndex ? '✓' : ' ';
        console.log(`   ${marker} ${String.fromCharCode(65 + i)}. ${opt}`);
      });
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed successfully!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

test();
