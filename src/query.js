import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: false, // Loading state is handled in code
      useErrorBoundary: false, // Errors are thrown to the boundary in code
      staleTime: 5000, // Queries become stale after 5 seconds
      getNextPageParam: (lastPage) =>
        lastPage.next_offset && lastPage.next_offset > 0
          ? lastPage.next_offset
          : undefined,
    },
  },
});

export default queryClient;
