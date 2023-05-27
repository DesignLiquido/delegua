import { Tupla } from "./tupla";

export class Sexteto extends Tupla {
    primeiro: any;
    segundo: any;
    terceiro: any;
    quarto: any;
    quinto: any;
    sexto: any;

    constructor(primeiro: any, segundo: any, terceiro: any, quarto: any, quinto: any, sexto: any) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
        this.terceiro = terceiro;
        this.quarto = quarto;
        this.quinto = quinto;
        this.sexto = sexto;
    }
}
