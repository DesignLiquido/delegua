import { Chamavel } from "./chamavel";

export class ClassePadrao extends Chamavel {
    nome: string;
    metodos: { [nome: string]: any };

    constructor(nome?: string) {
        super();
        this.nome = nome;
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
    chamar(argumentos: any[], simbolo: any): void {
        const construtor = this.metodos['construtor'];
        if (construtor) {
            construtor.apply(this, argumentos);
        }
    }
}