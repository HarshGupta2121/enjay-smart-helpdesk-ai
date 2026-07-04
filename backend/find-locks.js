const { execSync } = require('child_process');

try {
  // Fetch all node processes in Windows
  const output = execSync('wmic process where "name=\'node.exe\'" get processid,commandline').toString();

  const lines = output.split('\n');
  let found = false;

  for (const line of lines) {
    if (line.includes('node.exe') && line.includes('backend') && !line.includes('claude')) {
      // Extract PID (usually at the end of the line in WMIC output)
      const match = line.match(/\s+(\d+)\s*$/);
      if (match) {
        const pid = match[1];
        console.log(`Found lingering backend process. PID: ${pid}`);
        console.log(`Command: ${line.trim()}`);

        console.log(`Killing PID ${pid}...`);
        execSync(`taskkill /F /PID ${pid}`);
        found = true;
      }
    }
  }

  if (!found) {
    console.log('No lingering backend dev servers found.');
  }
} catch (error) {
  console.error('Error fetching processes:', error.message);
}