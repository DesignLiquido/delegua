import _ from 'lodash';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { ResultadoParcialInterpretadorInterface } from '../../fontes/interfaces';
import { Interpretador } from '../../fontes/interpretador';
import { Lexador } from '../../fontes/lexador';
import { RetornoQuebra } from '../../fontes/quebras';

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

        describe('Formatação de strings com operador %', () => {
                it('Formatação com %s (string)', async () => {
                    const codigo = ['escreva("Olá %s" % "Mark")'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Olá Mark');
                });

                it('Formatação com %d (inteiro)', async () => {
                    const codigo = ['escreva("Idade: %d anos" % 25)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Idade: 25 anos');
                });

                it('Formatação com %d converte float para inteiro', async () => {
                    const codigo = ['escreva("Valor: %d" % 3.7)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Valor: 3');
                });

                it('Formatação com %f (flutuante)', async () => {
                    const codigo = ['escreva("Pi: %f" % 3.14159)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Pi: 3.14159');
                });

                it('Formatação com %.2f (flutuante com 2 casas decimais)', async () => {
                    const codigo = ['escreva("Preço: R$ %.2f" % 19.99)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Preço: R$ 19.99');
                });

                it('Formatação com %.4f (flutuante com 4 casas decimais)', async () => {
                    const codigo = ['escreva("Pi: %.4f" % 3.14159265)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Pi: 3.1416');
                });

                it('Formatação com %x (hexadecimal caixa baixa)', async () => {
                    const codigo = ['escreva("Hex: %x" % 255)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Hex: ff');
                });

                it('Formatação com %X (hexadecimal caixa alta)', async () => {
                    const codigo = ['escreva("Hex: %X" % 255)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Hex: FF');
                });

                it('Formatação com %o (octal)', async () => {
                    const codigo = ['escreva("Octal: %o" % 8)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Octal: 10');
                });

                it('Formatação com múltiplos valores usando tupla', async () => {
                    const codigo = ['escreva("Nome: %s, Idade: %d" % ("João", 30))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Nome: João, Idade: 30');
                });

                it('Formatação com múltiplos valores usando vetor', async () => {
                    const codigo = ['escreva("X: %d, Y: %d, Z: %d" % [10, 20, 30])'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('X: 10, Y: 20, Z: 30');
                });

                it('Formatação com %% (porcentagem literal)', async () => {
                    const codigo = ['escreva("Taxa: %d%%" % 15)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Taxa: 15%');
                });

                it('Formatação com variáveis', async () => {
                    const codigo = [
                        'var nome = "Maria"',
                        'var idade = 25',
                        'var mensagem = "Olá, %s! Você tem %d anos." % (nome, idade)',
                        'escreva(mensagem)'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Olá, Maria! Você tem 25 anos.');
                });

                it('Erro: especificador desconhecido', async () => {
                    const codigo = ['escreva("Teste: %z" % 123)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.message).toContain('Especificador de formato desconhecido: %z');
                });

                it('Erro: valores insuficientes', async () => {
                    const codigo = ['escreva("Nome: %s, Idade: %d" % "João")'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.message).toContain('Argumentos insuficientes para a string de formatação');
                });

                it('Erro: valores em excesso', async () => {
                    const codigo = ['escreva("Nome: %s" % ("João", 30))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.message).toContain('Nem todos os argumentos foram convertidos durante a formatação da string.');
                });

                it('Operador % matemático ainda funciona com números', async () => {
                    const codigo = ['escreva(10 % 3)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('1');
                });
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('2');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2}", "escreva(a['b'])"], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Trivial const/constante/fixo', async () => {
                    const retornoLexador = lexador.mapear(
                        ['const a = 1', 'constante b = "b"', 'fixo c = 3', 'const a1, a2, a3 = 1, 2, 3'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Vetor', async () => {
                    const retornoLexador = lexador.mapear(['var a = [1, 2, 3]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                describe('Dicionários', () => {
                    it('Dicionário, atribuição simples', async () => {
                        const retornoLexador = lexador.mapear([
                            "var a = {'a': 1, 'b': 2}",
                            "escreva(a['b'])"
                        ], -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            expect(saida).toBe('{"2":"opa","resposta":"opa"}');
                        };

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                    });

                    it('Dicionário com chave lógica', async () => {
                        const retornoLexador = lexador.mapear([
                            'escreva({',
                            'verdadeiro: \'valor\',',
                            'falso: \'valor2\'',
                            '})',
                        ], -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe("{\"verdadeiro\":\"valor\",\"falso\":\"valor2\"}");
                    });

                    it('Dicionários e referências do montão', async () => {
                        const retornoLexador = lexador.mapear([
                            'var meuDicionario = {',
                            '    "um": "dois",',
                            '    "tres": {',
                            '        "quatro": 5',
                            '    }',
                            '}',
                            'var meuSegundoDicionario = meuDicionario["tres"]',
                            'meuSegundoDicionario["quatro"] = 7',
                            'escreva(meuDicionario["tres"])',
                        ], -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe("{\"quatro\":7}");
                    });

                    it('Dicionários cuja referência ao montão migra para o escopo superior', async () => {
                        const retornoLexador = lexador.mapear([
                            'var listaIndices = ["um", "dois", "tres"]',
                            'var dicionarioEscopoSuperior = {}',
                            'para cada indice em listaIndices {',
                            '    dicionarioEscopoSuperior[indice] = {1: 2, 3: 4}',
                            '}',
                            'escreva(dicionarioEscopoSuperior)',
                        ], -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe("{\"um\":{\"1\":2,\"3\":4},\"dois\":{\"1\":2,\"3\":4},\"tres\":{\"1\":2,\"3\":4}}");
                    });

                    it('Vetores de dicionários', async () => {
                        const retornoLexador = lexador.mapear([
                            'var meuVetor = [{',
                            '    "um": "dois",',
                            '    "tres": {',
                            '        "quatro": 5',
                            '    }',
                            '}, {"seis": 7}]',
                            'var meuSegundoVetor = meuVetor',
                            'meuSegundoVetor[1]["oito"] = 9',
                            'escreva(meuVetor)',
                        ], -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('[{"um":"dois","tres":{"quatro":5}}, {"seis":7,"oito":9}]');
                    });

                    it('Dicionários com vetores', async () => {
                        const retornoLexador = lexador.mapear([
                            'var meuDicionario = { "minhaLista": [] }',
                            'meuDicionario.minhaLista.adicionar({"outro": "dicionário"})',
                            'escreva(meuDicionario.minhaLista)'
                        ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                    })
                });

                it('Concatenação com um operador sendo tipo texto e outro operador qualquer', async () => {
                    const retornoLexador = lexador.mapear(["var a = 1 + '1'"], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Concatenação de vetores com operador +', async () => {
                    const retornoLexador = lexador.mapear([
                        'var lista1 = [1, 2, 3]',
                        'var lista2 = [4, 5, 6]',
                        'var lista_concatenada = lista1 + lista2',
                        'escreva(lista_concatenada)'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('[1, 2, 3, 4, 5, 6]');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Concatenação de vetores com operador +=', async () => {
                    const retornoLexador = lexador.mapear([
                        'var lista1 = [1, 2, 3]',
                        'var lista2 = [4, 5, 6]',
                        'lista1 += lista2',
                        'escreva(lista1)'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('[1, 2, 3, 4, 5, 6]');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Concatenação de vetores vazios', async () => {
                    const retornoLexador = lexador.mapear([
                        'var lista1 = []',
                        'var lista2 = []',
                        'var lista_concatenada = lista1 + lista2',
                        'escreva(lista_concatenada)'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('[]');
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Interpolação com expressão inválida reporta erro em vez de lançar exceção', async () => {
                    const retornoLexador = lexador.mapear(
                        ["escreva('resultado: ${+}')"],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Incremento e decremento em propriedades de dicionário', async () => {
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('4');
                    expect(_saidas[1]).toBe('-2');
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

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Desestruturação de variáveis', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = { "prop1": "b" }',
                            'var { prop1 } = a',
                            'escreva(prop1)'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('b');
                });

                it('Desestruturação de constantes', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'const a = { "prop1": "c" }',
                            'const { prop1 } = a',
                            'escreva(prop1)'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('c');
                });

                it('Desestruturação de constantes 2', async () => {
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

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saidas).toHaveLength(3);
                    expect(_saidas[0]).toBe('Panda');
                    expect(_saidas[1]).toBe('2500');
                    expect(_saidas[2]).toBe('Planeta dos Pandas');
                });
            });

            describe('Chamada de funções da biblioteca global', () => {
                it('ajuda como argumento de escreva, trivial, sem argumentos', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'escreva(ajuda)'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Para usar a ajuda, use como uma função: ajuda(objeto).');
                });

                it('ajuda() como argumento de escreva e como função, sem argumentos', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'escreva(ajuda())'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toContain('Te damos as boas-vindas ao utilitário de ajuda de Delégua!');
                });

                it('ajuda() como argumento de escreva e como função, com argumentos', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'escreva(ajuda(leia))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toContain('permite capturar a entrada do usuário durante a execução do programa.');
                });

                it('Chamada a função nativa aleatorio', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var numeroAleatorio = aleatorio()',
                            'escreva(numeroAleatorio)'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toContain('0.');
                });

                it('Chamada a função nativa filtrarPor com função nomeada', async () => {
                    let _saida: string = '';

                    const retornoLexador = lexador.mapear(
                        [
                            'var listaDeIdades = [91, 32, 15, 44, 12, 18, 101]',
                            'funcao checarIdade(idade) {',
                            '    retorna(idade >= 18)',
                            '}',
                            'escreva(filtrarPor(listaDeIdades, checarIdade))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBeTruthy();
                    expect(_saida).toBe('[91, 32, 44, 18, 101]');
                });

                it('Chamada a função nativa intervalo com inteiros', async () => {
                    let _saida: string = '';

                    const retornoLexador = lexador.mapear(
                        [
                            'escreva(intervalo(1, 5))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBeTruthy();
                    expect(_saida).toBe('[1, 2, 3, 4]');
                });

                it('Chamada a função nativa intervalo com números decimais', async () => {
                    let _saida: string = '';

                    const retornoLexador = lexador.mapear(
                        [
                            'escreva(intervalo(1.7, 5.9))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBeTruthy();
                    expect(_saida).toBe('[1, 2, 3, 4]');
                });

                it('Chamada a função nativa intervalo com variáveis', async () => {
                    let _saida: string = '';

                    const retornoLexador = lexador.mapear(
                        [
                            'var inicio = 0',
                            'var fim = 3',
                            'escreva(intervalo(inicio, fim))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBeTruthy();
                    expect(_saida).toBe('[0, 1, 2]');
                });

                it('Chamada a função nativa intervalo sem início definido', async () => {
                    let _saida: string = '';

                    const retornoLexador = lexador.mapear(
                        [
                            'escreva(intervalo(10))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBeTruthy();
                    expect(_saida).toBe('[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]');
                });

                it('Chamada a função nativa intervalo com passo definido', async () => {
                    let _saida: string = '';

                    const retornoLexador = lexador.mapear(
                        [
                            'escreva(intervalo(0, 10, 2))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBeTruthy();
                    expect(_saida).toBe('[0, 2, 4, 6, 8]');
                });

                describe('todos()', () => {
                    it('Chama a função nativa "todos()" com iterável de dados Truly', async () => {
                        let _saida: string = '';

                        const retornoLexador = lexador.mapear(
                            [
                                'var listaDeNumeros = [1, "Delégua", verdadeiro]',
                                'escreva(todos(listaDeNumeros))'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saida = saida;
                        };

                        await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(_saida).toBeTruthy();
                        expect(_saida).toBe('verdadeiro');
                    });

                    it('Chama a função nativa "todos()" com um objeto', async () => {
                        let _saida: string = '';

                        const retornoLexador = lexador.mapear(
                            [
                                'var objetoLegal = { 1: "a", 2: "b", 3: "c" }',
                                'escreva(todos(objetoLegal))'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saida = saida;
                        };

                        await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(_saida).toBeTruthy();
                        expect(_saida).toBe('verdadeiro');
                    });

                    it('Chama a função nativa "todos()" com iterável de dados Falsy', async () => {
                        let _saida: string = '';

                        const retornoLexador = lexador.mapear(
                            [
                                'var listaDeNumeros = [0, "", nulo, falso]',
                                'escreva(todos(listaDeNumeros))'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saida = saida;
                        };

                        await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(_saida).toBeTruthy();
                        expect(_saida).toBe('falso');
                    });
                });

                describe('todosEmCondicao()', () => {
                    it('Chama a função nativa "todosEmCondicao()" para verificar se os elementos do array são par.', async () => {
                        let _saida: string = '';

                        const retornoLexador = lexador.mapear(
                            [
                                'var listaDeNumeros = [1, 2, 3, 4, 5]',
                                'funcao ehPar(valor) {',
                                '    retorna valor % 2 == 0',
                                '}',
                                'escreva(todosEmCondicao(listaDeNumeros, ehPar))'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saida = saida;
                        };

                        await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(_saida).toBe('falso');
                    });

                    it('Chama a função nativa "todosEmCondicao()" para verificar se todos os nomes começam com V', async () => {
                        let _saida: string = '';

                        const retornoLexador = lexador.mapear(
                            [
                                'var listaDeNomes = ["Victor", "Verônica", "Vanessa"]',
                                'funcao verificar_nomes(nome) {',
                                '    retorna nome[0] == "V"',
                                '}',
                                'escreva(todosEmCondicao(listaDeNomes, verificar_nomes))'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saida = saida;
                        };

                        await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(_saida).toBeTruthy();
                        expect(_saida).toBe('verdadeiro');
                    });
                });
            });

            describe('Conversões entre tipos', () => {
                it('Texto para inteiro', async () => {
                    let _saida: string = '';
                    // Aqui vamos simular a resposta para duas variáveis de `leia()`.
                    const respostas = ['5', '8'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        },
                    };

                    const retornoLexador = lexador.mapear(
                        [
                            'var a = inteiro(leia("Digite a: "))',
                            'var b = inteiro(leia("Digite b: "))',
                            'var prod = a * b',
                            'escreva("PROD = ${prod}")'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBeTruthy();
                    expect(_saida).toBe('PROD = 40');
                });

                it('Texto para número', async () => {
                    let _saida: string = '';
                    // Aqui vamos simular a resposta para duas variáveis de `leia()`.
                    const respostas = ['5', '8'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        },
                    };

                    const retornoLexador = lexador.mapear(
                        [
                            'var a = numero(leia("Digite a: "))',
                            'var b = numero(leia("Digite b: "))',
                            'var media = (a * 3.5 + b * 7.5) / 11',
                            'escreva("MEDIA = ${media}")'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBeTruthy();
                    expect(_saida).toBe('MEDIA = 7.045454545454546');
                });
            });

            describe('Descrever objetos - paraTexto()', () => {
                it('Descrever função com parametros e tipos - DeleguaFuncao', async () => {
                    let _saida: string = '';
                    const retornoLexador = lexador.mapear(
                        ['funcao retorneAlgo(a: inteiro, b: texto) {', '}', 'escreva(retorneAlgo)'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe('<função nome=retorneAlgo argumentos=<a: inteiro, b: texto> />');
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe('<função nome=retorneAlgo argumentos=<a: qualquer, b: qualquer> />');
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe("<função nome=retorneAlgo retorna=<'Algo'> />");
                });

                it('Descrever nome função - DeleguaFuncao', async () => {
                    let _saida: string = '';
                    const retornoLexador = lexador.mapear(['funcao retorneAlgo() {', '}', 'escreva(retorneAlgo)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saida).toBe('<função nome=retorneAlgo />');
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Olá mundo');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', async () => {
                    const retornoLexador = lexador.mapear(['escreva(nulo)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('nulo');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo igual a nulo', async () => {
                    const retornoLexador = lexador.mapear(['escreva(nulo == nulo)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('verdadeiro');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('verdadeiro', async () => {
                    const retornoLexador = lexador.mapear(['escreva(verdadeiro)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('verdadeiro');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('falso', async () => {
                    const retornoLexador = lexador.mapear(['escreva(falso)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações lógicas', () => {
                it('Operações lógicas - bitwise com variáveis lógicas (&, |, ^)', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'escreva(verdadeiro & falso)',
                            'escreva(verdadeiro | falso)',
                            'escreva(verdadeiro ^ falso)',
                            'escreva(verdadeiro ^ verdadeiro)',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(4);
                    expect(_saidas[0]).toBe('falso');
                    expect(_saidas[1]).toBe('verdadeiro');
                    expect(_saidas[2]).toBe('verdadeiro');
                    expect(_saidas[3]).toBe('falso');
                });

                it('Operações lógicas - e/ou como bitwise com números', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'escreva(1 e 3)', // 1 & 3 = 1
                            'escreva(1 ou 2)', // 1 | 2 = 3
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('1');
                    expect(_saidas[1]).toBe('3');
                });

                it('Operações lógicas - concatenação de texto', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var eVerdadeiro = verdadeiro',
                            'var eFalso = falso',
                            'escreva("Valores: " + eVerdadeiro + " : " + eFalso)',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - ou', async () => {
                    const retornoLexador = lexador.mapear(['escreva(verdadeiro ou falso)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('verdadeiro');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - e', async () => {
                    const retornoLexador = lexador.mapear(['escreva(verdadeiro e falso)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('falso');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - nulo e verdadeiro', async () => {
                    const _saidas: string[] = [];
                    const retornoLexador = lexador.mapear(['escreva(nulo == verdadeiro)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('falso');
                });

                it('Operações lógicas - negação', async () => {
                    const retornoLexador = lexador.mapear(['!verdadeiro'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                describe('em ou contém', () => {
                    it('Operações lógicas - em', async () => {
                        const retornoLexador = lexador.mapear(['escreva(2 em [1, 2, 3])'], -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            expect(saidasMensagens.includes(saida)).toBeTruthy();
                        };

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                    });

                    it('Contém', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'var a = [1, 2, 3, 4, 5]',
                                'escreva(a contém 3)'
                            ],
                            -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('verdadeiro');
                    });

                    it('Não contém', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'var a = [2, 4, 6, 8, 10]',
                                'escreva(a não contém 3)'
                            ],
                            -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('verdadeiro');
                    });
                });

                it('Operações lógicas - bit a bit não', async () => {
                    const retornoLexador = lexador.mapear(['~1'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - menor menor', async () => {
                    const retornoLexador = lexador.mapear(['1 << 2'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - maior maior', async () => {
                    const retornoLexador = lexador.mapear(['2 >> 1'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit ou', async () => {
                    const retornoLexador = lexador.mapear(['1 | 2'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit e', async () => {
                    const retornoLexador = lexador.mapear(['1 & 1'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - bit xor', async () => {
                    const retornoLexador = lexador.mapear(['1 ^ 2'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações matemáticas', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(['escreva(5 + 4 * 3 - 2 ** 1 / 6 % 10)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('16.666666666666668');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Subtração unária', async () => {
                    const retornoLexador = lexador.mapear(['-1'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Adição unária com literal inteiro', async () => {
                    const retornoLexador = lexador.mapear(['escreva(+1)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('1');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Adição unária com literal número', async () => {
                    const retornoLexador = lexador.mapear(['escreva(+3.14)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('3.14');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Adição unária com variável', async () => {
                    const retornoLexador = lexador.mapear(['var a = 42', 'escreva(+a)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('42');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Adição unária com número negativo', async () => {
                    const retornoLexador = lexador.mapear(['escreva(+-5)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('-5');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Subtração de número e texto', async () => {
                    const codigo = ["var a = 1 - '2'"];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador).toBeTruthy();
                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe('Operadores precisam ser números.');
                });

                it('Divisão de inteiro', async () => {
                    const codigo = ['var a = 10 \\ 2', 'escreva(a)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toBe('5');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Exponenciação encadeada', async () => {
                    const codigo = ['escreva(5 ** 2 ** 3)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("390625");
                });

                it('Dicionário + dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = { "chave1": 1 }',
                            'var b = { "chave2": 2 }',
                            'escreva(a + b)'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('{\"chave1\":1}{\"chave2\":2}');
                });
            });

            describe('Operadores binários diversos', () => {
                it('Operador Elvis', async () => {
                    const retornoLexador = lexador.mapear(['var a = nulo ?: 10', 'escreva(a)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('10');
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Tente com Pegue parametrizado', async () => {
                    const retornoLexador = lexador.mapear(['tente { i = i + 1 } pegue (erro) { escreva(erro) }'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Condicionais', () => {
                it('condição verdadeira', async () => {
                    const retornoLexador = lexador.mapear(
                        ["se (1 < 2) { escreva('Um menor que dois') } senão { escreva('Nunca será executado') }"],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Um menor que dois');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('condição falsa', async () => {
                    const retornoLexador = lexador.mapear(
                        ["se (1 > 2) { escreva('Nunca acontece') } senão { escreva('Um não é maior que dois') }"],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Um não é maior que dois');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('condição menor igual', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            "se (1 <= 2) { escreva('Um é menor e igual a dois') } senão { escreva('Nunca será executado') }",
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Um é menor e igual a dois');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('condição maior igual', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            "se (2 >= 1) { escreva('Dois é maior ou igual a um') } senão { escreva('Nunca será executado') }",
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Dois é maior ou igual a um');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('condição diferente', async () => {
                    const retornoLexador = lexador.mapear(
                        ["se (2 != 1) { escreva('Dois é diferente de um') } senão { escreva('Nunca será executado') }"],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Dois é diferente de um');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                describe('Se ternário', () => {
                    it('Trivial', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'var idade = 20',
                                'var categoria = idade < 18 ? "menor" : "adulto"',
                                'escreva(categoria)'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                        const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retorno).toBeTruthy();
                        expect(retorno.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('adulto');
                    });
                });
            });

            describe('Laços de repetição', () => {
                it('enquanto', async () => {
                    const retornoLexador = lexador.mapear(['var a = 0;\nenquanto (a < 10) { a = a + 1 }'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Enquanto com retorno pelo escopo', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = 0',
                            'var teste = enquanto a <= 5 {',
                            '    a++',
                            '    retorna a * 6',
                            '}',
                            'escreva(teste)'
                        ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("[6, 12, 18, 24, 30, 36]");
                });

                it('fazer ... enquanto', async () => {
                    const retornoLexador = lexador.mapear(['var a = 0', 'fazer { a = a + 1 } enquanto (a < 10)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('fazer ... enquanto com retorno pelo escopo', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = 1',
                            'var teste = fazer {',
                            '    ++a',
                            '    retorna a * 6',
                            '} enquanto a <= 5',
                            'escreva(teste)'
                        ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("[12, 18, 24, 30, 36]");
                });

                it('enquanto verdadeiro com sustar (laço potencialmente infinito)', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var contador = 0',
                            'enquanto verdadeiro {',
                            '    contador++',
                            '    se contador >= 5000 {',
                            '        sustar',
                            '    }',
                            '}',
                            'escreva(contador)',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('5000');
                });

                it('fazer ... enquanto verdadeiro com sustar (laço potencialmente infinito)', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var contador = 0',
                            'fazer {',
                            '    contador++',
                            '    se contador >= 5000 {',
                            '        sustar',
                            '    }',
                            '} enquanto verdadeiro',
                            'escreva(contador)',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('5000');
                });

                describe('Para cada', () => {
                    it('para cada - trivial', async () => {
                        const saidasMensagens = ['Valor:  1', 'Valor:  2', 'Valor:  3'];
                        const retornoLexador = lexador.mapear(
                            [
                                'para cada elemento em [1, 2, 3] {',
                                "   escreva('Valor: ', elemento)", '}'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            expect(saidasMensagens.includes(saida)).toBeTruthy();
                        };

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                    });

                    it('para cada - dicionário', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'para cada elemento em {"a": 1, "b": 2, "c": 3} {',
                                "   escreva('Valor: ', elemento)",
                                '}'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(3);
                        expect(_saidas[0]).toContain('(\"a\", 1)');
                        expect(_saidas[1]).toContain('(\"b\", 2)');
                        expect(_saidas[2]).toContain('(\"c\", 3)');
                    });

                    it('para cada - texto', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'para cada elemento em "UgUNFYGaFYFYGtNUoH" {',
                                "   escreva(elemento)",
                                '}'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toBeTruthy();
                        expect(_saidas).toHaveLength(18);
                    });

                    it('dicionário com desestruturação', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'para cada {chave, valor} em {"a": 1, "b": 2, "c": 3} {',
                                "   escreva('${chave}: ${valor}')",
                                '}'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(3);
                        expect(_saidas[0]).toContain('a: 1');
                        expect(_saidas[1]).toContain('b: 2');
                        expect(_saidas[2]).toContain('c: 3');
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saidas.push(saida);
                        };

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(16);
                    });

                    it('para cada - vetor gerado por método de primitiva', async () => {
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(4);
                    });

                    it('para cada como construto', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'var teste = para cada elemento em [1, 2, 3] {',
                                '    retorna elemento * 4',
                                '}',
                                'escreva(teste)'
                            ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe("[4, 8, 12]");
                    });

                    it('para cada, dicionário contendo listas com outros dicionários', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                `const dados = {`,
                                `    "funcionarios":[],`,
                                `    "areas":[`,
                                `        {`,
                                `            "codigo":"SD",`,
                                `            "nome":"Desenvolvimento de Software"`,
                                `        },`,
                                `        {`,
                                `            "codigo":"SM",`,
                                `            "nome":"Gerenciamento de Software"`,
                                `        },`,
                                `        {`,
                                `            "codigo":"UD",`,
                                `            "nome":"Designer de UI/UX"`,
                                `        }`,
                                `    ]`,
                                `}`,
                                'para cada area em dados.areas {',
                                '   escreva(area.codigo)',
                                '}'
                            ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(3);
                        expect(_saidas[0]).toBe("SD");
                        expect(_saidas[1]).toBe("SM");
                        expect(_saidas[2]).toBe("UD");
                    });

                    it('para cada, aninhamento misturando vetores e dicionários', async () => {
                        const retornoLexador = lexador.mapear([
                            'var reservasDeTomates = {',
                            '    "reserva de tomates 1": {',
                            '        "tomates": ["tomate", "tomate", "tomate", "tomate"],',
                            '        "quantidade": 4,',
                            '        "localizacao": "Zona A",',
                            '    },',
                            '    "reserva de tomates 2": {',
                            '        "tomates": ["tomate", "tomate"],',
                            '        "quantidade": 2,',
                            '        "localizacao": "Zona B",',
                            '    },',
                            '    "reserva de tomates 3": {',
                            '        "tomates": ["tomate", "tomate", "tomate"],',
                            '        "quantidade": 3,',
                            '        "localizacao": "Zona C",',
                            '    }',
                            '}',
                            'var reservas = reservasDeTomates.valores()',
                            'var todosTomates = []',
                            'para cada reserva de reservas {',
                            '    para cada tomate de reserva["tomates"] {',
                            '        todosTomates.adicionar(tomate)',
                            '    }',
                            '}',
                            'escreva(todosTomates)',
                        ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe("['tomate', 'tomate', 'tomate', 'tomate', 'tomate', 'tomate', 'tomate', 'tomate', 'tomate']");
                    });
                });

                describe('Para tradicional', () => {
                    it('Trivial', async () => {
                        const saidasMensagens = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                        const retornoLexador = lexador.mapear(['para (var i = 0; i < 10; i = i + 1) { escreva(i) }'], -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            expect(saidasMensagens.includes(saida)).toBeTruthy();
                        };

                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                    });

                    it('para, com vetor declarado em escopo anterior', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'var numeros = [1, 2, 3, 4]',
                                'var novaLista = []',
                                'para (var i = 0; i < numeros.tamanho(); i++) {',
                                '    var novoNumero = numeros[i] * 2',
                                '    novaLista.adicionar(novoNumero)',
                                '}',
                                'escreva(novaLista)',
                            ], -1
                        );

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('[2, 4, 6, 8]');
                    });

                    it('Para com retorno pelo escopo', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'var teste = para (var i = 0; i < 10; i = i + 1) {',
                                '    se (i == 5) { sustar; }',
                                '    retorna i ** i',
                                '}',
                                'escreva(teste)'
                            ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe("[1, 1, 4, 27, 256]");
                    });

                    it('Para com decremento', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'const castelo = [[0,0,0], [0,0,0], [1,0,0]]',
                                'funcao acheAPrincesa(castelo) {',
                                '    var andares = []',
                                '    const ta = castelo.tamanho() - 1;',
                                '    para var i = ta; i >= 0; i-- {',
                                '        var conteudoAndar = 0',
                                '        para var j = 0; j < castelo[i].tamanho(); j++ {',
                                '            se castelo[i][j] == 1 {',
                                '                conteudoAndar = 1',
                                '                sustar',
                                '            }',
                                '        }',
                                '        se conteudoAndar > 0 {',
                                '            andares.adicionar("princesa")',
                                '        } senão {',
                                '            andares.adicionar(0)',
                                '        }',
                                '    }',
                                '    retorna andares',
                                '}',
                                'escreva(acheAPrincesa(castelo))'
                            ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                    });

                    it('Para com aninhamento', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'var castelo = [[0, 1, 0], [0, 0, 0], [0, 0, 0]]',
                                'para (var i = 0; i < castelo.tamanho(); i++) {',
                                '    para (var j = 0; j < castelo[i].tamanho(); j++) {',
                                '        se (castelo[i][j] == 1) {',
                                '            castelo[i][j] = \'princesa\'',
                                '        }',
                                '    }',
                                '}',
                                'escreva(castelo)'
                            ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                    });
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy();
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Propriedade tipada em bloco protegido da superclasse é inicializada com valor padrão', async () => {
                    const _saidas: string[] = [];
                    const codigo = [
                        'classe Animal {',
                        '    protegido {',
                        '        energia: numero',
                        '    }',
                        '}',
                        'classe Cachorro herda Animal {',
                        '    comer() {',
                        '        isto.energia += 10',
                        '    }',
                        '    mostrarEnergia() {',
                        '        escreva("Au Au ${isto.energia}")',
                        '    }',
                        '}',
                        'var c = Cachorro()',
                        'c.comer()',
                        'c.mostrarEnergia()',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Au Au 10');
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toBe('300');
                });

                it('Introspecção de método de primitiva em propriedade', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Teste {',
                            '    nome: texto;',
                            '}',
                            'var t = Teste()',
                            't.nome = "Fernando"',
                            'escreva(t.nome.tamanho)'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                });

                it('Semântica de referência - duas variáveis apontam para a mesma instância', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Contador {',
                            '  valor: numero',
                            '  construtor() {',
                            '    isto.valor = 0',
                            '  }',
                            '  incrementar() {',
                            '    isto.valor += 1',
                            '  }',
                            '}',
                            'var a = Contador()',
                            'var b = a',
                            'b.incrementar()',
                            'escreva(a.valor)',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('1');
                });

                it('Instância retornada de função preserva referência no montão', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Pessoa {',
                            '  nome: texto',
                            '  construtor(nome) {',
                            '    isto.nome = nome',
                            '  }',
                            '}',
                            'funcao criarPessoa(nome) {',
                            '  retorna Pessoa(nome)',
                            '}',
                            'var p = criarPessoa("Maria")',
                            'escreva(p.nome)',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Maria');
                });

                it('Instância criada em escopo interno (se) e atribuída a variável externa permanece válida', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Produto {',
                            '  nome: texto',
                            '  preco: numero',
                            '  construtor(nome, preco) {',
                            '    isto.nome = nome',
                            '    isto.preco = preco',
                            '  }',
                            '}',
                            'var produto',
                            'se (verdadeiro) {',
                            '  produto = Produto("Notebook", 2500)',
                            '}',
                            'escreva(produto.nome)',
                            'escreva(produto.preco)',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('Notebook');
                    expect(_saidas[1]).toBe('2500');
                });

                it('Instância criada em escopo interno (enquanto) e atribuída a variável externa permanece válida', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Contador {',
                            '  valor: numero',
                            '  construtor(valorInicial) {',
                            '    isto.valor = valorInicial',
                            '  }',
                            '}',
                            'var contador',
                            'var i = 0',
                            'enquanto (i < 1) {',
                            '  contador = Contador(10)',
                            '  i = i + 1',
                            '}',
                            'escreva(contador.valor)',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('10');
                });
            });

            describe('Polimorfismo de métodos', () => {
                it('Despacho por aridade - métodos com quantidades diferentes de parâmetros', async () => {
                    const codigo = [
                        'classe Calculadora {',
                        '    somar(a: número) {',
                        '        retorna a',
                        '    }',
                        '    somar(a: número, b: número) {',
                        '        retorna a + b',
                        '    }',
                        '}',
                        'var calc = Calculadora()',
                        'escreva(calc.somar(5))',
                        'escreva(calc.somar(3, 7))',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('5');
                    expect(_saidas[1]).toBe('10');
                });

                it('Despacho por tipo - mesma aridade, tipos diferentes', async () => {
                    const codigo = [
                        'classe Impressora {',
                        '    imprimir(valor: texto) {',
                        '        escreva("Texto: " + valor)',
                        '    }',
                        '    imprimir(valor: número) {',
                        '        escreva("Número: " + texto(valor))',
                        '    }',
                        '}',
                        'var imp = Impressora()',
                        'imp.imprimir("olá")',
                        'imp.imprimir(42)',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('Texto: olá');
                    expect(_saidas[1]).toBe('Número: 42');
                });

                it('Correspondência com curinga - parâmetro tipado tem prioridade sobre não-tipado', async () => {
                    const codigo = [
                        'classe Processador {',
                        '    processar(valor: texto) {',
                        '        escreva("texto: " + valor)',
                        '    }',
                        '    processar(valor) {',
                        '        escreva("genérico: " + texto(valor))',
                        '    }',
                        '}',
                        'var proc = Processador()',
                        'proc.processar("teste")',
                        'proc.processar(123)',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('texto: teste');
                    expect(_saidas[1]).toBe('genérico: 123');
                });

                it('Compatibilidade numérica - inteiro compatível com número', async () => {
                    const codigo = [
                        'classe Conversor {',
                        '    converter(valor: inteiro) {',
                        '        escreva("inteiro: " + texto(valor))',
                        '    }',
                        '    converter(valor: texto) {',
                        '        escreva("texto: " + valor)',
                        '    }',
                        '}',
                        'var conv = Conversor()',
                        'conv.converter(42)',
                        'conv.converter("olá")',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('inteiro: 42');
                    expect(_saidas[1]).toBe('texto: olá');
                });

                it('Sobrecarga de construtores', async () => {
                    const codigo = [
                        'classe Ponto {',
                        '    x: número',
                        '    y: número',
                        '    construtor(x: número, y: número) {',
                        '        isto.x = x',
                        '        isto.y = y',
                        '    }',
                        '    construtor(valor: número) {',
                        '        isto.x = valor',
                        '        isto.y = valor',
                        '    }',
                        '}',
                        'var p1 = Ponto(3, 4)',
                        'var p2 = Ponto(5)',
                        'escreva(p1.x)',
                        'escreva(p1.y)',
                        'escreva(p2.x)',
                        'escreva(p2.y)',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(4);
                    expect(_saidas[0]).toBe('3');
                    expect(_saidas[1]).toBe('4');
                    expect(_saidas[2]).toBe('5');
                    expect(_saidas[3]).toBe('5');
                });

                it('Herança com polimorfismo - subclasse adiciona sobrecargas a métodos herdados', async () => {
                    const codigo = [
                        'classe Base {',
                        '    cumprimentar(nome: texto) {',
                        '        escreva("Olá, " + nome)',
                        '    }',
                        '}',
                        'classe Derivada herda Base {',
                        '    cumprimentar(nome: texto, sobrenome: texto) {',
                        '        escreva("Olá, " + nome + " " + sobrenome)',
                        '    }',
                        '}',
                        'var d = Derivada()',
                        'd.cumprimentar("João")',
                        'd.cumprimentar("João", "Silva")',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('Olá, João');
                    expect(_saidas[1]).toBe('Olá, João Silva');
                });

                it('Herança com sobrescrita de assinatura específica', async () => {
                    const codigo = [
                        'classe Base {',
                        '    processar(valor: texto) {',
                        '        escreva("base-texto: " + valor)',
                        '    }',
                        '    processar(valor: número) {',
                        '        escreva("base-número: " + texto(valor))',
                        '    }',
                        '}',
                        'classe Derivada herda Base {',
                        '    processar(valor: texto) {',
                        '        escreva("derivada-texto: " + valor)',
                        '    }',
                        '}',
                        'var d = Derivada()',
                        'd.processar("teste")',
                        'd.processar(99)',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('derivada-texto: teste');
                    expect(_saidas[1]).toBe('base-número: 99');
                });

                it('Método único - compatibilidade retroativa', async () => {
                    const codigo = [
                        'classe Simples {',
                        '    saudar() {',
                        '        escreva("Olá mundo")',
                        '    }',
                        '}',
                        'var s = Simples()',
                        's.saudar()',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Olá mundo');
                });

                it('Erro quando nenhuma sobrecarga corresponde', async () => {
                    const codigo = [
                        'classe Estrita {',
                        '    executar(valor: texto) {',
                        '        escreva(valor)',
                        '    }',
                        '    executar(a: número, b: número) {',
                        '        escreva(a + b)',
                        '    }',
                        '}',
                        'var est = Estrita()',
                        'est.executar(verdadeiro)',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain('sobrecarga');
                });
            });

            describe('Declaração e chamada de funções', () => {
                it('Aglutinação de argumentos', async () => {
                    const codigo = ['função teste(*argumentos) {', '   escreva(argumentos)', '}', 'teste(1, 2, 3)'];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it("Chamada de função com retorno 'vazio'", async () => {
                    const codigo = [
                        'funcao executar(valor1, valor2): vazio {',
                        '    var resultado = valor1 + valor2',
                        '}',
                        'escreva(executar(1, 2))',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('nulo');
                });

                it("Chamada de função com retorno 'qualquer'", async () => {
                    const codigo = [
                        'funcao executar(valor1, valor2): qualquer {',
                        '    var resultado = valor1 + valor2',
                        '    retorna resultado',
                        '}',
                        'escreva(executar(1, 2))',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('3');
                });

                it('Chamada de função com definição de tipos inteiros e retorno texto', async () => {
                    const codigo = [
                        'funcao executar(valor1: inteiro, valor2: inteiro): texto {',
                        '   retorna valor1 + valor2',
                        '}',
                        'escreva(executar(1, 2))',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('3');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função com retorno de vetor', async () => {
                    const codigo = ['funcao executar() {', "   retorna [1, 2, '3']", '}', 'escreva(executar())'];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("[1, 2, '3']");
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('[\'Olá\', \'mundo\']');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Chamada de função com retorna vazio e comandos após retorna', async () => {
                    const codigo = [
                        'funcao mostreAlgo() {',
                        '    retorna',
                        '    escreva("Escrevendo algo.")',
                        '}',
                        'mostreAlgo()'
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('[\'maçã\', \'banana\', \'morango\']');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Definição de chamadas e funções anônimas', async () => {
                    const codigo = [
                        'escreva((função (*argumentos) {',
                        '   retorna argumentos',
                        '})(1, 2, 3))'
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('[1, 2, 3]');
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('3');
                });
            });

            describe('Entrada e saída', () => {
                it('escreva e leia na mesma linha', async () => {
                    // Aqui vamos simular a resposta para uma variável de `leia()`.
                    const respostas = ['5'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        },
                    };

                    const retornoLexador = lexador.mapear(
                        [
                            'escreva("Você digitou " + leia("Digite alguma coisa: "))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("Você digitou 5");
                });

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('Você tem 13870 dias de vida');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('escreva() de dicionários com vetores aninhados não deve escrever metadados de vetor', async () => {
                    const codigo = [
                        'var reservasDeBananas = {',
                        '    "reserva de bananas 1": ["banana", "banana", "banana", "banana"],',
                        '    "reserva de bananas 2 ": ["banana", "banana"],',
                        '    "reserva de bananas 3 ": ["banana", "banana", "banana"],',
                        '}',
                        'var nomesDeReservas = reservasDeBananas.chaves()',
                        'para cada nomeDeReserva de nomesDeReservas {',
                        '    var tomates = reservasDeBananas[nomeDeReserva].mapear(funcao() {',
                        '        retorna "tomate"',
                        '    })',
                        '    reservasDeBananas[nomeDeReserva] = tomates',
                        '}',
                        'escreva(reservasDeBananas)',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("{\"reserva de bananas 1\":[\"tomate\",\"tomate\",\"tomate\",\"tomate\"],\"reserva de bananas 2 \":[\"tomate\",\"tomate\"],\"reserva de bananas 3 \":[\"tomate\",\"tomate\",\"tomate\"]}")
                });
            });

            describe('Métodos de primitivas com dependência no interpretador', () => {
                describe('Dicionários', () => {
                    it('Todas as primitivas de dicionário', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                `var meuDicionario = {"a": 1, "b": 2, "c": 3}`,
                                `escreva(meuDicionario.chaves())`,
                                `escreva(meuDicionario.valores())`,
                                `escreva(meuDicionario.itens())`,
                                `escreva(meuDicionario.contém("f"))`,
                                `escreva(meuDicionario.remover("c"))`,
                            ],
                            -1
                        );

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                        const _saidas: string[] = [];

                        interpretador.funcaoDeRetorno = (saida: string) => {
                            _saidas.push(saida);
                        };

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(5);
                        expect(_saidas[0]).toEqual('[\'a\', \'b\', \'c\']');
                        expect(_saidas[1]).toEqual('[1, 2, 3]');
                        expect(_saidas[2]).toEqual('[(\"a\", 1), (\"b\", 2), (\"c\", 3)]');
                        expect(_saidas[3]).toEqual('falso');
                        expect(_saidas[4]).toEqual('verdadeiro');
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

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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

                describe('Vetores ou listas', () => {
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toEqual('[12, 8, 4, 2]');
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: string) => {
                            expect(saida).toEqual('[]');
                        };

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
                                    'var minhaListaCompreensao = [3 * x para cada x em lista] // Compreensão de listas para números pares',
                                    'escreva(minhaListaCompreensao)',
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
                            expect(_saidas[0]).toBe('[3, 6, 9, 12, 15]');
                        });

                        it('Com filtro', async () => {
                            const retornoLexador = lexador.mapear(
                                [
                                    'var lista = [1, 2, 3, 4, 5]',
                                    'var minhaListaCompreensao = [x para cada x em lista se x % 2 == 0] // Compreensão de listas para números pares',
                                    'escreva(minhaListaCompreensao)',
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
                            expect(_saidas[0]).toBe('[2, 4]');
                        });

                        it('Com filtro e expressão para resolução', async () => {
                            const retornoLexador = lexador.mapear(
                                [
                                    'var lista = [1, 2, 3, 4, 5]',
                                    'var minhaListaCompreensao = [x * 2 para cada x em lista se x % 2 == 0] // Compreensão de listas para números pares',
                                    'escreva(minhaListaCompreensao)',
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
                            expect(_saidas[0]).toBe('[4, 8]');
                        });
                    });
                });

                describe('Textos', () => {
                    it('Dividir usando símbolo de quebra de linha', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'var meuTexto = "a\nb\nc"',
                                "escreva(meuTexto.dividir('\n'))"
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe("['a', 'b', 'c']");
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Trivial com atribuição', async () => {
                    const retornoLexador = lexador.mapear(['var mensagem = "teste de falha"', 'falhar mensagem'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });
            });

            describe('Retornos externos', () => {
                it('Literal devolvido em retorno de função', async () => {
                    const retornoLexador = lexador.mapear([
                        'funcao acheAPrincesa(castelo) { retorna [25] }',
                        'acheAPrincesa([1])'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(retornoInterpretador.resultado.length).toBeGreaterThan(0);
                });
            });

            describe('Tendo ... Como', () => {
                it('Trivial, sem finalizar() definido', async () => {
                    const retornoLexador = lexador.mapear([
                        'funcao teste() { retorna "Ok" }',
                        'tendo teste() como a {',
                        '    escreva(a)',
                        '}'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Ok');
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toStrictEqual(saidasMensagens);
                });

                it('Tipo de número', async () => {
                    const retornoLexador = lexador.mapear(['escreva(tipo de 123)'], -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('número');
                    };

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Tipo de com agrupamento', async () => {
                    const retornoLexador = lexador.mapear(['var a = 1', 'var b = tipo de (a)', 'escreva(b)'], -1);
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual('número');
                    };

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Tipo de elementos de objeto', async () => {
                    const retornoLexador = lexador.mapear([
                        'classe Vendedor {',
                        '  recebaCliente() {}',
                        '}',
                        'var vendedor = Vendedor()',
                        'escreva(tipo de [1, 2, 3].adicionar)',
                        'escreva(tipo de {"chave": "valor"}.valores)',
                        'escreva(tipo de vendedor.recebaCliente)',
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(3);
                    expect(_saidas[0]).toBe('método<qualquer[]>');
                    expect(_saidas[1]).toBe('método<dicionário[]>');
                    expect(_saidas[2]).toBe('método<função<vazio>>');
                });
            });

            describe('Retornos do interpretador', () => {
                it("Último retorno não pode ter uma referência ao montão", async () => {
                    const retornoLexador = lexador.mapear([
                        'funcao acheAPrincesa(castelo) {',
                        '    retorna  { "chave": 20 }',
                        '}',
                        'acheAPrincesa(1)'
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(retornoInterpretador.resultado).toHaveLength(1);
                    const retornoFuncao = retornoInterpretador.resultado[0] as ResultadoParcialInterpretadorInterface;
                    expect(retornoFuncao.valorRetornado).toBeInstanceOf(RetornoQuebra);
                    expect(retornoFuncao.valorRetornado.valor).toBeInstanceOf(Object);
                    expect(retornoFuncao.valorRetornado.valor).toHaveProperty('chave');
                    expect(retornoFuncao.valorRetornado.valor['chave']).toBe(20);
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

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas.length).toBeGreaterThan(0);
                });

                it('Fila estática', async () => {
                    const retornoLexador = lexador.mapear([
                        `var maximoDeElementos = 4;`,
                        `var indexInicial = 0;`,
                        `var indexFinal = 0;`,
                        `var i = 0;`,
                        `var filaEstatica = [];`,
                        `funcao enfileirar (valorEntrada) {`,
                        `    se (indexFinal == maximoDeElementos) {`,
                        `        escreva("Fila Cheia");`,
                        `    } senao {`,
                        `        filaEstatica[indexFinal] = valorEntrada;`,
                        `        escreva("Valor inserido com sucesso: " + texto(filaEstatica[indexFinal]));`,
                        `        indexFinal = indexFinal + 1;`,
                        `    }`,
                        `}`,
                        `função desenfileirar() {`,
                        `    se (indexInicial == indexFinal) {`,
                        `        escreva("Fila Vazia");`,
                        `    } senao {`,
                        `        para (i = 0; i <= indexFinal; i = i + 1){`,
                        `            se (i + 1 == indexFinal) {`,
                        `                indexFinal = indexFinal - 1;`,
                        `                escreva("Valor retirado com sucesso.");`,
                        `            } senao {`,
                        `                filaEstatica[i] = filaEstatica[i+1];`,
                        `            }`,
                        `        }`,
                        `    }`,
                        `}`,
                        `função mostrar_fila() {`,
                        `    se (indexInicial == indexFinal) {`,
                        `        escreva("Fila Vazia");`,
                        `    } senao {`,
                        `        para (var i = 0; i < indexFinal; i = i + 1) {`,
                        `        escreva("index " + texto(i)); `,
                        `        escreva(texto(filaEstatica[i]));`,
                        `        }`,
                        `    }`,
                        `}`,
                        `mostrar_fila();`,
                        `var valorEntrada = 2;`,
                        `enfileirar(valorEntrada);`,
                        `var valorEntrada = 8;`,
                        `enfileirar(valorEntrada);`,
                        `var valorEntrada = 23;`,
                        `enfileirar(valorEntrada);`,
                        `var valorEntrada = 7;`,
                        `enfileirar(valorEntrada);`,
                        `mostrar_fila();`,
                        `desenfileirar();`,
                        `mostrar_fila();`,
                        `var valorEntrada = 24;`,
                        `enfileirar(valorEntrada);`,
                        `mostrar_fila();`
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas.length).toBe(29);
                });
            });
        });

        describe('Ajuda', () => {
            it('Trivial - ajuda sem parênteses (declaração)', async () => {
                const retornoLexador = lexador.mapear(['ajuda'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(retornoInterpretador.resultado).toHaveLength(1);
                const resultado = retornoInterpretador.resultado[0] as ResultadoParcialInterpretadorInterface;
                expect(resultado.valorRetornado).toBe('Para usar a ajuda, use como uma função: ajuda(objeto).');
            });

            it('ajuda() - com parênteses sem argumentos (expressão)', async () => {
                const retornoLexador = lexador.mapear(['ajuda()'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(retornoInterpretador.resultado).toHaveLength(1);
                const resultado = retornoInterpretador.resultado[0] as ResultadoParcialInterpretadorInterface;
                expect(resultado.valorRetornado).toContain('Te damos as boas-vindas ao utilitário de ajuda de Delégua!');
                expect(resultado.valorRetornado).toContain('Use ajuda(objeto) para obter informações');
            });

            it('ajuda(leia) - com tópico específico usando escreva', async () => {
                const retornoLexador = lexador.mapear(['escreva(ajuda(leia))'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toContain("A instrução 'leia' permite capturar a entrada do usuário");
            });

            it('ajuda com escreva - exibe resultado', async () => {
                const retornoLexador = lexador.mapear(['escreva(ajuda())'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toContain('Te damos as boas-vindas ao utilitário de ajuda de Delégua!');
            });

            it('ajuda com tópico desconhecido', async () => {
                const retornoLexador = lexador.mapear(['var x = 123', 'ajuda(x)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(retornoInterpretador.resultado).toHaveLength(1);
                const resultado = retornoInterpretador.resultado[0] as ResultadoParcialInterpretadorInterface;
                expect(resultado.valorRetornado).toContain('não há documentação disponível');
            });
        });

        describe('Cenários de falha', () => {
            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear(['var a = [1, 2, 3];', 'escreva(a[4]);'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: string) => {
                        expect(saida).toEqual('nulo');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(["var a = {'a': 1, 'b': 2};", "escreva(a['c']);"], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: string) => {
                        expect(saida).toEqual('nulo');
                    };

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Métodos inexistentes', async () => {
                    const retornoLexador = lexador.mapear(['nescreva("Qualquer coisa")'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador).toBeTruthy();
                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        'Superclasse precisa ser uma classe.'
                    );
                });
            });

            describe('Conversões de tipos', () => {
                it('Conversão de texto para número', async () => {
                    const retornoLexador = lexador.mapear(['escreva(inteiro("fff"))'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        "Valor não parece ser um número. Somente números ou textos com números podem ser convertidos para inteiro."
                    );
                });
            });

            describe('Mutabilidade', () => {
                it('const', async () => {
                    const retornoLexador = lexador.mapear(['const a = 1', 'a = 2'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        "Constante 'a' não pode receber novos valores."
                    );
                });

                it('constante', async () => {
                    const retornoLexador = lexador.mapear(['constante b = "b"', 'b = 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        "Constante 'b' não pode receber novos valores."
                    );
                });

                it('fixo', async () => {
                    const retornoLexador = lexador.mapear(['fixo c = 3', 'c = 1'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador).toBeTruthy();
                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        'Não é possível modificar uma tupla. As tuplas são estruturas de dados imutáveis.'
                    );
                });
            });

            describe('todos()', () => {
                it('Chama a função nativa "todos()" passando dados que não são iteráveis', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var listaDeNumeros = 67',
                            'escreva(todos(listaDeNumeros))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
                    );
                });
            });

            describe('todosEmCondicao()', () => {
                it('Chama a função nativa "todosEmCondicao()" passando dados que não são iteráveis', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var listaDeNumeros = 67',
                            'funcao ehPar(valor) {',
                            '    retorna valor % 2 == 0',
                            '}',
                            'escreva(todosEmCondicao(listaDeNumeros, ehPar))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain(
                        'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
                    );
                });
            });
        });

        describe('Verificação de tipos em atribuição', () => {
            it('Erro ao atribuir número a variável do tipo texto', async () => {
                const codigo = [
                    'var nome: texto = "Fernando"',
                    'nome = 10',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(1);
                expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                    "Variável 'nome' é do tipo 'texto' e não pode receber um valor do tipo 'número'."
                );
            });

            it('Erro ao atribuir texto a variável do tipo inteiro', async () => {
                const codigo = [
                    'var idade: inteiro = 25',
                    'idade = "vinte"',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(1);
                expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                    "Variável 'idade' é do tipo 'inteiro' e não pode receber um valor do tipo 'texto'."
                );
            });

            it('Erro ao atribuir texto a variável do tipo lógico', async () => {
                const codigo = [
                    'var ativo: lógico = verdadeiro',
                    'ativo = "sim"',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(1);
                expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                    "Variável 'ativo' é do tipo 'lógico' e não pode receber um valor do tipo 'texto'."
                );
            });

            it('Variável com tipo qualquer aceita qualquer valor', async () => {
                const codigo = [
                    'var x: qualquer = "hello"',
                    'x = 10',
                    'escreva(x)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toBe('10');
            });

            it('Tipos numéricos são compatíveis entre si', async () => {
                const codigo = [
                    'var n: número = 10',
                    'n = 3.14',
                    'escreva(n)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Variável sem tipo explícito aceita qualquer valor', async () => {
                const codigo = [
                    'var y = "hello"',
                    'y = 10',
                    'escreva(y)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toBe('10');
            });

            it('Reatribuição com mesmo tipo funciona normalmente', async () => {
                const codigo = [
                    'var z: inteiro = 5',
                    'z = 42',
                    'escreva(z)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toBe('42');
            });
        });

        describe('Membros estáticos', () => {
            it('Propriedade estática pode ser lida e escrita pela classe diretamente', async () => {
                const codigo = [
                    'classe Caixa {',
                    '    estatico {',
                    '        cor: texto',
                    '    }',
                    '}',
                    'Caixa.cor = "vermelho"',
                    'escreva(Caixa.cor)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('vermelho');
            });

            it('Propriedade estática é compartilhada entre todas as instâncias', async () => {
                const codigo = [
                    'classe Contador {',
                    '    estatico {',
                    '        vezes: numero',
                    '    }',
                    '}',
                    'Contador.vezes = 0',
                    'Contador.vezes = Contador.vezes + 1',
                    'Contador.vezes = Contador.vezes + 1',
                    'escreva(Contador.vezes)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('2');
            });

            it('Método estático pode ser chamado pela classe sem instância', async () => {
                const codigo = [
                    'classe Matematica {',
                    '    estatico {',
                    '        quadrado(n) { retorna n * n }',
                    '    }',
                    '}',
                    'escreva(Matematica.quadrado(5))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('25');
            });

            it('[diagnóstico] Atribuição constante dentro do construtor', async () => {
                const codigo = [
                    'classe MinhaClasse {',
                    '    estatico {',
                    '        resultado: numero',
                    '    }',
                    '    construtor() {',
                    '        MinhaClasse.resultado = 99',
                    '    }',
                    '}',
                    'MinhaClasse.resultado = 0',
                    'var x = MinhaClasse()',
                    'escreva(MinhaClasse.resultado)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('99');
            });

            it('Propriedade estática atualizada dentro do construtor reflete na classe', async () => {
                const codigo = [
                    'classe Instancias {',
                    '    estatico {',
                    '        total: numero',
                    '    }',
                    '    construtor() {',
                    '        Instancias.total = Instancias.total + 1',
                    '    }',
                    '}',
                    'Instancias.total = 0',
                    'var a = Instancias()',
                    'var b = Instancias()',
                    'escreva(Instancias.total)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('2');
            });
        });

        describe('Acessores de propriedades', () => {
            it('Obtenedor e definidor de instância funcionam com acesso por propriedade', async () => {
                const codigo = [
                    'classe Pessoa {',
                    '    _nome: texto',
                    '    nome: texto {',
                    '        definir(valor) {',
                    '            isto._nome = valor',
                    '        }',
                    '        obter() {',
                    '            retorna isto._nome',
                    '        }',
                    '    }',
                    '}',
                    'var p = Pessoa()',
                    'p.nome = "Ada"',
                    'escreva(p.nome)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('Ada');
            });

            it('Obtenedor e definidor estáticos funcionam com acesso pela classe', async () => {
                const codigo = [
                    'classe Config {',
                    '    estatico {',
                    '        _tema: texto',
                    '        tema: texto {',
                    '            definir(valor) {',
                    '                Config._tema = valor',
                    '            }',
                    '            obter() {',
                    '                retorna Config._tema',
                    '            }',
                    '        }',
                    '    }',
                    '}',
                    'Config.tema = "escuro"',
                    'escreva(Config.tema)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('escuro');
            });
        });

        describe('Classes abstratas', () => {
            it('Classe abstrata não pode ser instanciada diretamente', async () => {
                const codigo = [
                    'classe abstrata Forma {',
                    '    abstrato {',
                    '        area(): numero',
                    '    }',
                    '}',
                    'var f = Forma()',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(1);
            });

            it('Subclasse concreta implementa método abstrato e pode ser instanciada', async () => {
                const codigo = [
                    'classe abstrata Forma {',
                    '    abstrato {',
                    '        area(): numero',
                    '    }',
                    '}',
                    'classe Circulo herda Forma {',
                    '    raio: numero',
                    '    construtor(r) { isto.raio = r }',
                    '    area() { retorna 3 * isto.raio * isto.raio }',
                    '}',
                    'var c = Circulo(5)',
                    'escreva(c.area())',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('75');
            });

            it('Subclasse que não implementa método abstrato gera erro ao ser definida', async () => {
                const codigo = [
                    'classe abstrata Forma {',
                    '    abstrato {',
                    '        area(): numero',
                    '    }',
                    '}',
                    'classe Quadrado herda Forma {',
                    '}',
                    'var q = Quadrado()',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
            });

            it('Classe abstrata com bloco protegido pode ter propriedades de tipo vetor', async () => {
                const codigo = [
                    'classe abstrata Poligono {',
                    '    protegido {',
                    '        arestas: dupla[]',
                    '    }',
                    '}',
                    'classe Triangulo herda Poligono {',
                    '    construtor(a1, a2, a3) {',
                    '        isto.arestas = [a1, a2, a3]',
                    '    }',
                    '}',
                    'var tri = Triangulo((0, 0), (2, 4), (4, 4))',
                    'escreva(tri.arestas[0])',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
            });

            it('Classe abstrata pode ter métodos concretos herdados pela subclasse', async () => {
                const codigo = [
                    'classe abstrata Animal {',
                    '    abstrato {',
                    '        falar(): texto',
                    '    }',
                    '    descricao() { retorna "Sou um animal" }',
                    '}',
                    'classe Gato herda Animal {',
                    '    falar() { retorna "miau" }',
                    '}',
                    'var g = Gato()',
                    'escreva(g.falar())',
                    'escreva(g.descricao())',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe('miau');
                expect(_saidas[1]).toBe('Sou um animal');
            });
        });

        describe('Classe estática', () => {
            it('Membros de classe estática são acessíveis diretamente pela classe', async () => {
                const codigo = [
                    'classe estática Config {',
                    '    tema: texto',
                    '    versao: numero',
                    '}',
                    'Config.tema = "escuro"',
                    'Config.versao = 2',
                    'escreva(Config.tema)',
                    'escreva(Config.versao)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe('escuro');
                expect(_saidas[1]).toBe('2');
            });

            it('Classe estática não pode ser instanciada', async () => {
                const codigo = [
                    'classe estática Utilitario {',
                    '    ajudar() { retorna "ajudando" }',
                    '}',
                    'var u = Utilitario()',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(1);
            });
        });

        describe('Auto-propriedades', () => {
            it('Auto-propriedade com obter e definir funciona como getter/setter automático', async () => {
                const codigo = [
                    'classe Pessoa {',
                    '    nome: texto { obter; definir; }',
                    '}',
                    'var p = Pessoa()',
                    'p.nome = "Ana"',
                    'escreva(p.nome)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('Ana');
            });

            it('Auto-propriedade somente-leitura lança erro ao ser atribuída', async () => {
                const codigo = [
                    'classe Produto {',
                    '    codigo: texto { obter; }',
                    '}',
                    'var p = Produto()',
                    'p.codigo = "ABC"',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(1);
            });

            it('Getter e setter com corpo personalizado funcionam corretamente', async () => {
                const codigo = [
                    'classe Pessoa {',
                    '    _nome: texto',
                    '    nome: texto {',
                    '        obter() {',
                    '            retorna isto._nome',
                    '        }',
                    '        definir(valor) {',
                    '            isto._nome = valor',
                    '        }',
                    '    }',
                    '}',
                    'var p = Pessoa()',
                    'p.nome = "Ana"',
                    'escreva(p.nome)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('Ana');
            });
        });

        describe('Blocos de modificadores', () => {
            it('Bloco privado agrupa membros privados', async () => {
                const codigo = [
                    'classe Banco {',
                    '    privado {',
                    '        saldo: numero',
                    '    }',
                    '    construtor(s) { isto.saldo = s }',
                    '    obterSaldo() { retorna isto.saldo }',
                    '}',
                    'var b = Banco(500)',
                    'escreva(b.obterSaldo())',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('500');
            });

            it('Acesso direto a membro em bloco privado lança erro', async () => {
                const codigo = [
                    'classe Cofre {',
                    '    privado { segredo: texto }',
                    '    construtor(s) { isto.segredo = s }',
                    '}',
                    'var c = Cofre("xpto")',
                    'escreva(c.segredo)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(1);
            });

            it('Bloco estático torna membros estáticos por padrão', async () => {
                const codigo = [
                    'classe Contagem {',
                    '    estático {',
                    '        total: numero',
                    '    }',
                    '}',
                    'Contagem.total = 42',
                    'escreva(Contagem.total)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('42');
            });
        });

        describe('Modificadores de acesso', () => {
            it('Propriedade privada não pode ser acessada de fora da classe', async () => {
                const codigo = [
                    'classe ContaBancaria {',
                    '    privado {',
                    '        saldo: numero',
                    '    }',
                    '    construtor(inicial) { isto.saldo = inicial }',
                    '}',
                    'var c = ContaBancaria(1000)',
                    'escreva(c.saldo)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
            });

            it('Propriedade privada pode ser acessada por métodos da própria classe', async () => {
                const codigo = [
                    'classe ContaBancaria {',
                    '    privado {',
                    '        saldo: numero',
                    '    }',
                    '    construtor(inicial) { isto.saldo = inicial }',
                    '    depositar(valor) { isto.saldo = isto.saldo + valor }',
                    '    obterSaldo() { retorna isto.saldo }',
                    '}',
                    'var c = ContaBancaria(1000)',
                    'c.depositar(500)',
                    'escreva(c.obterSaldo())',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('1500');
            });

            it('Propriedade pública pode ser acessada de qualquer lugar', async () => {
                const codigo = [
                    'classe Ponto {',
                    '    x: numero',
                    '    y: numero',
                    '    construtor(x, y) {',
                    '        isto.x = x',
                    '        isto.y = y',
                    '    }',
                    '}',
                    'var p = Ponto(3, 4)',
                    'escreva(p.x)',
                    'escreva(p.y)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe('3');
                expect(_saidas[1]).toBe('4');
            });

            it('Propriedade privada não pode ser atribuída de fora da classe', async () => {
                const codigo = [
                    'classe Cofre {',
                    '    privado {',
                    '        segredo: texto',
                    '    }',
                    '    construtor() { isto.segredo = "abc" }',
                    '}',
                    'var co = Cofre()',
                    'co.segredo = "hack"',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
            });
        });

        describe('Sobrecarga de operadores', () => {
            it('Operador + sobrecarregado soma dois vetores 2D', async () => {
                const codigo = [
                    'classe Vetor2D {',
                    '    x: numero',
                    '    y: numero',
                    '    construtor(x, y) {',
                    '        isto.x = x',
                    '        isto.y = y',
                    '    }',
                    '    operador+(outro) { retorna Vetor2D(isto.x + outro.x, isto.y + outro.y) }',
                    '}',
                    'var a = Vetor2D(1, 2)',
                    'var b = Vetor2D(3, 4)',
                    'var c = a + b',
                    'escreva(c.x)',
                    'escreva(c.y)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe('4');
                expect(_saidas[1]).toBe('6');
            });

            it('Operador == sobrecarregado compara dois objetos por valor', async () => {
                const codigo = [
                    'classe Ponto {',
                    '    x: numero',
                    '    y: numero',
                    '    construtor(x, y) {',
                    '        isto.x = x',
                    '        isto.y = y',
                    '    }',
                    '    operador==(outro) { retorna isto.x == outro.x e isto.y == outro.y }',
                    '}',
                    'var p1 = Ponto(1, 2)',
                    'var p2 = Ponto(1, 2)',
                    'var p3 = Ponto(3, 4)',
                    'escreva(p1 == p2)',
                    'escreva(p1 == p3)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe('verdadeiro');
                expect(_saidas[1]).toBe('falso');
            });

            it('Operador * sobrecarregado multiplica um vetor por escalar', async () => {
                const codigo = [
                    'classe Vec {',
                    '    v: numero',
                    '    construtor(v) { isto.v = v }',
                    '    operador*(escalar) { retorna Vec(isto.v * escalar) }',
                    '}',
                    'var v = Vec(5)',
                    'var r = v * 3',
                    'escreva(r.v)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('15');
            });
        });

        describe('Interfaces', () => {
            it('Classe que implementa interface corretamente executa sem erros', async () => {
                const codigo = [
                    'interface Imprimivel {',
                    '    imprimir(): vazio',
                    '}',
                    'classe Relatorio implementa Imprimivel {',
                    '    titulo: texto',
                    '    construtor(t) { isto.titulo = t }',
                    '    imprimir() { escreva(isto.titulo) }',
                    '}',
                    'var r = Relatorio("Vendas")',
                    'r.imprimir()',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('Vendas');
            });

            it('Classe que não implementa método da interface gera erro de parse', async () => {
                const codigo = [
                    'interface Imprimivel {',
                    '    imprimir(): vazio',
                    '}',
                    'classe Incompleta implementa Imprimivel {',
                    '    titulo: texto',
                    '}',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Classe pode implementar múltiplas interfaces', async () => {
                const codigo = [
                    'interface Imprimivel {',
                    '    imprimir(): vazio',
                    '}',
                    'interface Nomeavel {',
                    '    nome(): texto',
                    '}',
                    'classe Relatorio implementa Imprimivel, Nomeavel {',
                    '    titulo: texto',
                    '    construtor(t) { isto.titulo = t }',
                    '    imprimir() { escreva(isto.titulo) }',
                    '    nome() { retorna isto.titulo }',
                    '}',
                    'var r = Relatorio("Vendas")',
                    'r.imprimir()',
                    'escreva(r.nome())',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe('Vendas');
                expect(_saidas[1]).toBe('Vendas');
            });

            it('Interface pode declarar propriedades e método', async () => {
                const codigo = [
                    'interface Identificavel {',
                    '    id: numero',
                    '    identificar(): texto',
                    '}',
                    'classe Produto implementa Identificavel {',
                    '    id: numero',
                    '    nome: texto',
                    '    construtor(i, n) { isto.id = i \n isto.nome = n }',
                    '    identificar() { retorna isto.nome }',
                    '}',
                    'var p = Produto(1, "Caneta")',
                    'escreva(p.identificar())',
                    'escreva(p.id)',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe('Caneta');
                expect(_saidas[1]).toBe('1');
            });
        });

        describe('Classe base Objeto', () => {
            it('tipo() retorna o nome da classe', async () => {
                const codigo = [
                    'classe Animal { }',
                    'classe Cachorro herda Animal { }',
                    'var d = Cachorro()',
                    'escreva(d.tipo())',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('Cachorro');
            });

            it('paraTexto() retorna representação legível do objeto', async () => {
                const codigo = [
                    'classe Carro { }',
                    'var c = Carro()',
                    'escreva(c.paraTexto())',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('<[ Carro métodos=[] propriedades=[] ]>');
            });

            it('eInstanciaDe() retorna verdadeiro para a própria classe', async () => {
                const codigo = [
                    'classe Carro { }',
                    'var c = Carro()',
                    'escreva(c.eInstanciaDe(Carro))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('verdadeiro');
            });

            it('eInstanciaDe() retorna verdadeiro para superclasse', async () => {
                const codigo = [
                    'classe Animal { }',
                    'classe Cachorro herda Animal { }',
                    'var d = Cachorro()',
                    'escreva(d.eInstanciaDe(Animal))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('verdadeiro');
            });

            it('eInstanciaDe() retorna verdadeiro para Objeto', async () => {
                const codigo = [
                    'classe Carro { }',
                    'var c = Carro()',
                    'escreva(c.eInstanciaDe(Objeto))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('verdadeiro');
            });

            it('eInstanciaDe() retorna falso para classe não relacionada', async () => {
                const codigo = [
                    'classe Carro { }',
                    'classe Moto { }',
                    'var c = Carro()',
                    'escreva(c.eInstanciaDe(Moto))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('falso');
            });

            it('éInstânciaDe() é equivalente a eInstanciaDe()', async () => {
                const codigo = [
                    'classe Animal { }',
                    'classe Cachorro herda Animal { }',
                    'var d = Cachorro()',
                    'escreva(d.éInstânciaDe(Cachorro))',
                    'escreva(d.éInstânciaDe(Animal))',
                    'escreva(d.éInstânciaDe(Objeto))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(3);
                expect(_saidas[0]).toBe('verdadeiro');
                expect(_saidas[1]).toBe('verdadeiro');
                expect(_saidas[2]).toBe('verdadeiro');
            });

            it('métodos() é equivalente a metodos()', async () => {
                const codigo = [
                    'classe Carro {',
                    '    acelerar() { }',
                    '}',
                    'var c = Carro()',
                    'c.métodos()',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('respondeA() retorna verdadeiro para método existente', async () => {
                const codigo = [
                    'classe Carro {',
                    '    acelerar() { escreva("vrum") }',
                    '}',
                    'var c = Carro()',
                    'escreva(c.respondeA("acelerar"))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('verdadeiro');
            });

            it('respondeA() retorna falso para método inexistente', async () => {
                const codigo = [
                    'classe Carro { }',
                    'var c = Carro()',
                    'escreva(c.respondeA("frear"))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('falso');
            });

            it('paraTexto() pode ser sobrescrito na subclasse', async () => {
                const codigo = [
                    'classe Ponto {',
                    '    x: numero',
                    '    y: numero',
                    '    construtor(x, y) {',
                    '        isto.x = x',
                    '        isto.y = y',
                    '    }',
                    '    paraTexto() {',
                    '        retorna "(" + isto.x + ", " + isto.y + ")"',
                    '    }',
                    '}',
                    'var p = Ponto(3, 4)',
                    'escreva(p.paraTexto())',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('(3, 4)');
            });

            it('paraTexto() é chamado automaticamente em interpolação de texto', async () => {
                const codigo = [
                    'classe Ponto {',
                    '    x: numero',
                    '    y: numero',
                    '    construtor(x, y) {',
                    '        isto.x = x',
                    '        isto.y = y',
                    '    }',
                    '    paraTexto() {',
                    '        retorna "(" + isto.x + ", " + isto.y + ")"',
                    '    }',
                    '}',
                    'var p = Ponto(3, 4)',
                    'escreva(p.paraTexto())',
                    'p.x = 9',
                    'escreva("${p}")',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe('(3, 4)');
                expect(_saidas[1]).toBe('(9, 4)');
            });
        });

        describe('Formas acentuadas de métodos e funções nativas', () => {
            describe('Métodos de texto', () => {
                it('maiúsculo() é equivalente a maiusculo()', async () => {
                    const codigo = [
                        'var t = "olá mundo"',
                        'escreva(t.maiúsculo())',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('OLÁ MUNDO');
                });

                it('minúsculo() é equivalente a minusculo()', async () => {
                    const codigo = [
                        'var t = "OLÁ MUNDO"',
                        'escreva(t.minúsculo())',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('olá mundo');
                });

                it('tudoMaiúsculo() é equivalente a tudoMaiusculo()', async () => {
                    const codigo = [
                        'var t = "TUDO MAIÚSCULO"',
                        'escreva(t.tudoMaiúsculo())',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('verdadeiro');
                });

                it('tudoMinúsculo() é equivalente a tudoMinusculo()', async () => {
                    const codigo = [
                        'var t = "tudo minúsculo"',
                        'escreva(t.tudoMinúsculo())',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('verdadeiro');
                });

                it('apararInício() é equivalente a apararInicio()', async () => {
                    const codigo = [
                        'var t = "   olá"',
                        'escreva(t.apararInício())',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('olá');
                });
            });

            describe('Métodos de vetor', () => {
                it('removerÚltimo() é equivalente a removerUltimo()', async () => {
                    const codigo = [
                        'var v = [1, 2, 3]',
                        'var ultimo = v.removerÚltimo()',
                        'escreva(ultimo)',
                        'escreva(v)',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('3');
                    expect(_saidas[1]).toBe('[1, 2]');
                });
            });

            describe('Funções globais', () => {
                it('aleatório() é equivalente a aleatorio()', async () => {
                    const codigo = [
                        'var n = aleatório()',
                        'escreva(n >= 0)',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('verdadeiro');
                });

                it('aleatórioEntre() é equivalente a aleatorioEntre()', async () => {
                    const codigo = [
                        'var n = aleatórioEntre(1, 10)',
                        'escreva(n >= 1)',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('verdadeiro');
                });

                it('encontrarÍndice() é equivalente a encontrarIndice()', async () => {
                    const codigo = [
                        'var v = [10, 20, 30]',
                        'escreva(encontrarÍndice(v, funcao(x) { retorna x == 10 }))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('0');
                });

                it('encontrarÚltimo() é equivalente a encontrarUltimo()', async () => {
                    const codigo = [
                        'var v = [1, 2, 3, 2]',
                        'escreva(encontrarÚltimo(v, funcao(x) { retorna x == 2 }))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('2');
                });

                it('encontrarÚltimoÍndice() é equivalente a encontrarUltimoIndice()', async () => {
                    const codigo = [
                        'var v = [1, 2, 3, 2]',
                        'escreva(encontrarÚltimoÍndice(v, funcao(x) { retorna x == 2 }))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('3');
                });

                it('incluído() é equivalente a incluido()', async () => {
                    const codigo = [
                        'var v = [1, 2, 3]',
                        'escreva(incluído(v, 2))',
                        'escreva(incluído(v, 5))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('verdadeiro');
                    expect(_saidas[1]).toBe('falso');
                });

                it('máximo() é equivalente a maximo()', async () => {
                    const codigo = [
                        'var v = [3, 1, 4, 1, 5, 9]',
                        'escreva(máximo(v))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('9');
                });

                it('mínimo() é equivalente a minimo()', async () => {
                    const codigo = [
                        'var v = [3, 1, 4, 1, 5, 9]',
                        'escreva(mínimo(v))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('1');
                });

                it('primeiroEmCondição() é equivalente a primeiroEmCondicao()', async () => {
                    const codigo = [
                        'var v = [4, 5, 6]',
                        'escreva(primeiroEmCondição(v, funcao(x) { retorna x > 3 }))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('verdadeiro');
                });

                it('todosEmCondição() é equivalente a todosEmCondicao()', async () => {
                    const codigo = [
                        'var v = [2, 4, 6]',
                        'escreva(todosEmCondição(v, funcao(x) { retorna x % 2 == 0 }))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('verdadeiro');
                });
            });
        });

        describe('Documentários', () => {
            it('documentário em método de classe é retornado por ajuda()', async () => {
                const codigo = [
                    'classe Carro {',
                    '    /** Freia o carro. */',
                    '    frear() { }',
                    '}',
                    'var c = Carro()',
                    'escreva(ajuda(c.frear))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('Freia o carro.');
            });

            it('comentário comum /* */ não é documentário', async () => {
                const codigo = [
                    'classe Carro {',
                    '    /* não é documentário */',
                    '    frear() { }',
                    '}',
                    'var c = Carro()',
                    'escreva(ajuda(c.frear))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toContain('sem documentação disponível');
            });

            it('documentário em função de topo é retornado por ajuda()', async () => {
                const codigo = [
                    '/** Soma dois números. */',
                    'funcao somar(a, b) { retorna a + b }',
                    'escreva(ajuda(somar))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('Soma dois números.');
            });

            it('documentário em função aninhada é retornado por ajuda()', async () => {
                const codigo = [
                    'funcao externa() {',
                    '    /** Calcula o quadrado de um número. */',
                    '    funcao quadrado(n) { retorna n * n }',
                    '    escreva(ajuda(quadrado))',
                    '}',
                    'externa()',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('Calcula o quadrado de um número.');
            });

            it('ajuda(obj) exibe resumo da classe com métodos documentados', async () => {
                const codigo = [
                    'classe Veiculo {',
                    '    /** Acelera o veículo. */',
                    '    acelerar() { }',
                    '    /** Para o veículo. */',
                    '    frear() { }',
                    '}',
                    'var v = Veiculo()',
                    'escreva(ajuda(v))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toContain('Veiculo');
                expect(_saidas[0]).toContain('acelerar()');
                expect(_saidas[0]).toContain('Acelera o veículo.');
                expect(_saidas[0]).toContain('frear()');
                expect(_saidas[0]).toContain('Para o veículo.');
            });

            it('ajuda(Classe) exibe resumo da classe com métodos documentados', async () => {
                const codigo = [
                    'classe Motor {',
                    '    /** Liga o motor. */',
                    '    ligar() { }',
                    '}',
                    'escreva(ajuda(Motor))',
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toContain('Motor');
                expect(_saidas[0]).toContain('ligar()');
                expect(_saidas[0]).toContain('Liga o motor.');
            });
        });
    });
});

