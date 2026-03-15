import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    DefinirValor,
    FuncaoConstruto,
    Literal,
    Logico,
    TipoDe,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import {
    Bloco,
    Classe,
    Const,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Falhar,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    Tente,
    Var,
} from '../declaracoes';
import { CaminhoEscolha } from '../interfaces/construtos';

// ---------------------------------------------------------------------------
// Snapshot do contexto de função (usado para salvar/restaurar ao traduzir
// funções aninhadas na travessia da AST)
// ---------------------------------------------------------------------------
interface ContextoFuncao {
    corpoDaFuncaoAtual: string;
    declaracoesLocaisAtual: string;
    locaisDeclaradosAtual: Set<string>;
    dentroFuncao: boolean;
    funcaoTemRetorno: boolean;
    variaveis: Map<string, { watNome: string; tipo: string; escopo: 'local' | 'global' }>;
}

export class TradutorWebAssembly {

    // ── Seções do módulo WAT ───────────────────────────────────────────────

    /** Segmentos de dados estáticos para strings literais */
    private segmentosTexto: { deslocamento: number; conteudo: string; tamanho: number }[] = [];
    /** Próximo byte livre na memória linear para strings */
    private deslocamentoTexto: number = 0;

    /** Texto WAT completo de cada função declarada pelo usuário */
    private funcoesCompletas: string[] = [];

    /** Declarações WAT de variáveis globais `(global ...)` */
    private declaracoesGlobais: string[] = [];

    // ── Contexto da função sendo traduzida no momento ──────────────────────

    /** Instruções WAT emitidas no corpo da função corrente */
    private corpoDaFuncaoAtual: string = '';
    /** Declarações `(param ...)` e `(local ...)` da função corrente */
    private declaracoesLocaisAtual: string = '';
    /** Nomes de locais/params já declarados (evita duplicatas) */
    private locaisDeclaradosAtual: Set<string> = new Set();
    /** Estamos dentro do corpo de uma função nomeada? */
    private dentroFuncao: boolean = false;
    /** A função corrente possui ao menos um `retorna` com valor? */
    private funcaoTemRetorno: boolean = false;

    // ── Mapa de variáveis ─────────────────────────────────────────────────

    /** Nome Delégua → metadados WAT */
    private variaveis: Map<string, { watNome: string; tipo: string; escopo: 'local' | 'global' }> =
        new Map();

    // ── Controle de fluxo (break/continue) ───────────────────────────────

    /** Pilha de rótulos de laço para `sustar`/`continua` */
    private pilhaDeControle: { labelSaida: string; labelLaco: string }[] = [];

    // ── Geração de rótulos ────────────────────────────────────────────────

    private contadorRotulos: number = 0;

    // =========================================================================
    // Helpers internos
    // =========================================================================

    private gerarRotulo(): string {
        return `$L${this.contadorRotulos++}`;
    }

    /** Emite uma instrução indentada no corpo da função corrente. */
    private emitir(instrucao: string): void {
        this.corpoDaFuncaoAtual += `    ${instrucao}\n`;
    }

    /**
     * Internaliza uma string literal na memória linear estática.
     * Strings idênticas são deduplicadas.
     */
    private internalizarTexto(valor: string): { offset: number; len: number } {
        const existente = this.segmentosTexto.find((s) => s.conteudo === valor);
        if (existente) {
            return { offset: existente.deslocamento, len: existente.tamanho };
        }
        const offset = this.deslocamentoTexto;
        // Comprimento em bytes UTF-8 simplificado: para v1 assumimos ASCII
        const len = valor.length;
        this.segmentosTexto.push({ deslocamento: offset, conteudo: valor, tamanho: len });
        this.deslocamentoTexto += len;
        return { offset, len };
    }

    /**
     * Infere o tipo WAT de um construto.
     * Strings → i32 (ponteiro). Tudo mais → i64 (padrão, inclusive booleanos).
     */
    private inferirTipo(construto: Construto): string {
        if (construto instanceof Literal && typeof construto.valor === 'string') return 'i32';
        return 'i64';
    }

    /**
     * Declara um parâmetro ou variável local para a função corrente.
     * `ehParam = true` emite `(param ...)`, senão `(local ...)`.
     */
    private declararParamLocal(nome: string, tipo: string, ehParam: boolean): void {
        if (this.locaisDeclaradosAtual.has(nome)) return;
        this.locaisDeclaradosAtual.add(nome);
        const watNome = `$${nome}`;
        const diretiva = ehParam ? 'param' : 'local';
        this.declaracoesLocaisAtual += ` (${diretiva} ${watNome} ${tipo})`;
        this.variaveis.set(nome, { watNome, tipo, escopo: 'local' });
    }

