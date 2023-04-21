import { AvaliadorSintaticoEguaClassico } from "../../fontes/avaliador-sintatico/dialetos";
import { RetornoLexador } from "../../fontes/interfaces/retornos/retorno-lexador";
import { LexadorEguaClassico } from "../../fontes/lexador/dialetos";

describe('Avaliador sintático (Égua Clássico)', () => {
    describe('analisar()', () => {
        let lexador: LexadorEguaClassico;
        let avaliadorSintatico: AvaliadorSintaticoEguaClassico;

        beforeEach(() => {
            lexador = new LexadorEguaClassico();
            avaliadorSintatico = new AvaliadorSintaticoEguaClassico();
        });

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = lexador.mapear(["escreva('Olá mundo');"]);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Falha - Vetor vazio', () => {
            expect(() => avaliadorSintatico.analisar({ simbolos: [] } as unknown as RetornoLexador, -1)).toThrow(TypeError);
        });

        it('Falha - Undefined', () => {
            expect(() => avaliadorSintatico.analisar(undefined as any, -1)).toThrow(TypeError);
        });

        it('Falha - Null', () => {
            expect(() => avaliadorSintatico.analisar(null as any, -1)).toThrow(TypeError);
        });
    });
});