import primitivasTupla from '../../../../fontes/bibliotecas/dialetos/pitugues/primitivas-tupla';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';
import { Literal, TuplaN } from '../../../../fontes/construtos';

describe('Primitivas de Tupla (Pituguês)', () => {
    const interpretador = criarInterpretadorMock();

    const criarTupla = (...valores: any[]): TuplaN => {
        const elementos = valores.map(valor => new Literal(-1, -1, valor));
        return new TuplaN(-1, -1, elementos);
    };

    describe('juntar', () => {
        describe('Cenários de sucesso', () => {
            it('deve juntar os elementos usando vírgula como separador padrão', async () => {
                const tupla = criarTupla('A', 'B', 'C');
                const resultado = await primitivasTupla
                    .juntar
                    .implementacao(interpretador, tupla);

                expect(resultado).toBe('A,B,C');
            });

            it('deve juntar os elementos usando um separador customizado', async () => {
                const tupla = criarTupla(1, 2, 3);
                const separador = '-';
                const resultado = await primitivasTupla
                    .juntar
                    .implementacao(interpretador, tupla, separador);

                expect(resultado).toBe('1-2-3');
            });

            it('deve retornar uma string vazia ao tentar juntar uma tupla sem elementos', async () => {
                const tupla = criarTupla();
                const resultado = await primitivasTupla
                    .juntar
                    .implementacao(interpretador, tupla);

                expect(resultado).toBe('');
            });

            it('deve juntar os elementos mesmo se houver tipos de dados misturados', async () => {
                const tupla = criarTupla('A', 1, true);
                const resultado = await primitivasTupla
                    .juntar
                    .implementacao(interpretador, tupla, ' | ');

                expect(resultado).toBe('A | 1 | true');
            });
        });
    });
});
