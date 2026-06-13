# ObservAção — Arquitetura do Sistema

## Stack
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS v4 + shadcn/ui
- **Backend**: Java 21 + Spring Boot 3.3 + Spring Security 6 (JWT)
- **Banco**: PostgreSQL 16
- **Design Reference**: VetCRM (sidebar escura, cards, badges de status, tabelas)

## Estrutura de Domínio

### Entidades Principais
```
Usuario        → ADMIN | CIDADAO
Categoria      → criada/gerida por ADMIN
Solicitacao    → criada por CIDADAO (ou anônimo)
  └── historico_status  → log de mudanças de status
```

### Status de Solicitação
```
ABERTA → EM_ANALISE → EM_ATENDIMENTO → RESOLVIDA
                   ↘ INDEFERIDA
```

### Número de Protocolo
Formato: `OBS-{ANO}{MES}-{SEQUENCIAL 6 dígitos}`
Exemplo: `OBS-202506-000001`
Gerado no backend via sequence do PostgreSQL.

---

## Módulos por Perfil

### CIDADÃO
- `/` → Dashboard com seus protocolos recentes + busca por protocolo
- `/solicitacoes` → Lista suas solicitações + filtro por status + busca por protocolo
- `/solicitacoes/nova` → Formulário de criação (com opção de anônimo)
- `/solicitacoes/:protocolo` → Detalhe da solicitação

### ADMIN
- `/admin` → Dashboard com métricas agregadas
- `/admin/solicitacoes` → Todas as solicitações + filtros + alterar status + responder
- `/admin/categorias` → CRUD de categorias

---

## Segurança
- JWT com `accessToken` (15min) + `refreshToken` (7 dias, HttpOnly cookie)
- Endpoints públicos: `POST /auth/login`, `POST /auth/refresh`, `POST /solicitacoes` (anônimo), `GET /solicitacoes/protocolo/:numero`
- Validação de ownership: CIDADÃO só vê/deleta as próprias solicitações

---

## Variáveis de Ambiente

### Backend (`application.yml`)
```
POSTGRES_URL, POSTGRES_USER, POSTGRES_PASSWORD
JWT_SECRET (256-bit base64)
JWT_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000
```

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:8080/api
```
