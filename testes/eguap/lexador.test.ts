import { Delegua } from "../../fontes/delegua";

describe('Lexador (EguaP)', () => {
    describe('mapear()', () => {
        const delegua = new Delegua('eguap');

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio', () => {
                const resultado = delegua.lexador.mapear(['']);

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(0);
            });

            it('Sucesso - Olá mundo', () => {
                const resultado = delegua.lexador.mapear(["escreva('Olá mundo')"]);

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(4);
                expect(resultado).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'ESCREVA' }),
                        expect.objectContaining({ tipo: 'PARENTESE_ESQUERDO' }),
                        expect.objectContaining({ tipo: 'TEXTO' }),
                        expect.objectContaining({ tipo: 'PARENTESE_DIREITO' })
                    ])
                );
            });

            it('Sucesso - Operação Matemática (soma e igualdade)', () => {
                const resultado = delegua.lexador.mapear(['2 + 3 == 5']);

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(5);
                expect(resultado).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'ADICAO' }),
                        expect.objectContaining({ tipo: 'IGUAL_IGUAL' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                    ])
                );
            });
        });
    });
});