    /** Salva o contexto da função corrente e inicializa um novo. */
    private salvarEIniciarContextoFuncao(): ContextoFuncao {
        const snapshot: ContextoFuncao = {
            corpoDaFuncaoAtual: this.corpoDaFuncaoAtual,
            declaracoesLocaisAtual: this.declaracoesLocaisAtual,
            locaisDeclaradosAtual: this.locaisDeclaradosAtual,
            dentroFuncao: this.dentroFuncao,
            funcaoTemRetorno: this.funcaoTemRetorno,
            variaveis: new Map(this.variaveis),
        };
        this.corpoDaFuncaoAtual = '';
        this.declaracoesLocaisAtual = '';
        this.locaisDeclaradosAtual = new Set();
        this.dentroFuncao = true;
        this.funcaoTemRetorno = false;
        // Remove locais do mapa — globais permanecem
        for (const [nome, meta] of this.variaveis) {
            if (meta.escopo === 'local') this.variaveis.delete(nome);
        }
        return snapshot;
    }

    /** Restaura o contexto de função a partir de um snapshot. */
    private restaurarContextoFuncao(snapshot: ContextoFuncao): void {
        this.corpoDaFuncaoAtual = snapshot.corpoDaFuncaoAtual;
        this.declaracoesLocaisAtual = snapshot.declaracoesLocaisAtual;
        this.locaisDeclaradosAtual = snapshot.locaisDeclaradosAtual;
        this.dentroFuncao = snapshot.dentroFuncao;
        this.funcaoTemRetorno = snapshot.funcaoTemRetorno;
        this.variaveis = snapshot.variaveis;
    }

    /**
     * Garante que uma variável existe no escopo correto.
     * Retorna o nome WAT da variável (e.g. `$x`).
     */
    private garantirVariavel(nome: string, tipo: string = 'i64'): string {
        if (this.variaveis.has(nome)) {
            return this.variaveis.get(nome)!.watNome;
        }
        if (this.dentroFuncao) {
            this.declararParamLocal(nome, tipo, false);
            return `$${nome}`;
        }
        // Global
        const watNome = `$${nome}`;
        this.declaracoesGlobais.push(`  (global ${watNome} (mut ${tipo}) (${tipo}.const 0))`);
        this.variaveis.set(nome, { watNome, tipo, escopo: 'global' });
        return watNome;
    }

    // =========================================================================
    // Dispatch helpers
    // =========================================================================

    private traduzirConstruto(construto: Construto): string {
        const handler = (this.dicionarioConstrutos as any)[construto.constructor.name];
        if (handler) return handler(construto);
        return `(i64.const 0) ;; construto não suportado: ${construto.constructor.name}`;
    }

    private traduzirDeclaracaoInterna(declaracao: Declaracao): void {
        const handler = (this.dicionarioDeclaracoes as any)[declaracao.constructor.name];
        if (handler) handler(declaracao);
        else this.emitir(`;; declaração não suportada: ${declaracao.constructor.name}`);
    }

    // =========================================================================
    // Dicionário de construtos (expressões)
    // =========================================================================

    dicionarioConstrutos = {
        AcessoIndiceVariavel:    this.traduzirAcessoIndiceVariavel.bind(this),
        AcessoMetodoOuPropriedade: this.traduzirAcessoMetodo.bind(this),
        Agrupamento:             this.traduzirAgrupamento.bind(this),
        AtribuicaoPorIndice:     this.traduzirAtribuicaoPorIndice.bind(this),
        Atribuir:                this.traduzirAtribuir.bind(this),
        Binario:                 this.traduzirBinario.bind(this),
        Chamada:                 this.traduzirChamada.bind(this),
        DefinirValor:            this.traduzirDefinirValor.bind(this),
        FuncaoConstruto:         this.traduzirFuncaoConstruto.bind(this),
        Literal:                 this.traduzirLiteral.bind(this),
        Logico:                  this.traduzirLogico.bind(this),
        TipoDe:                  this.traduzirTipoDe.bind(this),
        Unario:                  this.traduzirUnario.bind(this),
        Variavel:                this.traduzirVariavel.bind(this),
        Vetor:                   this.traduzirVetor.bind(this),
    };

    // =========================================================================
    // Dicionário de declarações (instruções)
    // =========================================================================

    dicionarioDeclaracoes = {
        Bloco:             this.traduzirBloco.bind(this),
        Classe:            this.traduzirClasse.bind(this),
        Const:             this.traduzirConst.bind(this),
        Continua:          this.traduzirContinua.bind(this),
        Enquanto:          this.traduzirEnquanto.bind(this),
        Escolha:           this.traduzirEscolha.bind(this),
        Escreva:           this.traduzirEscreva.bind(this),
        EscrevaMesmaLinha: this.traduzirEscreva.bind(this),
        Expressao:         this.traduzirExpressao.bind(this),
        Falhar:            this.traduzirFalhar.bind(this),
        Fazer:             this.traduzirFazer.bind(this),
        FuncaoDeclaracao:  this.traduzirFuncaoDeclaracao.bind(this),
        Importar:          this.traduzirImportar.bind(this),
        Para:              this.traduzirPara.bind(this),
        ParaCada:          this.traduzirParaCada.bind(this),
        Retorna:           this.traduzirRetorna.bind(this),
        Se:                this.traduzirSe.bind(this),
        Sustar:            this.traduzirSustar.bind(this),
        Tente:             this.traduzirTente.bind(this),
        Var:               this.traduzirVar.bind(this),
    };

