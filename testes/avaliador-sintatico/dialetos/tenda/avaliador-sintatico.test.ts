import { AvaliadorSintaticoTenda } from '../../../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-tenda';
import { LexadorTenda } from '../../../../fontes/lexador/dialetos/lexador-tenda';
import { Var, FuncaoDeclaracao, Escreva, Se, Enquanto, Para, ParaCada, Retorna, Tente, Expressao } from '../../../../fontes/declaracoes';
import { Literal, Variavel, Binario, Chamada, FuncaoConstruto } from '../../../../fontes/construtos';

describe('Avaliador sintático (Tenda)', () => {
    describe('analisar()', () => {
        let lexador: LexadorTenda;
        let avaliadorSintatico: AvaliadorSintaticoTenda;

        beforeEach(() => {
            lexador = new LexadorTenda();
            avaliadorSintatico = new AvaliadorSintaticoTenda();
        });

        describe('Cenários de sucesso', () => {
            describe('Literais e expressões básicas', () => {
                it('Literal numérico', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 42'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Var);
                });

                it('Literal de texto', async () => {
                    const retornoLexador = lexador.mapear(["seja nome = 'Tenda'"], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Var);
                });

                it('Literal verdadeiro', async () => {
                    const retornoLexador = lexador.mapear(['seja ativo = verdadeiro'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Var);
                    const declaracaoVar = retornoAvaliadorSintatico.declaracoes[0] as Var;
                    expect((declaracaoVar.inicializador as Literal).valor).toBe(true);
                });

                it('Literal falso', async () => {
                    const retornoLexador = lexador.mapear(['seja ativo = falso'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Var);
                    const declaracaoVar = retornoAvaliadorSintatico.declaracoes[0] as Var;
                    expect((declaracaoVar.inicializador as Literal).valor).toBe(false);
                });

                it('Literal nulo', async () => {
                    const retornoLexador = lexador.mapear(['seja vazio = nulo'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Var);
                });

                it('Vetor vazio', async () => {
                    const retornoLexador = lexador.mapear(['seja v = []'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Vetor com elementos', async () => {
                    const retornoLexador = lexador.mapear(['seja v = [1, 2, 3]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Dicionário vazio', async () => {
                    const retornoLexador = lexador.mapear(['seja d = {}'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Dicionário com chaves', async () => {
                    const retornoLexador = lexador.mapear(["seja d = { 'chave': 1 }"], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Agrupamento com parênteses', async () => {
                    const retornoLexador = lexador.mapear(['seja x = (1 + 2)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Declaração exiba (escreva)', () => {
                it('exiba com literal de texto', async () => {
                    const retornoLexador = lexador.mapear(["exiba('Olá Mundo')"], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Escreva);
                });

                it('exiba com variável', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja x = 42',
                        'exiba(x)',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('exiba com múltiplos argumentos', async () => {
                    const retornoLexador = lexador.mapear(["exiba('a', 'b', 'c')"], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Declaração seja (variável)', () => {
                it('Declaração simples de variável', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 10'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Var);
                });

                it('Declaração de variável com expressão aritmética', async () => {
                    const retornoLexador = lexador.mapear(['seja resultado = 5 + 3 * 2'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Declaração de função com seja', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja somar(a, b) = faça',
                        '    retorna a + b',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(FuncaoDeclaracao);
                });
            });

            describe('Declaração se/então/senão', () => {
                it('Se simples com então', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja x = 5',
                        'se x > 0 então faça',
                        '    exiba("positivo")',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracaoSe = retornoAvaliadorSintatico.declaracoes[1] as Se;
                    expect(declaracaoSe).toBeInstanceOf(Se);
                });

                it('Se/então/senão', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja x = 5',
                        'se x > 0 então faça',
                        '    exiba("positivo")',
                        'fim senão faça',
                        '    exiba("negativo")',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracaoSe = retornoAvaliadorSintatico.declaracoes[1] as Se;
                    expect(declaracaoSe).toBeInstanceOf(Se);
                });
            });

            describe('Declaração enquanto', () => {
                it('Enquanto simples', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja i = 0',
                        'enquanto i < 10 faça',
                        '    seja i = i + 1',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracaoEnquanto = retornoAvaliadorSintatico.declaracoes[1] as Enquanto;
                    expect(declaracaoEnquanto).toBeInstanceOf(Enquanto);
                });

                it('Enquanto com sustar', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja i = 0',
                        'enquanto verdadeiro faça',
                        '    sustar',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Enquanto com se/então aninhado', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja i = 0',
                        'enquanto verdadeiro faça',
                        '    seja i = i + 1',
                        '    se i >= 5 então faça',
                        '        exiba("parar")',
                        '    fim',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Enquanto com continua', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja i = 0',
                        'enquanto i < 10 faça',
                        '    seja i = i + 1',
                        '    continua',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Declaração para cada (tradicional)', () => {
                it('Para cada com range numérico', async () => {
                    const retornoLexador = lexador.mapear([
                        'para cada i em 1 até 10 faça',
                        '    exiba(i)',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Para);
                });
            });

            describe('Declaração para cada (vetor)', () => {
                it('Para cada com vetor', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja v = [1, 2, 3]',
                        'para cada item em v faça',
                        '    exiba(item)',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[1]).toBeInstanceOf(ParaCada);
                });
            });

            describe('Declaração de função', () => {
                it('Função sem parâmetros com retorno implícito', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja ola() = exiba("Olá")',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(FuncaoDeclaracao);
                });

                it('Função com parâmetros e corpo em bloco', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja somar(a, b) = faça',
                        '    retorna a + b',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(FuncaoDeclaracao);
                });

                it('Função com retorna e valor', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja obterNome() = faça',
                        '    retorna "Tenda"',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const funcao = retornoAvaliadorSintatico.declaracoes[0] as FuncaoDeclaracao;
                    expect(funcao).toBeInstanceOf(FuncaoDeclaracao);
                    expect(funcao.funcao.corpo[0]).toBeInstanceOf(Retorna);
                });

                it('Função com retorna sem valor', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja nada() = faça',
                        '    retorna',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Função anônima com keyword função', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja fn = função() -> faça',
                        '    retorna 42',
                        'fim',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Chamada de função', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja somar(a, b) = faça',
                        '    retorna a + b',
                        'fim',
                        'seja resultado = somar(3, 4)',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Operações aritméticas e comparações', () => {
                it('Adição', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 1 + 2'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Subtração', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 5 - 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Multiplicação', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 4 * 2'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Divisão', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 10 / 2'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Módulo', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 10 % 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Divisão inteira', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 10 \\ 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Negação lógica', async () => {
                    const retornoLexador = lexador.mapear(['seja x = não verdadeiro'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Negação numérica', async () => {
                    const retornoLexador = lexador.mapear(['seja x = -5'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Comparação maior que', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 5 > 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Comparação menor que', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 5 < 10'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Comparação maior ou igual', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 5 >= 5'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Comparação menor ou igual', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 5 <= 5'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Igualdade: a é b', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 5 é 5'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Diferença: a não é b', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 5 não é 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Operador lógico e', async () => {
                    const retornoLexador = lexador.mapear(['seja x = verdadeiro e falso'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Operador tem (em)', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja v = [1, 2, 3]',
                        'seja x = 2 tem v',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Incremento via atribuição', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja x = 5',
                        'x = x + 1',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Decremento via atribuição', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja x = 5',
                        'x = x - 1',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Bit shift esquerdo <<', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 1 << 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Bit shift direito >>', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 8 >> 2'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Bit AND &', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 5 & 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Bit OR |', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 5 | 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Bit XOR ^', async () => {
                    const retornoLexador = lexador.mapear(['seja x = 5 ^ 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Bit NOT ~', async () => {
                    const retornoLexador = lexador.mapear(['seja x = ~5'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Acesso a índice e atribuição por índice', () => {
                it('Acesso a índice de vetor', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja v = [10, 20, 30]',
                        'seja x = v[0]',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Atribuição por índice de vetor', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja v = [10, 20, 30]',
                        'v[0] = 99',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Declaração tente (não implementada em Tenda)', () => {
                it('tente gera erro pois não está implementado em Tenda', async () => {
                    const retornoLexador = lexador.mapear([
                        'tente {',
                        '    exiba("tentando")',
                        '}',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    // tente não está implementado no dialeto Tenda, apenas na base
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });
            });

            describe('Acesso a membros e chamada de métodos', () => {
                it('Acesso a método com ponto', async () => {
                    const retornoLexador = lexador.mapear([
                        "seja texto = 'olá mundo'",
                        'seja tam = texto.tamanho()',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Acesso a biblioteca global', async () => {
                    const retornoLexador = lexador.mapear([
                        'Saída.exibir("teste")',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Acesso a propriedade via ponto', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja saudacao = "olá"',
                        'seja x = saudacao.tamanho()',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Atribuição', () => {
                it('Atribuição simples', async () => {
                    const retornoLexador = lexador.mapear([
                        'seja x = 5',
                        'x = 10',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Atribuição a membro', async () => {
                    const retornoLexador = lexador.mapear([
                        "seja d = { 'nome': 'João' }",
                        "d.nome = 'Maria'",
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('leia', () => {
                it('Leia como expressão', async () => {
                    const retornoLexador = lexador.mapear([
                        'leia("Digite algo: ")',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Expressões com NaN e Infinito', () => {
                it('NaN é um literal válido', async () => {
                    const retornoLexador = lexador.mapear(['seja x = NaN'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracaoVar = retornoAvaliadorSintatico.declaracoes[0] as Var;
                    expect((declaracaoVar.inicializador as Literal).valor).toBeNaN();
                });
            });

            describe('Inferência de tipo', () => {
                it('Variável com inicializador chamada de primitiva de texto', async () => {
                    const retornoLexador = lexador.mapear([
                        "seja s = 'hello world'",
                        'seja partes = s.dividir(" ")',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Validação de argumentos', () => {
                it('Dois identificadores seguidos na mesma linha gera erro', async () => {
                    const retornoLexador = lexador.mapear(['seja x y'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });
            });

            describe('Comentários', () => {
                it('Comentário de linha com #', async () => {
                    const retornoLexador = lexador.mapear([
                        '# Este é um comentário',
                        'seja x = 1',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });
        });

        describe('Cenários de falha', () => {
            it('sustar fora de laço gera erro', async () => {
                const retornoLexador = lexador.mapear(['sustar'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('continua fora de laço gera erro', async () => {
                const retornoLexador = lexador.mapear(['continua'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Super usado fora de herança gera erro', async () => {
                const retornoLexador = lexador.mapear([
                    'seja f() = faça',
                    '    retorna super',
                    'fim',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Se sem então gera erro de sintaxe', async () => {
                const retornoLexador = lexador.mapear(['se verdadeiro exiba("ok")'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('Undefined retorna declarações vazias', async () => {
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(undefined as any, -1);

                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });
        });
    });
});
