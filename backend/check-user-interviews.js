import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Interview from './src/models/Interview.js';
import User from './src/models/User.js';

dotenv.config();

async function checkUserInterviews() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const currentUserId = '696fa7812d80653152b60ec3'; // From the token

        // Get all users
        const users = await User.find({});
        console.log(`\n👥 Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`  - ${u._id}: ${u.name} (${u.email})`);
        });

        // Get all interviews
        const allInterviews = await Interview.find({});
        console.log(`\n📊 Total interviews: ${allInterviews.length}`);

        // Group interviews by user
        const interviewsByUser = {};
        allInterviews.forEach(interview => {
            const userId = interview.user.toString();
            if (!interviewsByUser[userId]) {
                interviewsByUser[userId] = [];
            }
            interviewsByUser[userId].push(interview);
        });

        console.log(`\n📈 Interviews by user:`);
        for (const [userId, interviews] of Object.entries(interviewsByUser)) {
            const user = users.find(u => u._id.toString() === userId);
            const userName = user ? user.name : 'Unknown';
            const completed = interviews.filter(i => i.status === 'completed').length;
            console.log(`  ${userId} (${userName}): ${interviews.length} total, ${completed} completed`);
        }

        // Check current user
        console.log(`\n🔍 Current user (${currentUserId}):`);
        const currentUserInterviews = await Interview.find({ user: currentUserId });
        console.log(`  Total interviews: ${currentUserInterviews.length}`);
        console.log(`  Completed: ${currentUserInterviews.filter(i => i.status === 'completed').length}`);

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUserInterviews();
