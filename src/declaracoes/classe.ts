import { Declaracao } from "./declaracao";


export class Classe extends Declaracao {
    nome: string;
    superClasse: any;
    metodos: any;

    constructor(nome: any, superClasse: any, metodos: any) {
        super();
        this.nome = nome;
        this.superClasse = superClasse;
        this.metodos = metodos;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoClasse(this);
    }
}
