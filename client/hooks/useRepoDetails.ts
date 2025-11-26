import { useState, useEffect } from "react";
import {
  type RepositoryDetails,
  fetchRepositoryDetails,
} from "../lib/repositoryData";

export function useRepoDetails(repoId: string) {
  const [details, setDetails] = useState<RepositoryDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDetails = async () => {
      setLoading(true);
      try {
        const data = await fetchRepositoryDetails(repoId);
        if (mounted) {
          setDetails(data);
        }
      } catch (error) {
        console.error("Failed to load repo details", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      mounted = false;
    };
  }, [repoId]);

  return { details, loading };
}
