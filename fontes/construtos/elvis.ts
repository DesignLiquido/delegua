import { VisitanteDeleguaInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class Elvis implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    esquerda: ConstrutoInterface;
    direita: ConstrutoInterface;

    constructor(hashArquivo: number, esquerda: ConstrutoInterface, direita: ConstrutoInterface) {
        this.linha = esquerda.linha;
        this.hashArquivo = hashArquivo;

        this.esquerda = esquerda;
        this.direita = direita;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoElvis(this);
    }

    paraTexto(): string {
        return (
            `<elvis esquerda=${this.esquerda.paraTexto()} ` +
            `direita=${this.direita.paraTexto()} ` +
            `/>`
        );
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
