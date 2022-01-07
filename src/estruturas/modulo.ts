export class DeleguaModulo {
    nome: string;

    constructor(nome?: any) {
        if (nome) this.nome = nome;
    }

    toString() {
        return this.nome ? `<modulo ${this.nome}>` : "<modulo>";
    }
}
