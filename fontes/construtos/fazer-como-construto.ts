import { Bloco } from '../declaracoes';
import { VisitanteDeleguaInterface } from '../interfaces';
import { FazerInterface } from '../interfaces/delegua';
import { Construto } from './construto';

export class FazerComoConstruto implements Construto, FazerInterface {
    linha: number;
    hashArquivo: number;
    caminhoFazer: Bloco;
    condicaoEnquanto: Construto;

    constructor(
        hashArquivo: number,
        linha: number,
        caminhoFazer: Bloco,
        condicaoEnquanto: Construto
    ) {
        this.hashArquivo = hashArquivo;
        this.linha = linha;
        this.caminhoFazer = caminhoFazer;
        this.condicaoEnquanto = condicaoEnquanto;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoFazer(this);
    }

    paraTexto(): string {
        return `<fazer-como-construto />`;
    }
}
