export class Declaracao {
    linha: number;
    hashArquivo: number;
    aceitar(visitante: any): any { }

    constructor(linha: number, hashArquivo: number) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
    }
}
