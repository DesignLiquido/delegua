import { Agrupamento, Atribuir, Binario, Constante, Construto, FimPara, FuncaoConstruto, Literal, Unario, Variavel } from "../../construtos";
import { Escreva, Declaracao, Se, Enquanto, Para, Escolha, Fazer, EscrevaMesmaLinha, Const, Var, Bloco, Expressao, FuncaoDeclaracao } from "../../declaracoes";
import { RetornoLexador, RetornoAvaliadorSintatico } from "../../interfaces/retornos";
import { AvaliadorSintaticoBase } from "../avaliador-sintatico-base";

import tiposDeSimbolos from "../../tipos-de-simbolos/potigol";
import { ParametroInterface, SimboloInterface } from "../../interfaces";
import { TiposDadosInterface } from "../../interfaces/tipos-dados-interface";
import { Simbolo } from "../../lexador";
import { ErroAvaliadorSintatico } from "../erro-avaliador-sintatico";
import { RetornoDeclaracao } from "../retornos";

/**
 * TODO: Pensar numa forma de avaliar múltiplas constantes sem
 * transformar o retorno de `primario()` em um vetor. 
 */
export class AvaliadorSintaticoPotigol extends AvaliadorSintaticoBase {
    tiposPotigolParaDelegua = {
        'Caractere': 'texto',
        'Inteiro': 'numero',
        'Logico': 'lógico',
        'Lógico': 'lógico',
        'Real': 'numero',
        'Texto': 'texto',
        undefined: undefined
    }

    funcaoPotigol(simbolo: SimboloInterface): FuncaoDeclaracao {
        return new FuncaoDeclaracao(simbolo, this.corpoDaFuncao(simbolo.lexema));
    }

    corpoDaFuncao(nomeFuncao: string): FuncaoConstruto {
        // O parêntese esquerdo é considerado o símbolo inicial para
        // fins de pragma. 
        const parenteseEsquerdo = this.avancarEDevolverAnterior();

        let parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            parametros = this.logicaComumParametros();
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");
        this.consumir(tiposDeSimbolos.IGUAL, `Esperado '=' antes do escopo da função ${nomeFuncao}.`);

        const corpo = this.blocoEscopo();

        return new FuncaoConstruto(this.hashArquivo, Number(parenteseEsquerdo.linha), parametros, corpo);
    }

    protected logicaComumParametros(): ParametroInterface[] {
        const parametros: ParametroInterface[] = [];

        if (parametros.length >= 255) {
            this.erro(this.simbolos[this.atual], 'Não pode haver mais de 255 parâmetros');
        }

        do {
            const parametro: Partial<ParametroInterface> = {};

            // TODO: verificar se Potigol trabalha com número variável de parâmetros.
            /* if (this.simbolos[this.atual].tipo === tiposDeSimbolos.MULTIPLICACAO) {
                this.consumir(tiposDeSimbolos.MULTIPLICACAO, null);
                parametro.abrangencia = 'multiplo';
            } else {
                parametro.abrangencia = 'padrao';
            } */

            parametro.abrangencia = 'padrao';
            parametro.nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome do parâmetro.');
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado dois-pontos após nome de argumento para função.");

            if (!this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.LOGICO,
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.TEXTO
            )) {
                this.erro(this.simbolos[this.atual], "Esperado tipo do argumento após dois-pontos, em definição de função.");
            }

            const tipoParametro = this.simbolos[this.atual - 1];
            parametro.tipo = this.tiposPotigolParaDelegua[tipoParametro.lexema];

            // TODO: Verificar se Potigol trabalha com valores padrão em argumentos.
            /* if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro.valorPadrao = this.primario();
            } */

            parametros.push(parametro as ParametroInterface);

            // if (parametro.abrangencia === 'multiplo') break;
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return parametros;
    }

    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];

        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);
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
                if (!this.estaNoFinal() && this.simbolos[this.atual].tipo === tiposDeSimbolos.PARENTESE_ESQUERDO) {
                    return this.funcaoPotigol(simboloIdentificador);
                }

                return new Constante(this.hashArquivo, simboloIdentificador);
        }
    }

    chamar(): Construto {
        return this.primario();
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

        this.consumir(
            tiposDeSimbolos.FIM,
            "Esperado palavra-chave 'fim' para fechamento de declaração 'enquanto'."
        );

        return new Enquanto(
            condicao,
            new Bloco(
                simboloAtual.hashArquivo,
                Number(simboloAtual.linha),
                declaracoes.filter(d => d)
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

        let operadorCondicao = new Simbolo(tiposDeSimbolos.MENOR_IGUAL, '', '', Number(simboloPara.linha), this.hashArquivo);
        let operadorCondicaoIncremento = new Simbolo(tiposDeSimbolos.MENOR, '', '', Number(simboloPara.linha), this.hashArquivo);

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
                        "ANTES");
                    operadorCondicao = new Simbolo(tiposDeSimbolos.MAIOR_IGUAL, '', '', Number(simboloPara.linha), this.hashArquivo);
                    operadorCondicaoIncremento = new Simbolo(tiposDeSimbolos.MAIOR, '', '', Number(simboloPara.linha), this.hashArquivo);
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
            new Atribuir(
                this.hashArquivo,
                variavelIteracao,
                literalOuVariavelInicio
            ),
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
                    declaracoes: declaracoesPadrao
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

    declaracaoFazer(): Fazer {
        throw new Error("Método não implementado.");
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
            throw this.erro(simboloVar, "Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.");
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
        if (![
            tiposDeSimbolos.CARACTERE,
            tiposDeSimbolos.INTEIRO,
            tiposDeSimbolos.LOGICO,
            tiposDeSimbolos.REAL,
            tiposDeSimbolos.TEXTO
        ].includes(this.simbolos[this.atual].tipo)) {
            throw this.erro(
                this.simbolos[this.atual], 
                "Esperado tipo após dois-pontos e nome de identificador."
            );
        }

        const tipoVariavel = this.avancarEDevolverAnterior();
        const valorAtribuicaoConstante = this.ou();
        return new Const(
            (expressao as Constante).simbolo, 
            valorAtribuicaoConstante, 
            this.tiposPotigolParaDelegua[tipoVariavel.lexema] as TiposDadosInterface
        );
    }

    atribuir(): Construto {
        const expressao = this.ou();

        if (expressao instanceof Constante) {
            // Atribuição constante.
            
            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.DOIS_PONTOS:
                    return this.logicaAtribuicaoComDica(expressao);
                case tiposDeSimbolos.IGUAL:
                    this.avancarEDevolverAnterior();
                    const valorAtribuicao = this.ou();
                    return new Atribuir(
                        this.hashArquivo,
                        (expressao as Constante).simbolo, 
                        valorAtribuicao
                    );
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
            case tiposDeSimbolos.VARIAVEL:
                return this.declaracaoDeVariaveis();
            default:
                return this.expressao();
        }
    }

    analisar(retornoLexador: RetornoLexador, hashArquivo: number): RetornoAvaliadorSintatico {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

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