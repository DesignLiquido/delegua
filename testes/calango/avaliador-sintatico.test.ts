import { AvaliadorSintaticoCalango } from "../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-calango";
import { LexadorCalango } from "../../fontes/lexador/dialetos";

describe('Avaliador sintático (Calango)', () => {
    describe('analisar()', () => {
        let lexador: LexadorCalango;
        let avaliadorSintatico: AvaliadorSintaticoCalango;

        beforeEach(() => {
            lexador = new LexadorCalango();
            avaliadorSintatico = new AvaliadorSintaticoCalango();
        });

        it.only('Sucesso - Olá Mundo', () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;', 
                'principal', 
                'escreva("Ola Mundo");',
                'fimPrincipal'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });
    });
});
