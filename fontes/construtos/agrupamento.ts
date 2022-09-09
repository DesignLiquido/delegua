import { InterpretadorInterface } from "../interfaces";
import { Construto } from "./construto";

/**
 * Um agrupamento é essencialmente uma expressão qualquer dentro de parênteses.
 * Usado para resolver precedência de operadores. Por exemplo: 
 * `(2 + 2) * 5`, `(2 + 2)` é um agrupamento cuja expressão é `2 + 2`.
 */
export class Agrupamento implements Construto {
    linha: number;
    hashArquivo?: number;

    expressao: Construto;

    constructor(hashArquivo: number, linha: number, expressao: Construto) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        
        this.expressao = expressao;
    }

    aceitar(visitante: InterpretadorInterface) {
        return visitante.visitarExpressaoAgrupamento(this);
    }
}
