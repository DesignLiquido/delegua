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

        describe('Tipos e objetos', () => {
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

        describe('Declaração de lista', () => {
            it('Dado em vetor, escreva deve imprirmir o vetor', async () => {
                const retornoLexador = lexador.mapear([
                    'a = [3, 4]',
                    'escreva (a)'
                ], -1);

                // Substitua a função de saída
                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('[3, 4]');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });
       
            it.skip('WIP: Dado em vetor, escreva qual_tipo deve imprirmir Lista', async () => {
                const retornoLexador = lexador.mapear([
                    'a = [3, 4]',
                    'escreva (a.qual_tipo)'
                ], -1);

                // Substitua a função de saída
                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual("Lista");
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        })
    });
});
