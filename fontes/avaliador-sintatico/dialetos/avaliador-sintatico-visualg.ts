import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';

import tiposDeSimbolos from '../../tipos-de-simbolos/visualg' 
import { Escreva, Para } from '../../declaracoes';
import { Construto, Literal } from '../../construtos';
import { SimboloInterface } from '../../interfaces';

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
    }

    validarSegmentoInicio(): void {
        this.consumir(tiposDeSimbolos.INICIO, 
            "Esperada expressão 'inicio' para marcar escopo do programa propriamente dito.");
    }

    estaNoFinal(): boolean {
        return this.atual === this.simbolos.length;
    }

    atribuir(): Construto {
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

    declaracaoEscreva(): Escreva {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const valor = this.expressao();

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        return new Escreva(
            Number(simboloAtual.linha),
            -1,
            [valor]
        );
    }

    declaracaoPara(): Para {
        const simboloPara: SimboloInterface = this.simbolos[this.atual - 1];

        this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável após 'para'."
        );

        this.consumir(
            tiposDeSimbolos.DE,
            "Esperado palavra reservada 'de' após variáve de controle de 'para'."
        );

        return null;
        // TODO: Como fazer inicializador e condição para este caso?
        // return new Para(this.hashArquivo, Number(simboloPara.linha), inicializador, condicao, incrementar, corpo);
    }

    declaracao(): any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCREVA:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.PARA:
                return this.declaracaoPara();
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
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

        while (!this.estaNoFinal() && this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIMALGORITMO) {
            declaracoes.push(this.declaracao());
        }

        return { 
            declaracoes: declaracoes.filter(d => d),
            erros: this.erros
        } as RetornoAvaliadorSintatico;
    }
}
