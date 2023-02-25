import { AvaliadorSintaticoBirl } from '../../fontes/avaliador-sintatico/dialetos';
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
                ['HORA DO SHOW', 'CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n");', 'BORA CUMPADE 0;', 'BIRL'],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });

       it('Sucesso - For', () => {
            //@TODO: @ItaloCobains - Implementar esse teste
            const retornoLexador = lexador.mapear(
                [
                    'HORA DO SHOW',
                    'MONSTRO M;',
                    'MAIS QUERO MAIS (M = 0; M < 5; M++)',
                    '   CE QUER VER ESSA PORRA? ("%d", M);',
                    'BIRL',
                    'BIRL'
                ], -1
            )

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);
            expect(retornoAvaliadorSintatico).toBeTruthy();
            // expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        })

        // TODO: @ItaloCobains - Implementar esse teste
        it('Sucesso - Variavel - Atribuição', () => {
            const retornoLexador = lexador.mapear(
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

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
        });
    });
});
