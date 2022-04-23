import { Construto } from "./construto";


export class Chamada implements Construto {
    linha: number;
    hashArquivo?: number;

    entidadeChamada: Construto;
    argumentos: any;
    parentese: any;

    constructor(hashArquivo: number, entidadeChamada: Construto, parentese: any, argumentos: any) {
        this.linha = entidadeChamada.linha;
        this.hashArquivo = hashArquivo;

        this.entidadeChamada = entidadeChamada;
        this.parentese = parentese;
        this.argumentos = argumentos;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeChamada(this);
    }
}
