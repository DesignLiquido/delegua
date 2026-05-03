import { VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class AcessoPropriedade implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    objeto: ConstrutoInterface;
    nomePropriedade: string;
    tipoRetornoPropriedade: string;

    constructor(
        hashArquivo: number,
        objeto: ConstrutoInterface,
        nomePropriedade: string,
        tipoRetornoPropriedade: string = 'qualquer'
    ) {
        this.linha = objeto.linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.nomePropriedade = nomePropriedade;
        this.tipoRetornoPropriedade = tipoRetornoPropriedade;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoPropriedade(this);
    }

    paraTexto(): string {
        return `<acesso-propriedade objeto=${this.objeto.paraTexto()} propriedade=${this.nomePropriedade} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
