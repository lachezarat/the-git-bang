// Minimal data for visualization (loaded from BigQuery JSON)
export interface Repository {
  id: string;
  name: string;
  owner: string;
  language: string;
  stars: number;
  year: number;
}

// Full details fetched from GitHub API on-demand
export interface RepositoryDetails extends Repository {
  forks: number;
  description: string;
  activity: number;
  growth: number;
  health: number;
  community: number;
  url: string;
  openIssues?: number;
  watchers?: number;
  createdAt?: string;
}

export interface RepositoryDataset {
  repositories: Repository[];
}

let cachedData: RepositoryDataset | null = null;

export async function loadRepositories(): Promise<RepositoryDataset> {
  // Return cached data if available
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch("/repositories.json");
    if (!response.ok) {
      throw new Error(`Failed to load repositories: ${response.statusText}`);
    }

    const data: RepositoryDataset = await response.json();

    // Validate data structure
    if (!data.repositories || !Array.isArray(data.repositories)) {
      throw new Error("Invalid repository data format");
    }

    // Cache the data
    cachedData = data;

    return data;
  } catch (error) {
    console.error("Error loading repository data:", error);
    throw error;
  }
}

export function generateParticlesFromRepositories(
  repositories: Repository[],
  targetCount: number = 25000,
): Repository[] {
  // If we have fewer repos than particles, replicate with variation
  const particles: Repository[] = [];

  // Calculate how many times to replicate each repo
  const replicationFactor = Math.ceil(targetCount / repositories.length);

  repositories.forEach((repo) => {
    // Add the original
    particles.push(repo);

    // Add variations for smaller repos to reach target count
    const basePopularity = Math.pow(repo.stars / 250000, 0.33);
    const replicationsNeeded = Math.max(
      1,
      Math.floor(replicationFactor * (1 - basePopularity)),
    );

    for (
      let i = 0;
      i < replicationsNeeded && particles.length < targetCount;
      i++
    ) {
      particles.push({
        ...repo,
        id: `${repo.id}-var-${i}`,
      });
    }
  });

  // Fill remaining slots if needed
  while (particles.length < targetCount) {
    const randomRepo =
      repositories[Math.floor(Math.random() * repositories.length)];
    particles.push({
      ...randomRepo,
      id: `${randomRepo.id}-fill-${particles.length}`,
    });
  }

  // Sort by creation year to show chronological progression
  particles.sort((a, b) => {
    // Primary sort: by year
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    // Secondary sort: by stars (popular repos first within same year)
    return b.stars - a.stars;
  });

  return particles.slice(0, targetCount);
}

export function getLanguageColor(language: string): number {
  const colorMap: Record<string, number> = {
    JavaScript: 0x4a90e2,
    TypeScript: 0x2b7489,
    Python: 0x3572a5,
    Go: 0x00d9ff,
    Rust: 0xff6b35,
    Ruby: 0xe85d75,
    Java: 0xb07219,
    "C++": 0xf34b7d,
    "C#": 0x178600,
    PHP: 0x4f5d95,
    Swift: 0xffac45,
    Kotlin: 0xf18e33,
  };

  return colorMap[language] || 0xf2f2f2;
}

export function calculatePopularity(stars: number): number {
  // Normalize stars to 0-1 range using logarithmic scale
  // Max stars ~250k (React/Vue level)
  const normalized = Math.log(stars + 1) / Math.log(250000);
  return Math.min(1, Math.max(0, normalized));
}

// Cache for GitHub API responses
const apiCache = new Map<string, RepositoryDetails>();

/**
 * Fetch full repository details from GitHub API
 * Uses caching to avoid redundant API calls
 */
export async function fetchRepositoryDetails(
  repo: Repository,
): Promise<RepositoryDetails> {
  const cacheKey = `${repo.owner}/${repo.name}`;

  // Check cache first
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey)!;
  }

  try {
    // Fetch from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.name}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Add your GitHub token here for higher rate limits (optional)
          // 'Authorization': 'token YOUR_GITHUB_TOKEN'
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Calculate derived metrics from GitHub data
    const totalIssues = data.open_issues_count + (data.closed_issues_count || 0);
    const health = totalIssues > 0
      ? Math.round(((data.closed_issues_count || 0) / totalIssues) * 100)
      : 95;

    // Activity based on recent updates
    const lastUpdate = new Date(data.updated_at);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    const activity = Math.max(0, Math.min(100, Math.round(100 - daysSinceUpdate / 3)));

    // Growth approximation (would need historical data for accuracy)
    const repoAge = (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
    const growth = Math.round(Math.min(100, (data.stargazers_count / repoAge) / 100));

    const details: RepositoryDetails = {
      ...repo,
      forks: data.forks_count,
      description: data.description || "No description available",
      activity,
      growth,
      health,
      community: data.subscribers_count || 0,
      url: data.html_url,
      openIssues: data.open_issues_count,
      watchers: data.watchers_count,
      createdAt: data.created_at,
      // Update stars with accurate count
      stars: data.stargazers_count,
    };

    // Cache the result
    apiCache.set(cacheKey, details);

    return details;
  } catch (error) {
    console.error(`Failed to fetch details for ${cacheKey}:`, error);

    // Return fallback data based on minimal repo info
    return {
      ...repo,
      forks: 0,
      description: "Unable to load description",
      activity: 0,
      growth: 0,
      health: 0,
      community: 0,
      url: `https://github.com/${repo.owner}/${repo.name}`,
    };
  }
}

/**
 * Clear the API cache (useful for refreshing data)
 */
export function clearApiCache(): void {
  apiCache.clear();
}
