import { Delegua } from "../../fontes/delegua";
import tiposDeSimbolos from "../../fontes/tipos-de-simbolos/visualg"

describe('Lexador (VisuAlg)', () => {
    describe('mapear()', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('visualg');
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio', () => {
                const resultado = delegua.lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Sucesso - Ponto-e-vírgula, opcional', () => {
                const resultado = delegua.lexador.mapear([';;;;;;;;;;;;;;;;;;;;;'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Sucesso - estrutura mínima', () => {
                const resultado = delegua.lexador.mapear([
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
                        expect.objectContaining({ tipo: tiposDeSimbolos.FIMALGORITMO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IDENTIFICADOR }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.QUEBRA_LINHA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.VAR })
                    ])
                );
            });

            it('Sucesso - Olá mundo', () => {
                const resultado = delegua.lexador.mapear(
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
