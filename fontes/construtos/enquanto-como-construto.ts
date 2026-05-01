import { Bloco } from '../declaracoes';
import { VisitanteDeleguaInterface } from '../interfaces';
import { EnquantoInterface } from '../interfaces/delegua';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class EnquantoComoConstruto implements ConstrutoInterface, EnquantoInterface {
    linha: number;
    hashArquivo: number;
    condicao: ConstrutoInterface;
    corpo: Bloco;

    constructor(condicao: ConstrutoInterface, corpo: Bloco) {
        this.hashArquivo = condicao.hashArquivo;
        this.linha = condicao.linha;
        this.condicao = condicao;
        this.corpo = corpo;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoEnquanto(this);
    }

    paraTexto(): string {
        return `<enquanto-como-construto />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
