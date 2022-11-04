import { Delegua } from '../../fontes/delegua';
import { ResolvedorEguaClassico } from '../../fontes/resolvedor/dialetos';

describe('Resolvedor (Égua Clássico)', () => {
    describe('resolver()', () => {
        const delegua = new Delegua('egua');
        const resolvedor = new ResolvedorEguaClassico();

        it('Sucesso', () => {
            const retornoLexador = delegua.lexador.mapear(
                ["escreva('Olá mundo');"],
                -1
            );
            const retornoAvaliadorSintatico =
                delegua.avaliadorSintatico.analisar(retornoLexador);
            resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            expect(resolvedor.escopos).toBeTruthy();
            expect(resolvedor.escopos.pilha).toBeTruthy();
            expect(resolvedor.escopos.pilha).toHaveLength(0);
        });

        it('Sucesso - Vetor vazio', () => {
            resolvedor.resolver([]);
            expect(resolvedor.escopos).toBeTruthy();
            expect(resolvedor.escopos.pilha).toBeTruthy();
            expect(resolvedor.escopos.pilha).toHaveLength(0);
        });

        it('Sucesso - Undefined', () => {
            resolvedor.resolver(undefined);
            expect(resolvedor.escopos).toBeTruthy();
            expect(resolvedor.escopos.pilha).toBeTruthy();
            expect(resolvedor.escopos.pilha).toHaveLength(0);
        });

        it('Sucesso - Null', () => {
            resolvedor.resolver(null);
            expect(resolvedor.escopos).toBeTruthy();
            expect(resolvedor.escopos.pilha).toBeTruthy();
            expect(resolvedor.escopos.pilha).toHaveLength(0);
        });
    });
});
