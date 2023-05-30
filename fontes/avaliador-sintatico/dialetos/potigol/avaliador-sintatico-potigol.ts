import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    Agrupamento,
    Atribuir,
    Binario,
    Chamada,
    Constante,
    ConstanteOuVariavel,
    Construto,
    FimPara,
    FuncaoConstruto,
    Literal,
    Unario,
    Variavel,
} from '../../../construtos';
import {
    Escreva,
    Declaracao,
    Se,
    Enquanto,
    Para,
    Escolha,
    Fazer,
    EscrevaMesmaLinha,
    Const,
    Var,
    Bloco,
    Expressao,
    FuncaoDeclaracao,
    Classe,
    PropriedadeClasse,
} from '../../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../../avaliador-sintatico-base';

import { ParametroInterface, SimboloInterface } from '../../../interfaces';
import { TiposDadosInterface } from '../../../interfaces/tipos-dados-interface';
import { Simbolo } from '../../../lexador';
import { ErroAvaliadorSintatico } from '../../erro-avaliador-sintatico';
import { RetornoDeclaracao } from '../../retornos';

import tiposDeSimbolos from '../../../tipos-de-simbolos/potigol';
import { SeletorTuplas, Tupla } from '../../../construtos/tuplas';
import { MicroAvaliadorSintaticoPotigol } from './micro-avaliador-sintatico-potigol';

/**
 * TODO: Pensar numa forma de avaliar múltiplas constantes sem
 * transformar o retorno de `primario()` em um vetor.
 */
export class AvaliadorSintaticoPotigol extends AvaliadorSintaticoBase {
    microAvaliadorSintatico: MicroAvaliadorSintaticoPotigol;

    tiposPotigolParaDelegua = {
        Caractere: 'texto',
        Inteiro: 'numero',
        Logico: 'lógico',
        Lógico: 'lógico',
        Real: 'numero',
        Texto: 'texto',
        undefined: undefined,
    };

    declaracoesAnteriores: { [identificador: string]: any[] }

    /**
     * Testa se o primeiro parâmetro na lista de símbolos
     * pertence a uma declaração ou não.
     * @param simbolos Os símbolos que fazem parte da lista de argumentos
     * de uma chamada ou declaração de função.
     * @returns `true` se parâmetros são de declaração. `false` caso contrário.
     */
    protected testePrimeiroParametro(simbolos: SimboloInterface[]) {
        let atual = 0;

        // Primeiro teste: literal ou identificador
        if ([
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.LOGICO,
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.TEXTO
            ].includes(simbolos[atual].tipo)
        ) {
            return false;
        }

        // Segundo teste: vírgula imediatamente após identificador, 
        // ou simplesmente fim da lista de símbolos.
        atual++;
        if (atual === simbolos.length || simbolos[atual].tipo === tiposDeSimbolos.VIRGULA) {
            return false;
        }

        // Outros casos: dois-pontos após identificador, etc.
        return true;
    }

    /**
     * Retorna uma declaração de função iniciada por igual, 
     * ou seja, com apenas uma instrução.
     * @param simboloPrimario O símbolo que identifica a função (nome).
     * @param parenteseEsquerdo O parêntese esquerdo, usado para fins de pragma.
     * @param parametros A lista de parâmetros da função.
     * @param tipoRetorno O tipo de retorno da função.
     * @returns Um construto do tipo `FuncaoDeclaracao`.
     */
    protected declaracaoFuncaoPotigolIniciadaPorIgual(
        simboloPrimario: SimboloInterface,
        parenteseEsquerdo: SimboloInterface,
        parametros: ParametroInterface[],
        tipoRetorno?: SimboloInterface
    ): FuncaoDeclaracao {
        const corpo = new FuncaoConstruto(
            simboloPrimario.hashArquivo, 
            simboloPrimario.linha,
            parametros,
            [this.expressao()] 
        );
        return new FuncaoDeclaracao(simboloPrimario, corpo, tipoRetorno);
    }

