import { AvaliadorSintaticoPotigol } from "../../fontes/avaliador-sintatico/dialetos";
import { InterpretadorPotigol } from "../../fontes/interpretador/dialetos";
import { LexadorPotigol } from "../../fontes/lexador/dialetos";

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPotigol;
        let avaliadorSintatico: AvaliadorSintaticoPotigol;
        let interpretador: InterpretadorPotigol;

        beforeEach(() => {
            lexador = new LexadorPotigol();
            avaliadorSintatico = new AvaliadorSintaticoPotigol();
            interpretador = new InterpretadorPotigol(process.cwd());
        });

        it('Trivial', async () => {
            const retornoLexador = lexador.mapear([
                'escreva "Olá mundo"'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        describe.only('Tipos e objetos', () => {
            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    'tipo Quadrado',
                    '  area() = lado * lado',
                    '  lado: Inteiro',
                    '  perimetro() = 4 * lado',
                    'fim',
                    'q1 = Quadrado(10)',
                    'escreva q1.area()',
                    'escreva q1.perimetro()'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});
