import { AvaliadorSintaticoPitugues } from "../../../../fontes/avaliador-sintatico";
import { LexadorPitugues } from "../../../../fontes/lexador";
import { InterpretadorPitugues } from "../../../../fontes/interpretador/dialetos/pitugues"

describe('Interpretador (Pituguês)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPitugues;
        let avaliadorSintatico: AvaliadorSintaticoPitugues;
        let interpretador: InterpretadorPitugues;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        }

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorPitugues();
            avaliadorSintatico = new AvaliadorSintaticoPitugues();
            interpretador = new InterpretadorPitugues(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        describe('Métodos de primitivas com dependência no interpretador', () => {
            describe('Números', () => {
                it('absoluto', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'imprima(-5.absoluto())',
                            'imprima(3.absoluto())',
                            'imprima(0.absoluto())',
                            'imprima(-6.absoluto())',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(4);
                    expect(_saidas[0]).toBe('5');
                    expect(_saidas[1]).toBe('3');
                    expect(_saidas[2]).toBe('0');
                    expect(_saidas[3]).toBe('6');
                });
            });
        });
    });
});
