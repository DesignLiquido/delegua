import { LexadorPitugues } from '../../fontes/lexador/dialetos';

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
        });
    });
});
