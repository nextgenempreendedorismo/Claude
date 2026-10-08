# Planos gratuitos (free tiers)

Levantamento feito em **outubro de 2026**. Os limites mudam com frequência: confira a página oficial antes de depender de um número.

Legenda: ✅ conferido na página oficial · ⚠️ fontes de terceiros (podem divergir)

Para a lista completa (centenas de serviços), veja [free-for-dev](https://github.com/ripienaar/free-for-dev).

## Ferramentas que já usamos

| Serviço | Grátis | Pegadinhas |
|---|---|---|
| [Supabase](https://supabase.com/pricing) ✅ | 2 projetos ativos · banco 500 MB · arquivos 1 GB (upload máx. 50 MB) · 5 GB egress · 50 mil usuários ativos/mês · 500 mil Edge Functions · Realtime 200 conexões e 2 mi mensagens | Projeto **pausa após 1 semana sem uso** |
| [Lovable](https://lovable.dev/pricing) ⚠️ | 5 créditos/dia, até 30/mês · 20 créditos Cloud e 4 de IA por mês | Projetos públicos, sem domínio próprio; créditos não acumulam |
| [Metricool](https://metricool.com/pricing) ⚠️ | 1 marca · 20 posts agendados/mês · 5 concorrentes · 30 dias de analytics · MCP incluso | LinkedIn e X não entram no grátis |
| [GitHub](https://docs.github.com/en/get-started/learning-about-github/githubs-plans) ⚠️ | Repos ilimitados · Actions 2.000 min/mês (privados; públicos são grátis) · Codespaces 120 h-core e 15 GB · Packages 500 MB | Copilot Free passou para créditos em jun/2026 (limites não confirmados) |
| Google Drive | 15 GB compartilhados com Gmail e Fotos | — |

## Hospedagem / deploy

| Serviço | Grátis | Pegadinhas |
|---|---|---|
| [Vercel Hobby](https://vercel.com/docs/limits/fair-use-guidelines) ✅ | 100 GB de tráfego · 1 mi de invocações · 4 h de CPU ativa · 360 GB-h de memória · 5 mil otimizações de imagem | **Proibido uso comercial**; função máx. 10 s; logs de 1 h |
| [Cloudflare Workers/Pages](https://developers.cloudflare.com/workers/platform/limits/) ⚠️ | 100 mil requisições/dia · Pages com tráfego ilimitado | Contador zera à meia-noite UTC |
| [Netlify](https://www.netlify.com/pricing/) ⚠️ | 300 créditos/mês (deploy de produção = 15 créditos) | Ao acabar, **todos os sites saem do ar** até o mês seguinte |
| [Render](https://render.com/docs/free) ⚠️ | 750 h/mês de web service | Dorme após 15 min sem tráfego (~1 min para acordar); Postgres grátis expira em 30 dias |
| [Railway](https://railway.com/pricing) ⚠️ | Teste de US$ 5 (30 dias), depois US$ 1/mês | Quase não é um plano grátis |
| [Fly.io](https://fly.io/docs/about/pricing/) ⚠️ | Sem plano grátis; só teste curto | Pague pelo uso |

## Banco de dados

| Serviço | Grátis | Pegadinhas |
|---|---|---|
| Supabase | ver acima | — |
| [Neon](https://neon.com/pricing) ⚠️ | 100 projetos · 0,5 GB e 100 CU-hora por projeto · 10 branches | Dorme após 5 min (cold start de segundos) |
| [Cloudflare D1/R2](https://developers.cloudflare.com/r2/pricing/) ⚠️ | D1: 5 GB · R2: 10 GB, 1 mi escritas e 10 mi leituras/mês, **sem custo de egress** | Desde set/2026 o D1 dá erro ao estourar a cota diária |
| [MongoDB Atlas M0](https://www.mongodb.com/pricing) ⚠️ | 512 MB · 100 ops/s · 500 conexões | Cluster compartilhado |
| [Upstash Redis](https://upstash.com/docs/redis/overall/billing) ⚠️ | 256 MB · 500 mil comandos/mês · 10 GB de banda · 1 banco | — |
| [Turso](https://turso.tech/pricing) ⚠️ | 5 GB · 500 mi leituras e 10 mi escritas de linhas/mês · 100 bancos | — |
| [Firebase Spark](https://firebase.google.com/pricing) ⚠️ | Firestore: 50 mil leituras, 20 mil escritas e 20 mil exclusões/dia · 1 GiB | Estourou, o produto **para até o fim do mês** |

## Login / autenticação

| Serviço | Grátis | Pegadinhas |
|---|---|---|
| Supabase Auth | 50 mil usuários ativos/mês | — |
| [Clerk](https://clerk.com/pricing) ⚠️ | 50 mil usuários retidos/mês · 100 organizações | Só conta quem volta após 24 h |

## E-mail

| Serviço | Grátis | Pegadinhas |
|---|---|---|
| [Resend](https://resend.com/pricing) ⚠️ | 3.000/mês · 1 domínio | **Máx. 100 por dia** |
| [Brevo](https://www.brevo.com/pricing/) ⚠️ | 300/dia (~9 mil/mês) · 100 mil contatos | 1 usuário; marca Brevo nos e-mails |

## APIs de IA

| Serviço | Grátis | Pegadinhas |
|---|---|---|
| [Google Gemini](https://ai.google.dev/gemini-api/docs/rate-limits) ⚠️ | Só modelos Flash/Flash-Lite, com limite por minuto e por dia | Mudou várias vezes em 2026; veja no AI Studio. Dados podem ser usados para treino |
| [Groq](https://console.groq.com/settings/limits) ⚠️ | ~30 req/min e 1.000 req/dia por modelo (Llama 3.1 8B: 14.400/dia) | Limite por conta, não por chave |
| [OpenRouter](https://openrouter.ai/docs/api-reference/limits) ⚠️ | Modelos `:free` · 20 req/min · 50/dia (1.000/dia após comprar US$ 10 uma vez) | Modelos grátis podem sumir |

## Monitoramento / analytics

| Serviço | Grátis | Pegadinhas |
|---|---|---|
| [Sentry](https://sentry.io/pricing/) ⚠️ | 5 mil erros/mês · 1 usuário | Excedente é descartado |
| [PostHog](https://posthog.com/pricing) ⚠️ | 1 mi de eventos/mês (product + web analytics) | — |

## Automação

| Serviço | Grátis | Pegadinhas |
|---|---|---|
| [Make](https://www.make.com/en/pricing) ⚠️ | 1.000 créditos/mês · 2 cenários ativos | Roda no máx. a cada 15 min |
| [Zapier](https://zapier.com/pricing) ⚠️ | 100 tarefas/mês | Cada passo conta como tarefa |
| [n8n](https://n8n.io/pricing/) ⚠️ | Cloud: só teste de 14 dias · Self-hosted: grátis e ilimitado | Self-hosted exige servidor próprio |

## Combinação grátis sugerida

Lovable (prototipar) → GitHub (código) → Vercel ou Cloudflare Pages (site) → Supabase (banco + login + arquivos) → Resend (e-mail) → PostHog e Sentry (métricas e erros).

Se o projeto **cobra dinheiro**, troque Vercel Hobby por Cloudflare Pages ou Netlify: o Vercel grátis proíbe uso comercial.
