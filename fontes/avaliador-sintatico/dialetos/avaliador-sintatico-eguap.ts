import { AcessoIndiceVariavel, AcessoMetodo, AtribuicaoSobrescrita, Atribuir, Binario, Chamada, Conjunto, Construto, Funcao, Logico, Unario, Variavel } from '../../construtos';
import {
    Escreva,
    Se,
    Enquanto,
    Para,
    Continua,
    Retorna,
    Escolha,
    Importar,
    Tente,
    Fazer,
    Var,
    Funcao as FuncaoDeclaracao,
    Classe,
    Declaracao,
    Expressao,
    Bloco,
} from '../../declaracoes';
import { Delegua } from '../../delegua';
import {
    AvaliadorSintaticoInterface,
    SimboloInterface,
} from '../../interfaces';
import tiposDeSimbolos from '../../lexador/dialetos/tipos-de-simbolos-eguap';
import { ErroAvaliador } from '../erros-avaliador';

export class AvaliadorSintaticoEguaP implements AvaliadorSintaticoInterface {
    simbolos: SimboloInterface[];
    Delegua: Delegua;

    atual: number;
    ciclos: number;
    tamanhoIndentacaoAnterior: number;
    performance: boolean;

    constructor(Delegua: Delegua, performance: boolean = false) {
        this.Delegua = Delegua;

        this.atual = 0;
        this.ciclos = 0;
        this.tamanhoIndentacaoAnterior = 0;
        this.performance = performance;
    }

    sincronizar(): void {
        this.avancarEDevolverAnterior();

        while (!this.estaNoFinal()) {
            switch (this.simboloAtual().tipo) {
                case tiposDeSimbolos.CLASSE:
                case tiposDeSimbolos.FUNCAO:
                case tiposDeSimbolos.FUNÇÃO:
                case tiposDeSimbolos.VARIAVEL:
                case tiposDeSimbolos.PARA:
                case tiposDeSimbolos.SE:
                case tiposDeSimbolos.ENQUANTO:
                case tiposDeSimbolos.ESCREVA:
                case tiposDeSimbolos.RETORNA:
                    return;
            }

            this.avancarEDevolverAnterior();
        }
    }

    erro(simbolo: SimboloInterface, mensagemDeErro: string): ErroAvaliador {
        this.Delegua.erro(simbolo, mensagemDeErro);
        return new ErroAvaliador();
    }

    consumir(tipo: any, mensagemDeErro: string) {
        if (this.verificarTipoSimboloAtual(tipo)) return this.avancarEDevolverAnterior();
        throw this.erro(this.simboloAtual(), mensagemDeErro);
    }

    verificarTipoSimboloAtual(tipo: any): boolean {
        if (this.estaNoFinal()) return false;
        return this.simboloAtual().tipo === tipo;
    }

    verificarTipoProximoSimbolo(tipo: any): boolean {
        if (this.estaNoFinal()) return false;
        return this.simbolos[this.atual + 1].tipo === tipo;
    }

    simboloAtual(): SimboloInterface {
        return this.simbolos[this.atual];
    }

    simboloAnterior(): SimboloInterface {
        return this.simbolos[this.atual - 1];
    }

    simboloNaPosicao(posicao: number): SimboloInterface {
        return this.simbolos[this.atual + posicao];
    }

    estaNoFinal(): boolean {
        return this.atual >= this.simbolos.length;
    }

    avancarEDevolverAnterior() {
        if (!this.estaNoFinal()) this.atual += 1;
        return this.simboloAnterior();
    }

    verificarSeSimboloAtualEIgualA(...argumentos: any[]): boolean {
        for (let i = 0; i < argumentos.length; i++) {
            const tipoAtual = argumentos[i];
            if (this.verificarTipoSimboloAtual(tipoAtual)) {
                this.avancarEDevolverAnterior();
                return true;
            }
        }

        return false;
    }

    primario() {
        throw new Error('Method not implemented.');
    }

