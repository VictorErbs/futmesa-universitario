// Constantes e utilitários específicos para o ecossistema esportivo e comunitário de Olinda/PE

export const BAIRROS_OLINDA = [
  "Rio Doce",
  "Peixinhos",
  "Bultrins",
  "Alto da Sé / Carmo",
  "Sítio Novo",
  "Jardim Brasil",
  "Amaro Branco",
  "Ouro Preto",
  "Casa Caiada",
  "Bairro Novo",
  "Salgadinho",
  "Águas Compridas",
  "Aguazinha",
  "Caixa D'Água",
  "Varadouro",
  "Santa Tereza",
  "Sapucaia",
  "Passarinho",
  "Vila Popular",
  "Outro Bairro / Região Metropolitana"
] as const;

export const POLOS_POPULARES_OLINDA = [
  "Orla de Rio Doce - Mesa da Praia",
  "Praça do Fortim - Carmo",
  "Arena Peixinhos de Futmesa",
  "Vila Olímpica de Rio Doce",
  "Quadra Poliesportiva de Bultrins",
  "Praça da Bíblia - Ouro Preto",
  "Alto da Sé - Mirante",
  "Mesa Comunitária Jardim Brasil",
  "Outro Local / Arena Comunitária"
] as const;

/**
 * Cria link formatado de WhatsApp para chamar atletas para a mesa de jogo
 */
export function generateMatchWhatsAppNotification({
  phone,
  athleteName,
  tournamentTitle,
  court,
  opponentName,
}: {
  phone?: string | null;
  athleteName: string;
  tournamentTitle: string;
  court?: string | null;
  opponentName?: string | null;
Context?: string;
}): string {
  const courtText = court ? `na *${court}*` : "na mesa principal";
  const opponentText = opponentName ? ` contra *${opponentName}*` : "";
  const msg = `*CONVOCACAO FUTMESA OLINDA*\n\nSalve, *${athleteName}*!\nSua partida pelo torneio *${tournamentTitle}* vai comecar agora ${courtText}${opponentText}.\n\nFavor comparecer imediatamente a mesa de jogo para o aquecimento!`;

  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
  const base = cleanPhone ? `https://wa.me/55${cleanPhone}` : "https://api.whatsapp.com/send";
  return `${base}?text=${encodeURIComponent(msg)}`;
}

/**
 * Cria link para o atleta compartilhar seu comprovante de inscrição
 */
export function generateRegistrationShareWhatsApp({
  athleteName,
  tournamentTitle,
  neighborhood,
  hubUrl,
}: {
  athleteName: string;
  tournamentTitle: string;
  neighborhood?: string | null;
  hubUrl: string;
}): string {
  const neighborhoodText = neighborhood ? ` representando *${neighborhood}*` : "";
  const msg = `*Inscricao confirmada no ${tournamentTitle} de Futmesa (Olinda/PE)!*\n\nAtleta: *${athleteName}*${neighborhoodText}\n\nAcompanhe a tabela e o chaveamento ao vivo aqui:\n${hubUrl}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}

export function isValidOlindaNeighborhood(neighborhood: string): boolean {
  return (BAIRROS_OLINDA as readonly string[]).includes(neighborhood);
}

/**
 * Cria link de WhatsApp com o código OTP de validação de inscrição
 */
export function generateOtpVerificationWhatsApp({
  phone,
  athleteName,
  tournamentTitle,
  code,
}: {
  phone: string;
  athleteName: string;
  tournamentTitle: string;
  code: string;
}): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const msg = `*CODIGO DE CONFIRMACAO FUTMESA OLINDA*\n\nAtleta: *${athleteName}*\nCampeonato: *${tournamentTitle}*\n\nSeu codigo de validacao de vaga e:\n*${code}*\n\nDigite este codigo no site para confirmar sua vaga! (Valido por 10 min)`;
  const base = cleanPhone ? `https://wa.me/55${cleanPhone}` : "https://api.whatsapp.com/send";
  return `${base}?text=${encodeURIComponent(msg)}`;
}

/**
 * Cria link para o atleta solicitar código no WhatsApp da organização se necessário
 */
export function generateRequestOtpFromOrganizerWhatsApp({
  athleteName,
  tournamentTitle,
  phone,
}: {
  athleteName: string;
  tournamentTitle: string;
  phone: string;
}): string {
  const msg = `*CONFIRMACAO DE INSCRICAO FUTMESA OLINDA*\n\nSalve, organizacao! Sou o atleta *${athleteName}* (${phone}) e estou me inscrevendo no *${tournamentTitle}*.\n\nFavor enviar meu codigo de validacao de vaga!`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}




