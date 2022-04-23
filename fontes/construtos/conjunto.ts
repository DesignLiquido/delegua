import { Construto } from "./construto";


export class Conjunto implements Construto {
    linha: number;
    hashArquivo?: number;

    objeto: any;
    nome: any;
    valor: any;

    constructor(hashArquivo: number, linha: number, objeto: any, nome: any, valor: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        
        this.objeto = objeto;
        this.nome = nome;
        this.valor = valor;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDefinir(this);
    }
}
