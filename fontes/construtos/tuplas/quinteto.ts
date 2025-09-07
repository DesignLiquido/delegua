import { Construto } from '../construto';
import { Tupla } from '../tupla';

export class Quinteto extends Tupla {
    primeiro: Construto;
    segundo: Construto;
    terceiro: Construto;
    quarto: Construto;
    quinto: Construto;

    constructor(
        primeiro: Construto,
        segundo: Construto,
        terceiro: Construto,
        quarto: Construto,
        quinto: Construto
    ) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
        this.terceiro = terceiro;
        this.quarto = quarto;
        this.quinto = quinto;
    }

    paraTexto(): string {
        return `<quinteto primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            `terceiro=${this.terceiro.paraTexto()} ` +
            `quarto=${this.quarto.paraTexto()} ` +
            `quinto=${this.quinto.paraTexto()} ` +
            ` />`;
    }
}
