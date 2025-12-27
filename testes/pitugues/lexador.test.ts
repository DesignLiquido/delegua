import { LexadorPitugues } from '../../fontes/lexador/dialetos';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/pitugues';

describe('Lexador (Pituguês)', () => {
    describe('mapear()', () => {
        let lexador: LexadorPitugues;

        beforeEach(() => {
            lexador = new LexadorPitugues();
        });

        describe('Cenários de sucesso', () => {
            it('Código vazio', () => {
                const resultado = lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.erros).toHaveLength(0);
            });

            it('Olá mundo', () => {
                const resultado = lexador.mapear(
                    ["escreva('Olá mundo')"],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(4);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'ESCREVA' }),
                        expect.objectContaining({ tipo: 'PARENTESE_ESQUERDO' }),
                        expect.objectContaining({ tipo: 'TEXTO' }),
                        expect.objectContaining({ tipo: 'PARENTESE_DIREITO' }),
                    ])
                );
            });

            it('Operação Matemática (soma e igualdade)', () => {
                const resultado = lexador.mapear(['2 + 3 == 5'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(5);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'ADICAO' }),
                        expect.objectContaining({ tipo: 'IGUAL_IGUAL' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                    ])
                );
            });

            it('Atribução de variável e Operação Matemática (diferença, multiplicação e módulo)', () => {
                const resultado = lexador.mapear(
                    ['numero = 1 * 2 - 3 % 4'],
                    -1
                );

                expect(resultado).toBeTruthy();
            });

            describe('Textos', () => {
                it('Texto multilinha com aspas duplas', async () => {
                    const retornoLexador = lexador.mapear([
                        '"""Era uma vez, em um lugar distante,',
                        'viviam pessoas felizes e trabalhadoras,',
                        'que dedicavam seus dias à construção de um futuro melhor,',
                        'sempre acreditando na força da união."""',
                    ], -1);

                    expect(retornoLexador.erros).toHaveLength(0);
                    expect(retornoLexador.simbolos).toHaveLength(1);
                    expect(retornoLexador.simbolos[0].lexema).toBe(
                        'Era uma vez, em um lugar distante,\n' +
                        'viviam pessoas felizes e trabalhadoras,\n' +
                        'que dedicavam seus dias à construção de um futuro melhor,\n' +
                        'sempre acreditando na força da união.'
                    );
                });

                it('Texto multilinha com aspas simples', async () => {
                    const retornoLexador = lexador.mapear([
                        "'''A jornada começou antes do amanhecer,",
                        "quando o vento frio soprava pelas montanhas,",
                        "e o silêncio da natureza acompanhava cada passo,",
                        "revelando a beleza escondida do caminho.'''"
                    ], -1);

                    expect(retornoLexador.erros).toHaveLength(0);
                    expect(retornoLexador.simbolos).toHaveLength(1);
                    expect(retornoLexador.simbolos[0].lexema).toBe(
                        'A jornada começou antes do amanhecer,\n' +
                        'quando o vento frio soprava pelas montanhas,\n' +
                        'e o silêncio da natureza acompanhava cada passo,\n' +
                        'revelando a beleza escondida do caminho.'
                    );
                });
            });


            it('Vetor (Lista de Compreensão)', () => {
                const resultado = lexador.mapear(
                    [
                        'lista = [1, 2, 3, 4, 5]',
                        'minhaListaCompreensao = [x para cada x em lista se x % 2 == 0] # Lista de compreensão para números pares'
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
            });

            it('docstrings simples com aspas duplas', async () => {
                const codigo = [
                    'classe Cachorro:',
                    '    """',
                    '    Esta é uma docstring de exemplo.',
                    '    """',
                    '    latir():',
                    "        escreva('Au Au!')",
                    'ex = Cachorro()',
                    'ex.latir()',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                expect(retornoLexador.erros).toHaveLength(0);
                expect(retornoLexador.simbolos).toHaveLength(22);
            });

            it('docstrings simples com aspas simples', async () => {
                const codigo = [
                    'classe Gato:',
                    "    '''",
                    '    Esta é uma docstring de exemplo.',
                    "    '''",
                    '    miar():',
                    "        escreva('Miau!')",
                    'ex = Gato()',
                    'ex.miar()',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                expect(retornoLexador.erros).toHaveLength(0);
                expect(retornoLexador.simbolos).toHaveLength(22);
            });

            it('Docstrings em métodos e classes', async () => {
                const codigo = [
                    'classe Pessoa:',
                    '    """',
                    '    Esta é a docstring da classe Pessoa.',
                    '    """',
                    '    saudacao():',
                    '        """',
                    '        Esta é a docstring do método saudacao.',
                    '        """',
                    '        escreva("Olá!")',
                    '',
                    'p = Pessoa()',
                    'p.saudacao()',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                expect(retornoLexador.erros).toHaveLength(0);
                expect(retornoLexador.simbolos).toHaveLength(23);
            });

            it('"var" deve ser tratado como identificador, não como palavra reservada', () => {
                const retornoLexador = lexador.mapear(['var = 10'], -1);

                expect(retornoLexador.simbolos[0].tipo).toBe('IDENTIFICADOR');
                expect(retornoLexador.simbolos[0].lexema).toBe('var');
                expect(retornoLexador.erros).toHaveLength(0);
            });

            describe('Interpolação (f-string)', () => {
                it('Deve reconhecer f-string com aspas duplas', () => {
                    const codigo = ['f"Olá {nome}"'];
                    const resultado = lexador.mapear(codigo, -1);

                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].tipo).toBe(tiposDeSimbolos.INTERPOLACAO);
                    expect(resultado.simbolos[0].lexema).toBe('Olá {nome}');
                });

                it('Deve reconhecer f-string com aspas simples', () => {
                    const codigo = ["f'Teste {1}'"];
                    const resultado = lexador.mapear(codigo, -1);

                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].tipo).toBe(tiposDeSimbolos.INTERPOLACAO);
                });

                it('Não deve confundir variável f com f-string', () => {
                    const codigo = ['f = 10'];
                    const resultado = lexador.mapear(codigo, -1);

                    expect(resultado.simbolos[0].tipo).toBe(tiposDeSimbolos.IDENTIFICADOR);
                    expect(resultado.simbolos[0].lexema).toBe('f');
                });
            });

            it('Deve mapear operadores compostos corretamente', () => {
                const codigo = ['+= -= *= /='];
                const resultado = lexador.mapear(codigo, -1);

                expect(resultado.simbolos).toHaveLength(4);
                expect(resultado.simbolos[0].tipo).toBe('MAIS_IGUAL');
                expect(resultado.simbolos[1].tipo).toBe('MENOS_IGUAL');
                expect(resultado.simbolos[2].tipo).toBe('MULTIPLICACAO_IGUAL');
                expect(resultado.simbolos[3].tipo).toBe('DIVISAO_IGUAL');
            });

            it('Deve mapear caractere de escape \\r (quebra de linha)', () => {
                const codigo = ['t = "linha 1\\rlinha 2"'];
                const resultado = lexador.mapear(codigo, -1);

                expect(resultado.simbolos[2].tipo).toBe('TEXTO');
                expect(resultado.simbolos[2].literal).toBe('linha 1\rlinha 2');
            });

            it('Deve mapear caractere de escape \\b (backspace)', () => {
                const codigo = ['t = "texto\\b"'];
                const resultado = lexador.mapear(codigo, -1);

                expect(resultado.simbolos[2].literal).toBe('texto\b');
            });

            it('Deve mapear aspas duplas escapadas dentro de string com aspas duplas', () => {
                const codigo = ['t = "Ela disse \\"Oi\\""'];
                const resultado = lexador.mapear(codigo, -1);

                expect(resultado.simbolos[2].literal).toBe('Ela disse "Oi"');
            });

            it('Deve mapear aspas simples escapadas dentro de string com aspas simples', () => {
                const codigo = ["t = 'D\\'agua'"];
                const resultado = lexador.mapear(codigo, -1);

                expect(resultado.simbolos[2].literal).toBe("D'agua");
            });

            it('Deve mapear barra invertida literal (\\\\)', () => {
                const codigo = ['caminho = "C:\\\\Windows"'];
                const resultado = lexador.mapear(codigo, -1);

                expect(resultado.simbolos[2].literal).toBe('C:\\Windows');
            });

            it('Deve mapear múltiplos escapes na mesma string', () => {
                const codigo = ['t = "L1\\nL2\\tTab"'];
                const resultado = lexador.mapear(codigo, -1);

                expect(resultado.simbolos[2].literal).toBe('L1\nL2\tTab');
            });
        });

        describe('Cenários de falha', () => {
            it('Falha léxica - texto sem fim', () => {
                const resultado = lexador.mapear(
                    ['"texto sem fim'],
                    -1
                );
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(1);
            });

            it('Falha léxica - caractere inesperado', () => {
                const resultado = lexador.mapear(['平'], -1);
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(1);
            });

            it('Texto multilinha não finalizado', async () => {
                const retornoLexador = lexador.mapear([
                    '"""Era uma vez, em um lugar distante,',
                    'viviam pessoas felizes e trabalhadoras,'
                ], -1);

                expect(retornoLexador.erros).toHaveLength(1);
                expect(retornoLexador.simbolos).toHaveLength(0);
            });

            describe('Interpolação (f-string)', () => {
                it('String de interpolação não fechada', () => {
                    const codigo = ['f"Olá {nome}'];
                    const resultado = lexador.mapear(codigo, -1);

                    expect(resultado.erros).toHaveLength(1);
                    expect(resultado.erros[0].mensagem).toBe('Texto não finalizado.');
                });

                it('Tentativa de interpolação sem o prefixo "f" (deve ser string normal)', () => {
                    const codigo = ['"Olá {nome}"'];
                    const resultado = lexador.mapear(codigo, -1);

                    expect(resultado.simbolos).toHaveLength(1);
                    expect(resultado.simbolos[0].tipo).toBe(tiposDeSimbolos.TEXTO);
                    expect(resultado.simbolos[0].lexema).toBe('Olá {nome}');
                });

                it('Tentativa de interpolação com prefixo minúsculo (f"...") seguido de símbolo inválido', () => {
                    const codigo = ['fa"Olá"'];
                    const resultado = lexador.mapear(codigo, -1);

                    expect(resultado.simbolos).toHaveLength(2);
                    expect(resultado.simbolos[0].tipo).toBe(tiposDeSimbolos.IDENTIFICADOR);
                    expect(resultado.simbolos[0].lexema).toBe('fa');
                    expect(resultado.simbolos[1].tipo).toBe(tiposDeSimbolos.TEXTO);
                });
            });

            it('Deve falhar ao terminar o código com uma string aberta', () => {
                const codigo = ['t = "Texto sem fechar'];
                const resultado = lexador.mapear(codigo, -1);

                expect(resultado.erros.length).toBeGreaterThan(0);
                expect(resultado.erros[0].mensagem).toBe('Texto não finalizado.');
            });

            it('Deve falhar se a aspa de fechamento for escapada', () => {
                const codigo = ['t = "texto\\"'];
                const resultado = lexador.mapear(codigo, -1);

                expect(resultado.erros.length).toBeGreaterThan(0);
                expect(resultado.erros[0].mensagem).toBe('Texto não finalizado.');
            });

            it('Deve manter a barra se o caractere de escape for desconhecido', () => {
                const codigo = ['t = "\\z"'];
                const resultado = lexador.mapear(codigo, -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos[2].literal).toBe('\\z');
            });
        });
    });
});
