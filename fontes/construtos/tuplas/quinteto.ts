import { Tupla } from './tupla';

export class Quinteto extends Tupla {
    primeiro: any;
    segundo: any;
    terceiro: any;
    quarto: any;
    quinto: any;

    constructor(primeiro: any, segundo: any, terceiro: any, quarto: any, quinto: any) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
        this.terceiro = terceiro;
        this.quarto = quarto;
        this.quinto = quinto;
    }
}
