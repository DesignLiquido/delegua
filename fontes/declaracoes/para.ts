import { InterpretadorInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Para extends Declaracao {
    inicializador: any;
    condicao: any;
    incrementar: any;
    corpo: any;
    inicializada: boolean;

    constructor(hashArquivo: number, linha: number, inicializador: any, condicao: any, incrementar: any, corpo: any) {
        super(linha, hashArquivo);
        this.inicializador = inicializador;
        this.condicao = condicao;
        this.incrementar = incrementar;
        this.corpo = corpo;
        this.inicializada = false;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarDeclaracaoPara(this);
    }
}
