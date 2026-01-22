#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills');

function printUsage() {
  console.log(`
Usage: npx add-skill <github-repo> [options]

Arguments:
  github-repo    GitHub repository in format: owner/repo (e.g., metalbear-co/skills)

Options:
  --skill <name>  Install only a specific skill from the repository
  --help          Show this help message

Examples:
  npx add-skill metalbear-co/skills
  npx add-skill vercel-labs/agent-skills
  npx add-skill metalbear-co/skills --skill mirrord-config
`);
}

function parseArgs(args) {
  const result = { repo: null, skill: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help' || args[i] === '-h') {
      printUsage();
      process.exit(0);
    } else if (args[i] === '--skill' && args[i + 1]) {
      result.skill = args[++i];
    } else if (!args[i].startsWith('-') && !result.repo) {
      result.repo = args[i];
    }
  }

  return result;
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    const request = (urlToFetch) => {
      https.get(urlToFetch, {
        headers: {
          'User-Agent': 'add-skill-cli',
          'Accept': 'application/vnd.github+json'
        }
      }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          request(response.headers.location);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

function findSkillDirs(dir) {
  const skills = [];

  function walk(currentDir, depth = 0) {
    if (depth > 3) return; // Don't go too deep

    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const fullPath = path.join(currentDir, entry.name);

        // Check if this directory contains .claude-plugin/plugin.json
        const pluginJsonPath = path.join(fullPath, '.claude-plugin', 'plugin.json');
        if (fs.existsSync(pluginJsonPath)) {
          try {
            const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
            skills.push({
              name: pluginJson.name || entry.name,
              path: fullPath,
              description: pluginJson.description || ''
            });
          } catch (e) {
            // Skip invalid plugin.json
          }
        } else {
          // Continue searching in subdirectories
          walk(fullPath, depth + 1);
        }
      }
    } catch (e) {
      // Skip directories we can't read
    }
  }

  walk(dir);
  return skills;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip .git directories and zip files
    if (entry.name === '.git' || entry.name.endsWith('.zip')) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const { repo, skill: specificSkill } = parseArgs(args);

  if (!repo) {
    console.error('Error: Please provide a GitHub repository (e.g., metalbear-co/skills)\n');
    printUsage();
    process.exit(1);
  }

  // Validate repo format
  if (!repo.includes('/') || repo.split('/').length !== 2) {
    console.error('Error: Repository must be in format: owner/repo\n');
    process.exit(1);
  }

  const [owner, repoName] = repo.split('/');
  const tarballUrl = `https://api.github.com/repos/${owner}/${repoName}/tarball`;

  console.log(`\nDownloading ${repo}...`);

  // Create temp directory
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'add-skill-'));
  const tarballPath = path.join(tempDir, 'repo.tar.gz');

  try {
    // Download tarball
    await downloadFile(tarballUrl, tarballPath);

    console.log('Extracting archive...');

    // Extract tarball
    execSync(`tar -xzf "${tarballPath}" -C "${tempDir}"`, { stdio: 'pipe' });

    // Find extracted directory (GitHub adds prefix like owner-repo-hash)
    const extractedDirs = fs.readdirSync(tempDir).filter(f =>
      fs.statSync(path.join(tempDir, f)).isDirectory()
    );

    if (extractedDirs.length === 0) {
      throw new Error('Failed to extract repository');
    }

    const extractedDir = path.join(tempDir, extractedDirs[0]);

    // Find all skills
    let skills = findSkillDirs(extractedDir);

    if (skills.length === 0) {
      console.log('\nNo skills found in repository.');
      console.log('Skills must have a .claude-plugin/plugin.json file.');
      process.exit(1);
    }

    // Filter if specific skill requested
    if (specificSkill) {
      skills = skills.filter(s => s.name === specificSkill);
      if (skills.length === 0) {
        console.error(`\nError: Skill "${specificSkill}" not found in repository.`);
        process.exit(1);
      }
    }

    console.log(`\nFound ${skills.length} skill(s):`);
    skills.forEach(s => console.log(`  - ${s.name}: ${s.description}`));

    // Create skills directory
    fs.mkdirSync(SKILLS_DIR, { recursive: true });

    console.log(`\nInstalling to ${SKILLS_DIR}:`);

    // Copy each skill
    for (const skill of skills) {
      const destPath = path.join(SKILLS_DIR, skill.name);

      // Remove existing if present
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true });
      }

      copyDir(skill.path, destPath);
      console.log(`  - ${skill.name}`);
    }

    console.log(`\nDone! Installed ${skills.length} skill(s).`);
    console.log('\nYou can now use these skills in Claude Code.');

  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  } finally {
    // Cleanup temp directory
    try {
      fs.rmSync(tempDir, { recursive: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

main();
