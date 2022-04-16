import { Delegua } from "../../fontes/delegua";

describe('Resolvedor (Égua Clássico)', () => {
    describe('resolver()', () => {
        const delegua = new Delegua('egua');

        it('Sucesso', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva('Olá mundo');"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });

        // TODO: Resolver bug.
        it('Sucesso - Vetor vazio', () => {
            delegua.resolvedor.resolver([]);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });

        // TODO: Resolver bug.
        it('Sucesso - Undefined', () => {
            delegua.resolvedor.resolver(undefined);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });

        // TODO: Resolver bug.
        it('Sucesso - Null', () => {
            delegua.resolvedor.resolver(null);
            expect(delegua.resolvedor.escopos).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toBeTruthy();
            expect(delegua.resolvedor.escopos.pilha).toHaveLength(0);
        });
    });
});