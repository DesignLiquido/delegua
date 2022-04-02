import { Construto } from "./construto";


export class Get implements Construto {
    objeto: any;
    nome: any;

    constructor(objeto: any, nome: any) {
        this.objeto = objeto;
        this.nome = nome;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoObter(this);
    }
}
