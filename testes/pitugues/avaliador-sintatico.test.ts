import { AvaliadorSintaticoPitugues } from "../../fontes/avaliador-sintatico/dialetos";
import { Logico } from "../../fontes/construtos";
import { Escreva } from "../../fontes/declaracoes";
import { LexadorPitugues } from "../../fontes/lexador/dialetos";

describe('Avaliador sintático (Pituguês)', () => {
    describe('analisar()', () => {
        let lexador: LexadorPitugues;
        let avaliadorSintatico: AvaliadorSintaticoPitugues;

        beforeEach(() => {
            lexador = new LexadorPitugues();
            avaliadorSintatico = new AvaliadorSintaticoPitugues();
        });

        describe('Casos de sucesso', () => {
            it('Olá Mundo', () => {
                const retornoLexador = lexador.mapear(
                    ["escreva('Olá mundo')"],
                    -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Olá Mundo (Imprima)', () => {
                const retornoLexador = lexador.mapear(
                    ["imprima('Olá mundo')"],
                    -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Atribuição com soma', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'imprima(2 + 2)',
                        'a = 2',
                        'imprima(a += 2)',
                        'imprima(a)'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });

            describe('Operações lógicas', () => {
                it('Diferente', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'imprima(1 != 1)'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Contém', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'a = [1, 2, 3, 4, 5]',
                            'escreva(a contém 3)'
                        ],
                        -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Logico);
                });

                it('Não contém', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'a = [1, 2, 3, 4, 5]',
                            'escreva(a não contém 3)'
                        ],
                        -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Logico);
                    const contem = escreva.argumentos[0] as Logico;
                    expect(contem.negado).toBe(true);
                });
            });

            describe('Para cada', () => {
                it('Trivial', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'vetor = [1, 2, 3]',
                            'para cada elemento de vetor:',
                            '    escreva(elemento)'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Iterando texto', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'texto1 = "Texto"',
                            'para cada item em texto1:',
                            '    imprima(item)'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            it('Lista de Compreensão', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'lista = [1, 2, 3, 4, 5]',
                        'minhaListaCompreensao = [x para cada x em lista se x % 2 == 0] # Lista de compreensão para números pares'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            describe('Se ternário', () => {
                it('Trivial', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'idade = 20',
                            'categoria = "Adulto" se idade >= 18 senão "Menor de idade"'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            it('Comentário antes de se', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'a = 1',
                        '# Comentário',
                        'se a > 0:',
                        '    escreva("Teste")',
                        '    a = 10',
                        'escreva(a)'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });

            describe('Ponto e vírgula - Usos permitidos', () => {
                it('Múltiplos comandos na mesma linha - escreva', () => {
                    const retornoLexador = lexador.mapear(
                        ["escreva('a'); escreva('b')"],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Múltiplos comandos na mesma linha - variáveis', () => {
                    const retornoLexador = lexador.mapear(
                        ["x = 1; y = 2"],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Múltiplos tipos de comandos na mesma linha', () => {
                    const retornoLexador = lexador.mapear(
                        ["a = 1; escreva(a); b = a + 1"],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
            });

            describe('Declarações implícitas', () => {
                it('Declarações implícitas seguidas', () => {
                    const retornoLexador = lexador.mapear(['a, b, c = 1, 2, 3'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                })

                it('Reatribuição de variável declarada implicitamente', () => {
                    const retornoLexador = lexador.mapear(['a = 10', 'a = 20'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Escopo aninhado com declaração implícita', () => {
                    const retornoLexador = lexador.mapear([
                        'a = 1',
                        'se verdadeiro:',
                        '    b = 2',
                        '    escreva(a + b)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Declaração implícita com diferentes tipos', () => {
                    const retornoLexador = lexador.mapear([
                        'a = 1',
                        'b = "texto"',
                        'c = [1, 2, 3]',
                        'd = verdadeiro',
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
                });

                it('Variável sombreando variável externa', () => {
                    const retornoLexador = lexador.mapear([
                        'a = "global"',
                        'se verdadeiro:',
                        '    a = "local"',
                        '    escreva(a)',
                        'escreva(a)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
            });
        });

        describe('Casos de falha', () => {
            it('Falha - Indentação', () => {
                const codigo = ['classe Cachorro:', 'funcao latir():', "escreva('Erro')"];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Falha - Ponto e Vírgula', () => {
                const codigo = [
                    "escreva('teste');",
                    "a = 1;",
                    "x = 1; #comentário"
                ];

                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(3);

                expect(retornoAvaliadorSintatico.erros[0].simbolo.linha).toBe(1);
                expect(retornoAvaliadorSintatico.erros[1].simbolo.linha).toBe(2);
                expect(retornoAvaliadorSintatico.erros[2].simbolo.linha).toBe(3);

                const mensagemEsperada = 'Ponto e vírgula (;) não é permitido no final da sentença de código.';
                expect(retornoAvaliadorSintatico.erros[0].message).toContain(mensagemEsperada);
            });

            it('Falha - Uso de "var" como palavra-chave', () => {
                const retornoLexador = lexador.mapear(['var a = 10'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            it('Falha - criação de variável sem valor de forma implícita', () => {
                const codigo = ['a = '];

                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            })
        });
    });
});
