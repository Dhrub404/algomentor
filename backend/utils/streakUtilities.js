/**
 * Calculates current and best streak based on accepted submissions.
 * 
 * Rules:
 * - A day counts if at least 1 accepted (AC) submission exists on that day.
 * - Current streak continues if solved today or yesterday.
 * - Gap > 1 day breaks the streak.
 * 
 * @param {Array} submissions - User submissions
 * @returns {Object} { currentStreak, bestStreak }
 */
const calculateStreaks = (submissions = []) => {
  const acSubmissions = submissions.filter(sub => sub.result === "AC");
  if (acSubmissions.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Get unique YYYY-MM-DD date strings in user local timezone
  const dateSet = new Set();
  acSubmissions.forEach(sub => {
    const d = new Date(sub.timestamp);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      dateSet.add(`${y}-${m}-${day}`);
    }
  });

  const sortedDates = Array.from(dateSet).sort((a, b) => new Date(a) - new Date(b));
  if (sortedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  // Helper to format date as YYYY-MM-DD
  const getYYYYMMDD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const now = new Date();
  const todayStr = getYYYYMMDD(now);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getYYYYMMDD(yesterday);

  // Compute best streak (longest contiguous chain of days)
  for (let i = 0; i < sortedDates.length; i++) {
    const curr = sortedDates[i];
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diffTime = new Date(curr) - new Date(prevDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    prevDate = curr;
  }
  if (tempStreak > bestStreak) {
    bestStreak = tempStreak;
  }

  // Compute current streak
  let currentStreak = 0;
  const dateMap = new Set(sortedDates);
  if (dateMap.has(todayStr)) {
    currentStreak = 1;
    const checkDate = new Date(now);
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkStr = getYYYYMMDD(checkDate);
      if (dateMap.has(checkStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (dateMap.has(yesterdayStr)) {
    currentStreak = 1;
    const checkDate = new Date(yesterday);
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkStr = getYYYYMMDD(checkDate);
      if (dateMap.has(checkStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  // Ensure bestStreak is at least currentStreak
  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  return { currentStreak, bestStreak };
};

/**
 * Calculates number of unique problems solved today.
 * 
 * @param {Array} submissions - User submissions
 * @returns {number} Count of unique solved problems today
 */
const calculateTodaySolved = (submissions = []) => {
  const now = new Date();
  const getYYYYMMDD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const todayStr = getYYYYMMDD(now);

  const todayAcSubmissions = submissions.filter(sub => {
    if (sub.result !== "AC") return false;
    const subDateStr = getYYYYMMDD(new Date(sub.timestamp));
    return subDateStr === todayStr;
  });

  const uniqueProblems = new Set();
  todayAcSubmissions.forEach(sub => {
    uniqueProblems.add(`${sub.platform}_${sub.problemId}`);
  });

  return uniqueProblems.size;
};

module.exports = {
  calculateStreaks,
  calculateTodaySolved
};
