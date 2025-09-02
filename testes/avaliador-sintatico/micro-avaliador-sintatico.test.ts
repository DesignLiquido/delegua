import { MicroLexador } from '../../fontes/lexador/micro-lexador';
import { MicroAvaliadorSintatico } from '../../fontes/avaliador-sintatico';

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        let microLexador: MicroLexador;
        let microAvaliadorSintatico: MicroAvaliadorSintatico;

        beforeEach(() => {
            microLexador = new MicroLexador();
            microAvaliadorSintatico = new MicroAvaliadorSintatico();
        });

        describe('Casos de sucesso', () => {
            it('Código Vazio', () => {
                const retornoLexador = microLexador.mapear("");
                const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            it('Olá Mundo', () => {
                const retornoLexador = microLexador.mapear("'Olá mundo'");
                const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Chamada de função', () => {
                const retornoLexador = microLexador.mapear("somar(2, 3)");
                const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Vetor literal', () => {
                const retornoLexador = microLexador.mapear("[1, 2, 3, 4, 5]");
                const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Acesso a propriedade por índice numérico', () => {
                const retornoLexador = microLexador.mapear("a[1]");
                const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });
        });        
    });
});
