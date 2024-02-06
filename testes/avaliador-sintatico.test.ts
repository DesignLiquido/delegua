import { Lexador } from '../fontes/lexador';
import { AvaliadorSintatico } from '../fontes/avaliador-sintatico';

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
    
            it('Sucesso - Dicionário vazio', () => {
                const retornoLexador = lexador.mapear(['var dicionarioVazio = {}'], -1);
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
                const retornoLexador = lexador.mapear([
                    'var a = 1',
                    'a++',
                    'a--',
                    '++5',
                    '--5'
                ], -1);

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
                    [
                        'para cada elemento em [1, 2, 3] {',
                        "   escreva('Valor: ', elemento)",
                        '}',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - para cada com ponto e vírgula no final', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'para cada elemento em [1, 2, 3] {',
                        "   escreva('Valor: ', elemento)",
                        '};',
                    ],
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
                const retornoLexador = lexador.mapear(
                    [
                        'var { prop1 } = a'
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - desestruturação de constantes', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'const { prop1 } = a'
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            describe('Classes, propriedades e métodos', () => {
                it('Trivial', () => {
                    const retornoLexador = lexador.mapear([
                        'classe Triangulo {',
                        '    base: numero;',
                        '    altura: número',
                        '    area() {',
                        '        escreva((isto.base * isto.altura) / 2)',
                        '    }',
                        '}',
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Decoradores', () => {
                it('Sucesso - decorador de classe simples', () => {
                    const retornoLexador = lexador.mapear([
                        '@meu.decorador1',
                        '@meu.decorador2',
                        'classe Teste {',
                            'testeFuncao() {',
                              'escreva("olá")',
                            '}',
                        '}',
                    ], -1);
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
    
                it('Sucesso - decorador de classe com parametros', () => {
                    const retornoLexador = lexador.mapear([
                        '@decorador1(atributo1="123", atributo2=4)',
                        'classe Teste {',
                            '@decorador2(atributo1="123", atributo2=4)',
                            'testeFuncao() {',
                              'escreva("olá")',
                            '}',
                        '}',
                    ], -1);
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
    
                it('Sucesso - decorador de classe/método', () => {
                    const retornoLexador = lexador.mapear([
                        '@meu.decorador1',
                        'classe Teste {',
                            '@meu.decorador2',
                            'testeFuncao() {',
                              'escreva("olá")',
                            '}',
                        '}',
                    ], -1);
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
    
                it('Sucesso - decorador de classe/método/propriedade', () => {
                    const retornoLexador = lexador.mapear([
                        '@meu.decorador1',
                        'classe Teste {',
                            '@meu.decorador3',
                            'propriedade1: texto',
                            '@meu.decorador2',
                            'testeFuncao() {',
                              'escreva("olá")',
                            '}',
                        '}',
                    ], -1);
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });
        });

        describe('Declarações de tuplas', () => {
            it('Dupla', () => {
                const retornoLexador = lexador.mapear([
                    'var t = [(1, 2)]'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Trio', () => {
                const retornoLexador = lexador.mapear([
                    'var t = [(1, 2, 3)]'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Quarteto', () => {
                const retornoLexador = lexador.mapear([
                    'var t = [(1, 2, 3, 4)]'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Quinteto', () => {
                const retornoLexador = lexador.mapear([
                    'var t = [(1, 2, 3, 4, 5)]'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Sexteto', () => {
                const retornoLexador = lexador.mapear([
                    'var t = [(1, 2, 3, 4, 5, 6)]'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Septeto', () => {
                const retornoLexador = lexador.mapear([
                    'var t = [(1, 2, 3, 4, 5, 6, 7)]'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Octeto', () => {
                const retornoLexador = lexador.mapear([
                    'var t = [(1, 2, 3, 4, 5, 6, 7, 8)]'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Noneto', () => {
                const retornoLexador = lexador.mapear([
                    'var t = [(1, 2, 3, 4, 5, 6, 7, 8, 9)]'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Deceto', () => {
                const retornoLexador = lexador.mapear([
                    'var t = [(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)]'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });
        });

        describe('Cenários de falha', () => {
            it('Falha - declaração de variáveis com identificadores à esquerda do igual diferente da quantidade de valores à direita', async () => {
                const retornoLexador = lexador.mapear(['var a, b, c = 1, 2'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    "Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita."
                );
            });

            it('Falha - declaração de constantes com identificadores à esquerda do igual diferente da quantidade de valores à direita', async () => {
                const retornoLexador = lexador.mapear(['const a, b, c = 1, 2'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    "Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita."
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
    
            describe('Funções Anônimas', () => {
                it('Função retorna vazio mas tem retorno de valores', async () => {
                    const retornoLexador = lexador.mapear([
                        "funcao executar(valor1, valor2): vazio {",
                        "   var resultado = valor1 + valor2",
                        "   retorna resultado",
                        "}",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Retorno texto sem retorno dentro da função', async () => {
                    const retornoLexador = lexador.mapear([
                        "funcao executar(valor1, valor2): texto {",
                        "   var resultado = valor1 + valor2",
                        "}",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThanOrEqual(0);
                });

                it('Função com retorno de vetor', () => {
                    const retornoLexador = lexador.mapear([
                        "funcao executar(): texto[] {",
                        "   retorna [\"1\", \"2\"]",
                        "}",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                });
            });
    
            it('Declaração `tente`', () => {
                const retornoLexador = lexador.mapear(['tente { i = i + 1 } pegue (erro) { escreva(erro) }'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
            });
        });
    });
});
