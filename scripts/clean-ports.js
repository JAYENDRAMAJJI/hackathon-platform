import { execSync } from 'child_process';

const PORTS = [3000, 24678];

console.log('[Port Manager] Ensuring development ports (3000, 24678) are clear...');

const currentPid = process.pid;

for (const port of PORTS) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano -p TCP | findstr :${port}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const lines = output.trim().split('\n');
      const pids = new Set();
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        // Look for LISTENING state
        if (parts.length >= 5 && parts[3] === 'LISTENING') {
          const pid = parseInt(parts[4], 10);
          if (pid && pid !== currentPid) {
            pids.add(pid);
          }
        }
      }

      for (const pid of pids) {
        try {
          console.log(`[Port Manager] Terminating stale process PID ${pid} on port ${port}...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        } catch (_) {}
      }
    } else {
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore' });
    }
  } catch (_) {
    // No process listening on this port - perfect!
  }
}

console.log('[Port Manager] Ports verified and clear.\n');
