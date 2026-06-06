import { PilhaVariaveis } from '../../fontes/analisador-semantico';
import { VariavelInterface } from '../../fontes/interfaces';

function criarVariavel(valor: any): VariavelInterface {
    return { valor, tipo: 'qualquer', imutavel: false };
}

describe('PilhaVariaveis', () => {
    let pilha: PilhaVariaveis;

    beforeEach(() => {
        pilha = new PilhaVariaveis();
    });

    it('começa vazia', () => {
        expect(pilha.eVazio()).toBe(true);
        expect(pilha.pilha).toHaveLength(0);
    });

    it('empilhar adiciona item e não está mais vazia', () => {
        pilha.empilhar({ x: criarVariavel(1) });
        expect(pilha.eVazio()).toBe(false);
        expect(pilha.pilha).toHaveLength(1);
    });

    it('topoDaPilha retorna o último item empilhado', () => {
        const item1 = { a: criarVariavel(1) };
        const item2 = { b: criarVariavel(2) };
        pilha.empilhar(item1);
        pilha.empilhar(item2);
        expect(pilha.topoDaPilha()).toBe(item2);
    });

    it('topoDaPilha lança exceção quando vazia', () => {
        expect(() => pilha.topoDaPilha()).toThrow('Pilha vazia.');
    });

    it('removerUltimo remove e retorna o último item', () => {
        const item = { x: criarVariavel(42) };
        pilha.empilhar(item);
        const removido = pilha.removerUltimo();
        expect(removido).toBe(item);
        expect(pilha.eVazio()).toBe(true);
    });

    it('removerUltimo lança exceção quando vazia', () => {
        expect(() => pilha.removerUltimo()).toThrow('Pilha vazia.');
    });
});
