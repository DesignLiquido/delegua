import { Construto } from "./construto";
import { Variavel } from "./variavel";
import { VisitanteComumInterface } from "../interfaces";

export class ExpressaoMorsa implements Construto {
    linha: number;
    hashArquivo: number;
    variavel: Variavel;
    valor: Construto;

    constructor(hashArquivo: number, variavel: Variavel, valor: Construto) {
        this.linha = Number(variavel.linha);
        this.hashArquivo = hashArquivo;
        this.variavel = variavel;
        this.valor = valor;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoMorsa(this);
    }

    paraTexto(): string {
        return `<operador-morsa />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}