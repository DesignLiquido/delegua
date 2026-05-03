import { ConstrutoInterface } from '../../interfaces/construtos/construto-interface';
import { Tupla } from '../tupla';

export class Dupla extends Tupla {
    primeiro: ConstrutoInterface;
    segundo: ConstrutoInterface;

    constructor(primeiro: ConstrutoInterface, segundo: ConstrutoInterface) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
    }

    paraTexto(): string {
        return (
            `<dupla primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            ` />`
        );
    }

    paraTextoSaida(): string {
        return `(${this.primeiro.paraTextoSaida()}, ${this.segundo.paraTextoSaida()})`;
    }
}
