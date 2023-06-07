import primitivasVetor from '../../../fontes/bibliotecas/dialetos/potigol/primitivas-vetor';
import { InterpretadorPotigol } from '../../../fontes/interpretador/dialetos/potigol/interpretador-potigol';

describe('Primitivas de vetor - Potigol', () => {
    let interpretador: InterpretadorPotigol;

    beforeEach(() => {
        interpretador = new InterpretadorPotigol(
            process.cwd(), 
            false
        )
    });

    describe('cabeça()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.cabeça(interpretador, [1, 2, 3]);
            expect(resultado).toStrictEqual(1);
        });
    });

    describe('cauda()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.cauda(interpretador, [1, 2, 3]);
            expect(resultado).toStrictEqual([2, 3]);
        });
    });

    describe('contém()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.contém(interpretador, [1, 2, 3], 2);
            expect(resultado).toBe(true);
        });

        it('Elemento inexistente', async () => {
            const resultado = await primitivasVetor.contém(interpretador, [1, 2, 3], 4);
            expect(resultado).toBe(false);
        });
    });

    describe('descarte()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.descarte(interpretador, [2, 4, 6, 8, 10], 2);
            expect(resultado).toStrictEqual([6, 8, 10]);
        });
    });

    describe('inverta()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.inverta(interpretador, [2, 4, 6, 8, 10]);
            expect(resultado).toStrictEqual([10, 8, 6, 4, 2]);
        });
    });

    describe('junte()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.junte(interpretador, [2, 4, 6, 8, 10], '-');
            expect(resultado).toStrictEqual('2-4-6-8-10');
        });
    });

    describe('ordene()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.ordene(interpretador, [4, 8, 10, 2, 6]);
            expect(resultado).toStrictEqual([2, 4, 6, 8, 10]);
        });
    });

    describe('pegue()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.pegue(interpretador, [2, 4, 6, 8, 10], 3);
            expect(resultado).toStrictEqual([2, 4, 6]);
        });
    });

    describe('posição()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.posição(interpretador, [2, 4, 6, 8, 10], 8);
            expect(resultado).toStrictEqual(4);
        });
    });

    describe('remova()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.remova(interpretador, [2, 4, 6, 8, 10], 3);
            expect(resultado).toStrictEqual([2, 4, 8, 10]);
        });
    });

    describe('tamanho()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.tamanho(interpretador, [2, 4, 6, 8, 10]);
            expect(resultado).toStrictEqual(5);
        });
    });

    describe('último()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.último(interpretador, [2, 4, 6, 8, 10]);
            expect(resultado).toStrictEqual(10);
        });
    });

    describe('vazia()', () => {
        it('Lista com elementos', async () => {
            const resultado = await primitivasVetor.vazia(interpretador, [2, 4, 6, 8, 10]);
            expect(resultado).toBe(false);
        });

        it('Lista vazia', async () => {
            const resultado = await primitivasVetor.vazia(interpretador, []);
            expect(resultado).toBe(true);
        });
    });
});
