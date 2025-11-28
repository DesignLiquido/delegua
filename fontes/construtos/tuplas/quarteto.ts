import { Construto } from '../construto';
import { Tupla } from '../tupla';

export class Quarteto extends Tupla {
    primeiro: Construto;
    segundo: Construto;
    terceiro: Construto;
    quarto: Construto;

    constructor(primeiro: Construto, segundo: Construto, terceiro: Construto, quarto: Construto) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
        this.terceiro = terceiro;
        this.quarto = quarto;
    }

    paraTexto(): string {
        return (
            `<quarteto primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            `terceiro=${this.terceiro.paraTexto()} ` +
            `quarto=${this.quarto.paraTexto()} ` +
            ` />`
        );
    }

    paraTextoSaida(): string {
        return `[(${this.primeiro.paraTextoSaida()}, ${this.segundo.paraTextoSaida()}, ${this.terceiro.paraTextoSaida()}, ${this.quarto.paraTextoSaida()})]`;
    }
}
