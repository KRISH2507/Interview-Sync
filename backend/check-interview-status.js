import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Interview from './src/models/Interview.js';

dotenv.config();

async function checkInterviewStatus() {
    const output = [];
    const log = (msg) => {
        console.log(msg);
        output.push(msg);
    };

    try {
        await mongoose.connect(process.env.MONGO_URI);
        log('✅ Connected to MongoDB');

        const interviews = await Interview.find({});
        log(`\n📊 Interview Status Report:`);
        log(`Total interviews: ${interviews.length}`);

        const statusCounts = {};
        const scoreDistribution = { withScore: 0, withoutScore: 0 };

        interviews.forEach(interview => {
            const status = interview.status || 'undefined';
            statusCounts[status] = (statusCounts[status] || 0) + 1;

            if (interview.overallScore !== undefined && interview.overallScore !== null) {
                scoreDistribution.withScore++;
            } else {
                scoreDistribution.withoutScore++;
            }
        });

        log(`\nStatus distribution:`);
        Object.entries(statusCounts).forEach(([status, count]) => {
            log(`  ${status}: ${count}`);
        });

        log(`\nScore distribution:`);
        log(`  With overallScore: ${scoreDistribution.withScore}`);
        log(`  Without overallScore: ${scoreDistribution.withoutScore}`);

        const completed = interviews.filter(i => i.status === 'completed');
        if (completed.length > 0) {
            const avgScore = completed.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completed.length;
            log(`\nCompleted interviews average score: ${avgScore.toFixed(2)}%`);

            log(`\nSample completed interviews:`);
            completed.slice(0, 5).forEach(i => {
                log(`  ID: ${i._id}, Score: ${i.overallScore}%, Questions: ${i.questions?.length || 0}, Status: ${i.status}`);
            });
        } else {
            log('\n⚠️ No completed interviews found!');
        }

        const inProgressWithQuestions = interviews.filter(i =>
            i.status === 'in-progress' && i.questions && i.questions.length > 0
        );

        if (inProgressWithQuestions.length > 0) {
            log(`\n⚠️ Found ${inProgressWithQuestions.length} in-progress interviews with questions`);
            log(`Sample in-progress interviews:`);
            inProgressWithQuestions.slice(0, 5).forEach(i => {
                const hasAnswers = i.questions.some(q => q.userAnswer !== undefined);
                log(`  ID: ${i._id}, Score: ${i.overallScore || 'N/A'}%, Questions: ${i.questions.length}, Has answers: ${hasAnswers}`);
            });
        }

        await mongoose.disconnect();
        log('\n✅ Disconnected from MongoDB');

        fs.writeFileSync('interview-status-report.txt', output.join('\n'));
        log('\n📄 Report saved to interview-status-report.txt');
    } catch (error) {
        log('❌ Error: ' + error.message);
        process.exit(1);
    }
}

checkInterviewStatus();
