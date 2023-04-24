import { AvaliadorSintaticoBirl } from '../../fontes/avaliador-sintatico/dialetos';
import { Enquanto, Para, Se } from '../../fontes/declaracoes';
import { LexadorBirl } from '../../fontes/lexador/dialetos';
import { RetornoLexador } from '../../fontes/interfaces/retornos/retorno-lexador';

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

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
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

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

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
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

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

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Se);
            });
        });
        describe('Sucesso - Loops', () => {
            it('Sucesso - declaração - for - incremento', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 0; M < 5; M++)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Para);
            });

            it('Sucesso - declaração - for - decremento', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 5; M > 0; M--)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Para);
            });

            it('Sucesso - declaração - for - incremento - atribuição', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO M;\n',
                    '   MAIS QUERO MAIS (M = 5; M > 0; M--)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.declaracoes[1].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[1]).toBeInstanceOf(Para);
            });
            it('Sucesso - declaração - while', () => {
                const RetornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO X = 5;\n',
                    '   NEGATIVA BAMBAM (X > 2)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '       X--;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const RetornoAvaliadorSintatico = avaliadorSintatico.analisar(RetornoLexador, -1);
                expect(RetornoAvaliadorSintatico).toBeTruthy();
                expect(RetornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(RetornoAvaliadorSintatico.declaracoes[1].assinaturaMetodo).toBe('<principal>');
                expect(RetornoAvaliadorSintatico.declaracoes[1]).toBeInstanceOf(Enquanto);
            })
        });
    });
});
