import { Lexador } from '../../fontes/lexador';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Ajuda, Bloco, Classe, Const, Escreva, Expressao, FuncaoDeclaracao, Importar, ParaCada, Retorna, TendoComo, Tente, Var } from '../../fontes/declaracoes';
import { Binario, Chamada, Elvis, FuncaoConstruto, Leia, Literal, Logico, SeTernario, Variavel } from '../../fontes/construtos';

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        let lexador = new Lexador();
        let avaliadorSintatico = new AvaliadorSintatico();

        describe('Cenários de sucesso', () => {
            it('Olá Mundo', () => {
                const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Vetor vazio', () => {
                const retornoLexador = lexador.mapear(['var vetorVazio = []'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Undefined', () => {
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(undefined as any, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            it('Null', () => {
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(null as any, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            it('Incremento e decremento após variável ou literal', () => {
                const retornoLexador = lexador.mapear(['var a = 1', 'a++', 'a--', '++5', '--5'], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            describe('Comentários', () => {
                it('Comentários multilinha', () => {
                    const retornoLexador = lexador.mapear(["/*", "comentário", "*/"], -1);
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Comentários entre elementos de vetores', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var castelo = [',
                            '    [0, 0], // Parte do topo do castelo',
                            '    [0, 0, 0], // Parte do meio castelo',
                            '    [0, 0, 0], // Parte do meio castelo',
                            '    [0, 0, 0], // Parte do meio castelo',
                            '    [0, 0, 0, 0, 0] // Parte de baixo do castelo ',
                            ']',
                        ], -1);
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
            });

            describe('Desestruturações', () => {
                it('Desestruturação de variáveis', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = { "prop1": 123 }',
                            'var { prop1 } = a'
                        ], 
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Desestruturação de constantes', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'const a = { "prop1": 123 }',
                            'const { prop1 } = a'
                        ], 
                        -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
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
                            '})',
                            'liquido.rotaPost(funcao(requisicao, resposta) {',
                            '    resposta.redirecionar("/artigos")',
                            '})'
                        ],
                        -1
                    );

                    // TODO: Mapear variáveis especiais de Líquido no projeto correspondente.
                    avaliadorSintatico.tiposDeFerramentasExternas = {
                        liquido: {
                            'liquido': 'qualquer',
                            'requisicao': 'qualquer',
                            'resposta': 'qualquer'
                        }
                    }
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    // Declaração `liquido.rotaGet` tem 2 decoradores.
                    const declaracaoGet = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracaoGet).toBeInstanceOf(Expressao);

                    expect(declaracaoGet.decoradores).toHaveLength(2);
                    const decoradorRestDocumentacao = declaracaoGet.decoradores[0];
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

                    const decoradorRestResposta = declaracaoGet.decoradores[1];
                    expect(decoradorRestResposta.nome).toBe('@rest.resposta');
                    expect(Object.entries(decoradorRestResposta.atributos)).toHaveLength(3);
                    expect('codigo' in decoradorRestResposta.atributos).toBe(true);
                    expect(decoradorRestResposta.atributos['codigo'].valor).toBe(200);
                    expect('descricao' in decoradorRestResposta.atributos).toBe(true);
                    expect(decoradorRestResposta.atributos['descricao'].valor).toBe('Devolvido com sucesso');
                    expect('formatos' in decoradorRestResposta.atributos).toBe(true);
                    expect(decoradorRestResposta.atributos['formatos'].valores).toHaveLength(3);
                    expect(decoradorRestResposta.atributos['formatos'].valores[0].valor).toBe('application/json');
                    // decoradorRestResposta.atributos['formatos'].valores[0] é um separador (vírgula).
                    expect(decoradorRestResposta.atributos['formatos'].valores[2].valor).toBe('application/xml');

                    // Declaração `liquido.rotaPost` não tem decoradores.
                    const declaracaoPost = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracaoPost.decoradores).toHaveLength(0);
                });

                it('Classes com herança, uso de super', () => {
                    const resultadoLexador = lexador.mapear([
                        `classe Ancestral {`,
                        `    propriedade1: numero`,
                        `}`,
                        `classe Teste herda Ancestral {`, 
                        `    construtor() {`,
                        `        super.propriedade1 = 0`,
                        `    }`,
                        `}`,
                    ], -1);
            
                    const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
                    
                    expect(resultadoAvaliacaoSintatica).toBeTruthy();
                    expect(resultadoAvaliacaoSintatica.declaracoes).toHaveLength(2);
                    expect(resultadoAvaliacaoSintatica.erros).toHaveLength(0);
                });
            });

            describe('Declaração se ... senão se ... senão', () => {
                it('Caso com os três blocos', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao achePlaneta(coordenadas) {',
                            '    se (coordenadas == "x:20;y:10") {',
                            '        retorna "Planeta Xalax"',
                            '    } senao se (coordenadas == "x:42;y:84") {',
                            '        retorna "Planeta Haskell"',
                            '    } senao {',
                            '        retorna "Planeta Kyron"',
                            '    }',
                            '}',
                            "escreva('O ${achePlaneta(\"x:42;y:84\")} é para onde temos que ir!')"
                        ], -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                });
            });

            describe('Declaração `tendo ... como`', () => {
                it('Trivial', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao teste() { retorna [1, 2, 3, 4, 5] }',
                            'tendo teste() como a {}'
                        ], -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracaoTendoComo: TendoComo = retornoAvaliadorSintatico.declaracoes[1] as TendoComo;
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
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Retorno texto sem retorno dentro da função', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar(valor1, valor2): texto {', 
                            '   var resultado = valor1 + valor2', 
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Função com retorno de vetor', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar(): texto[] {', 
                            '    retorna ["1", "2"]', 
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Função com parâmetros tipados', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao soma(a: inteiro, b: inteiro): inteiro {',
                            '    retorna a + b',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(FuncaoDeclaracao);
                    const declaracaoTipada = declaracao as FuncaoDeclaracao;
                    const construtoFuncao = declaracaoTipada.funcao;
                    expect(construtoFuncao.constructor).toBe(FuncaoConstruto);
                    const construtoFuncaoTipado = construtoFuncao as FuncaoConstruto;
                    expect(construtoFuncaoTipado.tipo).toBe('inteiro');
                    expect(construtoFuncaoTipado.parametros).toHaveLength(2);
                    expect(construtoFuncaoTipado.parametros[0].tipoDado).toBe('inteiro');
                    expect(construtoFuncaoTipado.parametros[1].tipoDado).toBe('inteiro');
                    const corpo = construtoFuncaoTipado.corpo;
                    expect(corpo).toHaveLength(1);
                    expect(corpo[0].constructor).toBe(Retorna);
                    const corpoRetorna = corpo[0] as Retorna;
                    expect(corpoRetorna.valor).toBeTruthy();
                    expect((corpoRetorna.valor as any).constructor).toBe(Binario);
                    const corpoRetornaBinario = corpoRetorna.valor as Binario;
                    expect(corpoRetornaBinario.esquerda.constructor).toBe(Variavel);
                    expect(corpoRetornaBinario.direita.constructor).toBe(Variavel);
                    const corpoRetornaBinarioEsquerda = corpoRetornaBinario.esquerda as Variavel;
                    const corpoRetornaBinarioDireita = corpoRetornaBinario.direita as Variavel;
                    expect(corpoRetornaBinarioEsquerda.tipo).toBe('inteiro');
                    expect(corpoRetornaBinarioDireita.tipo).toBe('inteiro');
                });

                it('Função que retorna função', () => {
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
                });

                it('Chamada a funcao nativa mapear com função anônima, tipagem implícita', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var funcaoParaMapear = função(a) {',
                            '    retorna a * 2;',
                            '};',
                            'escreva(mapear([5, 3], funcaoParaMapear));',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Chamada a funcao nativa mapear com função anônima, parâmetros do tipo qualquer', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao funcaoTestaMap(lista) {',
                            '    retorna mapear(',
                            '        lista,',
                            '        funcao(valor) {',
                            '            retorna valor',
                            '        })',
                            '}',
                            'escreva(funcaoTestaMap([1, 2, 3, 4]))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Chamada a funcao nativa filtrarPor com função nomeada', async () => {
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
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Chamada a funcao nativa filtrarPor com função anônima', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var numeros = [5, 10, 15, 20]',
                            'var numerosFiltrados = filtrarPor(numeros, funcao(numero) {',
                            '    retorna numero > 10',
                            '})',
                            'escreva(numerosFiltrados)'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Funções nativas', () => {
                it('ajuda, sem parênteses', () => {
                    const retornoLexador = lexador.mapear(['ajuda'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Ajuda);
                    const declaracaoAjuda = retornoAvaliadorSintatico.declaracoes[0] as Ajuda;
                    expect(declaracaoAjuda.funcao).toBe(false);
                    expect(declaracaoAjuda.elemento).toBeUndefined();
                });

                it('ajuda, com parênteses, sem argumento', () => {
                    const retornoLexador = lexador.mapear(['ajuda()'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Ajuda);
                    const declaracaoAjuda = retornoAvaliadorSintatico.declaracoes[0] as Ajuda;
                    expect(declaracaoAjuda.funcao).toBe(true);
                    expect(declaracaoAjuda.elemento).toBeUndefined();
                });

                it('ajuda, com parênteses, com argumento', () => {
                    const retornoLexador = lexador.mapear(['ajuda(1)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Ajuda);
                    const declaracaoAjuda = retornoAvaliadorSintatico.declaracoes[0] as Ajuda;
                    expect(declaracaoAjuda.funcao).toBe(true);
                    expect(declaracaoAjuda.elemento).not.toBeUndefined();
                });
            });

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

            it('Declaração `tente ... pegue com parâmetro`', () => {
                const retornoLexador = lexador.mapear([
                    'var i = nulo tente { i = i + 1 } pegue (erro) { escreva(erro) }'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                expect(declaracao.constructor).toBe(Tente);
            });

            describe('Declarações com construto binário', () => {
                it('Números literais, soma', () => {
                    const retornoLexador = lexador.mapear(['2 + 3'], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(Expressao);
                    const declaracaoTipada = declaracao as Expressao;
                    expect(declaracaoTipada.expressao.constructor).toBe(Binario);
                    const binario = declaracaoTipada.expressao as Binario;
                    expect(binario.tipo).toBe('número');
                    expect(binario.esquerda.constructor).toBe(Literal);
                    expect(binario.direita.constructor).toBe(Literal);
                    const literalEsquerdo = binario.esquerda as Literal;
                    const literalDireito = binario.direita as Literal;
                    expect(literalEsquerdo.tipo).toBe('número');
                    expect(literalEsquerdo.valor).toBe(2);
                    expect(literalDireito.tipo).toBe('número');
                    expect(literalDireito.valor).toBe(3);
                });

                it('Literal + variável, multiplicacao', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a: número = 50',
                            'escreva(a * 3)'
                        ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracao.constructor).toBe(Escreva);
                    const declaracaoTipada = declaracao as Escreva;
                    expect(declaracaoTipada.argumentos).toHaveLength(1);
                    const argumento = declaracaoTipada.argumentos[0];
                    expect(argumento.constructor).toBe(Binario);
                    const binario = argumento as Binario;
                    expect(binario.tipo).toBe('número');
                    expect(binario.esquerda.constructor).toBe(Variavel);
                    expect(binario.direita.constructor).toBe(Literal);
                    const literalEsquerdo = binario.esquerda as Variavel;
                    const literalDireito = binario.direita as Literal;
                    expect(literalEsquerdo.tipo).toBe('número');
                    expect(literalDireito.tipo).toBe('número');
                    expect(literalDireito.valor).toBe(3);
                });

                it('Operador Elvis', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = nulo',
                            'escreva(a ?: 10)'
                        ], 
                    -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Elvis);
                });

                it('Contém', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = [1, 2, 3, 4, 5]',
                            'escreva(a contém 3)'
                        ], 
                    -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Logico);
                });

                it('Não contém', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = [1, 2, 3, 4, 5]',
                            'escreva(a não contém 3)'
                        ], 
                    -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Logico);
                    const contem = escreva.argumentos[0] as Logico;
                    expect(contem.negado).toBe(true);
                });

                it('Dicionário + dicionário', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = { "chave1": 1 }',
                            'var b = { "chave2": 2 }',
                            'escreva(a + b)'
                        ],
                    -1);
                        
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                    expect(retornoAvaliadorSintatico.declaracoes[2].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[2] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Binario);
                    const binario = escreva.argumentos[0] as Binario;
                    expect(binario.tipo).toBe('dicionário');
                    expect(binario.esquerda.constructor).toBe(Variavel);
                    expect(binario.direita.constructor).toBe(Variavel);
                });

                it('Vetor + vetor', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = [1, 2]',
                            'var b = [3, 4]',
                            'escreva(a + b)'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                    expect(retornoAvaliadorSintatico.declaracoes[2].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[2] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Binario);
                    const binario = escreva.argumentos[0] as Binario;
                    expect(binario.tipo).toBe('número[]');
                    expect(binario.esquerda.constructor).toBe(Variavel);
                    expect(binario.direita.constructor).toBe(Variavel);
                });
            });

            describe('Leia', () => {
                it('Leia sem parâmetro', () => {
                    const retornoLexador = lexador.mapear(['var nome = leia()'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(Var);
                    const declaracaoTipada = declaracao as Var;
                    expect(declaracaoTipada.inicializador.constructor).toBe(Leia);
                    const declaracaoLeia = declaracaoTipada.inicializador as Leia;
                    expect(declaracaoLeia.argumentos).toHaveLength(0);
                });

                it('Leia com parâmetro', () => {
                    const retornoLexador = lexador.mapear(["var nome = leia('Digite seu nome:')"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(Var);
                    const declaracaoTipada = declaracao as Var;
                    expect(declaracaoTipada.inicializador.constructor).toBe(Leia);
                    const declaracaoLeia = declaracaoTipada.inicializador as Leia;
                    expect(declaracaoLeia.argumentos.length).toBeGreaterThan(0);
                });
            });

            describe('Importar', () => {
                it('Primeira forma', () => {
                    const retornoLexador = lexador.mapear(['const matematica = importar("matematica")'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Const);
                });

                it('Segunda forma', () => {
                    const retornoLexador = lexador.mapear(['importar tudo como matematica de matematica'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Importar);
                    const importar = retornoAvaliadorSintatico.declaracoes[0] as Importar;
                    expect(importar.simboloTudo).not.toBeNull();
                });

                it('Segunda forma com desestruturação', () => {
                    const retornoLexador = lexador.mapear(['importar { logaritmo, potencia } de matematica'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Importar);
                    const importar = retornoAvaliadorSintatico.declaracoes[0] as Importar;
                    expect(importar.elementosImportacao).toHaveLength(2);
                });
            });

            describe('Inferência de tipos', () => {
                it('Var, inferindo de literal', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = 3'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(Var);
                    const declaracaoTipada = declaracao as Var;
                    expect(declaracaoTipada.tipo).toBe('número');
                });

                it('Var, inferindo de outra variável', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = 3',
                            'var b = a'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracao.constructor).toBe(Var);
                    const declaracaoTipada = declaracao as Var;
                    expect(declaracaoTipada.tipo).toBe('número');
                });

                it('Var, inferindo de valor de vetor', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = [1, 2, 3]',
                            'var b = a[2]'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracao.constructor).toBe(Var);
                    const declaracaoTipada = declaracao as Var;
                    expect(declaracaoTipada.tipo).toBe('número');
                });

                it('Const, inferindo de literal', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'const a = "teste"'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(Const);
                    const declaracaoTipada = declaracao as Const;
                    expect(declaracaoTipada.tipo).toBe('texto');
                });

                it('Const, inferindo de variável', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = "teste"',
                            'const b = a'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracao.constructor).toBe(Const);
                    const declaracaoTipada = declaracao as Const;
                    expect(declaracaoTipada.tipo).toBe('texto');
                });

                it('Const, inferindo de vetor de constantes', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'const a = ["teste1", "teste2", "teste3"]',
                            'const b = a[1]'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracao.constructor).toBe(Const);
                    const declaracaoTipada = declaracao as Const;
                    expect(declaracaoTipada.tipo).toBe('texto');
                });
            });

            describe('Enquanto', () => {
                it('Enquanto com retorno pelo escopo', () => {
                    const retornoLexador = lexador.mapear(
                    [
                        'var a = 1',
                        'var teste = enquanto a <= 5 {',
                        '    a++',
                        '    retorna a * 6',
                        '}',
                        'escreva(teste)'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
            });

            describe('Fazer ... enquanto', () => {
                it('Fazer com retorno pelo escopo', () => {
                    const retornoLexador = lexador.mapear(
                    [
                        'var a = 1',
                        'var teste = fazer {',
                        '    ++a',
                        '    retorna a * 6',
                        '} enquanto a <= 5',
                        'escreva(teste)'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
            });

            describe('Para cada', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'para cada elemento em [1, 2, 3] {', 
                            "   escreva('Valor: ', elemento)", 
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Para cada com ponto e vírgula no final', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'para cada elemento em [1, 2, 3] {', 
                            "   escreva('Valor: ', elemento)", 
                            '};'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(ParaCada);
                });

                it('Para cada com vetor variável', () => {
                    const retornoLexador = lexador.mapear([
                        'var mochila = [',
                        '    "fruta",',
                        '    "ovo de Icelope", ',
                        '    "amêndua",',
                        '    "cristal", ',
                        '    "pirita", ',
                        '    "bastão laser quebrado", ',
                        '    "fóssil de urso anão",',
                        '    "meteorito congelado",',
                        '    [9, 4, 20, 37, 12, 1, 2, 1]',
                        ']',
                        'para cada item em mochila {',
                        '    se (item == "ovo de Icelope") {',
                        '        escreva(item)',
                        '    }',
                        '}'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Para cada com para tradicional aninhado', () => {
                    const retornoLexador = lexador.mapear([
                        'var mochila = [',
                        '    "fruta",',
                        '    "ovo de Icelope", ',
                        '    "amêndua",',
                        '    "cristal", ',
                        '    "pirita", ',
                        '    "bastão laser quebrado", ',
                        '    "fóssil de urso anão",',
                        '    "meteorito congelado",',
                        '    [9, 4, 20, 37, 12, 1, 2, 1]',
                        ']',
                        'var ovos = []',
                        'para cada item em mochila {',
                        '    se (item == "ovo de Icelope") {',
                        '        var quantidadeDeOvos = mochila[-1][1];',
                        '        para (var i = 0; i < quantidadeDeOvos; i++) {',
                        '            ovos.adicionar(item);',
                        '        }',
                        '    }',
                        '}',
                        'escreva(ovos)',
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
                });

                it('Para cada com retorno pelo escopo', () => {
                    const retornoLexador = lexador.mapear(
                    [
                        'var teste = para cada elemento em [1, 2, 3] {',
                        '    retorna elemento * 4',
                        '}',
                        'escreva(teste)'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });
            
            describe('Para tradicional', () => {
                it('Para/sustar', async () => {
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

                it('Para com retorno pelo escopo', () => {
                    const retornoLexador = lexador.mapear(
                    [
                        'var teste = para (var i = 0; i < 10; i = i + 1) {',
                        '    se (i == 5) { sustar; }',
                        '    retorna i ** i',
                        '}',
                        'escreva(teste)'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            describe('Se ternário', () => {
                it('Trivial', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var idade = 20',
                            'var categoria = idade < 18 ? "menor" : "adulto"',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracaoComSeTernario = retornoAvaliadorSintatico.declaracoes[1] as Var;
                    expect(declaracaoComSeTernario.inicializador.constructor).toBe(SeTernario);
                });
            });
        });

        describe('Cenários de falha', () => {
            it('Identificador indefinido', async () => {
                const retornoLexador = lexador.mapear(['oi'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                const erro = retornoAvaliadorSintatico.erros[0];
                expect(erro.hashArquivo).toBeDefined();
                expect(erro.linha).toBeDefined();
                expect(erro.message).toBe(
                    "Variável não definida: 'oi'."
                );
            });

            it('Declaração de variáveis com identificadores à esquerda do igual diferente da quantidade de valores à direita', async () => {
                const retornoLexador = lexador.mapear(['var a, b, c = 1, 2'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                const erro = retornoAvaliadorSintatico.erros[0];
                expect(erro.hashArquivo).toBeDefined();
                expect(erro.linha).toBeDefined();
                expect(erro.message).toBe(
                    'Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.'
                );
            });

            it('Declaração de constantes com identificadores à esquerda do igual diferente da quantidade de valores à direita', async () => {
                const retornoLexador = lexador.mapear(['const a, b, c = 1, 2'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                const erro = retornoAvaliadorSintatico.erros[0];
                expect(erro.hashArquivo).toBeDefined();
                expect(erro.linha).toBeDefined();
                expect(erro.message).toBe(
                    'Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.'
                );
            });

            describe('Dicionários', () => {
                it('Tipo de chave de dicionário inválida', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var dicionarioInvalido = {',
                            '    [1, 2, [1, 2, 3]]: "valor",',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    const erro = retornoAvaliadorSintatico.erros[0];
                    expect(erro.message).toBe('Esperado parêntese esquerdo após colchete esquerdo para definição de chave de dicionário. Atual: NUMERO.');
                });
            });

            describe('Funções', () => {
                it('Função retorna vazio mas tem retorno de valores', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar(valor1, valor2): vazio {',
                            '    var resultado = valor1 + valor2',
                            '    retorna resultado',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    const erro = retornoAvaliadorSintatico.erros[0];
                    expect(erro.message).toBe("Função declara explicitamente 'vazio', mas usa expressão 'retorna' com tipo de retorno diferente de vazio.");
                });

                it('Função tem mais de um tipo de retorno', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar(valor1, valor2): número {',
                            '    var resultado = 1',
                            '    se valor1 == 2 {',
                            '        retorna "teste"',
                            '    }',
                            '    retorna resultado',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    const erro = retornoAvaliadorSintatico.erros[0];
                    expect(erro.message).toBe("Função retorna valores com mais de um tipo. Tipo esperado: número. Tipos encontrados: texto, número.");
                });
            });

            describe('Laços de repetição', () => {
                it('Continua fora de laço de repetição', async () => {
                    const retornoLexador = lexador.mapear(['continua;'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    const erro = retornoAvaliadorSintatico.erros[0];
                    expect(erro.hashArquivo).toBeDefined();
                    expect(erro.linha).toBeDefined();
                    expect(erro.message).toBe(
                        "'continua' precisa estar em um laço de repetição."
                    );
                });

                it('Sustar fora de laço de repetição', async () => {
                    const retornoLexador = lexador.mapear(['sustar;'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "'sustar' ou 'pausa' deve estar dentro de um laço de repetição."
                    );
                });
            });

            it('Não é permitido ter dois identificadores seguidos na mesma linha', () => {
                const retornoLexador = lexador.mapear(["escreva('Olá mundo') identificador1 identificador2"], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    "Variável não definida: 'identificador1'."
                );
            });

            it('Laços de repetição - para cada - vetor inválido', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var v = falso', 
                        'para cada elemento em v {', 
                        "   escreva('Valor: ', elemento)", 
                        '}'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            describe('Funções nativas', () => {
                it('filtrarPor - Função de mapeamento inválida', async () => {
                    const codigo = [
                        "var f = 'Sou uma função'",
                        "escreva(filtrarPor([1, 2, 3, 4, 5, 6], f))"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('todosEmCondicao - Função de mapeamento inválida', async () => {
                    const codigo = [
                        "var f = 'Sou uma função'",
                        "escreva(todosEmCondicao([1, 2, 3, 4, 5, 6], f))"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });
            });

            describe('Operações binárias inválidas', () => {
                it('Multiplicação de lista com dicionário', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var lista = [1, 2, 3]',
                            'var dicionario = {"chave": "valor"}',
                            'var resultado = lista * dicionario'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * entre vetor e dicionário."
                    );
                });

                it('Soma de lista com dicionário', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var lista = [1, 2, 3]',
                            'var dicionario = {"chave": "valor"}',
                            'var resultado = lista + dicionario'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação + entre vetor e dicionário."
                    );
                });

                it('Multiplicação de nulo com dicionário', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var dicionario = {"chave": "valor"}',
                            'var resultado = nulo * dicionario'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * entre dicionário e nulo."
                    );
                });

                it('Multiplicação de nulo com vetor', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var lista = [1, 2, 3]',
                            'var resultado = nulo * lista'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * entre vetor e nulo."
                    );
                });

                it('Soma de nulo com dicionário', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var dicionario = {"chave": "valor"}',
                            'var resultado = nulo + dicionario'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação + entre dicionário e nulo."
                    );
                });

                it('Soma de nulo com vetor', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var lista = [1, 2, 3]',
                            'var resultado = nulo + lista'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação + entre vetor e nulo."
                    );
                });

                it('Bloqueia operações unárias em vetores - padrão de ofuscação !![] * 1', () => {
                    const retornoLexador = lexador.mapear(
                        ['var resultado = !![] * 1'],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * com expressão unária aplicada a vetor."
                    );
                });

                it('Bloqueia operações unárias em vetores - padrão de ofuscação ![] * 1', () => {
                    const retornoLexador = lexador.mapear(
                        ['var resultado = ![] * 1'],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * com expressão unária aplicada a vetor."
                    );
                });

                it('Bloqueia código de ofuscação completo - acesso a índice com !![]', () => {
                    const retornoLexador = lexador.mapear(
                        ['escreva(("verdadeiro")[!![] * 1 + !![] * 1])'],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * com expressão unária aplicada a vetor."
                    );
                });

                it('Bloqueia operações unárias em vetores - adição !![] + 1', () => {
                    const retornoLexador = lexador.mapear(
                        ['var resultado = !![] + 1'],
                        -1
                    );

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação + com expressão unária aplicada a vetor."
                    );
                });
            });
        });

        describe('Casos extremos e validações adicionais', () => {
            describe('Expressões aninhadas profundas', () => {
                it('Analisa expressão com múltiplos níveis de parênteses', () => {
                    const retornoLexador = lexador.mapear(
                        ['var resultado = ((((1 + 2) * 3) - 4) / 5)'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa acesso encadeado a propriedades', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var objeto = { "nivel1": { "nivel2": { "nivel3": 42 } } }',
                            'var valor = objeto["nivel1"]["nivel2"]["nivel3"]'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Declarações vazias e casos especiais', () => {
                it('Analisa bloco vazio', () => {
                    const retornoLexador = lexador.mapear(['{', '}'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa if sem else', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'se (verdadeiro) {',
                            '    escreva("sim")',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa múltiplas declarações vazias', () => {
                    const retornoLexador = lexador.mapear([';;;'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                });
            });

            describe('Operadores especiais', () => {
                it('Analisa operador ternário (quando implementado)', () => {
                    const retornoLexador = lexador.mapear(
                        ['var resultado = verdadeiro ? "sim" : "não"'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                });

                it('Analisa operadores de incremento/decremento', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var x = 5',
                            'x++',
                            'x--',
                            '++x',
                            '--x'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                });

                it('Analisa atribuições compostas', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var x = 10',
                            'x += 5',
                            'x -= 3',
                            'x *= 2',
                            'x /= 4'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                });

                it('Analisa atribuições com operador <- (SETA_ESQUERDA)', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var x <- 10',
                            'var y <- 20',
                            'x <- x + y',
                            'y <- 30'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
                });

                it('Analisa atribuições mistas com = e <-', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = 5',
                            'var b <- 10',
                            'a <- 15',
                            'b = 20'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
                });
            });

            describe('Vetores e matrizes - casos extremos', () => {
                it('Analisa vetor com elementos heterogêneos', () => {
                    const retornoLexador = lexador.mapear(
                        ['var misto = [1, "texto", verdadeiro, nulo, [1, 2], {"chave": "valor"}]'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa vetor multidimensional', () => {
                    const retornoLexador = lexador.mapear(
                        ['var matriz = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa acesso a índice negativo', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var numeros = [1, 2, 3]',
                            'var ultimo = numeros[-1]'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                });
            });

            describe('Funções - casos extremos', () => {
                it('Analisa função com múltiplos retornos', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao testeRetorno(x) {',
                            '    se (x > 0) {',
                            '        retorna "positivo"',
                            '    } senao se (x < 0) {',
                            '        retorna "negativo"',
                            '    } senao {',
                            '        retorna "zero"',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa função retornando outra função', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao criarMultiplicador(fator) {',
                            '    retorna funcao(x) {',
                            '        retorna x * fator',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa função recursiva', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao fatorial(n) {',
                            '    se (n <= 1) {',
                            '        retorna 1',
                            '    }',
                            '    retorna n * fatorial(n - 1)',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Strings e formatação', () => {
                it('Analisa template string com interpolação', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var nome = "João"',
                            'var idade = 30',
                            'var mensagem = "${nome} tem ${idade} anos"'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

            });

            describe('Erros - validações adicionais', () => {
                it('Erro - parêntese não fechado', () => {
                    const retornoLexador = lexador.mapear(['var x = (1 + 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Erro - colchete não fechado em vetor', () => {
                    const retornoLexador = lexador.mapear(['var arr = [1, 2, 3'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Erro - chave não fechada em dicionário', () => {
                    const retornoLexador = lexador.mapear(['var obj = {"chave": "valor"'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Erro - dois operadores seguidos', () => {
                    const retornoLexador = lexador.mapear(['var x = 5 + * 3'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Erro - expressão incompleta no final', () => {
                    const retornoLexador = lexador.mapear(['var x = 5 +'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });
            });

            describe('Classes - casos extremos', () => {
                it('Analisa classe com múltiplas propriedades e métodos', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Veiculo {',
                            '    marca: texto',
                            '    modelo: texto',
                            '    ano: inteiro',
                            '    ',
                            '    construtor(m, mod, a) {',
                            '        isto.marca = m',
                            '        isto.modelo = mod',
                            '        isto.ano = a',
                            '    }',
                            '    ',
                            '    descrever() {',
                            '        retorna "${isto.marca} ${isto.modelo} (${isto.ano})"',
                            '    }',
                            '    ',
                            '    idade(anoAtual) {',
                            '        retorna anoAtual - isto.ano',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa herança com sobrescrita de métodos', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Animal {',
                            '    falar() {',
                            '        retorna "Som"',
                            '    }',
                            '}',
                            '',
                            'classe Gato herda Animal {',
                            '    falar() {',
                            '        retorna "Miau"',
                            '    }',
                            '    ',
                            '    ronronar() {',
                            '        retorna "Ronrom"',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });
        });
    });
});
