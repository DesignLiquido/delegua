import { Delegua } from '../../fontes/delegua';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/guarani';

describe('Lexador', () => {
    describe('mapear()', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('delegua');
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

            it('Sucesso - Olá guaranis', () => {
                const resultado = delegua.lexador.mapear(["hai('Olá guaranis')"], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(4);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.HAI }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.PARENTESE_ESQUERDO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.TEXTO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.PARENTESE_DIREITO }),
                    ])
                );
            });
        });
    });
});
