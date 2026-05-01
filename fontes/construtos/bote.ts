import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';
import { VisitantePituguesInterface } from '../interfaces/visitante-pitugues-interface';

export class Bote implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    esquerda: ConstrutoInterface;
    direita: ConstrutoInterface;

    constructor(
        hashArquivo: number,
        linha: number,
        esquerda: ConstrutoInterface,
        direita: ConstrutoInterface
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.esquerda = esquerda;
        this.direita = direita;
    }

    async aceitar(visitante: VisitantePituguesInterface): Promise<any> {
        return await visitante.visitarExpressaoBote(this);
    }

    paraTexto(): string {
        return `<bote />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}