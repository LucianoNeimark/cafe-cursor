import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { ZodError } from "zod";
import { sendCreditEmail } from "@/lib/email";

type Locale = "es" | "en";

interface DeliverCreditParams {
  userId: string;
  recipientEmail: string;
  recipientName: string;
  company?: string;
  credit: {
    code: string;
    link: string;
    isTest: boolean;
  };
  locale: Locale;
  isExisting: boolean;
  successStatus: number;
}

async function deliverCredit({
  userId,
  recipientEmail,
  recipientName,
  company,
  credit,
  locale,
  isExisting,
  successStatus,
}: DeliverCreditParams) {
  const emailResult = await sendCreditEmail({
    to: recipientEmail,
    name: recipientName,
    creditLink: credit.link,
    creditCode: credit.code,
    company,
    isTest: credit.isTest,
    locale,
  });

  if (!emailResult.success) {
    console.error("❌ [REGISTER] No se pudo entregar el correo del crédito");
    return NextResponse.json(
      {
        success: false,
        error: locale === "es"
          ? "Tu crédito quedó reservado, pero no pudimos enviar el correo. Inténtalo nuevamente."
          : "Your credit was reserved, but we could not send the email. Please try again.",
        code: "EMAIL_DELIVERY_FAILED",
        creditAssigned: true,
      },
      { status: 502 }
    );
  }

  await prisma.eligibleUser.update({
    where: { id: userId },
    data: { emailSentAt: new Date() },
  });

  return NextResponse.json(
    {
      success: true,
      message: credit.isTest
        ? (locale === "es" ? "Crédito de prueba asignado." : "Test credit assigned.")
        : (locale === "es" ? "Crédito enviado por correo." : "Credit sent by email."),
      isExisting,
      isTest: credit.isTest,
      emailSent: true,
      // Los enlaces de créditos reales nunca se incluyen en una respuesta pública.
      ...(credit.isTest ? { credit: credit.link } : {}),
    },
    { status: successStatus }
  );
}

/**
 * POST /api/register
 * Registra un usuario elegible y asigna un crédito disponible
 * Solo usuarios pre-aprobados del evento pueden obtener créditos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar input
    const validatedData = registerSchema.parse(body);
    const { name, email } = validatedData;
    const normalizedEmail = email.toLowerCase().trim();
    
    // Obtener el idioma solicitado (español por defecto).
    const locale: Locale = body.locale === "en" ? "en" : "es";

    console.log("📝 [REGISTER] Solicitud de registro recibida");

    // 1. Verificar si el email está en la lista de usuarios elegibles
    const eligibleUser = await prisma.eligibleUser.findUnique({
      where: { email: normalizedEmail },
      include: { credit: true },
    });

    // Usuario NO está en la lista de elegibles
    if (!eligibleUser) {
      console.log("❌ [REGISTER] Solicitud para un correo no elegible");
      return NextResponse.json(
        {
          success: false,
          error: "Este correo no está registrado para el evento Cafe Cursor. Solo los participantes aprobados pueden obtener créditos.",
          code: "NOT_ELIGIBLE",
        },
        { status: 403 }
      );
    }

    // Usuario no está aprobado
    if (eligibleUser.approvalStatus !== "approved") {
      console.log(`⚠️ [REGISTER] Solicitud para un usuario con estado: ${eligibleUser.approvalStatus}`);
      return NextResponse.json(
        {
          success: false,
          error: "Tu inscripción al evento aún no fue aprobada. Comunícate con la organización.",
          code: "NOT_APPROVED",
        },
        { status: 403 }
      );
    }

    // 2. Verificar si ya reclamó su crédito
    if (eligibleUser.hasClaimed && eligibleUser.credit) {
      console.log("ℹ️ [REGISTER] El usuario ya tiene un crédito asignado");

      // No reenviar automáticamente correos ya entregados para evitar abusos.
      if (eligibleUser.emailSentAt) {
        return NextResponse.json(
          {
            success: true,
            message: locale === "es"
              ? "Tu crédito ya fue enviado al correo registrado."
              : "Your credit was already sent to the registered email.",
            isExisting: true,
            isTest: eligibleUser.credit.isTest,
            emailSent: true,
            ...(eligibleUser.credit.isTest ? { credit: eligibleUser.credit.link } : {}),
          },
          { status: 200 }
        );
      }

      // Si una entrega anterior falló, reutilizar el crédito ya reservado.
      return deliverCredit({
        userId: eligibleUser.id,
        recipientEmail: eligibleUser.email,
        recipientName: eligibleUser.name,
        company: eligibleUser.company || undefined,
        credit: eligibleUser.credit,
        locale,
        isExisting: true,
        successStatus: 200,
      });
    }

    // 3. Determinar si es usuario de test
    const isTestUser = eligibleUser.company === "Test Company";

    // 4. Buscar un crédito disponible (test para usuarios test, real para usuarios reales)
    const availableCredit = await prisma.credit.findFirst({
      where: { 
        isUsed: false,
        isTest: isTestUser, // Los usuarios de prueba reciben créditos de prueba.
      },
      orderBy: { createdAt: "asc" },
    });

    if (!availableCredit) {
      console.log(`❌ [REGISTER] No hay créditos disponibles (isTest: ${isTestUser})`);
      return NextResponse.json(
        {
          success: false,
          error: "Lo sentimos, no hay créditos disponibles en este momento. Comunícate con la organización.",
          code: "NO_CREDITS",
        },
        { status: 503 }
      );
    }

    // 5. Asignar crédito en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar usuario como que ya reclamó
      const updatedUser = await tx.eligibleUser.update({
        where: { id: eligibleUser.id },
        data: {
          name: name || eligibleUser.name, // Actualizar nombre si se proporcionó
          hasClaimed: true,
          claimedAt: new Date(),
          creditId: availableCredit.id,
        },
      });

      // Marcar crédito como usado
      await tx.credit.update({
        where: { id: availableCredit.id },
        data: {
          isUsed: true,
          assignedAt: new Date(),
        },
      });

      return updatedUser;
    });

    console.log(`✅ [REGISTER] Crédito asignado (prueba: ${isTestUser})`);

    // 6. Confirmar la entrega antes de informar éxito al usuario.
    return deliverCredit({
      userId: result.id,
      recipientEmail: result.email,
      recipientName: result.name,
      company: result.company || undefined,
      credit: availableCredit,
      locale,
      isExisting: false,
      successStatus: 201,
    });
  } catch (error) {
    // Error de validación
    if (error instanceof ZodError) {
      console.log(`⚠️ [REGISTER] Error de validación:`, error.errors);
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || "Datos inválidos",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Error general
    console.error(`❌ [REGISTER] Error interno:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor. Por favor intenta de nuevo.",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/register
 * Obtiene estadísticas públicas (sin datos sensibles)
 */
export async function GET() {
  try {
    const [availableReal, availableTest, totalEligible, claimed] = await Promise.all([
      prisma.credit.count({ where: { isUsed: false, isTest: false } }),
      prisma.credit.count({ where: { isUsed: false, isTest: true } }),
      prisma.eligibleUser.count({ where: { approvalStatus: "approved" } }),
      prisma.eligibleUser.count({ where: { hasClaimed: true } }),
    ]);

    return NextResponse.json({
      available: availableReal > 0,
      remaining: availableReal,
      stats: {
        totalEligible,
        claimed,
        pending: totalEligible - claimed,
      },
    });
  } catch (error) {
    console.error(`❌ [STATS] Error:`, error);
    return NextResponse.json(
      { available: false, remaining: 0 },
      { status: 500 }
    );
  }
}
