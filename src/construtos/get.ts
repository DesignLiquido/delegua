import { Construto } from "./construto";


export class Get implements Construto {
    linha: number;
    objeto: any;
    nome: any;

    constructor(linha: number, objeto: any, nome: any) {
        this.linha = linha;
        this.objeto = objeto;
        this.nome = nome;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoObter(this);
    }
}
