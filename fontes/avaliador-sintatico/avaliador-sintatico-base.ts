import { Binario, Chamada, Construto, FuncaoConstruto, Logico, Unario } from '../construtos';
import {
    Classe,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    Leia,
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    Tente,
    Var,
} from '../declaracoes';
import { AvaliadorSintaticoInterface, ParametroInterface, SimboloInterface } from '../interfaces';
import { RetornoAvaliadorSintatico, RetornoLexador } from '../interfaces/retornos';
import { ErroAvaliadorSintatico } from './erro-avaliador-sintatico';

import tiposDeSimbolos from '../tipos-de-simbolos/comum';

/**
 * O Avaliador Sintático Base é uma tentativa de mapear métodos em comum
 * entre todos os outros Avaliadores Sintáticos. Depende de um dicionário
 * de tipos de símbolos comuns entre todos os dialetos.
 */
export abstract class AvaliadorSintaticoBase implements AvaliadorSintaticoInterface<SimboloInterface, Declaracao> {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];

    hashArquivo: number;
    atual: number;
    blocos: number;

    protected consumir(tipo: string, mensagemDeErro: string): SimboloInterface {
        if (this.verificarTipoSimboloAtual(tipo)) return this.avancarEDevolverAnterior();
        throw this.erro(this.simbolos[this.atual], mensagemDeErro);
    }

    protected erro(simbolo: SimboloInterface, mensagemDeErro: string): ErroAvaliadorSintatico {
        const excecao = new ErroAvaliadorSintatico(simbolo, mensagemDeErro);
        this.erros.push(excecao);
        return excecao;
    }

    protected simboloAnterior(): SimboloInterface {
        return this.simbolos[this.atual - 1];
    }

    protected verificarTipoSimboloAtual(tipo: string): boolean {
        if (this.estaNoFinal()) return false;
        return this.simbolos[this.atual].tipo === tipo;
    }

    protected verificarTipoProximoSimbolo(tipo: string): boolean {
        return this.simbolos[this.atual + 1].tipo === tipo;
    }

    protected estaNoFinal(): boolean {
        return this.atual === this.simbolos.length;
    }

    protected avancarEDevolverAnterior(): SimboloInterface {
        if (!this.estaNoFinal()) this.atual += 1;
        return this.simbolos[this.atual - 1];
    }

    // TODO: Verificar possibilidade de remoção. 
    // Regressão de símbolo é uma roubada por N razões.
    protected regredirEDevolverAtual(): SimboloInterface {
        if (this.atual > 0) this.atual -= 1;
        return this.simbolos[this.atual];
    }

    protected verificarSeSimboloAtualEIgualA(...argumentos: string[]): boolean {
        for (let i = 0; i < argumentos.length; i++) {
            const tipoAtual = argumentos[i];
            if (this.verificarTipoSimboloAtual(tipoAtual)) {
                this.avancarEDevolverAnterior();
                return true;
            }
        }

        return false;
    }

    /**
     * Os métodos a seguir devem ser implementados nos seus respectivos 
     * dialetos por diferentes razões: seja porque o dialeto correspondente
     * tem uma abordagem diferente sobre entrada e saída, seja porque a 
     * funcionalidade sequer existe, mas é suprimida por outra.
     * 
     * Esses métodos não precisam ser expostos. A recomendação geral é
     * implementá-los como `protected`.
     */
    protected abstract atribuir(): Construto; // `atribuir()` deve chamar `ou()` ou algum outro método unário ou 
                                    // binário de visita na implementação.
    protected abstract blocoEscopo(): Declaracao[];
    protected abstract chamar(): Construto;
    protected abstract corpoDaFuncao(tipo: string): FuncaoConstruto;
    protected abstract declaracaoEnquanto(): Enquanto;
    protected abstract declaracaoEscolha(): Escolha;
    protected abstract declaracaoEscreva(): Escreva;
    protected abstract declaracaoFazer(): Fazer;
    protected abstract declaracaoLeia(): Leia
    protected abstract declaracaoPara(): Para | ParaCada;
    protected abstract declaracaoSe(): Se;
    protected abstract primario(): Construto;
    protected abstract resolverDeclaracaoForaDeBloco(): Declaracao;

    protected finalizarChamada(entidadeChamada: Construto): Chamada {
        const argumentos: Array<Construto> = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                // `apply()` em JavaScript aceita até 255 parâmetros.
                if (argumentos.length >= 255) {
                    throw this.erro(this.simbolos[this.atual], 'Não pode haver mais de 255 argumentos.');
                }
                argumentos.push(this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        const parenteseDireito = this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os argumentos.");
        return new Chamada(this.hashArquivo, entidadeChamada, parenteseDireito, argumentos);
    }

    protected unario(): Construto {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NEGACAO, tiposDeSimbolos.SUBTRACAO)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.unario();
            return new Unario(this.hashArquivo, operador, direito, 'ANTES');
        }

        return this.chamar();
    }

    protected exponenciacao(): Construto {
        let expressao = this.unario();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.unario();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected multiplicar(): Construto {
        let expressao = this.exponenciacao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIVISAO,
                tiposDeSimbolos.DIVISAO_INTEIRA,
                tiposDeSimbolos.MULTIPLICACAO,
                tiposDeSimbolos.MODULO
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.exponenciacao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected adicaoOuSubtracao(): Construto {
        let expressao = this.multiplicar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.multiplicar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    /**
     * Este método é usado por alguns dialetos de Portugol que possuem declarações
     * de múltiplas variáveis na mesma linha.
     */
    protected declaracaoDeVariaveis(): Var[] {
        throw new Error('Método não implementado.');
    }

    protected comparar(): Construto {
        let expressao = this.adicaoOuSubtracao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.adicaoOuSubtracao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIFERENTE,
                tiposDeSimbolos.IGUAL,
                tiposDeSimbolos.IGUAL_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected e(): Construto {
        let expressao = this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected ou(): Construto {
        let expressao = this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.e();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected expressao(): Construto {
        return this.atribuir();
    }

    protected funcao(tipo: string): FuncaoDeclaracao {
        const simboloFuncao: SimboloInterface = this.avancarEDevolverAnterior();

        const nomeFuncao: SimboloInterface = this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome ${tipo}.`);
        return new FuncaoDeclaracao(nomeFuncao, this.corpoDaFuncao(tipo));
    }

    protected logicaComumParametros(): ParametroInterface[] {
        const parametros: ParametroInterface[] = [];

        do {
            if (parametros.length >= 255) {
                this.erro(this.simbolos[this.atual], 'Não pode haver mais de 255 parâmetros');
            }

            const parametro: Partial<ParametroInterface> = {};

            if (this.simbolos[this.atual].tipo === tiposDeSimbolos.MULTIPLICACAO) {
                this.consumir(tiposDeSimbolos.MULTIPLICACAO, null);
                parametro.abrangencia = 'multiplo';
            } else {
                parametro.abrangencia = 'padrao';
            }

            parametro.nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome do parâmetro.');

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro.valorPadrao = this.primario();
            }

            parametros.push(parametro as ParametroInterface);

            if (parametro.abrangencia === 'multiplo') break;
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return parametros;
    }

    /**
     * Os métodos a seguir só devem ser implementados se o dialeto
     * em questão realmente possui a funcionalidade, e devem levantar
     * erro em caso contrário.
     */

    protected bitShift(): Construto {
        throw new Error('Método não implementado.');
    }

    protected bitE(): Construto {
        throw new Error('Método não implementado.');
    }

    protected bitOu(): Construto {
        throw new Error('Método não implementado.');
    }

    protected declaracaoContinua(): Continua {
        throw new Error('Método não implementado.');
    }

    protected declaracaoDeClasse(): Classe {
        throw new Error('Método não implementado.');
    }

    protected declaracaoDeVariavel(): Var {
        throw new Error('Método não implementado.');
    }

    protected declaracaoExpressao(simboloAnterior?: SimboloInterface): Expressao {
        throw new Error('Método não implementado.');
    }

    protected declaracaoImportar(): Importar {
        throw new Error('Método não implementado.');
    }

    protected declaracaoRetorna(): Retorna {
        throw new Error('Método não implementado.');
    }

    protected declaracaoSustar(): Sustar {
        throw new Error('Método não implementado.');
    }

    protected declaracaoTente(): Tente {
        throw new Error('Método não implementado.');
    }

    protected em(): Construto {
        throw new Error('Método não implementado.');
    }

    protected resolverDeclaracao() {
        throw new Error('Método não implementado.');
    }

    /**
     * Este é o ponto de entrada de toda a avaliação sintática. É o 
     * único método mencionado na interface do avaliador sintático. 
     * @param retornoLexador O retorno do Lexador.
     * @param hashArquivo O hash do arquivo, gerado pela função `cyrb53`. 
     */
    abstract analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Declaracao>;
}
