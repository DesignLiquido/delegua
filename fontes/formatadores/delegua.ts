import { SimboloInterface } from '../interfaces';

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

    /**
     * Devolve código formatado de acordo com os símbolos encontrados.
     * @param simbolos Um vetor de símbolos.
     * @param quebraLinha O símbolo de quebra de linha. Normalmente `\r\n` para Windows e `\n` para outros sistemas operacionais.
     * @param tamanhoIndentacao O tamanho de cada bloco de indentação (por padrão, 4)
     * @returns Código Delégua formatado.
     */
    formatar(simbolos: SimboloInterface[], quebraLinha: string, tamanhoIndentacao: number = 4): string {
        let resultado = '';
        let deveQuebrarLinha: boolean = false;

        for (let simbolo of simbolos) {
            switch (simbolo.tipo) {
                case tiposDeSimbolos.CHAVE_ESQUERDA:
                    this.indentacao += tamanhoIndentacao;
                    resultado += '{' + quebraLinha;
                    resultado += ' '.repeat(this.indentacao);
                    break;
                case tiposDeSimbolos.CHAVE_DIREITA:
                    this.indentacao -= tamanhoIndentacao;
                    resultado += quebraLinha + ' '.repeat(this.indentacao) + '}' + quebraLinha;
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
                    resultado += quebraLinha + ' '.repeat(this.indentacao) + simbolo.lexema + ' ';
                    break;
                case tiposDeSimbolos.PARENTESE_ESQUERDO:
                    resultado += '(';
                    break;
                case tiposDeSimbolos.PARENTESE_DIREITO:
                    resultado = resultado.trimEnd();
                    resultado += ')';
                    if (deveQuebrarLinha) {
                        deveQuebrarLinha = false;
                        resultado += quebraLinha;
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