    // =========================================================================
    // Construtos
    // =========================================================================

    traduzirLiteral(construto: Literal): string {
        if (typeof construto.valor === 'boolean') {
            return `(i64.const ${construto.valor ? 1 : 0})`;
        }
        if (typeof construto.valor === 'string') {
            // Retorna apenas o ponteiro; `escreva` usa internalizarTexto diretamente
            // para obter o comprimento também.
            const { offset } = this.internalizarTexto(construto.valor);
            return `(i32.const ${offset})`;
        }
        if (typeof construto.valor === 'bigint') {
            return `(i64.const ${construto.valor})`;
        }
        // Número: trunca para i64
        return `(i64.const ${Math.trunc(Number(construto.valor))})`;
    }

    traduzirVariavel(construto: Variavel): string {
        const nome = construto.simbolo?.lexema;
        if (!nome) return '(i64.const 0)';
        const meta = this.variaveis.get(nome);
        if (!meta) return `(i64.const 0) ;; variável desconhecida: ${nome}`;
        const instrucao = meta.escopo === 'local' ? 'local.get' : 'global.get';
        return `(${instrucao} ${meta.watNome})`;
    }

    traduzirAtribuir(construto: Atribuir): string {
        let nome: string | undefined;
        if (construto.alvo instanceof Variavel) {
            nome = construto.alvo.simbolo?.lexema;
        }
        if (!nome) return '(i64.const 0)';

        const tipoInferido = this.inferirTipo(construto.valor);
        const watNome = this.garantirVariavel(nome, tipoInferido);
        const valor = this.traduzirConstruto(construto.valor);
        const meta = this.variaveis.get(nome)!;
        const instrucao = meta.escopo === 'local' ? 'local.set' : 'global.set';
        return `(${instrucao} ${watNome} ${valor})`;
    }

    traduzirBinario(construto: Binario): string {
        const esq = this.traduzirConstruto(construto.esquerda);
        const dir = this.traduzirConstruto(construto.direita);
        const op = construto.operador.lexema;

        switch (op) {
            case '+':  return `(i64.add ${esq} ${dir})`;
            case '-':  return `(i64.sub ${esq} ${dir})`;
            case '*':  return `(i64.mul ${esq} ${dir})`;
            case '/':  return `(i64.div_s ${esq} ${dir})`;
            case '%':  return `(i64.rem_s ${esq} ${dir})`;
            case '<':  return `(i64.extend_i32_s (i64.lt_s ${esq} ${dir}))`;
            case '>':  return `(i64.extend_i32_s (i64.gt_s ${esq} ${dir}))`;
            case '<=': return `(i64.extend_i32_s (i64.le_s ${esq} ${dir}))`;
            case '>=': return `(i64.extend_i32_s (i64.ge_s ${esq} ${dir}))`;
            case '==':
            case '===': return `(i64.extend_i32_s (i64.eq ${esq} ${dir}))`;
            case '!=':
            case '!==': return `(i64.extend_i32_s (i64.ne ${esq} ${dir}))`;
            default:
                return `(i64.const 0) ;; operador não suportado: ${op}`;
        }
    }

    traduzirLogico(construto: Logico): string {
        const esq = this.traduzirConstruto(construto.esquerda);
        const dir = this.traduzirConstruto(construto.direita);
        const op = construto.operador.lexema;

        // Ambos os lados avaliados (sem curto-circuito na v1).
        // Converte i64 → i32 (ne 0), aplica i32.and / i32.or, estende de volta.
        const esqBool = `(i32.ne (i32.const 0) (i32.wrap_i64 ${esq}))`;
        const dirBool = `(i32.ne (i32.const 0) (i32.wrap_i64 ${dir}))`;

        if (op === 'e' || op === '&&') {
            return `(i64.extend_i32_s (i32.and ${esqBool} ${dirBool}))`;
        }
        if (op === 'ou' || op === '||') {
            return `(i64.extend_i32_s (i32.or ${esqBool} ${dirBool}))`;
        }
        return `(i64.const 0) ;; operador lógico não suportado: ${op}`;
    }

