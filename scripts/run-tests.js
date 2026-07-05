const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// 1. Get command line arguments
const args = process.argv.slice(2);

// 2. Identify test files to run
let testFiles = [];
const testsDir = path.join(__dirname, '../tests');

if (!fs.existsSync(testsDir)) {
	console.error('Error: tests directory does not exist.');
	process.exit(1);
}

const allFiles = fs.readdirSync(testsDir);
const allTestFiles = allFiles.filter(file => file.endsWith('.test.ts') || file.endsWith('.test.js'));

if (args.length === 0 || args.includes('all')) {
	testFiles = allTestFiles;
} else {
	// Map arguments to files, e.g., 'auth' -> 'auth.test.ts'
	for (const arg of args) {
		const cleanArg = arg.replace(/\.test\.(ts|js)$/, '').replace(/\.(ts|js)$/, '');
		const matched = allTestFiles.find(file => {
			const nameWithoutExt = file.replace(/\.test\.(ts|js)$/, '');
			return nameWithoutExt === cleanArg;
		});

		if (matched) {
			testFiles.push(matched);
		} else {
			console.error(`Error: No test file found matching "${arg}". Available tests:`);
			allTestFiles.forEach(f => console.error(`  - ${f.replace(/\.test\.(ts|js)$/, '')}`));
			process.exit(1);
		}
	}
}

if (testFiles.length === 0) {
	console.log('No test files found to run.');
	process.exit(0);
}

console.log(`Running tests: ${testFiles.join(', ')}`);
console.log('---------------------------------------');

let failedCount = 0;

for (const file of testFiles) {
	console.log(`\n▶️ Running test file: ${file}`);
	
	// Path to test file relative to server directory (where we run pnpm filter)
	const relativePath = path.join('..', 'tests', file);
	
	// Execute using pnpm --filter server exec ts-node -T <relativePath>
	const result = spawnSync('pnpm', [
		'--filter', 'server',
		'exec', 'ts-node',
		'-T',
		relativePath
	], {
		stdio: 'inherit',
		cwd: path.join(__dirname, '../server')
	});

	if (result.status !== 0) {
		console.error(`❌ Test file failed: ${file}`);
		failedCount++;
	} else {
		console.log(`✅ Test file completed successfully: ${file}`);
	}
}

console.log('\n=======================================');
console.log('       TEST SUITE RUNNER REPORT');
console.log('=======================================');
console.log(`Total test files run: ${testFiles.length}`);
console.log(`Passed: ${testFiles.length - failedCount}`);
console.log(`Failed: ${failedCount}`);
console.log('=======================================');

process.exit(failedCount > 0 ? 1 : 0);
