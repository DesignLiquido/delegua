import { Bloco } from '../declaracoes';
import { VisitanteDeleguaInterface } from '../interfaces';
import { EnquantoInterface } from '../interfaces/delegua';
import { Construto } from './construto';

export class EnquantoComoConstruto implements Construto, EnquantoInterface {
    linha: number;
    hashArquivo: number;
    condicao: Construto;
    corpo: Bloco;

    constructor(condicao: Construto, corpo: Bloco) {
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
}
