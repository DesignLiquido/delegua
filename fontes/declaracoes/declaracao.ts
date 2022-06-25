export class Declaracao {
    linha: number;
    hashArquivo: number;

    constructor(linha: number, hashArquivo: number) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
    }

    aceitar(visitante: any): any {
        throw new Error('Este método não deveria ser chamado.');
    }
}
