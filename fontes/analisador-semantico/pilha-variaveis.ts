import { VariavelInterface } from '../interfaces';
import { PilhaInterface } from '../interfaces';

export class PilhaVariaveis implements PilhaInterface<{ [nomeVariavel: string]: VariavelInterface }> {
    pilha: { [nomeVariavel: string]: VariavelInterface }[];

    constructor() {
        this.pilha = [];
    }

    empilhar(item: { [nomeVariavel: string]: VariavelInterface }): void {
        this.pilha.push(item);
    }

    eVazio(): boolean {
        return this.pilha.length === 0;
    }

    topoDaPilha(): { [nomeVariavel: string]: VariavelInterface } {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha[this.pilha.length - 1];
    }

    removerUltimo(): { [nomeVariavel: string]: VariavelInterface } {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha.pop();
    }
}
