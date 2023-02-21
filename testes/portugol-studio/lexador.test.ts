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

            it('Operação matematica - adição', () => {
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

            it('Operação matematica - subtração', () => {
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

            it('Operação matematica - multiplicação', () => {
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

            it('Operação matematica - divisão', () => {
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

            it('Estrutura condicional - se e senão', () => {
                const resultado = lexador.mapear([
                    'programa',
                    '{',
                    '   ', 
                    '    funcao inicio()',
                    '    {',
                    '        real numeroUm, numeroDois, soma',
                    '        numeroUm = 12.0',
                    '        numeroDois = 20.0',
                    '        soma = numeroUm + numeroDois',
                    '        se (soma > 20)',
                    '        {',
                    '            escreva("Numero maior que 20")',
                    '        }',
                    '        senao',
                    '        {',
                    '            escreva("Numero menor que 20")',
                    '        }',
                    '    }',
                    '}'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(49);
            });
        });
    });
});
