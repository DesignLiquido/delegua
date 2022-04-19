import { Delegua } from "../../fontes/delegua";
import { RetornoLexador } from "../../fontes/lexador/retorno-lexador";

describe('Avaliador sintático (Égua Clássico)', () => {
    describe('analisar()', () => {
        const delegua = new Delegua('egua');

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva('Olá mundo');"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Falha - Vetor vazio', () => {
            expect(() => delegua.avaliadorSintatico.analisar({simbolos: []} as RetornoLexador)).toThrow(TypeError);
        });

        it('Falha - Undefined', () => {
            expect(() => delegua.avaliadorSintatico.analisar(undefined)).toThrow(TypeError);
        });

        it('Falha - Null', () => {
            expect(() => delegua.avaliadorSintatico.analisar(null)).toThrow(TypeError);
        });
    });
});