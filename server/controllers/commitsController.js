const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const router = express.Router();

let Octokit;

async function loadOctokit() {
  if (!Octokit) {
    const { Octokit: OctokitModule } = await import('@octokit/rest');
    Octokit = OctokitModule;
  }
}

router.post('/', async (req, res) => {

  try {
    fs.rmSync('/Users/love1ace/Library/Mobile Documents/com~apple~CloudDocs/projects/Auto_Commit/server/controllers/repo/love1ace', { recursive: true });
  } catch (err) {
  }

  try {
    if (!req.isAuthenticated() || !req.user || !req.user.accessToken) {
      return res.status(401).json({ error: 'Unauthorized: No access token provided.' });
    }

    await loadOctokit();
    const octokit = new Octokit({
      auth: req.user.accessToken
    });

    const { githubId, startDate, endDate, minCommits, maxCommits } = req.body;
    const minCommitsInt = parseInt(minCommits, 10);
    const maxCommitsInt = parseInt(maxCommits, 10);

    const user = await octokit.users.getAuthenticated();
    const userName = user.data.login;
    const userEmail = user.data.email || `${userName}@users.noreply.github.com`;

    const repoName = 'Auto-commit.com';
    const token = req.user.accessToken;
    const repoUrl = `https://${userName}:${token}@github.com/${githubId}/${repoName}.git`;

    const userRepoDir = path.join(__dirname, 'repo', githubId);
    const userFilePath = path.join(userRepoDir, `${githubId}.txt`);

    if (fs.existsSync(userRepoDir)) {
      fs.rmSync(userRepoDir, { recursive: true, force: true });
    }

    fs.mkdirSync(userRepoDir, { recursive: true });

    await execPromise(`git clone "${repoUrl}" "${userRepoDir}"`);

    const totalCommits = await createCommits(userRepoDir, userFilePath, startDate, endDate, minCommitsInt, maxCommitsInt, userName, userEmail);

    await execPromise(`cd "${userRepoDir}" && git push "${repoUrl}" main`);

    // fs.writeFileSync(userFilePath, ''); txt 내용 지우는 코드

    console.log(`${githubId} successfully pushed ${totalCommits} commits.`);
    res.status(200).json({ totalCommits, repoUrl });
  } catch (error) {
    console.error('Error creating or pushing commits:', error);
    res.status(500).send('Error creating or pushing commits');
  }
});

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function createCommits(userRepoDir, userFilePath, startDate, endDate, minCommits, maxCommits, userName, userEmail) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const numDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  let totalCommits = 0;

  await execPromise(`cd "${userRepoDir}" && git reset --hard`);

  for (let day = 0; day < numDays; day++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + day);

    const numCommits = Math.floor(Math.random() * (maxCommits - minCommits + 1)) + minCommits;

    for (let i = 0; i < numCommits; i++) {
      const randomHash = crypto.randomBytes(20).toString('hex');
      fs.appendFileSync(userFilePath, randomHash + '\n');

      const statusCmd = `cd "${userRepoDir}" && git status --porcelain`;
      const hasChanges = await execPromise(statusCmd).then(output => output.trim().length > 0);

      if (hasChanges) {
        const commitCmd = `
          cd "${userRepoDir}" &&
          git config user.name "${userName}" &&
          git config user.email "${userEmail}" &&
          git add . &&
          git commit -m "Auto-commit.com ${new Date().toISOString()}" --date="${currentDate.toISOString()}"
        `;
        await execPromise(commitCmd);
        totalCommits++;
      } else {
        console.log(`No changes detected for date ${currentDate.toISOString().split('T')[0]}, skipping commit.`);
      }
    }
  }

  return totalCommits;
}

module.exports = router;