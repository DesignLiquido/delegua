import {
    Agrupamento,
    Atribuir,
    Binario,
    FuncaoConstruto,
    Literal,
    Logico,
    Unario,
    Variavel,
    Vetor,
} from '../../fontes/construtos';
import {
    Bloco,
    Const,
    Declaracao,
    Enquanto,
    Escreva,
    Expressao,
    FuncaoDeclaracao,
    Para,
    Retorna,
    Se,
    Var,
} from '../../fontes/declaracoes';
import { SimboloInterface } from '../../fontes/interfaces';
import { Simbolo } from '../../fontes/lexador';
import { TradutorAssemblyRISCV } from '../../fontes/tradutores';

describe('Tradutor (Assembly RISC-V)', () => {
    let tradutor: TradutorAssemblyRISCV;

    beforeEach(() => {
        tradutor = new TradutorAssemblyRISCV('linux-rv64');
    });

    describe('Construtor', () => {
        it('deve inicializar com plataforma linux-rv64', () => {
            expect(tradutor.alvo).toBe('linux-rv64');
            expect(tradutor.text).toContain('.text');
            expect(tradutor.text).toContain('_start:');
        });

        it('deve inicializar com plataforma linux-rv32', () => {
            const tradutorRV32 = new TradutorAssemblyRISCV('linux-rv32');
            expect(tradutorRV32.alvo).toBe('linux-rv32');
        });

        it('deve inicializar registradores disponíveis', () => {
            expect(tradutor.registradoresDisponiveis).toContain('s2');
            expect(tradutor.registradoresDisponiveis).toContain('s9');
            expect(tradutor.registradoresDisponiveis.length).toBe(8);
        });
    });

    describe('Utilitários', () => {
        it('deve gerar dígito aleatório com 5 caracteres', () => {
            const digito = tradutor.gerarDigitoAleatorio();
            expect(digito).toHaveLength(5);
            expect(digito).toMatch(/^\d{5}$/);
        });

        it('deve gerar labels únicos com prefixo .L', () => {
            const label1 = tradutor.gerarLabel();
            const label2 = tradutor.gerarLabel();
            expect(label1).toBe('.L0');
            expect(label2).toBe('.L1');
            expect(label1).not.toBe(label2);
        });

        it('deve obter e liberar registradores', () => {
            const reg1 = tradutor.obterRegistrador();
            expect(reg1).toBe('s9'); // último da lista
            expect(tradutor.registradoresDisponiveis).not.toContain('s9');

            tradutor.liberarRegistrador(reg1);
            expect(tradutor.registradoresDisponiveis).toContain('s9');
        });

        it('deve retornar a0 quando não há registradores disponíveis', () => {
            while (tradutor.registradoresDisponiveis.length > 0) {
                tradutor.obterRegistrador();
            }
            const reg = tradutor.obterRegistrador();
            expect(reg).toBe('a0');
        });
    });

    describe('Construtos - Literais', () => {
        it('deve traduzir literal numérico', () => {
            const literal = new Literal(-1, 1, 42);
            const resultado = tradutor.traduzirConstrutoLiteral(literal);
            expect(resultado).toBe('42');
        });

        it('deve traduzir literal string', () => {
            const literal = new Literal(-1, 1, 'Olá Mundo');
            const resultado = tradutor.traduzirConstrutoLiteral(literal);
            expect(resultado).toMatch(/^Delegua_\d{5}$/);
            expect(tradutor.data).toContain('"Olá Mundo"');
        });

        it('deve traduzir literal booleano', () => {
            const literalTrue = new Literal(-1, 1, true);
            const literalFalse = new Literal(-1, 1, false);
            expect(tradutor.traduzirConstrutoLiteral(literalTrue)).toBe('true');
            expect(tradutor.traduzirConstrutoLiteral(literalFalse)).toBe('false');
        });
    });

    describe('Construtos - Operações Binárias', () => {
        it('deve traduzir adição', () => {
            const esquerda = new Literal(-1, 1, 5);
            const direita = new Literal(-1, 1, 3);
            const simbolo = new Simbolo('+', '+', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            const resultado = tradutor.traduzirConstrutoBinario(binario);

            expect(resultado).toBe('a0');
            expect(tradutor.text).toContain('add a0, a0,');
        });

        it('deve traduzir subtração', () => {
            const esquerda = new Literal(-1, 1, 10);
            const direita = new Literal(-1, 1, 4);
            const simbolo = new Simbolo('-', '-', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('sub a0, a0,');
        });

        it('deve traduzir multiplicação', () => {
            const esquerda = new Literal(-1, 1, 6);
            const direita = new Literal(-1, 1, 7);
            const simbolo = new Simbolo('*', '*', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('mul a0, a0,');
        });

        it('deve traduzir divisão', () => {
            const esquerda = new Literal(-1, 1, 20);
            const direita = new Literal(-1, 1, 5);
            const simbolo = new Simbolo('/', '/', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('div a0, a0,');
        });

        it('deve traduzir módulo com instrução rem (extensão M)', () => {
            const esquerda = new Literal(-1, 1, 10);
            const direita = new Literal(-1, 1, 3);
            const simbolo = new Simbolo('%', '%', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoBinario(binario);
            // RISC-V tem instrução `rem` nativa — sem sdiv+mul+sub como no ARM
            expect(tradutor.text).toContain('rem a0, a0,');
        });

        it('deve traduzir comparação menor que com slt', () => {
            const esquerda = new Literal(-1, 1, 5);
            const direita = new Literal(-1, 1, 10);
            const simbolo = new Simbolo('<', '<', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoBinario(binario);
            // slt a0, a0, reg: a0 = 1 se a0 < reg
            expect(tradutor.text).toContain('slt a0, a0, s9');
        });

        it('deve traduzir comparação maior que com slt e operandos trocados', () => {
            const esquerda = new Literal(-1, 1, 10);
            const direita = new Literal(-1, 1, 5);
            const simbolo = new Simbolo('>', '>', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoBinario(binario);
            // slt a0, reg, a0: a0 = 1 se reg < a0, i.e., a0 > reg
            expect(tradutor.text).toContain('slt a0, s9, a0');
        });

        it('deve traduzir comparação menor ou igual com slt e xori', () => {
            const esquerda = new Literal(-1, 1, 5);
            const direita = new Literal(-1, 1, 10);
            const simbolo = new Simbolo('<=', '<=', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoBinario(binario);
            // NOT(a0 > reg): slt com operandos trocados + flip
            expect(tradutor.text).toContain('slt a0, s9, a0');
            expect(tradutor.text).toContain('xori a0, a0, 1');
        });

        it('deve traduzir comparação maior ou igual com slt e xori', () => {
            const esquerda = new Literal(-1, 1, 5);
            const direita = new Literal(-1, 1, 3);
            const simbolo = new Simbolo('>=', '>=', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoBinario(binario);
            // NOT(a0 < reg)
            expect(tradutor.text).toContain('slt a0, a0, s9');
            expect(tradutor.text).toContain('xori a0, a0, 1');
        });

        it('deve traduzir igualdade com sub e seqz', () => {
            const esquerda = new Literal(-1, 1, 5);
            const direita = new Literal(-1, 1, 5);
            const simbolo = new Simbolo('==', '==', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoBinario(binario);
            // sub + seqz: a0 = 1 se a0 - reg == 0
            expect(tradutor.text).toContain('sub a0, a0,');
            expect(tradutor.text).toContain('seqz a0, a0');
        });

        it('deve traduzir diferença com sub e snez', () => {
            const esquerda = new Literal(-1, 1, 5);
            const direita = new Literal(-1, 1, 3);
            const simbolo = new Simbolo('!=', '!=', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoBinario(binario);
            // sub + snez: a0 = 1 se a0 - reg != 0
            expect(tradutor.text).toContain('sub a0, a0,');
            expect(tradutor.text).toContain('snez a0, a0');
        });
    });

    describe('Construtos - Operações Unárias', () => {
        it('deve traduzir negação numérica com neg', () => {
            const operando = new Literal(-1, 1, 5);
            const simbolo = new Simbolo('-', '-', null, 1, 1);
            const unario = new Unario(1, simbolo, operando);

            const resultado = tradutor.traduzirConstrutoUnario(unario);
            expect(resultado).toBe('a0');
            expect(tradutor.text).toContain('neg a0, a0');
        });

        it('deve traduzir negação lógica com ! usando seqz', () => {
            const operando = new Literal(-1, 1, true);
            const simbolo = new Simbolo('!', '!', null, 1, 1);
            const unario = new Unario(1, simbolo, operando);

            tradutor.traduzirConstrutoUnario(unario);
            // seqz: a0 = 1 se a0 == 0 (sem flags register — difere do ARM)
            expect(tradutor.text).toContain('seqz a0, a0');
        });

        it('deve traduzir negação lógica com nao usando seqz', () => {
            const operando = new Literal(-1, 1, false);
            const simbolo = new Simbolo('nao', 'nao', null, 1, 1);
            const unario = new Unario(1, simbolo, operando);

            tradutor.traduzirConstrutoUnario(unario);
            expect(tradutor.text).toContain('seqz a0, a0');
        });
    });

    describe('Construtos - Operações Lógicas', () => {
        it('deve traduzir operador E lógico com beqz', () => {
            const esquerda = new Literal(-1, 1, true);
            const direita = new Literal(-1, 1, true);
            const simbolo = new Simbolo('e', 'e', null, 1, 1);
            const logico = new Logico(1, esquerda, simbolo, direita);

            const resultado = tradutor.traduzirConstrutoLogico(logico);
            expect(resultado).toBe('a0');
            expect(tradutor.text).toContain('beqz a0,');
            expect(tradutor.text).toContain('li a0, 1');
        });

        it('deve traduzir operador OU lógico com bnez', () => {
            const esquerda = new Literal(-1, 1, false);
            const direita = new Literal(-1, 1, true);
            const simbolo = new Simbolo('ou', 'ou', null, 1, 1);
            const logico = new Logico(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoLogico(logico);
            expect(tradutor.text).toContain('bnez a0,');
            expect(tradutor.text).toContain('li a0, 1');
        });

        it('deve traduzir operador && com beqz', () => {
            const esquerda = new Literal(-1, 1, 1);
            const direita = new Literal(-1, 1, 1);
            const simbolo = new Simbolo('&&', '&&', null, 1, 1);
            const logico = new Logico(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoLogico(logico);
            expect(tradutor.text).toContain('beqz a0,');
        });

        it('deve traduzir operador || com bnez', () => {
            const esquerda = new Literal(-1, 1, 0);
            const direita = new Literal(-1, 1, 1);
            const simbolo = new Simbolo('||', '||', null, 1, 1);
            const logico = new Logico(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoLogico(logico);
            expect(tradutor.text).toContain('bnez a0,');
        });
    });

    describe('Construtos - Variáveis', () => {
        it('deve traduzir acesso a variável com la e ld', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'x', null, 1, 1);
            const variavel = new Variavel(1, simboloVar);

            tradutor.variaveis.set('x', 'var_x');

            const resultado = tradutor.traduzirConstrutoVariavel(variavel);
            expect(resultado).toBe('a0');
            expect(tradutor.text).toContain('la a0, var_x');
            expect(tradutor.text).toContain('ld a0, 0(a0)');
        });

        it('deve retornar o nome da variável não encontrada', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'y', null, 1, 1);
            const variavel = new Variavel(1, simboloVar);

            const resultado = tradutor.traduzirConstrutoVariavel(variavel);
            expect(resultado).toBe('y');
        });
    });

    describe('Construtos - Agrupamento', () => {
        it('deve traduzir agrupamento de expressão', () => {
            const literal = new Literal(-1, 1, 42);
            const agrupamento = new Agrupamento(1, 1, literal);

            const resultado = tradutor.traduzirConstrutoAgrupamento(agrupamento);
            expect(resultado).toBe('42');
        });
    });

    describe('Construtos - Vetores', () => {
        it('deve traduzir vetor vazio', () => {
            const vetor = new Vetor(1, 1, []);
            const resultado = tradutor.traduzirConstrutoVetor(vetor);

            expect(resultado).toMatch(/^vetor_\d{5}$/);
            expect(tradutor.bss).toContain('.space 0');
        });

        it('deve traduzir vetor com valores usando .space 24 (3 × 8 bytes rv64)', () => {
            const valores = [new Literal(-1, 1, 1), new Literal(-1, 1, 2), new Literal(-1, 1, 3)];
            const vetor = new Vetor(1, 1, valores);
            const resultado = tradutor.traduzirConstrutoVetor(vetor);

            expect(resultado).toMatch(/^vetor_\d{5}$/);
            // Cada elemento ocupa 8 bytes em rv64 (vs 4 bytes no ARM)
            expect(tradutor.bss).toContain('.space 24');
            expect(tradutor.text).toContain('sd a0, 0(a1)');
            expect(tradutor.text).toContain('sd a0, 8(a1)');
            expect(tradutor.text).toContain('sd a0, 16(a1)');
        });
    });

    describe('Construtos - Atribuição', () => {
        it('deve traduzir atribuição a variável nova', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'x', null, 1, 1);
            const variavel = new Variavel(1, simboloVar);
            const valor = new Literal(-1, 1, 10);
            const atribuir = new Atribuir(1, variavel, valor);

            tradutor.traduzirConstrutoAtribuir(atribuir);

            expect(tradutor.variaveis.has('x')).toBe(true);
            expect(tradutor.bss).toContain('var_x: .space 8');
            expect(tradutor.text).toContain('li a0, 10');
            expect(tradutor.text).toContain('la a1, var_x');
            expect(tradutor.text).toContain('sd a0, 0(a1)');
        });

        it('deve traduzir atribuição a variável existente', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'y', null, 1, 1);
            const variavel = new Variavel(1, simboloVar);
            const valor = new Literal(-1, 1, 20);

            tradutor.variaveis.set('y', 'var_y');
            const atribuir = new Atribuir(1, variavel, valor);

            tradutor.traduzirConstrutoAtribuir(atribuir);

            expect(tradutor.text).toContain('li a0, 20');
            expect(tradutor.text).toContain('la a1, var_y');
        });
    });

    describe('Declarações - Var', () => {
        it('deve traduzir variável sem inicializador com .space 8', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'a', null, 1, 1);
            const varDecl = new Var(simboloVar, new Literal(-1, 1, null));

            tradutor.traduzirDeclaracaoVar(varDecl);

            expect(tradutor.variaveis.has('a')).toBe(true);
            // rv64 usa 8 bytes por slot (vs 4 no ARM)
            expect(tradutor.bss).toContain('var_a: .space 8');
        });

        it('deve traduzir variável com inicializador', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'b', null, 1, 1);
            const inicializador = new Literal(-1, 1, 42);
            const varDecl = new Var(simboloVar, inicializador);

            tradutor.traduzirDeclaracaoVar(varDecl);

            expect(tradutor.variaveis.has('b')).toBe(true);
            expect(tradutor.bss).toContain('var_b: .space 8');
            expect(tradutor.text).toContain('li a0, 42');
            expect(tradutor.text).toContain('la a1, var_b');
            expect(tradutor.text).toContain('sd a0, 0(a1)');
        });

        it('deve traduzir variável com vetor', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'arr', null, 1, 1);
            const vetor = new Vetor(1, 1, [new Literal(-1, 1, 1), new Literal(-1, 1, 2)]);
            const varDecl = new Var(simboloVar, vetor);

            tradutor.traduzirDeclaracaoVar(varDecl);

            expect(tradutor.variaveis.has('arr')).toBe(true);
        });
    });

    describe('Declarações - Const', () => {
        it('deve traduzir constante com .dword na seção .data', () => {
            const simboloConst = new Simbolo('IDENTIFICADOR', 'PI', null, 1, 1);
            const inicializador = new Literal(-1, 1, 3.14);
            const constDecl = new Const(simboloConst, inicializador);

            tradutor.traduzirDeclaracaoConst(constDecl);

            expect(tradutor.variaveis.has('PI')).toBe(true);
            expect(tradutor.data).toContain('const_PI');
            // rv64 usa .dword (8 bytes) vs .word (4 bytes) do ARM
            expect(tradutor.data).toContain('.dword');
        });
    });

    describe('Declarações - Escreva', () => {
        it('deve traduzir escreva com string literal via ecall', () => {
            const literal = new Literal(-1, 1, 'Hello RISC-V');
            const escreva = new Escreva(1, 1, [literal]);

            tradutor.traduzirDeclaracaoEscreva(escreva);

            expect(tradutor.data).toContain('"Hello RISC-V"');
            // sys_write: a7=64, a0=1 (stdout), ecall
            expect(tradutor.text).toContain('li a7, 64');
            expect(tradutor.text).toContain('ecall');
            expect(tradutor.text).toContain('li a0, 1');
        });
    });

    describe('Declarações - Se', () => {
        it('deve traduzir if simples com beqz', () => {
            const condicao = new Literal(-1, 1, true);
            const corpo = new Bloco(1, 1, []);
            const se = new Se(condicao, corpo, null);

            tradutor.traduzirDeclaracaoSe(se);

            // RISC-V não tem `cmp` + flags — usa beqz direto
            expect(tradutor.text).toContain('beqz a0, .L');
            expect(tradutor.text).toMatch(/\.L\d+:/);
        });

        it('deve traduzir if-else com beqz e j', () => {
            const condicao = new Literal(-1, 1, true);
            const corpoEntao = new Bloco(1, 1, []);
            const corpoSenao = new Bloco(1, 1, []);
            const se = new Se(condicao, corpoEntao, null, corpoSenao);

            tradutor.traduzirDeclaracaoSe(se);

            expect(tradutor.text).toContain('beqz a0,');
            expect(tradutor.text).toContain('j .L');
        });
    });

    describe('Declarações - Enquanto', () => {
        it('deve traduzir loop enquanto com beqz e j', () => {
            const condicao = new Literal(-1, 1, true);
            const corpo = new Bloco(1, 1, []);
            const enquanto = new Enquanto(condicao, corpo);

            tradutor.traduzirDeclaracaoEnquanto(enquanto);

            expect(tradutor.text).toContain('beqz a0,');
            expect(tradutor.text).toContain('j .L');
            expect(tradutor.text).toMatch(/\.L\d+:/);
        });
    });

    describe('Declarações - Para', () => {
        it('deve traduzir loop para', () => {
            const simboloI = new Simbolo('IDENTIFICADOR', 'i', null, 1, 1);
            const inicializador = new Var(simboloI, new Literal(-1, 1, 0));

            const varI = new Variavel(1, simboloI);
            const condicao = new Binario(
                1,
                varI,
                new Simbolo('<', '<', null, 1, 1),
                new Literal(-1, 1, 10)
            );
            const incremento = new Atribuir(
                1,
                varI,
                new Binario(
                    1,
                    varI,
                    new Simbolo('+', '+', null, 1, 1),
                    new Literal(-1, 1, 1)
                )
            );
            const corpo = new Bloco(1, 1, []);
            const para = new Para(-1, 1, inicializador, condicao, incremento, corpo);

            tradutor.traduzirDeclaracaoPara(para);

            expect(tradutor.text).toMatch(/\.L\d+:/);
            expect(tradutor.text).toContain('beqz a0,');
            expect(tradutor.text).toContain('j .L');
        });
    });

    describe('Declarações - Função', () => {
        it('deve traduzir função simples com prologue RISC-V', () => {
            const simboloFunc = new Simbolo('IDENTIFICADOR', 'minhaFuncao', null, 1, 1);
            const funcao = new FuncaoConstruto(-1, 1, [], []);
            const funcaoDecl = new FuncaoDeclaracao(simboloFunc, funcao);

            tradutor.traduzirDeclaracaoFuncao(funcaoDecl);

            expect(tradutor.text).toContain('minhaFuncao:');
            // Prologue: RISC-V não tem push/pop — usa addi sp + sd explícitos
            expect(tradutor.text).toContain('addi sp, sp, -16');
            expect(tradutor.text).toContain('sd   ra, 8(sp)');
            expect(tradutor.text).toContain('sd   s0, 0(sp)');
            expect(tradutor.text).toContain('addi s0, sp, 16');
            // Epilogue
            expect(tradutor.text).toContain('ld   ra, 8(sp)');
            expect(tradutor.text).toContain('ld   s0, 0(sp)');
            expect(tradutor.text).toContain('addi sp, sp, 16');
            expect(tradutor.text).toContain('ret');
        });

        it('deve traduzir função com corpo', () => {
            const simboloFunc = new Simbolo('IDENTIFICADOR', 'somar', null, 1, 1);
            const retorno = new Retorna({} as SimboloInterface, new Literal(-1, 1, 42));
            const funcao = new FuncaoConstruto(-1, 1, [], [retorno]);
            const funcaoDecl = new FuncaoDeclaracao(simboloFunc, funcao);

            tradutor.traduzirDeclaracaoFuncao(funcaoDecl);

            expect(tradutor.text).toContain('somar:');
            expect(tradutor.text).toContain('li a0, 42');
        });
    });

    describe('Declarações - Retorna', () => {
        it('deve traduzir retorno com epilogue RISC-V', () => {
            const retorna = new Retorna({} as SimboloInterface, new Literal(-1, 1, null));

            tradutor.traduzirDeclaracaoRetorna(retorna);

            expect(tradutor.text).toContain('ld   ra, 8(sp)');
            expect(tradutor.text).toContain('ld   s0, 0(sp)');
            expect(tradutor.text).toContain('addi sp, sp, 16');
            expect(tradutor.text).toContain('ret');
        });

        it('deve traduzir retorno com valor', () => {
            const valor = new Literal(-1, 1, 100);
            const retorna = new Retorna({} as SimboloInterface, valor);

            tradutor.traduzirDeclaracaoRetorna(retorna);

            expect(tradutor.text).toContain('li a0, 100');
            expect(tradutor.text).toContain('ret');
        });
    });

    describe('Tradução Completa', () => {
        it('deve traduzir programa simples com seções bss, data e text', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'x', null, 1, 1);
            const varDecl = new Var(simboloVar, new Literal(-1, 1, 42));
            const escreva = new Escreva(1, 1, [new Literal(-1, 1, 'Olá')]);

            const declaracoes = [varDecl, escreva];
            const resultado = tradutor.traduzir(declaracoes);

            expect(resultado).toContain('.bss');
            expect(resultado).toContain('.data');
            expect(resultado).toContain('.text');
            expect(resultado).toContain('_start:');
            // Saída do sistema via sys_exit (a7=93)
            expect(resultado).toContain('li a7, 93');
            expect(resultado).toContain('ecall');
        });

        it('deve incluir saidaSistema com sys_exit no final', () => {
            const declaracoes: Declaracao[] = [];
            const resultado = tradutor.traduzir(declaracoes);

            expect(resultado).toContain('li a0, 0');
            expect(resultado).toContain('li a7, 93');
            expect(resultado).toContain('ecall');
        });
    });

    describe('Casos Isolados', () => {
        it('deve lidar com operador binário não implementado emitindo comentário', () => {
            const esquerda = new Literal(-1, 1, 5);
            const direita = new Literal(-1, 1, 3);
            const simbolo = new Simbolo('**', '**', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);

            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('# Operador ** não implementado');
        });
    });
});
