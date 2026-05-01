import { Tupla } from './tupla';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';
import { VisitanteComumInterface } from '../interfaces';

export class TuplaN extends Tupla {
    elementos: ConstrutoInterface[];

    constructor(hashArquivo: number, linha: number, elementos: ConstrutoInterface[]) {
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
