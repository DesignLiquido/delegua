import { ConstrutoInterface } from '../../interfaces/construtos/construto-interface';
import { Tupla } from '../tupla';

export class Septeto extends Tupla {
    primeiro: ConstrutoInterface;
    segundo: ConstrutoInterface;
    terceiro: ConstrutoInterface;
    quarto: ConstrutoInterface;
    quinto: ConstrutoInterface;
    sexto: ConstrutoInterface;
    setimo: ConstrutoInterface;

    constructor(
        primeiro: ConstrutoInterface,
        segundo: ConstrutoInterface,
        terceiro: ConstrutoInterface,
        quarto: ConstrutoInterface,
        quinto: ConstrutoInterface,
        sexto: ConstrutoInterface,
        setimo: ConstrutoInterface
    ) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
        this.terceiro = terceiro;
        this.quarto = quarto;
        this.quinto = quinto;
        this.sexto = sexto;
        this.setimo = setimo;
    }

    get sétimo() {
        return this.setimo;
    }

    set sétimo(valor: any) {
        this.setimo = valor;
    }

    paraTexto(): string {
        return (
            `<septeto primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            `terceiro=${this.terceiro.paraTexto()} ` +
            `quarto=${this.quarto.paraTexto()} ` +
            `quinto=${this.quinto.paraTexto()} ` +
            `sexto=${this.sexto.paraTexto()} ` +
            `sétimo=${this.setimo.paraTexto()} ` +
            ` />`
        );
    }

    paraTextoSaida(): string {
        return `(${this.primeiro.paraTextoSaida()}, ${this.segundo.paraTextoSaida()}, ${this.terceiro.paraTextoSaida()}, ${this.quarto.paraTextoSaida()}, ${this.quinto.paraTextoSaida()}, ${this.sexto.paraTextoSaida()}, ${this.setimo.paraTextoSaida()})`;
    }
}
