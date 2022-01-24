import { Expr } from "./expr";


export class Conjunto implements Expr {
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
