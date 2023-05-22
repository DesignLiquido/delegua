import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Lexador } from '../../fontes/lexador';
import { TradutorPython } from '../../fontes/tradutores';

describe('Tradutor Delégua -> Python', () => {
    const tradutor: TradutorPython = new TradutorPython();

    describe('Código', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;

        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
        });

        it('Olá mundo', () => {
            const retornoLexador = lexador.mapear(
                ['escreva("Olá mundo")'], 
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/print\('Olá mundo'\)/i);
        });
    });
});