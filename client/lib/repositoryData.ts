export interface Repository {
  id: string;
  name: string;
  owner: string;
  language: string;
  stars: number;
  forks: number;
  description: string;
  activity: number;
  growth: number;
  health: number;
  community: number;
  year: number;
  url: string;
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
    const response = await fetch('/repositories.json');
    if (!response.ok) {
      throw new Error(`Failed to load repositories: ${response.statusText}`);
    }
    
    const data: RepositoryDataset = await response.json();
    
    // Validate data structure
    if (!data.repositories || !Array.isArray(data.repositories)) {
      throw new Error('Invalid repository data format');
    }
    
    // Cache the data
    cachedData = data;
    
    return data;
  } catch (error) {
    console.error('Error loading repository data:', error);
    throw error;
  }
}

export function generateParticlesFromRepositories(
  repositories: Repository[],
  targetCount: number = 25000
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
    const replicationsNeeded = Math.max(1, Math.floor(replicationFactor * (1 - basePopularity)));
    
    for (let i = 0; i < replicationsNeeded && particles.length < targetCount; i++) {
      particles.push({
        ...repo,
        id: `${repo.id}-var-${i}`
      });
    }
  });
  
  // Fill remaining slots if needed
  while (particles.length < targetCount) {
    const randomRepo = repositories[Math.floor(Math.random() * repositories.length)];
    particles.push({
      ...randomRepo,
      id: `${randomRepo.id}-fill-${particles.length}`
    });
  }
  
  return particles.slice(0, targetCount);
}

export function getLanguageColor(language: string): number {
  const colorMap: Record<string, number> = {
    'JavaScript': 0x4a90e2,
    'TypeScript': 0x2b7489,
    'Python': 0x3572a5,
    'Go': 0x00d9ff,
    'Rust': 0xff6b35,
    'Ruby': 0xe85d75,
    'Java': 0xb07219,
    'C++': 0xf34b7d,
    'C#': 0x178600,
    'PHP': 0x4f5d95,
    'Swift': 0xffac45,
    'Kotlin': 0xf18e33,
  };
  
  return colorMap[language] || 0xf2f2f2;
}

export function calculatePopularity(stars: number): number {
  // Normalize stars to 0-1 range using logarithmic scale
  // Max stars ~250k (React/Vue level)
  const normalized = Math.log(stars + 1) / Math.log(250000);
  return Math.min(1, Math.max(0, normalized));
}
