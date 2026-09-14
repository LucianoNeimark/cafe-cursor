"use client";

import { useState, FormEvent } from "react";
import { useLanguage } from "./LanguageContext";

type FormStatus = "idle" | "loading" | "success" | "error";

interface RegisterResult {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  credit?: string;
  isExisting?: boolean;
  isTest?: boolean;
  emailSent?: boolean;
  creditAssigned?: boolean;
}

/**
 * Formulario de registro para obtener un crédito de Grok.
 * Solo pueden registrarse usuarios elegibles y aprobados para el evento.
 */
export function RegisterForm() {
  const { t, locale } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [result, setResult] = useState<RegisterResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setResult(null);

    console.log(`📤 [FORM] Enviando registro: ${email}`);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(),
          locale: locale, // Enviar idioma actual para el email
        }),
      });

      const data: RegisterResult = await response.json();

      if (data.success) {
        console.log(`✅ [FORM] Registro completado`);
        setStatus("success");
        setResult(data);
      } else {
        console.log(`⚠️ [FORM] Error: ${data.error} (código: ${data.code})`);
        setStatus("error");
        setResult(data);
      }
    } catch (error) {
      console.error(`❌ [FORM] Error de red:`, error);
      setStatus("error");
      setResult({
        success: false,
        error: t("networkError"),
        code: "NETWORK_ERROR",
      });
    }
  };

  const handleCopyLink = async () => {
    if (result?.credit) {
      await navigator.clipboard.writeText(result.credit);
      console.log(`📋 [FORM] Enlace copiado al portapapeles`);
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setResult(null);
    setName("");
    setEmail("");
  };

  const handleRetryEmail = () => {
    setStatus("idle");
    setResult(null);
  };

  // Mapear los códigos de error a sus traducciones.
  const getErrorMessage = (code?: string, originalError?: string): string => {
    switch (code) {
      case "NOT_ELIGIBLE":
        return t("notEligible");
      case "NOT_APPROVED":
        return t("notApproved");
      case "NO_CREDITS":
        return t("noCreditsAvailable");
      case "EMAIL_DELIVERY_FAILED":
        return t("emailDeliveryFailed");
      case "NETWORK_ERROR":
        return t("networkError");
      default:
        return originalError || t("networkError");
    }
  };

  // Vista de éxito
  if (status === "success" && result) {
    const showTestCredit = Boolean(result.isTest && result.credit);

    return (
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-border bg-background p-8">
          {/* Ícono de éxito */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/10">
            <svg
              className="h-8 w-8 text-[var(--success)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="mb-2 text-center text-xl font-semibold">
            {showTestCredit
              ? (result.isExisting ? t("alreadyHaveCredit") : t("successTitle"))
              : t("emailSuccessTitle")}
          </h2>

          <p className="mb-6 text-center text-sm text-muted">
            {showTestCredit
              ? t("congratsMessage")
              : (result.isExisting ? t("emailExistingMessage") : t("emailSuccessMessage"))}
          </p>

          {showTestCredit && result.credit && (
            <>
              {/* Aviso de crédito de prueba */}
              <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  {t("testWarning")}
                </p>
              </div>

              {/* Enlace del crédito de prueba */}
              <div className="mb-4 rounded-xl border border-border bg-background p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                  {t("yourCredit")}
                </p>
                <p className="break-all font-mono text-sm">{result.credit}</p>
              </div>

              {/* Botones para el crédito de prueba */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
                >
                  {t("copyLink")}
                </button>
                <a
                  href={result.credit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl bg-foreground px-4 py-3 text-center text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  {t("useCredit")}
                </a>
              </div>
            </>
          )}

          {/* Botón compartir en X */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(t("shareMessage"))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-black px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {t("shareOnX")}
          </a>
        </div>

        {showTestCredit && (
          <p className="mt-6 text-center text-xs text-muted">
            {t("saveLink")}
          </p>
        )}

        {/* Notificación de email */}
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[var(--success)]/20 bg-[var(--success)]/5 px-4 py-3">
          <span className="text-center text-sm text-[var(--success)]">
            {showTestCredit ? t("emailSent") : t("emailPrivacyNote")}
          </span>
        </div>
      </div>
    );
  }

  // Formulario de registro
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md animate-fade-in">
      <div className="rounded-2xl border border-border bg-background p-8">
        {/* Campo de nombre */}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium"
          >
            {t("nameLabel")}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            required
            disabled={status === "loading"}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-foreground focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Campo de correo electrónico */}
        <div className="mb-6">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
          >
            {t("emailLabel")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
            disabled={status === "loading"}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-foreground focus:outline-none disabled:opacity-50"
          />
          <p className="mt-2 text-xs text-muted">
            {t("emailHint")}
          </p>
        </div>

        {/* Mensaje de error */}
        {status === "error" && result && (
          <div className="mb-4 rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/5 p-4">
            <p className="text-sm text-[var(--error)]">
              {getErrorMessage(result.code, result.error)}
            </p>
            {result.code === "NOT_ELIGIBLE" && (
              <p className="mt-2 text-xs text-muted">
                {t("thinkError")}
              </p>
            )}
            {result.code === "NOT_APPROVED" && (
              <p className="mt-2 text-xs text-muted">
                {t("pendingApproval")}
              </p>
            )}
            <button
              type="button"
              onClick={result.code === "EMAIL_DELIVERY_FAILED" ? handleRetryEmail : handleReset}
              className="mt-3 text-xs text-foreground underline underline-offset-2 hover:no-underline"
            >
              {result.code === "EMAIL_DELIVERY_FAILED" ? t("retryEmail") : t("tryAnotherEmail")}
            </button>
          </div>
        )}

        {/* Botón de registro */}
        <button
          type="submit"
          disabled={status === "loading" || !name.trim() || !email.trim()}
          className="w-full rounded-xl bg-foreground px-4 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 spinner"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {t("submitting")}
            </span>
          ) : (
            t("submitButton")
          )}
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        {t("footerNote")}
        <br />
        {t("onePerPerson")}
      </p>
    </form>
  );
}