    /**
     * Retorna uma declaração de função terminada por fim, 
     * ou seja, com mais de uma instrução.
     * @param simboloPrimario O símbolo que identifica a função (nome).
     * @param parenteseEsquerdo O parêntese esquerdo, usado para fins de pragma.
     * @param parametros A lista de parâmetros da função.
     * @param tipoRetorno O tipo de retorno da função.
     * @returns Um construto do tipo `FuncaoDeclaracao`.
     */
    protected declaracaoFuncaoPotigolTerminadaPorFim(
        simboloPrimario: SimboloInterface,
        parenteseEsquerdo: SimboloInterface,
        parametros: ParametroInterface[],
        tipoRetorno?: SimboloInterface
    ): FuncaoDeclaracao {
        const corpo = this.corpoDaFuncao(simboloPrimario.lexema, parenteseEsquerdo, parametros);
        return new FuncaoDeclaracao(simboloPrimario, corpo, tipoRetorno);
    }

    corpoDaFuncao(nomeFuncao: string, simboloPragma?: SimboloInterface, parametros?: any[]): FuncaoConstruto {
        // this.consumir(tiposDeSimbolos.IGUAL, `Esperado '=' antes do escopo da função ${nomeFuncao}.`);

        const corpo = this.blocoEscopo();

        return new FuncaoConstruto(this.hashArquivo, Number(simboloPragma.linha), parametros, corpo);
    }

    protected funcaoOuMetodoOuChamada(construtoPrimario: ConstanteOuVariavel): Construto {
        // O parêntese esquerdo é considerado o símbolo inicial para
        // fins de pragma.
        const parenteseEsquerdo = this.avancarEDevolverAnterior();
        let éDeclaracao = false;

        // Como só é possível descobrir se o símbolo primário
        // é uma declaração ou chamada após o fechamento dos
        // parênteses, precisamos acumular os símbolos até o 
        // fechamento dos parênteses e analisá-los depois.
        const simbolosEntreParenteses: SimboloInterface[] = [];
        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            simbolosEntreParenteses.push(this.avancarEDevolverAnterior());
        }

        let testePrimeiroParametro = false;
        if (simbolosEntreParenteses.length > 0) {
            testePrimeiroParametro = this.testePrimeiroParametro(simbolosEntreParenteses);
        }

        let parametros: ParametroInterface[] = [];
        if (testePrimeiroParametro) {
            const resolucaoParametros = this.logicaComumParametrosPotigol(simbolosEntreParenteses);
            // A melhor forma de detectar se é uma declaração de função ou
            // uma chamada é através dos parâmetros da função, cujos tipos
            // são obrigatórios numa declaração.
            if (resolucaoParametros.tipagemDefinida) {
                éDeclaracao = true;
                parametros = resolucaoParametros.parametros;
            }
        }

        const parenteseDireito = this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");

        // Pode haver uma dica do tipo de retorno ou não.
        // Se houver, é uma declaração de função (verificado mais abaixo).
        let tipoRetorno: SimboloInterface = undefined;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
            this.verificacaoTipo(this.simbolos[this.atual], 'Esperado tipo válido após dois-pontos como retorno de função.');

