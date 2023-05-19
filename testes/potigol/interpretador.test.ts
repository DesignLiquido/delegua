import { AvaliadorSintaticoPotigol } from "../../fontes/avaliador-sintatico/dialetos";
import { InterpretadorBase } from "../../fontes/interpretador";
import { LexadorPotigol } from "../../fontes/lexador/dialetos";

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPotigol;
        let avaliadorSintatico: AvaliadorSintaticoPotigol;
        let interpretador: InterpretadorBase;

        beforeEach(() => {
            lexador = new LexadorPotigol();
            avaliadorSintatico = new AvaliadorSintaticoPotigol();
            interpretador = new InterpretadorBase(process.cwd());
        });

        it('Trivial', async () => {
            const retornoLexador = lexador.mapear([
                'escreva "Olá mundo"'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });
});
