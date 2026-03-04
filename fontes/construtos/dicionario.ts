import { VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export class Dicionario implements Construto {
    linha: number;
    hashArquivo: number;

    chaves: any[];
    valores: Construto[];
    tipo: 'dicionário';
    esSpread: boolean[];

    constructor(
        hashArquivo: number,
        linha: number,
        chaves: any[],
        valores: Construto[],
        esSpread?: boolean[]
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.chaves = chaves;
        this.valores = valores;
        this.tipo = 'dicionário';
        this.esSpread = esSpread || chaves.map(() => false);
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoDicionario(this);
    }

    paraTexto(): string {
        return `<dicionário chaves=${this.chaves} valores=${this.valores} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
