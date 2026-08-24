import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do Futmesa Comunitário de Olinda/PE...");

  // Clear existing data safely
  await prisma.matchSet.deleteMany();
  await prisma.match.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.tournamentGroup.deleteMany();
  await prisma.tournament.deleteMany();

  // 1. Torneio 1: 1ª Copa Comunitária de Futmesa - Orla de Rio Doce (Em Andamento)
  const t1 = await prisma.tournament.create({
    data: {
      title: "1ª Copa Comunitária de Futmesa - Orla de Rio Doce",
      description:
        "Grande torneio das praças e praias de Olinda. Duplas representando as comunidades de Rio Doce, Peixinhos, Bultrins e Alto da Sé.",
      modality: "DOUBLES",
      format: "SINGLE_ELIMINATION",
      pointsPerSet: 18,
      setsToWin: 2,
      advantageRule: true,
      location: "Orla de Rio Doce - Mesa da Praia",
      community: "Rio Doce",
      sponsors: "Barbearia do Beto (Rio Doce) • Quiosque Estrela do Mar • Projeto Futmesa na Quebrada",
      rulesNote: "Padrão Pernambucano: 18 pontos com vantagem de 2. Proibido encostar na mesa.",
      startDate: new Date(),
      status: "IN_PROGRESS",
    },
  });

  // Participants for T1 with nicknames and Olinda neighborhoods
  const p1 = await prisma.participant.create({
    data: {
      name: "Carlos Eduardo",
      nickname: "Dadá",
      partnerName: "Rafael Santos",
      partnerNickname: "Rafinha",
      neighborhood: "Rio Doce",
      communityOrProject: "Arena Rio Doce",
      phone: "(81) 98765-4321",
      email: "dada.riodoce@futmesa.pe",
      seed: 1,
      tournamentId: t1.id,
      status: "CONFIRMED",
    },
  });

  const p2 = await prisma.participant.create({
    data: {
      name: "Lucas Ferreira",
      nickname: "Luquinhas",
      partnerName: "Mateus Silva",
      partnerNickname: "Teus",
      neighborhood: "Peixinhos",
      communityOrProject: "Projeto Esporte & Cidadania",
      phone: "(81) 97777-8888",
      seed: 2,
      tournamentId: t1.id,
      status: "CONFIRMED",
    },
  });

  const p3 = await prisma.participant.create({
    data: {
      name: "Gabriel Souza",
      nickname: "Biel",
      partnerName: "Bruno Costa",
      partnerNickname: "Bruninho",
      neighborhood: "Bultrins",
      communityOrProject: "Futmesa dos Bultrins",
      phone: "(81) 96666-5555",
      seed: 3,
      tournamentId: t1.id,
      status: "CONFIRMED",
    },
  });

  const p4 = await prisma.participant.create({
    data: {
      name: "Felipe Almeida",
      nickname: "Lipe",
      partnerName: "Rodrigo Lima",
      partnerNickname: "Digão",
      neighborhood: "Alto da Sé / Carmo",
      communityOrProject: "Guerreiros da Sé",
      phone: "(81) 95555-4444",
      seed: 4,
      tournamentId: t1.id,
      status: "CONFIRMED",
    },
  });

  // Final Match
  const finalMatch = await prisma.match.create({
    data: {
      tournamentId: t1.id,
      stage: "FINAL",
      round: 2,
      matchNumber: 3,
      court: "Mesa 1 - Praia",
      status: "SCHEDULED",
    },
  });

  for (let s = 1; s <= 3; s++) {
    await prisma.matchSet.create({
      data: { matchId: finalMatch.id, setNumber: s, score1: 0, score2: 0, isFinished: false },
    });
  }

  // Semi 1 (Finalized: p1 won)
  const semi1 = await prisma.match.create({
    data: {
      tournamentId: t1.id,
      stage: "SEMI_FINALS",
      round: 1,
      matchNumber: 1,
      court: "Mesa 1 - Praia",
      participant1Id: p1.id,
      participant2Id: p2.id,
      winnerId: p1.id,
      nextMatchId: finalMatch.id,
      nextMatchSlot: 1,
      status: "FINISHED",
    },
  });

  await prisma.matchSet.createMany({
    data: [
      { matchId: semi1.id, setNumber: 1, score1: 18, score2: 14, isFinished: true },
      { matchId: semi1.id, setNumber: 2, score1: 16, score2: 18, isFinished: true },
      { matchId: semi1.id, setNumber: 3, score1: 18, score2: 12, isFinished: true },
    ],
  });

  // Semi 2 (In Progress / Live)
  const semi2 = await prisma.match.create({
    data: {
      tournamentId: t1.id,
      stage: "SEMI_FINALS",
      round: 1,
      matchNumber: 2,
      court: "Mesa 2 - Coberta",
      participant1Id: p3.id,
      participant2Id: p4.id,
      nextMatchId: finalMatch.id,
      nextMatchSlot: 2,
      status: "IN_PROGRESS",
    },
  });

  await prisma.matchSet.createMany({
    data: [
      { matchId: semi2.id, setNumber: 1, score1: 18, score2: 15, isFinished: true },
      { matchId: semi2.id, setNumber: 2, score1: 14, score2: 16, isFinished: false },
      { matchId: semi2.id, setNumber: 3, score1: 0, score2: 0, isFinished: false },
    ],
  });

  // Set p1 in final
  await prisma.match.update({
    where: { id: finalMatch.id },
    data: { participant1Id: p1.id },
  });

  // 2. Torneio 2: Desafio X1 Individual da Praça do Fortim - Carmo (Inscrições Abertas)
  const t2 = await prisma.tournament.create({
    data: {
      title: "Desafio Individual X1 da Praça do Fortim - Carmo",
      description:
        "Disputa individual 1x1 rápida no coração histórico de Olinda. Set único até 18 pontos com premiação comunitária.",
      modality: "INDIVIDUAL",
      format: "SINGLE_ELIMINATION",
      pointsPerSet: 18,
      setsToWin: 1,
      advantageRule: true,
      location: "Praça do Fortim - Carmo (Olinda/PE)",
      community: "Alto da Sé / Carmo",
      sponsors: "Açaí da Sé • Tapioca da Vovó • Lanchonete do Fortim",
      startDate: new Date(Date.now() + 2 * 86400000),
      status: "REGISTRATION",
    },
  });

  await prisma.participant.createMany({
    data: [
      { name: "Thiago Rocha", nickname: "Thiaguinho", neighborhood: "Alto da Sé / Carmo", communityOrProject: "Fortim Futmesa", seed: 1, tournamentId: t2.id, phone: "(81) 94444-1111", status: "CONFIRMED" },
      { name: "Diego Martins", nickname: "Dieguito", neighborhood: "Jardim Brasil", communityOrProject: "Jardim Brasil FC", seed: 2, tournamentId: t2.id, phone: "(81) 94444-2222", status: "CONFIRMED" },
      { name: "Renato Augusto", nickname: "Rei da Mesa", neighborhood: "Sítio Novo", communityOrProject: "Sítio Novo Teqball", seed: 3, tournamentId: t2.id, phone: "(81) 94444-3333", status: "CONFIRMED" },
      { name: "Victor Hugo", nickname: "Vitinho", neighborhood: "Amaro Branco", communityOrProject: "Pescadores da Bola", seed: 4, tournamentId: t2.id, phone: "(81) 94444-4444", status: "CONFIRMED" },
    ],
  });

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
