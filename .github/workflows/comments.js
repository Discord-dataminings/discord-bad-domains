// By Discord Dataminings // 
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = github.getOctokit(token);

    // Get the commit SHA from the workflow event
    const commitSha = github.context.payload.after;

    // Get the repository and owner from the workflow event
    const { repo, owner } = github.context.repo;

    // Get the commit diff
    const { data: commit } = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: commitSha
    });

    // Check if usernames.txt file was modified in the commit
    const usernamesFile = commit.files.find(file => file.filename === 'domains.txt');
    if (!usernamesFile) {
      console.log('domains.txt was not modified in the commit.');
      return;
    }

    // Get the diff patch of the usernames.txt file
    const { data: diff } = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: commitSha
    });

    const patch = diff.files.find(file => file.filename === 'domains.txt').patch;

    // Extract added and removed usernames from the diff
    const addedUsernames = [];
    const removedUsernames = [];

    const lines = patch.split('\n');
    for (const line of lines) {
      if (line.startsWith('+')) {
        const username = line;
        addedUsernames.push(username);
      } else if (line.startsWith('-')) {
        const username = line;
        removedUsernames.push(username);
      }
    }

    // Generate the markdown comment
    let comment = `# Pomelo usernames taken list:\n\n`;
    if (addedUsernames.length > 0) {
      comment += `## Added:\n\`\`\`diff\n${addedUsernames.map(username => `${username}`).join('\n')}\n\`\`\`\n`;
    }
    if (removedUsernames.length > 0) {
      comment += `## Removed:\n\`\`\`diff\n${removedUsernames.map(username => `${username}`).join('\n')}\n\`\`\`\n`;
    }

    // Create a comment on the commit
    await octokit.rest.repos.createCommitComment({
      owner,
      repo,
      commit_sha: commitSha,
      body: comment
    });

    console.log('Comment created successfully.');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
