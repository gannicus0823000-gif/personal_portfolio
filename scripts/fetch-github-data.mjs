import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const configText = readFileSync(join(root, 'gitprofile.config.ts'), 'utf8');

const githubUsername = configText.match(
  /github:\s*\{[^}]*username:\s*['"]([^'"]+)['"]/,
)?.[1];

const profileBlock = configText.match(/profile:\s*\{[\s\S]*?\n  \},/)?.[0] ?? '';
const profileName = profileBlock.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
const profileBio = profileBlock.match(/bio:\s*['"]([^'"]+)['"]/)?.[1];

if (!githubUsername) {
  console.warn('fetch-github-data: could not read github.username, skipping');
  process.exit(0);
}

const displayProjects = !/projects:\s*\{[\s\S]*?github:\s*\{[^}]*display:\s*false/.test(
  configText,
);

const mode = configText.match(
  /projects:\s*\{[\s\S]*?github:\s*\{[\s\S]*?mode:\s*['"](\w+)['"]/,
)?.[1] ?? 'automatic';

const sortBy =
  configText.match(/automatic:\s*\{[\s\S]*?sortBy:\s*['"](\w+)['"]/)?.[1] ??
  'stars';

const limit = Number(
  configText.match(/automatic:\s*\{[\s\S]*?limit:\s*(\d+)/)?.[1] ?? 8,
);

const excludeForks = /exclude:\s*\{[\s\S]*?forks:\s*true/.test(configText);

const manualBlock = configText.match(
  /manual:\s*\{[\s\S]*?projects:\s*\[([\s\S]*?)\]/,
)?.[1];

const manualProjects = manualBlock
  ? [...manualBlock.matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1])
  : [];

const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.warn(
    'fetch-github-data: GITHUB_TOKEN not set, skipping (runtime will use GitHub API)',
  );
  process.exit(0);
}

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  Authorization: `Bearer ${token}`,
};

async function githubFetch(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status} for ${url}: ${body}`);
  }
  return response.json();
}

async function fetchProjects(publicRepoCount) {
  if (!displayProjects) {
    return [];
  }

  if (mode === 'manual') {
    if (manualProjects.length === 0) {
      return [];
    }
    const repos = manualProjects.map((project) => `+repo:${project}`).join('');
    const url = `https://api.github.com/search/repositories?q=${repos}+fork:true&type=Repositories&per_page=${manualProjects.length}`;
    const data = await githubFetch(url);
    return data.items ?? [];
  }

  if (publicRepoCount === 0) {
    return [];
  }

  const url = `https://api.github.com/search/repositories?q=user:${githubUsername}+fork:${!excludeForks}&sort=${sortBy}&per_page=${limit}&type=Repositories`;
  const data = await githubFetch(url);
  return data.items ?? [];
}

try {
  const user = await githubFetch(
    `https://api.github.com/users/${githubUsername}`,
  );
  const projects = await fetchProjects(user.public_repos ?? 0);

  const output = {
    profile: {
      avatar: user.avatar_url,
      name: profileName || user.name || ' ',
      bio: profileBio || user.bio || '',
      location: user.location || '',
      company: user.company || '',
    },
    projects,
  };

  const outDir = join(root, 'public');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, 'github-data.json'),
    `${JSON.stringify(output, null, 2)}\n`,
  );

  console.log(
    `fetch-github-data: wrote profile for ${githubUsername} (${projects.length} projects)`,
  );
} catch (error) {
  console.error('fetch-github-data failed:', error.message);
  process.exit(1);
}
