import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';
import { Variavel } from './variavel';
import { VisitantePituguesInterface } from '../interfaces/visitante-pitugues-interface';

export class Morsa implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    variavel: Variavel;
    valor: ConstrutoInterface;

    constructor(hashArquivo: number, variavel: Variavel, valor: ConstrutoInterface) {
        this.linha = Number(variavel.linha);
        this.hashArquivo = hashArquivo;
        this.variavel = variavel;
        this.valor = valor;
    }

    async aceitar(visitante: VisitantePituguesInterface): Promise<any> {
        return await visitante.visitarExpressaoMorsa(this);
    }

    paraTexto(): string {
        return `<morsa />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}