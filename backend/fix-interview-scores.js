import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Interview from './src/models/Interview.js';

dotenv.config();

async function fixInterviewScores() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const interviews = await Interview.find({});
        console.log(`Found ${interviews.length} interviews`);

        let updated = 0;
        for (const interview of interviews) {
            const updates = {};

            if (interview.questions && interview.questions.length > 0) {
                const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
                const calculatedScore = Math.round((totalScore / (interview.questions.length * 10)) * 100);

                if (interview.overallScore !== calculatedScore) {
                    updates.overallScore = calculatedScore;
                    console.log(`Interview ${interview._id}: Setting overallScore to ${calculatedScore}%`);
                }

                if (!interview.totalQuestions) {
                    updates.totalQuestions = interview.questions.length;
                }
            }

            if (Object.keys(updates).length > 0) {
                await Interview.updateOne({ _id: interview._id }, { $set: updates });
                updated++;
            }
        }

        console.log(`✅ Updated ${updated} interviews`);

        const allInterviews = await Interview.find({});
        const completed = allInterviews.filter(i => i.status === 'completed');
        console.log(`\n📊 Summary:`);
        console.log(`Total interviews: ${allInterviews.length}`);
        console.log(`Completed interviews: ${completed.length}`);
        if (completed.length > 0) {
            const avgScore = completed.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completed.length;
            console.log(`Average score: ${avgScore.toFixed(2)}%`);
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixInterviewScores();
