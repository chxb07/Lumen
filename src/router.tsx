import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30, // cache is considered fresh for 30 seconds
        gcTime: 1000 * 60 * 5, // keep unused data in memory for 5 minutes
        refetchOnWindowFocus: false, // prevent continuous querying on window focus transitions
        retry: 1, // retry once on network failure
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
