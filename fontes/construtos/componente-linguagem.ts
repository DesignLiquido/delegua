import { SimboloInterface, VisitanteComumInterface } from "../interfaces";
import { Construto } from "./construto";

/**
 * Construto especial utilizado para especificar o tipo de 
 * estruturas reservadas da linguagem.
 */
export class ComponenteLinguagem implements Construto {
    linha: number;
    hashArquivo: number;
    valor?: any;
    tipo: 'ComponenteLinguagem';

    constructor(hashArquivo: number, simbolo: SimboloInterface) {
        this.hashArquivo = hashArquivo;
        this.linha = simbolo.linha;
        this.valor = simbolo.lexema;
    }

    aceitar(visitante: VisitanteComumInterface): Promise<any> {
        throw new Error("Um componente de linguagem não tem método de visita.");
    }
}