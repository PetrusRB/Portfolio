import { useState } from "./state";

interface QueryState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useQuery<T>(fetcher: () => Promise<T>) {
  const state = useState<QueryState<T>>({ data: null, error: null, loading: false });

  async function refetch(): Promise<void> {
    state.set({ data: null, error: null, loading: true });
    try {
      const data = await fetcher();
      state.set({ data, error: null, loading: false });
    } catch (err) {
      state.set({
        data: null,
        error: err instanceof Error ? err.message : "Erro desconhecido",
        loading: false,
      });
    }
  }

  return {
    get data() { return state.get().data; },
    get error() { return state.get().error; },
    get loading() { return state.get().loading; },
    refetch,
    subscribe: state.subscribe,
  };
}
