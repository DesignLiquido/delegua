import { InterpretadorInterface, ResolvedorInterface } from "../interfaces";
import { Construto } from "./construto";


export class Literal implements Construto {
    linha: number;
    hashArquivo?: number;

    valor: any;

    constructor(hashArquivo: number, linha: number, valor: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        
        this.valor = valor;
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface) {
        return visitante.visitarExpressaoLiteral(this);
    }
}
