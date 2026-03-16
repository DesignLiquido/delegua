import primitivasDicionario from '../../fontes/bibliotecas/primitivas-dicionario';
import { InterpretadorBase } from '../../fontes/interpretador';

describe('Primitivas de dicionário', () => {
    let interpretador: InterpretadorBase;

    beforeEach(() => {
        interpretador = new InterpretadorBase(
            process.cwd(),
            false
        );
    });

    describe('chaves()', () => {
        it('Trivial', async () => {
            const meuDicionario = { "a": 1, "b": 2, "c": 3 };
            const resultado = await primitivasDicionario.chaves.implementacao(interpretador, meuDicionario);
            expect(resultado).toStrictEqual(["a", "b", "c"]);
        });
    });

    describe('contém() ou contem()', () => {
        it('Trivial', async () => {
            const meuDicionario = { "a": 1, "b": 2, "c": 3 };
            const resultado1 = await primitivasDicionario.contém.implementacao(interpretador, meuDicionario, "a");
            expect(resultado1).toStrictEqual(true);

            const resultado2 = await primitivasDicionario.contem.implementacao(interpretador, meuDicionario, "f");
            expect(resultado2).toStrictEqual(false);
        });
    });

    describe('remover()', () => {
        it('Trivial', async () => {
            const meuDicionario = { "a": 1, "b": 2, "c": 3 };
            const resultado = await primitivasDicionario.remover.implementacao(interpretador, meuDicionario, "b");
            expect(resultado).toStrictEqual(true);
        });
    });

    describe('valores()', () => {
        it('Trivial', async () => {
            const meuDicionario = { "a": 1, "b": 2, "c": 3 };
            const resultado = await primitivasDicionario.valores.implementacao(interpretador, meuDicionario);
            expect(resultado).toStrictEqual([1, 2, 3]);
        });
    });
});
