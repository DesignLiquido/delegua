import { AvaliadorSintaticoEguaP } from "../../fontes/avaliador-sintatico/dialetos";
import { LexadorEguaP } from "../../fontes/lexador/dialetos";

describe('Avaliador sintático (EguaP)', () => {
    describe('analisar()', () => {
        let lexador: LexadorEguaP;
        let avaliadorSintatico: AvaliadorSintaticoEguaP;

        beforeEach(() => {
            lexador = new LexadorEguaP();
            avaliadorSintatico = new AvaliadorSintaticoEguaP();
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
