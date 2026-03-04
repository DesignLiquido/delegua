import { Tupla } from './tupla';
import { Construto } from './construto';
import { VisitanteComumInterface } from '../interfaces';

export class TuplaN extends Tupla {
    elementos: Construto[];

    constructor(hashArquivo: number, linha: number, elementos: Construto[]) {
        super();
        this.hashArquivo = hashArquivo;
        this.linha = linha;
        this.elementos = elementos;
        this.tipo = 'tupla';
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoTuplaN(this);
    }

    paraTexto(): string {
        const elementosTexto = this.elementos.map((elemento) => elemento.paraTexto()).join(', ');
        return `(${elementosTexto})`;
    }

    paraTextoSaida(): string {
        const elementosTexto = this.elementos
            .map((elemento) => elemento.paraTextoSaida())
            .join(', ');
        return `(${elementosTexto})`;
    }
}
