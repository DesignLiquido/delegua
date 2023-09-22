import { Tupla } from './tupla';

export class Noneto extends Tupla {
    primeiro: any;
    segundo: any;
    terceiro: any;
    quarto: any;
    quinto: any;
    sexto: any;
    setimo: any;
    oitavo: any;
    nono: any;

    constructor(
        primeiro: any,
        segundo: any,
        terceiro: any,
        quarto: any,
        quinto: any,
        sexto: any,
        setimo: any,
        oitavo: any,
        nono: any
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
}
