require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Topic = require('./models/Topic');
const TopicPerformance = require('./models/TopicPerformance');
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connected');
    const user = await User.findOne({ email: 'test@algomentor.com' });
    console.log('User found:', !!user);
    if (!user) return;
    const studied = user.studiedTopics || [];
    console.log('studiedTopics length:', studied.length);
    const topics = await Topic.find({});
    console.log('Topics found:', topics.length);
    const studiedLower = studied.map((st) => st.toLowerCase());
    const subtopicToTopic = {};
    const subtopicToTotalProblems = {};
    const studiedSubtopics = new Set();
    topics.forEach((t) => {
      const topicNameLower = t.name.toLowerCase();
      t.subtopics.forEach((s) => {
        const subNameLower = s.name.toLowerCase();
        const isTopicStudied = studiedLower.some((stLower) => topicNameLower.includes(stLower) || stLower.includes(topicNameLower));
        const isSubtopicStudied = studiedLower.some((stLower) => subNameLower === stLower || subNameLower.includes(stLower) || stLower.includes(subNameLower));
        subtopicToTopic[s.name] = t.name;
        subtopicToTotalProblems[s.name] = s.problemCount || (s.problems && s.problems.length) || 5;
        if (isTopicStudied || isSubtopicStudied) {
          studiedSubtopics.add(s.name);
        }
      });
    });
    console.log('studiedSubtopics count:', studiedSubtopics.size);
    const performances = await TopicPerformance.find({ userId: user._id });
    console.log('Performance count:', performances.length);
    performances.forEach((p,i) => {
      if (i < 5) console.log('perf', i, p.subtopic, p.topic, p.masteryScore, p.weaknessScore);
    });
    const perfMap = {};
    performances.forEach((p) => {
      if (!p.subtopic) console.log('perf missing subtopic', p._id);
      perfMap[p.subtopic] = p;
    });
    for (const subName of studiedSubtopics) {
      if (!perfMap[subName]) {
        console.log('missing perf for', subName);
      }
    }
    console.log('done');
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await mongoose.disconnect();
  }
})();
