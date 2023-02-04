import { Delegua } from '../../fontes/delegua';

describe('Lexador (Portugol Studio)', () => {
    describe('mapear()', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('portugol-studio');
        });

        describe('Cenário de sucesso', () => {
            it('Arquivo vazio.', () => {
                const resultado = delegua.lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Programa vazio.', () => {
                const resultado = delegua.lexador.mapear([
                    'programa',
                    '{',
                    '   ', 
                    '    funcao inicio()',
                    '    {',
                    '',
                    '    }',
                    '}'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(9);
            });
        });
    });
});
