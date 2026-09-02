/**
 * Servico de Envio Automatico de Mensagens WhatsApp
 * 
 * Envia mensagens do servidor direto para o WhatsApp do atleta (sem passar pelo navegador).
 * Suporta integracao com Evolution API, Z-API, Baileys, Webhooks ou Twilio.
 */

interface SendWhatsappOtpParams {
  phone: string;
  athleteName: string;
  tournamentTitle: string;
  code: string;
}

export async function sendWhatsappOtpToAthlete({
  phone,
  athleteName,
  tournamentTitle,
  code,
}: SendWhatsappOtpParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const cleanDigits = phone.replace(/\D/g, "");
  // Formato DDI + DDD + Telefone (ex: 5581988887777)
  const fullPhoneNumber = cleanDigits.startsWith("55") ? cleanDigits : `55${cleanDigits}`;

  const messageText = `*CODIGO DE CONFIRMACAO FUTMESA OLINDA*\n\nSalve, *${athleteName}*!\nVoce solicitou inscricao no torneio *${tournamentTitle}*.\n\nSeu codigo de validacao de vaga e:\n*${code}*\n\nDigite este codigo na pagina para confirmar sua vaga! (Valido por 10 min)`;

  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const instanceName = process.env.WHATSAPP_INSTANCE_NAME || "futmesa";

  // Se houver uma API de WhatsApp configurada via variaveis de ambiente (.env)
  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "apikey": apiKey, "Authorization": `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          number: fullPhoneNumber,
          phone: fullPhoneNumber,
          to: fullPhoneNumber,
          text: messageText,
          message: messageText,
          instance: instanceName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[WHATSAPP API ERROR] Falha ao enviar para ${fullPhoneNumber}:`, errorText);
        return { success: false, error: errorText };
      }

      const data = await response.json().catch(() => ({}));
      console.log(`[WHATSAPP API] Mensagem OTP enviada com sucesso para ${fullPhoneNumber}`);
      return { success: true, messageId: data.key?.id || data.id || "sent" };
    } catch (err: any) {
      console.error(`[WHATSAPP API NETWORK ERROR]:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Fallback para Ambiente de Desenvolvimento (quando ainda sem API externa conectada)
  console.log(`\n======================================================`);
  console.log(`[DISPARO AUTOMATICO DE WHATSAPP PARA O ATLETA]`);
  console.log(`Destinatario: +${fullPhoneNumber} (${athleteName})`);
  console.log(`Torneio: ${tournamentTitle}`);
  console.log(`Codigo OTP Gerado: >>> ${code} <<<`);
  console.log(`Mensagem Enviada:`);
  console.log(messageText);
  console.log(`======================================================\n`);

  return { success: true, messageId: "dev-mock-delivered" };
}
