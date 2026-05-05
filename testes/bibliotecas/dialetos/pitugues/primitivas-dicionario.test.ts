import primitivasDicionario from '../../../../fontes/bibliotecas/dialetos/pitugues/primitivas-dicionario';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';

describe('Primitivas de Dicionário (Pituguês)', () => {
    const interpretador = criarInterpretadorMock();

    describe('chaves', () => {
        describe('Cenários de sucesso', () => {
            it('Deve retornar um vetor com todas as chaves do dicionário', async () => {
                const dicionario = { a: 1, b: 2, c: 3 };
                const resultado = await primitivasDicionario
                    .chaves
                    .implementacao(interpretador, dicionario);

                expect(resultado).toEqual(["a", "b", "c"]);
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('contem/contém', () => {
        describe('Cenários de sucesso', () => {
            it('Deve retornar verdadeiro quando a chave existe', async () => {
                const dicionario = { a: 1, b: 2, c: 3 };
                const resultado = await primitivasDicionario
                    .contem
                    .implementacao(interpretador, dicionario, 'a');

                expect(resultado).toBe(true);
            });

            it('Deve retornar falso quando a chave não existe', async () => {
                const dicionario = { a: 1, b: 2, c: 3 };
                const resultado = await primitivasDicionario
                    .contem
                    .implementacao(interpretador, dicionario, 'z');

                expect(resultado).toBe(false);
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('itens', () => {
        describe('Cenários de sucesso', () => {
            it('Deve retornar um vetor de pares [chave, valor]', async () => {
                const dicionario = { a: 1, b: 2, c: 3 };
                const resultado = await primitivasDicionario
                    .itens
                    .implementacao(interpretador, dicionario);

                expect(resultado).toEqual([['a', 1], ['b', 2], ['c', 3]]);
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('limpar', () => {
        describe('Cenários de sucesso', () => {
            it('Deve remover todas as entradas do dicionário', async () => {
                const dicionario = { a: 1, b: 2, c: 3 };
                await primitivasDicionario
                    .limpar
                    .implementacao(interpretador, dicionario);

                expect(dicionario).toEqual({});
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('mesclar', () => {
        describe('Cenários de sucesso', () => {
            it('Deve adicionar as entradas do segundo dicionário ao primeiro', async () => {
                const dicionario = { a: 1, b: 2 };
                await primitivasDicionario.mesclar.implementacao(
                    interpretador,
                    dicionario,
                    { c: 3, d: 4 }
                );

                expect(dicionario).toEqual({ a: 1, b: 2, c: 3, d: 4 });
            });

            it('Deve sobrescrever chaves duplicadas com os valores do segundo dicionário', async () => {
                const dicionario = { a: 1, b: 2 };
                await primitivasDicionario.mesclar.implementacao(
                    interpretador,
                    dicionario,
                    { b: 99, c: 3 }
                );

                expect(dicionario).toEqual({ a: 1, b: 99, c: 3 });
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('obter', () => {
        describe('Cenários de sucesso', () => {
            it('Deve retornar o valor associado à chave quando ela existe', async () => {
                const dicionario = { a: 1, b: 2, c: 3 };
                const resultado = await primitivasDicionario
                    .obter
                    .implementacao(interpretador, dicionario, 'a', 0);

                expect(resultado).toBe(1);
            });

            it('Deve retornar o valor padrão quando a chave não existe', async () => {
                const dicionario = { a: 1, b: 2, c: 3 };
                const resultado = await primitivasDicionario
                    .obter
                    .implementacao(interpretador, dicionario, 'z', 0);

                expect(resultado).toBe(0);
            });

            it('Deve retornar nulo quando a chave não existe e nenhum padrão for fornecido', async () => {
                const dicionario = { a: 1, b: 2, c: 3 };
                const resultado = await primitivasDicionario
                    .obter
                    .implementacao(interpretador, dicionario, 'z');

                expect(resultado).toBeNull();
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('popular', () => {
        describe('Cenários de sucesso', () => {
            it('Deve retornar o valor existente quando a chave já existe', async () => {
                const dicionario = { a: 1 };
                const resultado = await primitivasDicionario
                    .popular
                    .implementacao(interpretador, dicionario, 'a', 99);

                expect(resultado).toBe(1);
                expect(dicionario).toEqual({ a: 1 });
            });

            it('Deve inserir e retornar o valor padrão quando a chave não existe', async () => {
                const dicionario = { a: 1 };
                const resultado = await primitivasDicionario
                    .popular
                    .implementacao(interpretador, dicionario, 'b', 99);

                expect(resultado).toBe(99);
                expect(dicionario).toEqual({ a: 1, b: 99 });
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('remover', () => {
        describe('Cenários de sucesso', () => {
            it('Deve remover a chave do dicionário e retornar verdadeiro', async () => {
                const dicionario = { a: 1, b: 2, c: 3 };
                const resultado = await primitivasDicionario
                    .remover
                    .implementacao(interpretador, dicionario, 'b');

                expect(resultado).toBe(true);
                expect(dicionario).toEqual({ a: 1, c: 3 });
            });
        });

        describe('Cenários de falha', () => {

        });
    });

    describe('valores', () => {
        describe('Cenários de sucesso', () => {
            it('Deve retornar um vetor com todos os valores do dicionário', async () => {
                const dicionario = { a: 1, b: 2, c: 3 };
                const resultado = await primitivasDicionario
                    .valores
                    .implementacao(interpretador, dicionario);

                expect(resultado).toEqual([1, 2, 3]);
            });
        });

        describe('Cenários de falha', () => {

        });
    });
});