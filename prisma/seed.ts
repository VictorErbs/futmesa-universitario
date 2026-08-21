import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do Futmesa Universitário...");

  // Clear existing data safely
  await prisma.matchSet.deleteMany();
  await prisma.match.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.tournamentGroup.deleteMany();
  await prisma.tournament.deleteMany();

  // 1. Torneio 1: 1º Torneio Universitário de Futmesa (Duplas - Mata-Mata)
  const t1 = await prisma.tournament.create({
    data: {
      title: "1º Torneio Universitário de Futmesa 2026",
      description:
        "Campeonato oficial do projeto de extensão universitária. Duplas mistas, masculinas e femininas disputando o troféu no ginásio.",
      modality: "DOUBLES",
      format: "SINGLE_ELIMINATION",
      pointsPerSet: 18,
      setsToWin: 2,
      advantageRule: true,
      location: "Mesa de Futmesa - Ginásio Poliesportivo Central",
      startDate: new Date(Date.now() + 86400000),
      status: "IN_PROGRESS",
    },
  });

  // Participants for T1
  const p1 = await prisma.participant.create({
    data: {
      name: "Carlos Eduardo",
      partnerName: "Rafael Santos",
      phone: "(11) 98765-4321",
      email: "carlos.futmesa@faculdade.edu.br",
      seed: 1,
      tournamentId: t1.id,
      status: "CONFIRMED",
    },
  });

  const p2 = await prisma.participant.create({
    data: {
      name: "Lucas Ferreira",
      partnerName: "Mateus Silva",
      phone: "(11) 97777-8888",
      email: "lucas.mateus@faculdade.edu.br",
      seed: 2,
      tournamentId: t1.id,
      status: "CONFIRMED",
    },
  });

  const p3 = await prisma.participant.create({
    data: {
      name: "Gabriel Souza",
      partnerName: "Bruno Costa",
      phone: "(11) 96666-5555",
      seed: 3,
      tournamentId: t1.id,
      status: "CONFIRMED",
    },
  });

  const p4 = await prisma.participant.create({
    data: {
      name: "Felipe Almeida",
      partnerName: "Rodrigo Lima",
      phone: "(11) 95555-4444",
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
      court: "Mesa Central",
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
      court: "Mesa 1",
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
      court: "Mesa 2",
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

  // 2. Torneio 2: Desafio Individual X1 Comunitário (Inscrições Abertas)
  const t2 = await prisma.tournament.create({
    data: {
      title: "Desafio Individual X1 de Futmesa 2026",
      description:
        "Torneio individual dinâmico no formato 1x1, sets até 15 pontos, aberto para toda a comunidade universitária e convidados.",
      modality: "INDIVIDUAL",
      format: "SINGLE_ELIMINATION",
      pointsPerSet: 15,
      setsToWin: 1,
      advantageRule: true,
      location: "Praça Esportiva Universitária",
      startDate: new Date(Date.now() + 3 * 86400000),
      status: "REGISTRATION",
    },
  });

  await prisma.participant.createMany({
    data: [
      { name: "Thiago Rocha", seed: 1, tournamentId: t2.id, phone: "(11) 94444-1111", status: "CONFIRMED" },
      { name: "Diego Martins", seed: 2, tournamentId: t2.id, phone: "(11) 94444-2222", status: "CONFIRMED" },
      { name: "Renato Augusto", seed: 3, tournamentId: t2.id, phone: "(11) 94444-3333", status: "CONFIRMED" },
      { name: "Victor Hugo", seed: 4, tournamentId: t2.id, phone: "(11) 94444-4444", status: "CONFIRMED" },
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
