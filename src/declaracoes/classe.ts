import { SimboloInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Classe extends Declaracao {
    simbolo: SimboloInterface;
    superClasse: any;
    metodos: any;

    constructor(simbolo: SimboloInterface, superClasse: any, metodos: any) {
        super(Number(simbolo.linha));
        this.simbolo = simbolo;
        this.superClasse = superClasse;
        this.metodos = metodos;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoClasse(this);
    }
}
