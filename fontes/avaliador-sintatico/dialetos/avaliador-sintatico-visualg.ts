import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';

import tiposDeSimbolos from '../../tipos-de-simbolos/visualg' 

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

    validarSegmentoFimAlgoritmo(): void {
        const simboloAnterior = this.simbolos[this.atual - 1];
        if (simboloAnterior.tipo !== tiposDeSimbolos.FIMALGORITMO) {
            throw this.erro(
                simboloAnterior, 
                "Esperada expressão 'fimalgoritmo' para finalizar escopo do programa."
            );
        }
    }

    estaNoFinal(): boolean {
        return this.atual === this.simbolos.length;
    }

    declaracao(): any {
        while (!this.estaNoFinal()) {
            this.avancarEDevolverAnterior();
        }
    }

    /**
     * No VisuAlg, há uma determinada cadência de validação de símbolos. 
     * - O primeiro símbolo é `algoritmo`, seguido por um identificador e
     * uma quebra de linha.
     * - O segundo símbolo é `var`, que pode ser seguido por uma série de 
     * declarações de variáveis e finalizado por uma quebra de linha.
     * - O terceiro símbolo é `inicio`, seguido por uma quebra de linha. 
     * - O último símbolo deve ser `fimalgoritmo`.
     * @param retornoLexador 
     * @param hashArquivo 
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

        while (!this.estaNoFinal()) {
            declaracoes.push(this.declaracao());
        }
        
        this.validarSegmentoFimAlgoritmo();

        return { 
            declaracoes: declaracoes,
            erros: this.erros
        } as RetornoAvaliadorSintatico;
    }
}
