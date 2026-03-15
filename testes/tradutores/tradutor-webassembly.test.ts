import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Lexador } from '../../fontes/lexador';
import { TradutorWebAssembly } from '../../fontes/tradutores/tradutor-webassembly';

describe('Tradutor Delégua -> WebAssembly', () => {
    let tradutor: TradutorWebAssembly;
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;

    beforeEach(() => {
        tradutor = new TradutorWebAssembly();
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
    });

    // =========================================================================
    // Estrutura do módulo
    // =========================================================================

    describe('Estrutura do módulo', () => {
        it('programa vazio gera módulo WAT válido', async () => {
            const retornoLexador = lexador.mapear([], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(module');
            expect(wat).toMatch(/\)$/);
        });

        it('sempre contém declaração de memória', async () => {
            const retornoLexador = lexador.mapear([], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(memory');
            expect(wat).toContain('(export "memory")');
        });

        it('sempre contém imports das funções host', async () => {
            const retornoLexador = lexador.mapear([], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(import "delegua" "escreva_texto"');
            expect(wat).toContain('(import "delegua" "escreva_inteiro"');
        });

        it('sempre exporta $principal', async () => {
            const retornoLexador = lexador.mapear([], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(export "principal")');
            expect(wat).toContain('$principal');
        });

        it('$principal não é duplicado quando usuário declara funcao principal()', async () => {
            const retornoLexador = lexador.mapear([
                'funcao principal() {',
                '    escreva("oi")',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            const ocorrencias = (wat.match(/\(export "principal"\)/g) ?? []).length;
            expect(ocorrencias).toBe(1);
        });
    });

    // =========================================================================
    // Literais
    // =========================================================================

    describe('Literais', () => {
        it('número inteiro → i64.const', async () => {
            const retornoLexador = lexador.mapear(['var x = 42'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(i64.const 42)');
        });

        it('verdadeiro → i64.const 1', async () => {
            const retornoLexador = lexador.mapear(['var x = verdadeiro'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(i64.const 1)');
        });

        it('falso → i64.const 0', async () => {
            const retornoLexador = lexador.mapear(['var x = falso'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(i64.const 0)');
        });

        it('string literal → segmento (data ...) na memória linear', async () => {
            const retornoLexador = lexador.mapear(['escreva("Olá")'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(data (i32.const 0) "Olá")');
        });

        it('duas strings distintas recebem offsets consecutivos', async () => {
            const retornoLexador = lexador.mapear([
                'escreva("AB")',
                'escreva("CD")',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(data (i32.const 0) "AB")');
            expect(wat).toContain('(data (i32.const 2) "CD")');
        });

        it('string duplicada é deduplicada (mesmo offset)', async () => {
            const retornoLexador = lexador.mapear([
                'escreva("oi")',
                'escreva("oi")',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            const ocorrencias = (wat.match(/\(data \(i32\.const 0\) "oi"\)/g) ?? []).length;
            expect(ocorrencias).toBe(1);
        });
    });

    // =========================================================================
    // Escreva
    // =========================================================================

    describe('Escreva', () => {
        it('escreva("texto") chama $__escreva_texto com offset e len', async () => {
            const retornoLexador = lexador.mapear(['escreva("oi")'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(call $__escreva_texto (i32.const 0) (i32.const 2))');
        });

        it('escreva(variável numérica) chama $__escreva_inteiro', async () => {
            const retornoLexador = lexador.mapear([
                'var n = 10',
                'escreva(n)',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(call $__escreva_inteiro');
        });

        it('múltiplos escreva geram múltiplas chamadas', async () => {
            const retornoLexador = lexador.mapear([
                'escreva("a")',
                'escreva("b")',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            const chamadas = (wat.match(/call \$__escreva_texto/g) ?? []).length;
            expect(chamadas).toBe(2);
        });
    });

    // =========================================================================
    // Variáveis
    // =========================================================================

    describe('Variáveis', () => {
        it('var no nível superior → global mutável', async () => {
            const retornoLexador = lexador.mapear(['var x = 5'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(global $x (mut i64)');
        });

        it('const no nível superior → global imutável', async () => {
            const retornoLexador = lexador.mapear(['const PI = 3'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(global $PI i64');
            expect(wat).not.toContain('(global $PI (mut');
        });

        it('var dentro de função → local', async () => {
            const retornoLexador = lexador.mapear([
                'funcao f() {',
                '    var y = 7',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(local $y i64)');
            expect(wat).toContain('(local.set $y');
        });

        it('atribuição de variável global → global.set', async () => {
            const retornoLexador = lexador.mapear([
                'var x = 1',
                'x = 2',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(global.set $x');
        });
    });

    // =========================================================================
    // Operações aritméticas
    // =========================================================================

    describe('Operações aritméticas', () => {
        it('adição → i64.add', async () => {
            const retornoLexador = lexador.mapear(['var r = 2 + 3'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.add');
        });

        it('subtração → i64.sub', async () => {
            const retornoLexador = lexador.mapear(['var r = 5 - 2'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.sub');
        });

        it('multiplicação → i64.mul', async () => {
            const retornoLexador = lexador.mapear(['var r = 3 * 4'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.mul');
        });

        it('divisão → i64.div_s', async () => {
            const retornoLexador = lexador.mapear(['var r = 10 / 2'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.div_s');
        });

        it('módulo → i64.rem_s', async () => {
            const retornoLexador = lexador.mapear(['var r = 10 % 3'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.rem_s');
        });
    });

    // =========================================================================
    // Comparações
    // =========================================================================

    describe('Comparações', () => {
        it('< → i64.lt_s com extend', async () => {
            const retornoLexador = lexador.mapear(['var r = 1 < 2'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.lt_s');
            expect(wat).toContain('i64.extend_i32_s');
        });

        it('>= → i64.ge_s com extend', async () => {
            const retornoLexador = lexador.mapear(['var r = 5 >= 3'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.ge_s');
            expect(wat).toContain('i64.extend_i32_s');
        });

        it('== → i64.eq com extend', async () => {
            const retornoLexador = lexador.mapear(['var r = 2 == 2'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.eq');
            expect(wat).toContain('i64.extend_i32_s');
        });

        it('!= → i64.ne com extend', async () => {
            const retornoLexador = lexador.mapear(['var r = 1 != 2'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.ne');
            expect(wat).toContain('i64.extend_i32_s');
        });
    });

    // =========================================================================
    // Operações lógicas
    // =========================================================================

    describe('Operações lógicas', () => {
        it('e → i32.and com wrap', async () => {
            const retornoLexador = lexador.mapear(['var r = verdadeiro e falso'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i32.and');
            expect(wat).toContain('i32.wrap_i64');
        });

        it('ou → i32.or com wrap', async () => {
            const retornoLexador = lexador.mapear(['var r = verdadeiro ou falso'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i32.or');
            expect(wat).toContain('i32.wrap_i64');
        });
    });

    // =========================================================================
    // Operações unárias
    // =========================================================================

    describe('Operações unárias', () => {
        it('negação numérica → i64.sub (i64.const 0)', async () => {
            const retornoLexador = lexador.mapear(['var x = -5'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(i64.sub (i64.const 0)');
        });

        it('nao → i64.eqz + extend', async () => {
            const retornoLexador = lexador.mapear(['var x = nao verdadeiro'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.eqz');
            expect(wat).toContain('i64.extend_i32_s');
        });
    });

    // =========================================================================
    // Estruturas de controle
    // =========================================================================

    describe('Estruturas de controle', () => {
        it('se → (if (then ...))', async () => {
            const retornoLexador = lexador.mapear([
                'se (verdadeiro) {',
                '    escreva("sim")',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(if');
            expect(wat).toContain('(then');
            expect(wat).toContain('i32.wrap_i64');
        });

        it('se/senao → (if (then ...) (else ...))', async () => {
            const retornoLexador = lexador.mapear([
                'se (verdadeiro) {',
                '    escreva("sim")',
                '} senao {',
                '    escreva("nao")',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(else');
            expect(wat).toContain('sim');
            expect(wat).toContain('nao');
        });

        it('enquanto → (block (loop ... br_if ... br))', async () => {
            const retornoLexador = lexador.mapear([
                'var i = 0',
                'enquanto (i < 5) {',
                '    i = i + 1',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(block $L');
            expect(wat).toContain('(loop $L');
            expect(wat).toContain('br_if');
            expect(wat).toContain('i32.eqz');
        });

        it('para → inicializador + (block (loop ...))', async () => {
            const retornoLexador = lexador.mapear([
                'para (var i = 0; i < 3; i = i + 1) {',
                '    escreva("loop")',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(block $L');
            expect(wat).toContain('(loop $L');
            expect(wat).toContain('br_if');
            expect(wat).toContain('loop');
        });

        it('fazer-enquanto → (block (loop ... br_if laco))', async () => {
            const retornoLexador = lexador.mapear([
                'fazer {',
                '    escreva("x")',
                '} enquanto (falso)',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(block $L');
            expect(wat).toContain('(loop $L');
            expect(wat).toContain('br_if');
        });

        it('sustar → (br $labelSaida)', async () => {
            const retornoLexador = lexador.mapear([
                'enquanto (verdadeiro) {',
                '    sustar',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toMatch(/\(br \$L\d+\)/);
        });

        it('continua → (br $labelLaco)', async () => {
            const retornoLexador = lexador.mapear([
                'enquanto (verdadeiro) {',
                '    continua',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            // Dois brs: continua + o br implícito ao final do loop
            const brs = (wat.match(/\(br \$L\d+\)/g) ?? []).length;
            expect(brs).toBeGreaterThanOrEqual(1);
        });

        it('escolha → cadeia de if/else aninhados', async () => {
            const retornoLexador = lexador.mapear([
                'var x = 2',
                'escolha (x) {',
                '    caso 1:',
                '        escreva("um")',
                '    caso 2:',
                '        escreva("dois")',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.eq');
            expect(wat).toContain('(if');
            expect(wat).toContain('(then');
        });
    });

    // =========================================================================
    // Funções
    // =========================================================================

    describe('Funções', () => {
        it('declaração de função → (func $nome (result i64) ...)', async () => {
            const retornoLexador = lexador.mapear([
                'funcao somar(a, b) {',
                '    retorna a + b',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(func $somar');
            expect(wat).toContain('(result i64)');
        });

        it('parâmetros → (param $a i64)', async () => {
            const retornoLexador = lexador.mapear([
                'funcao f(a, b) {',
                '    retorna a',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(param $a i64)');
            expect(wat).toContain('(param $b i64)');
        });

        it('retorna → (return EXPR)', async () => {
            const retornoLexador = lexador.mapear([
                'funcao obter() {',
                '    retorna 42',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(return (i64.const 42))');
        });

        it('chamada de função → (call $nome ARGS)', async () => {
            const retornoLexador = lexador.mapear([
                'funcao dobrar(x) { retorna x * 2 }',
                'dobrar(5)',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(call $dobrar');
        });

        it('funcao principal() é exportada como "principal"', async () => {
            const retornoLexador = lexador.mapear([
                'funcao principal() {',
                '    escreva("oi")',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(func $principal (export "principal")');
        });
    });

    // =========================================================================
    // Vetores
    // =========================================================================

    describe('Vetores', () => {
        it('vetor → stores i64 na memória linear', async () => {
            const retornoLexador = lexador.mapear([
                'var nums = [1, 2, 3]',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.store');
            expect(wat).toContain('(i32.const 0)');
        });

        it('acesso por índice → i64.load', async () => {
            const retornoLexador = lexador.mapear([
                'var nums = [10, 20, 30]',
                'var x = nums[1]',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.load');
        });
    });

    // =========================================================================
    // Geração de rótulos únicos
    // =========================================================================

    describe('Geração de rótulos', () => {
        it('dois laços enquanto geram números de rótulo $L distintos', async () => {
            const retornoLexador = lexador.mapear([
                'var i = 0',
                'enquanto (i < 1) { i = i + 1 }',
                'enquanto (i < 2) { i = i + 1 }',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            // Cada laço usa 2 rótulos (block + loop). Dois laços → pelo menos 4 rótulos distintos.
            const numerosRotulos = new Set([...wat.matchAll(/\$L(\d+)/g)].map((m) => m[1]));
            expect(numerosRotulos.size).toBeGreaterThanOrEqual(4);
        });
    });

    // =========================================================================
    // Arquivo host JS
    // =========================================================================

    describe('gerarArquivoHost()', () => {
        it('contém import de WebAssembly', () => {
            const host = tradutor.gerarArquivoHost();
            expect(host).toContain('WebAssembly');
        });

        it('referencia exports.principal()', () => {
            const host = tradutor.gerarArquivoHost();
            expect(host).toContain('exports.principal()');
        });

        it('define escreva_texto e escreva_inteiro', () => {
            const host = tradutor.gerarArquivoHost();
            expect(host).toContain('escreva_texto');
            expect(host).toContain('escreva_inteiro');
        });
    });

    // =========================================================================
    // Casos complexos
    // =========================================================================

    describe('Casos complexos', () => {
        it('programa completo: variáveis, aritmética e escreva', async () => {
            const retornoLexador = lexador.mapear([
                'var x = 10',
                'var y = 20',
                'var soma = x + y',
                'escreva("Resultado")',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('$x');
            expect(wat).toContain('$y');
            expect(wat).toContain('$soma');
            expect(wat).toContain('i64.add');
            expect(wat).toContain('Resultado');
        });

        it('condicional com comparação', async () => {
            const retornoLexador = lexador.mapear([
                'var idade = 18',
                'se (idade >= 18) {',
                '    escreva("maior")',
                '} senao {',
                '    escreva("menor")',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('$idade');
            expect(wat).toContain('i64.ge_s');
            expect(wat).toContain('maior');
            expect(wat).toContain('menor');
        });

        it('laço com contador e escreva de variável', async () => {
            const retornoLexador = lexador.mapear([
                'var contador = 0',
                'enquanto (contador < 3) {',
                '    escreva(contador)',
                '    contador = contador + 1',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('$contador');
            expect(wat).toContain('i64.lt_s');
            expect(wat).toContain('(call $__escreva_inteiro');
            expect(wat).toContain('i64.add');
        });

        it('para com i++', async () => {
            const retornoLexador = lexador.mapear([
                'para var i = 1; i <= 10; i++ {',
                '    escreva(i)',
                '}',
            ], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('$i');
            expect(wat).toContain('i64.le_s');
            expect(wat).toContain('(call $__escreva_inteiro');
        });
    });

    // =========================================================================
    // Edge cases
    // =========================================================================

    describe('Edge cases', () => {
        it('programa vazio não quebra', async () => {
            const retornoLexador = lexador.mapear([], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);

            expect(() => tradutor.traduzir(ast.declaracoes)).not.toThrow();
        });

        it('string vazia gera data segment com len 0', async () => {
            const retornoLexador = lexador.mapear(['escreva("")'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('(call $__escreva_texto (i32.const 0) (i32.const 0))');
        });

        it('negação lógica com !', async () => {
            const retornoLexador = lexador.mapear(['var x = !verdadeiro'], -1);
            const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
            const wat = tradutor.traduzir(ast.declaracoes);

            expect(wat).toContain('i64.eqz');
        });
    });
});
