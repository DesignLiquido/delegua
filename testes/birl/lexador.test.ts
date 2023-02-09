import { Delegua } from '../../fontes/delegua';

describe('Lexador (BIRL)', () => {
    describe('mapear()', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('birl');
        });

        describe('Cenário de sucesso', () => {
            it('Arquivo vazio.', () => {
                const resultado = delegua.lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(1);
            });

            it('Programa vazio.', () => {
                const resultado = delegua.lexador.mapear(['HORA DO SHOW \n', 'BIRL \n'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(8);
            });

            it('Programa Olá mundo simples.', () => {
                const resultado = delegua.lexador.mapear(
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
                const resultado = delegua.lexador.mapear([
                    'HORA DO SHOW \n',
                    'MONSTRO? X;',
                    'QUE QUE CE QUER MONSTRAO? ("%d", &X);',
                    'BORA CUMPADE 1;',
                    'BIRL \n'
                ], -1)

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(32);
                expect(resultado.erros).toHaveLength(0);
            });
            it('Sucesso - Variavel - Atribuição', () => {
                const resultado = delegua.lexador.mapear(
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
                const resultado = delegua.lexador.mapear([
                    'HORA DO SHOW \n',
                    'MONSTRO M;',
                    'MAIS QUERO MAIS (M = 0; M < 5; M++)',
                    '   CE QUER VER ESSA PORRA? ("%d", M);',
                    'BIRL',
                    'BORA CUMPADE? 0; \n',
                    'BIRL \n',
                ], -1)

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(51);
                expect(resultado.erros).toHaveLength(0);
            })
            it('Sucesso - Loop - While', () => {
                const resultado = delegua.lexador.mapear([
                    'HORA DO SHOW \n',
                    'MONSTRO X = 5;',
                    'NEGATIVA BAMBAM (X > 2)',
                    '   CE QUER VER ESSA PORRA? ("%d", X);',
                    '   X--;',
                    'BIRL',
                    'BORA CUMPADE? 0; \n',
                    'BIRL \n',
                ], -1)

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(49);
                expect(resultado.erros).toHaveLength(0);
            })
            it('Sucesso - Condição - If', () => {
                const resultado = delegua.lexador.mapear([
                    'HORA DO SHOW \n',
                    'ELE QUE A GENTE QUER? (3 > 2)',
                    '   CE QUER VER ESSA PORRA? ("%d", 3);',
                    'BIRL',
                    'BORA CUMPADE? 0; \n',
                    'BIRL \n',
                ], -1)

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(42);
                expect(resultado.erros).toHaveLength(0);
            })
            it('Sucesso - Condição - If Else', () => {
                const resultado = delegua.lexador.mapear([
                    'HORA DO SHOW \n',
                    'ELE QUE A GENTE QUER? (3 > 2)',
                    '   CE QUER VER ESSA PORRA? ("%d", 3);',
                    'NAO VAI DAR NAO',
                    '   CE QUER VER ESSA PORRA? ("%d", 2);',
                    'BIRL',
                    'BORA CUMPADE? 0; \n',
                    'BIRL \n',
                ], -1)

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(60);
                expect(resultado.erros).toHaveLength(0);
            })
        });
    });
});
