import { Delegua } from '../src/delegua';

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        const delegua = new Delegua('delegua');

        it('Sucesso - Olá Mundo', () => {
            const simbolos = delegua.lexador.mapear(["escreva('Olá mundo')"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);

            expect(declaracoes).toBeTruthy();
            expect(declaracoes).toHaveLength(1);
        });

        it('Sucesso - Vetor vazio', () => {
            const declaracoes = delegua.avaliadorSintatico.analisar([]);

            expect(declaracoes).toBeTruthy();
            expect(declaracoes).toHaveLength(0);
        });

        it('Sucesso - Undefined', () => {
            const declaracoes = delegua.avaliadorSintatico.analisar(undefined);

            expect(declaracoes).toBeTruthy();
            expect(declaracoes).toHaveLength(0);
        });

        it('Sucesso - Null', () => {
            const declaracoes = delegua.avaliadorSintatico.analisar(null);

            expect(declaracoes).toBeTruthy();
            expect(declaracoes).toHaveLength(0);
        });
    });
});