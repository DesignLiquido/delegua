import { Delegua } from "../../src/delegua";

describe('Lexador (Égua Clássico)', () => {
    describe('mapear()', () => {
        const delegua = new Delegua('egua');

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio', () => {
                const resultado = delegua.lexador.mapear(['']);

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(1);
            });

            it('Sucesso - Ponto-e-vírgula, obrigatório', () => {
                const resultado = delegua.lexador.mapear([';;;;;;;;;;;;;;;;;;;;;']);

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(22);
            });

            it('Sucesso - Olá mundo', () => {
                const resultado = delegua.lexador.mapear(["escreva('Olá mundo');"]);

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(6);
                expect(resultado).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'ESCREVA' }),
                        expect.objectContaining({ tipo: 'PARENTESE_ESQUERDO' }),
                        expect.objectContaining({ tipo: 'TEXTO' }),
                        expect.objectContaining({ tipo: 'PARENTESE_DIREITO' }),
                        expect.objectContaining({ tipo: 'PONTO_E_VIRGULA' }),
                    ])
                );
            });

            it('Sucesso - Se', () => {
                const resultado = delegua.lexador.mapear(["se (1 == 1) { escreva('Tautologia'); }"]);

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(14);
                expect(resultado).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'SE' }),
                        expect.objectContaining({ tipo: 'ESCREVA' }),
                        expect.objectContaining({ tipo: 'PARENTESE_ESQUERDO' }),
                        expect.objectContaining({ tipo: 'TEXTO' }),
                        expect.objectContaining({ tipo: 'PARENTESE_DIREITO' }),
                        expect.objectContaining({ tipo: 'CHAVE_ESQUERDA' }),
                        expect.objectContaining({ tipo: 'CHAVE_DIREITA' }),
                        expect.objectContaining({ tipo: 'IGUAL_IGUAL' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'PONTO_E_VIRGULA' }),
                    ])
                );
            });

            it('Sucesso - Operação Matemática (soma e igualdade)', () => {
                const resultado = delegua.lexador.mapear(['2 + 3 == 5;']);

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(7);
                expect(resultado).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'ADICAO' }),
                        expect.objectContaining({ tipo: 'IGUAL_IGUAL' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'PONTO_E_VIRGULA' }),
                    ])
                );
            });

            it('Sucesso - Atribução de variável e Operação Matemática (diferença, multiplicação e módulo)', () => {
                const resultado = delegua.lexador.mapear(['var numero = 1 * 2 - 3 % 4;']);

                expect(resultado).toBeTruthy();
            });
        });

        describe('Cenários de falha', () => {
            it('Falha léxica - texto sem fim', () => {
                const resultado = delegua.lexador.mapear(['"texto sem fim']);
                expect(resultado).toHaveLength(1);
                expect(delegua.teveErro).toBe(true);
            });

            it('Falha léxica - caractere inesperado', () => {
                const resultado = delegua.lexador.mapear(['平']);
                expect(resultado).toHaveLength(1);
                expect(delegua.teveErro).toBe(true);
            });
        });
    });
});
