import { Tupla } from './tupla';

export class Septeto extends Tupla {
    primeiro: any;
    segundo: any;
    terceiro: any;
    quarto: any;
    quinto: any;
    sexto: any;
    setimo: any;

    constructor(primeiro: any, segundo: any, terceiro: any, quarto: any, quinto: any, sexto: any, setimo: any) {
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
}
