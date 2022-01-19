import { Stmt } from "./stmt";


export class Classe extends Stmt {
    nome: string;
    superClasse: any;
    metodos: any;

    constructor(nome: any, superClasse: any, metodos: any) {
        super();
        this.nome = nome;
        this.superClasse = superClasse;
        this.metodos = metodos;
    }

    aceitar(visitar: any): any {
        return visitar.visitarExpressaoClasse(this);
    }
}
