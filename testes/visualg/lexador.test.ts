import { LexadorVisuAlg } from '../../fontes/lexador/dialetos';

import tiposDeSimbolos from "../../fontes/tipos-de-simbolos/visualg"

describe('Lexador (VisuAlg)', () => {
    describe('mapear()', () => {
        let lexador: LexadorVisuAlg;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio', () => {
                const resultado = lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Sucesso - Ponto-e-vírgula, opcional', () => {
                const resultado = lexador.mapear([';;;;;;;;;;;;;;;;;;;;;'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Sucesso - estrutura mínima', () => {
                const resultado = lexador.mapear([
                    "algoritmo \"vazio\"",
                    "var",
                    "inicio",
                    "fimalgoritmo"
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(8);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.ALGORITMO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.CARACTERE }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.QUEBRA_LINHA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.VAR }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.QUEBRA_LINHA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.INICIO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.QUEBRA_LINHA }),
                        // expect.objectContaining({ tipo: tiposDeSimbolos.ESCREVA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.FIM_ALGORITMO })
                    ])
                );
            });

            it('Sucesso - Olá mundo', () => {
                const resultado = lexador.mapear(
                    [
                        "algoritmo \"ola-mundo\"",
                        "var",
                        "a: inteiro",
                        "inicio"
                    ], -1);
    
                expect(resultado).toBeTruthy();
                /* expect(resultado.simbolos).toHaveLength(4);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.ESCREVA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.PARENTESE_ESQUERDO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.TEXTO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.PARENTESE_DIREITO }),
                    ])
                ); */
            });
        });
    });
});
