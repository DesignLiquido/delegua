import { ConstrutoInterface } from '../../interfaces/construtos/construto-interface';
import { Tupla } from '../tupla';

export class Noneto extends Tupla {
    primeiro: ConstrutoInterface;
    segundo: ConstrutoInterface;
    terceiro: ConstrutoInterface;
    quarto: ConstrutoInterface;
    quinto: ConstrutoInterface;
    sexto: ConstrutoInterface;
    setimo: ConstrutoInterface;
    oitavo: ConstrutoInterface;
    nono: ConstrutoInterface;

    constructor(
        primeiro: ConstrutoInterface,
        segundo: ConstrutoInterface,
        terceiro: ConstrutoInterface,
        quarto: ConstrutoInterface,
        quinto: ConstrutoInterface,
        sexto: ConstrutoInterface,
        setimo: ConstrutoInterface,
        oitavo: ConstrutoInterface,
        nono: ConstrutoInterface
    ) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
        this.terceiro = terceiro;
        this.quarto = quarto;
        this.quinto = quinto;
        this.sexto = sexto;
        this.setimo = setimo;
        this.oitavo = oitavo;
        this.nono = nono;
    }

    get sétimo() {
        return this.setimo;
    }

    set sétimo(valor: any) {
        this.setimo = valor;
    }

    paraTexto(): string {
        return (
            `<noneto primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            `terceiro=${this.terceiro.paraTexto()} ` +
            `quarto=${this.quarto.paraTexto()} ` +
            `quinto=${this.quinto.paraTexto()} ` +
            `sexto=${this.sexto.paraTexto()} ` +
            `sétimo=${this.setimo.paraTexto()} ` +
            `oitavo=${this.oitavo.paraTexto()} ` +
            `nono=${this.nono.paraTexto()} ` +
            ` />`
        );
    }

    paraTextoSaida(): string {
        return `(${this.primeiro.paraTextoSaida()}, ${this.segundo.paraTextoSaida()}, ${this.terceiro.paraTextoSaida()}, ${this.quarto.paraTextoSaida()}, ${this.quinto.paraTextoSaida()}, ${this.sexto.paraTextoSaida()}, ${this.setimo.paraTextoSaida()}, ${this.oitavo.paraTextoSaida()}, ${this.nono.paraTextoSaida()})`;
    }
}
