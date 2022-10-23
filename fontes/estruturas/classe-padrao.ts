import { Chamavel } from "./chamavel";
import { ObjetoPadrao } from "./objeto-padrao";

export class ClassePadrao extends Chamavel {
    nome: string;
    funcaoDeClasse: Function;
    metodos: { [nome: string]: any };

    constructor(nome: string, funcaoDeClasse: Function) {
        super();
        this.nome = nome;
        this.funcaoDeClasse = funcaoDeClasse;
        this.metodos = {};
    }

    encontrarMetodo(nome: string): Function {
        if (this.metodos.hasOwnProperty(nome)) {
            return this.metodos[nome];
        }

        return undefined;
    }

    paraTexto(): string {
        return `<classe-padrão ${this.nome}>`;
    }

    /**
     * Para o caso de uma classe padrão, chamá-la na verdade é
     * invocar o método `constructor` do `prototype`.
     * @param argumentos 
     * @param simbolo 
     */
    chamar(argumentos: any[], simbolo: any): any {
        let novoObjeto: ObjetoPadrao = new ObjetoPadrao(this.nome);
        this.funcaoDeClasse.apply(novoObjeto, argumentos);
        Object.assign(novoObjeto, this.metodos);
        return novoObjeto;
    }
}