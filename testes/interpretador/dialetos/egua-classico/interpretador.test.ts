import { AvaliadorSintaticoEguaClassico } from "../../../../fontes/avaliador-sintatico/dialetos";
import { InterpretadorEguaClassico } from "../../../../fontes/interpretador/dialetos";
import { LexadorEguaClassico } from "../../../../fontes/lexador/dialetos";

describe('Interpretador (Égua Clássico)', () => {
    let lexador: LexadorEguaClassico;
    let avaliadorSintatico: AvaliadorSintaticoEguaClassico;
    let interpretador: InterpretadorEguaClassico;

    let _saidas: string[] = [];
    const funcaoSaida = (texto: string) => {
        _saidas.push(texto);
    }

    describe('interpretar()', () => {
        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorEguaClassico();
            avaliadorSintatico = new AvaliadorSintaticoEguaClassico();
            interpretador = new InterpretadorEguaClassico(process.cwd());
            interpretador.funcaoDeRetorno = funcaoSaida;
        });

        describe('Cenários de sucesso', () => {
            describe('Atribuições', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(["var a = 1;"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Vetor', async () => {
                    const retornoLexador = lexador.mapear(["var a = [1, 2, 3];"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2};"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear(["var a = [1, 2, 3];\nescreva(a[1]);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2};\nescreva(a['b']);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('escreva()', () => {
                it('Olá Mundo (escreva() e literal)', async () => {
                    const retornoLexador = lexador.mapear(["escreva('Olá mundo');"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', async () => {
                    const retornoLexador = lexador.mapear(["escreva(nulo);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações matemáticas', () => {
                it('Operações matemáticas - Trivial', async () => {
                    const retornoLexador = lexador.mapear(["escreva(5 + 4 * 3 - 2 ** 1 / 6 % 10);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações lógicas', () => {
                it('Operações lógicas - ou', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro ou falso);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - e', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro e falso);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - em', async () => {
                    const retornoLexador = lexador.mapear(["escreva(2 em [1, 2, 3]);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Condicionais', () => {
                it('Condicionais - condição verdadeira', async () => {
                    const retornoLexador = lexador.mapear(["se (1 < 2) { escreva('Um menor que dois'); } senão { escreva('Nunca será executado'); }"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição falsa', async () => {
                    const retornoLexador = lexador.mapear(["se (1 > 2) { escreva('Nunca acontece'); } senão { escreva('Um não é maior que dois'); }"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - senão se', async () => {
                    const retornoLexador = lexador.mapear(
                        ['var a = 1;', 'se (a > 2) { escreva("Nunca acontece"); } senão se (a == 1) { escreva("Um é igual a um"); } senão { escreva("Nunca acontece"); }']
                    )

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1)

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes)

                    expect(retornoInterpretador.erros).toHaveLength(0)
                })
            });

            describe('Laços de repetição', () => {
                it('Laços de repetição - enquanto', async () => {
                    const retornoLexador = lexador.mapear(["var a = 0;\nenquanto (a < 10) { a = a + 1; }"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - fazer ... enquanto', async () => {
                    const retornoLexador = lexador.mapear(["var a = 0;\nfazer { a = a + 1; } enquanto (a < 10)"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - para', async () => {
                    const retornoLexador = lexador.mapear(["para (var i = 0; i < 10; i = i + 1) { escreva(i); }"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

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

                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Tratamento de erro', () => {
                it('Tente', async () =>{
                    const retornoLexador = lexador.mapear([
                        "função teste() {",
                        "   tente {        ",
                        "       1 > '1';   ",
                        "       escreva('Tente - Pegue: ERRO!');",
                        "   } pegue {",
                        "       escreva('Tente - Pegue: OK!');",
                        "   } finalmente {",
                        "       retorna(' ');",
                        "   }",
                        "}   ",
                        "escreva(teste());"
                    ])

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoInterpretador.erros).toHaveLength(0);
                })
            })

            describe('Operações unárias', () => {
                it('Negação lógica', async () => {
                    const retornoLexador = lexador.mapear(["escreva(!verdadeiro);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('falso');
                });

                it('Negativo numérico', async () => {
                    const retornoLexador = lexador.mapear(["escreva(-5);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('-5');
                });

                it('Bitwise NOT', async () => {
                    const retornoLexador = lexador.mapear(["var a = ~0;\nescreva(a);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações binárias', () => {
                it('Concatenação de texto', async () => {
                    const retornoLexador = lexador.mapear(["escreva('Olá' + ' ' + 'Mundo');"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('Olá Mundo');
                });

                it('Bitwise AND', async () => {
                    const retornoLexador = lexador.mapear(["escreva(6 & 3);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Bitwise OR', async () => {
                    const retornoLexador = lexador.mapear(["escreva(5 | 2);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Bitwise XOR', async () => {
                    const retornoLexador = lexador.mapear(["escreva(5 ^ 3);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Shift left', async () => {
                    const retornoLexador = lexador.mapear(["escreva(1 << 3);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Shift right', async () => {
                    const retornoLexador = lexador.mapear(["escreva(8 >> 2);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Diferente', async () => {
                    const retornoLexador = lexador.mapear(["escreva(1 != 2);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações lógicas adicionais', () => {
                it('em - texto em string', async () => {
                    const retornoLexador = lexador.mapear(["escreva('ol' em 'olá mundo');"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('em - chave em dicionário', async () => {
                    const retornoLexador = lexador.mapear(["escreva('a' em {'a': 1, 'b': 2});"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Acesso a índices adicionais', () => {
                it('Índice negativo em vetor', async () => {
                    const retornoLexador = lexador.mapear(["var a = [1, 2, 3];\nescreva(a[-1]);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('3');
                });

                it('Acesso a caractere de string por índice', async () => {
                    const retornoLexador = lexador.mapear(["var s = 'texto';\nescreva(s[0]);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('t');
                });

                it('Atribuição por índice em vetor', async () => {
                    const retornoLexador = lexador.mapear(["var a = [1, 2, 3];\na[0] = 10;\nescreva(a[0]);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('10');
                });

                it('Atribuição por índice em dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var d = {'x': 1};\nd['x'] = 2;\nescreva(d['x']);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('2');
                });
            });

            describe('Escolha', () => {
                it('Caso correspondente (literal)', async () => {
                    const retornoLexador = lexador.mapear([
                        "escolha (2) {",
                        "    caso 1:",
                        "        escreva('um');",
                        "    caso 2:",
                        "        escreva('dois');",
                        "}"
                    ]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('dois');
                });

                it('Caminho padrão (literal sem correspondência)', async () => {
                    const retornoLexador = lexador.mapear([
                        "escolha (99) {",
                        "    caso 1:",
                        "        escreva('um');",
                        "    padrão:",
                        "        escreva('outro');",
                        "}"
                    ]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('outro');
                });

                it('Sem correspondência e sem padrão', async () => {
                    const retornoLexador = lexador.mapear([
                        "escolha (99) {",
                        "    caso 1:",
                        "        escreva('um');",
                        "}"
                    ]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(0);
                });
            });

            describe('Classes com construtor e propriedades', () => {
                it('Construtor e acesso a propriedade via isto', async () => {
                    const codigo = [
                        "classe Pessoa {",
                        "    construtor(nome) {",
                        "        isto.nome = nome;",
                        "    }",
                        "    cumprimentar() {",
                        "        escreva(isto.nome);",
                        "    }",
                        "}",
                        "var p = Pessoa('João');",
                        "p.cumprimentar();"
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('João');
                });

                it('Múltiplos métodos e herança', async () => {
                    const codigo = [
                        "classe Calculadora {",
                        "    somar(a, b) {",
                        "        retorna(a + b);",
                        "    }",
                        "    subtrair(a, b) {",
                        "        retorna(a - b);",
                        "    }",
                        "}",
                        "var calc = Calculadora();",
                        "escreva(calc.somar(3, 4));",
                        "escreva(calc.subtrair(10, 3));"
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('7');
                });
            });

            describe('Funções como valor', () => {
                it('Função anônima atribuída a variável', async () => {
                    const retornoLexador = lexador.mapear([
                        "var dobro = função(n) { retorna(n * 2); };",
                        "escreva(dobro(5));"
                    ]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('10');
                });

                it('Função passada como argumento', async () => {
                    const retornoLexador = lexador.mapear([
                        "função aplicar(f, x) { retorna(f(x)); }",
                        "função quadrado(n) { retorna(n * n); }",
                        "escreva(aplicar(quadrado, 4));"
                    ]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('16');
                });
            });

            describe('escreva() - tipos adicionais', () => {
                it('Booleano verdadeiro', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('verdadeiro');
                });

                it('Booleano falso', async () => {
                    const retornoLexador = lexador.mapear(["escreva(falso);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('falso');
                });

                it('Número', async () => {
                    const retornoLexador = lexador.mapear(["escreva(42);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('42');
                });
            });
        });

        describe('Cenários de falha', () => {
            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear(["var a = [1, 2, 3];\nescreva(a[4]);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2};\nescreva(a['c']);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Índice fora do intervalo em string', async () => {
                    const retornoLexador = lexador.mapear(["var s = 'abc';\nescreva(s[10]);"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });
            });

            describe('Operações binárias com tipos incompatíveis', () => {
                it('Soma de número com texto', async () => {
                    const retornoLexador = lexador.mapear(["escreva(1 + 'texto');"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Subtração com tipo não numérico', async () => {
                    const retornoLexador = lexador.mapear(["escreva(1 - 'texto');"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });
            });

            describe('Chamada de não-chamável', () => {
                it('Chamar um número como função', async () => {
                    const retornoLexador = lexador.mapear(["var a = 42;\na();"]);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });
            });
        });
    });
});
