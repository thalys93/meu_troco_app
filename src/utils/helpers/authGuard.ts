/**
 * UIDs que podem acessar recursos de backoffice (listar todos os usuários, etc.).
 * Lidos de VITE_ADMIN_UIDS (separados por vírgula). Devem coincidir com allow read em firestore.rules para /users.
 */
const raw = import.meta.env.VITE_ADMIN_UIDS;
export const whitelist: string[] = typeof raw === "string"
  ? raw.split(",").map((s) => s.trim()).filter(Boolean)
  : [];