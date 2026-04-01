import {
    Binario,
    Chamada,
    Construto,
    FuncaoConstruto,
    Leia,
    Logico,
    TuplaN,
    Unario,
} from '../construtos';
import {
    Bloco,
    Classe,
    Continua,
    Declaracao,
    Enquanto,
    Escreva,
    Expressao,
    FuncaoDeclaracao,
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
export abstract class AvaliadorSintaticoBase implements AvaliadorSintaticoInterface<
    SimboloInterface,
    Declaracao
> {
    simbolos: SimboloInterface[] = [];
    erros: ErroAvaliadorSintatico[] = [];

    hashArquivo: number = -1;
    atual: number = 0;
    blocos: number = 0;

    erro(simbolo: SimboloInterface, mensagemDeErro: string): ErroAvaliadorSintatico {
        const excecao = new ErroAvaliadorSintatico(simbolo, mensagemDeErro);
        return excecao;
    }

    protected consumir(tipo: string, mensagemDeErro: string): SimboloInterface {
        if (this.verificarTipoSimboloAtual(tipo)) return this.avancarEDevolverAnterior();
        let simboloErro: SimboloInterface = this.simbolos[this.atual];
        if (this.simbolos.length === 0) {
            simboloErro = {
                hashArquivo: this.hashArquivo,
                linha: 1,
            } as SimboloInterface;
        } else if (this.atual >= this.simbolos.length) {
            simboloErro = this.simbolos[this.simbolos.length - 1];
        }

        throw this.erro(simboloErro, mensagemDeErro);
    }

    protected simboloAnterior(): SimboloInterface {
        if (this.atual === 0) {
            throw new Error('Este é o primeiro símbolo da sequência vinda do Lexador.');
        }

        return this.simbolos[this.atual - 1];
    }

    protected verificarTipoSimboloAtual(tipo: string): boolean {
        if (this.estaNoFinal()) return false;
        return this.simbolos[this.atual].tipo === tipo;
    }

    protected verificarTipoProximoSimbolo(tipo: string): boolean {
        if (this.atual + 1 >= this.simbolos.length) return false;
        return this.simbolos[this.atual + 1].tipo === tipo;
    }

    protected estaNoFinal(): boolean {
        return this.atual === this.simbolos.length;
    }

    protected avancarEDevolverAnterior(): SimboloInterface {
        if (!this.estaNoFinal()) this.atual += 1;
        return this.simbolos[this.atual - 1];
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
    protected abstract atribuir(): Promise<Construto>; // `atribuir()` deve chamar `ou()` ou algum outro método unário ou
    // binário de visita na implementação.
    protected abstract blocoEscopo(): Promise<Declaracao[]>;
    protected abstract chamar(): Promise<Construto>;
    protected abstract corpoDaFuncao(tipo: string): Promise<FuncaoConstruto>;
    protected abstract declaracaoEnquanto(): Promise<Enquanto>;
    protected abstract declaracaoEscreva(): Promise<Escreva>;
    protected abstract declaracaoPara(): Promise<Para | ParaCada>;
    protected abstract declaracaoSe(): Promise<Se>;
    protected abstract expressaoLeia(): Promise<Leia>;
    protected abstract primario(): Promise<Construto>;
    protected abstract resolverDeclaracaoForaDeBloco(): Promise<Declaracao | Declaracao[]>;

    protected async declaracaoBloco(): Promise<Bloco> {
        const simboloInicioBloco: SimboloInterface = this.consumir(
            tiposDeSimbolos.CHAVE_ESQUERDA,
            "Esperado '{' para abertura de bloco."
        );
        return new Bloco(
            simboloInicioBloco.hashArquivo,
            Number(simboloInicioBloco.linha),
            await this.blocoEscopo()
        );
    }

    protected async finalizarChamada(entidadeChamada: Construto): Promise<Chamada> {
        const argumentos: Array<Construto> = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                // `apply()` em JavaScript aceita até 255 parâmetros.
                if (argumentos.length >= 255) {
                    throw this.erro(
                        this.simbolos[this.atual],
                        'Não pode haver mais de 255 argumentos.'
                    );
                }
                argumentos.push(await this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os argumentos.");
        return new Chamada(this.hashArquivo, entidadeChamada, argumentos);
    }

    protected async unario(): Promise<Construto> {
        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NEGACAO, tiposDeSimbolos.SUBTRACAO)
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.unario();
            return Promise.resolve(new Unario(this.hashArquivo, operador, direito, 'ANTES'));
        }

        return await this.chamar();
    }

    /**
     * A exponenciacão é uma exceção na ordem de avaliação (resolve primeiro à direita).
     * Por isso `direito` chama `exponenciacao()`, e não `unario()`.
     * @returns {Binario} A expressão binária na forma do construto `Binario`.
     */
    protected async exponenciacao(): Promise<Construto> {
        let expressao = await this.unario();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.exponenciacao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected async multiplicar(): Promise<Construto> {
        let expressao = await this.exponenciacao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIVISAO,
                tiposDeSimbolos.DIVISAO_INTEIRA,
                tiposDeSimbolos.MULTIPLICACAO,
                tiposDeSimbolos.MODULO
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.exponenciacao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected async adicaoOuSubtracao(): Promise<Construto> {
        let expressao = await this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.multiplicar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    /**
     * Este método é usado por Delégua e alguns dialetos de Portugol que possuem declarações
     * de múltiplas variáveis na mesma linha.
     */
    protected declaracaoDeVariaveis(): Promise<Var[]> {
        throw new Error('Método não implementado.');
    }

    protected async comparar(): Promise<Construto> {
        let expressao = await this.adicaoOuSubtracao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.adicaoOuSubtracao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected async comparacaoIgualdade(): Promise<Construto> {
        let expressao = await this.comparar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIFERENTE,
                tiposDeSimbolos.IGUAL,
                tiposDeSimbolos.IGUAL_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected async e(): Promise<Construto> {
        let expressao = await this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected async ou(): Promise<Construto> {
        let expressao = await this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.e();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    /**
     * Processa tuplas, que são expressões separadas por vírgula entre parênteses.
     * Se não houver vírgula, retorna apenas a expressão simples.
     */
    protected async tupla(): Promise<Construto> {
        let expressao = await this.ou();

        // Se não há vírgula, retorna a expressão simples
        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA)) {
            return expressao;
        }

        // Se há vírgula, então é uma tupla
        const elementos = [expressao];

        do {
            if (this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                break;
            }
            elementos.push(await this.ou());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new TuplaN(this.hashArquivo, expressao.linha, elementos);
    }

    protected async expressao(): Promise<Construto> {
        return await this.atribuir();
    }

    protected async funcao(tipo: string): Promise<FuncaoDeclaracao> {
        // Avançar `função` ou `funcao`.
        this.avancarEDevolverAnterior();

        const nomeFuncao: SimboloInterface = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            `Esperado nome ${tipo}.`
        );

        const corpo = await this.corpoDaFuncao(tipo);
        return new FuncaoDeclaracao(nomeFuncao, corpo);
    }

    protected async logicaComumParametros(): Promise<ParametroInterface[]> {
        const parametros: ParametroInterface[] = [];

        do {
            if (parametros.length >= 255) {
                throw this.erro(
                    this.simbolos[this.atual],
                    'Função não pode ter mais de 255 parâmetros.'
                );
            }

            const parametro: Partial<ParametroInterface> = {};

            if (this.simbolos[this.atual].tipo === tiposDeSimbolos.MULTIPLICACAO) {
                this.avancarEDevolverAnterior();
                parametro.abrangencia = 'multiplo';
            } else {
                parametro.abrangencia = 'padrao';
            }

            parametro.nome = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome do parâmetro.'
            );

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro.valorPadrao = await this.primario();
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

    protected bitShift(): Promise<Construto> {
        throw new Error('Método não implementado.');
    }

    protected bitE(): Promise<Construto> {
        throw new Error('Método não implementado.');
    }

    protected bitOu(): Promise<Construto> {
        throw new Error('Método não implementado.');
    }

    protected declaracaoContinua(): Continua {
        throw new Error('Método não implementado.');
    }

    protected declaracaoDeClasse(): Promise<Classe> {
        throw new Error('Método não implementado.');
    }

    protected declaracaoDeVariavel(): Var {
        throw new Error('Método não implementado.');
    }

    protected declaracaoExpressao(simboloAnterior?: SimboloInterface): Promise<Expressao> {
        throw new Error('Método não implementado.');
    }

    protected declaracaoRetorna(): Promise<Retorna> {
        throw new Error('Método não implementado.');
    }

    protected declaracaoSustar(): Sustar {
        throw new Error('Método não implementado.');
    }

    protected declaracaoTente(): Promise<Tente> {
        throw new Error('Método não implementado.');
    }

    protected em(): Promise<Construto> {
        throw new Error('Método não implementado.');
    }

    protected resolverDeclaracao() {
        throw new Error('Método não implementado.');
    }

    /**
     * Este é o ponto de entrada de toda a avaliação sintática. É o
     * único método mencionado na interface do avaliador sintático, e cada
     * avaliador sintático deve implementar o seu método.
     * @param retornoLexador O retorno do Lexador.
     * @param hashArquivo O hash do arquivo, gerado pela função `cyrb53`.
     * @see cyrb53
     */
    abstract analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<Declaracao>>;
}
