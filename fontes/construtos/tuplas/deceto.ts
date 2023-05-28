import { Tupla } from "./tupla";

export class Deceto extends Tupla {
    primeiro: any;
    segundo: any;
    terceiro: any;
    quarto: any;
    quinto: any;
    sexto: any;
    setimo: any;
    oitavo: any;
    nono: any;
    decimo: any;

    constructor(primeiro: any, segundo: any, terceiro: any, quarto: any, quinto: any, sexto: any, 
        setimo: any, oitavo: any, nono: any, decimo: any
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
}
