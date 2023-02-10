import { AvaliadorSintaticoBirl } from '../../fontes/avaliador-sintatico/dialetos';
import { LexadorBirl } from '../../fontes/lexador/dialetos';

describe('Avaliador sintático Birl', () => {
    describe('analisar()', () => {
        let lexador: LexadorBirl;
        let avaliadorSintatico: AvaliadorSintaticoBirl;

        beforeEach(() => {
            lexador = new LexadorBirl();
            avaliadorSintatico = new AvaliadorSintaticoBirl();
        });

        it.skip('Sucesso - Hello, World! Porra!', () => {
            const retornoLexador = lexador.mapear(
                ['HORA DO SHOW', 'CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n");', 'BORA CUMPADE 0;', 'BIRL'],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
        });
    });
});
