import { VisitanteComumInterface } from "../interfaces";
import { Construto } from "./construto";

/**
 * Ajuda pode ser declaração ou construto. Para construto, o comportamento é
 * um pouco diferente do de ajuda como declaração. Por exemplo, se usado com
 * operadores, sempre resolve como um `texto`.
 */
export class AjudaComoConstruto implements Construto {
    linha: number;
    hashArquivo: number;
    valor?: Construto;
    funcao: boolean;

    constructor(hashArquivo: number, linha: number, elemento: Construto, funcao: boolean = true) {
        this.hashArquivo = hashArquivo;
        this.linha = linha;
        this.valor = elemento;
        this.funcao = funcao;
    }

    aceitar(visitante: VisitanteComumInterface): Promise<any> {
        throw new Error("Method not implemented.");
    }

    paraTexto(): string {
        throw new Error("Method not implemented.");
    }

    paraTextoSaida(): string {
        throw new Error("Method not implemented.");
    }    
}