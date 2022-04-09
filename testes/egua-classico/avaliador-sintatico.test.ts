import { Delegua } from "../../fontes/delegua";

describe('Avaliador sintático (Égua Clássico)', () => {
    describe('analisar()', () => {
        const delegua = new Delegua('egua');

        it('Sucesso - Olá Mundo', () => {
            const simbolos = delegua.lexador.mapear(["escreva('Olá mundo');"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);

            expect(declaracoes).toBeTruthy();
            expect(declaracoes).toHaveLength(1);
        });

        // TODO: Resolver bug.
        it.skip('Sucesso - Vetor vazio', () => {
            const declaracoes = delegua.avaliadorSintatico.analisar([]);

            expect(declaracoes).toBeTruthy();
            expect(declaracoes).toHaveLength(0);
        });

        // TODO: Resolver bug.
        it.skip('Sucesso - Undefined', () => {
            const declaracoes = delegua.avaliadorSintatico.analisar(undefined);

            expect(declaracoes).toBeTruthy();
            expect(declaracoes).toHaveLength(0);
        });

        // TODO: Resolver bug.
        it.skip('Sucesso - Null', () => {
            const declaracoes = delegua.avaliadorSintatico.analisar(null);

            expect(declaracoes).toBeTruthy();
            expect(declaracoes).toHaveLength(0);
        });
    });
});