import primitivaVetor from '../../../../fontes/bibliotecas/dialetos/pitugues/primitivas-vetor';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';
import { DeleguaFuncaoMock } from '../../../_mocks/delegua-funcao.mock';

describe('primitiva-vetor', () => {
    describe('filtrar_por', () => {
        it("deve rejeitar quando não for passada uma função", async () => {
            const interpretador = criarInterpretadorMock();
            await expect(
                primitivaVetor.filtrar_por.implementacao(interpretador, '', [1, 2, 3], null)
            ).rejects.toBe("É necessário passar uma função para o método 'filtrarPor'");
        });

        it('deve filtrar elementos cuja função de callback retorne verdadeiro (valorRetornado.valor === true)', async () => {
            const interpretador = criarInterpretadorMock();
            const funcao = new DeleguaFuncaoMock((n: number) => ({ valorRetornado: { valor: n % 2 === 1 } }));

            const resultado = await primitivaVetor.filtrar_por.implementacao(
                interpretador,
                '',
                [1, 2, 3, 4, 5],
                funcao as any
            );

            expect(resultado).toEqual([1, 3, 5]);
        });
    });

    describe('mapear', () => {
        it("deve rejeitar quando não for passada uma função", async () => {
            const interpretador = criarInterpretadorMock();
            await expect(
                primitivaVetor.mapear.implementacao(interpretador, '', [1, 2, 3], null)
            ).rejects.toBe("É necessário passar uma função para o método 'mapear'");
        });

        it('deve mapear cada elemento usando a função passada', async () => {
            const interpretador = criarInterpretadorMock();
            const funcao = new DeleguaFuncaoMock((n: number) => n * 2);

            const resultado = await primitivaVetor.mapear.implementacao(
                interpretador,
                '',
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

            const resultado = await primitivaVetor.ordenar.implementacao(
                interpretador,
                '',
                vetor.slice(),
                undefined
            );

            expect(resultado).toEqual([2, 4, 5, 12]);
        });

        it('deve ordenar textos lexicograficamente quando não são todos números', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = ['aaa', 'a', 'aba', 'abb', 'abc'];

            const resultado = await primitivaVetor.ordenar.implementacao(
                interpretador,
                '',
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

            const resultado = await primitivaVetor.ordenar.implementacao(
                interpretador,
                'minhaVar',
                vetor.slice(),
                funcaoComparadora as any
            );

            expect(resultado).toEqual([1, 2, 3]);
            expect(interpretador.pilhaEscoposExecucao.atribuirVariavel).toHaveBeenCalledWith(
                { lexema: 'minhaVar' },
                expect.any(Array)
            );
        });
    });

    describe('encaixar', () => {
        it('remove elementos quando quantidadeExclusao é fornecida e atribui variável', async () => {
            const interpretador: any = criarInterpretadorMock();
            interpretador.pilhaEscoposExecucao.atribuirVariavel = jest.fn();

            const vetor = [1, 2, 3];

            const resultado = await primitivaVetor.encaixar.implementacao(
                interpretador,
                'v',
                vetor.slice(),
                1,
                1
            );

            expect(resultado).toEqual([2]);
            expect(interpretador.pilhaEscoposExecucao.atribuirVariavel).toHaveBeenCalledWith(
                { lexema: 'v' },
                expect.any(Array)
            );
        });

        it('quando só posição inicial é passada, remove do índice e atribui as posições removidas', async () => {
            const interpretador: any = criarInterpretadorMock();
            interpretador.pilhaEscoposExecucao.atribuirVariavel = jest.fn();

            const vetor = [1, 2, 3];

            const resultado = await primitivaVetor.encaixar.implementacao(
                interpretador,
                'v',
                vetor,
                1
            );

            // retorna o vetor modificado (após remoção a partir da posição 1)
            expect(resultado).toEqual([1]);

            // a variável 'v' deve ter sido atribuída com os elementos removidos
            expect(interpretador.pilhaEscoposExecucao.atribuirVariavel).toHaveBeenCalledWith(
                { lexema: 'v' },
                [2, 3]
            );
        });

        it('quando chamada sem posição inicial, remove todos os elementos e retorna vetor vazio (sem atribuir variável quando nome é vazio)', async () => {
            const interpretador: any = criarInterpretadorMock();
            interpretador.pilhaEscoposExecucao.atribuirVariavel = jest.fn();

            const vetor = [1, 2, 3];

            const resultado = await primitivaVetor.encaixar.implementacao(
                interpretador,
                '',
                vetor
            );

            expect(resultado).toEqual([]);
            expect(interpretador.pilhaEscoposExecucao.atribuirVariavel).not.toHaveBeenCalled();
        });

        it('coerção de posição não numérica equivale a 0 (remove tudo)', async () => {
            const interpretador: any = criarInterpretadorMock();
            interpretador.pilhaEscoposExecucao.atribuirVariavel = jest.fn();

            const vetor = [1, 2, 3];

            const resultado = await primitivaVetor.encaixar.implementacao(
                interpretador,
                'v',
                vetor,
                'a' as any
            );

            expect(resultado).toEqual([]);
            expect(interpretador.pilhaEscoposExecucao.atribuirVariavel).toHaveBeenCalledWith(
                { lexema: 'v' },
                [1, 2, 3]
            );
        });
    });
});
