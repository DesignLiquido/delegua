import primitivasVetor from '../../fontes/bibliotecas/primitivas-vetor';

describe('Primitivas de vetor', () => {
    describe('adicionar()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.adicionar([1, 2, 3], 4);
            expect(resultado).toStrictEqual([1, 2, 3, 4]);
        });
    });

    describe('empilhar()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.empilhar([1, 2, 3], 4);
            expect(resultado).toStrictEqual([1, 2, 3, 4]);
        });
    });

    describe('fatiar()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.fatiar([1, 2, 3, 4, 5], 1, 3);
            expect(resultado).toStrictEqual([2, 3]);
        });
    });

    describe('inclui()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.inclui([1, 2, 3], 3);
            expect(resultado).toBe(true);
        });
    });

    describe('inverter()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.inverter([1, 2, 3]);
            expect(resultado).toStrictEqual([3, 2, 1]);
        });
    });

    describe('juntar()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.juntar([1, 2, 3], '|');
            expect(resultado).toBe('1|2|3');
        });
    });

    describe('concatenar()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.concatenar([1, 2, 3], [4, 5, 6]);
            expect(resultado).toStrictEqual([1, 2, 3, 4, 5, 6]);
        });
    });

    describe('ordenar()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.ordenar([3, 2, 7, 1, 5]);
            expect(resultado).toStrictEqual([1, 2, 3, 5, 7]);
        });
    });

    describe('remover()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.remover([1, 2, 3], 2);
            expect(resultado).toStrictEqual([1, 3]);
        });
    });

    describe('removerPrimeiro()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.removerPrimeiro([1, 2, 3]);
            expect(resultado).toStrictEqual([2, 3]);
        });
    });

    describe('removerUltimo()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.removerUltimo([1, 2, 3]);
            expect(resultado).toStrictEqual([1, 2]);
        });
    });

    describe('somar()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.somar([1, 2, 3]);
            expect(resultado).toBe(6);
        });
    });

    describe('tamanho()', () => {
        it('Trivial', () => {
            const resultado = primitivasVetor.tamanho([1, 2, 3]);
            expect(resultado).toBe(3);
        });
    });
});