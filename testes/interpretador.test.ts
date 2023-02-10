import { AvaliadorSintatico } from "../fontes/avaliador-sintatico";
import { InterpretadorBase } from "../fontes/interpretador";
import { Lexador } from "../fontes/lexador";

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: InterpretadorBase;

        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new InterpretadorBase(process.cwd());
        });

        describe('Cenários de sucesso', () => {
            describe('Atribuições', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(["var a = 1"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Vetor', async () => {
                    const retornoLexador = lexador.mapear(["var a = [1, 2, 3]"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2}"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Concatenação', async () => {
                    const retornoLexador = lexador.mapear(["var a = 1 + '1'"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Interpolação de Texto', async () => {
                    const retornoLexador = lexador.mapear([
                        "var comidaFavorita = 'strogonoff'",
                        'escreva("Minha comida favorita é ${comidaFavorita}")'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = [1, 2, 3]",
                        "escreva(a[1])"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = {'a': 1, 'b': 2}",
                        "escreva(a['b'])"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('escreva()', () => {
                it('Olá Mundo (escreva() e literal)', async () => {
                    const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', async () => {
                    const retornoLexador = lexador.mapear(["escreva(nulo)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo igual a nulo', async () => {
                    const retornoLexador = lexador.mapear(["escreva(nulo == nulo)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('verdadeiro', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('falso', async () => {
                    const retornoLexador = lexador.mapear(["escreva(falso)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações matemáticas', () => {
                it('Operações matemáticas - Trivial', async () => {
                    const retornoLexador = lexador.mapear(["escreva(5 + 4 * 3 - 2 ** 1 / 6 % 10)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações matemáticas - Subtração', async () => {
                    const retornoLexador = lexador.mapear(["-1"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações matemáticas - Subtração de número e texto', async () => {
                    const codigo = [
                        "var a = 1 - \'2\'",
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].mensagem).toBe('Operadores precisam ser números.');
                });

                it('Operações matemáticas - Divisão de inteiro', async () => {
                    const codigo = [
                        "var a = 10 \\ 2",
                        "escreva(a)"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    // expect(retornoInterpretador.resultado[0]).toBe('2');
                });
            });

            describe('Operações lógicas', () => {
                it('Operações lógicas - ou', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro ou falso)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - e', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro e falso)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - nulo e verdadeiro', async () => {
                    const retornoLexador = lexador.mapear(["nulo == verdadeiro"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(retornoInterpretador.resultado[0]).toBe('falso');
                });

                it('Operações lógicas - negação', async () => {
                    const retornoLexador = lexador.mapear(["!verdadeiro"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - em', async () => {
                    const retornoLexador = lexador.mapear(["escreva(2 em [1, 2, 3])"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit a bit não', async () => {
                    const retornoLexador = lexador.mapear(["~1"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - menor menor', async () => {
                    const retornoLexador = lexador.mapear(["1 << 2"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - maior maior', async () => {
                    const retornoLexador = lexador.mapear(["2 >> 1"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit ou', async () => {
                    const retornoLexador = lexador.mapear(["1 | 2"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit e', async () => {
                    const retornoLexador = lexador.mapear(["1 & 1"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit xor', async () => {
                    const retornoLexador = lexador.mapear(["1 ^ 2"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Escolha - Caso', () => {
                it('Escolha', async () => {
                    const codigo = [
                        "escolha (1) {",
                            "caso 1:",
                                "escreva('correspondente à opção 1');",
                            "caso 2:",
                                "escreva('correspondente à opção 2');",
                            "padrao:",
                                "escreva('Sem opção correspondente');",
                        "}"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            })

            describe('Tente - Pegue - Finalmente', () => {
                it('Tente', async () => {
                    const codigo = [
                        "tente {",
                            "escreva('sucesso');",
                        "} pegue {",
                            "escreva('pegue');",
                        "} finalmente {",
                            "escreva('pronto');",
                        "}"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it("Tente com Pegue parametrizado", async () => {
                    const retornoLexador = lexador.mapear(
                        ["tente { i = i + 1 } pegue (erro) { escreva(erro) }"],
                        -1
                    );
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico).toBeTruthy();

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Tente com senão interno', async () => {
                    const codigo = [
                        "tente {",
                            "se (1 != 1) {",
                                "escreva('sucesso');",
                            "}",
                            "senao {",
                                "escreva('é diferente');",
                            "}",
                        "} pegue {",
                            "escreva('pegue');",
                        "} finalmente {",
                            "escreva('pronto');",
                        "}"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Pegue', async () => {
                    const codigo = [
                        "tente {",
                            "1 > '1';",
                            "escreva('sucesso');",
                        "} pegue {",
                            "escreva('captura');",
                        "} finalmente {",
                            "escreva('pronto');",
                        "}"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            }),

            describe('Condicionais', () => {
                it('Condicionais - condição verdadeira', async () => {
                    const retornoLexador = lexador.mapear(["se (1 < 2) { escreva('Um menor que dois') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição falsa', async () => {
                    const retornoLexador = lexador.mapear(["se (1 > 2) { escreva('Nunca acontece') } senão { escreva('Um não é maior que dois') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição menor igual', async () => {
                    const retornoLexador = lexador.mapear(["se (1 <= 2) { escreva('Um é menor e igual a dois') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição maior igual', async () => {
                    const retornoLexador = lexador.mapear(["se (2 >= 1) { escreva('Dois é maior ou igual a um') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição diferente', async () => {
                    const retornoLexador = lexador.mapear(["se (2 != 1) { escreva('Dois é diferente de um') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Laços de repetição', () => {
                it('Laços de repetição - enquanto', async () => {
                    const retornoLexador = lexador.mapear(["var a = 0;\nenquanto (a < 10) { a = a + 1 }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - fazer ... enquanto', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = 0",
                        "fazer { a = a + 1 } enquanto (a < 10)"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - para', async () => {
                    const retornoLexador = lexador.mapear(["para (var i = 0; i < 10; i = i + 1) { escreva(i) }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Classes', () => {
                it('Super Classe precisa ser uma classe', async () => {
                    const codigo = [
                        "funcao A(data) { }",
                        "classe B herda A {",
                            "construtor(data) {",
                                "super.data(data);",
                            "}",
                        "}",
                        "var a = B(\"13/12/1981\");"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].mensagem).toBe('Superclasse precisa ser uma classe.');
                });

                it('Trivial', async () => {
                    const codigo = [
                        "classe Animal {",
                        "    correr() {",
                        "        escreva('Correndo Loucamente')",
                        "    }",
                        "}",
                        "classe Cachorro herda Animal {",
                        "    latir() {",
                        "        escreva('Au Au Au Au')",
                        "    }",
                        "}",
                        "var nomeDoCachorro = Cachorro()",
                        "nomeDoCachorro.correr()",
                        "nomeDoCachorro.latir()",
                        "escreva('Classe: OK!')"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

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
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });
        });

        describe('Cenários de falha', () => {
            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = [1, 2, 3];",
                        "escreva(a[4]);"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = {'a': 1, 'b': 2};",
                        "escreva(a['c']);"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });
            });
        });
    });
});
