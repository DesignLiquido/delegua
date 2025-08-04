import { AvaliadorSintaticoCalango } from "../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-calango";
import { LexadorCalango } from "../../fontes/lexador/dialetos";
import { InterpretadorBase } from "../../fontes/interpretador/interpretador-base"

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorCalango;
        let avaliadorSintatico: AvaliadorSintaticoCalango;
        let interpretador: InterpretadorBase;

        describe('Cenários de sucesso', () => {
            beforeEach(() => {
                lexador = new LexadorCalango();
                avaliadorSintatico = new AvaliadorSintaticoCalango();
                interpretador = new InterpretadorBase(process.cwd());
            });

            it('escreva()', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo tituloDoAlgoritmo;', 
                    'principal', 
                    'escreva("Ola Mundo");',
                    'fimPrincipal'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saida).toEqual("Ola mundo")
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});