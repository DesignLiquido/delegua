import { Declaracao } from "./declaracao";


export class Var extends Declaracao {
    nome: any;
    inicializador: any;

    constructor(nome: any, inicializador: any) {
        super();
        this.nome = nome;
        this.inicializador = inicializador;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoVar(this);
    }
}