    traduzirUnario(construto: Unario): string {
        const op = construto.operador.lexema;
        const operando = this.traduzirConstruto(construto.operando);

        if (op === '-') {
            return `(i64.sub (i64.const 0) ${operando})`;
        }
        if (op === '!' || op === 'nao') {
            return `(i64.extend_i32_s (i64.eqz ${operando}))`;
        }
        if (op === '++' || op === '--') {
            // Apenas pré-incremento/decremento de variável simples na v1
            let nome: string | undefined;
            if (construto.operando instanceof Variavel) {
                nome = construto.operando.simbolo?.lexema;
            }
            if (!nome) return operando;
            const meta = this.variaveis.get(nome);
            if (!meta) return operando;
            const instrSet = meta.escopo === 'local' ? 'local.set' : 'global.set';
            const instrGet = meta.escopo === 'local' ? 'local.get' : 'global.get';
            const delta = op === '++' ? 1 : -1;
            const novoValor = `(i64.add ${operando} (i64.const ${delta}))`;
            // Retorna uma sequência: set + get (usando local.tee para locais, ou set;get para globais)
            if (meta.escopo === 'local') {
                return `(local.tee ${meta.watNome} ${novoValor})`;
            }
            // Para globais não existe tee; emitimos o set e retornamos o get
            this.emitir(`(${instrSet} ${meta.watNome} ${novoValor})`);
            return `(${instrGet} ${meta.watNome})`;
        }
        return operando;
    }

    traduzirAgrupamento(construto: Agrupamento): string {
        return this.traduzirConstruto(construto.expressao);
    }

    traduzirChamada(construto: Chamada): string {
        let nomeFuncao = 'desconhecida';
        if (construto.entidadeChamada instanceof Variavel) {
            nomeFuncao = construto.entidadeChamada.simbolo?.lexema || 'desconhecida';
        }
        const args = construto.argumentos
            .map((arg: Construto) => this.traduzirConstruto(arg))
            .join(' ');
        return `(call $${nomeFuncao}${args ? ' ' + args : ''})`;
    }

    traduzirAcessoIndiceVariavel(construto: AcessoIndiceVariavel): string {
        let baseExpr = '(i32.const 0)';
        if (construto.entidadeChamada instanceof Variavel) {
            const nome = construto.entidadeChamada.simbolo?.lexema;
            const meta = nome ? this.variaveis.get(nome) : undefined;
            if (meta) {
                const instrGet = meta.escopo === 'local' ? 'local.get' : 'global.get';
                baseExpr = `(${instrGet} ${meta.watNome})`;
            }
        }
        const indice = this.traduzirConstruto(construto.indice);
        // base + indice * 8  (cada elemento i64 ocupa 8 bytes)
        const offset = `(i32.add ${baseExpr} (i32.wrap_i64 (i64.mul ${indice} (i64.const 8))))`;
        return `(i64.load ${offset})`;
    }

    traduzirAtribuicaoPorIndice(construto: AtribuicaoPorIndice): string {
        let baseExpr = '(i32.const 0)';
        if (construto.objeto instanceof Variavel) {
            const nome = construto.objeto.simbolo?.lexema;
            const meta = nome ? this.variaveis.get(nome) : undefined;
            if (meta) {
                const instrGet = meta.escopo === 'local' ? 'local.get' : 'global.get';
                baseExpr = `(${instrGet} ${meta.watNome})`;
            }
        }
        const indice = this.traduzirConstruto(construto.indice);
        const valor = this.traduzirConstruto(construto.valor);
        const offset = `(i32.add ${baseExpr} (i32.wrap_i64 (i64.mul ${indice} (i64.const 8))))`;
        return `(i64.store ${offset} ${valor})`;
    }

    traduzirVetor(construto: Vetor): string {
        // Aloca espaço na memória linear para N × 8 bytes.
        // Os valores são emitidos como instruções de store na função corrente.
        const n = construto.valores?.length ?? 0;
        const offset = this.deslocamentoTexto;
        // Reserva n * 8 bytes (sem conteúdo estático; preenchido em tempo de execução)
        this.deslocamentoTexto += n * 8;

        if (construto.valores) {
            for (let i = 0; i < n; i++) {
                const valor = this.traduzirConstruto(construto.valores[i]);
                const enderecoElem = `(i32.const ${offset + i * 8})`;
                this.emitir(`(i64.store ${enderecoElem} ${valor})`);
            }
        }
        return `(i32.const ${offset})`;
    }

    traduzirDefinirValor(construto: DefinirValor): string {
        // Acesso a propriedade de objeto — simplificado na v1
        const valor = this.traduzirConstruto(construto.valor);
        return `${valor} ;; definir valor não totalmente suportado na v1`;
    }

    traduzirFuncaoConstruto(construto: FuncaoConstruto): string {
        // Função anônima: emite como função nomeada com rótulo gerado
        const rotulo = `__anonima_${this.contadorRotulos++}`;
        const snapshot = this.salvarEIniciarContextoFuncao();

        for (const decl of construto.corpo ?? []) {
            this.traduzirDeclaracaoInterna(decl);
        }
        this.emitir('(i64.const 0)');

        const funcWat =
            `  (func $${rotulo}${this.declaracoesLocaisAtual} (result i64)\n` +
            this.corpoDaFuncaoAtual +
            `  )`;
        this.funcoesCompletas.push(funcWat);
        this.restaurarContextoFuncao(snapshot);
        return `(i32.const 0) ;; referência à função anônima $${rotulo}`;
    }

