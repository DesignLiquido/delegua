import { AvaliadorSintaticoPrisma } from '../../fontes/avaliador-sintatico/dialetos';
import { Leia, Literal } from '../../fontes/construtos';
import { Classe, Enquanto, Expressao, FuncaoDeclaracao, Para, Se, Var } from '../../fontes/declaracoes';
import { LexadorPrisma } from '../../fontes/lexador/dialetos';

describe('Avaliador Sintático (Prisma)', () => {
    describe('analisar()', () => {
        let lexador: LexadorPrisma;
        let avaliadorSintatico: AvaliadorSintaticoPrisma;

        beforeEach(() => {
            lexador = new LexadorPrisma();
            avaliadorSintatico = new AvaliadorSintaticoPrisma();
        });

        describe('Cenários de sucesso', () => {
            it('Código vazio', () => {
                const retornoLexador = lexador.mapear([''], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Olá mundo', () => {
                const retornoLexador = lexador.mapear(
                    ['imprima("Olá mundo");'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('leia', () => {
                const retornoLexador = lexador.mapear(
                    ['local x = leia();'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);
                const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Var;
                expect(declaracao.inicializador.constructor).toBe(Leia);
            });

            it('Declaração de variável numérica', () => {
                const retornoLexador = lexador.mapear(
                    ['local numero = 42;'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);
            });

            it('Declaração de variável texto com colchetes duplos', () => {
                const retornoLexador = lexador.mapear([
                    "local texto = [[",
                    "  isto é uma string",
                    "  de várias linhas", 
                    "  o texto será impresso exatamente como está aqui!",
                    "]];",
                    "imprima (texto);"
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);
                const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Var;
                expect(declaracao.inicializador.constructor).toBe(Literal);
            });

            it('Expressão matemática', () => {
                const retornoLexador = lexador.mapear(
                    ['2 + 3 * 4;'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Expressao);
            });

            it('Estrutura condicional simples', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se verdadeiro entao',
                        '    imprima("É verdade");',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Se);
            });

            it('Estrutura condicional com senão', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se falso entao',
                        '    imprima("Verdadeiro");',
                        'senao',
                        '    imprima("Falso");',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Se);
            });

            it('Enquanto', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'local i = 0;',
                        'enquanto i < 3 inicio',
                        '    imprima(i);',
                        '    i = i + 1;',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);
                expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Enquanto);
            });

            it('Declaração de função', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'funcao somar(a, b) ',
                        '    retorne a + b;',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(FuncaoDeclaracao);
            });

            it('Chamada de função', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'funcao teste()',
                        '    retorne 42;',
                        'fim',
                        'local resultado = teste();'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(FuncaoDeclaracao);
                expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Var);
            });

            describe('Tabela', () => {
                it('Trivial, sem índices nomeados', () => {
                    const retornoLexador = lexador.mapear(
                        ['local minhatab = {1, 2, 3};'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);
                });

                it('Acesso a índice de tabela', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'local lista = {1, 2, 3};',
                            'local primeiro = lista[1];'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            it.skip('Declaração de classe', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'classe Pessoa {',
                        '    construtor(nome) {',
                        '        isto.nome = nome;',
                        '    }',
                        '}'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Classe);
            });
        });

        describe('Para tradicional', () => {
            it('Laço para tradicional', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'para i = 0, 5 inicio',
                        '    imprima(i)',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Para);
            });
        });

        describe('Cenários de falha', () => {
            it('Variável sem valor', () => {
                const retornoLexador = lexador.mapear(['local x =;'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                
                // Deve ter erro sintático
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Parêntese não fechado', () => {
                const retornoLexador = lexador.mapear(
                    ['imprima("teste"'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Se não fechado com fim', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se (verdadeiro) entao',
                        '    imprima("teste");'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Variável não declarada', () => {
                const retornoLexador = lexador.mapear(
                    ['imprima(variavel_inexistente);'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });
        });
    });
});
