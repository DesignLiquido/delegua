import { AvaliadorSintaticoGuarani } from "../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-guarani";
import { LexadorGuarani } from "../../fontes/lexador/dialetos/lexador-guarani";

describe('Avaliador sintático (Guarani)', () => {
    describe('analisar()', () => {
        let lexador: LexadorGuarani;
        let avaliadorSintatico: AvaliadorSintaticoGuarani;

        beforeEach(() => {
            lexador = new LexadorGuarani();
            avaliadorSintatico = new AvaliadorSintaticoGuarani();
        });

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = lexador.mapear(
                [
                    'hai("Olá Mundo")'
                ],
                -1
            );
            const retornoAvaliadorSintatico =
                avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });
    });
});
