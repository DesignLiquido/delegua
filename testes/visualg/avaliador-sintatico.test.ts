import { Delegua } from "../../fontes/delegua";

describe('Avaliador sintático (VisuAlg)', () => {
    describe('analisar()', () => {
        const delegua = new Delegua('visualg');

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = delegua.lexador.mapear([
                "algoritmo 'olá-mundo'",
                "inicio",
                "escreva('Olá mundo')",
                "fimalgoritmo"
            ], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            // expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });
    });
});
