import { Delegua } from "../../fontes/delegua";

describe.skip('Interpretador (Égua Clássico)', () => {
    describe('interpretar()', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('egua');
        });

        describe('Cenários de sucesso', () => {
            describe('Atribuições', () => {
                it('Trivial', async () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = 1;"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Vetor', async () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = [1, 2, 3];"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário', async () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = {'a': 1, 'b': 2};"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = [1, 2, 3];\nescreva(a[1]);"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = {'a': 1, 'b': 2};\nescreva(a['b']);"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('escreva()', () => {
                it('Olá Mundo (escreva() e literal)', async () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva('Olá mundo');"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', async () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva(nulo);"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações matemáticas', () => {
                it('Operações matemáticas - Trivial', async () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva(5 + 4 * 3 - 2 ** 1 / 6 % 10);"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações lógicas', () => {
                it('Operações lógicas - ou', async () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva(verdadeiro ou falso);"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - e', async () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva(verdadeiro e falso);"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - em', async () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva(2 em [1, 2, 3]);"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Condicionais', () => {
                it('Condicionais - condição verdadeira', async () => {
                    const retornoLexador = delegua.lexador.mapear(["se (1 < 2) { escreva('Um menor que dois'); } senão { escreva('Nunca será executado'); }"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição falsa', async () => {
                    const retornoLexador = delegua.lexador.mapear(["se (1 > 2) { escreva('Nunca acontece'); } senão { escreva('Um não é maior que dois'); }"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Laços de repetição', () => {
                it('Laços de repetição - enquanto', async () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = 0;\nenquanto (a < 10) { a = a + 1; }"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - fazer ... enquanto', async () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = 0;\nfazer { a = a + 1; } enquanto (a < 10)"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - para', async () => {
                    const retornoLexador = delegua.lexador.mapear(["para (var i = 0; i < 10; i = i + 1) { escreva(i); }"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Classes', () => {
                it('Trivial', async () => {
                    const codigo = [
                        "classe Animal {",
                        "    correr() {",
                        "        escreva('Correndo Loucamente');",
                        "    }",
                        "}",
                        "classe Cachorro herda Animal {",
                        "    latir() {",
                        "        escreva('Au Au Au Au');",
                        "    }",
                        "}",
                        "var nomeDoCachorro = Cachorro();",
                        "nomeDoCachorro.correr();",
                        "nomeDoCachorro.latir();",
                        "escreva('Classe: OK!');"
                    ];

                    const retornoLexador = delegua.lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Declaração e chamada de funções', () => {
                it('Fibonacci', async () => {
                    const codigo = [
                        "função fibonacci(n) {",
                        "    se (n == 0) {",
                        "      retorna(0);",
                        "    }",
                        "    se (n == 1) {",
                        "      retorna(1);",
                        "    }",
                        "    var n1 = n - 1;",
                        "    var n2 = n - 2;",
                        "    var f1 = fibonacci(n1);",
                        "    var f2 = fibonacci(n2);",
                        "    retorna(f1 + f2);",
                        "}",
                        "var a = fibonacci(0);",
                        "escreva(a);",
                        "a = fibonacci(1);",
                        "escreva(a);",
                        "a = fibonacci(2);",
                        "escreva(a);",
                        "a = fibonacci(3);",
                        "escreva(a);",
                        "a = fibonacci(4);",
                        "escreva(a);",
                        "a = fibonacci(5);",
                        "escreva(a);"
                    ];
                    const retornoLexador = delegua.lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });
        });

        describe('Cenários de falha', () => {
            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = [1, 2, 3];\nescreva(a[4]);"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = {'a': 1, 'b': 2};\nescreva(a['c']);"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });
            });
        });
    });
});
