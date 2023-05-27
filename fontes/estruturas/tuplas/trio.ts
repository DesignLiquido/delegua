import { Tupla } from "./tupla";

export class Trio extends Tupla {
    primeiro: any;
    segundo: any;
    terceiro: any;

    constructor(primeiro: any, segundo: any, terceiro: any) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
        this.terceiro = terceiro;
    }
}
