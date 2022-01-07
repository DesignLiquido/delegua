export class DeleguaModulo {
    nome: string;

    constructor(nome?: string) {
        if (nome) this.nome = nome;
    }

    toString() {
        return this.nome ? `<modulo ${this.nome}>` : "<modulo>";
    }
}
