import { AvaliadorSintaticoPrisma } from '../../fontes/avaliador-sintatico/dialetos';
import { Leia, Literal } from '../../fontes/construtos';
import { Var } from '../../fontes/declaracoes';
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
                // expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('imprima');
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
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('Var');
                const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Var;
                expect(declaracao.inicializador.constructor.name).toBe(Leia);
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
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('Var');
            });

            it('Declaração de variável texto com colchetes duplos', () => {
                const retornoLexador = lexador.mapear([
                    "local texto = [[",
                    "  isto é uma string",
                    "  de várias linhas", 
                    "  o texto será impresso exatamente como está aqui!",
                    "]];",
                    "imprima (texto);"
                ],
                -1
                );
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
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('Expressao');
            });

            it('Estrutura condicional simples', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se (verdadeiro) entao',
                        '    imprima("É verdade");',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('Se');
            });

            it('Estrutura condicional com senão', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se (falso) entao',
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
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('Se');
            });

            it.skip('Loop enquanto', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'local i = 0;',
                        'enquanto (i < 3) {',
                        '    imprima(i);',
                        '    i = i + 1;',
                        '}'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('Var');
                expect(retornoAvaliadorSintatico.declaracoes[1].constructor.name).toBe('Enquanto');
            });

            it.skip('Loop para tradicional', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'para (local i = 0; i < 5; i = i + 1) {',
                        '    imprima(i);',
                        '}'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('Para');
            });

            it.skip('Declaração de função', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'funcao somar(a, b) {',
                        '    retorna a + b;',
                        '}'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('FuncaoDeclaracao');
            });

            it.skip('Chamada de função', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'funcao teste() {',
                        '    retorna 42;',
                        '}',
                        'local resultado = teste();'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('FuncaoDeclaracao');
                expect(retornoAvaliadorSintatico.declaracoes[1].constructor.name).toBe('Var');
            });

            it.skip('Array/Vetor', () => {
                const retornoLexador = lexador.mapear(
                    ['local lista = [1, 2, 3];'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('Var');
            });

            it.skip('Acesso a índice de array', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'local lista = [1, 2, 3];',
                        'local primeiro = lista[0];'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
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
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('Classe');
            });
        });

        describe('Para tradicional', () => {
            it.skip('Para/quebre', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'para (local i = 0; i < 10; i = i + 1) {',
                        '   se (i == 5) { quebre; }',
                        '   imprima("Valor: ", i)',
                        '}',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it.skip('Para com retorno pelo escopo', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'local teste = para (local i = 0; i < 10; i = i + 1) {',
                        '    se (i == 5) { quebre; }',
                        '    retorna i ** i',
                        '}',
                        'imprima(teste)'
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
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

            it('Ponto e vírgula ausente', () => {
                const retornoLexador = lexador.mapear(
                    ['local x = 5'],
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
