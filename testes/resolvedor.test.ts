import { Delegua } from '../fontes/delegua';

describe('Resolvedor', () => {
    describe('resolver()', () => {
        const delegua = new Delegua('delegua');

        it('Sucesso', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva('Olá mundo')"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });

        it('Sucesso - Vetor vazio', () => {
            delegua.resolvedor.resolver([]);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });

        it('Sucesso - Undefined', () => {
            delegua.resolvedor.resolver(undefined);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });

        it('Sucesso - Null', () => {
            delegua.resolvedor.resolver(null);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });
    });
});