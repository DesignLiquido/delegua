import { Stmt } from "./stmt";


export class Var extends Stmt {
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
