import { Lexador } from '../../fontes/lexador';

import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

describe('Lexador', () => {
    describe('mapear()', () => {
        let lexador: Lexador;

        beforeEach(() => {
            lexador = new Lexador();
        });

        describe('Cenários de sucesso', () => {
            it('Vetor de código vazio', () => {
                const resultado = lexador.mapear([], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(0);
            });

            it('Código vazio', () => {
                const resultado = lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Ponto-e-vírgula, opcional', () => {
                const resultado = lexador.mapear([';;;;;;;;;;;;;;;;;;;;;'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(21);
            });

            it('Olá mundo', () => {
                const resultado = lexador.mapear(["escreva('Olá mundo')"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(4);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.ESCREVA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.PARENTESE_ESQUERDO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.TEXTO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.PARENTESE_DIREITO }),
                    ])
                );
            });

            it('Soma - Maior Igual', () => {
                const resultado = lexador.mapear(["var valor = 1", "valor += 2"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(7);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.VARIAVEL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IGUAL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.NUMERO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IDENTIFICADOR }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.MAIS_IGUAL }),
                    ])
                );
            });

            it('Subtração - Menor Igual', () => {
                const resultado = lexador.mapear(["var valor = 5", "valor -= 2"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(7);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.VARIAVEL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IDENTIFICADOR }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IGUAL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.NUMERO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.MENOS_IGUAL }),
                    ])
                );
            });

            it('Multiplicação Igual', () => {
                const resultado = lexador.mapear(["var valor = 5", "valor *= 2"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(7);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.VARIAVEL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IGUAL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.NUMERO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IDENTIFICADOR }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.MULTIPLICACAO_IGUAL }),
                    ])
                );
            });

            it('Diferente Igual', () => {
                const resultado = lexador.mapear(["1 != 2"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(3);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.NUMERO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.DIFERENTE }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.NUMERO }),
                    ])
                );
            });

            it('Divisão Igual', () => {
                const resultado = lexador.mapear(["var valor = 10", "valor /= 2"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(7);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.VARIAVEL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IDENTIFICADOR }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IGUAL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.NUMERO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.DIVISAO_IGUAL }),
                    ])
                );
            });

            it('Módulo Igual', () => {
                const resultado = lexador.mapear(["var valor = 5", "valor %= 2"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(7);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.VARIAVEL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IDENTIFICADOR }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IGUAL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.NUMERO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.MODULO_IGUAL }),
                    ])
                );
            });

            it('Seta Esquerda (operador de atribuição alternativo)', () => {
                const resultado = lexador.mapear(["var x <- 10", "var y <- 20"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(8);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.VARIAVEL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IDENTIFICADOR }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.SETA_ESQUERDA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.NUMERO }),
                    ])
                );
            });

            it('Comentários multilinha', () => {
                const resultado = lexador.mapear(["/* comentário ", "outro comentário*/"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(2);
                expect(resultado.simbolos[0].tipo).toBe(tiposDeSimbolos.LINHA_COMENTARIO);
                expect(resultado.simbolos[1].tipo).toBe(tiposDeSimbolos.LINHA_COMENTARIO);
            });

            it('Comentários de uma linha', () => {
                const resultado = lexador.mapear(["// comentário ", "// outro comentário"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(2);
                expect(resultado.simbolos[0].tipo).toBe(tiposDeSimbolos.COMENTARIO);
                expect(resultado.simbolos[1].tipo).toBe(tiposDeSimbolos.COMENTARIO);
            });

            it('Se', () => {
                const resultado = lexador.mapear(["se (1 == 1) { escreva('Tautologia') }"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(12);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.SE }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.ESCREVA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.PARENTESE_ESQUERDO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.TEXTO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.PARENTESE_DIREITO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.CHAVE_ESQUERDA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.CHAVE_DIREITA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IGUAL_IGUAL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.NUMERO }),
                    ])
                );
            });

            it('Operação Matemática (soma e igualdade)', () => {
                const resultado = lexador.mapear(['2 + 3 == 5'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(5);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.ADICAO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IGUAL_IGUAL }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.NUMERO }),
                    ])
                );
            });

            it('Atribução de variável e Operação Matemática (diferença, multiplicação e módulo)', () => {
                const resultado = lexador.mapear(['var numero = 1 * 2 - 3 % 4'], -1);

                expect(resultado).toBeTruthy();
            });

            it('Suporte a strings multilinha', () => {
                const resultado = lexador.mapear(
                    [
                        'escreva("a',
                        'b")'
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(4);

                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.ESCREVA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.PARENTESE_ESQUERDO }),
                        expect.objectContaining({
                            tipo: tiposDeSimbolos.TEXTO,
                            literal: 'a\nb'
                        }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.PARENTESE_DIREITO })
                    ])
                );
            });

            it('Suporte a símbolos de tabulação e quebra de linha dentro de texto', () => {
                const resultado = lexador.mapear(
                    [
                        '"a\tb\nc"'
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(1);
                expect(resultado.simbolos[0].lexema).toBe("a\tb\nc");
            });

            it('Operador Elvis', () => {
                const resultado = lexador.mapear(
                    [
                        'nulo ?: 123'
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(3);
                expect(resultado.simbolos[1].tipo).toBe(tiposDeSimbolos.ELVIS);
            });
        });

        describe('Cenários de falha', () => {
            it('Falha léxica - texto sem fim', () => {
                const resultado = lexador.mapear(['"texto sem fim'], -1);
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(1);
            });

            it('Falha léxica - caractere inesperado', () => {
                const resultado = lexador.mapear(['平'], -1);
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(1);
            });
        });
    });
});
