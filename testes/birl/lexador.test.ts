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
        });
    });
});
