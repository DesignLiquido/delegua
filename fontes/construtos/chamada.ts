import { InterpretadorInterface, ResolvedorInterface } from "../interfaces";
import { Construto } from "./construto";


export class Chamada implements Construto {
    linha: number;
    entidadeChamada: Construto;
    argumentos: any;
    parentese: any;

    constructor(entidadeChamada: Construto, parentese: any, argumentos: any) {
        this.linha = entidadeChamada.linha;
        this.entidadeChamada = entidadeChamada;
        this.parentese = parentese;
        this.argumentos = argumentos;
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface) {
        return visitante.visitarExpressaoDeChamada(this);
    }
}
