export type Locale = "es" | "en";

export const translations = {
  es: {
    // Header
    title: "Grok Bot Meetup Buenos Aires",
    subtitle: "Compañeros de trabajo con IA, de SpaceXAI. Miércoles 16 de septiembre, 18:00–20:00. Buenos Aires.",
    cta: "Obtén tu crédito de Grok.",
    
    // Form
    nameLabel: "Nombre",
    namePlaceholder: "Tu nombre completo",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "El correo que usaste al registrarte",
    emailHint: "Usa el mismo correo con el que te registraste en Luma",
    submitButton: "Obtener mi crédito",
    submitting: "Verificando…",
    
    // Footer
    footerNote: "Solo quienes estén registrados en el evento pueden obtener créditos.",
    onePerPerson: "Un crédito por persona.",
    madeBy: "Organizado por",
    ambassadors: "Daniel Guzman, Luciano Neimark y Mariana Besseghini",
    ambassadorTitle: "SpaceXAI para Buenos Aires, Argentina",
    poweredBy: "Con tecnología de",
    
    // Badge
    creditsAvailable: "créditos disponibles",
    noCredits: "No hay créditos disponibles",
    loading: "Cargando…",
    alreadyClaimed: "participantes ya reclamaron su crédito",
    of: "de",
    
    // Success
    successTitle: "¡Crédito asignado!",
    alreadyHaveCredit: "¡Ya tienes tu crédito!",
    congratsMessage: "¡Felicitaciones! Este es tu crédito de Grok:",
    registeredAs: "Registrado como:",
    testWarning: "⚠️ Este es un crédito de PRUEBA (no es válido para uso real)",
    yourCredit: "Tu crédito de Grok",
    copyLink: "Copiar enlace",
    useCredit: "Usar crédito →",
    saveLink: "Guarda este enlace: es único y personal.",
    emailSuccessTitle: "¡Revisa tu correo!",
    emailSuccessMessage: "Enviamos tu crédito de Grok a la dirección registrada.",
    emailExistingMessage: "Tu crédito ya fue enviado al correo registrado. Revisa también la carpeta de spam.",
    emailPrivacyNote: "🔒 Por seguridad, el enlace solo se entrega por correo electrónico.",
    
    // Errors
    notEligible: "Este correo no está registrado para el Grok Bot Meetup. Solo los participantes aprobados pueden obtener créditos.",
    notApproved: "Tu inscripción al evento aún no fue aprobada. Comunícate con la organización.",
    noCreditsAvailable: "Lo sentimos, no hay créditos disponibles en este momento. Comunícate con la organización.",
    networkError: "Error de conexión. Inténtalo de nuevo.",
    thinkError: "¿Crees que se trata de un error? Comunícate con la organización del evento.",
    pendingApproval: "Tu solicitud está pendiente de aprobación.",
    tryAnotherEmail: "Probar con otro correo",
    emailDeliveryFailed: "Tu crédito quedó reservado, pero no pudimos enviar el correo. Inténtalo nuevamente; no se asignará otro crédito.",
    retryEmail: "Reintentar el envío",
    
    // Share
    shareOnX: "Compartir en X",
    shareMessage: "🚀 Acabo de recibir un crédito de Grok en el Grok Bot Meetup Buenos Aires. Gracias a SpaceXAI y a la comunidad. #GrokBotMeetup #SpaceXAI #Grok",
    
    // Email
    emailSent: "📧 ¡También enviamos el crédito a tu correo!",
  },
  "en": {
    // Header
    title: "Grok Bot Meetup Buenos Aires",
    subtitle: "AI coworkers from SpaceXAI. Wednesday, September 16, 18:00–20:00. Buenos Aires.",
    cta: "Get your Grok credit.",
    
    // Form
    nameLabel: "Name",
    namePlaceholder: "Your full name",
    emailLabel: "Email",
    emailPlaceholder: "The email you registered with",
    emailHint: "Use the same email you registered with on Luma",
    submitButton: "Get my credit",
    submitting: "Verifying...",
    
    // Footer
    footerNote: "Only registered event attendees can get credits.",
    onePerPerson: "One credit per person.",
    madeBy: "Hosted by",
    ambassadors: "Daniel Guzman, Luciano Neimark, and Mariana Besseghini",
    ambassadorTitle: "SpaceXAI for Buenos Aires, Argentina",
    poweredBy: "Powered by",
    
    // Badge
    creditsAvailable: "credits available",
    noCredits: "No credits available",
    loading: "Loading...",
    alreadyClaimed: "attendees already claimed",
    of: "of",
    
    // Success
    successTitle: "Credit assigned!",
    alreadyHaveCredit: "You already have your credit!",
    congratsMessage: "Congratulations! Here's your Grok credit:",
    registeredAs: "Registered as:",
    testWarning: "⚠️ This is a TEST credit (not valid for real use)",
    yourCredit: "Your Grok credit",
    copyLink: "Copy link",
    useCredit: "Use credit →",
    saveLink: "Save this link, it's unique and personal.",
    emailSuccessTitle: "Check your email!",
    emailSuccessMessage: "We sent your Grok credit to the registered email address.",
    emailExistingMessage: "Your credit was already sent to the registered email. Please check your spam folder too.",
    emailPrivacyNote: "🔒 For security, the link is only delivered by email.",
    
    // Errors
    notEligible: "This email is not registered for the Grok Bot Meetup. Only approved attendees can get credits.",
    notApproved: "Your event registration hasn't been approved yet. Please contact the organizer.",
    noCreditsAvailable: "Sorry, no credits are available at the moment. Please contact the organizer.",
    networkError: "Connection error. Please try again.",
    thinkError: "Think this is an error? Contact the event organizer.",
    pendingApproval: "Your request is pending approval.",
    tryAnotherEmail: "Try with another email",
    emailDeliveryFailed: "Your credit was reserved, but we could not send the email. Try again; another credit will not be assigned.",
    retryEmail: "Retry email delivery",
    
    // Share
    shareOnX: "Share on X",
    shareMessage: "🚀 Just got a Grok credit at the Grok Bot Meetup Buenos Aires. Thanks to SpaceXAI and the community. #GrokBotMeetup #SpaceXAI #Grok",
    
    // Email
    emailSent: "📧 We sent the credit to your email!",
  },
} as const;

export type TranslationKey = keyof typeof translations.es;

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}
