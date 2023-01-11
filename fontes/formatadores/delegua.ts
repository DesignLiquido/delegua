import * as sistemaOperacional from 'os';

import { SimboloInterface } from "../interfaces";

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

export class FormatadorDelegua {
    indentacao: number;
    blocoAberto: boolean;

    constructor() {
        this.indentacao = 0;
        this.blocoAberto = true;
    }

    formatar(simbolos: SimboloInterface[]): string {
        let resultado = "";

        for (let simbolo of simbolos) {
            switch (simbolo.tipo) {
                case tiposDeSimbolos.CHAVE_ESQUERDA:
                    this.indentacao += 4;
                    resultado += '{' + sistemaOperacional.EOL;
                    resultado += ' '.repeat(this.indentacao);
                    break;
                case tiposDeSimbolos.CHAVE_DIREITA:
                    this.indentacao -= 4;
                    resultado += sistemaOperacional.EOL + '}' + sistemaOperacional.EOL;
                    resultado += ' '.repeat(this.indentacao);
                    break;
                case tiposDeSimbolos.PARENTESE_ESQUERDO:
                    resultado += '(';
                    break;
                case tiposDeSimbolos.PARENTESE_DIREITO:
                    resultado += ')';
                    break;
                case tiposDeSimbolos.ENQUANTO:
                case tiposDeSimbolos.FAZER:
                case tiposDeSimbolos.FINALMENTE:
                case tiposDeSimbolos.PARA:
                case tiposDeSimbolos.PEGUE:
                case tiposDeSimbolos.SE:
                case tiposDeSimbolos.SENAO:
                case tiposDeSimbolos.SENÃO:
                case tiposDeSimbolos.TENTE:
                case tiposDeSimbolos.VARIAVEL:
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
