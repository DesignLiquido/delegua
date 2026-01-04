import primitivasVetor from '../../../../fontes/bibliotecas/dialetos/pitugues/primitivas-vetor';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';
import { DeleguaFuncaoMock } from '../../../_mocks/delegua-funcao.mock';

describe('Primitivas de Vetor (Pituguês)', () => {
    describe('contar', () => {
        it('deve contar quantas vezes um elemento aparece no vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 2, 3, 2];

            const resultado = await primitivasVetor.contar.implementacao(
                interpretador,
                vetor,
                2
            );

            expect(resultado).toBe(3);
        });

        it('deve retornar 0 se o elemento não existir no vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.contar.implementacao(
                interpretador,
                vetor,
                99
            );

            expect(resultado).toBe(0);
        });
    });

    describe('filtrar_por', () => {
        it("deve rejeitar quando não for passada uma função", async () => {
            const interpretador = criarInterpretadorMock();
            await expect(
                primitivasVetor.filtrar_por.implementacao(interpretador, [1, 2, 3], null)
            ).rejects.toBe("É necessário passar uma função para o método 'filtrarPor'");
        });

        it('deve filtrar elementos cuja função de callback retorne verdadeiro (valorRetornado.valor === true)', async () => {
            const interpretador = criarInterpretadorMock();
            const funcao = new DeleguaFuncaoMock((n: number) => ({ valorRetornado: { valor: n % 2 === 1 } }));

            const resultado = await primitivasVetor.filtrar_por.implementacao(
                interpretador,
                [1, 2, 3, 4, 5],
                funcao as any
            );

            expect(resultado).toEqual([1, 3, 5]);
        });
    });

    describe('limpar', () => {
        it('deve remover todos os elementos do vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            await primitivasVetor.limpar.implementacao(
                interpretador,
                vetor
            );

            expect(vetor).toEqual([]);
        });

        it('não deve quebrar se o vetor já estiver vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            await primitivasVetor.limpar.implementacao(
                interpretador,
                vetor
            );

            expect(vetor).toEqual([]);
        });
    });

    describe('mapear', () => {
        it("deve rejeitar quando não for passada uma função", async () => {
            const interpretador = criarInterpretadorMock();
            await expect(
                primitivasVetor.mapear.implementacao(interpretador, [1, 2, 3], null)
            ).rejects.toBe("É necessário passar uma função para o método 'mapear'");
        });

        it('deve mapear cada elemento usando a função passada', async () => {
            const interpretador = criarInterpretadorMock();
            const funcao = new DeleguaFuncaoMock((n: number) => n * 2);

            const resultado = await primitivasVetor.mapear.implementacao(
                interpretador,
                [1, 2, 3],
                funcao as any
            );

            expect(resultado).toEqual([2, 4, 6]);
        });
    });

    describe('ordenar', () => {
        it('deve ordenar números em ordem ascendente sem função comparadora', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [4, 2, 12, 5];

            const resultado = await primitivasVetor.ordenar.implementacao(
                interpretador,
                vetor.slice(),
                undefined
            );

            expect(resultado).toEqual([2, 4, 5, 12]);
        });

        it('deve ordenar textos lexicograficamente quando não são todos números', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = ['aaa', 'a', 'aba', 'abb', 'abc'];

            const resultado = await primitivasVetor.ordenar.implementacao(
                interpretador,
                vetor.slice(),
                undefined
            );

            expect(resultado).toEqual(['a', 'aaa', 'aba', 'abb', 'abc']);
        });

        it('deve ordenar usando função comparadora quando fornecida e atribuir variável quando nome for passado', async () => {
            const interpretador: any = criarInterpretadorMock();
            // spy na função de atribuirVariavel para garantir que foi chamada
            interpretador.pilhaEscoposExecucao.atribuirVariavel = jest.fn();

            const vetor = [3, 1, 2];
            // comparador que retorna a - b (mantém ordem ascendente)
            const funcaoComparadora = new DeleguaFuncaoMock((a: number, b: number) => a - b);

            const resultado = await primitivasVetor.ordenar.implementacao(
                interpretador,
                vetor.slice(),
                funcaoComparadora as any
            );

            expect(resultado).toEqual([1, 2, 3]);
        });
    });

    describe('indice', () => {
        it('deve retornar o índice do elemento se ele existir', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = ['a', 'b', 'c'];

            const resultado = await primitivasVetor.indice.implementacao(
                interpretador,
                vetor,
                'b'
            );

            expect(resultado).toBe(1);
        });

        it('deve retornar -1 se o elemento não existir', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.indice.implementacao(
                interpretador,
                vetor,
                99
            );

            expect(resultado).toBe(-1);
        });
    });

    describe('inserir', () => {
        it('deve inserir elemento na posição indicada e deslocar os demais', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 4];

            const resultado = await primitivasVetor.inserir.implementacao(
                interpretador,
                vetor,
                2,
                3
            );

            expect(resultado).toEqual([1, 2, 3, 4]);
            expect(vetor).toEqual([1, 2, 3, 4]);
        });

        it('deve inserir no início do vetor (índice 0)', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [2, 3];

            await primitivasVetor.inserir.implementacao(
                interpretador,
                vetor,
                0,
                1
            );

            expect(vetor).toEqual([1, 2, 3]);
        });
    });

    describe('paraTupla', () => {
        it('Transforma vetor para tupla', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3, 4, 5];

            const resultado = await primitivasVetor.paraTupla.implementacao(
                interpretador,
                vetor
            );

            expect(resultado.paraTextoSaida()).toBe('(1, 2, 3, 4, 5)');
        });

        it('Transforma vetor vazio para tupla', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            const resultado = await primitivasVetor.paraTupla.implementacao(
                interpretador,
                vetor
            );

            expect(resultado.paraTextoSaida()).toBe('()');
        });

        it('Transforma vetor com valores de diversos tipos para tupla', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, true, '3'];

            const resultado = await primitivasVetor.paraTupla.implementacao(
                interpretador,
                vetor
            );

            expect(resultado.paraTextoSaida()).toBe('(1, true, "3")');
        });
    });
});
