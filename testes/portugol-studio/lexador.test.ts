import { LexadorPortugolStudio } from "../../fontes/lexador/dialetos";

describe('Lexador (Portugol Studio)', () => {
    describe('mapear()', () => {
        let lexador: LexadorPortugolStudio;

        beforeEach(() => {
            lexador = new LexadorPortugolStudio();
        });

        describe('Cenário de sucesso', () => {
            it('Arquivo vazio.', () => {
                const resultado = lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Programa vazio.', () => {
                const resultado = lexador.mapear([
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

            it('Operação matematica - adicao.', () => {
                const resultado = lexador.mapear([
                    'programa',
                    '{',
                    '   ', 
                    '    funcao inicio()',
                    '    {',
                    '        esreva(1 + 1)',
                    '    }',
                    '}'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(15);
            });

            it('Operação matematica - subtracao.', () => {
                const resultado = lexador.mapear([
                    'programa',
                    '{',
                    '   ', 
                    '    funcao inicio()',
                    '    {',
                    '        esreva(1 - 1)',
                    '    }',
                    '}'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(15);
            });

            it('Operação matematica - multiplicacao.', () => {
                const resultado = lexador.mapear([
                    'programa',
                    '{',
                    '   ', 
                    '    funcao inicio()',
                    '    {',
                    '        esreva(1 * 1)',
                    '    }',
                    '}'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(15);
            });

            it('Operação matematica - divisao.', () => {
                const resultado = lexador.mapear([
                    'programa',
                    '{',
                    '   ', 
                    '    funcao inicio()',
                    '    {',
                    '        esreva(1 / 1)',
                    '    }',
                    '}'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(15);
            });
        });
    });
});
