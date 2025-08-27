// CURSOR AI BEHAVIORAL CONTROL PROTOCOL
// Mandatory operating system for systematic development

const CursorControl = {
  maxLinesPerChange: 25,
  maxFilesPerTask: 1,
  verificationRequired: true,
  proofOfWork: 'screenshot_or_terminal_output',
  
  beforeAnyChange: () => {
    console.log(`[${new Date().toISOString()}] Starting change...`);
    return require('child_process').execSync('git status').toString();
  },
  
  afterEveryChange: () => {
    const diff = require('child_process').execSync('git diff --stat').toString();
    if (diff.includes('files changed') && parseInt(diff) > 50) {
      throw new Error('VIOLATION: Changed more than 50 lines! Rollback required.');
    }
    require('child_process').execSync('git add . && git commit -m "micro-checkpoint"');
    return true;
  }
};

// ENFORCE: Run this check every 10 minutes
setInterval(() => {
  console.log('[HEARTBEAT] Still working, not frozen');
  try {
    const currentTask = require('fs').readFileSync('CURRENT_TASK.txt', 'utf8');
    console.log('[CURRENT] ' + currentTask);
  } catch (e) {
    console.log('[CURRENT] No current task file found');
  }
}, 600000);

// Export for use in development
module.exports = CursorControl;