    finalizarChamada(entidadeChamada: Construto): Construto {
        const argumentos = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                if (argumentos.length >= 255) {
                    throw this.erro(
                        this.simboloAtual(),
                        'Não pode haver mais de 255 argumentos.'
                    );
                }
                argumentos.push(this.expressao());
            } while (
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA)
            );
        }

        const parenteseDireito = this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os argumentos."
        );

        return new Chamada(entidadeChamada, parenteseDireito, argumentos);
    }
    
    chamar(): Construto {
        /* let expressao = this.primario();

        while (true) {
            if (
                this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.PARENTESE_ESQUERDO
                )
            ) {
                expressao = this.finalizarChamada(expressao);
            } else if (
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)
            ) {
                let nome = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome do método após '.'."
                );
                expressao = new AcessoMetodo(expressao, nome);
            } else if (
                this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.COLCHETE_ESQUERDO
                )
            ) {
                const indice = this.expressao();
                let simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );
                expressao = new AcessoIndiceVariavel(expressao, indice, simboloFechamento);
            } else {
                break;
            }
        }

        return expressao; */
        return null;
    }

    unario(): Construto {
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.BIT_NOT
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.unario();
            return new Unario(operador, direito);
        }

        return this.chamar();
    }

    exponenciacao(): Construto {
        let expressao = this.unario();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)
        ) {
            const operador = this.simboloAnterior();
            const direito = this.unario();
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    multiplicar(): Construto {
        let expressao = this.exponenciacao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIVISAO,
                tiposDeSimbolos.MULTIPLICACAO,
                tiposDeSimbolos.MODULO
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.exponenciacao();
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    adicionar(): Construto {
        let expressao = this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.ADICAO
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.multiplicar();
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    bitFill(): Construto {
        let expressao = this.adicionar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MENOR_MENOR,
                tiposDeSimbolos.MAIOR_MAIOR
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.adicionar();
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    bitE(): Construto {
        let expressao = this.bitFill();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simboloAnterior();
            const direito = this.bitFill();
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    bitOu(): Construto {
        let expressao = this.bitE();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.BIT_OR,
                tiposDeSimbolos.BIT_XOR
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.bitE();
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    comparar(): Construto {
        let expressao = this.bitOu();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.bitOu();
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIFERENTE,
                tiposDeSimbolos.IGUAL_IGUAL
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.comparar();
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    em(): Construto {
        let expressao = this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM)) {
            const operador = this.simboloAnterior();
            const direito = this.comparacaoIgualdade();
            expressao = new Logico(expressao, operador, direito);
        }

        return expressao;
    }

    e(): Construto {
        let expressao = this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simboloAnterior();
            const direito = this.em();
            expressao = new Logico(expressao, operador, direito);
        }

        return expressao;
    }

    ou(): Construto {
        let expressao = this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
            const operador = this.simboloAnterior();
            const direito = this.e();
            expressao = new Logico(expressao, operador, direito);
        }

        return expressao;
    }

    atribuir(): Construto {
        const expressao = this.ou();

        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL) ||
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MAIS_IGUAL)
        ) {
            const igual = this.simboloAnterior();
            const valor = this.atribuir();

            if (expressao instanceof Variavel) {
                const simbolo = expressao.simbolo;
                return new Atribuir(simbolo, valor);
            } else if (expressao instanceof AcessoMetodo) {
                const get = expressao;
                return new Conjunto(0, get.objeto, get.simbolo, valor);
            } else if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoSobrescrita(0, 
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }
            this.erro(igual, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    expressao(): Construto {
        return this.atribuir();
    }

    declaracaoEscreva(): Escreva {
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const simbolo: any = this.expressao();

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        return new Escreva(simbolo);
    }

    declaracaoExpressao() {
        const expressao = this.expressao();
        return new Expressao(expressao);
    }

    blocoEscopo() {
        const declaracoes = [];

        this.avancarEDevolverAnterior();

        // Situação 1: não tem bloco de escopo.
        // Não existe um símbolo de espaço de indentação como 
        // próximo símbolo.

        if (this.simboloAtual().tipo !== tiposDeSimbolos.ESPACO_INDENTACAO) {
            declaracoes.push(this.declaracao());
        } else {
            // Situação 2: Tem bloco de escopo. 
            // Precisamos saber o nível de indentação anterior e o atual.
            const simboloEspacoIndentacao: SimboloInterface = this.simboloAtual();
            let tamanhoIndentacaoAtual: number = Number(simboloEspacoIndentacao.literal);
            while (tamanhoIndentacaoAtual > this.tamanhoIndentacaoAnterior) {
                this.avancarEDevolverAnterior();
                let simboloAtual: SimboloInterface;

                if (this.simboloAtual().tipo === tiposDeSimbolos.ESPACO_INDENTACAO) {
                    simboloAtual = this.simboloAtual();
                    const indentacaoSimbolo: number = Number(simboloEspacoIndentacao.literal);
                    
                    if (tamanhoIndentacaoAtual !== indentacaoSimbolo && 
                        indentacaoSimbolo !== this.tamanhoIndentacaoAnterior) {
                        throw this.erro(simboloAtual, `Indentação da linha ${simboloAtual.linha} (${indentacaoSimbolo}) inconsistente com indentação atual do bloco (${tamanhoIndentacaoAtual}).`);
                    }

                    tamanhoIndentacaoAtual = indentacaoSimbolo;

                    /* if (indentacaoSimbolo === this.tamanhoIndentacaoAnterior) {
                        // Bloco acabou
                        break;
                    }

                    if (tamanhoIndentacaoAtual === indentacaoSimbolo) {
                        // Ainda estamos no mesmo bloco
                        continue;
                    } */
                } else {
                    declaracoes.push(this.declaracao());
                }
            }
        }

        return declaracoes;
    }

    declaracaoSe(): Se {
        throw new Error('Method not implemented.');
    }

    declaracaoEnquanto(): Enquanto {
        throw new Error('Method not implemented.');
    }
    declaracaoPara(): Para {
        throw new Error('Method not implemented.');
    }
    declaracaoInterromper() {
        throw new Error('Method not implemented.');
    }
    declaracaoContinua(): Continua {
        throw new Error('Method not implemented.');
    }
    declaracaoRetorna(): Retorna {
        throw new Error('Method not implemented.');
    }
    declaracaoEscolha(): Escolha {
        throw new Error('Method not implemented.');
    }
    declaracaoImportar(): Importar {
        throw new Error('Method not implemented.');
    }
    declaracaoTente(): Tente {
        throw new Error('Method not implemented.');
    }
    declaracaoFazer(): Fazer {
        throw new Error('Method not implemented.');
    }
    resolverDeclaracao() {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FAZER))
            return this.declaracaoFazer();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TENTE))
            return this.declaracaoTente();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ESCOLHA))
            return this.declaracaoEscolha();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.RETORNA))
            return this.declaracaoRetorna();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CONTINUA))
            return this.declaracaoContinua();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PAUSA))
            return this.declaracaoInterromper();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARA))
            return this.declaracaoPara();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ENQUANTO))
            return this.declaracaoEnquanto();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE))
            return this.declaracaoSe();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ESCREVA))
            return this.declaracaoEscreva();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS))
            return new Bloco(this.blocoEscopo());

        return this.declaracaoExpressao();
    }
    declaracaoDeVariavel(): Var {
        throw new Error('Method not implemented.');
    }

    funcao(tipo: any): FuncaoDeclaracao {
        throw new Error('Method not implemented.');
    }

    corpoDaFuncao(tipo: any): Funcao {
        throw new Error('Method not implemented.');
    }

    declaracaoDeClasse(): Classe {
        throw new Error('Method not implemented.');
    }

    declaracao() {
        try {
            if (
                this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.consumir(tiposDeSimbolos.FUNÇÃO, null);
                return this.funcao('função');
            }
            if (
                this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.consumir(tiposDeSimbolos.FUNCAO, null);
                return this.funcao('funcao');
            }
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VARIAVEL))
                return this.declaracaoDeVariavel();
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE))
                return this.declaracaoDeClasse();

            return this.resolverDeclaracao();
        } catch (erro) {
            this.sincronizar();
            return null;
        }
    }

    analisar(simbolos?: SimboloInterface[]): Declaracao[] {
        throw new Error('Method not implemented.');
    }
}