    traduzirAcessoMetodo(_construto: AcessoMetodo): string {
        return '(i64.const 0) ;; acesso a método não suportado na v1';
    }

    traduzirTipoDe(construto: TipoDe): string {
        return this.traduzirConstruto(construto.valor);
    }

    // =========================================================================
    // Declarações
    // =========================================================================

    traduzirVar(declaracao: Var): void {
        const nome = declaracao.simbolo?.lexema;
        if (!nome) return;

        if (declaracao.inicializador instanceof Vetor) {
            // Vetor: aloca em memória e guarda o ponteiro i32 na variável
            if (this.dentroFuncao) {
                this.declararParamLocal(nome, 'i32', false);
            } else {
                this.declaracoesGlobais.push(`  (global $${nome} (mut i32) (i32.const 0))`);
                this.variaveis.set(nome, { watNome: `$${nome}`, tipo: 'i32', escopo: 'global' });
            }
            const ponteiro = this.traduzirVetor(declaracao.inicializador);
            const meta = this.variaveis.get(nome)!;
            const instrSet = meta.escopo === 'local' ? 'local.set' : 'global.set';
            this.emitir(`(${instrSet} $${nome} ${ponteiro})`);
            return;
        }

        const tipo = declaracao.inicializador ? this.inferirTipo(declaracao.inicializador) : 'i64';

        if (this.dentroFuncao) {
            this.declararParamLocal(nome, tipo, false);
            if (declaracao.inicializador) {
                const valor = this.traduzirConstruto(declaracao.inicializador);
                this.emitir(`(local.set $${nome} ${valor})`);
            }
        } else {
            // Globais WAT só aceitam const-exprs como inicializadores.
            // Literais → inicializador imediato; expressões complexas → init 0 + global.set em $principal.
            if (declaracao.inicializador instanceof Literal) {
                const init = this.traduzirGlobalInit(declaracao.inicializador, tipo);
                this.declaracoesGlobais.push(`  (global $${nome} (mut ${tipo}) ${init})`);
                this.variaveis.set(nome, { watNome: `$${nome}`, tipo, escopo: 'global' });
            } else {
                this.declaracoesGlobais.push(`  (global $${nome} (mut ${tipo}) (${tipo}.const 0))`);
                this.variaveis.set(nome, { watNome: `$${nome}`, tipo, escopo: 'global' });
                if (declaracao.inicializador) {
                    const valor = this.traduzirConstruto(declaracao.inicializador);
                    this.emitir(`(global.set $${nome} ${valor})`);
                }
            }
        }
    }

    traduzirConst(declaracao: Const): void {
        const nome = declaracao.simbolo?.lexema;
        if (!nome) return;

        const tipo = this.inferirTipo(declaracao.inicializador);

        if (this.dentroFuncao) {
            // Dentro de função: trata como local (sem imutabilidade real em WAT)
            this.declararParamLocal(nome, tipo, false);
            const valor = this.traduzirConstruto(declaracao.inicializador);
            this.emitir(`(local.set $${nome} ${valor})`);
        } else {
            // Constante global: sem `mut`; apenas literais são válidos como init
            if (declaracao.inicializador instanceof Literal) {
                const init = this.traduzirGlobalInit(declaracao.inicializador, tipo);
                this.declaracoesGlobais.push(`  (global $${nome} ${tipo} ${init})`);
            } else {
                // Expressão complexa: global imutável não pode ser sobrescrita em WAT.
                // Tratamos como mutável para permitir inicialização tardia.
                this.declaracoesGlobais.push(`  (global $${nome} (mut ${tipo}) (${tipo}.const 0))`);
                const valor = this.traduzirConstruto(declaracao.inicializador);
                this.emitir(`(global.set $${nome} ${valor})`);
            }
            this.variaveis.set(nome, { watNome: `$${nome}`, tipo, escopo: 'global' });
        }
    }

    /**
     * Traduz um literal para um WAT const-expr válido como inicializador de global.
     * Apenas literais são aceitos como inicializadores de globais em WAT.
     */
    private traduzirGlobalInit(construto: Literal, tipo: string): string {
        if (typeof construto.valor === 'boolean') return `(i64.const ${construto.valor ? 1 : 0})`;
        if (typeof construto.valor === 'string') {
            const { offset } = this.internalizarTexto(construto.valor);
            return `(i32.const ${offset})`;
        }
        if (typeof construto.valor === 'bigint') return `(i64.const ${construto.valor})`;
        return `(${tipo}.const ${Math.trunc(Number(construto.valor))})`;
    }

