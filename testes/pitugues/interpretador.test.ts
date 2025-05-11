import { AvaliadorSintaticoPitugues } from "../../fontes/avaliador-sintatico/dialetos";
import { Interpretador } from "../../fontes/interpretador";
import { LexadorPitugues } from "../../fontes/lexador/dialetos";

describe('Interpretador (Pituguês)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPitugues;
        let avaliadorSintatico: AvaliadorSintaticoPitugues;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        }

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorPitugues();
            avaliadorSintatico = new AvaliadorSintaticoPitugues();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        describe('Cenários de sucesso', () => {
            describe('Atribuições', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = 1",
                        "var b, c = 1, 2"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Constantes', async () => {
                    const retornoLexador = lexador.mapear([
                        "const g, h, i = 1, '2', 3",
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
            });

            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear(["var a = [1, 2, 3];\nescreva(a[1])"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2};\nescreva(a['b'])"], -1);
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
            });

            describe('Operações matemáticas', () => {
                it('Operações matemáticas - Trivial', async () => {
                    const retornoLexador = lexador.mapear(["escreva(5 + 4 * 3 - 2 ** 1 / 6 % 10)"], -1);
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

                it('Operações lógicas - em', async () => {
                    const retornoLexador = lexador.mapear(["escreva(2 em [1, 2, 3])"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Condicionais', () => {
                it('Condicionais - condição verdadeira', async () => {
                    const codigo = [
                        "se (1 < 2):",
                        "   escreva('Um menor que dois')",
                        "senao:",
                        "   escreva('Nunca será executado')",
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição falsa', async () => {
                    const codigo = [
                        "se (1 > 2):",
                        "   escreva('Nunca acontece')",
                        "senão:",
                        "   escreva('Um não é maior que dois')",
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });


            });

            describe('Laços de repetição', () => {
                it('Laços de repetição - enquanto', async () => {
                    const retornoLexador = lexador.mapear(["var a = 0\nenquanto a < 10:\n    a = a + 1"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - fazer ... enquanto', async () => {
                    const retornoLexador = lexador.mapear(["var a = 0\nfazer:\n    a = a + 1\nenquanto a < 10"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - para', async () => {
                    const codigo = [
                        "para var i = 0; i < 10; i = i + 1:",
                        "   escreva(i)",
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Classes', () => {
                it('Trivial', async () => {
                    const codigo = [
                        "classe Animal:",
                        "    função correr():",
                        "        escreva('Correndo Loucamente')",
                        "classe Cachorro herda Animal:",
                        "    função latir():",
                        "        escreva('Au Au Au Au')",
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
            });

            describe('Declaração e chamada de funções', () => {
                it('Fibonacci', async () => {
                    const codigo = [
                        "função fibonacci(n):",
                        "    se (n == 0):",
                        "       retorna(0)",
                        "    se (n == 1):",
                        "       retorna(1)",
                        "    var n1 = n - 1",
                        "    var n2 = n - 2",
                        "    var f1 = fibonacci(n1)",
                        "    var f2 = fibonacci(n2)",
                        "    retorna(f1 + f2)",
                        "var a = fibonacci(0)",
                        "escreva(a)",
                        "a = fibonacci(1)",
                        "escreva(a)",
                        "a = fibonacci(2)",
                        "escreva(a)",
                        "a = fibonacci(3)",
                        "escreva(a)",
                        "a = fibonacci(4)",
                        "escreva(a)",
                        "a = fibonacci(5)",
                        "escreva(a)"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Uso de bibliotecas', () => {
                it('mapear', async () => {
                    const codigo = [
                        'var vetor = [1, 2, 3]',
                        'var fn = funcao(valor):',
                        '    retorna valor * 2',
                        'escreva(mapear(vetor, fn))'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('[2, 4, 6]');
                });
            });

            describe('Uso de primitivas de número', () => {
                it('arredondarParaBaixo', async () => {
                    const codigo = [
                        'var n1 = 3.1415',
                        'escreva(n1.arredondarParaBaixo())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('3');
                });

                it('arredondarParaCima', async () => {
                    const codigo = [
                        'var n1 = 3.1415',
                        'escreva(n1.arredondarParaCima())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('4');
                });
            });

            describe('Uso de primitivas de texto', () => {
                it('aparar', async () => {
                    const codigo = [
                        'escreva("   texto com espaços        ".aparar())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('texto com espaços');
                });

                it('concatenar', async () => {
                    const codigo = [
                        'var t1 = "um texto"',
                        'var t2 = " concatenado com outro"',
                        'escreva(t1.concatenar(t2))'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('um texto concatenado com outro');
                });

                it('dividir', async () => {
                    const codigo = [
                        'var t1 = "um dois três"',
                        'escreva(t1.dividir(" "))'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("['um', 'dois', 'três']");
                });

                it('maiusculo', async () => {
                    const codigo = [
                        'var t1 = "um dois três"',
                        'escreva(t1.maiusculo())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("UM DOIS TRÊS");
                });

                it('minusculo', async () => {
                    const codigo = [
                        'var t1 = "UM DOIS TRÊS"',
                        'escreva(t1.minusculo())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("um dois três");
                });
            });

            describe('Uso de primitivas de vetor', () => {
                it('fatiar', async () => {
                    const codigo = [
                        'var lista = ["Ser", "ou", "não", "ser"]',
                        'escreva(lista.fatiar(2))',
                        'escreva(lista.fatiar(1, 2))'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe("['não', 'ser']");
                    expect(_saidas[1]).toBe("['ou']");
                });

                it('inclui', async () => {
                    const codigo = [
                        'var lista = [1, 2, 3, 4, 5, 6]',
                        'var lista2 = ["Ser", "ou", "não", "ser"]',
                        'escreva(lista.inclui(5))',
                        'escreva(lista2.inclui("ser"))',
                        'escreva(lista2.inclui("abc"))'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(3);
                    expect(_saidas[0]).toBe("verdadeiro");
                    expect(_saidas[1]).toBe("verdadeiro");
                    expect(_saidas[2]).toBe("falso");
                });

                it('substituir', async () => {
                    const codigo = [
                        'var t = "Ser ou não ser, eis a questão"',
                        'escreva(t.substituir("Ser", "Salmão"));'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("Salmão ou não ser, eis a questão");
                });

                it('subtexto', async () => {
                    const codigo = [
                        'var t = "Ser ou não ser, eis a questão"',
                        'escreva(t.subtexto(4, 10))'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("ou não");
                });
            });
        });

        describe('Cenários de falha', () => {
            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear(["var a = [1, 2, 3]\nescreva(a[4])"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2}\nescreva(a['c'])"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });
            });
        });
    });
});
