import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';

import tiposDeSimbolos from '../../tipos-de-simbolos/visualg' 
import { Bloco, Escolha, Escreva, Leia, Para } from '../../declaracoes';
import { Atribuir, Binario, Construto, Literal, Variavel } from '../../construtos';
import { SimboloInterface } from '../../interfaces';
import { Simbolo } from '../../lexador';

export class AvaliadorSintaticoVisuAlg extends AvaliadorSintaticoBase {
    
    validarSegmentoAlgoritmo(): void {
        this.consumir(tiposDeSimbolos.ALGORITMO, 
            "Esperada expressão 'algoritmo' para inicializar programa.");

        this.consumir(tiposDeSimbolos.CARACTERE, 
            "Esperad cadeia de caracteres após palavra-chave 'algoritmo'.");

        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, 
            "Esperado quebra de linha após definição do segmento 'algoritmo'.");
    }

    /**
     * Validação do segmento de declaração de variáveis (opcional).
     * @returns Sempre retorna `void`.
     */
    validarSegmentoVar(): void {
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.VAR)) {
            return;
        }

        this.avancarEDevolverAnterior(); // Var
        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.INICIO)) {
            this.consumir(tiposDeSimbolos.IDENTIFICADOR, 
                "Esperado nome de variável.");
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, 
                "Esperado dois-pontos após nome de variável.");

            if (!this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.INTEIRO, tiposDeSimbolos.CARACTERE
            )) {
                throw this.erro(this.simbolos[this.atual], 'Tipo de variável não conhecido.');
            }

            this.consumir(tiposDeSimbolos.QUEBRA_LINHA, 
                "Esperado quebra de linha após declaração de variável.");
        }
    }

    validarSegmentoInicio(): void {
        this.consumir(tiposDeSimbolos.INICIO, 
            "Esperada expressão 'inicio' para marcar escopo do programa propriamente dito.");
    }

    estaNoFinal(): boolean {
        return this.atual === this.simbolos.length;
    }

    primario(): Construto {
        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IDENTIFICADOR)
        ) {
            return new Variavel(-1, this.simbolos[this.atual - 1]);
        }

        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NUMERO,
                tiposDeSimbolos.CARACTERE
            )
        ) {
            const simboloAnterior: SimboloInterface = this.simbolos[this.atual - 1];
            return new Literal(
                -1,
                Number(simboloAnterior.linha),
                simboloAnterior.literal
            );
        }
    }

    /**
     * Método que resolve atribuições.
     * @returns Um construto do tipo `Atribuir`, `Conjunto` ou `AtribuicaoSobrescrita`.
     */
    atribuir(): Construto {
        const expressao = this.primario();
        return expressao;
    }

    logicaCasosEscolha(): any {
        let literais = [];
        let simboloAtualCaso: SimboloInterface = this.avancarEDevolverAnterior();
        while (simboloAtualCaso.tipo !== tiposDeSimbolos.QUEBRA_LINHA) {
            literais.push(this.primario());
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA);
            simboloAtualCaso = this.simbolos[this.atual];
        }

        return literais;
    }

    logicaDeclaracaoEscolha(): any {
        const declaracoes = [];
        do {
            declaracoes.push(this.declaracao());
        } while (
            ![tiposDeSimbolos.CASO, tiposDeSimbolos.OUTRO_CASO, tiposDeSimbolos.FIM_ESCOLHA].includes(this.simbolos[this.atual].tipo)
        );
    }

    declaracaoEscolha(): Escolha {
        const simboloAtual = this.avancarEDevolverAnterior();

        /* const identificador = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 
            "Esperado identificador após expressão 'escolha'."); */
        const identificador = this.primario();

        // Blocos de caso
        const caminhos = [];
        let simboloAtualBlocoCaso: SimboloInterface = this.avancarEDevolverAnterior();
        while (![tiposDeSimbolos.OUTRO_CASO, tiposDeSimbolos.FIM_ESCOLHA].includes(simboloAtualBlocoCaso.tipo)) {
            let caminhoCondicoes = this.logicaCasosEscolha();
            this.consumir(
                tiposDeSimbolos.QUEBRA_LINHA,
                "Esperado quebra de linha após último valor de declaração 'caso'."
            );
            const declaracoes = this.logicaDeclaracaoEscolha();

            caminhos.push({
                condicoes: caminhoCondicoes,
                declaracoes,
            });

            simboloAtualBlocoCaso = this.avancarEDevolverAnterior();
        }

        let caminhoPadrao = null;
        if (simboloAtualBlocoCaso.tipo === tiposDeSimbolos.OUTRO_CASO) {
            const declaracoes = [];
            do {
                declaracoes.push(this.declaracao());
            } while (
                !this.verificarTipoSimboloAtual(tiposDeSimbolos.FIM_ESCOLHA)
            );

            caminhoPadrao = {
                declaracoes,
            };
        }

        this.consumir(
            tiposDeSimbolos.FIM_ESCOLHA,
            "Esperado palavra-chave 'fimescolha' para fechamento de declaração 'escolha'."
        );

        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após palavra-chave 'fimescolha'."
        );

        return new Escolha(
            identificador,
            caminhos, 
            caminhoPadrao);
    }

    declaracaoEscreva(): Escreva {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const valor = this.declaracao();

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após fechamento de parênteses pós instrução 'escreva'."
        );

        return new Escreva(
            Number(simboloAtual.linha),
            -1,
            [valor]
        );
    }

    declaracaoLeia(): Leia {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em leia."
        );

        const valor = this.declaracao();

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em leia."
        );

        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após fechamento de parênteses pós instrução 'leia'."
        );

        return null;
    }

    declaracaoPara(): Para {
        const simboloPara: SimboloInterface = this.avancarEDevolverAnterior();

        const variavelIteracao = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável após 'para'."
        );

        this.consumir(
            tiposDeSimbolos.DE,
            "Esperado palavra reservada 'de' após variáve de controle de 'para'."
        );

        const numeroInicio = this.consumir(
            tiposDeSimbolos.NUMERO,
            "Esperado literal ou variável após 'de' em declaração 'para'."
        );

        this.consumir(
            tiposDeSimbolos.ATE,
            "Esperado palavra reservada 'ate' após valor inicial do laço de repetição 'para'."
        );

        const numeroFim = this.consumir(
            tiposDeSimbolos.NUMERO,
            "Esperado literal ou variável após 'de' em declaração 'para'."
        );

        this.consumir(
            tiposDeSimbolos.FACA,
            "Esperado palavra reservada 'faca' após valor final do laço de repetição 'para'."
        );

        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após palavra reservada 'faca' do laço de repetição 'para'."
        );

        let declaracoesBlocoPara = []
        let simboloAtualBlocoPara: SimboloInterface = this.avancarEDevolverAnterior();
        while (simboloAtualBlocoPara.tipo !== tiposDeSimbolos.FIM_PARA) {
            declaracoesBlocoPara.push(this.declaracao());
            simboloAtualBlocoPara = this.avancarEDevolverAnterior();
        }
        
        const corpo = new Bloco(-1, Number(simboloPara.linha) + 1, declaracoesBlocoPara.filter(d => d));

        return new Para(-1, 
            Number(simboloPara.linha), 
            new Atribuir(-1, variavelIteracao, numeroInicio), 
            new Binario(-1, 
                variavelIteracao, 
                new Simbolo(tiposDeSimbolos.SETA_ATRIBUICAO, "", "", Number(simboloPara.linha), -1), 
                numeroFim
            ), 
            1, 
            corpo
        );
    }

    declaracao(): any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCOLHA:
                return this.declaracaoEscolha();
            case tiposDeSimbolos.ESCREVA:
            case tiposDeSimbolos.ESCREVA_LINHA:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.IDENTIFICADOR:
            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.CARACTERE:
                return this.primario();
            case tiposDeSimbolos.LEIA:
                return this.declaracaoLeia();
            case tiposDeSimbolos.PARA:
                return this.declaracaoPara();
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
            case tiposDeSimbolos.PARENTESE_DIREITO:
                throw new Error('Não deveria estar caindo aqui.')
            default:
                // TODO: Remover
                return null;
        }
    }

    /**
     * No VisuAlg, há uma determinada cadência de validação de símbolos. 
     * - O primeiro símbolo é `algoritmo`, seguido por um identificador e
     * uma quebra de linha.
     * - O segundo símbolo é `var`, que pode ser seguido por uma série de 
     * declarações de variáveis e finalizado por uma quebra de linha.
     * - O terceiro símbolo é `inicio`, seguido por uma quebra de linha. 
     * - O último símbolo deve ser `fimalgoritmo`, que também é usado para 
     * definir quando não existem mais construtos a serem adicionados.
     * @param retornoLexador Os símbolos entendidos pelo Lexador.
     * @param hashArquivo Obrigatório por interface mas não usado aqui.
     */
    analisar(retornoLexador: RetornoLexador, hashArquivo?: number): RetornoAvaliadorSintatico {
        this.erros = [];
        this.atual = 0;
        this.ciclos = 0;

        this.simbolos = retornoLexador?.simbolos || [];

        const declaracoes = [];
        this.validarSegmentoAlgoritmo();
        this.validarSegmentoVar();
        this.validarSegmentoInicio();

        while (!this.estaNoFinal() && this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIM_ALGORITMO) {
            declaracoes.push(this.declaracao());
        }

        return { 
            declaracoes: declaracoes.filter(d => d),
            erros: this.erros
        } as RetornoAvaliadorSintatico;
    }
}
