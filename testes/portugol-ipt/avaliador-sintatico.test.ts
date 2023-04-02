import { LexadorPortugolIpt } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoPortugolIpt } from '../../fontes/avaliador-sintatico/dialetos';

describe('Avaliador sintático (Portugol IPT)', () => {
    describe('analisar()', () => {
        let lexador: LexadorPortugolIpt;
        let avaliadorSintatico: AvaliadorSintaticoPortugolIpt;

        beforeEach(() => {
            lexador = new LexadorPortugolIpt();
            avaliadorSintatico = new AvaliadorSintaticoPortugolIpt();
        });

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = lexador.mapear([
                'inicio',
                'escrever "Olá mundo"',
                'fim'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });
    });
});
