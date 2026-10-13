# Elite Club — Plataforma do clube

App web para gestão do **Elite Club** (ecossistema Clube Dialog): cadastro completo de associadas,
página exclusiva para cada associada, clube de benefícios com contabilização mensal e painel
administrativo com controle total.

## Como rodar

```bash
cd elite-club
npm install
npm run dev        # http://localhost:5173
npm run build      # gera /dist para publicar (Vercel, Netlify…)
```

Acesso de demonstração:

| Perfil | Login |
| --- | --- |
| Admin | aba **Administração**, senha `elite2026` (troque em `VITE_ADMIN_PASSWORD`, ver `.env.example`) |
| Associada | `ana@exemplo.com.br` · código `482913` |

## O que tem

**Painel admin (`/admin`)**
- **Painel**: associadas ativas, inadimplentes, usos no mês, horas de sala, solicitações pendentes, próximo encontro.
- **Associadas**: cadastro completo (dados pessoais, contato, profissional, CNPJ, endereço, redes sociais,
  vigência, situação financeira, endereço fiscal, código de acesso), busca, filtro e exportação CSV.
  Cada associada tem ficha com saldo de benefícios do mês, histórico, QR Code e link da página.
- **Uso de benefícios**: registro e contabilização de todos os usos, filtros por mês/associada/benefício,
  relatório associada × benefício e exportação CSV.
- **Solicitações**: pedidos feitos pelas associadas (sala, convidada, descontos) para aprovar/recusar.
- **Encontros**: calendário dos Encontros Elite (10h–12h), programação (Pocket Talk, Hot Seat, Pitch & Venda,
  Mesa de Oportunidades…), check-in de presença e convidadas.
- **Benefícios** e **Parceiros**: cadastro de parceiros e quais benefícios cada um fornece.
- **Configurações**: backup (exportar/importar JSON) e restaurar demonstração.

**Página exclusiva da associada (`/m/nome-da-associada`)** — foto, cargo, frase de destaque, botões
clicáveis de WhatsApp (com mensagem pronta), ligar, e-mail, salvar contato (vCard), compartilhar,
links para Instagram, LinkedIn, site, portfólio, Facebook, TikTok, YouTube, bio, serviços e QR Code.
A associada escolhe o que aparece (telefone, e-mail, cidade…).

**Área da associada (`/minha-area`)** — saldo dos benefícios do mês, reserva de sala, cadastro de
convidada, solicitação de descontos, próximos encontros, parceiros e edição da própria página.

## Regras do contrato aplicadas

| Cláusula | Benefício | Regra no sistema |
| --- | --- | --- |
| a | Encontro Elite presencial | 1 por mês (check-in no encontro) |
| b | Experiências com especialistas | registrado, sem limite |
| c | Grupo estratégico e comunidade | registrado, sem limite |
| d | Convidada intencional | 1 por mês, cadastro prévio obrigatório, aviso se a convidada já participou antes |
| e | Indicações, brindes, Elite Cast | registrado conforme campanha |
| f | Sala Dialog | 2 h/mês, pessoal, **não cumulativo**, com data e horário |
| g | Endereço fiscal | aviso se faltar CNPJ |
| h | Descontos Dialog (45%), Dialog Creative, NeuroBusiness, Advisor (50%) | registrado por parceiro |
| i | Ecossistema Clube Dialog | registrado |

- Benefícios só ficam disponíveis enquanto a associada está **adimplente** e dentro da vigência.
- Solicitações pendentes já reservam o saldo do mês.
- O admin pode abrir exceção, mas precisa escrever uma justificativa, que fica gravada no registro.
- As cláusulas 3.1 e 3.2 aparecem como condições gerais.

Todos os limites, descontos e parceiros podem ser editados em **Benefícios** e **Parceiros**.

## Identidade visual

- **Elite Club é a marca principal**: dourado `#B8925A` sobre preto quente `#14110D` e marfim `#F7F2EA`,
  títulos em Cormorant Garamond (serifa do logo) e textos em Montserrat (como o "CLUB").
  - `elite-vertical.png`: tela de login.
  - `elite-horizontal-light.png`: menu do admin, topo da área da associada e rodapé da página pública.
  - `elite-mark.png` (monograma EC): topo da página pública e favicon.
- **Dialog é a marca de apoio**, usada como "Ecossistema Clube Dialog" no rodapé, no menu e nos
  parceiros/benefícios do ecossistema (selo azul-marinho `#1F3A52` com rosa `#E5AEB1`).

## Importante: dados nesta versão

Nesta versão os dados ficam salvos **no navegador** (localStorage). Isso serve para validar o fluxo,
mas a página pública de uma associada só abre no mesmo navegador em que foi cadastrada. Para usar com
várias pessoas e dispositivos, o próximo passo é ligar um banco de dados com login real (ex.: Supabase).
Todo o acesso a dados passa por `src/lib/store.ts`, então a troca fica concentrada nesse arquivo.
Até lá, use **Configurações → Exportar backup** com frequência.

Veja também `PROMPT.md`, com o prompt completo para recriar o app em ferramentas como Lovable.
