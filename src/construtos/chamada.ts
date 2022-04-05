import { Construto } from "./construto";


export class Chamada implements Construto {
    linha: number;
    entidadeChamada: any;
    argumentos: any;
    parentese: any;

    constructor(linha: number, entidadeChamada: any, parentese: any, argumentos: any) {
        this.linha = linha;
        this.entidadeChamada = entidadeChamada;
        this.parentese = parentese;
        this.argumentos = argumentos;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeChamada(this);
    }
}
