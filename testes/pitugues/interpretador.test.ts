import { LexadorPitugues } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoPitugues } from '../../fontes/avaliador-sintatico/dialetos';
import { InterpretadorPitugues } from '../../fontes/interpretador/dialetos/pitugues';

describe('Interpretador (Pituguês)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPitugues;
        let avaliadorSintatico: AvaliadorSintaticoPitugues;
        let interpretador: InterpretadorPitugues;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        };

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorPitugues();
            avaliadorSintatico = new AvaliadorSintaticoPitugues();
            interpretador = new InterpretadorPitugues(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        describe('Cenários de sucesso', () => {
            describe('Atribuições', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear([
                        'var a = 1', 
                        'var b, c = 1, 2'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Constantes', async () => {
                    const retornoLexador = lexador.mapear(["const g, h, i = 1, '2', 3"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                describe('Compreensão de listas', () => {
                    it('Trivial', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'var lista = [1, 2, 3, 4, 5]',
                                'var minhaListaCompreensao = [x para cada x em lista se x % 2 == 0] # Compreensão de listas para números pares',
                                'escreva(minhaListaCompreensao)',
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('[2, 4]');
                    });

                    it('Com expressão para resolução', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'var lista = [1, 2, 3, 4, 5]',
                                'var minhaListaCompreensao = [x * 2 para cada x em lista se x % 2 == 0] # Compreensão de listas para números pares',
                                'escreva(minhaListaCompreensao)',
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('[4, 8]');
                    });
                });

                it('Vetor', async () => {
                    const retornoLexador = lexador.mapear(['var a = [1, 2, 3]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2}"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear(
                        ['var a = [1, 2, 3];\nescreva(a[1])'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        ["var a = {'a': 1, 'b': 2};\nescreva(a['b'])"],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('escreva() e imprima()', () => {
                it('Olá Mundo (escreva() e literal)', async () => {
                    const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', async () => {
                    const retornoLexador = lexador.mapear(['escreva(nulo)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Olá Mundo (imprima() e literal)', async () => {
                    const retornoLexador = lexador.mapear(["imprima('Olá mundo')"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', async () => {
                    const retornoLexador = lexador.mapear(['imprima(nulo)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('leia', () => {
                it('Trivial', async () => {
                    let _saida: string = '';
                    // Aqui vamos simular a resposta para uma variável de `leia()`.
                    const respostas = ['5'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        },
                    };

                    const retornoLexador = lexador.mapear(
                        ['var teste = leia("Insira algo:")', 'imprima(teste)'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saida).toBeTruthy();
                    expect(_saida).toBe('5');
                });
            });

            describe('Operações matemáticas', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(
                        ['escreva(5 + 4 * 3 - 2 ** 1 / 6 % 10)'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações lógicas', () => {
                it('Operações lógicas - ou', async () => {
                    const retornoLexador = lexador.mapear(['escreva(verdadeiro ou falso)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - e', async () => {
                    const retornoLexador = lexador.mapear(['escreva(verdadeiro e falso)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - em', async () => {
                    const retornoLexador = lexador.mapear(['escreva(2 em [1, 2, 3])'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Condicionais', () => {
                it('Condicionais - condição verdadeira', async () => {
                    const codigo = [
                        'se (1 < 2):',
                        "   escreva('Um menor que dois')",
                        'senao:',
                        "   escreva('Nunca será executado')",
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição falsa', async () => {
                    const codigo = [
                        'se (1 > 2):',
                        "   escreva('Nunca acontece')",
                        'senão:',
                        "   escreva('Um não é maior que dois')",
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Laços de repetição', () => {
                it('Laços de repetição - enquanto', async () => {
                    const retornoLexador = lexador.mapear(
                        ['var a = 0\nenquanto a < 10:\n    a = a + 1'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - fazer ... enquanto', async () => {
                    const retornoLexador = lexador.mapear(
                        ['var a = 0\nfazer:\n    a = a + 1\nenquanto a < 10'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - para', async () => {
                    const codigo = [
                        'para var i = 0; i < 10; i = i + 1:',
                        '    se i == 3:',
                        '        continua',
                        '    escreva(i)',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(9);
                });

                it('Para cada', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var vetor = [1, 2, 3]',
                            'para cada elemento de vetor:',
                            '    escreva(elemento)',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(3);
                    expect(_saidas[0]).toBe('1');
                    expect(_saidas[1]).toBe('2');
                    expect(_saidas[2]).toBe('3');
                });
            });

            describe('Classes', () => {
                it('Trivial', async () => {
                    const codigo = [
                        'classe Animal:',
                        '    função correr():',
                        "        escreva('Correndo Loucamente')",
                        'classe Cachorro(Animal):',
                        '    função latir():',
                        "        escreva('Au Au Au Au')",
                        'var nomeDoCachorro = Cachorro()',
                        'nomeDoCachorro.correr()',
                        'nomeDoCachorro.latir()',
                        "escreva('Classe: OK!')",
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(3);
                    expect(_saidas[0]).toBe('Correndo Loucamente');
                    expect(_saidas[1]).toBe('Au Au Au Au');
                    expect(_saidas[2]).toBe('Classe: OK!');
                });

                it('Classes - declaração `super()` ', async () => {
                    const codigo = [
                        'classe Procurando:',
                        '    construtor():',
                        "        imprima('Amigo, onde está você?')",
                        'classe Amigo(Procurando):',
                        '    construtor():',
                        '        super()',
                        "        imprima('Amigo, estou aqui!')",
                        'var amigo = Amigo()',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('Amigo, onde está você?');
                    expect(_saidas[1]).toBe('Amigo, estou aqui!');
                });
            });

            describe('Declaração e chamada de funções', () => {
                it('Trivial', async () => {
                    const codigo = ['funcao teste():', '    imprima("Teste")', 'teste()'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Teste');
                });

                it('Fibonacci', async () => {
                    const codigo = [
                        'função fibonacci(n):',
                        '    se n == 0:',
                        '       retorna 0',
                        '    se n == 1:',
                        '       retorna 1',
                        '    var n1 = n - 1',
                        '    var n2 = n - 2',
                        '    var f1 = fibonacci(n1)',
                        '    var f2 = fibonacci(n2)',
                        '    retorna f1 + f2',
                        'var a = fibonacci(0)',
                        'escreva(a)',
                        'a = fibonacci(1)',
                        'escreva(a)',
                        'a = fibonacci(2)',
                        'escreva(a)',
                        'a = fibonacci(3)',
                        'escreva(a)',
                        'a = fibonacci(4)',
                        'escreva(a)',
                        'a = fibonacci(5)',
                        'escreva(a)',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(6);
                    expect(_saidas[0]).toBe('0');
                    expect(_saidas[1]).toBe('1');
                    expect(_saidas[2]).toBe('1');
                    expect(_saidas[3]).toBe('2');
                    expect(_saidas[4]).toBe('3');
                    expect(_saidas[5]).toBe('5');
                });

                it('Uso de funções de ordem superior', async () => {
                    const codigo = [
                        'var vetor = [1, 2, 3]',
                        'var fn = funcao(valor):',
                        '    retorna valor * 2',
                        'escreva(mapear(vetor, fn))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('[2, 4, 6]');
                });
            });

            describe('Uso de bibliotecas', () => {
                it('dividir', async () => {
                    const codigo = [
                        'var tex = "Eu sou um abacaxi"',
                        'var div = tex.dividir(" ")',
                        'escreva(div)',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe(`['Eu', 'sou', 'um', 'abacaxi']`);
                });

                it('mapear', async () => {
                    const codigo = [
                        'var vetor = [1, 2, 3]',
                        'var fn = funcao(valor):',
                        '    retorna valor * 2',
                        'escreva(mapear(vetor, fn))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('[2, 4, 6]');
                });
            });

            describe('Uso de primitivas de número', () => {
                it('arredondarParaBaixo', async () => {
                    const codigo = ['var n1 = 3.1415', 'escreva(n1.arredondar_para_baixo())'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('3');
                });

                it('arredondarParaCima', async () => {
                    const codigo = ['var n1 = 3.1415', 'escreva(n1.arredondar_para_cima())'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('4');
                });
            });

            describe('Uso de primitivas de texto', () => {
                it('aparar', async () => {
                    const codigo = ['escreva("   texto com espaços        ".aparar())'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('texto com espaços');
                });

                it('concatenar', async () => {
                    const codigo = [
                        'var t1 = "um texto"',
                        'var t2 = " concatenado com outro"',
                        'escreva(t1.concatenar(t2))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('um texto concatenado com outro');
                });

                it('encontre_ultimo', async () => {
                    const codigo = [
                        'var txt = "Mi casa, su casa."',
                        'escreva(txt.encontre_ultimo(\'casa\'))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('12');
                });

                it('dividir', async () => {
                    const codigo = ['var t1 = "um dois três"', 'escreva(t1.dividir(" "))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("['um', 'dois', 'três']");
                });

                it('maiusculo', async () => {
                    const codigo = ['var t1 = "um dois três"', 'escreva(t1.maiusculo())'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('UM DOIS TRÊS');
                });

                it('minusculo', async () => {
                    const codigo = ['var t1 = "UM DOIS TRÊS"', 'escreva(t1.minusculo())'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('um dois três');
                });
            });

            describe('Uso de primitivas de vetor', () => {
                it('fatiar', async () => {
                    const codigo = [
                        'var lista = ["Ser", "ou", "não", "ser"]',
                        'escreva(lista.fatiar(2))',
                        'escreva(lista.fatiar(1, 2))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

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
                        'escreva(lista2.inclui("abc"))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(3);
                    expect(_saidas[0]).toBe('verdadeiro');
                    expect(_saidas[1]).toBe('verdadeiro');
                    expect(_saidas[2]).toBe('falso');
                });

                it('substituir', async () => {
                    const codigo = [
                        'var t = "Ser ou não ser, eis a questão"',
                        'escreva(t.substituir("Ser", "Salmão"));',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Salmão ou não ser, eis a questão');
                });

                it('subtexto', async () => {
                    const codigo = [
                        'var t = "Ser ou não ser, eis a questão"',
                        'escreva(t.subtexto(4, 10))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('ou não');
                });

                it('encontre - índice inicial encontrado', async () => {
                    const codigo = [
                        'var t = "Ser ou não ser, eis a questão"',
                        'escreva(t.encontrar("ser"))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('11');
                });

                it('encontre - subtexto não encontrado', async () => {
                    const codigo = [
                        'var t = "Ser ou não ser, eis a questão"',
                        'escreva(t.encontrar("abacaxi"))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('-1');
                });

                it('encontre - com índice inicial', async () => {
                    const codigo = [
                        'var t = "Ser ou não ser, eis a questão"',
                        'escreva(t.encontrar("ou", 4))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('4');
                });

                it('encontre - índice inicial após última ocorrência', async () => {
                    const codigo = [
                        'var t = "Ser ou não ser, eis a questão"',
                        'escreva(t.encontrar("Ser", 5))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('-1');
                });

                it('encontre - primeira ocorrência no início', async () => {
                    const codigo = ['var t = "abcabc"', 'escreva(t.encontrar("abc"))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('0');
                });
                
                it('SE ternário', async() => {
                    const codigo = [
                        'var a = 10',
                        'var b = 20',
                        'var maior = a se a > b senão b',
                        'escreva(maior)',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('20');
                });
            });
        });

        it('termina_com - sufixo encontrado no final', async () => {
            const codigo = [
                'var t = "Olá, bem-vindo ao meu mundo."',
                'escreva(t.termina_com("."))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('termina_com - sufixo encontrado (palavra completa)', async () => {
            const codigo = [
                'var t = "Olá, bem-vindo ao meu mundo."',
                'escreva(t.termina_com("mundo."))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('termina_com - sufixo não encontrado', async () => {
            const codigo = [
                'var t = "Olá, bem-vindo ao meu mundo."',
                'escreva(t.termina_com("mundo"))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('falso');
        });

        it('termina_com - sufixo no meio do texto', async () => {
            const codigo = [
                'var t = "Olá, bem-vindo ao meu mundo."',
                'escreva(t.termina_com("bem-vindo"))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('falso');
        });

        it('termina_com - texto vazio como sufixo', async () => {
            const codigo = [
                'var t = "Olá mundo"',
                'escreva(t.termina_com(""))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('termina_com - sufixo maior que o texto', async () => {
            const codigo = [
                'var t = "Olá"',
                'escreva(t.termina_com("Olá mundo!"))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('falso');
        });

        it('interpolação de variáveis em textos', async () => {
            const codigo = [
                'var nome = "Maria"',
                'var idade = 30',
                'escreva(f"Meu nome é ${nome} e eu tenho ${idade} anos.")',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(  
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('Meu nome é Maria e eu tenho 30 anos.');
        });

        describe('Cenários de falha', () => {
            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear(['var a = [1, 2, 3]\nescreva(a[4])'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        ["var a = {'a': 1, 'b': 2}\nescreva(a['c'])"],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });
            });
        });
    });
});
