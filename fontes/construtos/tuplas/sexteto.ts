import { Construto } from '../construto';
import { Tupla } from '../tupla';

export class Sexteto extends Tupla {
    primeiro: Construto;
    segundo: Construto;
    terceiro: Construto;
    quarto: Construto;
    quinto: Construto;
    sexto: Construto;

    constructor(
        primeiro: Construto,
        segundo: Construto,
        terceiro: Construto,
        quarto: Construto,
        quinto: Construto,
        sexto: Construto
    ) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
        this.terceiro = terceiro;
        this.quarto = quarto;
        this.quinto = quinto;
        this.sexto = sexto;
    }

    paraTexto(): string {
        return `<sexteto primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            `terceiro=${this.terceiro.paraTexto()} ` +
            `quarto=${this.quarto.paraTexto()} ` +
            `quinto=${this.quinto.paraTexto()} ` +
            `sexto=${this.sexto.paraTexto()} ` +
            ` />`;
    }
}
