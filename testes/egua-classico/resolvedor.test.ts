import { AvaliadorSintaticoEguaClassico } from '../../fontes/avaliador-sintatico/dialetos';
import { ResolvedorEguaClassico } from '../../fontes/interpretador/dialetos/egua-classico/resolvedor/resolvedor';
import { LexadorEguaClassico } from '../../fontes/lexador/dialetos';

describe('Resolvedor (Égua Clássico)', () => {
    describe('resolver()', () => {
        let lexador: LexadorEguaClassico;
        let avaliadorSintatico: AvaliadorSintaticoEguaClassico;
        let resolvedor: ResolvedorEguaClassico;

        beforeEach(() => {
            lexador = new LexadorEguaClassico();
            avaliadorSintatico = new AvaliadorSintaticoEguaClassico();
            resolvedor = new ResolvedorEguaClassico();
        });

        it('Sucesso', () => {
            const retornoLexador = lexador.mapear(
                ["escreva('Olá mundo');"]
            );
            const retornoAvaliadorSintatico =
                avaliadorSintatico.analisar(retornoLexador);
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
    });
});
