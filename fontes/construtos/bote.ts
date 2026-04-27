import { Construto } from './construto';
import { VisitantePituguesInterface } from '../interfaces/visitante-pitugues-interface';

export class Bote implements Construto {
    linha: number;
    hashArquivo: number;
    esquerda: Construto;
    direita: Construto;

    constructor(
        hashArquivo: number,
        linha: number,
        esquerda: Construto,
        direita: Construto
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