            tipoRetorno = this.simbolos[this.atual - 1];
            éDeclaracao = true;
        }

        // Se houver símbolo de igual, seja após fechamento de parênteses,
        // seja após a dica de retorno, é uma declaração de função.
        if (this.simbolos[this.atual].tipo === tiposDeSimbolos.IGUAL) {
            this.avancarEDevolverAnterior();
            this.declaracoesAnteriores[construtoPrimario.simbolo.lexema] = [];
            return this.declaracaoFuncaoPotigolIniciadaPorIgual(
                construtoPrimario.simbolo, 
                parenteseEsquerdo, 
                parametros, 
                tipoRetorno
            );
        }

        // Caso excepcional: declaração não possui parâmetros.
        // A única forma de testar isso é se o identificador nunca foi 
        // usado antes. 
        // Como Potigol funciona apenas com um arquivo, isso é possível de 
        // ser testado.
        if (éDeclaracao || !(construtoPrimario.simbolo.lexema in this.declaracoesAnteriores)) {
            this.declaracoesAnteriores[construtoPrimario.simbolo.lexema] = [];
            return this.declaracaoFuncaoPotigolTerminadaPorFim(
                construtoPrimario.simbolo, 
                parenteseEsquerdo, 
                parametros, 
                tipoRetorno
            );
        }

        // Se chegou até aqui, é chamada de função ou construtor de tipo.
        // Primeiro, resolver todos os símbolos entre parênteses como
        // expressões.
        const argumentos = this.microAvaliadorSintatico.analisar(
            { simbolos: simbolosEntreParenteses } as any,
            construtoPrimario.linha
        )

        return new Chamada(
            this.hashArquivo, 
            new Constante(construtoPrimario.hashArquivo, construtoPrimario.simbolo), 
            parenteseDireito, 
            argumentos.declaracoes.filter(d => d)
        );
    }

    /**
     * Verificação comum de tipos.
     * Avança o símbolo se não houver erros.
     * @param simbolo O símbolo sendo analisado.
     * @param mensagemErro A mensagem de erro caso o símbolo atual não seja de tipo.
     */
    protected verificacaoTipo(simbolo: SimboloInterface, mensagemErro: string) {
        if (
            ![
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.LOGICO,
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.TEXTO].includes(simbolo.tipo)
        ) {
            throw this.erro(simbolo, mensagemErro);
        }
    }

    protected logicaComumParametrosPotigol(
        simbolos: SimboloInterface[]
    ): { parametros: ParametroInterface[], tipagemDefinida: boolean } {
        const parametros: ParametroInterface[] = [];
        let indice = 0;
        let tipagemDefinida = false;

        while (indice < simbolos.length) {
            if (parametros.length >= 255) {
                this.erro(simbolos[indice], 'Não pode haver mais de 255 parâmetros');
            }

            const parametro: Partial<ParametroInterface> = {};

            // TODO: verificar se Potigol trabalha com número variável de parâmetros.
            /* if (this.simbolos[this.atual].tipo === tiposDeSimbolos.MULTIPLICACAO) {
                this.consumir(tiposDeSimbolos.MULTIPLICACAO, null);
                parametro.abrangencia = 'multiplo';
            } else {
                parametro.abrangencia = 'padrao';
            } */

            parametro.abrangencia = 'padrao';
            if (simbolos[indice].tipo !== tiposDeSimbolos.IDENTIFICADOR) {
                throw this.erro(simbolos[indice], 'Esperado nome do parâmetro.');
            }

            parametro.nome = simbolos[indice];
            indice++;

            if (simbolos[indice].tipo === tiposDeSimbolos.DOIS_PONTOS) {
                // throw this.erro(simbolos[indice], 'Esperado dois-pontos após nome de argumento para função.');

                indice++;
                this.verificacaoTipo(simbolos[indice], 'Esperado tipo do argumento após dois-pontos, em definição de função.');

                const tipoParametro = simbolos[indice];
                parametro.tipo = this.tiposPotigolParaDelegua[tipoParametro.lexema];
                tipagemDefinida = true;
            }

            // TODO: Verificar se Potigol trabalha com valores padrão em argumentos.
            /* if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro.valorPadrao = this.primario();
            } */

            parametros.push(parametro as ParametroInterface);

            // if (parametro.abrangencia === 'multiplo') break;
            indice++;
            if (indice < simbolos.length && simbolos[indice].tipo !== tiposDeSimbolos.VIRGULA) {
                throw this.erro(simbolos[indice], 'Esperado vírgula entre parâmetros de função.');
            }

            indice++;
        };

        return { 
            parametros, 
            tipagemDefinida
        };
    }

    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];

        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.expressao();
                switch (this.simbolos[this.atual].tipo) {
                    case tiposDeSimbolos.VIRGULA:
                        // Tupla
                        const argumentos = [expressao];
                        while (this.simbolos[this.atual].tipo === tiposDeSimbolos.VIRGULA) {
                            this.avancarEDevolverAnterior();
                            argumentos.push(this.expressao());
                        }

                        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
                        return new SeletorTuplas(...argumentos) as Tupla;
                    default:
                        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
                        return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);
                }

            case tiposDeSimbolos.CARACTERE:
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.LOGICO:
            case tiposDeSimbolos.REAL:
            case tiposDeSimbolos.TEXTO:
                const simboloLiteral: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloLiteral.linha), simboloLiteral.literal);
            case tiposDeSimbolos.FALSO:
            case tiposDeSimbolos.VERDADEIRO:
                const simboloVerdadeiroFalso: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    Number(simboloVerdadeiroFalso.linha),
                    simboloVerdadeiroFalso.tipo === tiposDeSimbolos.VERDADEIRO
                );
            default:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                return new ConstanteOuVariavel(this.hashArquivo, simboloIdentificador);
        }
    }

    /**
     * Em Potigol, só é possível determinar a diferença entre uma chamada e uma
     * declaração de função depois dos argumentos.
     * @returns
     */
    chamar(): Construto {
        let expressao = this.primario();

        while (true) {
            /* if (this.estaNoFinal()) {
                expressao = new Constante(expressao.hashArquivo, expressao.simbolo);
                break;
            }

            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.PARENTESE_ESQUERDO:
                    return this.funcaoOuMetodoOuChamada(expressao);
                case tiposDeSimbolos.PONTO:

                default:
                    return new Constante(expressao.hashArquivo, expressao.simbolo);
            } */

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = this.funcaoOuMetodoOuChamada(expressao as ConstanteOuVariavel);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, "Esperado nome do método após '.'.");
                expressao = new AcessoMetodo(this.hashArquivo, expressao, nome);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indice = this.expressao();
                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );
                expressao = new AcessoIndiceVariavel(this.hashArquivo, expressao, indice, simboloFechamento);
            } else {
                if (expressao instanceof ConstanteOuVariavel) {
                    expressao = new Constante(expressao.hashArquivo, (expressao as any).simbolo);
                }
                
                break;
            }
        }

        return expressao;
    }

    comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL_IGUAL)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    declaracaoEscreva(): Escreva {
        const simboloAtual = this.avancarEDevolverAnterior();

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    declaracaoImprima(): EscrevaMesmaLinha {
        const simboloAtual = this.avancarEDevolverAnterior();

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    /**
     * Blocos de escopo em Potigol existem quando:
     * 
     * - Em uma declaração de função ou método, após fecha parênteses, o próximo 
     * símbolo obrigatório não é `=` e há pelo menos um `fim` até o final do código;
     * - Em uma declaração `se`;
     * - Em uma declaração `enquanto`;
     * - Em uma declaração `para`.
     * @returns Um vetor de `Declaracao`.
     */
    blocoEscopo(): Array<RetornoDeclaracao> {
        let declaracoes: Array<RetornoDeclaracao> = [];

        while (!this.estaNoFinal() && !this.verificarTipoSimboloAtual(tiposDeSimbolos.FIM)) {
            const retornoDeclaracao = this.declaracao();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else {
                declaracoes.push(retornoDeclaracao as Declaracao);
            }
        }

        return declaracoes;
    }

    declaracaoSe(): Se {
        const simboloSe: SimboloInterface = this.avancarEDevolverAnterior();

        const condicao = this.expressao();

        this.consumir(tiposDeSimbolos.ENTAO, "Esperado palavra reservada 'entao' após condição em declaração 'se'.");

        const declaracoes = [];
        do {
            declaracoes.push(this.declaracao());
        } while (![tiposDeSimbolos.SENAO, tiposDeSimbolos.FIM].includes(this.simbolos[this.atual].tipo));

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
            const simboloSenao = this.simbolos[this.atual - 1];
            const declaracoesSenao = [];

            do {
                declaracoesSenao.push(this.declaracao());
            } while (![tiposDeSimbolos.FIM].includes(this.simbolos[this.atual].tipo));

            caminhoSenao = new Bloco(
                this.hashArquivo,
                Number(simboloSenao.linha),
                declaracoesSenao.filter((d) => d)
            );
        }

        this.consumir(tiposDeSimbolos.FIM, "Esperado palavra-chave 'fim' para fechamento de declaração 'se'.");

        return new Se(
            condicao,
            new Bloco(
                this.hashArquivo,
                Number(simboloSe.linha),
                declaracoes.filter((d) => d)
            ),
            [],
            caminhoSenao
        );
    }

    declaracaoEnquanto(): Enquanto {
        const simboloAtual = this.avancarEDevolverAnterior();

        const condicao = this.expressao();

        this.consumir(
            tiposDeSimbolos.FACA,
            "Esperado paravra reservada 'faca' após condição de continuidade em declaracão 'enquanto'."
        );

        const declaracoes = [];
        do {
            declaracoes.push(this.declaracao());
        } while (![tiposDeSimbolos.FIM].includes(this.simbolos[this.atual].tipo));

        this.consumir(tiposDeSimbolos.FIM, "Esperado palavra-chave 'fim' para fechamento de declaração 'enquanto'.");

        return new Enquanto(
            condicao,
            new Bloco(
                simboloAtual.hashArquivo,
                Number(simboloAtual.linha),
                declaracoes.filter((d) => d)
            )
        );
    }

    declaracaoPara(): Para {
        const simboloPara: SimboloInterface = this.avancarEDevolverAnterior();

        const variavelIteracao = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável após 'para'."
        );

        this.consumir(tiposDeSimbolos.DE, "Esperado palavra reservada 'de' após variáve de controle de 'para'.");

        const literalOuVariavelInicio = this.adicaoOuSubtracao();

        this.consumir(
            tiposDeSimbolos.ATE,
            "Esperado palavra reservada 'ate' após valor inicial do laço de repetição 'para'."
        );

        const literalOuVariavelFim = this.adicaoOuSubtracao();

        let operadorCondicao = new Simbolo(
            tiposDeSimbolos.MENOR_IGUAL,
            '',
            '',
            Number(simboloPara.linha),
            this.hashArquivo
        );
        let operadorCondicaoIncremento = new Simbolo(
            tiposDeSimbolos.MENOR,
            '',
            '',
            Number(simboloPara.linha),
            this.hashArquivo
        );

        // Isso existe porque o laço `para` do Potigol pode ter o passo positivo ou negativo
        // dependendo dos operandos de início e fim, que só são possíveis de determinar
        // em tempo de execução.
        // Quando um dos operandos é uma variável, tanto a condição do laço quanto o
        // passo são considerados indefinidos aqui.
        let passo: Construto;
        let resolverIncrementoEmExecucao = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PASSO)) {
            passo = this.unario();
        } else {
            if (literalOuVariavelInicio instanceof Literal && literalOuVariavelFim instanceof Literal) {
                if (literalOuVariavelInicio.valor > literalOuVariavelFim.valor) {
                    passo = new Unario(
                        this.hashArquivo,
                        new Simbolo(
                            tiposDeSimbolos.SUBTRACAO,
                            '-',
                            undefined,
                            simboloPara.linha,
                            simboloPara.hashArquivo
                        ),
                        new Literal(this.hashArquivo, Number(simboloPara.linha), 1),
                        'ANTES'
                    );
                    operadorCondicao = new Simbolo(
                        tiposDeSimbolos.MAIOR_IGUAL,
                        '',
                        '',
                        Number(simboloPara.linha),
                        this.hashArquivo
                    );
                    operadorCondicaoIncremento = new Simbolo(
                        tiposDeSimbolos.MAIOR,
                        '',
                        '',
                        Number(simboloPara.linha),
                        this.hashArquivo
                    );
                } else {
                    passo = new Literal(this.hashArquivo, Number(simboloPara.linha), 1);
                }
            } else {
                // Passo e operador de condição precisam ser resolvidos em tempo de execução.
                passo = undefined;
                operadorCondicao = undefined;
                operadorCondicaoIncremento = undefined;
                resolverIncrementoEmExecucao = true;
            }
        }

        this.consumir(
            tiposDeSimbolos.FACA,
            "Esperado palavra reservada 'faca' após valor final do laço de repetição 'para'."
        );

        const declaracoesBlocoPara = [];
        let simboloAtualBlocoPara: SimboloInterface = this.simbolos[this.atual];
        while (simboloAtualBlocoPara.tipo !== tiposDeSimbolos.FIM) {
            declaracoesBlocoPara.push(this.declaracao());
            simboloAtualBlocoPara = this.simbolos[this.atual];
        }

        this.consumir(tiposDeSimbolos.FIM, '');

        const corpo = new Bloco(
            this.hashArquivo,
            Number(simboloPara.linha) + 1,
            declaracoesBlocoPara.filter((d) => d)
        );

        const para = new Para(
            this.hashArquivo,
            Number(simboloPara.linha),
            new Atribuir(this.hashArquivo, variavelIteracao, literalOuVariavelInicio),
            new Binario(
                this.hashArquivo,
                new Variavel(this.hashArquivo, variavelIteracao),
                operadorCondicao,
                literalOuVariavelFim
            ),
            new FimPara(
                this.hashArquivo,
                Number(simboloPara.linha),
                new Binario(
                    this.hashArquivo,
                    new Variavel(this.hashArquivo, variavelIteracao),
                    operadorCondicaoIncremento,
                    literalOuVariavelFim
                ),
                new Expressao(
                    new Atribuir(
                        this.hashArquivo,
                        variavelIteracao,
                        new Binario(
                            this.hashArquivo,
                            new Variavel(this.hashArquivo, variavelIteracao),
                            new Simbolo(tiposDeSimbolos.ADICAO, '', null, Number(simboloPara.linha), this.hashArquivo),
                            passo
                        )
                    )
                )
            ),
            corpo
        );
        para.blocoPosExecucao = corpo;
        para.resolverIncrementoEmExecucao = resolverIncrementoEmExecucao;
        return para;
    }

    declaracaoEscolha(): Escolha {
        this.avancarEDevolverAnterior();

        const condicao = this.expressao();

        const caminhos = [];
        let caminhoPadrao = null;

        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FIM)) {
            this.consumir(tiposDeSimbolos.CASO, "Esperado palavra reservada 'caso' após condição de 'escolha'.");
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TRACO_BAIXO)) {
                // Caso padrão
                if (caminhoPadrao !== null) {
                    const excecao = new ErroAvaliadorSintatico(
                        this.simbolos[this.atual],
                        "Você só pode ter um caminho padrão em cada declaração de 'escolha'."
                    );
                    this.erros.push(excecao);
                    throw excecao;
                }

                this.consumir(tiposDeSimbolos.SETA, "Esperado '=>' após palavra reservada 'caso'.");
                const declaracoesPadrao = [this.declaracao()];

                // TODO: Verificar se Potigol admite bloco de escopo para `escolha`.
                /* const declaracoesPadrao = [];
                do {
                    declaracoesPadrao.push(this.declaracao());
                } while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO, tiposDeSimbolos.FIM)); */

                caminhoPadrao = {
                    declaracoes: declaracoesPadrao,
                };

                continue;
            }

            const caminhoCondicoes = [this.expressao()];
            this.consumir(tiposDeSimbolos.SETA, "Esperado '=>' após palavra reservada 'caso'.");
            const declaracoes = [this.declaracao()];

            // TODO: Verificar se Potigol admite bloco de escopo para `escolha`.
            /* const declaracoes = [];
            do {
                declaracoes.push(this.declaracao());
            } while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO, tiposDeSimbolos.FIM)); */

            caminhos.push({
                condicoes: caminhoCondicoes,
                declaracoes,
            });
        }

        return new Escolha(condicao, caminhos, caminhoPadrao);
    }

    declaracaoDeVariaveis(): Var[] {
        const simboloVar = this.avancarEDevolverAnterior();
        const identificadores: SimboloInterface[] = [];
        do {
            identificadores.push(this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome de variável.'));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.REATRIBUIR, "Esperado ':=' após identificador em instrução 'var'.");

        const inicializadores = [];
        do {
            inicializadores.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        if (identificadores.length !== inicializadores.length) {
            throw this.erro(
                simboloVar,
                'Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.'
            );
        }

        const retorno = [];
        for (let [indice, identificador] of identificadores.entries()) {
            retorno.push(new Var(identificador, inicializadores[indice]));
        }

        return retorno;
    }

    protected logicaAtribuicaoComDica(expressao: Constante) {
        // A dica de tipo é opcional.
        // Só que, se a avaliação entra na dica, só
        // podemos ter uma constante apenas.
        this.avancarEDevolverAnterior();
        if (
            ![
                tiposDeSimbolos.CARACTERE,
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.LOGICO,
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.TEXTO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            throw this.erro(this.simbolos[this.atual], 'Esperado tipo após dois-pontos e nome de identificador.');
        }

        const tipoVariavel = this.avancarEDevolverAnterior();
        const valorAtribuicaoConstante = this.ou();
        return new Const(
            (expressao as Constante).simbolo,
            valorAtribuicaoConstante,
            this.tiposPotigolParaDelegua[tipoVariavel.lexema] as TiposDadosInterface
        );
    }

    declaracaoFazer(): Fazer {
        throw new Error('Método não implementado.');
    }

    /**
     * Uma declaração de tipo nada mais é do que um declaração de classe.
     * Em Potigol, classe e tipo são praticamente a mesma coisa.
     */
    declaracaoTipo(): Classe {
        this.avancarEDevolverAnterior();
        // const simbolo: SimboloInterface = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome do tipo.');
        const construto: ConstanteOuVariavel = this.primario() as ConstanteOuVariavel;

        // TODO: Verificar se Potigol trabalha com herança.
        /* let superClasse = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.HERDA)) {
            this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da Superclasse.');
            superClasse = new Variavel(this.hashArquivo, this.simbolos[this.atual - 1]);
        } */

        const metodos = [];
        const propriedades = [];
        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.FIM) && !this.estaNoFinal()) {
            const identificador: SimboloInterface = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome de propriedade ou método.'
            );

            if (this.simbolos[this.atual].tipo === tiposDeSimbolos.PARENTESE_ESQUERDO) {
                // Método
                metodos.push(this.funcaoOuMetodoOuChamada(construto));
            } else {
                // Propriedade
                this.consumir(
                    tiposDeSimbolos.DOIS_PONTOS,
                    'Esperado dois-pontos após nome de propriedade em declaração de tipo.'
                );

                this.verificacaoTipo(
                    this.simbolos[this.atual], 
                    'Esperado tipo do argumento após dois-pontos, em definição de função.'
                );

                const tipoPropriedade = this.avancarEDevolverAnterior();
                propriedades.push(
                    new PropriedadeClasse(identificador, this.tiposPotigolParaDelegua[tipoPropriedade.lexema])
                );
            }
        }

        this.consumir(tiposDeSimbolos.FIM, "Esperado 'fim' após o escopo do tipo.");
        return new Classe(construto.simbolo, undefined, metodos, propriedades);
    }

    atribuir(): Construto {
        const expressao = this.ou();

        if (!this.estaNoFinal() && expressao instanceof Constante) {
            // Atribuição constante.

            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.DOIS_PONTOS:
                    return this.logicaAtribuicaoComDica(expressao);
                case tiposDeSimbolos.IGUAL:
                    this.avancarEDevolverAnterior();
                    const valorAtribuicao = this.ou();
                    return new Atribuir(this.hashArquivo, (expressao as Constante).simbolo, valorAtribuicao);
            }
        }

        return expressao;
    }

    declaracao(): Declaracao | Declaracao[] | Construto | Construto[] | any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ENQUANTO:
                return this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCOLHA:
                return this.declaracaoEscolha();
            case tiposDeSimbolos.ESCREVA:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.IMPRIMA:
                return this.declaracaoImprima();
            case tiposDeSimbolos.PARA:
                return this.declaracaoPara();
            case tiposDeSimbolos.SE:
                return this.declaracaoSe();
            case tiposDeSimbolos.TIPO:
                return this.declaracaoTipo();
            case tiposDeSimbolos.VARIAVEL:
                return this.declaracaoDeVariaveis();
            default:
                return this.expressao();
        }
    }

    analisar(retornoLexador: RetornoLexador, hashArquivo: number): RetornoAvaliadorSintatico {
        this.microAvaliadorSintatico = new MicroAvaliadorSintaticoPotigol(hashArquivo);
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;
        this.declaracoesAnteriores = {};

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        let declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            const retornoDeclaracao = this.declaracao();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else {
                declaracoes.push(retornoDeclaracao as Declaracao);
            }
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}