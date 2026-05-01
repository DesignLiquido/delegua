import { Bloco } from '../declaracoes';
import { VisitanteDeleguaInterface } from '../interfaces';
import { FazerInterface } from '../interfaces/delegua';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class FazerComoConstruto implements ConstrutoInterface, FazerInterface {
    linha: number;
    hashArquivo: number;
    caminhoFazer: Bloco;
    condicaoEnquanto: ConstrutoInterface;

    constructor(
        hashArquivo: number,
        linha: number,
        caminhoFazer: Bloco,
        condicaoEnquanto: ConstrutoInterface
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

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
