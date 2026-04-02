const { execSync } = require('child_process');
try {
  execSync('npx tsc -b', { stdio: 'pipe' });
} catch (e) {
  const output = e.stdout.toString();
  const errors = output.split('\n').filter(l => l.includes('error TS'));
  console.log(errors.join('\n'));
}
