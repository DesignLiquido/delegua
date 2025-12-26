import { AvaliadorSintaticoPitugues } from "../../fontes/avaliador-sintatico/dialetos";
import { Logico, Vetor } from "../../fontes/construtos";
import { Escreva, Var } from "../../fontes/declaracoes";
import { LexadorPitugues } from "../../fontes/lexador/dialetos";

describe.skip('Avaliador sintático (Pituguês)', () => {
    describe('analisar()', () => {
        let lexador: LexadorPitugues;
        let avaliadorSintatico: AvaliadorSintaticoPitugues;

        beforeEach(() => {
            lexador = new LexadorPitugues();
            avaliadorSintatico = new AvaliadorSintaticoPitugues();
        });

        describe('Casos de sucesso', () => {
            it('Olá Mundo', async () => {
                const retornoLexador = lexador.mapear(
                    ["escreva('Olá mundo')"],
                    -1
                );
                const retornoAvaliadorSintatico =
                    await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Olá Mundo (Imprima)', async () => {
                const retornoLexador = lexador.mapear(
                    ["imprima('Olá mundo')"],
                    -1
                );
                const retornoAvaliadorSintatico =
                    await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Atribuição com soma', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'imprima(2 + 2)',
                        'a = 2',
                        'imprima(a += 2)',
                        'imprima(a)'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });

            describe('Operações lógicas', () => {
                it('Diferente', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'imprima(1 != 1)'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Contém', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'a = [1, 2, 3, 4, 5]',
                            'escreva(a contém 3)'
                        ],
                        -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Logico);
                });

                it('Não contém', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'a = [1, 2, 3, 4, 5]',
                            'escreva(a não contém 3)'
                        ],
                        -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Logico);
                    const contem = escreva.argumentos[0] as Logico;
                    expect(contem.negado).toBe(true);
                });
            });

            describe('Para cada', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'vetor = [1, 2, 3]',
                            'para cada elemento de vetor:',
                            '    escreva(elemento)'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Iterando texto', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'texto1 = "Texto"',
                            'para cada item em texto1:',
                            '    imprima(item)'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            it('Lista de Compreensão', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'lista = [1, 2, 3, 4, 5]',
                        'minhaListaCompreensao = [x para cada x em lista se x % 2 == 0] # Lista de compreensão para números pares'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            describe('Se ternário', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'idade = 20',
                            'categoria = "Adulto" se idade >= 18 senão "Menor de idade"'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            it('Comentário antes de se', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'a = 1',
                        '# Comentário',
                        'se a > 0:',
                        '    escreva("Teste")',
                        '    a = 10',
                        'escreva(a)'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    await avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });

            describe('Ponto e vírgula - Usos permitidos', () => {
                it('Múltiplos comandos na mesma linha - escreva', async () => {
                    const retornoLexador = lexador.mapear(
                        ["escreva('a'); escreva('b')"],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Múltiplos comandos na mesma linha - variáveis', async () => {
                    const retornoLexador = lexador.mapear(
                        ["x = 1; y = 2"],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Múltiplos tipos de comandos na mesma linha', async () => {
                    const retornoLexador = lexador.mapear(
                        ["a = 1; escreva(a); b = a + 1"],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
            });

            describe('Declarações implícitas', () => {
                it('Declarações implícitas seguidas', async () => {
                    const retornoLexador = lexador.mapear(['a, b, c = 1, 2, 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                })

                it('Reatribuição de variável declarada implicitamente', async () => {
                    const retornoLexador = lexador.mapear(['a = 10', 'a = 20'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Escopo aninhado com declaração implícita', async () => {
                    const retornoLexador = lexador.mapear([
                        'a = 1',
                        'se verdadeiro:',
                        '    b = 2',
                        '    escreva(a + b)'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Declaração implícita com diferentes tipos', async () => {
                    const retornoLexador = lexador.mapear([
                        'a = 1',
                        'b = "texto"',
                        'c = [1, 2, 3]',
                        'd = verdadeiro',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
                });

                it('Variável sombreando variável externa', async () => {
                    const retornoLexador = lexador.mapear([
                        'a = "global"',
                        'se verdadeiro:',
                        '    a = "local"',
                        '    escreva(a)',
                        'escreva(a)'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
            });

            it('Desempacotamento com expressões matemáticas', async () => {
                const retornoLexador = lexador.mapear([
                    'a, b = 10 + 10, 5 * 5'
                ], -1)
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
            })

            describe('Desempacotamento de valores usando o operador * (resto)', () => {
                it('Operador * (resto) como única variável', async () => {
                    const retornoLexador = lexador.mapear([
                        '*tudo = 1, 2, 3'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);

                    const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Var;
                    expect(declaracao.inicializador).toBeInstanceOf(Vetor);

                    expect((declaracao.inicializador as Vetor).valores).toHaveLength(3);
                });

                it('Desempacotamento de valores usando o operador * (resto) no início da declaração', async () => {
                    const retornoLexador = lexador.mapear([
                        '*a, b, c = 1, 2, 3, 4, 5',
                        'escreva(a, b, c)'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
                });

                it('Desempacotamento de valores usando o operador * (resto) no meio da declaração', async () => {
                    const retornoLexador = lexador.mapear([
                        'a, *b, c = 1, 2, 3, 4, 5',
                        'escreva(a, b, c)'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
                });

                it('Desempacotamento de valores usando o operador * (resto) no fim da declaração', async () => {
                    const retornoLexador = lexador.mapear([
                        'a, b, *c = 1, 2, 3, 4, 5',
                        'escreva(a, b, c)'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
                });

                it('Desempacotamento válido com valores insuficientes (operador * pode receber lista vazia)', async () => {
                    const retornoLexador = lexador.mapear([
                        'a, *b, c = 1, 2'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
            });

            describe('Desempacotamento de coleção (com vetor literal)', () => {
                it('Desempacotamento válido com valores suficientes', async () => {
                    const retornoLexador = lexador.mapear([
                        'a, b, c = ["maçã", "banana", "laranja"]'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
            });

            it('Gera estrutura de validação para desempacotamento de variáveis', async () => {
                const retornoLexador = lexador.mapear([
                    'lista = [1, 2]',
                    'a, b = lista'
                ], -1);

                const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliador).toBeTruthy();

                // Esperamos MAIS que 2 declarações.
                // Deve ter:
                // 1. Var temporária (__temp...)
                // 2. Se (tamanho != 2) ...
                // 3. Var a
                // 4. Var b
                expect(retornoAvaliador.declaracoes.length).toBeGreaterThan(2);

                // Verificar se existe a injeção do 'Se'
                const temValidacaoSe = retornoAvaliador.declaracoes.some(d => d.constructor.name === 'Se');
                expect(temValidacaoSe).toBe(true);
            });

            it('Deve suportar atribuição composta (+=, -=, *=, /=)', async () => {
                const retornoLexador = lexador.mapear([`
                    a = 1
                    a += 2
                    a -= 1
                    a *= 3
                    a /= 2
                `], -1);
                const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliador.erros).toHaveLength(0);
                expect(retornoAvaliador.declaracoes).toHaveLength(5);
            });
        });

        describe('Casos de falha', () => {
            it('Falha - Indentação', async () => {
                const codigo = ['classe Cachorro:', 'funcao latir():', "escreva('Erro')"];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico =
                    await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Falha - Ponto e Vírgula', async () => {
                const codigo = [
                    "escreva('teste');",
                    "a = 1;",
                    "x = 1; #comentário"
                ];

                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(3);

                expect(retornoAvaliadorSintatico.erros[0].simbolo.linha).toBe(1);
                expect(retornoAvaliadorSintatico.erros[1].simbolo.linha).toBe(2);
                expect(retornoAvaliadorSintatico.erros[2].simbolo.linha).toBe(3);

                const mensagemEsperada = 'Ponto e vírgula (;) não é permitido no final da sentença de código.';
                expect(retornoAvaliadorSintatico.erros[0].message).toContain(mensagemEsperada);
            });

            it('Falha - Uso de "var" como palavra-chave', async () => {
                const retornoLexador = lexador.mapear(['var a = 10'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            it('Falha - criação de variável sem valor de forma implícita', async () => {
                const codigo = ['a = '];

                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            describe('Falha - Desempacotamento de valores sem e com * (resto)', () => {
                it('Desempacotamento de valores sem usar * (resto)', async () => {
                    const codigo = ['a, b, c = 1, 2, 3, 4, 5'];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
                });

                it('Quantidade insuficiente de valores (sem resto)', async () => {
                    const codigo = ['a, b, c = 1, 2'];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros[0].message).toContain('diferente da quantidade');
                })

                it('Desempacotamento de valores com múltiplos operadores *', async () => {
                    const codigo = ['*a, *b, *resto = 1, 2, 3, 4, 5'];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Quantidade insuficiente de valores para preencher as variáveis obrigatórias (com resto)', async () => {
                    const codigo = ['a, *b, c = 1'];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });
            });

            describe('Desempacotamento de coleção', () => {
                it('Desempacotamento inválido com itens do vetor maiores que a quantidade de variáveis', async () => {
                    const codigo = ['a, b, c = ["maçã", "banana", "laranja", "uva"]'];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toContain('O vetor possui 4 elementos');
                });

                it('Desempacotamento inválido com itens do vetor menores que a quantidade de variáveis', async () => {
                    const codigo = ['a, b, c = ["maçã", "banana"]'];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });
            });
        });
    });
});