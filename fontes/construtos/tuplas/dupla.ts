import { Tupla } from './tupla';

export class Dupla extends Tupla {
    primeiro: any;
    segundo: any;

    constructor(primeiro: any, segundo: any) {
        super();
        this.primeiro = primeiro;
        this.segundo = segundo;
    }
}
