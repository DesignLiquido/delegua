import { ConstrutoInterface } from '../../interfaces/construtos/construto-interface';
import { Tupla } from '../tupla';

export class Quinteto extends Tupla {
    primeiro: ConstrutoInterface;
    segundo: ConstrutoInterface;
    terceiro: ConstrutoInterface;
    quarto: ConstrutoInterface;
    quinto: ConstrutoInterface;

    constructor(
        primeiro: ConstrutoInterface,
        segundo: ConstrutoInterface,
        terceiro: ConstrutoInterface,
        quarto: ConstrutoInterface,
        quinto: ConstrutoInterface
    ) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
        this.terceiro = terceiro;
        this.quarto = quarto;
        this.quinto = quinto;
    }

    paraTexto(): string {
        return (
            `<quinteto primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            `terceiro=${this.terceiro.paraTexto()} ` +
            `quarto=${this.quarto.paraTexto()} ` +
            `quinto=${this.quinto.paraTexto()} ` +
            ` />`
        );
    }

    paraTextoSaida(): string {
        return `(${this.primeiro.paraTextoSaida()}, ${this.segundo.paraTextoSaida()}, , ${this.terceiro.paraTextoSaida()}, ${this.quarto.paraTextoSaida()}, ${this.quinto.paraTextoSaida()})`;
    }
}
