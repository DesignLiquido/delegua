import { AvaliadorSintaticoPortugolIpt } from "../../fontes/avaliador-sintatico/dialetos";
import { InterpretadorBase } from "../../fontes/interpretador";
import { LexadorPortugolIpt } from "../../fontes/lexador/dialetos";

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPortugolIpt;
        let avaliadorSintatico: AvaliadorSintaticoPortugolIpt;
        let interpretador: InterpretadorBase;

        beforeEach(() => {
            lexador = new LexadorPortugolIpt();
            avaliadorSintatico = new AvaliadorSintaticoPortugolIpt();
            interpretador = new InterpretadorBase(process.cwd());
        });

        describe('Cenários de sucesso', () => {
            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    'inicio',
                    'escrever "Olá mundo"',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});