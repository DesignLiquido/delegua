import { Declaracao } from "./declaracao";


export class Para extends Declaracao {
    inicializador: any;
    condicao: any;
    incrementar: any;
    corpo: any;

    constructor(linha: number, inicializador: any, condicao: any, incrementar: any, corpo: any) {
        super(linha, 0);
        this.inicializador = inicializador;
        this.condicao = condicao;
        this.incrementar = incrementar;
        this.corpo = corpo;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoPara(this);
    }
}
