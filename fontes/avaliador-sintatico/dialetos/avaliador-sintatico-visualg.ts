import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';

import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';

export class AvaliadorSintaticoVisuAlg extends AvaliadorSintaticoBase {
    
    validarSegmentoAlgoritmo() {

    }

    validarSegmentoVar() {

    }

    validarSegmentoInicio() {

    }

    validarSegmentoFimAlgoritmo() {

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
