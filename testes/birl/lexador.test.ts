import { LexadorBirl } from '../../fontes/lexador/dialetos';

describe('Lexador (BIRL)', () => {
    describe('mapear()', () => {
        let lexador: LexadorBirl;

        beforeEach(() => {
            lexador = new LexadorBirl();
        });

        describe('Cenário de sucesso', () => {
            it('Arquivo vazio.', () => {
                const resultado = lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(1);
            });

            it('Programa vazio.', () => {
                const resultado = lexador.mapear(['HORA DO SHOW \n', 'BIRL \n'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(8);
            });

            it('Programa Olá mundo simples.', () => {
                const resultado = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        '   CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n"); \n',
                        '   BORA CUMPADE? 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(27);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - Ler da tela', () => {
                const resultado = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        'MONSTRO? X;',
                        'QUE QUE CE QUER MONSTRAO? ("%d", &X);',
                        'BORA CUMPADE 1;',
                        'BIRL \n',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(32);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - Variavel - Atribuição', () => {
                const resultado = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        '  MONSTRO? M1 = 1; \n',
                        '  M1 = M1 + 1',
                        '  CE QUER VER ESSA PORRA? (M1); \n',
                        '  BORA CUMPADE? 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(41);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - Loop - For', () => {
                const resultado = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        'MONSTRO M;',
                        'MAIS QUERO MAIS (M = 0; M < 5; M++)',
                        '   CE QUER VER ESSA PORRA? ("%d", M);',
                        'BIRL',
                        'BORA CUMPADE? 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(50);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - Loop - While', () => {
                const resultado = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        'MONSTRO X = 5;',
                        'NEGATIVA BAMBAM (X > 2)',
                        '   CE QUER VER ESSA PORRA? ("%d", X);',
                        '   X--;',
                        'BIRL',
                        'BORA CUMPADE? 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(48);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - Condição - If', () => {
                const resultado = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        'ELE QUE A GENTE QUER? (3 > 2)',
                        '   CE QUER VER ESSA PORRA? ("%d", 3);',
                        'BIRL',
                        'BORA CUMPADE? 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(42);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - Condição - If Else', () => {
                const resultado = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        'ELE QUE A GENTE QUER? (3 > 2)',
                        '   CE QUER VER ESSA PORRA? ("%d", 3);',
                        'NAO VAI DAR NAO',
                        '   CE QUER VER ESSA PORRA? ("%d", 2);',
                        'BIRL',
                        'BORA CUMPADE? 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(60);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - Condição - If Else If', () => {
                const resultado = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        'ELE QUE A GENTE QUER? (3 > 2)',
                        '   CE QUER VER ESSA PORRA? ("%d", 3);',
                        'ELE NAO VAI DAR O QUE? (3 > 2)',
                        '   CE QUER VER ESSA PORRA? ("%d", 2);',
                        'NAO VAI DAR NAO',
                        '   CE QUER VER ESSA PORRA? ("%d", 1);',
                        'BIRL',
                        'BORA CUMPADE? 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(86);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - Condição - BREAK/CONTINUE', () => {
                const resultado = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        'MONSTRO M = 0;',
                        'MAIS QUERO MAIS (M = 0; M < 5; M++)',
                        '   ELE QUE A GENTE QUER? (M == 3)',
                        '   VAMO MONSTRO;',
                        '   SAI FILHO DA PUTA;',
                        'BIRL',
                        'BORA CUMPADE? 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(61);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - Declaração de Função', () => {
                const resultado = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        'OH O HOME AI PO (MONSTRO NOMEFUNC(MONSTRO A, MONSTRO B))',
                        '   CE QUER VER ESSA PORRA? ("%d", A + B);',
                        '   BORA CUMPADE? 1; \n',
                        'BIRL',
                        'BORA CUMPADE? 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(56);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - Chamada de função', () => {
                const resultado = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        'MONSTRO A = 5;',
                        'MONSTRO B = 8;',
                        'MONSTRO C = AJUDA O MALUCO TA DOENTE SOMAR(A, B);',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(33);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - EXEMPLO DESCENDENTE', () => {
                const resultado = lexador.mapear(
                    [
                        'OH O HOME AI PO (MONSTRO SOMAR(MONSTRO A, MONSTRO B))',
                        '   BORA CUMPADE A + B;',
                        'BIRL',
                        'HORA DO SHOW \n',
                        '   MONSTRO A, B, RES;',
                        '   CE QUER VER ESSA PORRA? ("Entra com a e b ai cumpade!!\n");',
                        '   QUE QUE CE QUER MONSTRAO? ("%d %d", &A, &B);',
                        '   RES = AJUDA O MALUCO TA DOENTE SOMAR(A, B);',
                        '   CE QUER VER ESSA PORRA? ("Oh o resultado ai po: %d\n", RES);',
                        '   ELE QUE A GENTE QUER? (RES == 37)',
                        '       CE QUER VER ESSA PORRA? ("É 37 anos caralho!\n");',
                        '   NAO VAI DAR NAO',
                        '       CE QUER VER ESSA PORRA? ("Manda o double biceps!\n");',
                        '   BIRL',
                        '   BORA CUMPADE 0;',
                        'BIRL',
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(143);
                expect(resultado.erros).toHaveLength(0);
            });
        });
        describe('Cenário de Erros', () => {
            it('Error - texto sem fim', () => {
                const resultado = lexador.mapear([`"texto sem fim`], -1);
                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(1);
                expect(resultado.erros[0]).toEqual({
                    linha: 2,
                    caractere: '\n',
                    mensagem: 'Caractere não finalizado',
                });
            });
            it('Error - texto sem inicio', () => {
                const resultado = lexador.mapear([`texto sem inicio"`], -1);
                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(3);
                expect(resultado.erros).toHaveLength(1);
                expect(resultado.erros[0]).toEqual({
                    linha: 2,
                    caractere: '\n',
                    mensagem: 'Caractere não finalizado',
                });
            })
            it('Error - caractere inesperado', () => {
                const resultado = lexador.mapear(['平']);
                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(1);
                expect(resultado.erros).toHaveLength(1);
                expect(resultado.erros[0]).toEqual({
                    linha: 1,
                    caractere: '平',
                    mensagem: 'Caractere inesperado.',
                });
            })
        });
    });
});
