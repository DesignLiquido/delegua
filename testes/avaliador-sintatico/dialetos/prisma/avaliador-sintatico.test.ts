import * as fs from 'fs';
import * as path from 'path';

import { AvaliadorSintaticoPrisma } from '../../../../fontes/avaliador-sintatico/dialetos';
import { Leia, Literal, SeTernario } from '../../../../fontes/construtos';
import { Classe, Enquanto, Escolha, Expressao, FuncaoDeclaracao, Para, ParaCada, Se, Tente, Var } from '../../../../fontes/declaracoes';
import { LexadorPrisma } from '../../../../fontes/lexador/dialetos';

describe('Avaliador Sintático (Prisma)', () => {
    describe('analisar()', () => {
        let lexador: LexadorPrisma;
        let avaliadorSintatico: AvaliadorSintaticoPrisma;

        beforeEach(() => {
            lexador = new LexadorPrisma();
            avaliadorSintatico = new AvaliadorSintaticoPrisma();
        });

        describe('Cenários de sucesso', () => {
            it('Código vazio', async () => {
                const retornoLexador = lexador.mapear([''], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Olá mundo', async () => {
                const retornoLexador = lexador.mapear(
                    ['imprima("Olá mundo");'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('leia', async () => {
                const retornoLexador = lexador.mapear(
                    ['local x = leia();'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);
                const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Var;
                expect(declaracao.inicializador.constructor).toBe(Leia);
            });

            describe('Declarações de variáveis', () => {
                it('Declaração de variável local numérica', async () => {
                    const retornoLexador = lexador.mapear(
                        ['local numero = 42;'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);
                });

                it('Declaração de variável local texto com colchetes duplos', async () => {
                    const retornoLexador = lexador.mapear([
                        "local texto = [[",
                        "  isto é uma string",
                        "  de várias linhas", 
                        "  o texto será impresso exatamente como está aqui!",
                        "]];",
                        "imprima (texto);"
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Var;
                    expect(declaracao.inicializador.constructor).toBe(Literal);
                });

                it('Declaração de variável global numérica', async () => {
                    const retornoLexador = lexador.mapear(
                        ['a = 42'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);
                });
            });

            it('Expressão matemática', async () => {
                const retornoLexador = lexador.mapear(
                    ['2 + 3 * 4;'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Expressao);
            });

            it('Estrutura condicional simples', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se verdadeiro entao',
                        '    imprima("É verdade");',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Se);
            });

            it('Estrutura condicional com senão', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se falso entao',
                        '    imprima("Verdadeiro");',
                        'senao',
                        '    imprima("Falso");',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Se);
            });

            it('Estrutura condicional com senão se encadeado', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se falso entao',
                        '    imprima("primeiro");',
                        'senao se verdadeiro entao',
                        '    imprima("segundo");',
                        'senao',
                        '    imprima("terceiro");',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Se);

                const declaracaoSe = retornoAvaliadorSintatico.declaracoes[0] as Se;
                expect(declaracaoSe.caminhoSenao).toBeInstanceOf(Se);

                const declaracaoSenaoSe = declaracaoSe.caminhoSenao as Se;
                expect(declaracaoSenaoSe.caminhoSenao).toBeTruthy();
            });

            it('Estrutura escolha com caso e padrao', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'local x = 2;',
                        'escolha x',
                        'caso 1 entao',
                        '    imprima("um");',
                        'caso 2 entao',
                        '    imprima("dois");',
                        'padrao entao',
                        '    imprima("outro");',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escolha);

                const declaracaoEscolha = retornoAvaliadorSintatico.declaracoes[1] as Escolha;
                expect(declaracaoEscolha.caminhos).toHaveLength(2);
                expect(declaracaoEscolha.caminhoPadrao).toBeTruthy();
            });

            it('Estrutura tente com pegue e finalmente', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'tente',
                        '    imprima("tente");',
                        'pegue',
                        '    imprima("pegue");',
                        'finalmente',
                        '    imprima("finalmente");',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Tente);
            });

            it('Operador ternário', async () => {
                const retornoLexador = lexador.mapear(
                    ['local resultado = verdadeiro ? 1 ou 0;'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);

                const declaracao = retornoAvaliadorSintatico.declaracoes[0] as Var;
                expect(declaracao.inicializador.constructor).toBe(SeTernario);
            });

            it('Enquanto', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'local i = 0;',
                        'enquanto i < 3 inicio',
                        '    imprima(i);',
                        '    i = i + 1;',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);
                expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Enquanto);
            });

            it('Declaração de função', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'funcao somar(a, b) ',
                        '    retorne a + b;',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(FuncaoDeclaracao);
            });

            it('Chamada de função', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'funcao teste()',
                        '    retorne 42;',
                        'fim',
                        'local resultado = teste();'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(FuncaoDeclaracao);
                expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Var);
            });

            describe('Tabela', () => {
                it('Trivial, sem índices nomeados', async () => {
                    const retornoLexador = lexador.mapear(
                        ['local minhatab = {1, 2, 3};'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Var);
                });

                it('Acesso a índice de tabela', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'local lista = {1, 2, 3};',
                            'local primeiro = lista[1];'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            it.skip('Declaração de classe', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'classe Pessoa {',
                        '    construtor(nome) {',
                        '        isto.nome = nome;',
                        '    }',
                        '}'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Classe);
            });
        });

        describe('Para tradicional', () => {
            it('Laço para tradicional', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'para i = 0, 5 inicio',
                        '    imprima(i)',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Para);
            });

            it('Laço para cada', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'local tabela = {1, 2, 3};',
                        'para cada elemento em tabela inicio',
                        '    imprima(elemento);',
                        'fim'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(ParaCada);
            });
        });

        describe('Exemplos Prisma', () => {
            it('Arquivos de exemplo devem ser analisados sem erros (exceto classes.prisma)', async () => {
                const diretorioExemplosPrisma = path.resolve(
                    __dirname,
                    '../../../../exemplos/dialetos/prisma'
                );

                const arquivosExemplo = fs
                    .readdirSync(diretorioExemplosPrisma)
                    .filter((arquivo) => arquivo.endsWith('.prisma'))
                    .filter((arquivo) => arquivo !== 'classes.prisma');

                for (const arquivoExemplo of arquivosExemplo) {
                    const conteudo = fs.readFileSync(
                        path.join(diretorioExemplosPrisma, arquivoExemplo),
                        'utf8'
                    );
                    const linhas = conteudo.split(/\r?\n/);

                    const retornoLexador = lexador.mapear(linhas, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                }
            });
        });

        describe('Cenários de falha', () => {
            it('Variável sem valor', async () => {
                const retornoLexador = lexador.mapear(['local x =;'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                
                // Deve ter erro sintático
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Parêntese não fechado', async () => {
                const retornoLexador = lexador.mapear(
                    ['imprima("teste"'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Se não fechado com fim', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'se (verdadeiro) entao',
                        '    imprima("teste");'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Variável não declarada', async () => {
                const retornoLexador = lexador.mapear(
                    ['imprima(variavel_inexistente);'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });
        });
    });
});
