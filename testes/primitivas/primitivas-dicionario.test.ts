import primitivasDicionario from '../../fontes/bibliotecas/primitivas-dicionario';
import { InterpretadorBase } from '../../fontes/interpretador';

describe('Primitivas de dicionário', () => {
    let interpretador: InterpretadorBase;

    beforeEach(() => {
        interpretador = new InterpretadorBase(
            process.cwd(), 
            false
        )
    });

    describe('chaves()', () => {
        it('Trivial', async () => {
            var meuDicionario = {"a": 1, "b": 2, "c": 3}
            const resultado = await primitivasDicionario.chaves(interpretador, meuDicionario);
            expect(resultado).toStrictEqual(["a", "b", "c"]);
        });
    });

    describe('valores()', () => {
        it('Trivial', async () => {
            var meuDicionario = {"a": 1, "b": 2, "c": 3}
            const resultado = await primitivasDicionario.valores(interpretador, meuDicionario);
            expect(resultado).toStrictEqual([1, 2, 3]);
        });
    });
});