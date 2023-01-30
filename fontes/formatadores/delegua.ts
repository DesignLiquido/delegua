import * as sistemaOperacional from 'os';

import { SimboloInterface } from "../interfaces";

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

/**
 * O formatador de código Delégua.
 * Normalmente usado por IDEs, mas pode ser usado por linha de comando ou programaticamente.
 */
export class FormatadorDelegua {
    indentacao: number;
    blocoAberto: boolean;

    constructor() {
        this.indentacao = 0;
        this.blocoAberto = true;
    }

    formatar(simbolos: SimboloInterface[], tamanhoIndentacao: number = 4): string {
        let resultado = "";
        let deveQuebrarLinha: boolean = false;

        for (let simbolo of simbolos) {
            switch (simbolo.tipo) {
                case tiposDeSimbolos.CHAVE_ESQUERDA:
                    this.indentacao += tamanhoIndentacao;
                    resultado += '{' + sistemaOperacional.EOL;
                    resultado += ' '.repeat(this.indentacao);
                    break;
                case tiposDeSimbolos.CHAVE_DIREITA:
                    this.indentacao -= tamanhoIndentacao;
                    resultado += sistemaOperacional.EOL + ' '.repeat(this.indentacao) + '}' + sistemaOperacional.EOL;
                    break;
                case tiposDeSimbolos.ESCREVA:
                    deveQuebrarLinha = true;
                case tiposDeSimbolos.ENQUANTO:
                case tiposDeSimbolos.FAZER:
                case tiposDeSimbolos.FINALMENTE:
                case tiposDeSimbolos.PARA:
                case tiposDeSimbolos.PEGUE:
                case tiposDeSimbolos.RETORNA:
                case tiposDeSimbolos.SE:
                case tiposDeSimbolos.SENAO:
                case tiposDeSimbolos.SENÃO:
                case tiposDeSimbolos.TENTE:
                case tiposDeSimbolos.VARIAVEL:
                    resultado += sistemaOperacional.EOL + ' '.repeat(this.indentacao) + simbolo.lexema + ' ';
                    break;
                case tiposDeSimbolos.PARENTESE_ESQUERDO:
                    resultado += '(';
                    break;
                case tiposDeSimbolos.PARENTESE_DIREITO:
                    resultado = resultado.trimEnd();
                    resultado += ')';
                    if (deveQuebrarLinha) {
                        deveQuebrarLinha = false;
                        resultado += sistemaOperacional.EOL;
                    } else {
                        resultado += ' ';
                    }

                    break;
                case tiposDeSimbolos.FUNCAO:
                case tiposDeSimbolos.FUNÇÃO:
                case tiposDeSimbolos.IDENTIFICADOR:
                case tiposDeSimbolos.IGUAL:
                case tiposDeSimbolos.IGUAL_IGUAL:
                
                    resultado += simbolo.lexema + ' ';
                    break;
                default:
                    resultado += simbolo.lexema;
                    break;
            }
        }

        return resultado;
    }
}
