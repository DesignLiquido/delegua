import { Construto } from "./construto";


export class Chamada implements Construto {
    entidadeChamada: any;
    argumentos: any;
    parentese: any;

    constructor(entidadeChamada: any, parentese: any, argumentos: any) {
        this.entidadeChamada = entidadeChamada;
        this.parentese = parentese;
        this.argumentos = argumentos;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeChamada(this);
    }
}
