import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import type { FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initZama = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Initializing FHE SDK...');
        await initSDK();
        console.log('Creating FHE instance...');
        const zamaInstance = await createInstance(SepoliaConfig);

        if (mounted) {
          setInstance(zamaInstance);
          console.log('FHE instance initialized successfully');
        }
      } catch (err) {
        console.error('Failed to initialize Zama instance:', err);
        if (mounted) {
          setError('Failed to initialize encryption service');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initZama();

    return () => {
      mounted = false;
    };
  }, []);

  return { instance, isLoading, error };
}
