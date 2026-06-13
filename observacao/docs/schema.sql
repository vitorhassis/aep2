-- ============================================================
-- ObservAção — Schema PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Sequence para número de protocolo
CREATE SEQUENCE IF NOT EXISTS protocolo_seq START 1;

-- ============================================================
-- USUARIOS
-- ============================================================
CREATE TABLE usuarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    perfil      VARCHAR(20) NOT NULL CHECK (perfil IN ('ADMIN', 'CIDADAO')),
    ativo       BOOLEAN NOT NULL DEFAULT true,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CATEGORIAS
-- ============================================================
CREATE TABLE categorias (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(100) NOT NULL UNIQUE,
    descricao   TEXT,
    icone       VARCHAR(50),         -- nome do ícone lucide-react
    cor         VARCHAR(7),          -- hex, ex: #3B82F6
    ativa       BOOLEAN NOT NULL DEFAULT true,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SOLICITACOES
-- ============================================================
CREATE TABLE solicitacoes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocolo       VARCHAR(20) NOT NULL UNIQUE,
    titulo          VARCHAR(255) NOT NULL,
    descricao       TEXT NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'ABERTA'
                    CHECK (status IN ('ABERTA','EM_ANALISE','EM_ATENDIMENTO','RESOLVIDA','INDEFERIDA')),
    anonima         BOOLEAN NOT NULL DEFAULT false,
    -- se anonima=false e usuario logado, referencia o usuario; pode ser NULL se anônimo sem conta
    usuario_id      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    -- se anonima=true mas quer receber por email (opcional)
    email_contato   VARCHAR(255),
    categoria_id    UUID NOT NULL REFERENCES categorias(id),
    resposta_admin  TEXT,
    -- localização opcional
    logradouro      VARCHAR(255),
    bairro          VARCHAR(100),
    complemento     VARCHAR(255),
    latitude        NUMERIC(10,7),
    longitude       NUMERIC(10,7),
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- HISTORICO DE STATUS
-- ============================================================
CREATE TABLE historico_status (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitacao_id  UUID NOT NULL REFERENCES solicitacoes(id) ON DELETE CASCADE,
    status_anterior VARCHAR(30),
    status_novo     VARCHAR(30) NOT NULL,
    observacao      TEXT,
    alterado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expira_em   TIMESTAMPTZ NOT NULL,
    revogado    BOOLEAN NOT NULL DEFAULT false,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_solicitacoes_protocolo    ON solicitacoes(protocolo);
CREATE INDEX idx_solicitacoes_usuario      ON solicitacoes(usuario_id);
CREATE INDEX idx_solicitacoes_status       ON solicitacoes(status);
CREATE INDEX idx_solicitacoes_categoria    ON solicitacoes(categoria_id);
CREATE INDEX idx_solicitacoes_criado_em    ON solicitacoes(criado_em DESC);
CREATE INDEX idx_historico_solicitacao     ON historico_status(solicitacao_id);
CREATE INDEX idx_refresh_tokens_token      ON refresh_tokens(token);

-- ============================================================
-- FUNCTION: gerar número de protocolo
-- ============================================================
CREATE OR REPLACE FUNCTION gerar_protocolo()
RETURNS VARCHAR AS $$
DECLARE
    seq_val BIGINT;
    ano_mes VARCHAR(6);
BEGIN
    seq_val := nextval('protocolo_seq');
    ano_mes := TO_CHAR(NOW(), 'YYYYMM');
    RETURN 'OBS-' || ano_mes || '-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-gerar protocolo
CREATE OR REPLACE FUNCTION trigger_gerar_protocolo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.protocolo IS NULL OR NEW.protocolo = '' THEN
        NEW.protocolo := gerar_protocolo();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protocolo
    BEFORE INSERT ON solicitacoes
    FOR EACH ROW EXECUTE FUNCTION trigger_gerar_protocolo();

-- Trigger updated_at
CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER trg_categorias_updated_at
    BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER trg_solicitacoes_updated_at
    BEFORE UPDATE ON solicitacoes
    FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- ============================================================
-- SEED: Admin padrão + categorias iniciais
-- ============================================================
INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
-- senha: Admin@123 (bcrypt)
('Administrador', 'admin@observacao.gov.br',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGTrCntFKQhTv8G0Hp8RH.5HWVW', 'ADMIN');

INSERT INTO categorias (nome, descricao, icone, cor) VALUES
('Infraestrutura',    'Buracos, calçadas, obras e pavimentação',         'Construction', '#F59E0B'),
('Iluminação',        'Postes apagados, fiações expostas',               'Lightbulb',    '#EAB308'),
('Limpeza Urbana',    'Coleta de lixo, limpeza de vias e terrenos',      'Trash2',       '#10B981'),
('Segurança',         'Ocorrências e situações de risco',                'Shield',       '#EF4444'),
('Meio Ambiente',     'Desmatamento, poluição, animais abandonados',     'Leaf',         '#22C55E'),
('Transporte',        'Ônibus, sinalização, semáforos',                  'Bus',          '#3B82F6'),
('Saúde',             'Unidades de saúde, serviços médicos',             'HeartPulse',   '#EC4899'),
('Educação',          'Escolas, creches, equipamentos educacionais',     'GraduationCap','#8B5CF6'),
('Outros',            'Demais solicitações não categorizadas',           'MoreHorizontal','#6B7280');
