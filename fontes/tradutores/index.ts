import { Declaracao } from "../declaracoes";
import { TradutorInterface } from "../interfaces";

import dicionarioDeleguaJavascript from "./dicionarios/dicionario-delegua-javascript";

export class TradutorJavaScript implements TradutorInterface {

    traduzir(declaracoes: Declaracao[]) {
        let resultado = "";

        for (const declaracao of declaracoes) {
            resultado += `${dicionarioDeleguaJavascript[declaracao.constructor.name](declaracao)} \n`
            /* for (const modificador of declaracao.modificadores) {
                resultado += this.traduzirModificador(modificador);
            } */
            resultado += `}\n`
        }

        return resultado;
    }
}
