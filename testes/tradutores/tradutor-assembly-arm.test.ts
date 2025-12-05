import { Agrupamento, Atribuir, Binario, FuncaoConstruto, Literal, Logico, Unario, Variavel, Vetor } from "../../fontes/construtos";
import { Bloco, Const, Declaracao, Enquanto, Escreva, Expressao, FuncaoDeclaracao, Para, Retorna, Se, Var } from "../../fontes/declaracoes";
import { SimboloInterface } from "../../fontes/interfaces";
import { Simbolo } from "../../fontes/lexador";
import { TradutorAssemblyARM } from "../../fontes/tradutores";

describe('Tradutor (Assembly ARM)', () => {
    let tradutor: TradutorAssemblyARM;

    beforeEach(() => {
        tradutor = new TradutorAssemblyARM('linux-arm');
    });

    describe('Construtor', () => {
        it('deve inicializar com plataforma linux-arm', () => {
            expect(tradutor.alvo).toBe('linux-arm');
            expect(tradutor.text).toContain('.text');
            expect(tradutor.text).toContain('_start:');
        });

        it('deve inicializar com plataforma android', () => {
            const tradutorAndroid = new TradutorAssemblyARM('android');
            expect(tradutorAndroid.alvo).toBe('android');
        });

        it('deve inicializar registradores disponíveis', () => {
            expect(tradutor.registradoresDisponiveis).toContain('r4');
            expect(tradutor.registradoresDisponiveis).toContain('r5');
            expect(tradutor.registradoresDisponiveis.length).toBe(7);
        });
    });

    describe('Utilitários', () => {
        it('deve gerar dígito aleatório com 5 caracteres', () => {
            const digito = tradutor.gerarDigitoAleatorio();
            expect(digito).toHaveLength(5);
            expect(digito).toMatch(/^\d{5}$/);
        });

        it('deve gerar labels únicos', () => {
            const label1 = tradutor.gerarLabel();
            const label2 = tradutor.gerarLabel();
            expect(label1).toBe('.L0');
            expect(label2).toBe('.L1');
            expect(label1).not.toBe(label2);
        });

        it('deve obter e liberar registradores', () => {
            const reg1 = tradutor.obterRegistrador();
            expect(reg1).toBe('r10'); // último da lista
            expect(tradutor.registradoresDisponiveis).not.toContain('r10');
            
            tradutor.liberarRegistrador(reg1);
            expect(tradutor.registradoresDisponiveis).toContain('r10');
        });

        it('deve retornar r0 quando não há registradores disponíveis', () => {
            // Esgotar todos os registradores
            while (tradutor.registradoresDisponiveis.length > 0) {
                tradutor.obterRegistrador();
            }
            const reg = tradutor.obterRegistrador();
            expect(reg).toBe('r0');
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
            expect(tradutor.data).toContain("'Olá Mundo'");
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
            
            expect(resultado).toBe('r0');
            expect(tradutor.text).toContain('add r0, r0,');
        });

        it('deve traduzir subtração', () => {
            const esquerda = new Literal(-1, 1, 10);
            const direita = new Literal(-1, 1, 4);
            const simbolo = new Simbolo('-', '-', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('sub r0, r0,');
        });

        it('deve traduzir multiplicação', () => {
            const esquerda = new Literal(-1, 1, 6);
            const direita = new Literal(-1, 1, 7);
            const simbolo = new Simbolo('*', '*', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('mul r0, r0,');
        });

        it('deve traduzir divisão', () => {
            const esquerda = new Literal(-1, 1, 20);
            const direita = new Literal(-1, 1, 5);
            const simbolo = new Simbolo('/', '/', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('sdiv r0, r0,');
        });

        it('deve traduzir módulo', () => {
            const esquerda = new Literal(-1, 1, 10);
            const direita = new Literal(-1, 1, 3);
            const simbolo = new Simbolo('%', '%', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('sdiv');
            expect(tradutor.text).toContain('mul');
            expect(tradutor.text).toContain('sub r0, r0, r1');
        });

        it('deve traduzir comparação menor que', () => {
            const esquerda = new Literal(-1, 1, 5);
            const direita = new Literal(-1, 1, 10);
            const simbolo = new Simbolo('<', '<', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('cmp r0,');
            expect(tradutor.text).toContain('movlt r0, #1');
            expect(tradutor.text).toContain('movge r0, #0');
        });

        it('deve traduzir comparação maior que', () => {
            const esquerda = new Literal(-1, 1, 10);
            const direita = new Literal(-1, 1, 5);
            const simbolo = new Simbolo('>', '>', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('movgt r0, #1');
            expect(tradutor.text).toContain('movle r0, #0');
        });

        it('deve traduzir igualdade', () => {
            const esquerda = new Literal(-1, 1, 5);
            const direita = new Literal(-1, 1, 5);
            const simbolo = new Simbolo('==', '==', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('moveq r0, #1');
            expect(tradutor.text).toContain('movne r0, #0');
        });

        it('deve traduzir diferença', () => {
            const esquerda = new Literal(-1, 1, 5);
            const direita = new Literal(-1, 1, 3);
            const simbolo = new Simbolo('!=', '!=', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('movne r0, #1');
            expect(tradutor.text).toContain('moveq r0, #0');
        });
    });

    describe('Construtos - Operações Unárias', () => {
        it('deve traduzir negação numérica', () => {
            const operando = new Literal(-1, 1, 5);
            const simbolo = new Simbolo('-', '-', null, 1, 1);
            const unario = new Unario(1, simbolo, operando);
            
            const resultado = tradutor.traduzirConstrutoUnario(unario);
            expect(resultado).toBe('r0');
            expect(tradutor.text).toContain('neg r0, r0');
        });

        it('deve traduzir negação lógica com !', () => {
            const operando = new Literal(-1, 1, true);
            const simbolo = new Simbolo('!', '!', null, 1, 1);
            const unario = new Unario(1, simbolo, operando);
            
            tradutor.traduzirConstrutoUnario(unario);
            expect(tradutor.text).toContain('cmp r0, #0');
            expect(tradutor.text).toContain('moveq r0, #1');
            expect(tradutor.text).toContain('movne r0, #0');
        });

        it('deve traduzir negação lógica com nao', () => {
            const operando = new Literal(-1, 1, false);
            const simbolo = new Simbolo('nao', 'nao', null, 1, 1);
            const unario = new Unario(1, simbolo, operando);
            
            tradutor.traduzirConstrutoUnario(unario);
            expect(tradutor.text).toContain('cmp r0, #0');
        });
    });

    describe('Construtos - Operações Lógicas', () => {
        it('deve traduzir operador E lógico', () => {
            const esquerda = new Literal(-1, 1, true);
            const direita = new Literal(-1, 1, true);
            const simbolo = new Simbolo('e', 'e', null, 1, 1);
            const logico = new Logico(1, esquerda, simbolo, direita);
            
            const resultado = tradutor.traduzirConstrutoLogico(logico);
            expect(resultado).toBe('r0');
            expect(tradutor.text).toContain('beq');
            expect(tradutor.text).toContain('mov r0, #1');
        });

        it('deve traduzir operador OU lógico', () => {
            const esquerda = new Literal(-1, 1, false);
            const direita = new Literal(-1, 1, true);
            const simbolo = new Simbolo('ou', 'ou', null, 1, 1);
            const logico = new Logico(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoLogico(logico);
            expect(tradutor.text).toContain('bne');
            expect(tradutor.text).toContain('mov r0, #1');
        });

        it('deve traduzir operador && (AND)', () => {
            const esquerda = new Literal(-1, 1, 1);
            const direita = new Literal(-1, 1, 1);
            const simbolo = new Simbolo('&&', '&&', null, 1, 1);
            const logico = new Logico(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoLogico(logico);
            expect(tradutor.text).toContain('beq');
        });

        it('deve traduzir operador || (OR)', () => {
            const esquerda = new Literal(-1, 1, 0);
            const direita = new Literal(-1, 1, 1);
            const simbolo = new Simbolo('||', '||', null, 1, 1);
            const logico = new Logico(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoLogico(logico);
            expect(tradutor.text).toContain('bne');
        });
    });

    describe('Construtos - Variáveis', () => {
        it('deve traduzir acesso a variável', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'x', null, 1, 1);
            const variavel = new Variavel(1, simboloVar);
            
            // Primeiro criar a variável
            tradutor.variaveis.set('x', 'var_x');
            
            const resultado = tradutor.traduzirConstrutoVariavel(variavel);
            expect(resultado).toBe('r0');
            expect(tradutor.text).toContain('ldr r0, =var_x');
            expect(tradutor.text).toContain('ldr r0, [r0]');
        });

        it('deve retornar unknown para variável não encontrada', () => {
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

        it('deve traduzir vetor com valores', () => {
            const valores = [
                new Literal(-1, 1, 1),
                new Literal(-1, 1, 2),
                new Literal(-1, 1, 3)
            ];
            const vetor = new Vetor(1, 1, valores);
            const resultado = tradutor.traduzirConstrutoVetor(vetor);
            
            expect(resultado).toMatch(/^vetor_\d{5}$/);
            expect(tradutor.bss).toContain('.space 12'); // 3 * 4 bytes
            expect(tradutor.text).toContain('str r0, [r1, #0]');
            expect(tradutor.text).toContain('str r0, [r1, #4]');
            expect(tradutor.text).toContain('str r0, [r1, #8]');
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
            expect(tradutor.bss).toContain('var_x: .space 4');
            expect(tradutor.text).toContain('ldr r0, =10');
            expect(tradutor.text).toContain('str r0, [r1]');
        });

        it('deve traduzir atribuição a variável existente', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'y', null, 1, 1);
            const variavel = new Variavel(1, simboloVar);
            const valor = new Literal(-1, 1, 20);
            
            tradutor.variaveis.set('y', 'var_y');
            const atribuir = new Atribuir(1, variavel, valor);
            
            tradutor.traduzirConstrutoAtribuir(atribuir);
            
            expect(tradutor.text).toContain('ldr r0, =20');
            expect(tradutor.text).toContain('ldr r1, =var_y');
        });
    });

    describe('Declarações - Var', () => {
        it('deve traduzir declaração de variável sem inicializador', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'a', null, 1, 1);
            const varDecl = new Var(simboloVar, new Literal(-1, 1, null));
            
            tradutor.traduzirDeclaracaoVar(varDecl);
            
            expect(tradutor.variaveis.has('a')).toBe(true);
            expect(tradutor.bss).toContain('var_a: .space 4');
        });

        it('deve traduzir declaração de variável com inicializador', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'b', null, 1, 1);
            const inicializador = new Literal(-1, 1, 42);
            const varDecl = new Var(simboloVar, inicializador);
            
            tradutor.traduzirDeclaracaoVar(varDecl);
            
            expect(tradutor.variaveis.has('b')).toBe(true);
            expect(tradutor.bss).toContain('var_b: .space 4');
            expect(tradutor.text).toContain('ldr r0, =42');
            expect(tradutor.text).toContain('mov [var_b], rax');
        });

        it('deve traduzir declaração de variável com vetor', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'arr', null, 1, 1);
            const vetor = new Vetor(1, 1, [new Literal(-1, 1, 1), new Literal(-1, 1, 2)]);
            const varDecl = new Var(simboloVar, vetor);
            
            tradutor.traduzirDeclaracaoVar(varDecl);
            
            expect(tradutor.variaveis.has('arr')).toBe(true);
        });
    });

    describe('Declarações - Const', () => {
        it('deve traduzir declaração de constante', () => {
            const simboloConst = new Simbolo('IDENTIFICADOR', 'PI', null, 1, 1);
            const inicializador = new Literal(-1, 1, 3.14);
            const constDecl = new Const(simboloConst, inicializador);
            
            tradutor.traduzirDeclaracaoConst(constDecl);
            
            expect(tradutor.variaveis.has('PI')).toBe(true);
            expect(tradutor.data).toContain('const_PI');
        });
    });

    describe('Declarações - Escreva', () => {
        it('deve traduzir escreva com string literal', () => {
            const literal = new Literal(-1, 1, 'Hello ARM');
            const escreva = new Escreva(1, 1, [literal]);
            
            tradutor.traduzirDeclaracaoEscreva(escreva);
            
            expect(tradutor.data).toContain("'Hello ARM'");
            expect(tradutor.text).toContain('mov r7, #4');
            expect(tradutor.text).toContain('swi 0');
        });
    });

    describe('Declarações - Se', () => {
        it('deve traduzir declaração if simples', () => {
            const condicao = new Literal(-1, 1, true);
            const corpo = new Bloco(1, 1, []);
            const se = new Se(condicao, corpo, null);
            
            tradutor.traduzirDeclaracaoSe(se);
            
            expect(tradutor.text).toContain('cmp');
            expect(tradutor.text).toContain('beq .L');
            expect(tradutor.text).toMatch(/\.L\d+:/g);
        });

        it('deve traduzir declaração if-else', () => {
            const condicao = new Literal(-1, 1, true);
            const corpoEntao = new Bloco(1, 1, []);
            const corpoSenao = new Bloco(1, 1, []);
            const se = new Se(condicao, corpoEntao, null, corpoSenao);
            
            tradutor.traduzirDeclaracaoSe(se);
            
            expect(tradutor.text).toContain('beq');
            expect(tradutor.text).toContain('b .L');
        });
    });

    describe('Declarações - Enquanto', () => {
        it('deve traduzir loop while', () => {
            const condicao = new Literal(-1, 1, true);
            const corpo = new Bloco(1, 1, []);
            const enquanto = new Enquanto(condicao, corpo);
            
            tradutor.traduzirDeclaracaoEnquanto(enquanto);
            
            expect(tradutor.text).toContain('beq');
            expect(tradutor.text).toContain('b .L');
            expect(tradutor.text).toMatch(/\.L\d+:/g);
        });
    });

    describe('Declarações - Para', () => {
        it('deve traduzir loop for', () => {
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
            
            expect(tradutor.text).toMatch(/\.L\d+:/g);
            expect(tradutor.text).toContain('beq');
            expect(tradutor.text).toContain('b .L');
        });
    });

    describe('Declarações - Função', () => {
        it('deve traduzir declaração de função simples', () => {
            const simboloFunc = new Simbolo('IDENTIFICADOR', 'minhaFuncao', null, 1, 1);
            const funcao = new FuncaoConstruto(-1, 1, [], []);
            const funcaoDecl = new FuncaoDeclaracao(simboloFunc, funcao);
            
            tradutor.traduzirDeclaracaoFuncao(funcaoDecl);
            
            expect(tradutor.text).toContain('minhaFuncao:');
            expect(tradutor.text).toContain('push {fp, lr}');
            expect(tradutor.text).toContain('mov fp, sp');
            expect(tradutor.text).toContain('pop {fp, pc}');
        });

        it('deve traduzir função com corpo', () => {
            const simboloFunc = new Simbolo('IDENTIFICADOR', 'somar', null, 1, 1);
            const retorno = new Retorna({} as SimboloInterface, new Literal(-1, 1, 42));
            const funcao = new FuncaoConstruto(-1, 1, [], [retorno]);
            const funcaoDecl = new FuncaoDeclaracao(simboloFunc, funcao);
            
            tradutor.traduzirDeclaracaoFuncao(funcaoDecl);
            
            expect(tradutor.text).toContain('somar:');
            expect(tradutor.text).toContain('ldr r0, =42');
        });
    });

    describe('Declarações - Retorna', () => {
        it('deve traduzir retorno sem valor', () => {
            const retorna = new Retorna({} as SimboloInterface, new Literal(-1, 1, null));
            
            tradutor.traduzirDeclaracaoRetorna(retorna);
            
            expect(tradutor.text).toContain('mov sp, fp');
            expect(tradutor.text).toContain('pop {fp, pc}');
        });

        it('deve traduzir retorno com valor', () => {
            const valor = new Literal(-1, 1, 100);
            const retorna = new Retorna({} as SimboloInterface, valor);
            
            tradutor.traduzirDeclaracaoRetorna(retorna);
            
            expect(tradutor.text).toContain('ldr r0, =100');
            expect(tradutor.text).toContain('pop {fp, pc}');
        });
    });

    describe('Declarações - Bloco', () => {
        it('deve traduzir bloco vazio', () => {
            const bloco = new Bloco(1, 1, []);
            tradutor.traduzirDeclaracaoBloco(bloco);
            // Não deve adicionar nada ao texto além da estrutura inicial
        });

        it('deve traduzir bloco com declarações', () => {
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
            // A expressão deve ser avaliada mas não necessariamente gerar código específico
        });
    });

    describe('Tradução Completa', () => {
        it('deve traduzir programa simples completo', () => {
            const simboloVar = new Simbolo('IDENTIFICADOR', 'x', null, 1, 1);
            const varDecl = new Var(simboloVar, new Literal(-1, 1, 42));
            const escreva = new Escreva(1, 1, [new Literal(-1, 1, 'Hello')]);
            
            const declaracoes = [varDecl, escreva];
            const resultado = tradutor.traduzir(declaracoes);
            
            expect(resultado).toContain('.bss');
            expect(resultado).toContain('.data');
            expect(resultado).toContain('.text');
            expect(resultado).toContain('_start:');
            expect(resultado).toContain('mov r7, #1');
            expect(resultado).toContain('swi 0');
        });

        it('deve incluir saída do sistema no final', () => {
            const declaracoes: Declaracao[] = [];
            const resultado = tradutor.traduzir(declaracoes);
            
            expect(resultado).toContain('mov r0, #1');
            expect(resultado).toContain('mov r7, #1');
            expect(resultado).toContain('swi 0');
        });
    });

    describe('Casos de Edge', () => {
        it('deve lidar com variável sem símbolo', () => {
            const varSemSimbolo = new Variavel(1, null as any);
            const resultado = tradutor.traduzirConstrutoVariavel(varSemSimbolo);
            expect(resultado).toBe('unknown');
        });

        it('deve lidar com atribuição sem nome de variável', () => {
            const atribuir = new Atribuir(1, null as any, new Literal(-1, 1, 10));
            tradutor.traduzirConstrutoAtribuir(atribuir);
            // Não deve gerar erro
        });

        it('deve lidar com operador binário não implementado', () => {
            const esquerda = new Literal(-1, 1, 5);
            const direita = new Literal(-1, 1, 3);
            const simbolo = new Simbolo('**', '**', null, 1, 1);
            const binario = new Binario(1, esquerda, simbolo, direita);
            
            tradutor.traduzirConstrutoBinario(binario);
            expect(tradutor.text).toContain('@ Operador ** não implementado');
        });
    });
});