    traduzirSe(declaracao: Se): void {
        const condicao = this.traduzirConstruto(declaracao.condicao);

        this.emitir(`(if`);
        this.emitir(`  (i32.wrap_i64 ${condicao})`);
        this.emitir(`  (then`);

        if (this.dicionarioDeclaracoes[declaracao.caminhoEntao.constructor.name as keyof typeof this.dicionarioDeclaracoes]) {
            const corpoPrevio = this.corpoDaFuncaoAtual;
            this.corpoDaFuncaoAtual = '';
            this.traduzirDeclaracaoInterna(declaracao.caminhoEntao);
            const corpoEntao = this.corpoDaFuncaoAtual
                .split('\n')
                .map((l) => `  ${l}`)
                .join('\n');
            this.corpoDaFuncaoAtual = corpoPrevio + corpoEntao;
        }

        this.emitir(`  )`);

        if (declaracao.caminhoSenao) {
            this.emitir(`  (else`);
            const corpoPrevio = this.corpoDaFuncaoAtual;
            this.corpoDaFuncaoAtual = '';
            this.traduzirDeclaracaoInterna(declaracao.caminhoSenao);
            const corpoSenao = this.corpoDaFuncaoAtual
                .split('\n')
                .map((l) => `  ${l}`)
                .join('\n');
            this.corpoDaFuncaoAtual = corpoPrevio + corpoSenao;
            this.emitir(`  )`);
        }

        this.emitir(`)`);
    }

    traduzirEnquanto(declaracao: Enquanto): void {
        const labelSaida = this.gerarRotulo();
        const labelLaco = this.gerarRotulo();
        this.pilhaDeControle.push({ labelSaida, labelLaco });

        const condicao = this.traduzirConstruto(declaracao.condicao);

        this.emitir(`(block ${labelSaida}`);
        this.emitir(`  (loop ${labelLaco}`);
        this.emitir(`    (br_if ${labelSaida}`);
        this.emitir(`      (i32.eqz (i32.wrap_i64 ${condicao}))`);
        this.emitir(`    )`);

        this.traduzirDeclaracaoInterna(declaracao.corpo);

        this.emitir(`    (br ${labelLaco})`);
        this.emitir(`  )`);
        this.emitir(`)`);

        this.pilhaDeControle.pop();
    }

    traduzirPara(declaracao: Para): void {
        // Inicializador
        if (declaracao.inicializador) {
            if (Array.isArray(declaracao.inicializador)) {
                for (const decl of declaracao.inicializador) {
                    this.traduzirDeclaracaoInterna(decl);
                }
            } else {
                this.traduzirDeclaracaoInterna(declaracao.inicializador as Declaracao);
            }
        }

        const labelSaida = this.gerarRotulo();
        const labelLaco = this.gerarRotulo();
        this.pilhaDeControle.push({ labelSaida, labelLaco });

        const condicao = declaracao.condicao
            ? this.traduzirConstruto(declaracao.condicao)
            : '(i64.const 1)';

        this.emitir(`(block ${labelSaida}`);
        this.emitir(`  (loop ${labelLaco}`);
        this.emitir(`    (br_if ${labelSaida}`);
        this.emitir(`      (i32.eqz (i32.wrap_i64 ${condicao}))`);
        this.emitir(`    )`);

        if (declaracao.corpo) {
            this.traduzirDeclaracaoInterna(declaracao.corpo);
        }

        if (declaracao.incrementar) {
            const inc = this.traduzirConstruto(declaracao.incrementar);
            this.emitir(`(drop ${inc})`);
        }

        this.emitir(`    (br ${labelLaco})`);
        this.emitir(`  )`);
        this.emitir(`)`);

        this.pilhaDeControle.pop();
    }

    traduzirFazer(declaracao: Fazer): void {
        const labelSaida = this.gerarRotulo();
        const labelLaco = this.gerarRotulo();
        this.pilhaDeControle.push({ labelSaida, labelLaco });

        this.emitir(`(block ${labelSaida}`);
        this.emitir(`  (loop ${labelLaco}`);

        if (declaracao.caminhoFazer?.declaracoes) {
            for (const decl of declaracao.caminhoFazer.declaracoes) {
                this.traduzirDeclaracaoInterna(decl);
            }
        }

        if (declaracao.condicaoEnquanto) {
            const condicao = this.traduzirConstruto(declaracao.condicaoEnquanto);
            // Repete se a condição for verdadeira
            this.emitir(`    (br_if ${labelLaco}`);
            this.emitir(`      (i32.wrap_i64 ${condicao})`);
            this.emitir(`    )`);
        }

        this.emitir(`  )`);
        this.emitir(`)`);

        this.pilhaDeControle.pop();
    }

    traduzirEscolha(declaracao: Escolha): void {
        const rotuloEscolha = `__escolha_${this.contadorRotulos++}`;
        const tipo = 'i64';

        // Declara local temporário para o valor do escolha
        this.declararParamLocal(rotuloEscolha, tipo, false);
        const sujeito = this.traduzirConstruto(declaracao.identificadorOuLiteral);
        this.emitir(`(local.set $${rotuloEscolha} ${sujeito})`);

        // Gera cadeia de if/else aninhados
        this.emitirCadeiaEscolha(rotuloEscolha, declaracao.caminhos, declaracao.caminhoPadrao);
    }

