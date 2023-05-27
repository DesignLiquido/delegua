import { Tupla } from "./tupla";

export class Quarteto extends Tupla {
    primeiro: any;
    segundo: any;
    terceiro: any;
    quarto: any;

    constructor(primeiro: any, segundo: any, terceiro: any, quarto: any) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
        this.terceiro = terceiro;
        this.quarto = quarto;
    }
}
