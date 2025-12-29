import { AvaliadorSintaticoPitugues } from "../../../../fontes/avaliador-sintatico";
import { LexadorPitugues } from "../../../../fontes/lexador";
import { InterpretadorPitugues } from "../../../../fontes/interpretador/dialetos/pitugues"

describe('Interpretador (Pituguês)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPitugues;
        let avaliadorSintatico: AvaliadorSintaticoPitugues;
        let interpretador: InterpretadorPitugues;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        }

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorPitugues();
            avaliadorSintatico = new AvaliadorSintaticoPitugues();
            interpretador = new InterpretadorPitugues(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        describe('Escopo de variáveis (LEGB)', () => {
            it('Atribuição dentro de função cria variável local, não modifica global', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'x = 10',
                        '',
                        'funcao teste():',
                        '    x = 5',
                        '    escreva(x)',
                        '',
                        'teste()',
                        'escreva(x)'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe('5');
                expect(_saidas[1]).toBe('10');
            });

            it('Múltiplas atribuições locais não afetam escopo global', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'a = 100',
                        'b = 200',
                        '',
                        'funcao modificar():',
                        '    a = 1',
                        '    b = 2',
                        '    escreva(a)',
                        '    escreva(b)',
                        '',
                        'modificar()',
                        'escreva(a)',
                        'escreva(b)'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(4);
                expect(_saidas[0]).toBe('1');   // Local a
                expect(_saidas[1]).toBe('2');   // Local b
                expect(_saidas[2]).toBe('100'); // Global a
                expect(_saidas[3]).toBe('200'); // Global b
            });

            it('Leitura de variável global sem atribuição local funciona', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'y = 42',
                        '',
                        'funcao ler():',
                        '    escreva(y)',
                        '',
                        'ler()'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('42');
            });

            it('Escopo aninhado: funções dentro de funções', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'z = 999',
                        '',
                        'funcao externa():',
                        '    z = 111',
                        '    funcao interna():',
                        '        z = 222',
                        '        escreva(z)',
                        '    interna()',
                        '    escreva(z)',
                        '',
                        'externa()',
                        'escreva(z)'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(3);
                expect(_saidas[0]).toBe('222');
                expect(_saidas[1]).toBe('111');
                expect(_saidas[2]).toBe('999');
            });

            it('Parâmetros de função criam variáveis locais', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'param = 50',
                        '',
                        'funcao comParametro(param):',
                        '    escreva(param)',
                        '    param = 25',
                        '    escreva(param)',
                        '',
                        'comParametro(77)',
                        'escreva(param)'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(3);
                expect(_saidas[0]).toBe('77'); // Parâmetro recebido
                expect(_saidas[1]).toBe('25'); // Parâmetro modificado localmente
                expect(_saidas[2]).toBe('50'); // Global permanece inalterado
            });

            it('Atribuição local seguida de leitura funciona corretamente', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'contador = 0',
                        '',
                        'funcao incrementar():',
                        '    contador = 1',
                        '    contador = contador + 1',
                        '    escreva(contador)',
                        '',
                        'incrementar()',
                        'escreva(contador)'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe('2');
                expect(_saidas[1]).toBe('0');
            });

            it('Modificação via atribuição composta em escopo local', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'valor = 100',
                        '',
                        'funcao processar():',
                        '    valor = 10',
                        '    valor = valor * 2',
                        '    escreva(valor)',
                        '',
                        'processar()',
                        'escreva(valor)'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe('20');
                expect(_saidas[1]).toBe('100');
            });
        });

        describe('Métodos de primitivas com dependência no interpretador', () => {
            describe('Números', () => {
                it('absoluto', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'imprima(-5.absoluto())',
                            'imprima(3.absoluto())',
                            'imprima(0.absoluto())',
                            'imprima(-6.absoluto())',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(4);
                    expect(_saidas[0]).toBe('5');
                    expect(_saidas[1]).toBe('3');
                    expect(_saidas[2]).toBe('0');
                    expect(_saidas[3]).toBe('6');
                });
            });
        });
    });
});
