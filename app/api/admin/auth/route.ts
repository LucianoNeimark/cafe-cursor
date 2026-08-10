import { NextRequest, NextResponse } from "next/server";
import {
  verifyCredentials,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  isAuthenticated,
} from "@/lib/auth";

/**
 * POST /api/admin/auth - Iniciar sesión
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log(`🔐 [ADMIN] Intento de login: ${username}`);

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Usuario y contraseña requeridos" },
        { status: 400 }
      );
    }

    if (!verifyCredentials(username, password)) {
      console.log(`❌ [ADMIN] Inicio de sesión fallido: ${username}`);
      return NextResponse.json(
        { success: false, error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Crear token y establecer cookie
    const token = createSessionToken();
    await setSessionCookie(token);

    console.log(`✅ [ADMIN] Inicio de sesión exitoso: ${username}`);

    return NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
    });
  } catch (error) {
    console.error("❌ [ADMIN] Error en login:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth - Verificar sesión
 */
export async function GET() {
  try {
    const authenticated = await isAuthenticated();

    return NextResponse.json({
      authenticated,
    });
  } catch (error) {
    console.error("❌ [ADMIN] Error verificando sesión:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/auth - Cerrar sesión
 */
export async function DELETE() {
  try {
    await clearSessionCookie();
    console.log(`🚪 [ADMIN] Sesión cerrada`);

    return NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente",
    });
  } catch (error) {
    console.error("❌ [ADMIN] Error en logout:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
