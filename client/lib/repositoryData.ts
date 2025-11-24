import Papa from "papaparse";


export interface Repository {
  id: string; // owner/name
  name: string;
  owner: string;
  stars: number;
  createdAt: number; // timestamp
  primaryLanguage: string;
  color: number; // Hex color for visualization
  positionAngle: number;
  positionRadius: number;
}

export interface RepositoryDetails {
  id: string;
  description: string;
  topics: string[];
  languages: string[];
  forks: number;
  commits: number;
  watchers: number;
  openPrs: number;
  contributors: number;
}

export interface RepositoryDataset {
  repositories: Repository[];
}

let cachedData: RepositoryDataset | null = null;

// Language color mapping
export const LANGUAGE_COLORS: Record<string, number> = {
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
  HTML: 0xe34c26,
  CSS: 0x563d7c,
  Shell: 0x89e051,
  C: 0x555555,
  Unknown: 0xf2f2f2
};

export function getLanguageColor(language: string): number {
  return LANGUAGE_COLORS[language] || 0xf2f2f2; // Default to grey/white
}

export async function loadRepositories(): Promise<RepositoryDataset> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch("/app_viz_data.json");
    if (!response.ok) {
      throw new Error(`Failed to load repositories: ${response.statusText}`);
    }

    const data = await response.json();
    const { ids, dates, stars, lang_ids, legend } = data;

    const repositories: Repository[] = [];
    const count = ids.length;

    for (let i = 0; i < count; i++) {
      const fullId = ids[i];
      const [owner, name] = fullId.split('/');
      const dateStr = dates[i];
      const starCount = stars[i];
      const langId = lang_ids[i];
      const language = legend[langId.toString()] || "Unknown";

      // Parse date
      const date = new Date(dateStr);
      const timestamp = date.getTime();

      repositories.push({
        id: fullId,
        name: name || fullId,
        owner: owner || "Unknown",
        stars: starCount,
        createdAt: timestamp,
        primaryLanguage: language,
        color: getLanguageColor(language),
        positionAngle: Math.random() * Math.PI * 2,
        positionRadius: Math.sqrt(Math.random())
      });
    }

    const dataset: RepositoryDataset = { repositories };
    cachedData = dataset;
    return dataset;

  } catch (error) {
    console.error("Error loading repository data:", error);
    throw error;
  }
}

// Load repository details from static JSON file
let repoDetailsData: Record<string, RepositoryDetails> | null = null;

export async function fetchRepositoryDetails(repoId: string): Promise<RepositoryDetails | null> {
  // Load the entire JSON file once and cache it
  if (!repoDetailsData) {
    try {
      const response = await fetch('/repo-details.json');
      if (!response.ok) {
        console.error('Failed to load repository details JSON');
        return null;
      }
      repoDetailsData = await response.json();
      console.log(`✅ Loaded ${Object.keys(repoDetailsData).length} repository details`);
    } catch (error) {
      console.error('Error loading repository details:', error);
      return null;
    }
  }

  // Return the specific repo data
  return repoDetailsData[repoId] || null;
}

export function calculatePopularity(stars: number): number {
  // Normalize stars to 0-1 range using logarithmic scale
  // Max stars ~400k
  const normalized = Math.log(stars + 1) / Math.log(400000);
  return Math.min(1, Math.max(0, normalized));
}

