export class DeleguaModulo {
    nome: any;

    constructor(nome?: any) {
        if (nome !== undefined) this.nome = nome;
    }

    toString() {
        return this.nome ? `<modulo ${this.nome}>` : "<modulo>";
    }
}
