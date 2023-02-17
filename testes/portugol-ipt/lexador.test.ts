import { LexadorPortugolIpt } from '../../fontes/lexador/dialetos/lexador-portugol-ipt';

import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/portugol-ipt';

describe('Lexador (Portugol IPT)', () => {
    describe('mapear()', () => {
        let lexador: LexadorPortugolIpt;

        beforeEach(() => {
            lexador = new LexadorPortugolIpt();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio', () => {
                const resultado = lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código apenas com `inicio` e `fim`', () => {
                const resultado = lexador.mapear(['inicio', 'fim'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(2);
            });
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Olá Mundo', () => {
                const resultado = lexador.mapear([
                    'inicio', 
                    'escrever "Olá mundo"',
                    'fim'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(4);
            });
        });
    });
});
