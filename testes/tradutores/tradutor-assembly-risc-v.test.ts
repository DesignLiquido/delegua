import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    DefinirValor,
    FuncaoConstruto,
    Leia,
    Literal,
    Logico,
    TipoDe,
    Unario,
    Variavel,
    Vetor,
} from '../../fontes/construtos';
import {
    Bloco,
    Classe,
    Const,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Falhar,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    Para,
    ParaCada,
    Retorna,
    Se,
    Tente,
    Var,
} from '../../fontes/declaracoes';
import { CaminhoEscolha } from '../../fontes/interfaces/construtos';
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

    describe('Construtos - Operações Binárias adicionais', () => {
        it('deve traduzir igualdade estrita (===) com sub e seqz', () => {
            const esquerda = new Literal(-1, 1, 7);
            const direita = new Literal(-1, 1, 7);
            const simbolo = new Simbolo('===', '===', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);
            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('sub a0, a0,');
            expect(tradutor.text).toContain('seqz a0, a0');
        });

        it('deve traduzir diferença estrita (!==) com sub e snez', () => {
            const esquerda = new Literal(-1, 1, 7);
            const direita = new Literal(-1, 1, 3);
            const simbolo = new Simbolo('!==', '!==', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);
            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('sub a0, a0,');
            expect(tradutor.text).toContain('snez a0, a0');
        });

        it('deve usar a0 diretamente quando esquerda já está em a0', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'x', null, 1, 1);
            tradutor.variaveis.set('x', 'var_x');
            const variavel = new Variavel(1, simboloVar);
            const direita = new Literal(-1, 1, 5);
            const simbolo = new Simbolo('+', '+', null, 1, 1);
            const binario = new Binario(1, variavel, simbolo, direita);
            const resultado = tradutor.traduzirConstrutoBinario(binario);
            expect(resultado).toBe('a0');
        });
    });

    describe('Construtos - Acesso a índice e método', () => {
        it('deve traduzir acesso a índice de variável com slli', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'arr', null, 1, 1);
            const variavel = new Variavel(1, simboloVar);
            const indice = new Literal(-1, 1, 2);
            const simboloFechamento = new Simbolo(']', ']', null, 1, 1);
            const acesso = new AcessoIndiceVariavel(-1, variavel, indice, simboloFechamento);
            const resultado = tradutor.traduzirAcessoIndiceVariavel(acesso);
            expect(resultado).toBe('a0');
            expect(tradutor.text).toContain('slli a0, a0, 3');
        });

        it('deve traduzir acesso a índice quando entidade não é Variável', () => {
            const literal = new Literal(-1, 1, 'arr');
            const indice = new Literal(-1, 1, 0);
            const simboloFechamento = new Simbolo(']', ']', null, 1, 1);
            const acesso = new AcessoIndiceVariavel(-1, literal, indice, simboloFechamento);
            const resultado = tradutor.traduzirAcessoIndiceVariavel(acesso);
            expect(resultado).toBe('a0');
            expect(tradutor.text).toContain('la s9, unknown');
        });

        it('deve traduzir acesso a método de objeto', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'obj', null, 1, 1);
            const variavel = new Variavel(1, simboloVar);
            const acesso = new AcessoMetodo(-1, variavel, 'tamanho');
            const resultado = tradutor.traduzirConstrutoAcessoMetodo(acesso);
            expect(resultado).toContain('tamanho');
        });
    });

    describe('Construtos - Atribuição por índice', () => {
        it('deve traduzir atribuição por índice em variável com slli', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'arr', null, 1, 1);
            const variavel = new Variavel(1, simboloVar);
            const indice = new Literal(-1, 1, 0);
            const valor = new Literal(-1, 1, 99);
            const atribuicao = new AtribuicaoPorIndice(-1, 1, variavel, indice, valor);
            tradutor.traduzirConstrutoAtribuicaoPorIndice(atribuicao);
            expect(tradutor.text).toContain('slli a1, a1, 3');
            expect(tradutor.text).toContain('sd a1, 0(');
        });

        it('deve traduzir atribuição por índice quando objeto não é Variável', () => {
            const objeto = new Literal(-1, 1, 'arr');
            const indice = new Literal(-1, 1, 1);
            const valor = new Literal(-1, 1, 42);
            const atribuicao = new AtribuicaoPorIndice(-1, 1, objeto, indice, valor);
            tradutor.traduzirConstrutoAtribuicaoPorIndice(atribuicao);
            expect(tradutor.text).toContain('la s9, unknown');
        });
    });

    describe('Construtos - Chamada, DefinirValor, FuncaoConstruto, TipoDe', () => {
        it('deve traduzir chamada de função com argumentos usando call', () => {
            const simboloFunc = new Simbolo('IDENTIFICADOR', 'minhaFuncao', null, 1, 1);
            const funcaoVar = new Variavel(1, simboloFunc);
            const args = [new Literal(-1, 1, 1), new Literal(-1, 1, 2)];
            const chamada = new Chamada(-1, funcaoVar, args);
            tradutor.traduzirConstrutoChamada(chamada);
            expect(tradutor.text).toContain('call minhaFuncao');
            expect(tradutor.text).toContain('li a0');
        });

        it('deve traduzir chamada com mais de 8 argumentos (extras ignorados)', () => {
            const simboloFunc = new Simbolo('IDENTIFICADOR', 'func9', null, 1, 1);
            const funcaoVar = new Variavel(1, simboloFunc);
            const args = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => new Literal(-1, 1, n));
            const chamada = new Chamada(-1, funcaoVar, args);
            tradutor.traduzirConstrutoChamada(chamada);
            expect(tradutor.text).toContain('call func9');
        });

        it('deve traduzir chamada sem Variável como entidade', () => {
            const literal = new Literal(-1, 1, 'func');
            const chamada = new Chamada(-1, literal, []);
            tradutor.traduzirConstrutoChamada(chamada);
            expect(tradutor.text).toContain('call funcao');
        });

        it('deve traduzir DefinirValor com sd', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'obj', null, 1, 1);
            const variavel = new Variavel(1, simboloVar);
            tradutor.variaveis.set('obj', 'var_obj');
            const nomeSimbolo = new Simbolo('IDENTIFICADOR', 'prop', null, 1, 1);
            const valor = new Literal(-1, 1, 42);
            const definirValor = new DefinirValor(-1, 1, variavel, nomeSimbolo, valor);
            tradutor.traduzirConstrutoDefinirValor(definirValor);
            expect(tradutor.text).toContain('sd a0, 0(a1)');
        });

        it('deve traduzir FuncaoConstruto com corpo e prologue RISC-V', () => {
            const varDecl = new Var(
                new Simbolo('IDENTIFICADOR', 'a', null, 1, 1),
                new Literal(-1, 1, 1)
            );
            const funcaoConstruto = new FuncaoConstruto(-1, 1, [], [varDecl]);
            tradutor.traduzirFuncaoConstruto(funcaoConstruto);
            expect(tradutor.text).toContain('addi sp, sp, -16');
            expect(tradutor.text).toContain('sd   ra, 8(sp)');
            expect(tradutor.text).toContain('ret');
        });

        it('deve traduzir TipoDe retornando valor do operando', () => {
            const simbolo = new Simbolo('IDENTIFICADOR', 'x', null, 1, 1);
            const literal = new Literal(-1, 1, 42);
            const tipoDe = new TipoDe(-1, simbolo, literal);
            const resultado = tradutor.traduzirConstrutoTipoDe(tipoDe);
            expect(resultado).toBe('42');
        });

        it('dicionarioConstrutos Isto -> this', () => {
            const resultado = (tradutor.dicionarioConstrutos['Isto'] as () => string)();
            expect(resultado).toBe('this');
        });

        it('dicionarioDeclaracoes Continua -> j .continue_label', () => {
            const resultado = (tradutor.dicionarioDeclaracoes['Continua'] as () => string)();
            expect(resultado).toBe('j .continue_label');
        });

        it('dicionarioDeclaracoes Sustar -> j .break_label', () => {
            const resultado = (tradutor.dicionarioDeclaracoes['Sustar'] as () => string)();
            expect(resultado).toBe('j .break_label');
        });
    });

    describe('Declarações - Bloco com conteúdo', () => {
        it('deve traduzir bloco com declarações internas', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'x', null, 1, 1);
            const varDecl = new Var(simboloVar, new Literal(-1, 1, 5));
            const bloco = new Bloco(-1, 1, [varDecl]);
            tradutor.traduzirDeclaracaoBloco(bloco);
            expect(tradutor.variaveis.has('x')).toBe(true);
        });
    });

    describe('Declarações - Expressão', () => {
        it('deve traduzir declaração de expressão', () => {
            const literal = new Literal(-1, 1, 42);
            const expressao = new Expressao(literal);
            tradutor.traduzirDeclaracaoExpressao(expressao);
            expect(tradutor.text).toContain('li a0, 42');
        });
    });

    describe('Declarações - Escolha', () => {
        it('deve traduzir escolha com caminhos usando bne', () => {
            const identificador = new Literal(-1, 1, 5);
            const caminho: CaminhoEscolha = {
                condicoes: [new Literal(-1, 1, 5)],
                declaracoes: [new Escreva(1, 1, [new Literal(-1, 1, 'cinco')])],
            };
            const escolha = new Escolha(identificador, [caminho], null);
            tradutor.traduzirDeclaracaoEscolha(escolha);
            expect(tradutor.text).toContain('bne a0, a1,');
            expect(tradutor.text).toContain('j .L');
        });

        it('deve traduzir escolha vazia sem caminhos', () => {
            const identificador = new Literal(-1, 1, 1);
            const escolha = new Escolha(identificador, [], null);
            tradutor.traduzirDeclaracaoEscolha(escolha);
            expect(tradutor.text).toContain('.L');
        });
    });

    describe('Declarações - Fazer', () => {
        it('deve traduzir fazer/enquanto com bnez', () => {
            const corpo = new Bloco(1, 1, []);
            const condicao = new Literal(-1, 1, true);
            const fazer = new Fazer(-1, 1, corpo, condicao);
            tradutor.traduzirDeclaracaoFazer(fazer);
            expect(tradutor.text).toMatch(/\.L\d+:/);
            expect(tradutor.text).toContain('bnez a0,');
        });

        it('deve traduzir fazer sem corpo com condição false', () => {
            const corpo = new Bloco(1, 1, []);
            const condicao = new Literal(-1, 1, false);
            const fazer = new Fazer(-1, 1, corpo, condicao);
            tradutor.traduzirDeclaracaoFazer(fazer);
            expect(tradutor.text).toMatch(/\.L\d+:/);
        });
    });

    describe('Declarações - Falhar', () => {
        it('deve traduzir falhar com mensagem usando sys_exit', () => {
            const simbolo = new Simbolo('IDENTIFICADOR', 'falhar', null, 1, 1);
            const explicacao = new Literal(-1, 1, 'Erro crítico');
            const falhar = new Falhar(simbolo, explicacao);
            tradutor.traduzirDeclaracaoFalhar(falhar);
            expect(tradutor.text).toContain('# Falhar com mensagem:');
            expect(tradutor.text).toContain('li a0, 1');
            expect(tradutor.text).toContain('li a7, 93');
            expect(tradutor.text).toContain('ecall');
        });

        it('deve traduzir falhar sem explicacao com mensagem padrão', () => {
            const simbolo = new Simbolo('IDENTIFICADOR', 'falhar', null, 1, 1);
            const falhar = new Falhar(simbolo, null);
            tradutor.traduzirDeclaracaoFalhar(falhar);
            expect(tradutor.text).toContain('# Falhar com mensagem: "Erro"');
        });
    });

    describe('Declarações - Importar e Leia', () => {
        it('deve traduzir importar com comentário RISC-V', () => {
            const importar = new Importar(new Literal(-1, 1, 'modulo'));
            tradutor.traduzirDeclaracaoImportar(importar);
            expect(tradutor.text).toContain('# Importar:');
        });

        it('deve traduzir leia com variável como argumento usando sys_read', () => {
            const simbolo = new Simbolo('IDENTIFICADOR', 'leia', null, 1, 1);
            const varSimbolo = new Simbolo('IDENTIFICADOR', 'entrada', null, 1, 1);
            const variavel = new Variavel(1, varSimbolo);
            const leia = new Leia(simbolo, [variavel]);
            tradutor.traduzirDeclaracaoLeia(leia);
            expect(tradutor.text).toContain('li a7, 63');
            expect(tradutor.text).toContain('ecall');
            expect(tradutor.bss).toContain('var_entrada: .space 256');
        });

        it('deve traduzir leia com variável já registrada', () => {
            const simbolo = new Simbolo('IDENTIFICADOR', 'leia', null, 1, 1);
            const varSimbolo = new Simbolo('IDENTIFICADOR', 'entrada', null, 1, 1);
            const variavel = new Variavel(1, varSimbolo);
            tradutor.variaveis.set('entrada', 'var_entrada');
            const leia = new Leia(simbolo, [variavel]);
            tradutor.traduzirDeclaracaoLeia(leia);
            expect(tradutor.text).toContain('la a1, var_entrada');
        });

        it('deve ignorar leia sem argumentos do tipo Variável', () => {
            const simbolo = new Simbolo('IDENTIFICADOR', 'leia', null, 1, 1);
            const textoAntes = tradutor.text;
            const leia = new Leia(simbolo, []);
            tradutor.traduzirDeclaracaoLeia(leia);
            expect(tradutor.text).toBe(textoAntes);
        });
    });

    describe('Declarações - ParaCada', () => {
        it('deve traduzir paraCada com vetor usando bge', () => {
            const varSimbolo = new Simbolo('IDENTIFICADOR', 'item', null, 1, 1);
            const variavel = new Variavel(1, varSimbolo);
            const vetor = new Vetor(1, 1, [new Literal(-1, 1, 1), new Literal(-1, 1, 2)]);
            const corpo = new Bloco(1, 1, []);
            const paraCada = new ParaCada(-1, 1, variavel, vetor, corpo);
            tradutor.traduzirDeclaracaoParaCada(paraCada);
            expect(tradutor.text).toContain('li t0, 0');
            expect(tradutor.text).toContain('bge t0, t1,');
            expect(tradutor.text).toContain('addi t0, t0, 1');
        });
    });

    describe('Declarações - Classe e Tente', () => {
        it('deve traduzir declaração de classe com comentário', () => {
            const simboloClasse = new Simbolo('IDENTIFICADOR', 'MinhaClasse', null, 1, 1);
            const classe = new Classe(simboloClasse, [], [], [], []);
            tradutor.traduzirDeclaracaoClasse(classe);
            expect(tradutor.text).toContain('# Classe: MinhaClasse');
        });

        it('deve traduzir tente com declarações no caminho', () => {
            const varDecl = new Var(
                new Simbolo('IDENTIFICADOR', 'x', null, 1, 1),
                new Literal(-1, 1, 1)
            );
            const tente = new Tente(-1, 1, [varDecl], null, null, null);
            tradutor.traduzirDeclaracaoTente(tente);
            expect(tradutor.text).toContain('# Tente-pegue');
            expect(tradutor.variaveis.has('x')).toBe(true);
        });

        it('deve traduzir tente vazio', () => {
            const tente = new Tente(-1, 1, [], null, null, null);
            tradutor.traduzirDeclaracaoTente(tente);
            expect(tradutor.text).toContain('# Tente-pegue');
        });
    });

    describe('Declarações - Para com inicializador Atribuir', () => {
        it('deve traduzir para com Atribuir como inicializador (caminho construto)', () => {
            const simboloJ = new Simbolo('IDENTIFICADOR', 'j', null, 1, 1);
            const varJ = new Variavel(1, simboloJ);
            const inicializador = new Atribuir(1, varJ, new Literal(-1, 1, 0));
            const condicao = new Binario(
                1,
                varJ,
                new Simbolo('<', '<', null, 1, 1),
                new Literal(-1, 1, 5)
            );
            const incremento = new Atribuir(
                1,
                varJ,
                new Binario(1, varJ, new Simbolo('+', '+', null, 1, 1), new Literal(-1, 1, 1))
            );
            const corpo = new Bloco(1, 1, []);
            const para = new Para(-1, 1, inicializador as any, condicao, incremento, corpo);
            tradutor.traduzirDeclaracaoPara(para);
            expect(tradutor.text).toMatch(/\.L\d+:/);
            expect(tradutor.text).toContain('beqz a0,');
        });
    });

    describe('Utilitários - criaTamanhoNaMemoriaReferenteAVar', () => {
        it('deve retornar label de tamanho para string literal', () => {
            const resultado = tradutor.criarTamanhoNaMemoriaReferenteAVar('minhaString');
            expect(resultado).toBe('tam_minhaString');
        });
    });

    describe('emitirCarga - ponto flutuante via .data', () => {
        it('deve armazenar float em .data e usar la (via traduzirConstrutoLiteral)', () => {
            const literal = new Literal(-1, 1, 3.14);
            const resultado = tradutor.traduzirConstrutoLiteral(literal);
            expect(resultado).toMatch(/^Delegua_\d{5}$/);
            expect(tradutor.data).toContain('.double 3.14');
        });
    });

    describe('Declarações - Escreva com não-Literal', () => {
        it('deve emitir ecall mesmo sem literal (argumentos vazios de string)', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'msg', null, 1, 1);
            const variavel = new Variavel(1, simboloVar);
            const escreva = new Escreva(1, 1, [variavel]);
            tradutor.traduzirDeclaracaoEscreva(escreva);
            expect(tradutor.text).toContain('li a7, 64');
            expect(tradutor.text).toContain('ecall');
        });
    });
});
