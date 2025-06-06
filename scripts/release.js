#!/usr/bin/env node

/**
 * Release script for modulink-ts
 * 
 * This script helps with version management and publishing preparation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get command line arguments
const args = process.argv.slice(2);
const versionType = args[0]; // major, minor, patch
const message = args[1] || 'Release version';

if (!versionType || !['major', 'minor', 'patch'].includes(versionType)) {
  console.error('Usage: node scripts/release.js <major|minor|patch> [commit message]');
  console.error('Example: node scripts/release.js patch "Fix bug in type definitions"');
  process.exit(1);
}

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    if (output.trim()) {
      console.log(output.trim());
    }
    return output;
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    console.error(error.message);
    process.exit(1);
  }
}

function updateChangelog(version) {
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  
  const today = new Date().toISOString().split('T')[0];
  const updatedChangelog = changelog.replace(
    '## [Unreleased]',
    `## [Unreleased]\n\n## [${version}] - ${today}`
  );
  
  fs.writeFileSync(changelogPath, updatedChangelog);
  console.log(`📝 Updated CHANGELOG.md for version ${version}`);
}

async function main() {
  console.log('🚀 Starting release process...\n');
  
  // Check if working directory is clean
  try {
    runCommand('git diff --exit-code', 'Checking for uncommitted changes');
    runCommand('git diff --cached --exit-code', 'Checking for staged changes');
  } catch (error) {
    console.error('❌ Working directory is not clean. Please commit or stash changes first.');
    process.exit(1);
  }
  
  // Run tests
  runCommand('npm run test:run', 'Running tests');
  
  // Build project
  runCommand('npm run build', 'Building project');
  
  // Run type checking
  runCommand('npm run typecheck', 'Running type checking');
  
  // Bump version
  const versionOutput = runCommand(`npm version ${versionType} --no-git-tag-version`, `Bumping ${versionType} version`);
  const newVersion = versionOutput.trim().replace('v', '');
  
  // Update changelog
  updateChangelog(newVersion);
  
  // Stage changes
  runCommand('git add package.json package-lock.json CHANGELOG.md', 'Staging version changes');
  
  // Commit changes
  runCommand(`git commit -m "chore: release v${newVersion} - ${message}"`, 'Committing version changes');
  
  // Create git tag
  runCommand(`git tag -a v${newVersion} -m "Release v${newVersion}"`, 'Creating git tag');
  
  console.log('\n✅ Release preparation completed!');
  console.log(`📦 Version: ${newVersion}`);
  console.log('\nNext steps:');
  console.log('1. Review the changes');
  console.log('2. Push to repository: git push && git push --tags');
  console.log('3. Create GitHub release from the tag');
  console.log('4. Publish to npm: npm publish');
  
  console.log('\nOr run the complete publish process:');
  console.log('git push && git push --tags && npm publish');
}

main().catch(error => {
  console.error('❌ Release process failed:', error);
  process.exit(1);
});
