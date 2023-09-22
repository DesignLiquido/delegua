import { Tupla } from './tupla';

export class Octeto extends Tupla {
    primeiro: any;
    segundo: any;
    terceiro: any;
    quarto: any;
    quinto: any;
    sexto: any;
    setimo: any;
    oitavo: any;

    constructor(
        primeiro: any,
        segundo: any,
        terceiro: any,
        quarto: any,
        quinto: any,
        sexto: any,
        setimo: any,
        oitavo: any
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
}
