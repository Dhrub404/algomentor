const TopicPerformance = require("../models/TopicPerformance");
const SystemSettings = require("../models/SystemSettings");

/**
 * Revision Engine
 * Rule:
 * If lastPracticed > revisionAlertDays AND subtopic was previously studied
 * Then set revisionNeeded = true
 * Bypassed/ignored if revisionAlertsEnabled is false globally.
 */
const runRevisionCheck = async (userId, studiedTopics) => {
  if (!userId || !studiedTopics || studiedTopics.length === 0) {
    return [];
  }

  // Fetch global settings
  let alertDays = 14;
  let alertsEnabled = true;

  try {
    const settings = await SystemSettings.findOne({});
    if (settings) {
      alertDays = settings.revisionAlertDays;
      alertsEnabled = settings.revisionAlertsEnabled;
    }
  } catch (err) {
    console.warn("Could not load system settings for revision alerts:", err.message);
  }

  // If revision alerts are toggled off globally, return no alerts and set all to false
  if (!alertsEnabled) {
    await TopicPerformance.updateMany(
      { userId, subtopic: { $in: studiedTopics } },
      { $set: { revisionNeeded: false } }
    );
    return [];
  }

  const performances = await TopicPerformance.find({
    userId,
    subtopic: { $in: studiedTopics }
  });

  const thresholdDate = new Date(Date.now() - alertDays * 24 * 60 * 60 * 1000);
  const alerts = [];

  for (const perf of performances) {
    let revisionNeeded = false;

    if (perf.lastPracticed) {
      const lastPracticedDate = new Date(perf.lastPracticed);
      if (lastPracticedDate < thresholdDate) {
        revisionNeeded = true;
      }
    } else {
      // If they studies it but never practiced, it is also a candidate for revision / practice
      revisionNeeded = true;
    }

    if (perf.revisionNeeded !== revisionNeeded) {
      perf.revisionNeeded = revisionNeeded;
      await perf.save();
    }

    if (revisionNeeded) {
      alerts.push({
        subtopic: perf.subtopic,
        topic: perf.topic,
        lastPracticed: perf.lastPracticed,
        weaknessScore: perf.weaknessScore
      });
    }
  }

  return alerts;
};

module.exports = { runRevisionCheck };
