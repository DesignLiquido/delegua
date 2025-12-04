import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import { Lexador } from "../../fontes/lexador";
import { TradutorAssemblyX64 } from '../../fontes/tradutores/tradutor-assembly-x64';

describe('Tradutor Delégua -> Assembly x64', () => {
    let tradutor: TradutorAssemblyX64;
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;

    beforeEach(() => {
        tradutor = new TradutorAssemblyX64();
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
    });

    describe('Declarações Básicas', () => {
        it('escreva -> saída padrão', () => {
            const retornoLexador = lexador.mapear([
                'escreva("Olá, mundo!")',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain('section .data');
            expect(resultado).toContain('section .text');
            expect(resultado).toContain('mov eax, 4'); // syscall write
            expect(resultado).toContain('int 0x80');
            expect(resultado).toContain('Olá, mundo!');
        });

        it('múltiplos escreva', () => {
            const retornoLexador = lexador.mapear([
                'escreva("Linha 1")',
                'escreva("Linha 2")',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('Linha 1');
            expect(resultado).toContain('Linha 2');
            const syscallMatches = resultado.match(/mov eax, 4/g);
            expect(syscallMatches?.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Variáveis', () => {
        it('declaração de variável', () => {
            const retornoLexador = lexador.mapear([
                'var x = 10',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('section .bss');
            expect(resultado).toContain('var_x');
            expect(resultado).toContain('resq 1');
            expect(resultado).toContain('mov rax, 10');
        });

        it('declaração de constante', () => {
            const retornoLexador = lexador.mapear([
                'const PI = 3',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('section .data');
            expect(resultado).toContain('const_PI');
            expect(resultado).toContain('dq 3');
        });

        it('atribuição de variável', () => {
            const retornoLexador = lexador.mapear([
                'var x = 5',
                'x = 10',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('var_x');
            expect(resultado).toContain('mov rax, 10');
            const movMatches = resultado.match(/mov \[var_x\], rax/g);
            expect(movMatches?.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Operações Aritméticas', () => {
        it('adição', () => {
            const retornoLexador = lexador.mapear([
                'var resultado = 5 + 3',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('add rax,');
        });

        it('subtração', () => {
            const retornoLexador = lexador.mapear([
                'var resultado = 10 - 3',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('sub rax,');
        });

        it('multiplicação', () => {
            const retornoLexador = lexador.mapear([
                'var resultado = 4 * 5',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('imul rax,');
        });

        it('divisão', () => {
            const retornoLexador = lexador.mapear([
                'var resultado = 20 / 4',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('idiv');
        });

        it('módulo', () => {
            const retornoLexador = lexador.mapear([
                'var resultado = 10 % 3',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('idiv');
            expect(resultado).toContain('mov rax, rdx');
        });
    });

    describe('Operações Unárias', () => {
        it('negação numérica', () => {
            const retornoLexador = lexador.mapear([
                'var x = -5',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('neg rax');
        });

        it('negação lógica', () => {
            const retornoLexador = lexador.mapear([
                'var x = nao verdadeiro',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('sete al');
        });
    });

    describe('Estruturas de Controle', () => {
        it('declaração se', () => {
            const retornoLexador = lexador.mapear([
                'se (verdadeiro) {',
                '    escreva("sim")',
                '}',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('cmp');
            expect(resultado).toContain('je L');
            expect(resultado).toContain('jmp L');
        });

        it('declaração se-senão', () => {
            const retornoLexador = lexador.mapear([
                'se (verdadeiro) {',
                '    escreva("sim")',
                '} senao {',
                '    escreva("não")',
                '}',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('sim');
            expect(resultado).toContain('não');
            const labelMatches = resultado.match(/L\d+:/g);
            expect(labelMatches?.length).toBeGreaterThanOrEqual(2);
        });

        it('laço enquanto', () => {
            const retornoLexador = lexador.mapear([
                'var i = 0',
                'enquanto (i < 5) {',
                '    i = i + 1',
                '}',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('L');
            expect(resultado).toContain('cmp');
            expect(resultado).toContain('je L');
            expect(resultado).toContain('jmp L');
        });

        it('laço para', () => {
            const retornoLexador = lexador.mapear([
                'para (var i = 0; i < 5; i = i + 1) {',
                '    escreva("loop")',
                '}',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('var_i');
            expect(resultado).toContain('L');
            expect(resultado).toContain('jmp L');
        });

        it('laço fazer-enquanto', () => {
            const retornoLexador = lexador.mapear([
                'fazer {',
                '    escreva("executando")',
                '} enquanto (falso)',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('L');
            expect(resultado).toContain('cmp');
            expect(resultado).toContain('jne L');
        });
    });

    describe('Operações Lógicas', () => {
        it('operador E lógico', () => {
            const retornoLexador = lexador.mapear([
                'var resultado = verdadeiro e falso',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('cmp rax, 0');
            expect(resultado).toContain('je L');
        });

        it('operador OU lógico', () => {
            const retornoLexador = lexador.mapear([
                'var resultado = verdadeiro ou falso',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('cmp rax, 0');
            expect(resultado).toContain('jne L');
        });
    });

    describe('Funções', () => {
        it('declaração de função', () => {
            const retornoLexador = lexador.mapear([
                'funcao somar(a, b) {',
                '    retorna a + b',
                '}',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('somar:');
            expect(resultado).toContain('push rbp');
            expect(resultado).toContain('mov rbp, rsp');
            expect(resultado).toContain('pop rbp');
            expect(resultado).toContain('ret');
        });

        it('retorno de função', () => {
            const retornoLexador = lexador.mapear([
                'funcao obterNumero() {',
                '    retorna 42',
                '}',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('mov rax, 42');
            expect(resultado).toContain('ret');
        });
    });

    describe('Vetores', () => {
        it('criação de vetor', () => {
            const retornoLexador = lexador.mapear([
                'var numeros = [1, 2, 3, 4, 5]',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('vetor_');
            expect(resultado).toContain('resq');
        });
    });

    describe('Estrutura do Código Assembly', () => {
        it('deve conter todas as seções necessárias', () => {
            const retornoLexador = lexador.mapear([
                'escreva("teste")',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('section .bss');
            expect(resultado).toContain('section .data');
            expect(resultado).toContain('section .text');
            expect(resultado).toContain('global _start');
            expect(resultado).toContain('_start:');
        });

        it('deve ter syscall de saída', () => {
            const retornoLexador = lexador.mapear([
                'escreva("teste")',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('mov eax, 1');
            expect(resultado).toMatch(/int 0x80\s*$/m); // syscall exit no final
        });
    });

    describe('Casos Complexos', () => {
        it('programa completo com variáveis e operações', () => {
            const retornoLexador = lexador.mapear([
                'var x = 10',
                'var y = 20',
                'var soma = x + y',
                'escreva("Resultado")',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('var_x');
            expect(resultado).toContain('var_y');
            expect(resultado).toContain('var_soma');
            expect(resultado).toContain('add rax,');
            expect(resultado).toContain('Resultado');
        });

        it('estrutura condicional com operações', () => {
            const retornoLexador = lexador.mapear([
                'var idade = 18',
                'se (idade >= 18) {',
                '    escreva("Maior de idade")',
                '} senao {',
                '    escreva("Menor de idade")',
                '}',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('var_idade');
            expect(resultado).toContain('cmp');
            expect(resultado).toContain('Maior de idade');
            expect(resultado).toContain('Menor de idade');
        });

        it('laço com contador', () => {
            const retornoLexador = lexador.mapear([
                'var contador = 0',
                'enquanto (contador < 3) {',
                '    escreva("Contando")',
                '    contador = contador + 1',
                '}',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('var_contador');
            expect(resultado).toContain('Contando');
            expect(resultado).toContain('add rax,');
            const labelMatches = resultado.match(/L\d+:/g);
            expect(labelMatches?.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Edge Cases', () => {
        it('programa vazio não deve quebrar', () => {
            const retornoLexador = lexador.mapear([], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('section .text');
            expect(resultado).toContain('_start:');
        });

        it('múltiplas variáveis com mesmo nome em escopo (sobrescrita)', () => {
            const retornoLexador = lexador.mapear([
                'var x = 1',
                'x = 2',
                'x = 3',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('var_x');
            const movMatches = resultado.match(/mov \[var_x\], rax/g);
            expect(movMatches?.length).toBeGreaterThanOrEqual(2);
        });

        it('strings vazias', () => {
            const retornoLexador = lexador.mapear([
                'escreva("")',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toContain('Delegua_');
            expect(resultado).toContain("db '', 0");
        });
    });

    describe('Geração de Labels', () => {
        it('deve gerar labels únicos', () => {
            const retornoLexador = lexador.mapear([
                'se (verdadeiro) { escreva("1") }',
                'se (verdadeiro) { escreva("2") }',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            const labelMatches = resultado.match(/L\d+:/g);
            const uniqueLabels = new Set(labelMatches);
            expect(labelMatches?.length).toBe(uniqueLabels.size); // Todos os labels devem ser únicos
        });
    });
});