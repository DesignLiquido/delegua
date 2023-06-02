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
                it('Trivial var/variavel', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = 1",
                        "variavel b = 2",
                        "variável c = 3",
                        "var a1, a2, a3 = 1, 2, 3"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Trivial const/constante/fixo', async () => {
                    const retornoLexador = lexador.mapear([
                        "const a = 1",
                        "constante b = \"b\"",
                        "fixo c = 3",
                        "const a1, a2, a3 = 1, 2, 3"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Vetor', async () => {
                    const retornoLexador = lexador.mapear(["var a = [1, 2, 3]"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2}"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Concatenação', async () => {
                    const retornoLexador = lexador.mapear(["var a = 1 + '1'"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Interpolação de Texto', async () => {
                    const retornoLexador = lexador.mapear([
                        "var comidaFavorita = 'strogonoff'",
                        'escreva("Minha comida favorita é ${comidaFavorita}")'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Interpolação de Texto/Função/Expressão', async () => {
                    const retornoLexador = lexador.mapear([
                        "funcao somar(num1, num2) {",
                        "retorna num1 + num2;",
                        "}",
                        "escreva('somar: ${somar(5, 3)} = ${4 + 5 - 1}');",
                        "escreva('somar com ponto flutuante: ${somar(5.7, 3.3)} = ${5 + 5 - 1}');",
                        "escreva('${4 - 2 / 1}');",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Incremento e decremento após variável ou literal', async () => {
                    const retornoLexador = lexador.mapear([
                        'var a = 1',
                        'escreva(a++)',
                        'escreva(a--)',
                        'escreva(++a)',
                        'escreva(--a)',
                        'escreva(++5)',
                        'escreva(--5)'
                    ], -1);
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
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
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = {'a': 1, 'b': 2}",
                        "escreva(a['b'])"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('escreva()', () => {
                it('Olá Mundo (escreva() e literal)', async () => {
                    const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', async () => {
                    const retornoLexador = lexador.mapear(["escreva(nulo)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo igual a nulo', async () => {
                    const retornoLexador = lexador.mapear(["escreva(nulo == nulo)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('verdadeiro', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('falso', async () => {
                    const retornoLexador = lexador.mapear(["escreva(falso)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Tipo de', async () => {
                    const retornoLexador = lexador.mapear([
                        "escreva(tipo de verdadeiro)",
                        "escreva(tipo de falso)",
                        "escreva(tipo de 123)",
                        "escreva(tipo de \"123\")",
                        "escreva(tipo de [1,2,3])",
                        "escreva(tipo de [])",
                        "escreva(tipo de [1, '2'])",
                        "var f = funcao(algumTexto) { }",
                        "var a;",
                        "var c = 1",
                        "var d = \'2\'",
                        "escreva(tipo de f)",
                        "escreva(tipo de a)",
                        "escreva(tipo de c)",
                        "escreva(tipo de d)",
                        "escreva(tipo de 4 + 2)",
                        "escreva(tipo de 4 * 2 + (3 ^ 2))",
                        "classe Teste {}",
                        "escreva(tipo de Teste)",
                        "classe OutroTeste {}",
                        "escreva(tipo de OutroTeste)",
                        "escreva(tipo de nulo)",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações matemáticas', () => {
                it('Operações matemáticas - Trivial', async () => {
                    const retornoLexador = lexador.mapear(["escreva(5 + 4 * 3 - 2 ** 1 / 6 % 10)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações matemáticas - Subtração', async () => {
                    const retornoLexador = lexador.mapear(["-1"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações matemáticas - Subtração de número e texto', async () => {
                    const codigo = [
                        "var a = 1 - \'2\'",
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(3);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe('Operadores precisam ser números.');
                });

                it('Operações matemáticas - Divisão de inteiro', async () => {
                    const codigo = [
                        "var a = 10 \\ 2",
                        "escreva(a)"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações lógicas', () => {
                it('Operações lógicas - ou', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro ou falso)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - e', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro e falso)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - nulo e verdadeiro', async () => {
                    const retornoLexador = lexador.mapear(["nulo == verdadeiro"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(retornoInterpretador.resultado[0]).toBe('falso');
                });

                it('Operações lógicas - negação', async () => {
                    const retornoLexador = lexador.mapear(["!verdadeiro"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - em', async () => {
                    const retornoLexador = lexador.mapear(["escreva(2 em [1, 2, 3])"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit a bit não', async () => {
                    const retornoLexador = lexador.mapear(["~1"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - menor menor', async () => {
                    const retornoLexador = lexador.mapear(["1 << 2"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - maior maior', async () => {
                    const retornoLexador = lexador.mapear(["2 >> 1"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit ou', async () => {
                    const retornoLexador = lexador.mapear(["1 | 2"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit e', async () => {
                    const retornoLexador = lexador.mapear(["1 & 1"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit xor', async () => {
                    const retornoLexador = lexador.mapear(["1 ^ 2"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it.skip("Tente com Pegue parametrizado", async () => {
                    const retornoLexador = lexador.mapear(
                        ["tente { i = i + 1 } pegue (erro) { escreva(erro) }"],
                        -1
                    );
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it.skip('Pegue', async () => {
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
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            }),

            describe('Condicionais', () => {
                it('Condicionais - condição verdadeira', async () => {
                    const retornoLexador = lexador.mapear(["se (1 < 2) { escreva('Um menor que dois') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição falsa', async () => {
                    const retornoLexador = lexador.mapear(["se (1 > 2) { escreva('Nunca acontece') } senão { escreva('Um não é maior que dois') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição menor igual', async () => {
                    const retornoLexador = lexador.mapear(["se (1 <= 2) { escreva('Um é menor e igual a dois') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição maior igual', async () => {
                    const retornoLexador = lexador.mapear(["se (2 >= 1) { escreva('Dois é maior ou igual a um') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição diferente', async () => {
                    const retornoLexador = lexador.mapear(["se (2 != 1) { escreva('Dois é diferente de um') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Laços de repetição', () => {
                it('Laços de repetição - enquanto', async () => {
                    const retornoLexador = lexador.mapear(["var a = 0;\nenquanto (a < 10) { a = a + 1 }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - fazer ... enquanto', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = 0",
                        "fazer { a = a + 1 } enquanto (a < 10)"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - para cada - trivial', async () => {
                    const retornoLexador = lexador.mapear([
                        "para cada elemento em [1, 2, 3] {",
                        "   escreva('Valor: ', elemento)",
                        "}",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - para cada - vetor variável', async () => {
                    const retornoLexador = lexador.mapear([
                        "var v = [1, 2, 3]",
                        "para cada elemento em v {",
                        "   escreva('Valor: ', elemento)",
                        "}",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - para cada - vetor inválido', async () => {
                    const retornoLexador = lexador.mapear([
                        "var v = falso",
                        "para cada elemento em v {",
                        "   escreva('Valor: ', elemento)",
                        "}",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Laços de repetição - para', async () => {
                    const retornoLexador = lexador.mapear(["para (var i = 0; i < 10; i = i + 1) { escreva(i) }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe.only('Classes', () => {
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
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(2);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe('Superclasse precisa ser uma classe.');
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
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it.skip('Construtor', async () => {
                    const codigo = [
                        'classe Quadrado {',
                        '  construtor(lado) {',
                        '    isto.lado = lado',
                        '  }',
                        '  area() {',
                        '    retorna lado * lado',
                        '  }',
                        '  perimetro() {',
                        '    retorna 4 * lado',
                        '  }',
                        '}',
                        'var q1 = Quadrado(10)',
                        'escreva(q1.area())',
                        'escreva(q1.perimetro())',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Declaração e chamada de funções', () => {
                it('Chamada de função com retorno de vetor', async () => {
                    const codigo = [
                        "funcao executar() {",
                        "   retorna [1, 2, \'3\']",
                        "}",
                        "escreva(executar())"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função com inferência de tipos na passagem de parametros', async () => {
                    const codigo = [
                        "funcao escreverMensagem(vetor) {",
                        "   se (vetor.inclui('mundo')) {",
                        "       escreva(vetor);",
                        "   }",
                        "}",
                        "escreverMensagem([\"Olá\", \"mundo\"]);"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função primitiva com parametro nulo', async () => {
                    const codigo = [
                        "var frutas = [\"maçã\", \"banana\", \"morango\", \"laranja\", \"uva\"]",
                        "var alimentos = frutas.encaixar(0, 3, nulo, verdadeiro);",
                        "escreva(alimentos);",
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

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
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Número repetido (com retorna)', async () => {
                    const codigo = [
                        "funcao temDigitoRepetido(num) {",
                        "    var str = texto(num);",
                        "    para (var i = 1; i < tamanho(str); i++) {",
                        "      se (str[i] != str[0]) {",
                        "        retorna falso;",
                        "      }",
                        "    }",
                        "    retorna verdadeiro;",
                        "}",
                        "escreva(temDigitoRepetido(123));"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Número repetido (com sustar)', async () => {
                    const codigo = [
                        "funcao temDigitoRepetido(num) {",
                        "    var str = texto(num);",
                        "    para (var i = 1; i < tamanho(str); i++) {",
                        "      se (str[i] != str[0]) {",
                        "        sustar;",
                        "      }",
                        "    }",
                        "    retorna verdadeiro;",
                        "}",
                        "escreva(temDigitoRepetido(123));"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Entrada e saída', () => {
                it('Enquanto (verdadeiro) e Sustar', async () => {
                    // Aqui vamos simular a resposta para cinco variáveis de `leia()`.
                    const respostas = ['5', '5', '5', '4', '4'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        }
                    };

                    const codigo = [
                        'var n1 = 1;',
                        'var n2 = 1;',
                        'var resultado = 0',
                        'var n1 = leia("teste 1");',
                        'enquanto verdadeiro {',
                        '    var menu = leia("Digite a opção: 1 - Multiplicacao / 2 - Divisao / 3 - Soma / 4 - Subtração");',
                        '    se menu == "1" {',
                        '        resultado = n1 * n2;',
                        '        sustar;',
                        '    } senao se menu == "2" {',
                        '        resultado = n1 / n2;',
                        '        sustar;',
                        '    } senao se menu == "3" {',
                        '        resultado = n1 + n2;',
                        '        sustar;',
                        '    } senao se menu == "4" {',
                        '        resultado = n1 - n2;',
                        '        sustar;',
                        '    } senao {',
                        '        escreva("opção invalida");',
                        '    }',
                        '}',
                        'escreva("resultado " + resultado);'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dias de vida', async () => {
                    // Aqui vamos simular a resposta para uma variável de `leia()`.
                    const respostas = [38];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        }
                    };

                    const codigo = [
                        'var n1 = leia("digite sua idade");',
                        'var n2 = (365*n1);',
                        'escreva("Você tem " +n2+" dias de vida");'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Métodos de primitivas com dependência no Interpretador', () => {
                it('ordenar() de vetor com parâmetro função', async () => {
                    const retornoLexador = lexador.mapear([
                        "var numeros = [4, 2, 12, 8];",
                        "numeros.ordenar(funcao(a, b) {",
                        "    retorna b - a;",
                        "});",
                        "escreva(numeros);"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            })
        });

        describe('Cenários de falha', () => {
            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = [1, 2, 3];",
                        "escreva(a[4]);"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('const', async () => {
                    const retornoLexador = lexador.mapear([
                        "const a = 1",
                        "a = 2",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        'Constante \'a\' não pode receber novos valores.'
                    );
                });

                it('constante', async () => {
                    const retornoLexador = lexador.mapear([
                        "constante b = \"b\"",
                        "b = 3",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        'Constante \'b\' não pode receber novos valores.'
                    );
                });

                it('fixo', async () => {
                    const retornoLexador = lexador.mapear([
                        "fixo c = 3",
                        "c = 1"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        'Constante \'c\' não pode receber novos valores.'
                    );
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = {'a': 1, 'b': 2};",
                        "escreva(a['c']);"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Métodos inexistentes', async () => {
                    const retornoLexador = lexador.mapear([
                        'nescreva("Qualquer coisa")'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });
            });

            describe('Falhar', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear([
                        "falhar 'teste de falha'"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });
            });
        });
    });
});
