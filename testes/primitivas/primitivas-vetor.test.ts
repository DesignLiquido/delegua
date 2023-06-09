import primitivasVetor from '../../fontes/bibliotecas/primitivas-vetor';
import { InterpretadorBase } from '../../fontes/interpretador';

describe('Primitivas de vetor', () => {
    let interpretador: InterpretadorBase;

    beforeEach(() => {
        interpretador = new InterpretadorBase(
            process.cwd(), 
            false
        )
    });

    describe('adicionar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.adicionar(interpretador, [1, 2, 3], 4);
            expect(resultado).toStrictEqual([1, 2, 3, 4]);
        });
    });

    describe('empilhar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.empilhar(interpretador, [1, 2, 3], 4);
            expect(resultado).toStrictEqual([1, 2, 3, 4]);
        });
    });

    describe('fatiar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.fatiar(interpretador, [1, 2, 3, 4, 5], 1, 3);
            expect(resultado).toStrictEqual([2, 3]);
        });
    });

    describe('inclui()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.inclui(interpretador, [1, 2, 3], 3);
            expect(resultado).toBe(true);
        });
    });

    describe('inverter()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.inverter(interpretador, [1, 2, 3]);
            expect(resultado).toStrictEqual([3, 2, 1]);
        });
    });

    describe('juntar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.juntar(interpretador, [1, 2, 3], '|');
            expect(resultado).toBe('1|2|3');
        });
    });

    describe('concatenar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.concatenar(interpretador, [1, 2, 3], [4, 5, 6]);
            expect(resultado).toStrictEqual([1, 2, 3, 4, 5, 6]);
        });
    });

    describe('ordenar()', () => {
        it('Números', async () => {
            const resultado = await primitivasVetor.ordenar(interpretador, [2, 3, 5, 1, 10, 9], undefined as any);
            expect(resultado).toStrictEqual([1, 2, 3, 5, 9, 10]);
        });

        it('Textos', async () => {
            const resultado = await primitivasVetor.ordenar(interpretador, ["Erika", "Ana", "Carlos", "Daniel", "Bianca"], undefined as any);
            expect(resultado).toStrictEqual(["Ana", "Bianca", "Carlos", "Daniel", "Erika"]);
        });

        it('Números e Textos', async () => {
            const resultado = await primitivasVetor.ordenar(interpretador, ["Ana", "Carlos", "Bianca", 5, 3, 6], undefined as any);
            expect(resultado).toStrictEqual([3, 5, 6, "Ana", "Bianca", "Carlos"]);
        });
    });

    describe('remover()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.remover(interpretador, [1, 2, 3], 2);
            expect(resultado).toStrictEqual([1, 3]);
        });
    });

    describe('removerPrimeiro()', () => {
        it('Trivial', async () => {
            let vetor = [1, 2, 3];
            const resultado = await primitivasVetor.removerPrimeiro(interpretador, vetor);
            expect(resultado).toBe(1);
            expect(vetor).toStrictEqual([2, 3]);
        });
    });

    describe('removerUltimo()', () => {
        it('Trivial', async () => {
            let vetor = [1, 2, 3];
            const resultado = await primitivasVetor.removerUltimo(interpretador, vetor);
            expect(resultado).toBe(3);
            expect(vetor).toStrictEqual([1, 2]);
        });
    });

    describe('encaixar() - adicionando item na posição 2', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.encaixar(interpretador, [1, 2, 3], 2, 0, 10);
            expect(resultado).toStrictEqual([1, 2, 10, 3]);
        });
    });

    describe('encaixar() - removendo item na posição 2', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.encaixar(interpretador, [1, 2, 3], 2, 1, 10);
            expect(resultado).toStrictEqual([1, 2, 10]);
        });
    });

    describe('encaixar() - não passando novo elemento', () => {
        it('Trivial', async () => {
            const promises = await Promise.all([
                primitivasVetor.encaixar(interpretador, [1, 2, 3, 4], 3, 4, null, true),
                primitivasVetor.encaixar(interpretador, [1, 2, 3, 4], 0, 3)
            ]);
            const resultado1 = promises[0];
            const resultado2 = promises[1];
            expect(resultado1).toStrictEqual([4]);
            expect(resultado2).toStrictEqual([4]);
        });
    });

    describe('encaixar() - não passando novo elemento', () => {
        it('Trivial', async () => {
            const resultado1 = await primitivasVetor.encaixar(interpretador, ["maçã", "banana", "morango", "laranja", "uva"], 0, 3, null, true);
            expect(resultado1).toStrictEqual(["maçã", "banana", "morango"]);
        });
    });

    describe('somar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.somar(interpretador, [1, 2, 3]);
            expect(resultado).toBe(6);
        });
    });

    describe('tamanho()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.tamanho(interpretador, [1, 2, 3]);
            expect(resultado).toBe(3);
        });
    });
});