// utils/progression.js

export function calculateDaysSober(sobrietyDate) {
  if (!sobrietyDate) return 0;

  const start = new Date(sobrietyDate).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);

  return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
}

export function checkLevelUnlock(level, user = {}) {
  if (!level) return { unlocked: false, progress: { days: 0, streak: 0, xp: 0, modules: 0 } };

  const daysSober = calculateDaysSober(user.sobrietyDate);
  const currentStreak = user.currentStreak || 0;
  const xp = user.xp || 0;
  const completedModules = user.completedModules || [];

  const { minDaysSober = 0, minStreak = 0, minXP = 0, requiredModules = [] } = level.requirements || {};

  const meetsDays = daysSober >= minDaysSober;
  const meetsStreak = currentStreak >= minStreak;
  const meetsXP = xp >= minXP;
  const meetsModules = requiredModules.every((m) => completedModules.includes(m));

  const progress = {
    days: minDaysSober ? Math.min(daysSober / minDaysSober, 1) : 1,
    streak: minStreak ? Math.min(currentStreak / minStreak, 1) : 1,
    xp: minXP ? Math.min(xp / minXP, 1) : 1,
    modules:
      requiredModules.length === 0
        ? 1
        : requiredModules.filter((m) => completedModules.includes(m)).length / requiredModules.length,
  };

  return {
    unlocked: meetsDays && meetsStreak && meetsXP && meetsModules,
    progress,
  };
}