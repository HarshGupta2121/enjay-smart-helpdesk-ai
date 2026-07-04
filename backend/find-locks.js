const { execSync } = require('child_process');

try {
  // Fetch all node processes in Windows
  const output = execSync('wmic process where "name=\'node.exe\'" get processid,commandline').toString();

  const lines = output.split('\n');

  for (const line of lines) {
    if (line.includes('node.exe') && line.includes('backend') && !line.includes('claude') && !line.includes('find-locks')) {
      const match = line.match(/\s+(\d+)\s*$/);
      if (match) {
        const pid = match[1];
        console.log(`Killing PID ${pid}...`);
        execSync(`taskkill /F /PID ${pid}`);
      }
    }
  }
} catch (error) {
  // Ignore
}