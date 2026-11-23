import { LexadorGuarani } from '../../../../fontes/lexador/dialetos/lexador-guarani';

import tiposDeSimbolos from '../../../../fontes/tipos-de-simbolos/guarani';

describe('Lexador', () => {
    describe('mapear()', () => {
        let lexador: LexadorGuarani;

        beforeEach(() => {
            lexador = new LexadorGuarani();
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

            it('Sucesso - Olá guaranis', () => {
                const resultado = lexador.mapear(["hai('Olá guaranis')"], -1);

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

describe('Lexador (Guarani) - casos adicionais', () => {
    it('Números inteiros e decimais', () => {
        const resultado = new LexadorGuarani().mapear(['hai(12.5)', 'hai(7)'], -1);
        expect(resultado.erros).toHaveLength(0);
        const numeros = resultado.simbolos.filter((simbolo) => simbolo.tipo === tiposDeSimbolos.NUMERO);
        expect(numeros.map((simbolo) => simbolo.literal)).toEqual([12.5, 7]);
    });

    it('Texto não finalizado', () => {
        const resultado = new LexadorGuarani().mapear(['hai("abc'], -1);
        expect(resultado.erros.length).toBeGreaterThan(0);
    });

    it('Caractere inesperado', () => {
        const resultado = new LexadorGuarani().mapear(['hai($)'], -1);
        expect(resultado.erros.length).toBeGreaterThan(0);
    });
});
