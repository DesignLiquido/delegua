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

        describe('Casos de sucesso', () => {
            it('Olá Mundo', () => {
                const retornoLexador = lexador.mapear(
                    ["escreva('Olá mundo')"],
                    -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Olá Mundo (Imprima)', () => {
                const retornoLexador = lexador.mapear(
                    ["imprima('Olá mundo')"],
                    -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Atribuição com soma', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'imprima(2 + 2)',
                        'var a = 2',
                        'imprima(a += 2)',
                        'imprima(a)'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });

            it('Operações lógicas', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'imprima(1 != 1)'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Para cada', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var vetor = [1, 2, 3]',
                        'para cada elemento de vetor:',
                        '    escreva(elemento)'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
            });
        });
        
        describe('Casos de falha', () => {
            it('Falha - Indentação', () => {
                const codigo = ['classe Cachorro:', 'funcao latir():', "escreva('Erro')"];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });
        });
    });
});
