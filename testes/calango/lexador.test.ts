import { LexadorCalango } from '../../fontes/lexador/dialetos/lexador-calango';

import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/calango';

describe('Lexador (Calango)', () => {
    describe('mapear()', () => {
        let lexador: LexadorCalango;

        beforeEach(() => {
            lexador = new LexadorCalango();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Vetor de código vazio', () => {
                const resultado = lexador.mapear([], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(0);
            });
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio com símbolos algoritmo, principal e fimPrincipal', () => {
                const resultado = lexador.mapear(['algoritmo', 'principal', 'fimPrincipal'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(0);
            });
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Método "escreva"', () => {
                const resultado = lexador.mapear([
                    'algoritmo', 
                    'principal', 
                    'escreva("Ola Mundo");',
                    'fimPrincipal'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(0);
            });
        });
    });
});