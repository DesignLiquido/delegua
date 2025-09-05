import { Construto } from '../construto';
import { Tupla } from '../tupla';

export class Dupla extends Tupla {
    primeiro: Construto;
    segundo: Construto;

    constructor(primeiro: Construto, segundo: Construto) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
    }

    paraTexto(): string {
        return `<dupla primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            ` />`;
    }
}
