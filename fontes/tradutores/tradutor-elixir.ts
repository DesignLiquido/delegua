import {
    AcessoElementoMatriz,
    AcessoIndiceVariavel,
    AcessoIntervaloVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    AtribuicaoPorIndice,
    AtribuicaoPorIndicesMatriz,
    Atribuir,
    Binario,
    Chamada,
    ComentarioComoConstruto,
    Constante,
    DefinirValor,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    FuncaoConstruto,
    Isto,
    Leia,
    Literal,
    Logico,
    ReferenciaFuncao,
    Separador,
    Super,
    TipoDe,
    Tupla,
    TuplaN,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';

import {
    Bloco,
    CabecalhoPrograma,
    Classe,
    Comentario,
    Const,
    ConstMultiplo,
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
    InicioAlgoritmo,
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    TendoComo,
    Tente,
    TextoDocumentacao,
    Var,
    VarMultiplo,
} from '../declaracoes';

import { ContinuarQuebra, SustarQuebra } from '../quebras';
import { TradutorInterface, VisitanteComumInterface } from '../interfaces';
import { SimboloInterface } from '../interfaces/simbolo-interface';
import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

/**
 * Tradutor que converte código Delégua para Elixir.
 *
 * Elixir é uma linguagem funcional, então algumas conversões são necessárias:
 * - Classes → Módulos com structs
 * - Métodos → Funções que recebem structs como primeiro parâmetro
 * - Loops imperativos → Funções recursivas ou Enum.each
 * - Variables → Bindings imutáveis
 */
export class TradutorElixir implements TradutorInterface<Declaracao>, VisitanteComumInterface {
    indentacaoAtual: number;
    moduloAtual: string | null;
    modulosConhecidos: Set<string>;
    funcoesConhecidas: Set<string>;
    atributosModulo: Map<string, string>;
    dentroDeMetodo: boolean;
    nomeParametroStruct: string | null;
    contadorVariavelTemporaria: number;
    /** Nome do módulo implícito usado para envolver funções declaradas no escopo global (resolve #1408). */
    nomeModuloGlobal: string;
    /** Indica se a tradução em curso está dentro do módulo implícito de funções globais. */
    dentroDeModuloGlobal: boolean;
    /**
     * Métodos de vetor que mutam o vetor original em Delégua (via `push`, `sort`, etc.).
     * Em Elixir os dados são imutáveis, então quando uma chamada a um desses métodos
     * aparece como declaração isolada (valor de retorno descartado), é preciso
     * reatribuir o resultado de volta à variável original (resolve #1410).
     */
    protected metodosVetorMutantes: Set<string>;

    constructor() {
        this.indentacaoAtual = 0;
        this.moduloAtual = null;
        this.modulosConhecidos = new Set();
        this.funcoesConhecidas = new Set();
        this.atributosModulo = new Map();
        this.dentroDeMetodo = false;
        this.nomeParametroStruct = null;
        this.contadorVariavelTemporaria = 0;
        this.nomeModuloGlobal = 'Main';
        this.dentroDeModuloGlobal = false;
        this.metodosVetorMutantes = new Set([
            'adicionar',
            'empilhar',
            'remover',
            'inverter',
            'ordenar',
        ]);
    }

    /**
     * Adiciona a indentação atual (Elixir usa 2 espaços por convenção)
     */
    protected adicionarIndentacao(): string {
        return ' '.repeat(this.indentacaoAtual);
    }

    /**
     * Aumenta o nível de indentação em 2 espaços
     */
    protected aumentarIndentacao(): void {
        this.indentacaoAtual += 2;
    }

    /**
     * Diminui o nível de indentação em 2 espaços
     */
    protected diminuirIndentacao(): void {
        this.indentacaoAtual -= 2;
        if (this.indentacaoAtual < 0) {
            this.indentacaoAtual = 0;
        }
    }

    /**
     * Converte identificadores de camelCase para snake_case (convenção Elixir)
     */
    protected converterIdentificador(nome: string): string {
        return nome
            .replace(/([A-Z])/g, '_$1')
            .toLowerCase()
            .replace(/^_/, '');
    }

    /**
     * Converte nomes de classes/módulos, preservando PascalCase
     */
    protected converterNomeModulo(nome: string): string {
        return nome.charAt(0).toUpperCase() + nome.slice(1);
    }

    protected mapearTipoParaTypespec(tipo: string | undefined): string {
        switch (tipo) {
            case 'texto':
                return 'String.t()';
            case 'numero':
            case 'inteiro':
                return 'integer()';
            case 'real':
                return 'float()';
            case 'logico':
                return 'boolean()';
            case 'vazio':
                return 'no_return()';
            default:
                return 'term()';
        }
    }

    /**
     * Gera nome único para variável temporária
     */
    protected gerarVariavelTemporaria(): string {
        return `_temp_${this.contadorVariavelTemporaria++}`;
    }

    /**
     * Mapeia operadores Delégua para Elixir
     */
    protected traduzirOperador(simbolo: SimboloInterface): string {
        const tipoSimbolo = simbolo.tipo;

        switch (tipoSimbolo) {
            // Aritméticos
            case tiposDeSimbolos.ADICAO:
                return '+';
            case tiposDeSimbolos.SUBTRACAO:
                return '-';
            case tiposDeSimbolos.MULTIPLICACAO:
                return '*';
            case tiposDeSimbolos.DIVISAO:
                return '/';
            case tiposDeSimbolos.MODULO:
                return 'rem';
            case tiposDeSimbolos.EXPONENCIACAO:
                return '**';

            // Comparação
            case tiposDeSimbolos.MAIOR:
                return '>';
            case tiposDeSimbolos.MAIOR_IGUAL:
                return '>=';
            case tiposDeSimbolos.MENOR:
                return '<';
            case tiposDeSimbolos.MENOR_IGUAL:
                return '<=';
            case tiposDeSimbolos.IGUAL_IGUAL:
                return '==';
            case tiposDeSimbolos.DIFERENTE:
                return '!=';

            // Lógicos
            case tiposDeSimbolos.E:
                return 'and';
            case tiposDeSimbolos.OU:
                return 'or';
            case tiposDeSimbolos.NEGACAO:
                return 'not';

            // Bitwise
            case tiposDeSimbolos.BIT_AND:
                return '&&&';
            case tiposDeSimbolos.BIT_OR:
                return '|||';
            case tiposDeSimbolos.CIRCUMFLEXO:
                return '^^^';
            case tiposDeSimbolos.BIT_NOT:
                return '~~~';

            default:
                return simbolo.lexema;
        }
    }

    /**
     * Ponto de entrada para tradução
     *
     * Em Elixir, `def` não pode existir fora de um módulo. Por isso, funções
     * declaradas diretamente no escopo global de Delégua são envolvidas em
     * um módulo implícito (`defmodule Main do ... end`), e chamadas a essas
     * funções feitas fora do módulo são qualificadas com o nome do módulo
     * (resolve #1408).
     */
    async traduzir(declaracoes: Declaracao[]): Promise<string> {
        let resultado = '';

        const funcoesGlobais = declaracoes.filter(
            (declaracao) => declaracao.constructor === FuncaoDeclaracao
        ) as FuncaoDeclaracao[];
        const demaisDeclaracoes = declaracoes.filter(
            (declaracao) => declaracao.constructor !== FuncaoDeclaracao
        );

        if (funcoesGlobais.length > 0) {
            for (const funcaoGlobal of funcoesGlobais) {
                this.funcoesConhecidas.add(
                    this.converterIdentificador(funcaoGlobal.simbolo.lexema)
                );
            }

            resultado += `defmodule ${this.nomeModuloGlobal} do\n`;
            this.aumentarIndentacao();
            this.dentroDeModuloGlobal = true;

            for (const funcaoGlobal of funcoesGlobais) {
                const traducao = await funcaoGlobal.aceitar(this);
                if (traducao) {
                    resultado += traducao + '\n\n';
                }
            }

            this.dentroDeModuloGlobal = false;
            this.diminuirIndentacao();
            resultado += 'end\n\n';
        }

        for (const declaracao of demaisDeclaracoes) {
            const traducao = await declaracao.aceitar(this);
            if (traducao) {
                resultado += traducao + '\n';
            }
        }

        return resultado;
    }

    // ========== DECLARAÇÕES ==========

    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> | void {
        // Elixir não tem conceito de cabeçalho de programa
        return Promise.resolve('');
    }

    async visitarDeclaracaoClasse(declaracao: Classe): Promise<string> {
        const nomeModulo = this.converterNomeModulo(declaracao.simbolo.lexema);
        this.modulosConhecidos.add(nomeModulo);

        let resultado = this.adicionarIndentacao();
        resultado += `defmodule ${nomeModulo} do\n`;
        this.aumentarIndentacao();

        const moduloAnterior = this.moduloAtual;
        this.moduloAtual = nomeModulo;

        if (declaracao.estrangeira) {
            // Classe estrangeira: emitir @callback para cada método, definindo a interface esperada do módulo.
            resultado +=
                this.adicionarIndentacao() +
                `@moduledoc "Classe estrangeira — implementação externa."\n`;
            for (const metodo of declaracao.metodos) {
                const params = metodo.funcao.parametros.map(() => 'term()').join(', ');
                const retorno = this.mapearTipoParaTypespec(metodo.funcao.tipo);
                resultado +=
                    this.adicionarIndentacao() +
                    `@callback ${metodo.simbolo.lexema}(${params}) :: ${retorno}\n`;
            }
        } else {
            // Extrair campos do struct do construtor
            const camposStruct = await this.extrairCamposStruct(declaracao);
            if (camposStruct.length > 0) {
                resultado += this.adicionarIndentacao();
                resultado += `defstruct [${camposStruct.join(', ')}]\n\n`;
            }

            // Traduzir métodos
            for (const metodo of declaracao.metodos) {
                const traducaoMetodo = await this.traduzirMetodoClasse(metodo, nomeModulo);
                resultado += traducaoMetodo + '\n\n';
            }
        }

        this.diminuirIndentacao();
        resultado += this.adicionarIndentacao() + 'end';

        this.moduloAtual = moduloAnterior;
        return Promise.resolve(resultado);
    }

    /**
     * Extrai nomes de campos do struct a partir do construtor da classe
     */
    protected async extrairCamposStruct(declaracao: Classe): Promise<string[]> {
        const campos = new Set<string>();

        // Procurar pelo construtor
        const construtor = declaracao.metodos.find(
            (m) => m.simbolo.lexema === 'construtor' || m.simbolo.lexema === 'inicializar'
        );

        if (!construtor) {
            return [];
        }

        // Analisar corpo do construtor para encontrar atribuições a "isto.campo"
        for (const declaracaoCorpo of construtor.funcao.corpo) {
            this.extrairCamposDeDeclaracao(declaracaoCorpo, campos);
        }

        // Converter para atoms do Elixir
        return Array.from(campos).map((c) => `:${this.converterIdentificador(c)}`);
    }

    /**
     * Extrai campos de uma declaração recursivamente
     */
    protected extrairCamposDeDeclaracao(declaracao: any, campos: Set<string>): void {
        // Se é uma expressão de atribuição com isto.campo
        if (declaracao instanceof Expressao && declaracao.expressao) {
            const expressao: any = declaracao.expressao;

            // DefinirValor: usado para isto.campo = valor
            if (expressao instanceof DefinirValor) {
                if (expressao.objeto && expressao.objeto.constructor === Isto) {
                    campos.add(expressao.nome.lexema);
                }
            }

            // Atribuir: pode ser usado para isto.campo = valor
            if (expressao instanceof Atribuir) {
                // Verificar se o alvo é um acesso a propriedade de isto
                if (expressao.alvo instanceof AcessoPropriedade) {
                    const acesso: any = expressao.alvo;
                    if (acesso.objeto && acesso.objeto.constructor === Isto) {
                        campos.add(acesso.nomePropriedade);
                    }
                }
            }
        }

        // Se é um bloco, processar declarações internas
        if (declaracao.constructor === Bloco) {
            for (const decl of declaracao.declaracoes) {
                this.extrairCamposDeDeclaracao(decl, campos);
            }
        }
    }

    /**
     * Traduz um método de classe para função de módulo
     */
    protected async traduzirMetodoClasse(
        metodo: FuncaoDeclaracao,
        nomeModulo: string
    ): Promise<string> {
        const nomeMetodo = this.converterIdentificador(metodo.simbolo.lexema);
        let resultado = this.adicionarIndentacao();

        // Construtor vira função new/N
        if (metodo.simbolo.lexema === 'construtor' || metodo.simbolo.lexema === 'inicializar') {
            resultado += `def new(`;

            const parametros = metodo.funcao.parametros.map((p) =>
                this.converterIdentificador(p.nome.lexema)
            );
            resultado += parametros.join(', ');
            resultado += ') do\n';

            this.aumentarIndentacao();
            resultado += this.adicionarIndentacao();
            resultado += `%${nomeModulo}{`;

            // Extrair inicializações do construtor
            const inicializacoes = await this.extrairInicializacoesStruct(
                metodo.funcao.corpo,
                nomeModulo
            );
            resultado += inicializacoes;
            resultado += '}\n';

            this.diminuirIndentacao();
            resultado += this.adicionarIndentacao() + 'end';
        } else {
            // Métodos normais recebem o struct como primeiro parâmetro
            resultado += `def ${nomeMetodo}(`;

            const nomeParametroStruct = this.converterIdentificador(nomeModulo.toLowerCase());
            this.nomeParametroStruct = nomeParametroStruct;

            const parametros = [nomeParametroStruct].concat(
                metodo.funcao.parametros.map((p) => this.converterIdentificador(p.nome.lexema))
            );
            resultado += parametros.join(', ');
            resultado += ') do\n';

            this.aumentarIndentacao();
            this.dentroDeMetodo = true;

            for (const declaracaoCorpo of metodo.funcao.corpo) {
                const traducao = await declaracaoCorpo.aceitar(this);
                if (traducao) {
                    resultado += traducao + '\n';
                }
            }

            this.dentroDeMetodo = false;
            this.nomeParametroStruct = null;
            this.diminuirIndentacao();

            resultado += this.adicionarIndentacao() + 'end';
        }

        return resultado;
    }

    /**
     * Extrai inicializações de struct do corpo do construtor
     */
    protected async extrairInicializacoesStruct(corpo: any[], nomeModulo: string): Promise<string> {
        const inicializacoes: string[] = [];

        for (const declaracao of corpo) {
            if (declaracao instanceof Expressao && declaracao.expressao) {
                const expressao: any = declaracao.expressao;

                // DefinirValor: isto.campo = valor
                if (expressao instanceof DefinirValor) {
                    if (expressao.objeto && expressao.objeto.constructor === Isto) {
                        const campo = this.converterIdentificador(expressao.nome.lexema);
                        const valor = await expressao.valor.aceitar(this);
                        inicializacoes.push(`${campo}: ${valor}`);
                    }
                }

                // Atribuir: pode ser isto.campo = valor (se alvo é AcessoPropriedade)
                if (expressao instanceof Atribuir) {
                    if (expressao.alvo instanceof AcessoPropriedade) {
                        const acesso: any = expressao.alvo;
                        if (acesso.objeto && acesso.objeto.constructor === Isto) {
                            const campo = this.converterIdentificador(acesso.nomePropriedade);
                            const valor = await expressao.valor.aceitar(this);
                            inicializacoes.push(`${campo}: ${valor}`);
                        }
                    }
                }
            }
        }

        return inicializacoes.length > 0 ? inicializacoes.join(', ') : '';
    }

    async visitarDeclaracaoComentario(declaracao: Comentario): Promise<string> {
        const conteudo = Array.isArray(declaracao.conteudo)
            ? declaracao.conteudo.join('\n# ')
            : declaracao.conteudo;
        return Promise.resolve(`${this.adicionarIndentacao()}# ${conteudo}`);
    }

    async visitarDeclaracaoConst(declaracao: Const): Promise<string> {
        // Em Elixir, constantes em módulos são atributos de módulo (@constante)
        // Fora de módulos, são apenas bindings normais (imutáveis por padrão)
        let resultado = this.adicionarIndentacao();

        if (this.moduloAtual) {
            // Dentro de módulo, usar atributo de módulo
            const nomeAtributo = this.converterIdentificador(declaracao.simbolo.lexema);
            resultado += `@${nomeAtributo} `;
        } else {
            // Fora de módulo, binding normal (mantem nome original em maiúsculas)
            resultado += declaracao.simbolo.lexema;
            resultado += ' = ';
        }

        if (declaracao.inicializador) {
            resultado += await declaracao.inicializador.aceitar(this);
        } else {
            resultado += 'nil';
        }

        return Promise.resolve(resultado);
    }

    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> | void {
        throw new Error('Método não implementado: visitarDeclaracaoConstMultiplo');
    }

    async visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<string> {
        const expressaoInterna = declaracao.expressao;

        // Chamada isolada a um método que muta vetor (ex: `arr.adicionar(x)`) precisa
        // virar reatribuição em Elixir, já que não há mutação de dado (resolve #1410).
        if (expressaoInterna instanceof Chamada) {
            const entidadeChamada = expressaoInterna.entidadeChamada;
            let nomeMetodo: string | null = null;
            let objetoConstruto: any = null;

            if (entidadeChamada instanceof AcessoMetodo) {
                nomeMetodo = entidadeChamada.nomeMetodo;
                objetoConstruto = entidadeChamada.objeto;
            } else if (entidadeChamada instanceof AcessoMetodoOuPropriedade) {
                nomeMetodo = entidadeChamada.simbolo.lexema;
                objetoConstruto = entidadeChamada.objeto;
            }

            if (
                nomeMetodo &&
                this.metodosVetorMutantes.has(nomeMetodo) &&
                objetoConstruto instanceof Variavel
            ) {
                const objeto = await objetoConstruto.aceitar(this);
                const traducaoChamada = await expressaoInterna.aceitar(this);
                return Promise.resolve(`${this.adicionarIndentacao()}${objeto} = ${traducaoChamada}`);
            }
        }

        const resultado = this.adicionarIndentacao() + (await declaracao.expressao.aceitar(this));
        return Promise.resolve(resultado);
    }

    async visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<string> {
        const nomeFuncao = this.converterIdentificador(declaracao.simbolo.lexema);
        this.funcoesConhecidas.add(nomeFuncao);

        let resultado = this.adicionarIndentacao();
        resultado += `def ${nomeFuncao}(`;

        // Parâmetros
        const parametros = declaracao.funcao.parametros.map((p) =>
            this.converterIdentificador(p.nome.lexema)
        );
        resultado += parametros.join(', ');
        resultado += ') do\n';

        // Corpo
        this.aumentarIndentacao();
        for (const declaracaoCorpo of declaracao.funcao.corpo) {
            const traducao = await declaracaoCorpo.aceitar(this);
            if (traducao) {
                resultado += traducao + '\n';
            }
        }
        this.diminuirIndentacao();

        resultado += this.adicionarIndentacao() + 'end';
        return Promise.resolve(resultado);
    }

    async visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<string> {
        // Enquanto em Elixir vira função recursiva
        // Padrão: (fn -> loop = fn when cond -> corpo; loop.() end; loop = fn -> :ok end; loop.() end).()
        let resultado = this.adicionarIndentacao();
        resultado += '(fn ->\n';
        this.aumentarIndentacao();

        // Função recursiva com guard
        resultado += this.adicionarIndentacao();
        resultado += 'loop = fn when ';
        resultado += await declaracao.condicao.aceitar(this);
        resultado += ' ->\n';

        this.aumentarIndentacao();
        const traducaoCorpo = await declaracao.corpo.aceitar(this);
        resultado += traducaoCorpo;

        // Chamada recursiva
        resultado += this.adicionarIndentacao() + 'loop.()\n';
        this.diminuirIndentacao();

        resultado += this.adicionarIndentacao() + 'end\n';

        // Caso base
        resultado += this.adicionarIndentacao() + 'loop = fn -> :ok end\n';
        resultado += this.adicionarIndentacao() + 'loop.()\n';

        this.diminuirIndentacao();
        resultado += this.adicionarIndentacao() + 'end).()';

        return Promise.resolve(resultado);
    }

    async visitarDeclaracaoEscolha(declaracao: Escolha): Promise<string> {
        let resultado = this.adicionarIndentacao();
        resultado += 'case ';
        resultado += await declaracao.identificadorOuLiteral.aceitar(this);
        resultado += ' do\n';

        this.aumentarIndentacao();

        // Processar cada caminho
        for (const caminho of declaracao.caminhos) {
            for (const condicao of caminho.condicoes) {
                resultado += this.adicionarIndentacao();
                resultado += await condicao.aceitar(this);
                resultado += ' ->\n';
            }

            this.aumentarIndentacao();
            for (const decl of caminho.declaracoes) {
                resultado += await decl.aceitar(this);
                resultado += '\n';
            }
            this.diminuirIndentacao();
        }

        // Caminho padrão
        if (declaracao.caminhoPadrao && declaracao.caminhoPadrao.declaracoes.length > 0) {
            resultado += this.adicionarIndentacao() + '_ ->\n';
            this.aumentarIndentacao();
            for (const decl of declaracao.caminhoPadrao.declaracoes) {
                resultado += await decl.aceitar(this);
                resultado += '\n';
            }
            this.diminuirIndentacao();
        }

        this.diminuirIndentacao();
        resultado += this.adicionarIndentacao() + 'end';
        return Promise.resolve(resultado);
    }

    async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<string> {
        let resultado = this.adicionarIndentacao();
        resultado += 'IO.puts(';

        if (declaracao.argumentos.length === 0) {
            resultado += '""';
        } else if (declaracao.argumentos.length === 1) {
            resultado += await declaracao.argumentos[0].aceitar(this);
        } else {
            // Múltiplos argumentos - concatenar
            const argumentos = [];
            for (const arg of declaracao.argumentos) {
                argumentos.push(await arg.aceitar(this));
            }
            resultado += argumentos.join(' <> ');
        }

        resultado += ')';
        return Promise.resolve(resultado);
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> | void {
        throw new Error('Método não implementado: visitarDeclaracaoEscrevaMesmaLinha');
    }

    async visitarDeclaracaoFazer(declaracao: Fazer): Promise<string> {
        // Fazer...enquanto é similar a enquanto, mas executa o corpo pelo menos uma vez
        let resultado = this.adicionarIndentacao();
        resultado += '(fn ->\n';
        this.aumentarIndentacao();

        resultado += this.adicionarIndentacao();
        resultado += 'loop = fn ->\n';
        this.aumentarIndentacao();

        // Corpo
        const traducaoCorpo = await declaracao.caminhoFazer.aceitar(this);
        resultado += traducaoCorpo;

        // Verificar condição e decidir se continua
        resultado += this.adicionarIndentacao() + 'if ';
        resultado += await declaracao.condicaoEnquanto.aceitar(this);
        resultado += ' do\n';
        this.aumentarIndentacao();
        resultado += this.adicionarIndentacao() + 'loop.()\n';
        this.diminuirIndentacao();
        resultado += this.adicionarIndentacao() + 'else\n';
        this.aumentarIndentacao();
        resultado += this.adicionarIndentacao() + ':ok\n';
        this.diminuirIndentacao();
        resultado += this.adicionarIndentacao() + 'end\n';

        this.diminuirIndentacao();
        resultado += this.adicionarIndentacao() + 'end\n';
        resultado += this.adicionarIndentacao() + 'loop.()\n';

        this.diminuirIndentacao();
        resultado += this.adicionarIndentacao() + 'end).()';

        return Promise.resolve(resultado);
    }

    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> | void {
        // Elixir não tem conceito de início de algoritmo
        return Promise.resolve('');
    }

    async visitarDeclaracaoPara(declaracao: Para): Promise<string> {
        // Para loop vira função recursiva com inicializador, condição e incremento
        let resultado = this.adicionarIndentacao();
        resultado += '(fn ->\n';
        this.aumentarIndentacao();

        // Extrair variável e valor inicial
        let nomeVar = '';
        let valorInicial = '';

        if (declaracao.inicializador) {
            const init = Array.isArray(declaracao.inicializador)
                ? declaracao.inicializador[0]
                : declaracao.inicializador;

            if (init.constructor === Var) {
                nomeVar = this.converterIdentificador((init as any).simbolo.lexema);
                if ((init as any).inicializador) {
                    valorInicial = await (init as any).inicializador.aceitar(this);
                } else {
                    valorInicial = '0';
                }
            }
        }

        // Função recursiva com parâmetro e guard
        resultado += this.adicionarIndentacao();
        resultado += `loop = fn ${nomeVar} when `;
        resultado += await declaracao.condicao.aceitar(this);
        resultado += ' ->\n';

        this.aumentarIndentacao();
        const traducaoCorpo = await declaracao.corpo.aceitar(this);
        resultado += traducaoCorpo;

        // Incremento e chamada recursiva
        const incremento = await declaracao.incrementar.aceitar(this);
        resultado += this.adicionarIndentacao() + `loop.(${incremento})\n`;
        this.diminuirIndentacao();

        resultado += this.adicionarIndentacao() + 'end\n';

        // Caso base
        resultado += this.adicionarIndentacao() + `loop = fn _ -> :ok end\n`;
        resultado += this.adicionarIndentacao() + `loop.(${valorInicial})\n`;

        this.diminuirIndentacao();
        resultado += this.adicionarIndentacao() + 'end).()';

        return Promise.resolve(resultado);
    }

    async visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<string> {
        let resultado = this.adicionarIndentacao();
        resultado += 'Enum.each(';
        resultado += await declaracao.vetorOuDicionario.aceitar(this);
        resultado += ', fn ';
        resultado += await declaracao.variavelIteracao.aceitar(this);
        resultado += ' ->\n';

        this.aumentarIndentacao();
        const traducaoCorpo = await declaracao.corpo.aceitar(this);
        resultado += traducaoCorpo;
        this.diminuirIndentacao();

        resultado += this.adicionarIndentacao() + 'end)';
        return Promise.resolve(resultado);
    }

    async visitarDeclaracaoSe(declaracao: Se): Promise<string> {
        let resultado = this.adicionarIndentacao();
        resultado += 'if ';
        resultado += await declaracao.condicao.aceitar(this);
        resultado += ' do\n';

        this.aumentarIndentacao();
        const traducaoEntao = await declaracao.caminhoEntao.aceitar(this);
        resultado += traducaoEntao;
        this.diminuirIndentacao();

        if (declaracao.caminhoSenao) {
            resultado += this.adicionarIndentacao() + 'else\n';
            this.aumentarIndentacao();
            const traducaoSenao = await declaracao.caminhoSenao.aceitar(this);
            resultado += traducaoSenao;
            this.diminuirIndentacao();
        }

        resultado += this.adicionarIndentacao() + 'end';
        return Promise.resolve(resultado);
    }

    async visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<string> {
        throw new Error('Método não implementado: visitarDeclaracaoTendoComo');
    }

    visitarDeclaracaoTente(declaracao: Tente): Promise<any> | void {
        throw new Error('Método não implementado: visitarDeclaracaoTente');
    }

    visitarDeclaracaoTextoDocumentacao(declaracao: TextoDocumentacao): Promise<any> | void {
        throw new Error('Método não implementado: visitarDeclaracaoTextoDocumentacao');
    }

    async visitarDeclaracaoVar(declaracao: Var): Promise<string> {
        let resultado = this.adicionarIndentacao();
        resultado += this.converterIdentificador(declaracao.simbolo.lexema);
        resultado += ' = ';

        if (declaracao.inicializador) {
            resultado += await declaracao.inicializador.aceitar(this);
        } else {
            resultado += 'nil';
        }

        return Promise.resolve(resultado);
    }

    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> | void {
        throw new Error('Método não implementado: visitarDeclaracaoVarMultiplo');
    }

    // ========== EXPRESSÕES ==========

    async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<string> {
        const alvo = await expressao.alvo.aceitar(this);
        const valor = await expressao.valor.aceitar(this);
        return Promise.resolve(`${alvo} = ${valor}`);
    }

    async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<string> {
        const objeto = await expressao.entidadeChamada.aceitar(this);
        const indice = await expressao.indice.aceitar(this);

        // Em Elixir, acesso por índice usa Enum.at/2
        return Promise.resolve(`Enum.at(${objeto}, ${indice})`);
    }

    visitarExpressaoAcessoIntervaloVariavel(
        expressao: AcessoIntervaloVariavel
    ): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoAcessoIntervaloVariavel');
    }

    visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoAcessoElementoMatriz');
    }

    async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<string> {
        const objeto = await expressao.objeto.aceitar(this);
        const metodo = this.converterIdentificador(expressao.nomeMetodo);

        // AcessoMetodo é apenas a referência ao método, não a chamada
        // A chamada é feita por visitarExpressaoDeChamada
        return Promise.resolve(`${objeto}.${metodo}`);
    }

    /**
     * Mapeia métodos embutidos de Delégua para Elixir
     */
    protected mapearMetodoBuiltIn(
        metodo: string,
        objeto: string,
        argumentos: string[]
    ): string | null {
        switch (metodo) {
            // Array/List methods
            case 'adicionar':
            case 'empilhar':
                return argumentos.length > 0 ? `[${argumentos[0]} | ${objeto}]` : `${objeto}`;
            case 'tamanho':
                return `length(${objeto})`;
            case 'inclui':
                return argumentos.length > 0 ? `Enum.member?(${objeto}, ${argumentos[0]})` : null;
            case 'inverter':
                return `Enum.reverse(${objeto})`;
            case 'mapear':
                return argumentos.length > 0 ? `Enum.map(${objeto}, ${argumentos[0]})` : null;
            case 'filtrar':
                return argumentos.length > 0 ? `Enum.filter(${objeto}, ${argumentos[0]})` : null;
            case 'ordenar':
                return `Enum.sort(${objeto})`;
            case 'juntar':
                return argumentos.length > 0
                    ? `Enum.join(${objeto}, ${argumentos[0]})`
                    : `Enum.join(${objeto})`;
            case 'fatiar':
                if (argumentos.length >= 2) {
                    return `Enum.slice(${objeto}, ${argumentos[0]}, ${argumentos[1]})`;
                }
                return null;
            case 'remover':
                return argumentos.length > 0 ? `List.delete(${objeto}, ${argumentos[0]})` : null;
            case 'somar':
                return `Enum.sum(${objeto})`;

            // String methods
            case 'maiusculo':
                return `String.upcase(${objeto})`;
            case 'minusculo':
                return `String.downcase(${objeto})`;
            case 'dividir':
                return argumentos.length > 0 ? `String.split(${objeto}, ${argumentos[0]})` : null;
            case 'substituir':
                if (argumentos.length >= 2) {
                    return `String.replace(${objeto}, ${argumentos[0]}, ${argumentos[1]})`;
                }
                return null;
            case 'aparar':
                return `String.trim(${objeto})`;

            default:
                return null;
        }
    }

    /**
     * Tenta extrair o nome do módulo de uma expressão de objeto
     */
    protected obterNomeModulo(objetoStr: string): string {
        // Se o objeto é uma variável simples, assumir que o módulo tem o mesmo nome em PascalCase
        // Isso é uma heurística; em casos reais, precisaríamos de análise semântica
        const match = objetoStr.match(/^([a-z_][a-z0-9_]*)$/);
        if (match) {
            return this.converterNomeModulo(match[1]);
        }
        return objetoStr;
    }

    async visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<string> {
        const objeto = await expressao.objeto.aceitar(this);
        const simbolo = this.converterIdentificador(expressao.simbolo.lexema);

        // AcessoMetodoOuPropriedade é apenas a referência, não a chamada
        // A chamada com argumentos é feita por visitarExpressaoDeChamada
        return Promise.resolve(`${objeto}.${simbolo}`);
    }

    async visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<string> {
        const objeto = await expressao.objeto.aceitar(this);
        const propriedade = this.converterIdentificador(expressao.nomePropriedade);

        return Promise.resolve(`${objeto}.${propriedade}`);
    }

    async visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<string> {
        const conteudo = await expressao.expressao.aceitar(this);
        return Promise.resolve(`(${conteudo})`);
    }

    visitarExpressaoArgumentoReferenciaFuncao(
        expressao: ArgumentoReferenciaFuncao
    ): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoArgumentoReferenciaFuncao');
    }

    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoAtribuicaoPorIndice');
    }

    visitarExpressaoAtribuicaoPorIndicesMatriz(
        expressao: AtribuicaoPorIndicesMatriz
    ): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoAtribuicaoPorIndicesMatriz');
    }

    async visitarExpressaoBinaria(expressao: Binario): Promise<string> {
        const esquerda = await expressao.esquerda.aceitar(this);
        const direita = await expressao.direita.aceitar(this);

        // Em Elixir, `+` é exclusivo de números. Concatenação de textos usa `<>`,
        // que exige binários dos dois lados, então convertemos ambos os lados
        // com `to_string/1` para lidar com operandos de tipo dinâmico (ex.: acesso a lista).
        if (expressao.operador.tipo === tiposDeSimbolos.ADICAO && expressao.tipo === 'texto') {
            return Promise.resolve(`to_string(${esquerda}) <> to_string(${direita})`);
        }

        const operador = this.traduzirOperador(expressao.operador);

        return Promise.resolve(`${esquerda} ${operador} ${direita}`);
    }

    async visitarExpressaoBloco(declaracao: Bloco): Promise<string> {
        let resultado = '';

        for (const decl of declaracao.declaracoes) {
            const traducao = await decl.aceitar(this);
            if (traducao) {
                resultado += traducao + '\n';
            }
        }

        return Promise.resolve(resultado);
    }

    visitarExpressaoComentario(expressao: ComentarioComoConstruto): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoComentario');
    }

    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error('Método não implementado: visitarExpressaoContinua');
    }

    async visitarExpressaoDeChamada(expressao: Chamada): Promise<string> {
        // Processar argumentos
        const argumentos = [];
        for (const arg of expressao.argumentos) {
            const argTraduzido = await arg.aceitar(this);
            if (argTraduzido && argTraduzido.trim() !== '') {
                argumentos.push(argTraduzido);
            }
        }

        // Verificar se é instanciação de módulo (classe)
        if (expressao.entidadeChamada.constructor === Variavel) {
            const nomeEntidade = (expressao.entidadeChamada as any).simbolo.lexema;
            if (this.modulosConhecidos.has(this.converterNomeModulo(nomeEntidade))) {
                // Chamada de construtor de módulo
                return Promise.resolve(
                    `${this.converterNomeModulo(nomeEntidade)}.new(${argumentos.join(', ')})`
                );
            }

            // `real(valor)` converte explicitamente para ponto flutuante. Em Elixir,
            // dividir por 1 força o resultado a ser float independentemente do valor
            // de entrada ser inteiro ou já ser float.
            if (nomeEntidade === 'real' && argumentos.length > 0) {
                return Promise.resolve(`(${argumentos[0]}) / 1`);
            }
        }

        // Verificar se é chamada de método (AcessoMetodo ou AcessoMetodoOuPropriedade)
        if (expressao.entidadeChamada.constructor === AcessoMetodo) {
            const acessoMetodo = expressao.entidadeChamada as any;
            const objeto = await acessoMetodo.objeto.aceitar(this);
            const metodo = this.converterIdentificador(acessoMetodo.nomeMetodo);

            // Mapear métodos embutidos
            const metodoMapeado = this.mapearMetodoBuiltIn(metodo, objeto, argumentos);
            if (metodoMapeado) {
                return Promise.resolve(metodoMapeado);
            }

            // Método de módulo/struct - passar o struct como primeiro argumento
            return Promise.resolve(
                `${this.obterNomeModulo(objeto)}.${metodo}(${objeto}${argumentos.length > 0 ? ', ' + argumentos.join(', ') : ''})`
            );
        }

        if (expressao.entidadeChamada.constructor === AcessoMetodoOuPropriedade) {
            const acesso = expressao.entidadeChamada as any;
            const objeto = await acesso.objeto.aceitar(this);
            const simbolo = this.converterIdentificador(acesso.simbolo.lexema);

            // Mapear métodos embutidos
            const metodoMapeado = this.mapearMetodoBuiltIn(simbolo, objeto, argumentos);
            if (metodoMapeado) {
                return Promise.resolve(metodoMapeado);
            }

            // Método de módulo/struct
            return Promise.resolve(
                `${this.obterNomeModulo(objeto)}.${simbolo}(${objeto}${argumentos.length > 0 ? ', ' + argumentos.join(', ') : ''})`
            );
        }

        // Chamada normal de função. Se for chamada a uma função declarada no
        // escopo global de Delégua feita fora do módulo implícito que a envolve
        // em Elixir, é preciso qualificar a chamada com o nome do módulo (#1408).
        if (expressao.entidadeChamada.constructor === Variavel && !this.dentroDeModuloGlobal) {
            const nomeFuncao = this.converterIdentificador(
                (expressao.entidadeChamada as any).simbolo.lexema
            );
            if (this.funcoesConhecidas.has(nomeFuncao)) {
                return Promise.resolve(
                    `${this.nomeModuloGlobal}.${nomeFuncao}(${argumentos.join(', ')})`
                );
            }
        }

        const entidadeChamada = await expressao.entidadeChamada.aceitar(this);
        return Promise.resolve(`${entidadeChamada}(${argumentos.join(', ')})`);
    }

    visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoDefinirValor');
    }

    async visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto): Promise<string> {
        let resultado = 'fn ';

        // Parâmetros
        const parametros = expressao.parametros.map((p) =>
            this.converterIdentificador(p.nome.lexema)
        );
        resultado += parametros.join(', ');
        resultado += ' ->';

        // Corpo - se for uma única expressão, inline; se for bloco, multi-linha
        if (expressao.corpo.length === 1) {
            resultado += ' ';
            const traducao = await expressao.corpo[0].aceitar(this);
            resultado += traducao;
        } else {
            resultado += '\n';
            this.aumentarIndentacao();
            for (const decl of expressao.corpo) {
                const traducao = await decl.aceitar(this);
                if (traducao) {
                    resultado += traducao + '\n';
                }
            }
            this.diminuirIndentacao();
            resultado += this.adicionarIndentacao();
        }

        resultado += ' end';
        return Promise.resolve(resultado);
    }

    async visitarExpressaoDeVariavel(expressao: Variavel | Constante): Promise<string> {
        return Promise.resolve(this.converterIdentificador(expressao.simbolo.lexema));
    }

    async visitarExpressaoDicionario(expressao: Dicionario): Promise<string> {
        if (expressao.chaves.length === 0) {
            return Promise.resolve('%{}');
        }

        const pares = [];
        for (let i = 0; i < expressao.chaves.length; i++) {
            const chave = await expressao.chaves[i].aceitar(this);
            const valor = await expressao.valores[i].aceitar(this);

            // Ignorar pares vazios (separadores)
            if (chave && chave.trim() !== '' && valor && valor.trim() !== '') {
                // Em Elixir, usa-se atoms (:chave) quando possível ou string => valor
                // Por simplicidade, vamos usar sempre a sintaxe de string
                pares.push(`${chave} => ${valor}`);
            }
        }

        return Promise.resolve(`%{${pares.join(', ')}}`);
    }

    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> | void {
        throw new Error('Método não implementado: visitarExpressaoExpressaoRegular');
    }

    visitarExpressaoFalhar(expressao: Falhar): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoFalhar');
    }

    visitarExpressaoFimPara(declaracao: FimPara): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoFimPara');
    }

    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoFormatacaoEscrita');
    }

    async visitarExpressaoIsto(expressao: Isto): Promise<string> {
        // "isto" em Elixir é substituído pelo nome do parâmetro do struct
        if (this.nomeParametroStruct) {
            return Promise.resolve(this.nomeParametroStruct);
        }

        // Se não estamos em contexto de método, usar nome genérico
        return Promise.resolve('self');
    }

    async visitarExpressaoLeia(expressao: Leia): Promise<string> {
        let resultado = 'IO.gets(';

        if (expressao.argumentos && expressao.argumentos.length > 0) {
            resultado += await expressao.argumentos[0].aceitar(this);
        } else {
            resultado += '""';
        }

        resultado += ') |> String.trim()';
        return Promise.resolve(resultado);
    }

    async visitarExpressaoLiteral(expressao: Literal): Promise<string> {
        const valor = expressao.valor;

        // Null/nulo
        if (valor === null || valor === undefined) {
            return Promise.resolve('nil');
        }

        // Boolean
        if (typeof valor === 'boolean') {
            return Promise.resolve(valor ? 'true' : 'false');
        }

        // Number
        if (typeof valor === 'number') {
            if (expressao.tipo === 'real' && Number.isInteger(valor)) {
                return Promise.resolve(`${valor}.0`);
            }
            return Promise.resolve(String(valor));
        }

        // String
        if (typeof valor === 'string') {
            // Elixir suporta interpolação com #{}
            return Promise.resolve(`"${valor}"`);
        }

        return Promise.resolve(String(valor));
    }

    async visitarExpressaoLogica(expressao: Logico): Promise<string> {
        const esquerda = await expressao.esquerda.aceitar(this);
        const direita = await expressao.direita.aceitar(this);
        const operador = this.traduzirOperador(expressao.operador);

        return Promise.resolve(`${esquerda} ${operador} ${direita}`);
    }

    visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoReferenciaFuncao');
    }

    async visitarExpressaoRetornar(expressao: Retorna): Promise<string> {
        // Em Elixir, o retorno é implícito (última expressão)
        // Mas podemos usar explicitamente para clareza ou retorno antecipado
        let resultado = this.adicionarIndentacao();

        if (expressao.valor) {
            // Apenas retornar o valor, pois em Elixir a última expressão é o retorno
            resultado += await expressao.valor.aceitar(this);
        } else {
            resultado += 'nil';
        }

        return Promise.resolve(resultado);
    }

    visitarExpressaoSeparador(expressao: Separador): Promise<any> | void {
        return Promise.resolve('');
    }

    visitarExpressaoSuper(expressao: Super): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoSuper');
    }

    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra | void {
        throw new Error('Método não implementado: visitarExpressaoSustar');
    }

    async visitarExpressaoTupla(expressao: Tupla): Promise<string> {
        // Tupla pode ter apenas um valor (expressao.valor) ou ser TuplaN com elementos
        // Por enquanto, apenas retornar o valor se houver
        if (expressao.valor !== undefined) {
            return Promise.resolve(`{${expressao.valor}}`);
        }

        // Se não houver valor, tupla vazia
        return Promise.resolve('{}');
    }

    async visitarExpressaoTuplaN(expressao: TuplaN): Promise<string> {
        const valores = [];
        for (const elemento of expressao.elementos) {
            const valorTraduzido = await elemento.aceitar(this);
            valores.push(valorTraduzido);
        }

        return Promise.resolve(`{${valores.join(', ')}}`);
    }

    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> | void {
        throw new Error('Método não implementado: visitarExpressaoTipoDe');
    }

    async visitarExpressaoUnaria(expressao: Unario): Promise<string> {
        const operando = await expressao.operando.aceitar(this);
        const operador = this.traduzirOperador(expressao.operador);

        // Elixir não tem ++ ou --, então operações de incremento/decremento precisam ser convertidas
        if (expressao.operador.tipo === tiposDeSimbolos.INCREMENTAR) {
            return Promise.resolve(`${operando} + 1`);
        }
        if (expressao.operador.tipo === tiposDeSimbolos.DECREMENTAR) {
            return Promise.resolve(`${operando} - 1`);
        }

        // Operações unárias normais (-, !, ~)
        if (expressao.incidenciaOperador === 'ANTES') {
            return Promise.resolve(`${operador} ${operando}`);
        } else {
            return Promise.resolve(`${operando} ${operador}`);
        }
    }

    async visitarExpressaoVetor(expressao: Vetor): Promise<string> {
        if (expressao.valores.length === 0) {
            return Promise.resolve('[]');
        }

        const valores = [];
        for (const valor of expressao.valores) {
            const valorTraduzido = await valor.aceitar(this);
            // Ignorar separadores vazios
            if (valorTraduzido && valorTraduzido.trim() !== '') {
                valores.push(valorTraduzido);
            }
        }

        return Promise.resolve(`[${valores.join(', ')}]`);
    }
}
