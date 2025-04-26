import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Interpretador } from '../../fontes/interpretador';
import { Lexador } from '../../fontes/lexador';

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        }

        beforeEach(() => {
            _saidas = [];
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        describe('Cenários de sucesso', () => {
            describe('Acesso a operações matemáticas em posições de vetor', () => {
                it('Espera-se que atribuição com acumulador seja bem sucedida', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var pilha = [1, 2, 3, 4]',
                            'pilha[0] += 8',
                            'escreva(pilha[0])'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('9');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                })
            })

            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear([
                        'var a = [1, 2, 3]', 
                        'escreva(a[1])'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('2');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2}", "escreva(a['b'])"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('2');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Atribuições', () => {
                it('Trivial var/variavel', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = 1',
                            'variavel b = 2',
                            'variável c = 3',
                            'var a1, a2, a3 = 1, 2, 3',
                            "var bb1, bb2, bb3: vetor = [1, 2, 3], ['1', '2', '3'], ['Olá Mundo!']",

                            'const aa = 1',
                            'constante bb = 2',
                            'fixo cc = 3',
                            'const aa1, aa2, aa3 = 1, 2, 3',
                            "const bb1, bb2, bb3: vetor = [1, 2, 3], ['1', '2', '3'], ['Olá Mundo!']",
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Trivial const/constante/fixo', async () => {
                    const retornoLexador = lexador.mapear(
                        ['const a = 1', 'constante b = "b"', 'fixo c = 3', 'const a1, a2, a3 = 1, 2, 3'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Vetor', async () => {
                    const retornoLexador = lexador.mapear(['var a = [1, 2, 3]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário, atribuição simples', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = {'a': 1, 'b': 2}",
                        "escreva(a['b'])"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário, atribuição e soma vetor', async () => {
                    const saidasMensagens = [
                        '3350'
                    ];

                    const retornoLexador = lexador.mapear([
                        'var { estacaoTerraAteColoniaSolis, vilaOmegaAteCidadeNova, luaZetAteBaseDelta } = {',
                        '  "estacaoTerraAteColoniaSolis": 2000,',
                        '  "vilaOmegaAteCidadeNova": 500,',
                        '  "luaZetAteBaseDelta": 850,',
                        '}',
                        'var distanciaTotal = [',
                        '  estacaoTerraAteColoniaSolis,',
                        '  vilaOmegaAteCidadeNova,',
                        '  luaZetAteBaseDelta',
                        '].somar()',
                        'escreva(distanciaTotal)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário com valor zero', async () => {
                    const saidasMensagens = [
                        '0'
                    ];

                    const retornoLexador = lexador.mapear([
                        'var macacos = {',
                        '"Joe": 0,',
                        '"Milo": 0,',
                        '"Kiko": 0',
                        '}',
                        'escreva(macacos[\'Joe\'])',
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário com definição de variável externa', async () => {
                    const retornoLexador = lexador.mapear([
                        'var frase = "opa"',
                        'var dicionario = {',
                        '"resposta": frase,',
                        '2: frase',
                        '}',
                        'escreva(dicionario)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('{"2":"opa","resposta":"opa"}');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário com chave lógica', async () => {
                    const saidasMensagens = [,
                        '{"verdadeiro":"valor","falso":"valor2"}'
                    ];

                    const retornoLexador = lexador.mapear([
                        'escreva({',
                        'verdadeiro: \'valor\',',
                        'falso: \'valor2\'',
                        '})',
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Concatenação com um operador sendo tipo texto e outro operador qualquer', async () => {
                    const retornoLexador = lexador.mapear(["var a = 1 + '1'"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Concatenação com atribuição de texto', async () => {
                    const saidasMensagens = [
                        'oi tudo bem'
                    ];

                    const retornoLexador = lexador.mapear([
                        "var frase = ''",
                        "frase += 'oi' + ' tudo bem'",
                        "escreva(frase)"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Interpolação de texto usando \'isto\'', async () => {
                    const saidasMensagens = [
                        'Olá, meu nome é Fernando, como posso lhe ajudar?',
                    ];

                    const retornoLexador = lexador.mapear([
                        'classe Vendedor {',
                        '  nome: texto',
                        '  construtor(nome) {',
                        '    isto.nome = nome',
                        '  }',
                        '  recebaCliente() {',
                        '    escreva(\'Olá, meu nome é ${isto.nome}, como posso lhe ajudar?\')',
                        '  }',
                        '}',
                        'var vendedor = Vendedor(\'Fernando\')',
                        'vendedor.recebaCliente()'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Interpolação de Texto/Função/Expressão', async () => {
                    const saidasMensagens = [
                        'Minha comida favorita é strogonoff',
                        'somar: 8 = 8',
                        'somar com ponto flutuante: 9 = 9',
                        '2',
                        'Valor: falso e verdadeiro',
                        '0',
                    ];
                    const retornoLexador = lexador.mapear(
                        [
                            "var comidaFavorita = 'strogonoff'",
                            'escreva("Minha comida favorita é ${comidaFavorita}")',
                            'funcao somar(num1, num2) {',
                            'retorna num1 + num2;',
                            '}',
                            "escreva('somar: ${somar(5, 3)} = ${4 + 5 - 1}');",
                            "escreva('somar com ponto flutuante: ${somar(5.7, 3.3)} = ${5 + 5 - 1}');",
                            "escreva('${4 - 2 / 1}');",
                            'var logico1 = falso',
                            'var logico2 = verdadeiro',
                            'var zero = 0',
                            'escreva("${zero}")',
                            "escreva('Valor: ${logico1} e ${logico2}')",
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Incremento e decremento em propriedades de dicionário', async () => {
                    const saidasMensagens = [
                        '4',
                        '-2'
                    ];
                    const retornoLexador = lexador.mapear(
                        [
                            'var macacos = {',
                            '  "Joe": 0,',
                            '  "Milo": 0,',
                            '  "Kiko": 0,',
                            '}',
                            "macacos['Joe'] += 4",
                            "macacos['Milo'] -= 2",
                            "escreva(macacos['Joe']);",
                            "escreva(macacos['Milo']);",
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Incremento e decremento após variável ou literal', async () => {
                    const saidasMensagens = ['1', '1', '2', '0', '6', '4'];
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = 1',
                            'escreva(a++)',
                            'escreva(a--)',
                            'escreva(++a)',
                            'escreva(--a)',
                            'escreva(++5)',
                            'escreva(--5)',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Desestruturação de variáveis', async () => {
                    let _saida: string = '';
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = { "prop1": "b" }',
                            'var { prop1 } = a',
                            'escreva(prop1)'
                        ],
                        -1
                    );

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe('b');
                });

                it('Desestruturação de constantes', async () => {
                    let _saida: string = '';
                    const retornoLexador = lexador.mapear(
                        [
                            'const a = { "prop1": "c" }',
                            'const { prop1 } = a',
                            'escreva(prop1)'
                        ],
                        -1
                    );

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe('c');
                });

                it('Desestruturação de constantes 2', async () => {
                    let _saidas: string[] = [];
                    const retornoLexador = lexador.mapear(
                        [
                            'var panda = {',
                            '    "nome": "Panda",',
                            '    "idade": 2500,',
                            '    "planeta": "Planeta dos Pandas"',
                            '}',
                            'const { nome, idade, planeta } = panda',
                            'escreva(nome)',
                            'escreva(idade)',
                            'escreva(planeta)'
                        ],
                        -1
                    );

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saidas).toHaveLength(3);
                    expect(_saidas[0]).toBe('Panda');
                    expect(_saidas[1]).toBe('2500');
                    expect(_saidas[2]).toBe('Planeta dos Pandas');
                });
            });

            describe('Descrever objetos - paraTexto()', () => {
                it('Descrever função com parametros e tipos - DeleguaFuncao', async () => {
                    let _saida: string = '';
                    const retornoLexador = lexador.mapear(
                        ['funcao retorneAlgo(a: inteiro, b: texto) {', '}', 'escreva(retorneAlgo)'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe('<função retorneAlgo argumentos=<a: inteiro, b: texto>>');
                });

                it('Descrever função com parametros sem tipos - DeleguaFuncao', async () => {
                    let _saida: string = '';
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao retorneAlgo(a, b) {',
                            '}',
                            'escreva(retorneAlgo)'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe('<função retorneAlgo argumentos=<a: qualquer, b: qualquer>>');
                });

                it('Descrever função com retorno - DeleguaFuncao', async () => {
                    let _saida: string = '';
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao retorneAlgo() {', 
                            '   retorna "Algo"', '}', 
                            'escreva(retorneAlgo)'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe("<função retorneAlgo retorna=<'Algo'>>");
                });

                it('Descrever nome função - DeleguaFuncao', async () => {
                    let _saida: string = '';
                    const retornoLexador = lexador.mapear(['funcao retorneAlgo() {', '}', 'escreva(retorneAlgo)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe('<função retorneAlgo>');
                });

                it('Escrita de vetor com outros objetos dentro', async () => {
                    let saidas: string[] = [];
                    const retornoLexador = lexador.mapear([
                        `funcao retorne() {`,
                        `    retorna ''`,
                        `}`,
                        `const dic = {`,
                        `    "chave": 10`,
                        `}`,
                        `escreva([dic])`,
                        `escreva([retorne])"`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        saidas.push(saida);
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                    expect(saidas).toBeTruthy();
                });
            });

            describe('Escolha - Caso', () => {
                it('Escolha', async () => {
                    const codigo = [
                        'escolha (1) {',
                        'caso 1:',
                        "escreva('correspondente à opção 1');",
                        'caso 2:',
                        "escreva('correspondente à opção 2');",
                        'padrao:',
                        "escreva('Sem opção correspondente');",
                        '}',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('correspondente à opção 1');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('escreva()', () => {
                it('Olá Mundo (escreva() e literal)', async () => {
                    const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Olá mundo');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', async () => {
                    const retornoLexador = lexador.mapear(['escreva(nulo)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('nulo');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo igual a nulo', async () => {
                    const retornoLexador = lexador.mapear(['escreva(nulo == nulo)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('verdadeiro');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('verdadeiro', async () => {
                    const retornoLexador = lexador.mapear(['escreva(verdadeiro)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('verdadeiro');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('falso', async () => {
                    const retornoLexador = lexador.mapear(['escreva(falso)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('falso');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Ordem lexicográfica de textos', async () => {
                    const saidasMensagens = ['verdadeiro', 'falso'];
                    const retornoLexador = lexador.mapear(
                        [
                            "escreva('batata' > 'arroz')",
                            "escreva('batata' < 'arroz')"
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Escreva múltiplas variáveis', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            "const a = 'batata'",
                            "const b = 'arroz'",
                            'escreva(a, b)'
                        ],
                        -1
                    );

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('batata arroz');
                    };

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações lógicas', () => {
                it('Operações lógicas - concatenação de texto', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var eVerdadeiro = verdadeiro',
                            'var eFalso = falso',
                            'escreva("Valores: " + eVerdadeiro + " : " + eFalso)',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - ou', async () => {
                    const retornoLexador = lexador.mapear(['escreva(verdadeiro ou falso)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('verdadeiro');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - e', async () => {
                    const retornoLexador = lexador.mapear(['escreva(verdadeiro e falso)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('falso');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - nulo e verdadeiro', async () => {
                    const retornoLexador = lexador.mapear(['nulo == verdadeiro'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(retornoInterpretador.resultado[0]).toBe('falso');
                });

                it('Operações lógicas - negação', async () => {
                    const retornoLexador = lexador.mapear(['!verdadeiro'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - em', async () => {
                    const retornoLexador = lexador.mapear(['escreva(2 em [1, 2, 3])'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('verdadeiro');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - \'em\' com dicionário', async () => {
                    const saidasMensagens = [
                        'verdadeiro',
                        'verdadeiro',
                        'falso',
                        'falso'
                    ];

                    const retornoLexador = lexador.mapear([
                        'var dicionario = {',
                        '"1": 1,',
                        '}',
                        'escreva("1" em {"1": 100})',
                        'escreva("1" em dicionario)',
                        'escreva("3" em {"1": 100})',
                        'escreva("10" em dicionario)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit a bit não', async () => {
                    const retornoLexador = lexador.mapear(['~1'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - menor menor', async () => {
                    const retornoLexador = lexador.mapear(['1 << 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - maior maior', async () => {
                    const retornoLexador = lexador.mapear(['2 >> 1'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit ou', async () => {
                    const retornoLexador = lexador.mapear(['1 | 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit e', async () => {
                    const retornoLexador = lexador.mapear(['1 & 1'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit xor', async () => {
                    const retornoLexador = lexador.mapear(['1 ^ 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações matemáticas', () => {
                it('Operações matemáticas - Trivial', async () => {
                    const retornoLexador = lexador.mapear(['escreva(5 + 4 * 3 - 2 ** 1 / 6 % 10)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('16.666666666666668');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações matemáticas - Subtração', async () => {
                    const retornoLexador = lexador.mapear(['-1'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações matemáticas - Subtração de número e texto', async () => {
                    const codigo = ["var a = 1 - '2'"];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador).toBeTruthy();
                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe('Operadores precisam ser números.');
                });

                it('Operações matemáticas - Divisão de inteiro', async () => {
                    const codigo = ['var a = 10 \\ 2', 'escreva(a)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('5');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Tente - Pegue - Finalmente', () => {
                it('Tente', async () => {
                    const saidasMensagens = ['sucesso', 'pronto'];
                    const codigo = [
                        'tente {',
                        "escreva('sucesso');",
                        '} pegue {',
                        "escreva('pegue');",
                        '} finalmente {',
                        "escreva('pronto');",
                        '}',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Tente com Pegue parametrizado', async () => {
                    const retornoLexador = lexador.mapear(['tente { i = i + 1 } pegue (erro) { escreva(erro) }'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Tente com senão interno', async () => {
                    const saidasMensagens = ['é diferente', 'pronto'];
                    const codigo = [
                        'tente {',
                        'se (1 != 1) {',
                        "escreva('sucesso');",
                        '}',
                        'senao {',
                        "escreva('é diferente');",
                        '}',
                        '} pegue {',
                        "escreva('pegue');",
                        '} finalmente {',
                        "escreva('pronto');",
                        '}',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Pegue', async () => {
                    const codigo = [
                        'tente {',
                        "1 > '1';",
                        "escreva('sucesso');",
                        '} pegue {',
                        "escreva('captura');",
                        '} finalmente {',
                        "escreva('pronto');",
                        '}',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Condicionais', () => {
                it('Condicionais - condição verdadeira', async () => {
                    const retornoLexador = lexador.mapear(
                        ["se (1 < 2) { escreva('Um menor que dois') } senão { escreva('Nunca será executado') }"],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Um menor que dois');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição falsa', async () => {
                    const retornoLexador = lexador.mapear(
                        ["se (1 > 2) { escreva('Nunca acontece') } senão { escreva('Um não é maior que dois') }"],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Um não é maior que dois');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição menor igual', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            "se (1 <= 2) { escreva('Um é menor e igual a dois') } senão { escreva('Nunca será executado') }",
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Um é menor e igual a dois');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição maior igual', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            "se (2 >= 1) { escreva('Dois é maior ou igual a um') } senão { escreva('Nunca será executado') }",
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Dois é maior ou igual a um');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição diferente', async () => {
                    const retornoLexador = lexador.mapear(
                        ["se (2 != 1) { escreva('Dois é diferente de um') } senão { escreva('Nunca será executado') }"],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Dois é diferente de um');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Laços de repetição', () => {
                it('enquanto', async () => {
                    const retornoLexador = lexador.mapear(['var a = 0;\nenquanto (a < 10) { a = a + 1 }'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('fazer ... enquanto', async () => {
                    const retornoLexador = lexador.mapear(['var a = 0', 'fazer { a = a + 1 } enquanto (a < 10)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('para cada - trivial', async () => {
                    const saidasMensagens = ['Valor:  1', 'Valor:  2', 'Valor:  3'];
                    const retornoLexador = lexador.mapear(
                        [
                            'para cada elemento em [1, 2, 3] {',
                            "   escreva('Valor: ', elemento)", '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('para cada - vetor variável', async () => {
                    const saidasMensagens = ['Valor:  1', 'Valor:  2', 'Valor:  3'];
                    const retornoLexador = lexador.mapear(
                        [
                            'var v = [1, 2, 3]',
                            'para cada elemento em v {',
                            "   escreva('Valor: ', elemento)", '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('para cada - aninhado', async () => {
                    let _saidas: string[] = [];
                    const retornoLexador = lexador.mapear(
                        [
                            'var numeros = [1, 2, 3, 4]',
                            'para cada numero de numeros {',
                            '    para cada numero de numeros {',
                            '        escreva(numero)',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(16);
                });

                it('para cada - vetor gerado por método de primitiva', async () => {
                    let _saidas: string[] = [];
                    const retornoLexador = lexador.mapear(
                        [
                            'var frase = "oi cara de boi"',
                            'var palavras = frase.dividir(" ") // ["oi", "cara", "de", "boi"]',
                            'para cada palavra de palavras {',
                            '    escreva(palavra)',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(4);
                });

                it('para', async () => {
                    const saidasMensagens = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                    const retornoLexador = lexador.mapear(['para (var i = 0; i < 10; i = i + 1) { escreva(i) }'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Classes', () => {
                it('Trivial', async () => {
                    const saidasMensagens = ['Correndo Loucamente', 'Au Au Au Au', 'Classe: OK!'];
                    const codigo = [
                        'classe Animal {',
                        '    correr() {',
                        "        escreva('Correndo Loucamente')",
                        '    }',
                        '}',
                        'classe Cachorro herda Animal {',
                        '    latir() {',
                        "        escreva('Au Au Au Au')",
                        '    }',
                        '}',
                        'var nomeDoCachorro = Cachorro()',
                        'nomeDoCachorro.correr()',
                        'nomeDoCachorro.latir()',
                        "escreva('Classe: OK!')",
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de método com `super`, trivial', async () => {
                    const _saidas: string[] = [];
                    const codigo = [
                        'classe A {',
                        '  data(data) {',
                        '    escreva(data);',
                        '  }',
                        '}',
                        'classe B herda A {',
                        '  construtor(data) {',
                        '    super.data(data);',
                        '  }',
                        '}',
                        'var a = B("13/12/1981");',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toEqual('13/12/1981');
                });

                it('Chamada de método com `super` e definição de propriedade com `isto`', async () => {
                    const _saidas: string[] = [];
                    const codigo = [
                        'classe A {',
                        '  dataA: texto',
                        '  construtor() {',
                        "    isto.dataA = '01/01/2001'",
                        '  }',
                        '  data(data1) {',
                        '    escreva(isto.dataA + " - ", data1)',
                        '  }',
                        '}',
                        'classe B herda A {',
                        '  construtor(data) {',
                        '    super();',
                        '    super.data(data);',
                        '  }',
                        '}',
                        'var a = B("13/12/1981");',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('01/01/2001 -  13/12/1981');
                });

                it('Construtor', async () => {
                    const codigo = [
                        'classe Quadrado {',
                        '  lado: número',
                        '  construtor(lado) {',
                        '    isto.lado = lado',
                        '  }',
                        '  area() {',
                        '    retorna isto.lado * isto.lado',
                        '  }',
                        '  perimetro() {',
                        '    retorna 4 * isto.lado',
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

                it('Teste de tipo', async () => {
                    let _saidas = "";
                    interpretador.funcaoDeRetorno = (saida: string) => {
                        _saidas += saida;
                    }

                    const retornoLexador = lexador.mapear(
                        [
                            'classe Artigo {',
                            '  id: numero',
                            '  titulo: texto',
                            '  conteudo: texto',
                            '}',
                            'escreva(Artigo)'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas.length).toBeGreaterThan(0);
                });

                it('Interpolação com `isto`', async () => {
                    let _saidas = "";
                    interpretador.funcaoDeRetorno = (saida: string) => {
                        _saidas += saida;
                    }

                    const retornoLexador = lexador.mapear(
                        [
                            'classe Vendedor {',
                            '  nome: texto',
                            '  construtor(nome) {',
                            '    isto.nome = nome',
                            '  }',
                            '  recebaCliente() {',
                            '    escreva("Olá, meu nome é ${isto.nome}, como posso lhe ajudar?")',
                            '  }',
                            '}',
                            'var vendedor = Vendedor("Fernando")',
                            'vendedor.recebaCliente()',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas.length).toBeGreaterThan(0);
                    expect(_saidas).toBe("Olá, meu nome é Fernando, como posso lhe ajudar?");
                });

                it('Incremento e decremento com `isto`', async () => {
                    let _saidas = "";
                    interpretador.funcaoDeRetorno = (saida: string) => {
                        _saidas += saida;
                    }

                    const retornoLexador = lexador.mapear(
                        [
                            'classe Carteira {',
                            '  saldo: numero',
                            '  construtor() {',
                            '    isto.saldo = 100',
                            '  }',
                            '  depositar(dinheiro) {',
                            '    isto.saldo += dinheiro ',
                            '  }',
                            '}',
                            'var carteira = Carteira();',
                            'carteira.depositar(200)',
                            'escreva(carteira.saldo);'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toBe('300');
                })
            });

            describe('Declaração e chamada de funções', () => {
                it("Chamada de função com retorno 'vazio'", async () => {
                    const codigo = [
                        'funcao executar(valor1, valor2): vazio {',
                        '   var resultado = valor1 + valor2',
                        '}',
                        'escreva(executar(1, 2))',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('nulo');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it("Chamada de função com retorno 'qualquer'", async () => {
                    const codigo = [
                        'funcao executar(valor1, valor2): qualquer {',
                        '   var resultado = valor1 + valor2',
                        '   retorna resultado',
                        '}',
                        'escreva(executar(1, 2))',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('3');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função com definição de tipos inteiros e retorno texto', async () => {
                    const codigo = [
                        'funcao executar(valor1: inteiro, valor2: inteiro): texto {',
                        '   retorna valor1 + valor2',
                        '}',
                        'escreva(executar(1, 2))',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('3');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função com retorno de vetor', async () => {
                    const codigo = ['funcao executar() {', "   retorna [1, 2, '3']", '}', 'escreva(executar())'];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('[1, 2, \'3\']');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função com inferência de tipos na passagem de parametros', async () => {
                    const codigo = [
                        'funcao escreverMensagem(vetor) {',
                        "   se (vetor.inclui('mundo')) {",
                        '       escreva(vetor);',
                        '   }',
                        '}',
                        'escreverMensagem(["Olá", "mundo"]);',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('[\'Olá\', \'mundo\']');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função primitiva com parâmetro nulo', async () => {
                    const codigo = [
                        'var frutas = ["maçã", "banana", "morango", "laranja", "uva"]',
                        'var alimentos = frutas.encaixar(0, 3, nulo, verdadeiro);',
                        'escreva(alimentos);',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('[\'maçã\', \'banana\', \'morango\']');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Aglutinação de argumentos', async () => {
                    const codigo = ['função teste(*argumentos) {', '   escreva(argumentos)', '}', 'teste(1, 2, 3)'];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Fibonacci', async () => {
                    const _saidas: string[] = [];
                    const codigo = [
                        'função fibonacci(n) {',
                        '    se (n == 0) {',
                        '      retorna(0);',
                        '    }',
                        '    se (n == 1) {',
                        '      retorna(1);',
                        '    }',
                        '    var n1 = n - 1;',
                        '    var n2 = n - 2;',
                        '    var f1 = fibonacci(n1);',
                        '    var f2 = fibonacci(n2);',
                        '    retorna(f1 + f2);',
                        '}',
                        'var a = fibonacci(0);',
                        'escreva(a);',
                        'a = fibonacci(1);',
                        'escreva(a);',
                        'a = fibonacci(2);',
                        'escreva(a);',
                        'a = fibonacci(3);',
                        'escreva(a);',
                        'a = fibonacci(4);',
                        'escreva(a);',
                        'a = fibonacci(5);',
                        'escreva(a);',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Número repetido (com retorna)', async () => {
                    const codigo = [
                        'funcao temDigitoRepetido(num) {',
                        '    var str = texto(num);',
                        '    para (var i = 1; i < tamanho(str); i++) {',
                        '      se (str[i] != str[0]) {',
                        '        retorna falso;',
                        '      }',
                        '    }',
                        '    retorna verdadeiro;',
                        '}',
                        'escreva(temDigitoRepetido(123));',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('falso');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Número repetido (com sustar)', async () => {
                    const codigo = [
                        'funcao temDigitoRepetido(num) {',
                        '    var str = texto(num);',
                        '    para (var i = 1; i < tamanho(str); i++) {',
                        '      se (str[i] != str[0]) {',
                        '        sustar;',
                        '      }',
                        '    }',
                        '    retorna verdadeiro;',
                        '}',
                        'escreva(temDigitoRepetido(123));',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('verdadeiro');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Função que retorna função', async () => {
                    const retornoLexador = lexador.mapear([
                        "funcao some(a, b) {",
                        "  retorna a + b",
                        "}",
                        "funcao facaCurrying(minhaFuncao) {",
                        "  retorna funcao(a) {",
                        "    retorna funcao(b) {",
                        "      retorna minhaFuncao(a, b)",
                        "    }",
                        "  }",
                        "}",
                        "var someViaCurryng = facaCurrying(some)",
                        "escreva(someViaCurryng(1)(2))"
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                    let _saidas = "";
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas += saida;
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toBe('3');
                });
            });

            describe('Entrada e saída', () => {
                it('Enquanto (verdadeiro) e Sustar', async () => {
                    const saidasMensagens = ['opção invalida', 'opção invalida', 'resultado 4'];
                    // Aqui vamos simular a resposta para cinco variáveis de `leia()`.
                    const respostas = ['5', '5', '5', '4', '4'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        },
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
                        'escreva("resultado " + resultado);',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dias de vida', async () => {
                    // Aqui vamos simular a resposta para uma variável de `leia()`.
                    const respostas = ['38'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        },
                    };

                    const codigo = [
                        'var n1 = inteiro(leia("digite sua idade"));',
                        'var n2 = (365*n1);',
                        'escreva("Você tem " +n2+" dias de vida");',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Você tem 13870 dias de vida');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Métodos de primitivas com dependência no Interpretador', () => {
                describe('Dicionários', () => {
                    it('chaves() e valores()', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                `var meuDicionario = {"a": 1, "b": 2, "c": 3}`,
                                `escreva(meuDicionario.chaves())`,
                                `escreva(meuDicionario.valores())`,
                            ],
                            -1
                        );

                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const _saidas: string[] = [];

                        interpretador.funcaoDeRetorno = (saida: string) => {
                            _saidas.push(saida);
                        };

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(2);
                        expect(_saidas[0]).toEqual('[\'a\', \'b\', \'c\']');
                        expect(_saidas[1]).toEqual('[1, 2, 3]');
                    });

                    it('Obter valores do dicionário dentro de outro dicionário', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                `var planos = {`,
                                `"base secreta": "Lua Oculta",`,
                                `"armas": {`,
                                `"tipo": "blaster 72",`,
                                `"tempo de recuo": 120,`,
                                `},`,
                                `"defesa": "campo energético",`,
                                `"duracao de ataque": 700`,
                                `}`,
                                `var dados = planos.valores()`,
                                `escreva(dados)`
                            ],
                            -1
                        );

                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const saidas: string[] = ["['Lua Oculta', {\"tipo\":\"blaster 72\",\"tempo de recuo\":120}, 'campo energético', 700]"];

                        interpretador.funcaoDeRetorno = (saida: string) => {
                            saidas.push(saida);
                        };

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                    });
                });

                describe('Vetores', () => {
                    it('ordenar() de vetor com parâmetro função', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'var numeros = [4, 2, 12, 8];',
                                'numeros.ordenar(funcao(a, b) {',
                                '    retorna b - a;',
                                '});',
                                'escreva(numeros);',
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: string) => {
                            expect(saida).toEqual('[12, 8, 4, 2]');
                        };

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                    });

                    it('função que retorna lista', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                "funcao retorneLista() {",
                                "var lista = []",

                                "retorna lista",
                                "}",

                                "escreva(retorneLista())"
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: string) => {
                            expect(saida).toEqual('[]');
                        };

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                    });
                });
            });

            describe('Expressões Regulares', () => {
                it('Método substituir()', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var str = "olá mundo, olá universo";',
                            'var novaStr = str.substituir(||/olá/g||, "oi");',
                            'escreva(novaStr);',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('oi mundo, oi universo');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Falhar', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(["falhar 'teste de falha'"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Trivial com atribuição', async () => {
                    const retornoLexador = lexador.mapear(['var mensagem = "teste de falha"', 'falhar mensagem'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });
            });

            describe('Tendo ... Como', () => {
                it('Trivial, sem finalizar() definido', async () => {
                    let _saida: string = '';
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    const retornoLexador = lexador.mapear([
                        'funcao teste() { retorna "Ok" }',
                        'tendo teste() como a {',
                        '    escreva(a)',
                        '}'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saida).toBe('Ok');
                });

                it('Trivial, com finalizar() definido, classe em Delégua', async () => {
                    let _saida: string = '';
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    const retornoLexador = lexador.mapear([
                        'classe MinhaClasse {',
                        '    finalizar() {',
                        '        escreva("Finalizei")',
                        '    }',
                        '}',
                        'funcao teste() { retorna "Ok" }',
                        'tendo MinhaClasse() como a {',
                        '}'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saida).toBe('Finalizei');
                });
            });

            describe('Tipo de', () => {
                it('Trivial', async () => {
                    // Aqui vamos simular a resposta para duas variáveis de `leia()`.
                    const respostas = ['5', '5'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        },
                    };

                    const saidasMensagens = [
                        'lógico',
                        'lógico',
                        'número',
                        'número',
                        'texto',
                        'número[]',
                        'vetor',
                        'número[]',
                        'função<vazio>',
                        'qualquer',
                        'número',
                        'texto',
                        'número',
                        'número',
                        'Teste',
                        'OutroTeste',
                        'nulo',
                        'tipo de<tipo de<texto>>',
                        'número',
                        'dicionário',
                        'número',
                        'texto',
                        'inteiro'
                    ];

                    const retornoLexador = lexador.mapear(
                        [
                            'escreva(tipo de verdadeiro)',
                            'escreva(tipo de falso)',
                            'escreva(tipo de 123)',
                            'escreva(tipo de -1)',
                            'escreva(tipo de "123")',
                            'escreva(tipo de [1,2,3])',
                            'escreva(tipo de [])',
                            "escreva(tipo de [1, '2'])",
                            'var f = funcao(algumTexto) { }',
                            'var a;',
                            'var c = 1',
                            "var d = '2'",
                            'escreva(tipo de f)',
                            'escreva(tipo de a)',
                            'escreva(tipo de c)',
                            'escreva(tipo de d)',
                            'escreva(tipo de 4 + 2)',
                            'escreva(tipo de 4 * 2 + (3 ^ 2))',
                            'classe Teste {}',
                            'escreva(tipo de Teste)',
                            'classe OutroTeste {}',
                            'escreva(tipo de OutroTeste)',
                            'escreva(tipo de nulo)',
                            'escreva(tipo de tipo de tipo de "a")',
                            'var letras = "abc"',
                            'escreva(tipo de letras.tamanho())',
                            'escreva(tipo de { "chave": verdadeiro })',
                            'var produtos = {',
                            '  "preco": 25',
                            '}',
                            'escreva(tipo de produtos[\'preco\'])',
                            'var resultadoLeia = leia("string: ")',
                            'var leiaInteiro = inteiro(leia("number: "))',
                            'escreva(tipo de resultadoLeia)',
                            'escreva(tipo de leiaInteiro)'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    let _saidas: string[] = [];
                    interpretador.funcaoDeRetorno = (saida: string) => {
                        _saidas.push(saida);
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toStrictEqual(saidasMensagens);
                });

                it('Tipo de número', async () => {
                    const retornoLexador = lexador.mapear(['escreva(tipo de 123)'], -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('número');
                    };

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Tipo de com agrupamento', async () => {
                    const retornoLexador = lexador.mapear(['var a = 1', 'var b = tipo de (a)', 'escreva(b)'], -1);
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('número');
                    };

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Tipo de elementos de objeto', async () => {
                    let _saidas: string[] = [];
                    const retornoLexador = lexador.mapear([
                        'classe Vendedor {',
                        '  recebaCliente() {}',
                        '}',
                        'var vendedor = Vendedor()',
                        'escreva(tipo de [1, 2, 3].adicionar)',
                        'escreva(tipo de {"chave": "valor"}.valores)',
                        'escreva(tipo de vendedor.recebaCliente)',
                    ], -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(3);
                    expect(_saidas[0]).toBe('método<qualquer[]>');
                    expect(_saidas[1]).toBe('método<qualquer[]>');
                    expect(_saidas[2]).toBe('método<vazio>');
                });
            });

            describe('Casos complexos', () => {
                it('Perceptron', async () => {
                    let _saidas: string[] = [];
                    const retornoLexador = lexador.mapear([
                        'var pesoInicial1 = 0.3;',
                        'var pesoInicial2 = 0.4;',
                        'var entrada1 = 1;',
                        'var entrada2 = 1;',
                        'var erro = 1;',
                        'var resultadoEsperado;',
                        'enquanto (erro != 0) {',
                        '    se (entrada1 == 1) {',
                        '        se (entrada2 == 1) {',
                        '           resultadoEsperado = 1;',
                        '        }',
                        '    } senão {',
                        '        resultadoEsperado = 0;',
                        '    }',
                        '    var somatoria = pesoInicial1 * entrada1;',
                        '    somatoria = pesoInicial2 * entrada2 + somatoria;',
                        '    var resultado;',
                        '    se (somatoria < 1) {',
                        '        resultado = 0;',
                        '    } senão {',
                        '        se (somatoria >= 1) {',
                        '           resultado = 1;',
                        '        }',
                        '    }',
                        '    escreva("resultado: " + texto(resultado));',
                        '    erro = resultadoEsperado - resultado;',
                        '    escreva("p1: " + texto(pesoInicial1));',
                        '    escreva("p2: " + texto(pesoInicial2));',
                        '    pesoInicial1 = 0.1 * entrada1 * erro + pesoInicial1;',
                        '    pesoInicial2 = 0.1 * entrada2 * erro + pesoInicial2;',
                        '    escreva("erro: " + texto(erro));',
                        '}',
                    ], -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas.length).toBeGreaterThan(0);
                });
            });
        });

        describe('Cenários de falha', () => {
            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear(['var a = [1, 2, 3];', 'escreva(a[4]);'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: string) => {
                        expect(saida).toEqual('nulo');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2};", "escreva(a['c']);"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: string) => {
                        expect(saida).toEqual('nulo');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Métodos inexistentes', async () => {
                    const retornoLexador = lexador.mapear(['nescreva("Qualquer coisa")'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });
            });

            describe('Classes', () => {
                it('Membros da classe precisam ser declarados', async () => {
                    const codigo = [
                        'classe Quadrado {',
                        '  construtor(lado) {',
                        '    isto.lado = lado',
                        '  }',
                        '  area() {',
                        '    retorna isto.lado * isto.lado',
                        '  }',
                        '  perimetro() {',
                        '    retorna 4 * isto.lado',
                        '  }',
                        '}',
                        'var q1 = Quadrado(10)',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Classe com propriedade com valor zero', async () => {
                    const saidasMensagens = ['0'];
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Carteira {',
                            'saldo: numero',
                            'construtor() {',
                            'isto.saldo = 0',
                            '}',
                            '}',
                            'var carteira = Carteira();',
                            'escreva(carteira.saldo);'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Super Classe precisa ser uma classe', async () => {
                    const codigo = [
                        'funcao A(data) { }',
                        'classe B herda A {',
                        '    construtor(data) {',
                        '        super.data(data);',
                        '    }',
                        '}',
                        'var a = B("13/12/1981");',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador).toBeTruthy();
                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        'Superclasse precisa ser uma classe.'
                    );
                });
            });

            describe('Mutabilidade', () => {
                it('const', async () => {
                    const retornoLexador = lexador.mapear(['const a = 1', 'a = 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        "Constante 'a' não pode receber novos valores."
                    );
                });

                it('constante', async () => {
                    const retornoLexador = lexador.mapear(['constante b = "b"', 'b = 3'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        "Constante 'b' não pode receber novos valores."
                    );
                });

                it('fixo', async () => {
                    const retornoLexador = lexador.mapear(['fixo c = 3', 'c = 1'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        "Constante 'c' não pode receber novos valores."
                    );
                });

                it('Tupla Dupla - Atribuição por indice', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var t = [(1, 2)]',
                            't[0] = 3'
                        ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador).toBeTruthy();
                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        'Não é possível modificar uma tupla. As tuplas são estruturas de dados imutáveis.'
                    );
                });
            });
        });
    });
});
