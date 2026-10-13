# Prompt final — App Elite Club

> Para usar em geradores de app (Lovable, Bolt, v0 etc.). Anexe junto as logos de `public/brand/`.

---

Crie um web app responsivo (mobile first), em português do Brasil, chamado **Elite Club**: a plataforma
de um clube de negócios para mulheres empreendedoras que faz parte do **ecossistema Clube Dialog**.
Use banco de dados e autenticação reais (Supabase), com dois perfis: **Admin** e **Associada**.

## Identidade visual
- **Marca principal: Elite Club** (logo dourado com arco, estrela e monograma "EC").
  - Paleta: dourado `#B8925A` (hover `#8F6D3C`), preto quente `#14110D`, marfim `#F7F2EA`, branco `#FFFDF9`,
    bege `#EFE4D2` para fundos suaves.
  - Tipografia: **Cormorant Garamond** nos títulos (serifa elegante como o "ELITE") e **Montserrat** nos
    textos e botões (como o "CLUB" espaçado). Rótulos curtos em caixa alta com espaçamento largo.
  - Estilo: luxo discreto, muito espaço em branco, bordas arredondadas, detalhes finos em dourado.
- **Onde cada logo entra:**
  - Logo **vertical** do Elite Club: tela de login (sobre fundo preto) e tela de "página não encontrada".
  - Logo **horizontal** do Elite Club: menu lateral do admin e topo da área da associada (versão com
    "CLUB" claro sobre fundo escuro) e rodapé da página pública.
  - **Monograma EC** (arco com estrela): topo da página pública da associada e favicon.
  - **Logo Dialog** (casa azul-marinho `#1F3A52` com balão rosa `#E5AEB1`): marca de apoio. Aparece
    pequena com o texto "Ecossistema Clube Dialog" no rodapé do menu, no login, na página pública e na
    área da associada. Também identifica os parceiros e benefícios do ecossistema Dialog (selo azul-marinho
    com texto rosa). Nunca competir com a marca Elite Club.

## Entidades
- **Associada**: nome completo, nome de exibição, CPF, RG, nascimento, foto, e-mail, WhatsApp, telefone,
  empresa, cargo, segmento, CNPJ, frase de destaque, bio, serviços (lista), endereço completo, Instagram,
  LinkedIn, Facebook, TikTok, YouTube, site, portfólio, plano, início e fim da vigência, dia de vencimento,
  situação (adimplente, inadimplente, suspensa, cancelada), usa endereço fiscal, endereço da página (slug),
  página pública ativa, o que exibir na página (WhatsApp, telefone, e-mail, cidade), observações internas.
- **Parceiro**: nome, logo, categoria, descrição, ecossistema (Dialog ou externo), responsável, WhatsApp,
  e-mail, site, Instagram, ativo.
- **Benefício**: título, descrição, tipo, parceiro que fornece, % de desconto, limite mensal (vezes ou horas),
  exige reserva, associada pode solicitar, regras, cláusula do contrato, ativo.
- **Uso de benefício**: associada, benefício, data, horário, quantidade, status (pendente, confirmado,
  recusado, cancelado), encontro, dados da convidada, origem (admin ou associada), observações.
- **Encontro**: data, início, fim, título, local, descrição e programação.

## Benefícios iniciais (contrato)
a) Encontro Elite presencial, 1 por mês, 10h às 12h.
b) Experiências com especialistas: networking, Pocket Talks, Hot Seats, Pitch & Venda, Mesa de Oportunidades.
c) Participação no grupo estratégico e comunidade.
d) 1 convidada intencional por mês, com cadastro prévio. Avisar quando a convidada já participou antes
   (a prioridade é para quem ainda não participou).
e) Indicações, benefícios do mês, brindes e seleção para o Elite Cast.
f) 2 horas mensais de sala no ecossistema Dialog: pessoais, **não cumulativas**, com reserva.
g) Endereço fiscal (avisar se faltar CNPJ).
h) Até 45% off em planos de horas Dialog. Até 50% off em Dialog Creative, NeuroBusiness e sessões de Advisor.
i) Demais benefícios do ecossistema Clube Dialog.
Condições gerais: descontos não são convertíveis em dinheiro nem necessariamente cumulativos; o almoço
após os encontros é consumo individual.

## Regras
- Benefícios só podem ser usados por associada **adimplente** e com vigência ativa.
- Os limites são por mês, e o saldo não usado não passa para o mês seguinte. Solicitações pendentes já
  reservam saldo.
- O admin pode autorizar uma exceção, com justificativa obrigatória gravada no registro.

## Telas
1. **Login** com abas "Sou associada" e "Administração".
2. **Admin — Painel**: associadas ativas, inadimplentes, usos no mês, horas de sala, solicitações
   pendentes, próximo encontro, uso por benefício, atividade recente.
3. **Admin — Associadas**: lista com busca, filtro e exportação CSV, e cadastro completo. A ficha mostra
   o saldo do mês por benefício, o histórico, os dados, o QR Code e o link da página.
4. **Admin — Uso de benefícios**: registrar, filtrar, relatório associada × benefício, exportar CSV.
5. **Admin — Solicitações**: aprovar ou recusar pedidos das associadas.
6. **Admin — Encontros**: calendário, check-in de presença e convidadas.
7. **Admin — Benefícios** e **Parceiros**: cadastro e vínculo de cada benefício ao parceiro que o fornece.
8. **Página pública da associada** `/m/{slug}`: estilo cartão de visita digital em fundo escuro com
   dourado. Mostra foto, nome, cargo e empresa, frase de destaque e cidade. Os botões são todos clicáveis:
   WhatsApp com mensagem pronta (wa.me), ligar (tel:), e-mail (mailto:), salvar contato (.vcf) e
   compartilhar. Também tem links para as redes, sobre, serviços, segmento e QR Code.
9. **Área da associada**: saldo dos benefícios do mês, reservar sala, cadastrar convidada, solicitar
   descontos, próximos encontros, parceiros com contato, histórico e editar a própria página.

## Segurança (RLS)
A associada vê e edita apenas os próprios dados e a própria página. A página pública expõe apenas os
campos marcados para exibição, nunca CPF, RG, endereço completo ou situação financeira. O admin tem acesso
total.
