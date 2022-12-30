import { Delegua } from '../../fontes/delegua';
import { RetornoLexador } from '../../fontes/interfaces/retornos/retorno-lexador';

describe('Avaliador sintático (EguaP)', () => {
    describe('analisar()', () => {
        const delegua = new Delegua('eguap');

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = delegua.lexador.mapear(
                ["escreva('Olá mundo')"],
                -1
            );
            const retornoAvaliadorSintatico =
                delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Falha - Identação', () => {
            const codigo = ['classe Cachorro:', 'latir():', "escreva('Erro')"];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico =
                delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
        });

        // it('Falha - Vetor vazio', () => {
        //     expect(() => delegua.avaliadorSintatico.analisar({simbolos: []} as RetornoLexador)).toThrow(TypeError);
        // });

        // it('Falha - Undefined', () => {
        //     expect(() => delegua.avaliadorSintatico.analisar(undefined)).toThrow(TypeError);
        // });

        // it('Falha - Null', () => {
        //     expect(() => delegua.avaliadorSintatico.analisar(null)).toThrow(TypeError);
        // });
    });
});
