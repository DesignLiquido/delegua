import { Construto } from '../construto';
import { Tupla } from '../tupla';

export class Trio extends Tupla {
    primeiro: Construto;
    segundo: Construto;
    terceiro: Construto;

    constructor(
        primeiro: Construto,
        segundo: Construto,
        terceiro: Construto
    ) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
        this.terceiro = terceiro;
    }

    paraTexto(): string {
        return `<trio primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            `terceiro=${this.terceiro.paraTexto()} ` +
            ` />`;
    }
}
