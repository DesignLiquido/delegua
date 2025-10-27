import { SimboloInterface, VisitanteDeleguaInterface } from "../interfaces";
import { Construto } from "./construto";

export class SeTernario<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;
    
    condicao: Construto;
    expressaoSe: Construto;
    operador: SimboloInterface<TTipoSimbolo>;
    expressaoSenao: Construto;
    tipo: string = 'qualquer';

    constructor(
        hashArquivo: number,
        condicao: Construto,
        expressaoSe: Construto,
        operador: SimboloInterface<TTipoSimbolo>,
        expressaoSenao: Construto
    ) {
        this.linha = condicao.linha;
        this.hashArquivo = hashArquivo;

        this.condicao = condicao;
        this.expressaoSe = expressaoSe;
        this.expressaoSenao = expressaoSenao;
    }

    aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        throw new Error("Method not implemented.");
    }

    paraTexto(): string {
        throw new Error("Method not implemented.");
    }
}