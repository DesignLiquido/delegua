import { AvaliadorSintaticoPitugues } from "../../../../fontes/avaliador-sintatico/dialetos";
import { Morsa, Vetor, Bote, Chamada, Variavel, Literal } from "../../../../fontes/construtos";
import { Escreva, Importar, Se, Var } from "../../../../fontes/declaracoes";
import { LexadorPitugues } from "../../../../fontes/lexador/dialetos";

describe('Avaliador sintático (Pituguês)', () => {
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
                            'escreva(a.contém(3))'
                        ],
                        -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Chamada);
                });

                it('Não contém', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'a = [1, 2, 3, 4, 5]',
                            'escreva(a.contém(3))'
                        ],
                        -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Chamada);
                    const contem = escreva.argumentos[0] as Chamada;
                    expect(contem).toBeTruthy();
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

                describe('Iterando dicionários', () => {
                    it('Iterando dicionários com método itens()', async () => {
                        const retornoLexador = lexador.mapear([
                            'dicionarioLegal = { "a": 1, "b": 2, "c": 3 }',
                            'para cada chave, valor em dicionarioLegal.itens():',
                            '    imprima(chave, valor)'
                        ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        expect(retornoAvaliadorSintatico).toBeTruthy();
                        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    });

                    it('Iterando dicionários com duas variáveis', async () => {
                        const retornoLexador = lexador.mapear([
                            'dicionarioLegal = { "a": 1, "b": 2, "c": 3 }',
                            'para cada chave, valor em dicionarioLegal:',
                            '    imprima(chave, valor)'
                        ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        expect(retornoAvaliadorSintatico).toBeTruthy();
                        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    });

                    it('Iterando dicionários com uma variável', async () => {
                        const retornoLexador = lexador.mapear([
                            'dicionarioLegal = { "a": 1, "b": 2, "c": 3 }',
                            'para cada chaveValor em dicionarioLegal:',
                            '    imprima(chaveValor)'
                        ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        expect(retornoAvaliadorSintatico).toBeTruthy();
                        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    });
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

            describe('Operador Morsa (:=)', () => {
                it('Uso básico aninhado em um escreva', async () => {
                    const retornoLexador = lexador.mapear(
                        ['escreva(n := 10)'], -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);

                    const escreva = retornoAvaliadorSintatico
                        .declaracoes[0] as Escreva;

                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Morsa);

                    const morsa = escreva.argumentos[0] as Morsa;

                    expect(morsa.variavel.simbolo.lexema).toBe('n');
                    expect((morsa.valor as any).valor).toBe(10);
                });

                it('Uso em uma estrutura condicional (se)', async () => {
                    const retornoLexador = lexador.mapear([
                        'se ((n := 5) > 2):',
                        '    escreva(n)'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Se);
                });
            });

            describe('Operador Bote (~>)', () => {
                it('Uso básico', async () => {
                    const retornoLexador = lexador.mapear([
                        'resultado = "victor" ~> tamanho() ~> texto()',
                        'escreva(resultado)'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(
                        2
                    );

                    const declaracaoVar = retornoAvaliadorSintatico
                        .declaracoes[0] as Var;

                    expect(declaracaoVar.simbolo.lexema).toBe('resultado');

                    const boteExterno = declaracaoVar.inicializador as Bote;

                    expect(boteExterno.constructor.name).toBe('Bote');

                    const chamadaTexto = boteExterno.direita as Chamada;

                    expect(chamadaTexto.constructor.name).toBe('Chamada');
                    expect((chamadaTexto.entidadeChamada as Variavel).simbolo.lexema).toBe('texto');

                    const boteInterno = boteExterno.esquerda as Bote;

                    expect(boteInterno.constructor.name).toBe('Bote');

                    const chamadaTamanho = boteInterno.direita as Chamada;

                    expect(chamadaTamanho.constructor.name).toBe('Chamada');
                    expect((chamadaTamanho.entidadeChamada as Variavel).simbolo.lexema).toBe('tamanho');

                    const literalOriginal = boteInterno.esquerda as Literal;

                    expect(literalOriginal.constructor.name).toBe('Literal');
                    expect(literalOriginal.valor).toBe('victor');

                    const escreva = retornoAvaliadorSintatico
                        .declaracoes[1] as Escreva;

                    expect(escreva.argumentos).toHaveLength(1);
                    expect((escreva.argumentos[0] as Variavel).simbolo.lexema).toBe('resultado');
                });
            });

            it('Deve barrar símbolos matemáticos como nomes de propriedades', async () => {
                const retornoLexador = lexador.mapear([
                    'calculadora = {}',
                    'calculadora.+ = 10',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico
                    .analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros[0].message).toContain(
                    "Esperado nome do método ou propriedade após o '.'"
                );
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

            it('Falha - se sem dois-pontos após condição', async () => {
                const retornoLexador = lexador.mapear([
                    "se '1' == '0'",
                    "    imprima('não passará')",
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toContain("Esperado ':' após condição do 'se'.");
            });

            it('Falha - senao sem dois-pontos', async () => {
                const retornoLexador = lexador.mapear([
                    "se '1' == '0':",
                    "    imprima('não passará')",
                    "senao",
                    "    imprima('uhullll')",
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toContain("Esperado ':' após 'senao'.");
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

            describe('Desempacotamento de dicionários', () => {
                it('Parser reconhece spread simples', async () => {
                    const codigo = [
                        "base = {'a': 1}",
                        "copia = {**base}"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);

                    const declaracaoCopia = retornoAvaliadorSintatico.declaracoes[1] as Var;
                    const dicionario = declaracaoCopia.inicializador as any;

                    expect(dicionario.esSpread).toHaveLength(1);
                    expect(dicionario.esSpread[0]).toBe(true);
                });

                it('Parser reconhece exemplo do Python - dados_completos = {**pessoa, **dados_da_pessoa}', async () => {
                    const codigo = [
                        "pessoa = {'nome': 'Fulano', 'sobrenome': 'de Tal'}",
                        "dados_da_pessoa = {'idade': 20, 'uf': 'SP'}",
                        "dados_completos = {**pessoa, **dados_da_pessoa}"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);

                    const declaracaoDadosCompletos = retornoAvaliadorSintatico.declaracoes[2] as Var;
                    const dicionario = declaracaoDadosCompletos.inicializador as any;

                    expect(dicionario.esSpread).toHaveLength(2);
                    expect(dicionario.esSpread[0]).toBe(true);  // **pessoa
                    expect(dicionario.esSpread[1]).toBe(true);  // **dados_da_pessoa
                });

                it('Parser reconhece mix de spread e literal', async () => {
                    const codigo = [
                        "dict1 = {'a': 1}",
                        "dict2 = {'b': 2}",
                        "resultado = {**dict1, 'chave': 'valor', **dict2}"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                    const declaracao = retornoAvaliadorSintatico.declaracoes[2] as Var;
                    const dicionario = declaracao.inicializador as any;

                    expect(dicionario.esSpread).toHaveLength(3);
                    expect(dicionario.esSpread[0]).toBe(true);   // **dict1
                    expect(dicionario.esSpread[1]).toBe(false);  // 'chave': 'valor'
                    expect(dicionario.esSpread[2]).toBe(true);   // **dict2
                });

                it('Parser reconhece múltiplos spreads consecutivos', async () => {
                    const codigo = [
                        "dict1 = {'a': 1}",
                        "dict2 = {'b': 2}",
                        "dict3 = {'c': 3}",
                        "resultado = {**dict1, **dict2, **dict3}"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                    const declaracao = retornoAvaliadorSintatico.declaracoes[3] as Var;
                    const dicionario = declaracao.inicializador as any;

                    expect(dicionario.esSpread).toHaveLength(3);
                    expect(dicionario.esSpread[0]).toBe(true);
                    expect(dicionario.esSpread[1]).toBe(true);
                    expect(dicionario.esSpread[2]).toBe(true);
                });

                it('Parser reconhece dicionário vazio', async () => {
                    const codigo = [
                        "vazio = {}"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                    const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Var;
                    const dicionario = declaracao.inicializador as any;

                    expect(dicionario.esSpread).toHaveLength(0);
                    expect(dicionario.chaves).toHaveLength(0);
                    expect(dicionario.valores).toHaveLength(0);
                });

                it('Parser reconhece dicionário normal sem spread', async () => {
                    const codigo = [
                        "normal = {'a': 1, 'b': 2}"
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                    const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Var;
                    const dicionario = declaracao.inicializador as any;

                    expect(dicionario.esSpread).toHaveLength(2);
                    expect(dicionario.esSpread[0]).toBe(false);
                    expect(dicionario.esSpread[1]).toBe(false);
                });
            });

            describe('Importações', () => {
                it('importar matematica (sem alias)', async () => {
                    const retornoLexador = lexador.mapear(['importar matematica'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);

                    const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Importar;
                    expect(declaracao).toBeInstanceOf(Importar);
                    expect(declaracao.caminho.valor).toBe('matematica');
                    expect(declaracao.simboloTudo).not.toBeNull();
                    expect(declaracao.simboloTudo?.lexema).toBe('matematica');
                    expect(declaracao.elementosImportacao).toHaveLength(0);
                });

                it('importar matematica como mat (com alias)', async () => {
                    const retornoLexador = lexador.mapear(['importar matematica como mat'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);

                    const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Importar;
                    expect(declaracao).toBeInstanceOf(Importar);
                    expect(declaracao.caminho.valor).toBe('matematica');
                    expect(declaracao.simboloTudo).not.toBeNull();
                    expect(declaracao.simboloTudo?.lexema).toBe('mat');
                    expect(declaracao.elementosImportacao).toHaveLength(0);
                });

                it('de matematica importar raiz_quadrada (importação seletiva)', async () => {
                    const retornoLexador = lexador.mapear(['de matematica importar raiz_quadrada'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);

                    const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Importar;
                    expect(declaracao).toBeInstanceOf(Importar);
                    expect(declaracao.caminho.valor).toBe('matematica');
                    expect(declaracao.simboloTudo).toBeNull();
                    expect(declaracao.elementosImportacao).toHaveLength(1);
                    expect(declaracao.elementosImportacao[0].lexema).toBe('raiz_quadrada');
                });

                it('de matematica importar raiz_quadrada, potencia (importação seletiva múltipla)', async () => {
                    const retornoLexador = lexador.mapear(['de matematica importar raiz_quadrada, potencia'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);

                    const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Importar;
                    expect(declaracao).toBeInstanceOf(Importar);
                    expect(declaracao.caminho.valor).toBe('matematica');
                    expect(declaracao.simboloTudo).toBeNull();
                    expect(declaracao.elementosImportacao).toHaveLength(2);
                    expect(declaracao.elementosImportacao[0].lexema).toBe('raiz_quadrada');
                    expect(declaracao.elementosImportacao[1].lexema).toBe('potencia');
                });
            });

            it('Deve exigir o corpo do escopo e lançar erro se o fim de arquivo for alcançado', async () => {
                const codigo = [`
                    se verdadeiro:
                `];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliador = await avaliadorSintatico.analisar(
                    retornoLexador, -1
                );

                expect(retornoAvaliador.erros).toHaveLength(1);
                expect(retornoAvaliador.erros[0].message).toBe('Esperado corpo do escopo após a declaração.');
            });

            it('Deve exigir o identificador da função e barrar falha silenciosa no final do arquivo', async () => {
                const codigo = [`
                    funcao
                `];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliador = await avaliadorSintatico.analisar(
                    retornoLexador, -1
                );

                expect(retornoAvaliador.erros).toHaveLength(1);
                expect(retornoAvaliador.erros[0].message).toBe('Esperado nome da função.');
            });

            describe('Operador Morsa (:=)', () => {
                it('Deve falhar quando lado direito vazio (sem valor)', async () => {
                    const retornoLexador = lexador.mapear(
                        ['escreva(n := )'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Deve falhar quando alvo inválido à esquerda (literal no lugar da variável)', async () => {
                    const retornoLexador = lexador.mapear(
                        ['escreva(10 := 5)'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });
            });

            it('Deve acusar erro ao criar um vetor da forma errada', async () => {
                const retornoLexador = lexador.mapear(
                    ['vetorQuebrado = [1 2 3]'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(
                    0
                );
                expect(retornoAvaliadorSintatico.erros[0].message).toContain(
                    'Os itens dos vetores devem ser separados através de uma vírgula.'
                );
            });
        });

        describe('Operador de interrogação (?)', () => {
            it('? com texto literal gera erro', async () => {
                const retornoLexador = lexador.mapear(["escreva(?'a')"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });

            it('? com número literal gera erro', async () => {
                const retornoLexador = lexador.mapear(['escreva(?10)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });

            it('? com lógico literal gera erro', async () => {
                const retornoLexador = lexador.mapear(['escreva(?verdadeiro)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });

            it('? com vetor vazio gera erro', async () => {
                const retornoLexador = lexador.mapear(['escreva(?[])'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });
        });
    });
});
