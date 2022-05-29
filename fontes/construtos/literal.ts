import { InterpretadorInterface, ResolvedorInterface } from "../interfaces";
import { Construto } from "./construto";


export class Literal implements Construto {
    linha: number;
    valor: any;

    constructor(linha: number, valor: any) {
        this.linha = linha;
        this.valor = valor;
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface) {
        return visitante.visitarExpressaoLiteral(this);
    }
}
