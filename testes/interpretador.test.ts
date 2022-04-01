import { Delegua } from '../src/delegua';

describe('Interpretador', () => {
    describe('interpretar()', () => {
        const delegua = new Delegua('delegua');

        it('Sucesso', () => {
            const simbolos = delegua.lexador.mapear("escreva('Olá mundo')");
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErro).toBe(false);
        });
    });
});