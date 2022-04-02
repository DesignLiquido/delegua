import { Construto } from "./construto";


export class Conjunto implements Construto {
    objeto: any;
    nome: any;
    valor: any;

    constructor(objeto: any, nome: any, valor: any) {
        this.objeto = objeto;
        this.nome = nome;
        this.valor = valor;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDefinir(this);
    }
}
