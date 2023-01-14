import { Delegua } from '../../fontes/delegua';

describe('Lexador', () => {
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
                expect(resultado.simbolos).toHaveLength(24);
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
                expect(resultado.simbolos).toHaveLength(34);
                expect(resultado.erros).toHaveLength(0);
            });
        });
    });
});
