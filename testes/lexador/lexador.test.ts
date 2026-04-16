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

            it('Asserção com e sem acento', () => {
                const resultado = lexador.mapear(['assercao verdadeiro', 'asserção falso'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.ASSERCAO, lexema: 'assercao' }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.ASSERCAO, lexema: 'asserção' }),
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

            describe('Sequências de escape em texto', () => {
                it('\\n dentro de string literal vira nova linha', () => {
                    const resultado = lexador.mapear(['"Hello\\nWorld"'], -1);

                    expect(resultado.erros).toHaveLength(0);
                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].literal).toBe('Hello\nWorld');
                });

                it('\\t dentro de string literal vira tabulação', () => {
                    const resultado = lexador.mapear(['"Hello\\tWorld"'], -1);

                    expect(resultado.erros).toHaveLength(0);
                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].literal).toBe('Hello\tWorld');
                });

                it('\\r dentro de string literal vira retorno de carro', () => {
                    const resultado = lexador.mapear(['"Hello\\rWorld"'], -1);

                    expect(resultado.erros).toHaveLength(0);
                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].literal).toBe('Hello\rWorld');
                });

                it('\\b dentro de string literal vira retrocesso', () => {
                    const resultado = lexador.mapear(['"Hello\\bWorld"'], -1);

                    expect(resultado.erros).toHaveLength(0);
                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].literal).toBe('Hello\bWorld');
                });

                it('\\\\ dentro de string literal vira barra invertida', () => {
                    const resultado = lexador.mapear(['"Hello\\\\World"'], -1);

                    expect(resultado.erros).toHaveLength(0);
                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].literal).toBe('Hello\\World');
                });

                it('\\" dentro de string literal vira aspas duplas', () => {
                    const resultado = lexador.mapear(['"Hello\\"World"'], -1);

                    expect(resultado.erros).toHaveLength(0);
                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].literal).toBe('Hello"World');
                });

                it('\\e dentro de string literal vira caractere ESC (ANSI)', () => {
                    const resultado = lexador.mapear(['"\\e[31m"'], -1);

                    expect(resultado.erros).toHaveLength(0);
                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].literal).toBe('\x1B[31m');
                });

                it('\\xNN dentro de string literal vira o caractere correspondente', () => {
                    const resultado = lexador.mapear(['"\\x41"'], -1); // 0x41 = 'A'

                    expect(resultado.erros).toHaveLength(0);
                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].literal).toBe('A');
                });

                it('\\x1B dentro de string literal vira ESC (ANSI)', () => {
                    const resultado = lexador.mapear(['"\\x1B[31m"'], -1);

                    expect(resultado.erros).toHaveLength(0);
                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].literal).toBe('\x1B[31m');
                });

                it('Barra invertida no fim de linha dentro de string não insere NUL', () => {
                    const resultado = lexador.mapear(['"Hello\\', 'World"'], -1);

                    expect(resultado.erros).toHaveLength(0);
                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].literal).not.toContain('\0');
                });

                it('Múltiplas sequências de escape em uma mesma string', () => {
                    const resultado = lexador.mapear(['"a\\tb\\nc"'], -1);

                    expect(resultado.erros).toHaveLength(0);
                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].literal).toBe('a\tb\nc');
                });
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

        describe('Informações de coluna (colunaInicio e colunaFim)', () => {
            it('Identificador simples - colunaInicio e colunaFim corretas', () => {
                const resultado = lexador.mapear(['var x = 10'], -1);

                expect(resultado).toBeTruthy();
                // 'var' na coluna 1-3
                expect(resultado.simbolos[0]).toEqual(
                    expect.objectContaining({
                        tipo: tiposDeSimbolos.VARIAVEL,
                        colunaInicio: 1,
                        colunaFim: 3,
                    })
                );
                // 'x' na coluna 5
                expect(resultado.simbolos[1]).toEqual(
                    expect.objectContaining({
                        tipo: tiposDeSimbolos.IDENTIFICADOR,
                        colunaInicio: 5,
                        colunaFim: 5,
                    })
                );
                // '=' na coluna 7
                expect(resultado.simbolos[2]).toEqual(
                    expect.objectContaining({
                        tipo: tiposDeSimbolos.IGUAL,
                        colunaInicio: 7,
                        colunaFim: 7,
                    })
                );
                // '10' na coluna 9-10
                expect(resultado.simbolos[3]).toEqual(
                    expect.objectContaining({
                        tipo: tiposDeSimbolos.NUMERO,
                        colunaInicio: 9,
                        colunaFim: 10,
                    })
                );
            });

            it('Operadores compostos - colunaInicio e colunaFim corretas', () => {
                const resultado = lexador.mapear(['a >= b'], -1);

                expect(resultado).toBeTruthy();
                // 'a' na coluna 1
                expect(resultado.simbolos[0]).toEqual(
                    expect.objectContaining({
                        tipo: tiposDeSimbolos.IDENTIFICADOR,
                        colunaInicio: 1,
                        colunaFim: 1,
                    })
                );
                // '>=' na coluna 3-4
                expect(resultado.simbolos[1]).toEqual(
                    expect.objectContaining({
                        tipo: tiposDeSimbolos.MAIOR_IGUAL,
                        colunaInicio: 3,
                        colunaFim: 4,
                    })
                );
                // 'b' na coluna 6
                expect(resultado.simbolos[2]).toEqual(
                    expect.objectContaining({
                        tipo: tiposDeSimbolos.IDENTIFICADOR,
                        colunaInicio: 6,
                        colunaFim: 6,
                    })
                );
            });

            it('Texto (string) - colunaInicio e colunaFim corretas', () => {
                const resultado = lexador.mapear(['"ola"'], -1);

                expect(resultado).toBeTruthy();
                // '"ola"' abrange colunas 1-5
                expect(resultado.simbolos[0]).toEqual(
                    expect.objectContaining({
                        tipo: tiposDeSimbolos.TEXTO,
                        colunaInicio: 1,
                        colunaFim: 5,
                    })
                );
            });

            it('Múltiplas linhas - cada linha tem colunas independentes', () => {
                const resultado = lexador.mapear(['var a = 1', 'var b = 2'], -1);

                expect(resultado).toBeTruthy();
                // Primeira linha: 'var' col 1-3, 'a' col 5, '=' col 7, '1' col 9
                expect(resultado.simbolos[0]).toEqual(
                    expect.objectContaining({
                        tipo: tiposDeSimbolos.VARIAVEL,
                        linha: 1,
                        colunaInicio: 1,
                        colunaFim: 3,
                    })
                );
                // Segunda linha: 'var' col 1-3 (coluna reinicia)
                expect(resultado.simbolos[4]).toEqual(
                    expect.objectContaining({
                        tipo: tiposDeSimbolos.VARIAVEL,
                        linha: 2,
                        colunaInicio: 1,
                        colunaFim: 3,
                    })
                );
            });

            it('Número decimal - colunaInicio e colunaFim corretas', () => {
                const resultado = lexador.mapear(['3.14'], -1);

                expect(resultado).toBeTruthy();
                // '3.14' na coluna 1-4
                expect(resultado.simbolos[0]).toEqual(
                    expect.objectContaining({
                        tipo: tiposDeSimbolos.NUMERO,
                        colunaInicio: 1,
                        colunaFim: 4,
                    })
                );
            });

            it('Palavra reservada `estrangeira` é reconhecida como token ESTRANGEIRA', () => {
                const resultado = lexador.mapear(['classe estrangeira Modelo {}'], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.CLASSE }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.ESTRANGEIRA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IDENTIFICADOR, lexema: 'Modelo' }),
                    ])
                );
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
