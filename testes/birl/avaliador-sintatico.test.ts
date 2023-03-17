import { AvaliadorSintaticoBirl } from '../../fontes/avaliador-sintatico/dialetos';
import { Se } from '../../fontes/declaracoes';
import { LexadorBirl } from '../../fontes/lexador/dialetos';

describe('Avaliador Sintático Birl', () => {
    describe('analisar()', () => {
        let lexador: LexadorBirl;
        let avaliadorSintatico: AvaliadorSintaticoBirl;

        beforeEach(() => {
            lexador = new LexadorBirl();
            avaliadorSintatico = new AvaliadorSintaticoBirl();
        });

        it('Sucesso - Hello, World! Porra!', () => {
            const retornoLexador = lexador.mapear(
                ['HORA DO SHOW', '  CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n");', '  BORA CUMPADE 0;', 'BIRL'],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });

        it.skip('Sucesso - For', () => {
            //@TODO: @ItaloCobains - Implementar esse teste
            const retornoLexador = lexador.mapear(
                [
                    'HORA DO SHOW',
                    '  MONSTRO M;',
                    '  MAIS QUERO MAIS (M = 0; M < 5; M++)',
                    '    CE QUER VER ESSA PORRA? ("%d", M);',
                    '  BIRL',
                    'BIRL',
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);
            expect(retornoAvaliadorSintatico).toBeTruthy();
            // expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });

        it('Sucesso - Variavel - Numero', () => {
            const retornoLexador = lexador.mapear(
                [
                    'HORA DO SHOW \n',
                    '  MONSTRO M1 = 1; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - Variavel - String', () => {
            const retornoLexador = lexador.mapear([
                'HORA DO SHOW \n',
                "   FRANGO FR = 'testes';\n",
                '   CE QUER VER ESSA PORRA? (FR); \n',
                '   BORA CUMPADE 0; \n',
                'BIRL \n',
            ]);
            //  FRANGO esta vindo como um indentificador
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - Variavel - Float', () => {
            const retornoLexador = lexador.mapear(
                [
                    'HORA DO SHOW \n',
                    '  TRAPEZIO M1 = 1.03; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        describe('Sucesso - Variavel de tipagem não utilizada', () => {
            it('Sucesso - Variavel - short int', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  MONSTRINHO M1 = 1.03; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            it('Sucesso - Variavel - long int', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  MONSTRAO M1 = 16666666; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            it('Sucesso - Variavel - double', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  TRAPEZIO DESCENDENTE TD = 0.37; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            it('Sucesso - Variavel - unsigned char', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    `  BICEPS FRANGO TD = 'test'; \n`,
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });
            it('Sucesso - declaração - if', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (3 > 2)\n',
                    '     CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Se);
            });
            it('Sucesso - declaração - if else', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (1 > 2)\n',
                    '     CE QUER VER ESSA PORRA? ("teste1");\n',
                    '   NAO VAI DAR NAO\n',
                    '     CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Se);
            });
        });
    });
});
