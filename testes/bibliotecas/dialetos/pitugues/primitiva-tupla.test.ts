import primitivaTupla from '../../../../fontes/bibliotecas/dialetos/pitugues/primitivas-tupla';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';
import { Literal, TuplaN } from '../../../../fontes/construtos';
import { DeleguaFuncaoMock } from '../../../_mocks/delegua-funcao.mock';

describe('primitiva-tupla', () => {
    describe('paraVetor', () => {
        it('Transforma tupla para vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const elementosTupla = [
                new Literal(0, 1, 1, 'número'),
                new Literal(0, 1, 2, 'número'),
                new Literal(0, 1, 3, 'número'),
                new Literal(0, 1, 4, 'número'),
                new Literal(0, 1, 5, 'número'),
            ];
            const entradaTupla = new TuplaN(0, 1, elementosTupla);

            const resultado = await primitivaTupla.paraVetor.implementacao(
                interpretador,
                'paraVetor',
                entradaTupla
            );

            expect(resultado).toEqual([1, 2, 3, 4, 5]);
        });

        it('Transforma tupla vazia para vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const elementosTupla = [];
            const entradaTupla = new TuplaN(0, 1, elementosTupla);

            const resultado = await primitivaTupla.paraVetor.implementacao(
                interpretador,
                'paraVetor',
                entradaTupla
            );

            expect(resultado).toEqual([]);
        });

        it('Transforma tupla com valores de diversos tipos para vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const elementosTupla = [
                new Literal(0, 1, 1, 'número'),
                new Literal(0, 1, true, 'qualquer'),
                new Literal(0, 1, '3', 'texto'),
            ];
            const entradaTupla = new TuplaN(0, 1, elementosTupla);

            const resultado = await primitivaTupla.paraVetor.implementacao(
                interpretador,
                'paraVetor',
                entradaTupla
            );

            expect(resultado).toEqual([1, true, "3"]);
        });
    });
});