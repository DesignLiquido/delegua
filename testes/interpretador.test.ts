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

            describe('Descrever objetos - paraTexto()', () => {
                it('Descrever função com parametros e tipos - DeleguaFuncao', async () => {
                    let _saida: string = ""
                    const retornoLexador = lexador.mapear([
                        "funcao retorneAlgo(a: inteiro, b: texto) {",
                        "}",
                        "escreva(retorneAlgo)"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    }
    
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(_saida).toBe("<função retorneAlgo argumentos=<a: inteiro, b: texto>>");
                });

                it('Descrever função com parametros sem tipos - DeleguaFuncao', async () => {
                    let _saida: string = ""
                    const retornoLexador = lexador.mapear([
                        "funcao retorneAlgo(a, b) {",
                        "}",
                        "escreva(retorneAlgo)"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    }
    
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(_saida).toBe("<função retorneAlgo argumentos=<a, b>>");
                });

                it('Descrever função com retorno - DeleguaFuncao', async () => {
                    let _saida: string = ""
                    const retornoLexador = lexador.mapear([
                        "funcao retorneAlgo() {",
                        "   retorna \"Algo\"",
                        "}",
                        "escreva(retorneAlgo)"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    }
    
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(_saida).toBe("<função retorneAlgo retorna=<'Algo'>>");
                });

                it('Descrever nome função - DeleguaFuncao', async () => {
                    let _saida: string = ""
                    const retornoLexador = lexador.mapear([
                        "funcao retorneAlgo() {",
                        "}",
                        "escreva(retorneAlgo)"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    }
    
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(_saida).toBe("<função retorneAlgo>");
                });
            })

            describe('Atribuições', () => {
                it('Trivial var/variavel', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = 1",
                        "variavel b = 2",
                        "variável c = 3",
                        "var a1, a2, a3 = 1, 2, 3",
                        "var bb1, bb2, bb3: vetor = [1, 2, 3], ['1', '2', '3'], ['Olá Mundo!']",

                        "const aa = 1",
                        "constante bb = 2",
                        "fixo cc = 3",
                        "const aa1, aa2, aa3 = 1, 2, 3",
                        "const bb1, bb2, bb3: vetor = [1, 2, 3], ['1', '2', '3'], ['Olá Mundo!']",
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

                it('Interpolação de Texto/Função/Expressão', async () => {
                    const saidasMensagens = [
                        'Minha comida favorita é strogonoff',
                        'somar: 8 = 8',
                        'somar com ponto flutuante: 9 = 9',
                        '2',
                        'Valor: falso e verdadeiro',
                        "0"
                    ]
                    const retornoLexador = lexador.mapear([
                        "var comidaFavorita = 'strogonoff'",
                        'escreva("Minha comida favorita é ${comidaFavorita}")',
                        "funcao somar(num1, num2) {",
                        "retorna num1 + num2;",
                        "}",
                        "escreva('somar: ${somar(5, 3)} = ${4 + 5 - 1}');",
                        "escreva('somar com ponto flutuante: ${somar(5.7, 3.3)} = ${5 + 5 - 1}');",
                        "escreva('${4 - 2 / 1}');",
                        "var logico1 = falso",
                        "var logico2 = verdadeiro",
                        "var zero = 0",
                        "escreva(\"${zero}\")",
                        "escreva('Valor: ${logico1} e ${logico2}')",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Incremento e decremento após variável ou literal', async () => {
                    const saidasMensagens = [
                        '1',
                        '1',
                        '2',
                        '0',
                        '6',
                        '4',
                    ]
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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Desestruturação de variáveis', async () => {
                    let _saida: string = ""
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
                    }
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe("b");
                });

                it('Desestruturação de constantes', async () => {
                    let _saida: string = ""
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
                    }
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe("c");
                });
            });

            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = [1, 2, 3]",
                        "escreva(a[1])"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("2");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = {'a': 1, 'b': 2}",
                        "escreva(a['b'])"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("2");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('escreva()', () => {
                it('Olá Mundo (escreva() e literal)', async () => {
                    const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("Olá mundo");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', async () => {
                    const retornoLexador = lexador.mapear(["escreva(nulo)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("nulo");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo igual a nulo', async () => {
                    const retornoLexador = lexador.mapear(["escreva(nulo == nulo)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("verdadeiro");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('verdadeiro', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("verdadeiro");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('falso', async () => {
                    const retornoLexador = lexador.mapear(["escreva(falso)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("falso");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Tipo de', async () => {
                    const saidasMensagens = [
                        'lógico',
                        'lógico',
                        'número',
                        'número',
                        'texto',
                        'vetor',
                        'vetor',
                        'vetor',
                        'função',
                        'nulo',
                        'número',
                        'texto',
                        'número',
                        'número',
                        'objeto',
                        'objeto',
                        'nulo',
                        'texto',
                        'número'
                    ]
                    const retornoLexador = lexador.mapear([
                        "escreva(tipo de verdadeiro)",
                        "escreva(tipo de falso)",
                        "escreva(tipo de 123)",
                        "escreva(tipo de -1)",
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
                        "escreva(tipo de tipo de tipo de \"a\")",
                        "var letras = \"abc\"",
                        "escreva(tipo de letras.tamanho())",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Tipo de número', async () => {
                    const retornoLexador = lexador.mapear([
                        "escreva(tipo de 123)",
                    ], -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("número");
                    };

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it ('Tipo de com agrupamento', async () => {
                    const retornoLexador = lexador.mapear([
                        'var a = 1',
                        'var b = tipo de (a)',
                        'escreva(b)',
                    ], -1);
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("número");
                    };
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Ordem lexicográfica de textos', async () => {
                    const saidasMensagens = [
                        'verdadeiro',
                        'falso',
                    ]
                    const retornoLexador = lexador.mapear([
                        "escreva('batata' > 'arroz')",
                        "escreva('batata' < 'arroz')"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }


                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Escreva múltiplas variáveis', async () => {                    
                    const retornoLexador = lexador.mapear([
                        "const a = 'batata'",
                        "const b = 'arroz'",
                        "escreva(a, b)"
                    ], -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("batata arroz");
                    }

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                })
            });

            describe('Operações matemáticas', () => {
                it('Operações matemáticas - Trivial', async () => {
                    const retornoLexador = lexador.mapear(["escreva(5 + 4 * 3 - 2 ** 1 / 6 % 10)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('16.666666666666668');
                    }

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

                    expect(retornoInterpretador.erros).toHaveLength(2);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe('Operadores precisam ser números.');
                });

                it('Operações matemáticas - Divisão de inteiro', async () => {
                    const codigo = [
                        "var a = 10 \\ 2",
                        "escreva(a)"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('5');
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações lógicas', () => {
                it('Operações lógicas - concatenação de texto', async () => {
                    const retornoLexador = lexador.mapear([
                        "var eVerdadeiro = verdadeiro",
                        "var eFalso = falso",
                        "escreva(\"Valores: \" + eVerdadeiro + \" : \" + eFalso)"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - ou', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro ou falso)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('verdadeiro');
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - e', async () => {
                    const retornoLexador = lexador.mapear(["escreva(verdadeiro e falso)"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('falso');
                    }

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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('verdadeiro');
                    }

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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('correspondente à opção 1');
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            })

            describe('Tente - Pegue - Finalmente', () => {
                it('Tente', async () => {
                    const saidasMensagens = [
                        "sucesso",
                        "pronto"
                    ]
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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it("Tente com Pegue parametrizado", async () => {
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
                    const saidasMensagens = [
                        "é diferente",
                        "pronto"
                    ]
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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }

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
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            }),

            describe('Condicionais', () => {
                it('Condicionais - condição verdadeira', async () => {
                    const retornoLexador = lexador.mapear(["se (1 < 2) { escreva('Um menor que dois') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("Um menor que dois");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição falsa', async () => {
                    const retornoLexador = lexador.mapear(["se (1 > 2) { escreva('Nunca acontece') } senão { escreva('Um não é maior que dois') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("Um não é maior que dois")
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição menor igual', async () => {
                    const retornoLexador = lexador.mapear(["se (1 <= 2) { escreva('Um é menor e igual a dois') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("Um é menor e igual a dois")
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição maior igual', async () => {
                    const retornoLexador = lexador.mapear(["se (2 >= 1) { escreva('Dois é maior ou igual a um') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("Dois é maior ou igual a um")
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição diferente', async () => {
                    const retornoLexador = lexador.mapear(["se (2 != 1) { escreva('Dois é diferente de um') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("Dois é diferente de um")
                    }

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
                    const saidasMensagens = [
                        'Valor:  1',
                        'Valor:  2',
                        'Valor:  3'
                    ]
                    const retornoLexador = lexador.mapear([
                        "para cada elemento em [1, 2, 3] {",
                        "   escreva('Valor: ', elemento)",
                        "}",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }


                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - para cada - vetor variável', async () => {
                    const saidasMensagens = [
                        'Valor:  1',
                        'Valor:  2',
                        'Valor:  3'
                    ]
                    const retornoLexador = lexador.mapear([
                        "var v = [1, 2, 3]",
                        "para cada elemento em v {",
                        "   escreva('Valor: ', elemento)",
                        "}",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }

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
                    const saidasMensagens = [
                        '0',
                        '1',
                        '2',
                        '3',
                        '4',
                        '5',
                        '6',
                        '7',
                        '8',
                        '9'
                    ]
                    const retornoLexador = lexador.mapear(["para (var i = 0; i < 10; i = i + 1) { escreva(i) }"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Classes', () => {
                it('Trivial', async () => {
                    const saidasMensagens = [
                        'Correndo Loucamente',
                        "Au Au Au Au",
                        'Classe: OK!'
                    ]
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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de método com `super`', async () => {
                    const codigo = [
                        "classe A {",
                            "data(data) {",
                              "escreva(data);",
                            "}",
                        "}",
                        "classe B herda A {",
                            "construtor(data) {",
                              "super.data(data);",
                            "}",
                        "}",
                        "var a = B(\"13/12/1981\");",
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("13/12/1981");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de método com `super` e definição de propriedade com `isto`', async () => {
                    const codigo = [
                        "classe A {",
                        "   dataA: texto",
                        "   construtor() {",
                            "   isto.dataA = \'01/01/2001\'",
                            "}",
                            "data(data1) {",
                              "escreva(isto.dataA + \" - \", data1)",
                            "}",
                        "}",
                        "classe B herda A {",
                            "construtor(data) {",
                              "super();",
                              "super.data(data);",
                            "}",
                        "}",
                        "var a = B(\"13/12/1981\");",
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
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
            });

            describe('Declaração e chamada de funções', () => {
                it('Chamada de função com retorno \'vazio\'', async () => {
                    const codigo = [
                        "funcao executar(valor1, valor2): vazio {",
                        "   var resultado = valor1 + valor2",
                        "}",
                        "escreva(executar(1, 2))"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("nulo");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função com retorno \'qualquer\'', async () => {
                    const codigo = [
                        "funcao executar(valor1, valor2): qualquer {",
                        "   var resultado = valor1 + valor2",
                        "   retorna resultado",
                        "}",
                        "escreva(executar(1, 2))"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("3");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função com definição de tipos inteiros e retorno texto', async () => {
                    const codigo = [
                        "funcao executar(valor1: inteiro, valor2: inteiro): texto {",
                        "   retorna valor1 + valor2",
                        "}",
                        "escreva(executar(1, 2))"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("3");
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função com retorno de vetor', async () => {
                    const codigo = [
                        "funcao executar() {",
                        "   retorna [1, 2, \'3\']",
                        "}",
                        "escreva(executar())"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('1,2,3');
                    }

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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Olá,mundo');
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função primitiva com parâmetro nulo', async () => {
                    const codigo = [
                        "var frutas = [\"maçã\", \"banana\", \"morango\", \"laranja\", \"uva\"]",
                        "var alimentos = frutas.encaixar(0, 3, nulo, verdadeiro);",
                        "escreva(alimentos);",
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('maçã,banana,morango');
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Aglutinação de argumentos', async () => {
                    const codigo = [
                        "função teste(*argumentos) {",
                        "   escreva(argumentos)",
                        "}",
                        "teste(1, 2, 3)"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Fibonacci', async () => {
                    const saidasMensagens = ['0', '1', '1', '2', '3', '5']
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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }

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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('falso');
                    }

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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('verdadeiro');
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Entrada e saída', () => {
                it('Enquanto (verdadeiro) e Sustar', async () => {
                    const saidasMensagens = ['opção invalida', 'opção invalida', 'resultado 4']
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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    }

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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Você tem 13870 dias de vida');
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Métodos de primitivas com dependência no Interpretador', () => {
                describe('Dicionários', () => {
                    it('chaves() e valores()', async () => {
                        const retornoLexador = lexador.mapear([
                            `var meuDicionario = {"a": 1, "b": 2, "c": 3}`,
                            `escreva(meuDicionario.chaves())`,
                            `escreva(meuDicionario.valores())`
                        ], -1);

                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const saidas: string[] = [];
    
                        interpretador.funcaoDeRetorno = (saida: string) => {
                            saidas.push(saida);
                        }
    
                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(saidas).toHaveLength(2);
                        expect(saidas[0]).toEqual('a,b,c');
                        expect(saidas[1]).toEqual('1,2,3');
                    });
                });

                describe('Vetores', () => {
                    it('ordenar() de vetor com parâmetro função', async () => {
                        const retornoLexador = lexador.mapear([
                            "var numeros = [4, 2, 12, 8];",
                            "numeros.ordenar(funcao(a, b) {",
                            "    retorna b - a;",
                            "});",
                            "escreva(numeros);"
                        ], -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                        interpretador.funcaoDeRetorno = (saida: string) => {
                            expect(saida).toEqual('12,8,4,2');
                        }
    
                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                        expect(retornoInterpretador.erros).toHaveLength(0);
                    });
                });
            })

            describe('Expressões Regulares', () => {
                it('Método substituir()', async () => {
                    const retornoLexador = lexador.mapear([
                        "var str = \"olá mundo, olá universo\";",
                        "var novaStr = str.substituir(||/olá/g||, \"oi\");",
                        "escreva(novaStr);",
                    ], -1);
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
                    const retornoLexador = lexador.mapear([
                        "falhar 'teste de falha'"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Trivial com atribuição', async () => {
                    const retornoLexador = lexador.mapear([
                        "var mensagem = \"teste de falha\"",
                        "falhar mensagem"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
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
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: string) => {
                        expect(saida).toEqual('nulo');
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear([
                        "var a = {'a': 1, 'b': 2};",
                        "escreva(a['c']);"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: string) => {
                        expect(saida).toEqual('nulo');
                    }

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
                        'var q1 = Quadrado(10)'
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

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
            });

            describe('Mutabilidade', () => {
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

                it('Tupla - Dupla', async () => {
                    const retornoLexador = lexador.mapear([
                        "var t = [(1, 2)]",
                        "t[0] = 3",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        'Não é possível modificar uma tupla. As tuplas são estruturas de dados imutáveis.'
                    );
                });
            })
        });
    });
});
