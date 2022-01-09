import { PilhaInterface } from "../interfaces";

export class Pilha implements PilhaInterface {
    pilha: any[];

    constructor() {
        this.pilha = [];
    }

    empilhar(item) {
        this.pilha.push(item);
    }

    eVazio() {
        return this.pilha.length === 0;
    }

    peek() {
        if (this.eVazio())
            throw new Error("Pilha vazia.");
        return this.pilha[this.pilha.length - 1];
    }

    removerUltimo() {
        if (this.eVazio())
            throw new Error("Pilha vazia.");
        return this.pilha.pop();
    }
}
