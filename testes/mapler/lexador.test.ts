import { LexadorMapler } from '../../fontes/lexador/dialetos';

import tiposDeSimbolos from "../../fontes/tipos-de-simbolos/mapler"

describe('Lexador (Mapler)', () => {
    describe('mapear()', () => {
        let lexador: LexadorMapler;

        beforeEach(() => {
            lexador = new LexadorMapler();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio', () => {
                const resultado = lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Sucesso - estrutura mínima', () => {
                const resultado = lexador.mapear([
                    "variaveis",
                    "inicio",
                    "fim"
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(3);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.VARIAVEIS }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.INICIO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.FIM }),
                    ])
                );
            });
        });
    });
});
