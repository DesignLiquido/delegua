import { MicroLexador } from './../fontes/lexador/micro-lexador';
import { MicroAvaliadorSintatico } from '../fontes/avaliador-sintatico';

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        let microLexador: MicroLexador;
        let microAvaliadorSintatico: MicroAvaliadorSintatico;

        beforeEach(() => {
            microLexador = new MicroLexador();
            microAvaliadorSintatico = new MicroAvaliadorSintatico();
        });

        it('Sucesso - Texto Vazio', () => {
            const retornoLexador = microLexador.mapear("");
            const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
        });

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = microLexador.mapear("'Olá mundo'");
            const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - Chamada de função', () => {
            const retornoLexador = microLexador.mapear("somar(2, 3)");
            const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });
    });
});
