import { Construto } from '../construto';
import { Tupla } from '../tupla';

export class Octeto extends Tupla {
    primeiro: Construto;
    segundo: Construto;
    terceiro: Construto;
    quarto: Construto;
    quinto: Construto;
    sexto: Construto;
    setimo: Construto;
    oitavo: Construto;

    constructor(
        primeiro: Construto,
        segundo: Construto,
        terceiro: Construto,
        quarto: Construto,
        quinto: Construto,
        sexto: Construto,
        setimo: Construto,
        oitavo: Construto
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
    }

    get sétimo() {
        return this.setimo;
    }

    set sétimo(valor: any) {
        this.setimo = valor;
    }

    paraTexto(): string {
        return (
            `<octeto primeiro=${this.primeiro.paraTexto()} ` +
            `segundo=${this.segundo.paraTexto()} ` +
            `terceiro=${this.terceiro.paraTexto()} ` +
            `quarto=${this.quarto.paraTexto()} ` +
            `quinto=${this.quinto.paraTexto()} ` +
            `sexto=${this.sexto.paraTexto()} ` +
            `sétimo=${this.setimo.paraTexto()} ` +
            `oitavo=${this.oitavo.paraTexto()} ` +
            ` />`
        );
    }

    paraTextoSaida(): string {
        return `[(${this.primeiro.paraTextoSaida()}, ${this.segundo.paraTextoSaida()}, ${this.terceiro.paraTextoSaida()}, ${this.quarto.paraTextoSaida()}, ${this.quinto.paraTextoSaida()}, ${this.sexto.paraTextoSaida()}, ${this.setimo.paraTextoSaida()}, ${this.oitavo.paraTextoSaida()})]`;
    }
}
