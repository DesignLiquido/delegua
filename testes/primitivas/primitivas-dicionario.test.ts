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

    describe('mesclar()', () => {
        it('Mescla dois dicionários', async () => {
            const meuDicionario = { "a": 1, "b": 2 };
            const resultado = await primitivasDicionario.mesclar.implementacao(
                interpretador,
                meuDicionario,
                { "c": 3 }
            );

            expect(resultado).toStrictEqual({ "a": 1, "b": 2, "c": 3 });
            expect(meuDicionario).toStrictEqual({ "a": 1, "b": 2 });
        });

        it('Sobrescreve chaves com valor da direita', async () => {
            const meuDicionario = { "a": 1, "b": 2 };
            const resultado = await primitivasDicionario.mesclar.implementacao(
                interpretador,
                meuDicionario,
                { "b": 999, "c": 3 }
            );

            expect(resultado).toStrictEqual({ "a": 1, "b": 999, "c": 3 });
        });

        it('Falha quando argumento não é dicionário', async () => {
            const meuDicionario = { "a": 1, "b": 2 };

            await expect(
                primitivasDicionario.mesclar.implementacao(interpretador, meuDicionario, [1, 2, 3])
            ).rejects.toThrow('O argumento de dicionário.mesclar() deve ser um dicionário.');
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
