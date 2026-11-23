import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Lexador } from '../../fontes/lexador';
import { InterpretadorBase } from '../../fontes/interpretador/interpretador-base';

/**
 * Testes do Interpretador Base usando o avaliador sintático de Delégua.
 * O Interpretador Base é usado diretamente por dialetos como Tenda e Calango,
 * então os caminhos aqui exercitados são os implementados na classe base,
 * e não as sobrescritas do Interpretador de Delégua.
 */
describe('Interpretador Base', () => {
    let saidas: string[];

    const executar = async (codigo: string[]) => {
        saidas = [];
        const funcaoSaida = (texto: string) => saidas.push(texto);
        const lexador = new Lexador();
        const avaliadorSintatico = new AvaliadorSintatico();
        const interpretador = new InterpretadorBase(process.cwd(), false, funcaoSaida, funcaoSaida);
        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
        const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        return retorno.erros.map(
            (erro: any) => erro.erroInterno?.message ?? erro.mensagem ?? erro.message ?? String(erro)
        );
    };

    describe('Para cada', () => {
        it('Vetor', async () => {
            const erros = await executar(['para cada item em [1, 2, 3] { escreva(item) }']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['1', '2', '3']);
        });

        it('Com continua e sustar', async () => {
            const erros = await executar([
                'para cada item em [1, 2, 3, 4] {',
                '    se item == 2 { continua }',
                '    se item == 4 { sustar }',
                '    escreva(item)',
                '}',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['1', '3']);
        });

        it('Com retorna dentro de função', async () => {
            const erros = await executar([
                'funcao f() { para cada item em [1, 2] { retorna item } }',
                'escreva(f())',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['1']);
        });
    });

    describe('Acesso por índice', () => {
        it('Tupla com índices positivos e negativos', async () => {
            const erros = await executar(['var t = (1, 2, 3)', 'escreva(t[0])', 'escreva(t[-1])']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['1', '3']);
        });

        it('Tupla com índice não inteiro', async () => {
            const erros = await executar(['var t = (1, 2, 3)', 'escreva(t[1.5])']);
            expect(erros[0]).toContain('Somente inteiros podem ser usados para indexar uma tupla.');
        });

        it('Tupla com índice fora do intervalo', async () => {
            const erros = await executar(['var t = (1, 2, 3)', 'escreva(t[9])']);
            expect(erros[0]).toContain('Índice da tupla fora de intervalo.');
        });

        it('Vetor com índice não inteiro', async () => {
            const erros = await executar(['var v = [1, 2]', 'escreva(v[1.5])']);
            expect(erros[0]).toContain('Somente inteiros podem ser usados para indexar um vetor.');
        });

        it('Vetor com índice negativo além do tamanho', async () => {
            const erros = await executar(['var v = [1, 2]', 'escreva(v[-3])']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['2']);
        });

        it('Dicionário com valor zero', async () => {
            const erros = await executar(['var d = {"a": 0}', 'escreva(d["a"])', 'd["b"] = 2', 'escreva(d)']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['0', '{"a":0,"b":2}']);
        });

        it('Texto com índice negativo', async () => {
            const erros = await executar(['var s = "abc"', 'escreva(s[-1])']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['c']);
        });

        it('Texto com índice não inteiro', async () => {
            const erros = await executar(['var s = "abc"', 'escreva(s[1.5])']);
            expect(erros[0]).toContain('Somente inteiros podem ser usados para indexar um vetor.');
        });

        it('Texto com índice fora do tamanho', async () => {
            const erros = await executar(['var s = "abc"', 'escreva(s[10])']);
            expect(erros[0]).toContain('Índice fora do tamanho.');
        });
    });

    describe('Atribuição por índice', () => {
        it('Vetor com índice negativo e índice além do tamanho', async () => {
            const erros = await executar([
                'var v = [1, 2]',
                'v[-1] = 9',
                'escreva(v)',
                'v[4] = 1',
                'escreva(v)',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['[1, 9]', '[1, 9, null, null, 1]']);
        });
    });

    describe('Propriedades', () => {
        it('Definir propriedade em número', async () => {
            const erros = await executar(['var x = 5', 'x.y = 1']);
            expect(erros[0]).toContain('Somente instâncias e dicionários podem possuir campos.');
        });

        it('Acessar propriedade inexistente em número', async () => {
            const erros = await executar(['var x = 5', 'escreva(x.y)']);
            expect(erros[0]).toContain('Método ou propriedade para objeto não encontrado: y.');
        });
    });

    describe('Escolha', () => {
        it('Caso encontrado', async () => {
            const erros = await executar([
                'escolha 2 { caso 1: escreva("um") caso 2: escreva("dois") padrao: escreva("x") }',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['dois']);
        });

        it('Caso padrão', async () => {
            const erros = await executar(['escolha 9 { caso 1: escreva("um") padrao: escreva("x") }']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['x']);
        });
    });

    describe('Se/senão', () => {
        it('Senão se verdadeiro', async () => {
            const erros = await executar([
                'se 1 > 2 { escreva("a") } senao se 2 > 1 { escreva("b") } senao { escreva("c") }',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['b']);
        });

        it('Senão final', async () => {
            const erros = await executar([
                'se 1 > 2 { escreva("a") } senao se 3 > 4 { escreva("b") } senao { escreva("c") }',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['c']);
        });
    });

    describe('Declarações', () => {
        it('Constante', async () => {
            const erros = await executar(['const x = 5', 'escreva(x)']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['5']);
        });

        it('Múltiplas constantes', async () => {
            const erros = await executar(['const a, b = 1, 2', 'escreva(a + b)']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['3']);
        });

        it('Múltiplas variáveis', async () => {
            const erros = await executar(['var a, b = 1, 2', 'escreva(a + b)']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['3']);
        });

        it('Função anônima', async () => {
            const erros = await executar(['var f = funcao(a) { retorna a * 2 }', 'escreva(f(3))']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['6']);
        });
    });

    describe('Laços', () => {
        it('Fazer... enquanto', async () => {
            const erros = await executar([
                'var i = 0',
                'fazer { i = i + 1; se i == 1 { continua }; se i == 3 { sustar } } enquanto verdadeiro',
                'escreva(i)',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['3']);
        });

        it('Para', async () => {
            const erros = await executar([
                'para (var i = 0; i < 4; i = i + 1) { se i == 1 { continua }; se i == 3 { sustar }; escreva(i) }',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['0', '2']);
        });

        it('Enquanto', async () => {
            const erros = await executar([
                'var i = 0',
                'enquanto i < 4 { i = i + 1; se i == 1 { continua }; se i == 3 { sustar } }',
                'escreva(i)',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['3']);
        });
    });

    describe('Expressões', () => {
        it('Lógicas', async () => {
            const erros = await executar(['escreva(verdadeiro e falso, verdadeiro ou falso, nulo ou 2, 1 e 0)']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['falso verdadeiro 2 0']);
        });

        it('Multiplicação de texto', async () => {
            const erros = await executar(['escreva("ab" * 2)']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['abab']);
        });

        it('Unárias e exponenciação', async () => {
            const erros = await executar(['escreva(2 ** 3, -(2), !verdadeiro, ~1)']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['8 -2 falso -2']);
        });

        it('Atribuição composta', async () => {
            const erros = await executar(['var x = 1', 'x += 2', 'escreva(x)']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['3']);
        });

        it('Tente com divisão por zero', async () => {
            const erros = await executar(['tente { var x = 1 / 0; escreva(x) } pegue { escreva("p") }']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['Infinity']);
        });
    });

    describe('paraTexto()', () => {
        it('Vetor com objetos e lógicos', async () => {
            const erros = await executar(['escreva([1, {"a": 1}, verdadeiro])']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['[1, {"a":1}, verdadeiro]']);
        });

        it('Dicionário com lógico', async () => {
            const erros = await executar(['escreva({"a": verdadeiro})']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['{"a":"verdadeiro"}']);
        });

        it('Nulo', async () => {
            const erros = await executar(['escreva(nulo)']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['nulo']);
        });
    });

    describe('Classes', () => {
        it.each([
            [
                ['classe A {', '  v: numero', '  construtor() { isto.v = 1 }', '}', 'var a = A()', 'escreva(a.v)', 'a.v = 3', 'escreva(a.v)'],
                ['1', '3'],
            ],
            [['classe A {', '  paraTexto() { retorna "objA" }', '}', 'var a = A()', 'escreva(a)'], ['objA']],
            [
                [
                    'classe A {',
                    '  x: numero',
                    '  construtor(x) { isto.x = x }',
                    '}',
                    'classe B herda A {',
                    '  construtor() { super.construtor(5) }',
                    '}',
                    'var b = B()',
                    'escreva(b.x)',
                ],
                ['5'],
            ],
            [
                ['classe A { m() { retorna 1 } }', 'classe B herda A { m() { retorna super.m() + 1 } }', 'escreva(B().m())'],
                ['2'],
            ],
            [
                [
                    'classe A { m() { retorna 1 } }',
                    'classe B herda A { m() { retorna super.m() + 1 } }',
                    'classe C herda B { m() { retorna super.m() + 10 } }',
                    'escreva(C().m())',
                ],
                ['12'],
            ],
            [['classe A { m() { retorna isto } }', 'var a = A()', 'escreva(a.m() == a)'], ['verdadeiro']],
        ])('Executa %j', async (codigo: string[], saidasEsperadas: string[]) => {
            const erros = await executar(codigo);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(saidasEsperadas);
        });
    });

    describe('Outros caminhos', () => {
        it.each([
            [['var d = {"a": 1}', 'escreva(d.a)'], ['1']],
            [['funcao f() { retorna [1, 2] }', 'escreva(f()[0])'], ['1']],
            [['funcao f() { retorna {"a": 1} }', 'escreva(f().a)'], ['1']],
            [['tente { var x = nulo; x.y } pegue (erro) { escreva("pego") }'], ['pego']],
            [['tente { escreva(1) } finalmente { escreva(2) }'], ['1', '2']],
            [['funcao f() { tente { retorna 1 } pegue { retorna 2 } }', 'escreva(f())'], ['1']],
            [['escolha 1 { caso 1: escreva(1) }', 'escolha "a" { caso "b": escreva(1) }'], ['1']],
            [
                ['var a = [1, 2, 3]', 'escreva(a em [[1, 2, 3]])', 'escreva(2 em a)', 'escreva("b" em "abc")', 'escreva("a" em {"a": 1})'],
                ['falso', 'verdadeiro', 'verdadeiro', 'verdadeiro'],
            ],
            [['var x = 3', 'x -= 1', 'x *= 3', 'x /= 2', 'x %= 2', 'escreva(x)'], ['1']],
            [['var v = [1]', 'v[0] += 2', 'escreva(v)'], ['[3]']],
        ])('Executa %j', async (codigo: string[], saidasEsperadas: string[]) => {
            const erros = await executar(codigo);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(saidasEsperadas);
        });
    });

    describe('Métodos de visita não implementados na base', () => {
        it.each([
            'visitarDeclaracaoTextoDocumentacao',
            'visitarExpressaoSeparador',
            'visitarExpressaoComentario',
            'visitarExpressaoAcessoMetodo',
            'visitarExpressaoAcessoPropriedade',
            'visitarDeclaracaoTendoComo',
            'visitarDeclaracaoInicioAlgoritmo',
            'visitarDeclaracaoCabecalhoPrograma',
            'visitarExpressaoAtribuicaoPorIndicesMatriz',
            'visitarExpressaoAcessoElementoMatriz',
            'visitarExpressaoFimPara',
        ])('%s', async (nomeMetodo: string) => {
            const interpretador: any = new InterpretadorBase(process.cwd());
            await expect(async () => await interpretador[nomeMetodo](null)).rejects.toThrow(
                'Método não implementado.'
            );
        });
    });

    describe('Métodos não implementados na base', () => {
        it('tipo de', async () => {
            const erros = await executar(['escreva(tipo de 5)']);
            expect(erros[0]).toContain('Método não implementado.');
        });

        it('Primitiva de vetor', async () => {
            const erros = await executar(['var v = [3, 1, 2]', 'escreva(v.ordenar())']);
            expect(erros[0]).toContain('Método não implementado.');
        });
    });
});
