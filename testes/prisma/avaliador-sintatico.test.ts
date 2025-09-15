import { AvaliadorSintaticoPrisma } from '../../fontes/avaliador-sintatico/dialetos';
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
            it('Sucesso - Código vazio', () => {
                const retornoLexador = lexador.mapear([''], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - Olá mundo', () => {
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

            it('Sucesso - Declaração de variável', () => {
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

            it('Sucesso - Expressão matemática', () => {
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

            it('Sucesso - Estrutura condicional simples', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se (verdadeiro) {',
                        '    imprima("É verdade");',
                        '}'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('Se');
            });

            it('Sucesso - Estrutura condicional com senão', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se (falso) {',
                        '    imprima("Verdadeiro");',
                        '} senão {',
                        '    imprima("Falso");',
                        '}'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor.name).toBe('Se');
            });

            it('Sucesso - Loop enquanto', () => {
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

            it('Sucesso - Loop para tradicional', () => {
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

            it('Sucesso - Declaração de função', () => {
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

            it('Sucesso - Chamada de função', () => {
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

            it('Sucesso - Array/Vetor', () => {
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

            it('Sucesso - Acesso a índice de array', () => {
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

            it.skip('Sucesso - Declaração de classe', () => {
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

        describe('Cenários de falha', () => {
            it('Falha - Parêntese não fechado', () => {
                const retornoLexador = lexador.mapear(
                    ['imprima("teste"'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Falha - Ponto e vírgula ausente', () => {
                const retornoLexador = lexador.mapear(
                    ['local x = 5'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Falha - Chave não fechada', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se (verdadeiro) {',
                        '    imprima("teste");'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Falha - Variável não declarada', () => {
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
