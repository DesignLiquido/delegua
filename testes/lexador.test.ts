import { Delegua } from '../src/delegua';

describe('Lexador', () => {
    describe('mapear()', () => {
        const delegua = new Delegua('delegua');

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio', () => {
                const resultado = delegua.lexador.mapear('');

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(0);
            });

            it('Sucesso - Ponto-e-vírgula, opcional', () => {
                const resultado = delegua.lexador.mapear(
                    ';;;;;;;;;;;;;;;;;;;;;'
                );

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(0);
            });

            it('Sucesso - Olá mundo', () => {
                const resultado = delegua.lexador.mapear("esceva('Olá mundo')");

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(4);
                expect(resultado).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'IDENTIFICADOR' }),
                        expect.objectContaining({ tipo: 'PARENTESE_ESQUERDO' }),
                        expect.objectContaining({ tipo: 'TEXTO' }),
                        expect.objectContaining({ tipo: 'PARENTESE_DIREITO' }),
                    ])
                );
            });

            it('Sucesso - Se', () => {
                const resultado = delegua.lexador.mapear(
                    "se (1 == 1) { esceva('Tautologia') }"
                );

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(12);
                expect(resultado).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'SE' }),
                        expect.objectContaining({ tipo: 'IDENTIFICADOR' }),
                        expect.objectContaining({ tipo: 'PARENTESE_ESQUERDO' }),
                        expect.objectContaining({ tipo: 'TEXTO' }),
                        expect.objectContaining({ tipo: 'PARENTESE_DIREITO' }),
                        expect.objectContaining({ tipo: 'CHAVE_ESQUERDA' }),
                        expect.objectContaining({ tipo: 'CHAVE_DIREITA' }),
                        expect.objectContaining({ tipo: 'IGUAL_IGUAL' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                    ])
                );
            });

            it('Sucesso - Operação Matemática (soma e igualdade)', () => {
                const resultado = delegua.lexador.mapear('2 + 3 == 5');

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(5);
                expect(resultado).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'ADICAO' }),
                        expect.objectContaining({ tipo: 'IGUAL_IGUAL' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                    ])
                );
            });

            it('Sucesso - Atribução de variável e Operação Matemática (diferença, multiplicação e módulo)', () => {
                const resultado = delegua.lexador.mapear('var numero = 1 * 2 - 3 % 4');

                expect(resultado).toBeTruthy();
            });
        });

        describe('Cenários de falha', () => {
            it('Falha léxica - texto sem fim', () => {
                const resultado = delegua.lexador.mapear('"texto sem fim');
                expect(resultado).toHaveLength(0);
                expect(delegua.teveErro).toBe(true);
            });

            it('Falha léxica - caractere inesperado', () => {
                const resultado = delegua.lexador.mapear('平');
                expect(resultado).toHaveLength(0);
                expect(delegua.teveErro).toBe(true);
            });
        });
    });
});
