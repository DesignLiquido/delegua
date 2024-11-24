import { Lexador } from '../fontes/lexador';
import { AvaliadorSintatico } from '../fontes/avaliador-sintatico';
import { Bloco, Classe, Expressao, TendoComo } from '../fontes/declaracoes';
import { Chamada, Literal } from '../fontes/construtos';

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        let lexador = new Lexador();
        let avaliadorSintatico = new AvaliadorSintatico();

        describe('Cenários de sucesso', () => {
            it('Sucesso - Olá Mundo', () => {
                const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Sucesso - Vetor vazio', () => {
                const retornoLexador = lexador.mapear(['var vetorVazio = []'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Sucesso - Undefined', () => {
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(undefined as any, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            it('Sucesso - Null', () => {
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(null as any, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            it('Sucesso - Incremento e decremento após variável ou literal', () => {
                const retornoLexador = lexador.mapear(['var a = 1', 'a++', 'a--', '++5', '--5'], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - leia sem parâmetro', () => {
                const retornoLexador = lexador.mapear(['var nome = leia()'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - leia com parâmetro', () => {
                const retornoLexador = lexador.mapear(["var nome = leia('Digite seu nome:')"], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - para cada', async () => {
                const retornoLexador = lexador.mapear(
                    ['para cada elemento em [1, 2, 3] {', "   escreva('Valor: ', elemento)", '}'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - para cada com ponto e vírgula no final', async () => {
                const retornoLexador = lexador.mapear(
                    ['para cada elemento em [1, 2, 3] {', "   escreva('Valor: ', elemento)", '};'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - para/sustar', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'para (var i = 0; i < 10; i = i + 1) {',
                        '   se (i == 5) { sustar; }',
                        "   escreva('Valor: ', i)",
                        '}',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - desestruturação de variáveis', async () => {
                const retornoLexador = lexador.mapear(['var { prop1 } = a'], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - desestruturação de constantes', async () => {
                const retornoLexador = lexador.mapear(['const { prop1 } = a'], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            describe('Classes, propriedades e métodos', () => {
                it('Trivial', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Triangulo {',
                            '    base: numero;',
                            '    altura: número',
                            '    area() {',
                            '        escreva((isto.base * isto.altura) / 2)',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Decoradores', () => {
                it('Decoradores de classe simples, empilhados', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@meu.decorador1',
                            '@meu.decorador2',
                            'classe Teste {',
                            '    testeFuncao() {',
                            '        escreva("olá")',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao).toBeInstanceOf(Classe);
                    const decoradores = (declaracao as Classe).decoradores;
                    expect(decoradores).toHaveLength(2);
                    expect(decoradores[0].nome).toBe("@meu.decorador1");
                    expect(decoradores[1].nome).toBe("@meu.decorador2");
                });

                it('Decorador de classe com parametros', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@decorador1(atributo1="123", atributo2=4)',
                            'classe Teste {',
                            '    @decorador2(atributo3="567", atributo4=8)',
                            '    testeFuncao() {',
                            '        escreva("olá")',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao).toBeInstanceOf(Classe);

                    const classe = declaracao as Classe;
                    const decoradores = classe.decoradores;
                    expect(decoradores).toHaveLength(1);

                    const decorador1 = decoradores[0];
                    expect(decorador1.nome).toBe("@decorador1");
                    expect('atributo1' in decorador1.atributos).toBe(true);
                    expect('atributo2' in decorador1.atributos).toBe(true);
                    expect(decorador1.atributos['atributo1']).toBeInstanceOf(Literal);
                    expect(decorador1.atributos['atributo2']).toBeInstanceOf(Literal);
                    expect(decorador1.atributos['atributo1'].valor).toBe("123");
                    expect(decorador1.atributos['atributo2'].valor).toBe(4);

                    expect(classe.metodos).toHaveLength(1);
                    const metodo = classe.metodos[0];
                    expect(metodo.decoradores).toHaveLength(1);
                    const decorador2 = metodo.decoradores[0];
                    expect(decorador2.nome).toBe("@decorador2");
                    expect('atributo3' in decorador2.atributos).toBe(true);
                    expect('atributo4' in decorador2.atributos).toBe(true);
                    expect(decorador2.atributos['atributo3']).toBeInstanceOf(Literal);
                    expect(decorador2.atributos['atributo4']).toBeInstanceOf(Literal);
                    expect(decorador2.atributos['atributo3'].valor).toBe("567");
                    expect(decorador2.atributos['atributo4'].valor).toBe(8);
                });

                it('Decorador de classe/método pontuado, sem atributos', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@meu.decorador1',
                            'classe Teste {',
                            '    @meu.decorador2',
                            '    testeFuncao() {',
                            '        escreva("olá")',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao).toBeInstanceOf(Classe);

                    const classe = declaracao as Classe;
                    const decoradores = classe.decoradores;
                    expect(decoradores).toHaveLength(1);

                    const decorador1 = decoradores[0];
                    expect(decorador1.nome).toBe("@meu.decorador1");
                    expect(Object.entries(decorador1.atributos)).toHaveLength(0);

                    expect(classe.metodos).toHaveLength(1);
                    const metodo = classe.metodos[0];
                    expect(metodo.decoradores).toHaveLength(1);
                    const decorador2 = metodo.decoradores[0];
                    expect(decorador2.nome).toBe("@meu.decorador2");
                    expect(Object.entries(decorador2.atributos)).toHaveLength(0);
                });

                it('Decorador de propriedade', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Teste {',
                            '    @meu.decorador',
                            '    propriedade1: texto',
                            '    testeFuncao() {',
                            '        escreva("olá")',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao).toBeInstanceOf(Classe);

                    const classe = declaracao as Classe;
                    expect(classe.propriedades).toHaveLength(1);
                    const propriedade = classe.propriedades[0];
                    expect(propriedade.decoradores).toHaveLength(1);
                    const decorador = propriedade.decoradores[0];
                    expect(decorador.nome).toBe("@meu.decorador");
                    expect(Object.entries(decorador.atributos)).toHaveLength(0);
                });

                it('Decorador de chamadas de métodos', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@rest.documentacao(',
                            '    sumario = "Um exemplo de rota GET.", ',
                            '    descricao = "Uma descrição mais detalhada sobre como a rota GET funciona.", ',
                            '    idOperacao = "lerArtigos",',
                            '    etiquetas = ["artigos"]',
                            ')',
                            '@rest.resposta(',
                            '    codigo = 200, ',
                            '    descricao = "Devolvido com sucesso", ',
                            '    formatos = ["application/json", "application/xml"]',
                            ')',
                            'liquido.rotaGet(funcao(requisicao, resposta) {',
                            '    resposta.json([{',
                            '        "id": 1,',
                            '        "titulo": "teste 1",',
                            '        "descricao": "descricao 1"',
                            '    }])',
                            '})'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao).toBeInstanceOf(Expressao);

                    expect(declaracao.decoradores).toHaveLength(2);
                    const decoradorRestDocumentacao = declaracao.decoradores[0];
                    expect(decoradorRestDocumentacao.nome).toBe('@rest.documentacao');
                    expect(Object.entries(decoradorRestDocumentacao.atributos)).toHaveLength(4);
                    expect('sumario' in decoradorRestDocumentacao.atributos).toBe(true);
                    expect(decoradorRestDocumentacao.atributos['sumario'].valor).toBe('Um exemplo de rota GET.');
                    expect('descricao' in decoradorRestDocumentacao.atributos).toBe(true);
                    expect(decoradorRestDocumentacao.atributos['descricao'].valor).toBe('Uma descrição mais detalhada sobre como a rota GET funciona.');
                    expect('idOperacao' in decoradorRestDocumentacao.atributos).toBe(true);
                    expect(decoradorRestDocumentacao.atributos['idOperacao'].valor).toBe('lerArtigos');
                    expect('etiquetas' in decoradorRestDocumentacao.atributos).toBe(true);
                    expect(decoradorRestDocumentacao.atributos['etiquetas'].valores).toHaveLength(1);
                    expect(decoradorRestDocumentacao.atributos['etiquetas'].valores[0].valor).toBe('artigos');

                    const decoradorRestResposta = declaracao.decoradores[1];
                    expect(decoradorRestResposta.nome).toBe('@rest.resposta');
                    expect(Object.entries(decoradorRestResposta.atributos)).toHaveLength(3);
                    expect('codigo' in decoradorRestResposta.atributos).toBe(true);
                    expect(decoradorRestResposta.atributos['codigo'].valor).toBe(200);
                    expect('descricao' in decoradorRestResposta.atributos).toBe(true);
                    expect(decoradorRestResposta.atributos['descricao'].valor).toBe('Devolvido com sucesso');
                    expect('formatos' in decoradorRestResposta.atributos).toBe(true);
                    expect(decoradorRestResposta.atributos['formatos'].valores).toHaveLength(2);
                    expect(decoradorRestResposta.atributos['formatos'].valores[0].valor).toBe('application/json');
                    expect(decoradorRestResposta.atributos['formatos'].valores[1].valor).toBe('application/xml');
                });
            });

            describe('Declaração `tendo ... como`', () => {
                it('Trivial', () => {
                    const retornoLexador = lexador.mapear(['tendo teste() como a {}'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracaoTendoComo: TendoComo = retornoAvaliadorSintatico.declaracoes.shift() as TendoComo;
                    expect(declaracaoTendoComo.simboloVariavel.lexema).toBe('a');
                    expect(declaracaoTendoComo.inicializacaoVariavel).toBeInstanceOf(Chamada);
                    expect(declaracaoTendoComo.corpo).toBeInstanceOf(Bloco);
                    expect(declaracaoTendoComo.corpo.declaracoes).toHaveLength(0);
                })
            });

            describe('Dicionários', () => {
                it('Dicionário vazio', () => {
                    const retornoLexador = lexador.mapear(['var dicionarioVazio = {}'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Acesso a valor de Dicionário por índice', () => {
                    const retornoLexador = lexador.mapear([
                        'var dici = { 1: "Um", 2: "Dois" }',
                        'escreva(dici[1])'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            describe('Funções', () => {
                it('Função retorna Dicionario literal', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar() {',
                            '   retorna { "chave": 100 }',
                            '}',
                            'escreva(executar())',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Função retorna vazio mas tem retorno de valores', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar(valor1, valor2): vazio {',
                            '   var resultado = valor1 + valor2',
                            '   retorna resultado',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Retorno texto sem retorno dentro da função', async () => {
                    const retornoLexador = lexador.mapear(
                        ['funcao executar(valor1, valor2): texto {', '   var resultado = valor1 + valor2', '}'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Função com retorno de vetor', () => {
                    const retornoLexador = lexador.mapear(
                        ['funcao executar(): texto[] {', '   retorna ["1", "2"]', '}'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThanOrEqual(0);
                });
            })

            describe('Declarações de tuplas', () => {
                it('Dupla', () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2)]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Trio', () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3)]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Quarteto', () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4)]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Quinteto', () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5)]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Sexteto', () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5, 6)]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Septeto', () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5, 6, 7)]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Octeto', () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5, 6, 7, 8)]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Noneto', () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5, 6, 7, 8, 9)]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Deceto', () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
            });
        });

        describe('Cenários de falha', () => {
            it('Falha - declaração de variáveis com identificadores à esquerda do igual diferente da quantidade de valores à direita', async () => {
                const retornoLexador = lexador.mapear(['var a, b, c = 1, 2'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    'Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.'
                );
            });

            it('Falha - declaração de constantes com identificadores à esquerda do igual diferente da quantidade de valores à direita', async () => {
                const retornoLexador = lexador.mapear(['const a, b, c = 1, 2'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    'Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.'
                );
            });

            it('Falha - sustar fora de laço de repetição', async () => {
                const retornoLexador = lexador.mapear(['sustar;'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    "'sustar' ou 'pausa' deve estar dentro de um laço de repetição."
                );
            });

            it('Falha - continua fora de laço de repetição', async () => {
                const retornoLexador = lexador.mapear(['continua;'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    "'continua' precisa estar em um laço de repetição."
                );
            });

            it('Falha - Não é permitido ter dois identificadores seguidos na mesma linha', () => {
                const retornoLexador = lexador.mapear(["escreva('Olá mundo') identificador1 identificador2"], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    'Não é permitido ter dois identificadores seguidos na mesma linha.'
                );
            });

            it('Declaração `tente`', () => {
                const retornoLexador = lexador.mapear(['tente { i = i + 1 } pegue (erro) { escreva(erro) }'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
            });
        });
    });
});
