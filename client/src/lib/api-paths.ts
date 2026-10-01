// Next.js API routes (src/app/api/...) that the frontend calls.
export const API_PATHS = {
  login: "/api/login",
  logout: "/api/logout",
  extractTikTok: "/api/extract-tiktok",
  recipes: "/api/recipes",
  pendingVideos: "/api/pending-videos",
  deletePendingVideo: (id: string) => `/api/delete-pending-video/${id}`,
} as const;

// The recipe server running on your PC (server/ workspace). Its route paths are in
// LOCAL_SERVER_PATHS from @rag-ai/shared, since the server defines the same routes.
export const LOCAL_SERVER_URL = "http://localhost:8080";
