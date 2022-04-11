import { Delegua } from "../../fontes/delegua";

describe('Avaliador sintático (Égua Clássico)', () => {
    describe('analisar()', () => {
        const delegua = new Delegua('egua');

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva('Olá mundo');"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        // TODO: Resolver bug.
        it.skip('Sucesso - Vetor vazio', () => {
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar([]);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
        });

        // TODO: Resolver bug.
        it.skip('Sucesso - Undefined', () => {
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(undefined);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
        });

        // TODO: Resolver bug.
        it.skip('Sucesso - Null', () => {
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(null);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
        });
    });
});