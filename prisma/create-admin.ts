import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USER || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const admin = await prisma.admin.upsert({
    where: { username },
    update: { password },
    create: { username, password },
  });

  console.log(`\n======================================`);
  console.log(`✅ Admin pronto com sucesso!`);
  console.log(`Usuário: ${admin.username}`);
  console.log(`Senha:   ${admin.password}`);
  console.log(`======================================\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
