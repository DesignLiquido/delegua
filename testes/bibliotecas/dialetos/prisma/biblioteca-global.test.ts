import { InterpretadorPrisma } from '../../../../fontes/interpretador/dialetos/prisma';
import { FuncaoPadrao } from '../../../../fontes/interpretador/estruturas';

describe('Biblioteca Global Prisma', () => {
    let interpretador: InterpretadorPrisma;

    const chamar = (nome: string, ...argumentos: any[]) => {
        const funcao = interpretador.pilhaEscoposExecucao.obterValorVariavel({ lexema: nome } as any)
            .valor as FuncaoPadrao;
        return funcao.funcao(interpretador, ...argumentos);
    };

    beforeEach(() => {
        interpretador = new InterpretadorPrisma(process.cwd());
    });

    describe('tipo()', () => {
        it.each([
            [null, 'nulo'],
            [5, 'número'],
            ['a', 'texto'],
            [true, 'logico'],
            [[1, 2], 'tabela'],
            [{ a: 1 }, 'tabela'],
            [BigInt(1), 'bigint'],
            [{ valor: 'a' }, 'texto'],
        ])('tipo(%p) = %s', (valor: any, esperado: string) => {
            expect(chamar('tipo', valor)).toBe(esperado);
        });

        it('Função', () => {
            expect(chamar('tipo', new FuncaoPadrao(0, () => null))).toBe('funcao');
        });
    });

    describe('pares() e ipares()', () => {
        it('Vetor', () => {
            expect(chamar('pares', [10, 20, 30])).toEqual([
                [0, 10],
                [2, 30],
            ]);
            expect(chamar('ipares', [10, 20, 30])).toEqual([[1, 20]]);
        });

        it('Dicionário', () => {
            expect(chamar('pares', { a: 1, b: 2, c: 3 })).toEqual([
                [0, 1],
                [2, 3],
            ]);
            expect(chamar('ipares', { a: 1, b: 2, c: 3 })).toEqual([[1, 2]]);
        });

        it('Nulo', () => {
            expect(chamar('pares', null)).toEqual([]);
            expect(chamar('ipares', null)).toEqual([]);
        });
    });

    describe('Conversões', () => {
        it.each([
            [5, 5],
            ['2.5', 2.5],
            ['abc', null],
            [true, 1],
            [false, 0],
            [null, null],
        ])('convnumero(%p) = %p', (valor: any, esperado: any) => {
            expect(chamar('convnumero', valor)).toBe(esperado);
        });

        it.each([
            [null, 'nulo'],
            [true, 'verdadeiro'],
            [false, 'falso'],
            [3, '3'],
        ])('convstring(%p) = %p', (valor: any, esperado: any) => {
            expect(chamar('convstring', valor)).toBe(esperado);
        });
    });

    describe('tamanho()', () => {
        it.each([
            [[1, 2, 3], 3],
            ['abcd', 4],
            [{ a: 1, b: 2 }, 2],
            [5, 0],
        ])('tamanho(%p) = %p', (valor: any, esperado: number) => {
            expect(chamar('tamanho', valor)).toBe(esperado);
        });
    });

    describe('Números', () => {
        it('piso() e teto()', () => {
            expect(chamar('piso', 2.7)).toBe(2);
            expect(chamar('teto', 2.1)).toBe(3);
        });

        it('aleatorio_entre()', () => {
            const valor = chamar('aleatorio_entre', 1, 3);
            expect(valor).toBeGreaterThanOrEqual(1);
            expect(valor).toBeLessThan(3);
            expect(chamar('aleatorio_entre', 'a', 3)).toBeNull();
        });

        it('aleatorio()', () => {
            const valor = chamar('aleatorio');
            expect(valor).toBeGreaterThanOrEqual(0);
            expect(valor).toBeLessThan(1);
        });
    });

    describe('coletelixo()', () => {
        it.each([
            [undefined, 0],
            ['coletar', 0],
            ['parar', 0],
            ['reiniciar', 0],
            ['passo', 0],
            ['contar', 0],
            ['rodando', true],
            ['outra', null],
        ])('coletelixo(%p) = %p', (acao: any, esperado: any) => {
            expect(chamar('coletelixo', acao)).toBe(esperado);
        });
    });
});
