export class DeleguaModulo {
    nome: string;

    constructor(nome?: string) {
        if (nome) this.nome = nome;
    }

    toString(): string {
        return this.nome ? `<modulo ${this.nome}>` : "<modulo>";
    }
}
