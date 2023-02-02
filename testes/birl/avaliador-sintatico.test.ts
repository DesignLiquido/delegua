import { Delegua } from '../../fontes/delegua';

describe('Avaliador sintático Birl', () => {
    describe('analisar()', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('birl');
        });

        it('Sucesso - Hello, World! Porra!', () => {
            const retornoLexador = delegua.lexador.mapear(
                ['HORA DO SHOW', 'CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n");', 'BORA CUMPADE? 0;', 'BIRL'],
                -1
            );

            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });



        // TODO: @ItaloCobains - Implementar esse teste
        it.skip
            ('Sucesso - Variavel - Atribuição', () => {
                const retornoLexador = delegua.lexador.mapear(
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

                const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                expect(retornoAvaliadorSintatico).toBeTruthy();
            });
    });
});
