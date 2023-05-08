import { VisitanteComumInterface } from '../interfaces'

export class Declaracao {
    linha: number;
    hashArquivo: number;
    assinaturaMetodo: string;

    constructor(linha: number, hashArquivo: number) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        // TODO: Por ora, todos os testes são feitos num script só.
        // Quando iniciarem os testes em múltiplos arquivos e módulos,
        // pensar numa forma melhor de preencher isso.
        this.assinaturaMetodo = '<principal>';
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.reject(new Error('Este método não deveria ser chamado.'));
    }
}
