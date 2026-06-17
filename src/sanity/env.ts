export const apiVersion = "2024-01-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

const PLACEHOLDER_IDS = new Set([
  "",
  "placeholder",
  "your_project_id",
  "your_project_id_here",
  "missing-project-id",
  "not-configured",
]);

/** Sanity project IDs may only contain a-z, 0-9 and dashes */
export function isValidSanityProjectId(id: string): boolean {
  return /^[a-z0-9-]+$/.test(id) && id.length >= 3;
}

export const isSanityConfigured =
  !!projectId &&
  !PLACEHOLDER_IDS.has(projectId) &&
  isValidSanityProjectId(projectId);
