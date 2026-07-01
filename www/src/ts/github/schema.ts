import { z } from "zod";

export const GitHubRepoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.string().url(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
});

export type GitHubRepo = z.infer<typeof GitHubRepoSchema>;

export const GitHubRepoArraySchema = z.array(GitHubRepoSchema);
