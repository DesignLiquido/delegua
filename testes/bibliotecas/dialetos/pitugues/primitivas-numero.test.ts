import primitivasNumero from '../../../../fontes/bibliotecas/dialetos/pitugues/primitivas-numero';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';

describe('Primitivas de Número (Pituguês)', () => {
    const interpretador = criarInterpretadorMock();

    describe('absoluto', () => {
        describe('Cenários de sucesso', () => {
            it('Deve retornar o valor absoluto de um número negativo', async () => {
                const resultado = await primitivasNumero
                    .absoluto
                    .implementacao(interpretador, -5);

                expect(resultado).toBe(5);
            });

            it('Deve retornar o próprio valor caso seja positivo ou zero', async () => {
                const positivo = await primitivasNumero
                    .absoluto
                    .implementacao(interpretador, 10);
                const zero = await primitivasNumero
                    .absoluto
                    .implementacao(interpretador, 0);

                expect(positivo).toBe(10);
                expect(zero).toBe(0);
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('arredondar', () => {
        describe('Cenários de sucesso', () => {
            it('Deve arredondar para o inteiro mais próximo quando não passar casas decimais', async () => {
                const paraBaixo = await primitivasNumero
                    .arredondar
                    .implementacao(interpretador, 2.4);
                const paraCima = await primitivasNumero
                    .arredondar
                    .implementacao(interpretador, 2.6);

                expect(paraBaixo).toBe(2);
                expect(paraCima).toBe(3);
            });

            it('Deve arredondar mantendo as casas decimais informadas', async () => {
                const resultado = await primitivasNumero
                    .arredondar
                    .implementacao(interpretador, 2.468, 2);

                expect(resultado).toBe(2.47);
            });

            it('Deve respeitar quando passar o número 0 casas decimais', async () => {
                const resultado = await primitivasNumero
                    .arredondar
                    .implementacao(interpretador, 2.6, 0);

                expect(resultado).toBe(3);
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('arredondar_para_baixo', () => {
        describe('Cenários de sucesso', () => {
            it('Deve arredondar para o inteiro inferior', async () => {
                const positivo = await primitivasNumero
                    .arredondar_para_baixo
                    .implementacao(interpretador, 2.9);
                const negativo = await primitivasNumero
                    .arredondar_para_baixo
                    .implementacao(interpretador, -2.1);

                expect(positivo).toBe(2);
                expect(negativo).toBe(-3);
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('arredondar_para_cima', () => {
        describe('Cenários de sucesso', () => {
            it('Deve arredondar para o inteiro superior', async () => {
                const positivo = await primitivasNumero
                    .arredondar_para_cima
                    .implementacao(interpretador, 2.1);
                const negativo = await primitivasNumero
                    .arredondar_para_cima
                    .implementacao(interpretador, -2.9);

                expect(positivo).toBe(3);
                expect(negativo).toBe(-2);
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('formatar', () => {
        describe('Cenários de sucesso', () => {
            it('Deve aplicar a formatação padrão pt-BR (2 casas) quando dicionário estiver vazio', async () => {
                const resultado = await primitivasNumero
                    .formatar
                    .implementacao(interpretador, 1234.56, {});

                expect(resultado).toBe('1.234,56');
            });

            it('Deve usar as opções passadas pelo dicionário', async () => {
                const resultado = await primitivasNumero
                    .formatar
                    .implementacao(
                        interpretador,
                        1234.56,
                        {
                            casasDecimais: 3,
                            maximoCasasDecimais: 3
                        }
                    );

                expect(resultado).toBe('1.234,560');
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('raiz_quadrada', () => {
        describe('Cenários de sucesso', () => {
            it('Deve retornar a raiz exata', async () => {
                const resultado = await primitivasNumero
                    .raiz_quadrada
                    .implementacao(interpretador, 25);

                expect(resultado).toBe(5);
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('truncar', () => {
        describe('Cenários de sucesso', () => {
            it('Deve remover a parte decimal sem efetuar arredondamento para cima ou baixo', async () => {
                const positivo = await primitivasNumero
                    .truncar
                    .implementacao(interpretador, 2.99);
                const negativo = await primitivasNumero
                    .truncar
                    .implementacao(interpretador, -2.99);

                expect(positivo).toBe(2);
                expect(negativo).toBe(-2);
            });
        });

        describe('Cenários de falha', () => {

        });
    });
});