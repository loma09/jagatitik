// Database lama memakai "warga" untuk akun pelapor; pengunjung publik tidak membutuhkan profil.
export function canReport(role: string | null): boolean {
  return role === "warga" || role === "pelapor" || role === "admin";
}
