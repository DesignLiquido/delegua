import { PilhaInterface } from '../../../../interfaces';

export class PilhaEscopos implements PilhaInterface<any> {
    pilha: any[];

    constructor() {
        this.pilha = [];
    }

    empilhar(item: any) {
        this.pilha.push(item);
    }

    eVazio() {
        return this.pilha.length === 0;
    }

    topoDaPilha() {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha[this.pilha.length - 1];
    }

    removerUltimo() {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha.pop();
    }
}