    private emitirCadeiaEscolha(
        rotuloEscolha: string,
        caminhos: CaminhoEscolha[],
        caminhoPadrao: CaminhoEscolha | null | undefined,
        indice: number = 0
    ): void {
        if (indice >= caminhos.length) {
            // Emite o caminho padrão (senao) se existir
            if (caminhoPadrao) {
                for (const decl of caminhoPadrao.declaracoes ?? []) {
                    this.traduzirDeclaracaoInterna(decl);
                }
            }
            return;
        }

        const caminho = caminhos[indice];
        if (!caminho.condicoes || caminho.condicoes.length === 0) {
            this.emitirCadeiaEscolha(rotuloEscolha, caminhos, caminhoPadrao, indice + 1);
            return;
        }

        // Condição: qualquer das condicoes casa com o valor do escolha
        const primeiraCond = `(i64.eq (local.get $${rotuloEscolha}) ${this.traduzirConstruto(caminho.condicoes[0])})`;
        let condicaoFinal = primeiraCond;
        for (let i = 1; i < caminho.condicoes.length; i++) {
            const outraCond = `(i64.eq (local.get $${rotuloEscolha}) ${this.traduzirConstruto(caminho.condicoes[i])})`;
            condicaoFinal = `(i32.or ${condicaoFinal} ${outraCond})`;
        }

        this.emitir(`(if`);
        this.emitir(`  ${condicaoFinal}`);
        this.emitir(`  (then`);
        for (const decl of caminho.declaracoes ?? []) {
            this.traduzirDeclaracaoInterna(decl);
        }
        this.emitir(`  )`);

        const temProximo = indice + 1 < caminhos.length || caminhoPadrao != null;
        if (temProximo) {
            this.emitir(`  (else`);
            this.emitirCadeiaEscolha(rotuloEscolha, caminhos, caminhoPadrao, indice + 1);
            this.emitir(`  )`);
        }

        this.emitir(`)`);
    }

    traduzirBloco(declaracao: Bloco): void {
        for (const decl of declaracao.declaracoes ?? []) {
            this.traduzirDeclaracaoInterna(decl);
        }
    }

    traduzirExpressao(declaracao: Expressao): void {
        if (!declaracao.expressao) return;
        const expr = this.traduzirConstruto(declaracao.expressao);
        // Atribuições e stores não deixam valor na pilha; outros sim → drop
        const deixaValor =
            !(declaracao.expressao instanceof Atribuir) &&
            !(declaracao.expressao instanceof AtribuicaoPorIndice);
        if (deixaValor) {
            this.emitir(`(drop ${expr})`);
        } else {
            this.emitir(expr);
        }
    }

    traduzirEscreva(declaracao: Escreva | EscrevaMesmaLinha): void {
        for (const arg of declaracao.argumentos) {
            if (arg instanceof Literal && typeof arg.valor === 'string') {
                const { offset, len } = this.internalizarTexto(arg.valor);
                this.emitir(`(call $__escreva_texto (i32.const ${offset}) (i32.const ${len}))`);
            } else {
                const expr = this.traduzirConstruto(arg);
                this.emitir(`(call $__escreva_inteiro ${expr})`);
            }
        }
    }

    traduzirRetorna(declaracao: Retorna): void {
        this.funcaoTemRetorno = true;
        if (declaracao.valor) {
            const valor = this.traduzirConstruto(declaracao.valor);
            this.emitir(`(return ${valor})`);
        } else {
            this.emitir(`(return (i64.const 0))`);
        }
    }

    traduzirSustar(_declaracao: Sustar): void {
        const topo = this.pilhaDeControle[this.pilhaDeControle.length - 1];
        if (topo) {
            this.emitir(`(br ${topo.labelSaida})`);
        }
    }

    traduzirContinua(_declaracao: Continua): void {
        const topo = this.pilhaDeControle[this.pilhaDeControle.length - 1];
        if (topo) {
            this.emitir(`(br ${topo.labelLaco})`);
        }
    }

    traduzirFuncaoDeclaracao(declaracao: FuncaoDeclaracao): void {
        const nome = declaracao.simbolo?.lexema ?? `__func_${this.contadorRotulos++}`;
        const snapshot = this.salvarEIniciarContextoFuncao();

        // Declara parâmetros
        for (const param of declaracao.funcao?.parametros ?? []) {
            this.declararParamLocal(param.nome.lexema, 'i64', true);
        }

        // Traduz corpo
        for (const decl of declaracao.funcao?.corpo ?? []) {
            this.traduzirDeclaracaoInterna(decl);
        }

        // Retorno implícito 0 (garante stack completo)
        this.emitir('(i64.const 0)');

        const ehPrincipal = nome === 'principal';
        const exportar = ehPrincipal ? ' (export "principal")' : '';
        const funcWat =
            `  (func $${nome}${exportar}${this.declaracoesLocaisAtual} (result i64)\n` +
            this.corpoDaFuncaoAtual +
            `  )`;
        this.funcoesCompletas.push(funcWat);

        this.restaurarContextoFuncao(snapshot);
    }

