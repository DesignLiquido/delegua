import { InterpretadorInterface, SimboloInterface } from "../interfaces";
import { Construto } from "./construto";


export class Atribuir implements Construto {
    linha: number;
    hashArquivo?: number;

    simbolo: SimboloInterface;
    valor: any;

    constructor(hashArquivo: number, simbolo: SimboloInterface, valor: any) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;

        this.simbolo = simbolo;
        this.valor = valor;
    }

    aceitar(visitante: InterpretadorInterface) {
        return visitante.visitarExpressaoDeAtribuicao(this);
    }
}
