import { Construto } from "./construto";


export class Conjunto implements Construto {
    linha: number;
    objeto: any;
    nome: any;
    valor: any;

    constructor(linha: number, objeto: any, nome: any, valor: any) {
        this.linha = linha;
        this.objeto = objeto;
        this.nome = nome;
        this.valor = valor;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDefinir(this);
    }
}
