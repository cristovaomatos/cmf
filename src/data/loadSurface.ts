export async function loadJson<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const dataPaths = {
  europeanCnSurface: '/data/project1/european_cn_surface.json',
  europeanMolSurface: '/data/project1/european_mol_surface.json',
  americanSurface: '/data/project1/american_surface.json',
  americanFreeBoundary: '/data/project1/american_free_boundary.json',
  europeanProfiles: '/data/project1/european_profiles.json',
  americanProfiles: '/data/project1/american_profiles.json',
} as const
