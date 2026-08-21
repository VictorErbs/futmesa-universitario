# Futmesa Universitário 🏆

Plataforma livre e de código aberto criada para fomentar a integração, o esporte e o lazer em projetos de extensão universitária e torneios comunitários de futmesa.

## 🚀 Funcionalidades

- **Chaveamento Automático**: Geração automática de chaves (Mata-Mata) ou Fase de Grupos.
- **Inscrição Simplificada**: Link público fácil de compartilhar no WhatsApp para atletas se inscreverem com 1 clique.
- **Placar Digital ao Vivo**: Interface touch-friendly (mesa de arbitragem) para acompanhamento de pontos em tempo real, com cálculo automático de DEUCE (vantagem de 2 pontos).
- **Design System Esportivo**: Tema "Collegiate Forest & Vintage Gold", responsivo e otimizado para celulares.
- **Estatísticas Rápidas**: Tabelas de classificação de grupos com vitórias, derrotas, saldo de sets e de pontos.

## 🛠️ Tecnologias

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados**: [Prisma ORM](https://www.prisma.io/) (com SQLite localmente)
- **Testes**: [Vitest](https://vitest.dev/)
- **Design Review**: Skill *Impeccable* & *Frontend Design* (Antigravity CLI)

## 📦 Como Rodar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/VictorErbs/futmesa-universitario.git
cd futmesa-universitario
```

2. Instale as dependências:
```bash
npm install
```

3. Inicialize o banco de dados (SQLite local):
```bash
npx prisma generate
npx prisma db push
```

4. Popule o banco com dados de teste (opcional):
```bash
npx tsx prisma/seed.ts
```

5. Rode a aplicação:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🧪 Testes

Para rodar a suíte de testes do motor de torneios:
```bash
npm test
```

## 🤝 Contribuição

Sinta-se à vontade para abrir *Issues* e enviar *Pull Requests*! Este é um projeto focado na comunidade e qualquer ajuda para melhorar a plataforma é super bem-vinda.
