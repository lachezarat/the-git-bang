import { useState, useEffect } from 'react';
import { loadRepositories, type Repository, type RepositoryDataset } from '../lib/repositoryData';

export function useRepositoryData() {
  const [data, setData] = useState<RepositoryDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const repositories = await loadRepositories();
        
        if (mounted) {
          setData(repositories);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load data'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
