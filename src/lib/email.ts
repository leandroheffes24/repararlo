/**
 * Envío de emails con Resend (https://resend.com) — plan gratis.
 * Usa fetch directo (sin dependencias). Si no está configurado, no hace nada.
 */

export const emailConfigured = (): boolean => Boolean(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.EMAIL_FROM || "Repararlo <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Plantilla simple del recordatorio (estilos inline para compatibilidad de email). */
export function reminderEmailHtml(proName: string, link: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
    <h2 style="color:#1f4fe0; margin-bottom: 4px;">Repararlo</h2>
    <p style="font-size:15px; line-height:1.6;">
      Hace unos días contactaste a <strong>${proName}</strong> por Repararlo.
    </p>
    <p style="font-size:15px; line-height:1.6;">
      Si trabajaron juntos, confirmalo y dejale tu reseña. Te toma 10 segundos y ayuda un
      montón a otros vecinos (y al profesional).
    </p>
    <p style="text-align:center; margin: 24px 0;">
      <a href="${link}" style="background:#1f4fe0; color:#fff; text-decoration:none; padding:12px 24px; border-radius:10px; font-weight:bold; display:inline-block;">
        Confirmar y dejar mi reseña
      </a>
    </p>
    <p style="font-size:12px; color:#94a3b8; line-height:1.5;">
      Si no trabajaste con ${proName}, podés ignorar este mensaje.<br/>
      Repararlo · La plataforma de servicios para el hogar.
    </p>
  </div>`;
}
