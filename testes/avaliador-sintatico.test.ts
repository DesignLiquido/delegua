import { Delegua } from "../fontes/delegua";

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        const delegua = new Delegua('delegua');

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva('Olá mundo')"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - Vetor vazio', () => {
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar([]);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
        });

        it('Sucesso - Undefined', () => {
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(undefined);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
        });

        it('Sucesso - Null', () => {
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(null);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
        });
    });
});