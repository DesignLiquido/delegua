import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Lexador } from '../../fontes/lexador';
import { TradutorAssemblyX64 } from '../../fontes/tradutores/tradutor-assembly-x64';

describe('Tradutor Delégua -> Assembly x64', () => {
    let tradutorLinux: TradutorAssemblyX64;
    let tradutorWindows: TradutorAssemblyX64;
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;

    beforeEach(() => {
        tradutorLinux = new TradutorAssemblyX64();
        tradutorWindows = new TradutorAssemblyX64('windows');
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
    });

    async function traduzirLinux(linhas: string[]): Promise<string> {
        const ast = await avaliadorSintatico.analisar(lexador.mapear(linhas, -1), 1);
        return tradutorLinux.traduzir(ast.declaracoes);
    }

    async function traduzirWindows(linhas: string[]): Promise<string> {
        const ast = await avaliadorSintatico.analisar(lexador.mapear(linhas, -1), 1);
        return tradutorWindows.traduzir(ast.declaracoes);
    }

    describe('Estrutura do Código por SO', () => {
        it('Linux: entry _start', async () => {
            const asm = await traduzirLinux(['escreva("teste")']);
            expect(asm).toContain('section .text');
            expect(asm).toContain('global _start');
            expect(asm).toContain('_start:');
        });

        it('Windows: entry main', async () => {
            const asm = await traduzirWindows(['escreva("teste")']);
            expect(asm).toContain('section .text');
            expect(asm).toContain('global main');
            expect(asm).toContain('main:');
            expect(asm).not.toContain('global _start');
        });
    });

    describe('Saída do programa por SO', () => {
        it('Linux: usa syscall exit', async () => {
            const asm = await traduzirLinux(['']);
            expect(asm).toContain('mov eax, 1');
            expect(asm).toContain('int 0x80');
        });

        it('Windows: retorna de main', async () => {
            const asm = await traduzirWindows(['']);
            expect(asm).not.toContain('int 0x80');
            expect(asm).toMatch(/xor eax, eax[\s\r\n]+ret/);
        });
    });

    describe('Escreva por SO', () => {
        it('Linux: usa sys_write (int 0x80)', async () => {
            const asm = await traduzirLinux(['escreva("Oi")']);
            expect(asm).toContain('mov eax, 4');
            expect(asm).toContain('int 0x80');
            expect(asm).toContain('Oi');
        });

        it('Windows: usa chamada de biblioteca (printf)', async () => {
            const asm = await traduzirWindows(['escreva("Oi")']);
            expect(asm).not.toContain('int 0x80');
            expect(asm).toContain('extern printf');
            expect(asm).toMatch(/call\s+printf/);
            expect(asm).toContain('Oi');
        });
    });

    describe('Convenção de chamada por SO', () => {
        it('Linux: argumentos em rdi, rsi,...', async () => {
            const asm = await traduzirLinux(['funcao f(a: numero, b: numero): numero { retorna a }', 'f(1, 2)']);
            expect(asm).toContain('mov rdi, 1');
            expect(asm).toContain('mov rsi, 2');
        });

        it('Windows: argumentos em rcx, rdx,...', async () => {
            const asm = await traduzirWindows(['funcao f(a: numero, b: numero): numero { retorna a }', 'f(1, 2)']);
            expect(asm).toContain('mov rcx, 1');
            expect(asm).toContain('mov rdx, 2');
            expect(asm).not.toContain('mov rdi, 1');
        });
    });

    describe('Declarações Básicas', () => {
        it('escreva -> saída padrão', async () => {
            const resultado = await traduzirLinux(['escreva("Olá, mundo!")']);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('section .data');
            expect(resultado).toContain('section .text');
            expect(resultado).toContain('mov eax, 4');
            expect(resultado).toContain('int 0x80');
            expect(resultado).toContain('Olá, mundo!');
        });

        it('múltiplos escreva', async () => {
            const resultado = await traduzirLinux(['escreva("Linha 1")', 'escreva("Linha 2")']);
            expect(resultado).toContain('Linha 1');
            expect(resultado).toContain('Linha 2');
            const syscallMatches = resultado.match(/mov eax, 4/g);
            expect(syscallMatches?.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Variáveis', () => {
        it('declaração de variável local (não referenciada por função) não precisa de .bss', async () => {
            const resultado = await traduzirLinux(['var x: numero = 10', 'escreva(x)']);
            expect(resultado).toBeTruthy();
            expect(resultado).not.toContain('undefined');
        });

        it('declaração de constante', async () => {
            const resultado = await traduzirLinux(['const PI: numero = 3', 'escreva(PI)']);
            expect(resultado).not.toContain('undefined');
        });

        it('atribuição de variável reflete o último valor na saída', async () => {
            const resultado = await traduzirLinux(['var x: numero = 5', 'x = 10', 'escreva(x)']);
            expect(resultado).not.toContain('undefined');
            expect(resultado).toContain('mov rax, 10');
        });

        it('variável de topo referenciada por uma função vira global em .bss (g_<nome>)', async () => {
            const resultado = await traduzirLinux([
                'var contador: numero = 0',
                'funcao incrementar(): vazio {',
                '    contador = contador + 1',
                '}',
                'incrementar()',
                'escreva(contador)',
            ]);
            expect(resultado).toContain('section .bss');
            expect(resultado).toContain('g_contador');
            expect(resultado).toContain('[g_contador]');
        });
    });

    describe('Tipagem obrigatória (novo comportamento do tradutor para x64)', () => {
        it('parâmetro de função sem tipo explícito lança erro claro', async () => {
            const ast = await avaliadorSintatico.analisar(
                lexador.mapear(['funcao f(a) { retorna a }'], -1),
                1
            );
            expect(() => tradutorLinux.traduzir(ast.declaracoes)).toThrow(/tipo/i);
        });

        it('vetor sem elementos (sem tipo inferível) lança erro claro', async () => {
            const ast = await avaliadorSintatico.analisar(lexador.mapear(['var x = []'], -1), 1);
            expect(() => tradutorLinux.traduzir(ast.declaracoes)).toThrow(/tipo/i);
        });
    });

    describe('Operações Aritméticas', () => {
        it('adição', async () => {
            const resultado = await traduzirLinux(['var resultado: numero = 5 + 3', 'escreva(resultado)']);
            expect(resultado).toContain('add rax,');
        });

        it('subtração', async () => {
            const resultado = await traduzirLinux(['var resultado: numero = 10 - 3', 'escreva(resultado)']);
            expect(resultado).toContain('sub rax,');
        });

        it('multiplicação', async () => {
            const resultado = await traduzirLinux(['var resultado: numero = 4 * 5', 'escreva(resultado)']);
            expect(resultado).toContain('imul rax,');
        });

        it('divisão', async () => {
            const resultado = await traduzirLinux(['var resultado: numero = 20 / 4', 'escreva(resultado)']);
            expect(resultado).toContain('idiv');
        });

        it('módulo', async () => {
            const resultado = await traduzirLinux(['var resultado: numero = 10 % 3', 'escreva(resultado)']);
            expect(resultado).toContain('idiv');
            expect(resultado).toContain('mov rax, rdx');
        });
    });

    describe('Operações Unárias', () => {
        it('negação numérica', async () => {
            const resultado = await traduzirLinux(['var x: numero = -5', 'escreva(x)']);
            expect(resultado).toContain('neg rax');
        });

        it('negação lógica', async () => {
            const resultado = await traduzirLinux(['var x: lógico = nao verdadeiro', 'escreva(x)']);
            expect(resultado).toContain('sete al');
        });
    });

    describe('Estruturas de Controle', () => {
        it('declaração se', async () => {
            const resultado = await traduzirLinux(['se (verdadeiro) {', '    escreva("sim")', '}']);
            expect(resultado).toContain('cmp');
            expect(resultado).toContain('jne ');
            expect(resultado).toContain('jmp ');
        });

        it('declaração se-senão', async () => {
            const resultado = await traduzirLinux([
                'se (verdadeiro) {',
                '    escreva("sim")',
                '} senao {',
                '    escreva("não")',
                '}',
            ]);
            expect(resultado).toContain('sim');
            expect(resultado).toContain('não');
        });

        it('declaração se-senão-se (cadeia)', async () => {
            const resultado = await traduzirLinux([
                'var nota: numero = 7',
                'se (nota >= 9) {',
                '    escreva("A")',
                '} senao se (nota >= 7) {',
                '    escreva("B")',
                '} senao {',
                '    escreva("C")',
                '}',
            ]);
            expect(resultado).toContain('A');
            expect(resultado).toContain('B');
            expect(resultado).toContain('C');
        });

        it('laço enquanto', async () => {
            const resultado = await traduzirLinux([
                'var i: numero = 0',
                'enquanto (i < 5) {',
                '    i = i + 1',
                '}',
                'escreva(i)',
            ]);
            expect(resultado).toContain('cmp');
            expect(resultado).toContain('jne ');
            expect(resultado).toContain('jmp ');
        });

        it('laço para', async () => {
            const resultado = await traduzirLinux(['para (var i: numero = 0; i < 5; i = i + 1) {', '    escreva("loop")', '}']);
            expect(resultado).toContain('loop');
            expect(resultado).toContain('jmp ');
        });

        it('laço para com i++ e escreva de variável inteira', async () => {
            const resultado = await traduzirLinux(['para var i: numero = 1; i <= 10; i++ {', '    escreva(i)', '}']);
            expect(resultado).toContain('setle');
            expect(resultado).toContain('add ');
            expect(resultado).toContain('__delegua_print_int');
            expect(resultado).not.toContain('undefined');
        });

        it('laço fazer-enquanto', async () => {
            const resultado = await traduzirLinux(['fazer {', '    escreva("executando")', '} enquanto (falso)']);
            expect(resultado).toContain('executando');
            expect(resultado).toContain('jne ');
        });
    });

    describe('Operações Lógicas', () => {
        it('operador E lógico', async () => {
            const resultado = await traduzirLinux(['var resultado: lógico = verdadeiro e falso', 'escreva(resultado)']);
            expect(resultado).toContain('cmp');
            expect(resultado).not.toContain('undefined');
        });

        it('operador OU lógico', async () => {
            const resultado = await traduzirLinux(['var resultado: lógico = verdadeiro ou falso', 'escreva(resultado)']);
            expect(resultado).toContain('cmp');
            expect(resultado).not.toContain('undefined');
        });
    });

    describe('Funções', () => {
        it('declaração de função', async () => {
            const resultado = await traduzirLinux(['funcao somar(a: numero, b: numero): numero {', '    retorna a + b', '}']);
            expect(resultado).toContain('somar:');
            expect(resultado).toContain('push rbp');
            expect(resultado).toContain('mov rbp, rsp');
            expect(resultado).toContain('pop rbp');
            expect(resultado).toContain('ret');
        });

        it('retorno de função', async () => {
            const resultado = await traduzirLinux(['funcao obterNumero(): numero {', '    retorna 42', '}', 'obterNumero()']);
            expect(resultado).toContain('mov rax, 42');
            expect(resultado).toContain('ret');
        });

        it('chamada de função com argumento e uso do retorno em escreva', async () => {
            const resultado = await traduzirLinux(['funcao dobro(n: numero): numero {', '    retorna n * 2', '}', 'escreva(dobro(21))']);
            expect(resultado).toContain('dobro:');
            expect(resultado).toContain('call dobro');
        });
    });

    describe('Vetores', () => {
        it('criação de vetor', async () => {
            const resultado = await traduzirLinux(['var numeros: numero[] = [1, 2, 3, 4, 5]', 'escreva(numeros[0])']);
            expect(resultado).not.toContain('undefined');
        });
    });

    describe('Estrutura do Código Assembly', () => {
        it('deve conter todas as seções necessárias', async () => {
            const resultado = await traduzirLinux(['escreva("teste")']);
            expect(resultado).toContain('section .bss');
            expect(resultado).toContain('section .data');
            expect(resultado).toContain('section .text');
            expect(resultado).toContain('global _start');
            expect(resultado).toContain('_start:');
        });

        it('deve ter syscall de saída', async () => {
            const resultado = await traduzirLinux(['escreva("teste")']);
            expect(resultado).toContain('mov eax, 1');
            expect(resultado).toContain('int 0x80');
        });
    });

    describe('Casos Complexos', () => {
        it('programa completo com variáveis e operações', async () => {
            const resultado = await traduzirLinux([
                'var x: numero = 10',
                'var y: numero = 20',
                'var soma: numero = x + y',
                'escreva(soma)',
                'escreva("Resultado")',
            ]);
            expect(resultado).toContain('add rax,');
            expect(resultado).toContain('Resultado');
            expect(resultado).not.toContain('undefined');
        });

        it('estrutura condicional com operações', async () => {
            const resultado = await traduzirLinux([
                'var idade: numero = 18',
                'se (idade >= 18) {',
                '    escreva("Maior de idade")',
                '} senao {',
                '    escreva("Menor de idade")',
                '}',
            ]);
            expect(resultado).toContain('cmp');
            expect(resultado).toContain('Maior de idade');
            expect(resultado).toContain('Menor de idade');
        });

        it('laço com contador', async () => {
            const resultado = await traduzirLinux([
                'var contador: numero = 0',
                'enquanto (contador < 3) {',
                '    escreva("Contando")',
                '    contador = contador + 1',
                '}',
            ]);
            expect(resultado).toContain('Contando');
            expect(resultado).toContain('add rax,');
        });
    });

    describe('Edge Cases', () => {
        it('programa vazio não deve quebrar', async () => {
            const resultado = await traduzirLinux([]);
            expect(resultado).toContain('section .text');
            expect(resultado).toContain('_start:');
        });

        it('múltiplas variáveis com mesmo nome em escopo (sobrescrita)', async () => {
            const resultado = await traduzirLinux(['var x: numero = 1', 'x = 2', 'x = 3', 'escreva(x)']);
            expect(resultado).not.toContain('undefined');
            expect(resultado).toContain('mov rax, 3');
        });

        it('strings vazias', async () => {
            const resultado = await traduzirLinux(['escreva("")']);
            expect(resultado).toContain('str_0');
            expect(resultado).toContain("db '', 0");
        });
    });

    describe('Geração de rótulos', () => {
        it('deve gerar rótulos de bloco únicos', async () => {
            const resultado = await traduzirLinux(['se (verdadeiro) { escreva("1") }', 'se (verdadeiro) { escreva("2") }']);
            const rotulos = resultado.match(/^principal_bloco_\d+:/gm) ?? [];
            const unicos = new Set(rotulos);
            expect(rotulos.length).toBe(unicos.size);
        });
    });

    describe('Regressão issue #1400', () => {
        it('fibonacci recursivo: parâmetro capturado, sem símbolos indefinidos, função aparece uma única vez', async () => {
            const resultado = await traduzirLinux([
                'funcao fibonacci(n: numero): numero {',
                '    se (n <= 1) {',
                '        retorna n',
                '    }',
                '    retorna fibonacci(n - 2) + fibonacci(n - 1)',
                '}',
                'escreva(fibonacci(10))',
            ]);

            expect(resultado).not.toContain('undefined');
            expect(resultado).not.toMatch(/,\s*n\b/); // 'n' nunca é usado como símbolo bruto (só via alocação)
            const ocorrenciasRotulo = resultado.match(/^fibonacci:/gm) ?? [];
            expect(ocorrenciasRotulo.length).toBe(1);
            // 2 chamadas recursivas dentro do corpo + 1 chamada de `escreva(fibonacci(10))` no topo.
            expect(resultado.match(/call fibonacci/g)?.length).toBe(3);
        });

        it('vetor tipado: leitura por índice usa endereço resolvido (pilha), não o nome cru da variável', async () => {
            const resultado = await traduzirLinux(['var x: numero[] = [10, 20]', 'escreva(x[1])']);

            expect(resultado).not.toContain('undefined');
            // 'x' é local a 'principal' (não referenciado por nenhuma função) — vai para a
            // pilha do frame, não para .bss/.data como símbolo 'x' bruto (bug relatado na
            // issue: `mov rax, [x + 1 * 8]` referenciando um símbolo 'x' nunca definido).
            expect(resultado).not.toMatch(/\[x\s*\+/);
            expect(resultado).not.toMatch(/,\s*x\b/);
            expect(resultado).toMatch(/\[rbp-?\d+\]/);
        });

        it('vetor de topo referenciado por uma função vira global em .bss (g_<nome>)', async () => {
            const resultado = await traduzirLinux([
                'var x: numero[] = [10, 20]',
                'funcao primeiro(): numero {',
                '    retorna x[0]',
                '}',
                'escreva(primeiro())',
            ]);

            expect(resultado).not.toContain('undefined');
            expect(resultado).toContain('g_x');
            expect(resultado).toContain('section .bss');
        });
    });
});
