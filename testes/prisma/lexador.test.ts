import { LexadorPrisma } from '../../fontes/lexador/dialetos';

describe('Lexador (Prisma)', () => {
    describe('mapear()', () => {
        let lexador: LexadorPrisma;

        beforeEach(() => {
            lexador = new LexadorPrisma();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio', () => {
                const resultado = lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.erros).toHaveLength(0);
            });

            it('Sucesso - Olá mundo', () => {
                const resultado = lexador.mapear(
                    ['imprima("Olá mundo");'],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(5);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'IMPRIMA' }),
                        expect.objectContaining({ tipo: 'PARENTESE_ESQUERDO' }),
                        expect.objectContaining({ tipo: 'TEXTO' }),
                        expect.objectContaining({ tipo: 'PARENTESE_DIREITO' }),
                        expect.objectContaining({ tipo: 'PONTO_E_VIRGULA' }),
                    ])
                );
            });

            it('Sucesso - Operação Matemática (soma e igualdade)', () => {
                const resultado = lexador.mapear(['2 + 3 == 5'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(5);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'ADICAO' }),
                        expect.objectContaining({ tipo: 'IGUAL_IGUAL' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                    ])
                );
            });

            it('Sucesso - Atribuição de variável e Operação Matemática', () => {
                const resultado = lexador.mapear(
                    ['local numero = 1 * 2 - 3 % 4;'],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'LOCAL' }),
                        expect.objectContaining({ tipo: 'IDENTIFICADOR' }),
                        expect.objectContaining({ tipo: 'IGUAL' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'MULTIPLICACAO' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'SUBTRACAO' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'MODULO' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'PONTO_E_VIRGULA' }),
                    ])
                );
            });

            it('Sucesso - Declaração de função', () => {
                const resultado = lexador.mapear(
                    ['funcao teste() { retorna 42; }'],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'FUNCAO' }),
                        expect.objectContaining({ tipo: 'IDENTIFICADOR' }),
                        expect.objectContaining({ tipo: 'PARENTESE_ESQUERDO' }),
                        expect.objectContaining({ tipo: 'PARENTESE_DIREITO' }),
                        expect.objectContaining({ tipo: 'CHAVE_ESQUERDA' }),
                        expect.objectContaining({ tipo: 'RETORNA' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'PONTO_E_VIRGULA' }),
                        expect.objectContaining({ tipo: 'CHAVE_DIREITA' }),
                    ])
                );
            });

            it('Sucesso - Estrutura condicional', () => {
                const resultado = lexador.mapear(
                    ['se (x > 0) { imprima("positivo"); }'],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'SE' }),
                        expect.objectContaining({ tipo: 'PARENTESE_ESQUERDO' }),
                        expect.objectContaining({ tipo: 'IDENTIFICADOR' }),
                        expect.objectContaining({ tipo: 'MAIOR' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'PARENTESE_DIREITO' }),
                        expect.objectContaining({ tipo: 'CHAVE_ESQUERDA' }),
                        expect.objectContaining({ tipo: 'IMPRIMA' }),
                        expect.objectContaining({ tipo: 'CHAVE_DIREITA' }),
                    ])
                );
            });

            it('Sucesso - Array/Vetor', () => {
                const resultado = lexador.mapear(
                    ['local lista = [1, 2, 3];'],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'LOCAL' }),
                        expect.objectContaining({ tipo: 'IDENTIFICADOR' }),
                        expect.objectContaining({ tipo: 'IGUAL' }),
                        expect.objectContaining({ tipo: 'COLCHETE_ESQUERDO' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'VIRGULA' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'VIRGULA' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'COLCHETE_DIREITO' }),
                    ])
                );
            });

            it('Sucesso - Comentários', () => {
                const resultado = lexador.mapear(
                    [
                        '// Comentário de linha',
                        'local x = 5;',
                        '/* Comentário de bloco */',
                        'imprima(x);'
                    ],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'LOCAL' }),
                        expect.objectContaining({ tipo: 'IDENTIFICADOR' }),
                        expect.objectContaining({ tipo: 'IGUAL' }),
                        expect.objectContaining({ tipo: 'NUMERO' }),
                        expect.objectContaining({ tipo: 'IMPRIMA' }),
                    ])
                );
                // Comentários devem ser ignorados pelo lexador
                expect(resultado.simbolos.filter(s => s.lexema.includes('Comentário'))).toHaveLength(0);
            });

            it('Sucesso - Palavras-chave booleanas', () => {
                const resultado = lexador.mapear(
                    ['local ativo = verdadeiro; local inativo = falso;'],
                    -1
                );

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: 'VERDADEIRO' }),
                        expect.objectContaining({ tipo: 'FALSO' }),
                    ])
                );
            });
        });

        describe('Cenários de falha', () => {
            it('Falha léxica - texto sem fim', () => {
                const resultado = lexador.mapear(
                    ['"texto sem fim'],
                    -1
                );
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(1);
                expect(resultado.erros[0].mensagem).toBe('Texto não finalizado.');
            });

            it('Falha léxica - caractere inesperado', () => {
                const resultado = lexador.mapear(['@'], -1);
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(1);
                expect(resultado.erros[0].mensagem).toBe('Caractere inesperado.');
            });

            it('Falha léxica - múltiplos caracteres inesperados', () => {
                const resultado = lexador.mapear(['#$@'], -1);
                expect(resultado.erros.length).toBeGreaterThan(0);
                expect(resultado.erros.every(erro => erro.mensagem === 'Caractere inesperado.')).toBe(true);
            });
        });
    });
});
