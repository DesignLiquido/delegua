import { ConstrutoInterface } from '../../interfaces/construtos/construto-interface';
import { Tupla } from '../tupla';

export class Sexteto extends Tupla {
    primeiro: ConstrutoInterface;
    segundo: ConstrutoInterface;
    terceiro: ConstrutoInterface;
    quarto: ConstrutoInterface;
    quinto: ConstrutoInterface;
    sexto: ConstrutoInterface;

    constructor(
        primeiro: ConstrutoInterface,
        segundo: ConstrutoInterface,
        terceiro: ConstrutoInterface,
        quarto: ConstrutoInterface,
        quinto: ConstrutoInterface,
        sexto: ConstrutoInterface
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
        return (
            `<sexteto primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            `terceiro=${this.terceiro.paraTexto()} ` +
            `quarto=${this.quarto.paraTexto()} ` +
            `quinto=${this.quinto.paraTexto()} ` +
            `sexto=${this.sexto.paraTexto()} ` +
            ` />`
        );
    }

    paraTextoSaida(): string {
        return `(${this.primeiro.paraTextoSaida()}, ${this.segundo.paraTextoSaida()}, ${this.terceiro.paraTextoSaida()}, ${this.quarto.paraTextoSaida()}, ${this.quinto.paraTextoSaida()}, ${this.sexto.paraTextoSaida()})`;
    }
}
