module.exports = class DeleguaModulo {
    constructor(nome) {
        if (nome !== undefined) this.nome = nome;
    }

    toString() {
        return this.nome ? `<modulo ${this.nome}>` : "<modulo>";
    }
};