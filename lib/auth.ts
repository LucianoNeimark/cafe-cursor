import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

// Nombre de la cookie de sesión
const SESSION_COOKIE = "cafe-cursor-admin-session";

/**
 * Obtiene las credenciales del admin desde variables de entorno (lectura en runtime)
 * NOTA: Usamos .trim() para eliminar espacios/saltos de línea que pueden venir en las env vars
 */
function getAdminCredentials() {
  const isProduction = process.env.NODE_ENV === "production";
  const username = (process.env.ADMIN_USERNAME || (isProduction ? "" : "admin")).trim();
  const password = (process.env.ADMIN_PASSWORD || (isProduction ? "" : "cafecursor2024")).trim();
  const secret = (process.env.SESSION_SECRET || (isProduction ? "" : "cafe-cursor-secret-key-2024")).trim();
  const usesDevelopmentPassword = password === "cafecursor2024" || password === "your_secure_password_here";
  const usesDevelopmentSecret = secret === "cafe-cursor-secret-key-2024" || secret === "cafe-cursor-local-development-secret";

  if (isProduction && (
    !username ||
    password.length < 12 ||
    secret.length < 32 ||
    usesDevelopmentPassword ||
    usesDevelopmentSecret
  )) {
    throw new Error(
      "ADMIN_USERNAME, ADMIN_PASSWORD (12+ caracteres) y SESSION_SECRET (32+ caracteres) son obligatorios en producción"
    );
  }

  return { username, password, secret };
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/**
 * Verifica las credenciales del admin
 */
export function verifyCredentials(username: string, password: string): boolean {
  const credentials = getAdminCredentials();
  return safeEqual(username, credentials.username) && safeEqual(password, credentials.password);
}

/**
 * Crea un token de sesión simple
 */
export function createSessionToken(): string {
  const { username, secret } = getAdminCredentials();
  const payload = Buffer.from(
    JSON.stringify({ username, timestamp: Date.now() })
  ).toString("base64url");
  const signature = signPayload(payload, secret);

  return `${payload}.${signature}`;
}

/**
 * Verifica si el token de sesión es válido
 */
export function verifySessionToken(token: string): boolean {
  try {
    const credentials = getAdminCredentials();
    const tokenParts = token.split(".");
    if (tokenParts.length !== 2) return false;

    const [payload, signature] = tokenParts;
    const expectedSignature = signPayload(payload, credentials.secret);
    if (!safeEqual(signature, expectedSignature)) return false;

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    const username = typeof decoded.username === "string" ? decoded.username : "";
    const tokenTime = typeof decoded.timestamp === "number" ? decoded.timestamp : NaN;

    // Verificar que el token no tenga más de 24 horas
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    if (!Number.isFinite(tokenTime) || tokenTime > now + 60_000 || now - tokenTime > maxAge) {
      return false;
    }

    return safeEqual(username, credentials.username);
  } catch {
    return false;
  }
}

/**
 * Establece la cookie de sesión
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 horas
    path: "/",
  });
}

/**
 * Obtiene la cookie de sesión
 */
export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

/**
 * Elimina la cookie de sesión
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionCookie();
  if (!token) return false;
  return verifySessionToken(token);
}
