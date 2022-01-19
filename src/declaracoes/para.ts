import { Stmt } from "./stmt";


export class Para extends Stmt {
    inicializador: any;
    condicao: any;
    incrementar: any;
    corpo: any;

    constructor(inicializador: any, condicao: any, incrementar: any, corpo: any) {
        super();
        this.inicializador = inicializador;
        this.condicao = condicao;
        this.incrementar = incrementar;
        this.corpo = corpo;
    }

    aceitar(visitar: any): any {
        return visitar.visitarExpressaoPara(this);
    }
}
