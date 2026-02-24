#!/usr/bin/env node

/**
 * Start script for TimeSheet application
 * Starts both backend and frontend servers
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';

console.log('🚀 Starting TimeSheet Application...\n');

// Start backend
console.log('📦 Starting Backend Server (Port 4000)...');
const backend = spawn(isWindows ? 'npm.cmd' : 'npm', ['--prefix', path.join(__dirname, 'backend'), 'run', 'dev'], {
  stdio: 'inherit',
  shell: isWindows,
});

// Start frontend
console.log('📦 Starting Frontend Server (Port 5173)...');
const frontend = spawn(isWindows ? 'npm.cmd' : 'npm', ['--prefix', path.join(__dirname, 'frontend'), 'run', 'dev'], {
  stdio: 'inherit',
  shell: isWindows,
});

console.log('\n✅ Both servers starting...');
console.log('Backend:  http://localhost:4000');
console.log('Frontend: http://localhost:5173\n');

// Handle exit
const exitHandler = () => {
  console.log('\n\n⛔ Stopping servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
};

process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);

// Log any errors
backend.on('error', (err) => console.error('Backend error:', err));
frontend.on('error', (err) => console.error('Frontend error:', err));