    traduzirFalhar(declaracao: Falhar): void {
        // `unreachable` = trap incondicional em WebAssembly
        let msg = '';
        if (declaracao.explicacao) {
            try {
                msg = ` ;; ${this.traduzirConstruto(declaracao.explicacao as Construto)}`;
            } catch {
                // ignore
            }
        }
        this.emitir(`(unreachable)${msg}`);
    }

    traduzirImportar(_declaracao: Importar): void {
        this.emitir(`;; importar não suportado em WebAssembly nativo`);
    }

    traduzirTente(declaracao: Tente): void {
        this.emitir(`;; tente/pegue: tratamento de exceções é v2`);
        for (const decl of declaracao.caminhoTente ?? []) {
            this.traduzirDeclaracaoInterna(decl);
        }
    }

    traduzirClasse(_declaracao: Classe): void {
        this.emitir(`;; classe: não suportada na v1`);
    }

    traduzirParaCada(declaracao: ParaCada): void {
        this.emitir(`;; para cada: requer suporte a iteráveis (v2)`);
        if (declaracao.corpo) {
            this.traduzirDeclaracaoInterna(declaracao.corpo);
        }
    }

    // =========================================================================
    // Método principal
    // =========================================================================

    /**
     * Traduz uma lista de declarações Delégua para um módulo WAT.
     * Retorna a string completa do módulo.
     */
    traduzir(declaracoes: Declaracao[]): string {
        // Verifica se o usuário declarou explicitamente `funcao principal()`
        const principalDeclarado = declaracoes.some(
            (d) => d instanceof FuncaoDeclaracao && d.simbolo?.lexema === 'principal'
        );

        // Processa todas as declarações de nível superior
        for (const declaracao of declaracoes) {
            this.traduzirDeclaracaoInterna(declaracao);
        }

        // Se o usuário não declarou principal(), envolve os stmts de topo em $principal
        if (!principalDeclarado) {
            const corpoTopo = this.corpoDaFuncaoAtual;
            const locaisDeclarados = this.declaracoesLocaisAtual;
            const funcPrincipal =
                `  (func $principal (export "principal")${locaisDeclarados} (result i64)\n` +
                corpoTopo +
                `    (i64.const 0)\n` +
                `  )`;
            this.funcoesCompletas.push(funcPrincipal);
        }

        // ── Monta as seções do módulo ────────────────────────────────────────

        const linhasImports = [
            `  (import "delegua" "escreva_texto"   (func $__escreva_texto   (param i32 i32)))`,
            `  (import "delegua" "escreva_inteiro" (func $__escreva_inteiro (param i64)))`,
        ];

        const linhaMemoria = `  (memory (export "memory") 1)`;

        const linhasDados = this.segmentosTexto.map(
            (s) => `  (data (i32.const ${s.deslocamento}) "${s.conteudo}")`
        );

        const partes: string[] = [
            '(module',
            ...linhasImports,
            '',
            linhaMemoria,
        ];

        if (linhasDados.length > 0) {
            partes.push('');
            partes.push(...linhasDados);
        }

        if (this.declaracoesGlobais.length > 0) {
            partes.push('');
            partes.push(...this.declaracoesGlobais);
        }

        if (this.funcoesCompletas.length > 0) {
            partes.push('');
            partes.push(...this.funcoesCompletas);
        }

        partes.push(')');

        return partes.join('\n');
    }

    // =========================================================================
    // Arquivo host JavaScript
    // =========================================================================

    /**
     * Gera um arquivo `.mjs` host para executar o módulo WASM no Node.js.
     * Fornece os imports necessários (`delegua.escreva_texto`, `delegua.escreva_inteiro`).
     */
    gerarArquivoHost(): string {
        return `// Gerado por Delégua -> WebAssembly
// Uso: node delegua-host.mjs <arquivo.wasm>
import { readFileSync } from 'fs';

const args = process.argv.slice(2);
const wasmPath = args[0] ?? 'saida.wasm';

let memoryExport;

const importObject = {
    delegua: {
        /** Imprime texto a partir de um ponteiro e comprimento na memória linear. */
        escreva_texto(ptr, len) {
            const bytes = new Uint8Array(memoryExport.buffer, ptr, len);
            process.stdout.write(new TextDecoder('utf-8').decode(bytes));
        },
        /** Imprime um inteiro de 64 bits (recebido como BigInt no JS). */
        escreva_inteiro(valor) {
            process.stdout.write(String(valor));
        },
    }
};

const wasmBuffer = readFileSync(wasmPath);
const { instance } = await WebAssembly.instantiate(wasmBuffer, importObject);
memoryExport = instance.exports.memory;

const codigoSaida = Number(instance.exports.principal());
process.exit(codigoSaida);
`;
    }
}
