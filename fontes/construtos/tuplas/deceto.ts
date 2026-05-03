import { ConstrutoInterface } from '../../interfaces/construtos/construto-interface';
import { Tupla } from '../tupla';

export class Deceto extends Tupla {
    primeiro: ConstrutoInterface;
    segundo: ConstrutoInterface;
    terceiro: ConstrutoInterface;
    quarto: ConstrutoInterface;
    quinto: ConstrutoInterface;
    sexto: ConstrutoInterface;
    setimo: ConstrutoInterface;
    oitavo: ConstrutoInterface;
    nono: ConstrutoInterface;
    decimo: ConstrutoInterface;

    constructor(
        primeiro: ConstrutoInterface,
        segundo: ConstrutoInterface,
        terceiro: ConstrutoInterface,
        quarto: ConstrutoInterface,
        quinto: ConstrutoInterface,
        sexto: ConstrutoInterface,
        setimo: ConstrutoInterface,
        oitavo: ConstrutoInterface,
        nono: ConstrutoInterface,
        decimo: ConstrutoInterface
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
        this.decimo = decimo;
    }

    // Propriedades extras apenas de formas acentuadas.
    get sétimo() {
        return this.setimo;
    }

    set sétimo(valor: any) {
        this.setimo = valor;
    }

    get décimo() {
        return this.decimo;
    }

    set décimo(valor: any) {
        this.decimo = valor;
    }

    paraTexto(): string {
        return (
            `<deceto primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            `terceiro=${this.terceiro.paraTexto()} ` +
            `quarto=${this.quarto.paraTexto()} ` +
            `quinto=${this.quinto.paraTexto()} ` +
            `sexto=${this.sexto.paraTexto()} ` +
            `sétimo=${this.setimo.paraTexto()} ` +
            `oitavo=${this.oitavo.paraTexto()} ` +
            `nono=${this.nono.paraTexto()} ` +
            `décimo=${this.decimo.paraTexto()} ` +
            ` />`
        );
    }

    paraTextoSaida(): string {
        return `(${this.primeiro.paraTextoSaida()}, ${this.segundo.paraTextoSaida()}, ${this.terceiro.paraTextoSaida()}, ${this.quarto.paraTextoSaida()}, ${this.quinto.paraTextoSaida()}, ${this.sexto.paraTextoSaida()}, ${this.setimo.paraTextoSaida()}, ${this.oitavo.paraTextoSaida()}, ${this.nono.paraTextoSaida()}, ${this.decimo.paraTextoSaida()})`;
    }
}
