import { Delegua } from "../../fontes/delegua";

describe('Resolvedor (Égua Clássico)', () => {
    describe('resolver()', () => {
        const delegua = new Delegua('egua');

        it('Sucesso', () => {
            const simbolos = delegua.lexador.mapear(["escreva('Olá mundo');"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });

        // TODO: Resolver bug.
        it.skip('Sucesso - Vetor vazio', () => {
            delegua.resolvedor.resolver([]);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });

        // TODO: Resolver bug.
        it.skip('Sucesso - Undefined', () => {
            delegua.resolvedor.resolver(undefined);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });

        // TODO: Resolver bug.
        it.skip('Sucesso - Null', () => {
            delegua.resolvedor.resolver(null);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });
    });
});