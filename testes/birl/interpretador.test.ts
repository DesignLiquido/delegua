import { AvaliadorSintaticoBirl } from '../../fontes/avaliador-sintatico/dialetos';
import { LexadorBirl } from '../../fontes/lexador/dialetos';
import { InterpretadorBirl } from '../../fontes/interpretador/dialetos';

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorBirl;
        let avaliadorSintatico: AvaliadorSintaticoBirl;
        let interpretador: InterpretadorBirl;

        describe('Cenário de sucesso', () => {
            beforeEach(() => {
                lexador = new LexadorBirl();
                avaliadorSintatico = new AvaliadorSintaticoBirl();
                interpretador = new InterpretadorBirl(process.cwd());
            });

            it('Sucesso - declaração - continue', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO M;\n',
                    '   MAIS QUERO MAIS (M = 0; M < 5; M++)\n',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '       ELE QUE A GENTE QUER? (M > 2)\n',
                    '           SAI FILHO DA PUTA;\n',
                    '       NAO VAI DAR NAO\n',
                    '           VAMO MONSTRO;\n',
                    '       BIRL\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - break', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO M;\n',
                    '   MAIS QUERO MAIS (M = 0; M < 5; M++)\n',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '       SAI FILHO DA PUTA;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - while', async () => {
                const RetornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO X = 5;\n',
                    '   NEGATIVA BAMBAM (X > 2)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '       X--;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(RetornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - maior igual - 1 <= 2', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (1 <= 2)\n',
                    '     CE QUER VER ESSA PORRA? ("ativo");\n',
                    '   NAO VAI DAR NAO\n',
                    '     CE QUER VER ESSA PORRA? ("desativo");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - maior igual - 1 >= 2', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (1 >= 2)\n',
                    '     CE QUER VER ESSA PORRA? ("desativo");\n',
                    '   NAO VAI DAR NAO\n',
                    '     CE QUER VER ESSA PORRA? ("ativo");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - maior igual - 1 == 2', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (1 == 2)\n',
                    '     CE QUER VER ESSA PORRA? ("desativo");\n',
                    '   NAO VAI DAR NAO\n',
                    '     CE QUER VER ESSA PORRA? ("ativo");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Teste - Hello World', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW\n',
                    '   CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n");\n',
                    '   BORA CUMPADE? 0;\n',
                    'BIRL',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - for - decremento - depois', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 6; M > 5; M--)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - for - decremento - antes', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 10; M > 5; --M)',
                    '       CE QUER VER ESSA PORRA? (M);\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - for - incremento - depois', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 0; M < 5; M++)',
                    '       CE QUER VER ESSA PORRA? (M);\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - for - incremento - antes', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 0; M < 5; ++M)',
                    '       CE QUER VER ESSA PORRA? (M);\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - if else', async () => {
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

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - if', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (3 > 2)\n',
                    '     CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Hello, World! Porra!', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'HORA DO SHOW',
                        '  CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n");',
                        '  BORA CUMPADE 0;',
                        'BIRL',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - Numero', async () => {
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

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - String', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   FRANGO FR = "testes";\n',
                    '   CE QUER VER ESSA PORRA? (FR); \n',
                    '   BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - Float', async () => {
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

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - short int', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  MONSTRINHO M1 = 1.03; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - long int', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  MONSTRAO M1 = 16666666; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - double', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  TRAPEZIO DESCENDENTE TD = 0.37; \n',
                    '  CE QUER VER ESSA PORRA? (TD); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});
