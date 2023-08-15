import { AvaliadorSintaticoPitugues } from "../../fontes/avaliador-sintatico/dialetos";
import { LexadorPitugues } from "../../fontes/lexador/dialetos";

describe('Avaliador sintático (Pituguês)', () => {
    describe('analisar()', () => {
        let lexador: LexadorPitugues;
        let avaliadorSintatico: AvaliadorSintaticoPitugues;

        beforeEach(() => {
            lexador = new LexadorPitugues();
            avaliadorSintatico = new AvaliadorSintaticoPitugues();
        });

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = lexador.mapear(
                ["escreva('Olá mundo')"],
                -1
            );
            const retornoAvaliadorSintatico =
                avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Falha - Identação', () => {
            const codigo = ['classe Cachorro:', 'latir():', "escreva('Erro')"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico =
                avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
        });
    });
});
