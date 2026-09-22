import { TradutorReversoTenda } from '../../fontes/tradutores/tradutor-reverso-tenda';
import { LexadorTenda } from '../../fontes/lexador';
import { AvaliadorSintaticoTenda } from '../../fontes/avaliador-sintatico';
import {
    Agrupamento,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    ArgumentoReferenciaFuncao,
    Atribuir,
    Binario,
    Chamada,
    DefinirValor,
    Isto,
    Literal,
    Logico,
    ReferenciaFuncao,
    TipoDe,
    Unario,
    Variavel,
    Vetor,
} from '../../fontes/construtos';
import {
    Bloco,
    BlocoPegue,
    Classe,
    Comentario,
    Const,
    Escreva,
    Expressao,
    FuncaoDeclaracao,
    Retorna,
    Tente,
    Var,
} from '../../fontes/declaracoes';
import { Simbolo } from '../../fontes/lexador/simbolo';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/tenda';
import { FuncaoConstruto } from '../../fontes/construtos';

describe('Tradutor Tenda -> Delégua', () => {
    let lexador: LexadorTenda;
    let avaliadorSintatico: AvaliadorSintaticoTenda;
    const tradutor: TradutorReversoTenda = new TradutorReversoTenda();

    beforeEach(() => {
        lexador = new LexadorTenda();
        avaliadorSintatico = new AvaliadorSintaticoTenda();
    });

    it('exiba -> escreva', async () => {
        const codigo = `exiba("Oi")`;

        const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/escreva\("Oi"\)/i);
    });

    describe('Bibliotecas globais', () => {
        it('Data', async () => {
            const codigo = [
                'exiba(Data.agora())',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it('Lista', async () => {
            const codigo = [
                'seja listaQualquer = [2, 4, 6, 8, 10]',
                'exiba(Lista.tamanho(listaQualquer))',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it('Matemática', async () => {
            const codigo = [
                'exiba(Matemática.aleatório(1, 100))'
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it('Saída', async () => {
            const codigo = [
                'exiba(Saída.exiba("Olá mundo!"))'
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it('Texto', async () => {
            const codigo = [
                'exiba(Texto.tamanho("Olá mundo!"))'
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });
    });

    it('dicionário', async () => {
        const codigo = [
            'seja dicionário = { "nome": "Tenda", "versão": 1.0 }',
            'seja nome = dicionário["nome"]',
            'seja versão = dicionário.versão',
            'exiba("Nome: " + nome + ", Versão: " + versão)',
        ];

        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/var dicionário = {"nome":"Tenda","versão":1,}/i);
        expect(resultado).toMatch(/var nome = dicionário\["nome"\]/i);
        expect(resultado).toMatch(/var versão = dicionário.versão/i);
        expect(resultado).toMatch(/escreva\("Nome: " \+ nome \+ ", Versão: " \+ versão\)/i);
    });

    it('enquanto', async () => {
        const codigo = [
            'seja contador = 1',
            'enquanto contador <= 5 faça',
            '    exiba("Contador: " + contador)',
            '    contador = contador + 1',
            'fim'
        ];

        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/var contador = 1/i);
        expect(resultado).toMatch(/enquanto \(contador <= 5\) {/i);
        expect(resultado).toMatch(/escreva\("Contador: " \+ contador\)/i);
        expect(resultado).toMatch(/contador = contador \+ 1/i);
        expect(resultado).toMatch(/}/i);
    });

    describe('Funções', () => {
        it('Função implícita, com parênteses e retorno na mesma linha', async () => {
            const codigo = [
                'seja soma(a, b) = a + b'
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/função soma\(a, b\) \{/i);
            expect(resultado).toMatch(/retorna a \+ b/i);
        });

        it('Função estruturada, com bloco', async () => {
            const codigo = [
                'seja soma(lista) =',
                '  faça',
                '    seja total = 0',
                '    para cada i em lista faça',
                '      total = total + i',
                '    fim',
                '    retorna total',
                '  fim',
                'exiba(soma([1, 3, 5, 7, 9]))'
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/função soma\(lista\) \{/i);
            expect(resultado).toMatch(/var total = 0/i);
            expect(resultado).toMatch(/para cada i em lista {/i);
            expect(resultado).toMatch(/total = total \+ i/i);
            expect(resultado).toMatch(/retorna total/i);
            expect(resultado).toMatch(/escreva\(soma\(\[1, 3, 5, 7, 9\]\)\)/i);
        });

        it('Função anônima, usando palavra reservada `função`', async () => {
            const codigo = [
                'seja soma = função(a, b) -> a + b',
                'seja resultado = soma(10, 5)',
                'exiba("A soma é: " + resultado)'
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var soma = função\(a, b\) \{/i);
            expect(resultado).toMatch(/retorna a \+ b/i);
            expect(resultado).toMatch(/escreva\("A soma é: " \+ resultado\)/i);
        });
    });

    it('leia -> leia', async () => {
        const codigo = `leia("Digite sua idade: ")`;

        const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/leia\(\"Digite sua idade: \"\)/i);
    });

    it('operações de comparação', async () => {
        const codigo = [
            'seja a = 10',
            'seja b = 5',
            'seja maior = a > b',
            'seja menor = a < b',
            'seja maior_ou_igual = a >= b',
            'seja menor_ou_igual = a <= b',
            'seja igual = a é b',
            'seja diferente = a não é b',
            'seja negado = não a',
        ];
        
        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/var a = 10/i);
        expect(resultado).toMatch(/var b = 5/i);
        expect(resultado).toMatch(/var maior = a > b/i);
        expect(resultado).toMatch(/var menor = a < b/i);
        expect(resultado).toMatch(/var maior_ou_igual = a >= b/i);
        expect(resultado).toMatch(/var menor_ou_igual = a <= b/i);
        expect(resultado).toMatch(/var igual = a == b/i);
        expect(resultado).toMatch(/var diferente = a != b/i);
        expect(resultado).toMatch(/var negado = !a/i);
    });

    it('operações de concatenação', async () => {
        const codigo = [
            'seja texto1 = "Olá"',
            'seja texto2 = "Mundo"',
            'seja texto_concatenado = texto1 + " " + texto2',
            'seja lista1 = [1, 2, 3]',
            'seja lista2 = [4, 5, 6]',
            'seja lista_concatenada = lista1 + lista2'
        ];
        
        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/var texto1 = \"Olá\"/i);
        expect(resultado).toMatch(/var texto2 = \"Mundo\"/i);
        expect(resultado).toMatch(/var texto_concatenado = texto1 \+ \" \" \+ texto2/i);
        expect(resultado).toMatch(/var lista1 = \[1, 2, 3\]/i);
        expect(resultado).toMatch(/var lista2 = \[4, 5, 6\]/i);
        expect(resultado).toMatch(/var lista_concatenada = lista1 \+ lista2/i);
    });

    it('operações matemáticas', async () => {
        const codigo = [
            "seja a = 10",
            "seja b = 5",
            "seja soma = a + b",
            "seja subtração = a - b",
            "seja multiplicação = a * b",
            "seja divisão = a / b",
            "seja resto = a % b",
            "seja potência = a ^ b",
            "seja negativo = -a",
        ];
        
        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/var a = 10/i);
        expect(resultado).toMatch(/var b = 5/i);
        expect(resultado).toMatch(/var soma = a \+ b/i);
        expect(resultado).toMatch(/var subtração = a - b/i);
        expect(resultado).toMatch(/var multiplicação = a \* b/i);
        expect(resultado).toMatch(/var divisão = a \/ b/i);
        expect(resultado).toMatch(/var resto = a % b/i);
        expect(resultado).toMatch(/var potência = a \^ b/i);
        expect(resultado).toMatch(/var negativo = -a/i);
    });

    it('seja -> var', async () => {
        const codigo = `seja nome = "Tenda"
        seja idade = 10
        seja lista = [1, 2, 3, 4, 5]
        `;

        const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/var nome = \"Tenda\"/i);
        expect(resultado).toMatch(/var idade = 10/i);
        expect(resultado).toMatch(/var lista = \[1, 2, 3, 4, 5\]/i);
    });

    it('para cada, iterando variável de controle', async () => {
        const codigo = [
            "seja total = 0",
            "para cada i em 1 até 10 faça",
            "    total = total + i",
            "fim",
            "exiba(total)",
        ];
        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/var total = 0/i);
        expect(resultado).toMatch(/para i = 1; i <= 10; i = i \+ 1 {/i);
        expect(resultado).toMatch(/total = total \+ i/i);
        expect(resultado).toMatch(/escreva\(total\)/i);
    });

    it('para cada, iterando lista de elementos', async () => {
        const codigo = [
            'seja total = 0',
            'para cada i em [1, 2, 3, 4, 5] faça',
            '    total = total + i',
            'fim',
            'exiba(total)'
        ];
        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/var total = 0/i);
        expect(resultado).toMatch(/para cada i em \[1, 2, 3, 4, 5\] \{/i);
        expect(resultado).toMatch(/total = total \+ i/i);
        expect(resultado).toMatch(/escreva\(total\)/i);
    });

    it('se senão', async () => {
        const codigo = `seja idade = 18
        se idade >= 18 então
            exiba("Você é maior de idade.")
        senão
            exiba("Você é menor de idade.")
        fim
        `;

        const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/var idade = 18/i);
        expect(resultado).toMatch(/se idade >= 18/i);
        expect(resultado).toMatch(/escreva\(\"Você é maior de idade.\"\)/i);
        expect(resultado).toMatch(/senão/i);
        expect(resultado).toMatch(/escreva\(\"Você é menor de idade.\"\)/i);
    });

    describe('Operadores bitwise e lógicos', () => {
        it('operador E lógico', async () => {
            const codigo = [
                'seja a = verdadeiro',
                'seja b = falso',
                'seja resultado = a e b',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('e');
        });

        it('operador OU lógico', async () => {
            const codigo = [
                'seja a = verdadeiro',
                'seja b = falso',
                'seja resultado = a ou b',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('ou');
        });

        it('operador de exponenciação (**)', async () => {
            const codigo = [
                'seja base = 2',
                'seja exp = 10',
                'seja resultado = base ** exp',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('**');
        });

        it('operador bit NOT (~) via traduzirSimboloOperador direto', () => {
            const simboloBitNot = new Simbolo(tiposDeSimbolos.BIT_NOT, '~', null, 1, -1);
            const resultado = tradutor.traduzirSimboloOperador(simboloBitNot);
            expect(resultado).toBe('~');
        });

        it('operador bit AND (&) via traduzirSimboloOperador direto', () => {
            const simboloBitAnd = new Simbolo(tiposDeSimbolos.BIT_AND, '&', null, 1, -1);
            const resultado = tradutor.traduzirSimboloOperador(simboloBitAnd);
            expect(resultado).toBe('&');
        });

        it('operador bit OR (|) via traduzirSimboloOperador direto', () => {
            const simboloBitOr = new Simbolo(tiposDeSimbolos.BIT_OR, '|', null, 1, -1);
            const resultado = tradutor.traduzirSimboloOperador(simboloBitOr);
            expect(resultado).toBe('|');
        });

        it('operador de atribuição (=) via traduzirSimboloOperador direto', () => {
            const simboloIgual = new Simbolo(tiposDeSimbolos.IGUAL, '=', null, 1, -1);
            const resultado = tradutor.traduzirSimboloOperador(simboloIgual);
            expect(resultado).toBe('=');
        });
    });

    describe('Vetor vazio', () => {
        it('traduz vetor vazio como []', async () => {
            const codigo = [
                'seja lista = []',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('[]');
        });
    });

    describe('continua e sustar', () => {
        it('continua dentro de enquanto', async () => {
            const codigo = [
                'seja i = 0',
                'enquanto i < 10 faça',
                '    i = i + 1',
                '    continua',
                'fim',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('continue');
        });

        it('sustar dentro de enquanto', async () => {
            const codigo = [
                'seja i = 0',
                'enquanto i < 10 faça',
                '    se i é 5 então',
                '        sustar',
                '    fim',
                '    i = i + 1',
                'fim',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('break');
        });
    });

    describe('Agrupamento', () => {
        it('traduz expressão agrupada com parênteses', async () => {
            const codigo = [
                'seja resultado = (2 + 3) * 4',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('2 + 3');
        });
    });

    describe('Métodos de vetor', () => {
        it('adicionar via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'adicionar');
            const argLiteral = new Literal(-1, 1, 42, 'número');
            const chamada = new Chamada(-1, acessoMetodo, [argLiteral]);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lista.push(42)');
        });

        it('empilhar via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'pilha', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'empilhar');
            const argLiteral = new Literal(-1, 1, 99, 'número');
            const chamada = new Chamada(-1, acessoMetodo, [argLiteral]);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('pilha.push(99)');
        });

        it('inclui via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'inclui');
            const argLiteral = new Literal(-1, 1, 3, 'número');
            const chamada = new Chamada(-1, acessoMetodo, [argLiteral]);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lista.includes(3)');
        });

        it('inverter via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'inverter');
            const chamada = new Chamada(-1, acessoMetodo, []);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lista.toReversed()');
        });

        it('juntar via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'juntar');
            const argSep = new Literal(-1, 1, ', ', 'texto');
            const chamada = new Chamada(-1, acessoMetodo, [argSep]);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('join(lista)');
        });

        it('maiusculo via AcessoMetodo direto', () => {
            const simboloTexto = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'nome', null, 1, -1);
            const varTexto = new Variavel(-1, simboloTexto, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varTexto, 'maiusculo');
            const chamada = new Chamada(-1, acessoMetodo, []);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('nome.toUpperCase()');
        });

        it('minusculo via AcessoMetodo direto', () => {
            const simboloTexto = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'nome', null, 1, -1);
            const varTexto = new Variavel(-1, simboloTexto, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varTexto, 'minusculo');
            const chamada = new Chamada(-1, acessoMetodo, []);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('nome.toLowerCase()');
        });

        it('ordenar via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'ordenar');
            const chamada = new Chamada(-1, acessoMetodo, []);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lista.sort()');
        });

        it('remover via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'remover');
            const argIdx = new Literal(-1, 1, 0, 'número');
            const chamada = new Chamada(-1, acessoMetodo, [argIdx]);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('delete lista[0]');
        });

        it('removerPrimeiro via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'removerPrimeiro');
            const chamada = new Chamada(-1, acessoMetodo, []);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lista.shift()');
        });

        it('removerUltimo via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'removerUltimo');
            const chamada = new Chamada(-1, acessoMetodo, []);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lista.pop()');
        });

        it('somar via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'numeros', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'somar');
            const chamada = new Chamada(-1, acessoMetodo, []);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('numeros.reduce((acumulador, valorAtual) => acumulador + valorAtual, 0)');
        });

        it('método desconhecido (default) via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'metodoCustom');
            const argLiteral = new Literal(-1, 1, 1, 'número');
            const chamada = new Chamada(-1, acessoMetodo, [argLiteral]);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lista.metodoCustom(1)');
        });
    });

    describe('Comentários', () => {
        it('comentário de uma linha via AST direto', () => {
            const comentario = new Comentario(-1, 1, 'Este é um comentário', false);
            const resultado = tradutor.traduzir([comentario]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('// Este é um comentário');
        });

        it('comentário multilinha via AST direto', () => {
            const comentario = new Comentario(-1, 1, ['Linha 1', 'Linha 2'], true);
            const resultado = tradutor.traduzir([comentario]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('/*');
            expect(resultado).toContain('*/');
            expect(resultado).toContain('Linha 1');
            expect(resultado).toContain('Linha 2');
        });
    });

    describe('Const', () => {
        it('const com inicializador via AST direto', () => {
            const simbolo = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'PI', null, 1, -1);
            const inicializador = new Literal(-1, 1, 3.14, 'número');
            const constDecl = new Const(simbolo, inicializador, 'número');
            const resultado = tradutor.traduzir([constDecl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('const PI = 3.14;');
        });

        it('const sem inicializador via AST direto', () => {
            const simbolo = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'X', null, 1, -1);
            const constDecl = new Const(simbolo, null, 'qualquer');
            const resultado = tradutor.traduzir([constDecl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('const X;');
        });
    });

    describe('Tente/Pegue/Finalmente', () => {
        it('tente com caminhoPegue como array via AST direto', () => {
            const simboloEscreva = new Simbolo(tiposDeSimbolos.EXIBA, 'exiba', null, 1, -1);
            const msgTente = new Literal(-1, 1, 'no tente', 'texto');
            const escrevaTente = new Escreva(1, -1, [msgTente]);
            const msgPegue = new Literal(-1, 2, 'no pegue', 'texto');
            const escrevaPegue = new BlocoPegue({} as any, {} as any, [new Escreva(2, -1, [msgPegue])]);
            const tente = new Tente(-1, 1, [escrevaTente], [escrevaPegue], null, null);

            const resultado = tradutor.traduzir([tente]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('try {');
            expect(resultado).toContain('catch {');
            expect(resultado).toContain('escreva("no tente")');
            expect(resultado).toContain('escreva("no pegue")');
        });

        it('tente com caminhoFinalmente via AST direto', () => {
            const msgTente = new Literal(-1, 1, 'tente', 'texto');
            const escrevaTente = new Escreva(1, -1, [msgTente]);
            const msgFinalmente = new Literal(-1, 3, 'finalmente', 'texto');
            const escravaFinalmente = new Escreva(3, -1, [msgFinalmente]);
            const tente = new Tente(-1, 1, [escrevaTente], null, null, [escravaFinalmente]);

            const resultado = tradutor.traduzir([tente]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('try {');
            expect(resultado).toContain('finally {');
            expect(resultado).toContain('escreva("finalmente")');
        });
    });

    describe('Lógico (e/ou) tradução', () => {
        it('traduz construto lógico direto via e', () => {
            const simboloE = new Simbolo(tiposDeSimbolos.E, 'e', null, 1, -1);
            const esquerda = new Literal(-1, 1, true, 'lógico');
            const direita = new Literal(-1, 1, false, 'lógico');
            const logico = new Logico(-1, esquerda, simboloE, direita);
            const decl = new Expressao(logico);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('e');
        });

        it('traduz construto lógico direto via ou', () => {
            const simboloOu = new Simbolo(tiposDeSimbolos.OU, 'ou', null, 1, -1);
            const esquerda = new Literal(-1, 1, true, 'lógico');
            const direita = new Literal(-1, 1, false, 'lógico');
            const logico = new Logico(-1, esquerda, simboloOu, direita);
            const decl = new Expressao(logico);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('ou');
        });
    });

    describe('Atribuição por índice', () => {
        it('atribuição por índice de vetor via parsing Tenda', async () => {
            const codigo = [
                'seja lista = [1, 2, 3]',
                'lista[0] = 10',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lista[0] = 10');
        });
    });

    describe('AcessoMetodoOuPropriedade com isto', () => {
        it('traduz this.propriedade via AST direto', () => {
            const symbolNome = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'nome', null, 1, -1);
            const isto = new Isto(-1, 1);
            const acessoMetodo = new AcessoMetodoOuPropriedade(-1, isto, symbolNome);
            const decl = new Expressao(acessoMetodo);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('this.nome');
        });
    });

    describe('DefinirValor com isto', () => {
        it('traduz this.prop = valor via AST direto', () => {
            const simboloNome = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'prop', null, 1, -1);
            const simboloValor = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'x', null, 1, -1);
            const isto = new Isto(-1, 1);
            const varValor = new Variavel(-1, simboloValor, 'qualquer');
            const definirValor = new DefinirValor(-1, 1, isto, simboloNome, varValor);
            const decl = new Expressao(definirValor);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('this.prop');
        });
    });

    describe('ReferenciaFuncao e ArgumentoReferenciaFuncao', () => {
        it('traduz ReferenciaFuncao via AST direto', () => {
            const simboloFuncao = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'minhaFuncao', null, 1, -1);
            const refFuncao = new ReferenciaFuncao(-1, 1, simboloFuncao, 'qualquer', 'id-123');
            const argLiteral = new Literal(-1, 1, 42, 'número');
            const chamada = new Chamada(-1, refFuncao, [argLiteral]);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('minhaFuncao(42)');
        });

        it('traduz ArgumentoReferenciaFuncao via AST direto', () => {
            const simboloFuncao = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'callback', null, 1, -1);
            const argRefFuncao = new ArgumentoReferenciaFuncao(-1, 1, simboloFuncao);
            const argLiteral = new Literal(-1, 1, 5, 'número');
            const chamada = new Chamada(-1, argRefFuncao, [argLiteral]);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('callback(5)');
        });
    });

    describe('TipoDe', () => {
        it('traduz tipode de variável via AST direto', () => {
            const simboloTipoDe = new Simbolo(tiposDeSimbolos.TIPO, 'tipo', null, 1, -1);
            const simboloVar = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'minhaVar', null, 1, -1);
            const varAlvo = new Variavel(-1, simboloVar, 'qualquer');
            const tipoDe = new TipoDe(-1, simboloTipoDe, varAlvo);
            const decl = new Expressao(tipoDe);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('typeof minhaVar');
        });

        it('traduz tipode de string literal via AST direto', () => {
            const simboloTipoDe = new Simbolo(tiposDeSimbolos.TIPO, 'tipo', null, 1, -1);
            // Passa uma string diretamente como valor
            const tipoDe = new TipoDe(-1, simboloTipoDe, 'texto' as any);
            const decl = new Expressao(tipoDe);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain("typeof 'texto'");
        });

        it('traduz tipode de valor falsy via AST direto', () => {
            const simboloTipoDe = new Simbolo(tiposDeSimbolos.TIPO, 'tipo', null, 1, -1);
            const tipoDe = new TipoDe(-1, simboloTipoDe, null);
            const decl = new Expressao(tipoDe);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('typeof');
        });
    });

    describe('Classe', () => {
        it('traduz classe simples via AST direto', () => {
            const simboloClasse = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'Animal', null, 1, -1);
            const simboloMetodo = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'falar', null, 2, -1);
            const msgLiteral = new Literal(-1, 2, 'Au', 'texto');
            const escreva = new Escreva(2, -1, [msgLiteral]);
            const funcaoConstruto = new FuncaoConstruto(-1, 2, [], [escreva], 'qualquer');
            const metodo = new FuncaoDeclaracao(simboloMetodo, funcaoConstruto, 'qualquer');
            const classe = new Classe(simboloClasse, [], [metodo]);

            const resultado = tradutor.traduzir([classe]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('export class Animal');
            expect(resultado).toContain('falar(');
        });

        it('traduz classe com herança via AST direto', () => {
            const simboloClasse = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'Cachorro', null, 1, -1);
            const simboloSuperClasse = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'Animal', null, 1, -1);
            const superClasseVar = new Variavel(-1, simboloSuperClasse, 'qualquer');
            const classe = new Classe(simboloClasse, [superClasseVar], []);

            const resultado = tradutor.traduzir([classe]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('export class Cachorro extends Animal');
        });
    });

    describe('Unário incremento/decremento', () => {
        it('traduz incremento de variável via parsing Tenda', async () => {
            const codigo = [
                'seja i = 0',
                'enquanto i < 5 faça',
                '    i = i + 1',
                'fim',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('i + 1');
        });
    });

    describe('Literais com interpolação', () => {
        it('traduz literal com interpolação de verdadeiro/falso/nulo', () => {
            const literalVerd = new Literal(-1, 1, 'O valor é ${verdadeiro}', 'texto');
            const decl = new Expressao(literalVerd);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('${true}');
        });
    });

    describe('AcessoMetodo com objeto não-variável (default case)', () => {
        it('traduz acesso a método em objeto não-variável via AST direto', () => {
            const simboloLiteral = new Simbolo(tiposDeSimbolos.TEXTO, '"texto"', 'texto', 1, -1);
            const litObj = new Literal(-1, 1, 'hello', 'texto');
            const acessoMetodo = new AcessoMetodo(-1, litObj, 'tamanho');
            const chamada = new Chamada(-1, acessoMetodo, []);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('tamanho');
        });
    });

    describe('Agrupamento via traduzirConstrutoAgrupamento', () => {
        it('traduz agrupamento com expressao interna', () => {
            const simboloOp = new Simbolo(tiposDeSimbolos.ADICAO, '+', null, 1, -1);
            const esquerda = new Literal(-1, 1, 2, 'número');
            const direita = new Literal(-1, 1, 3, 'número');
            const binario = new Binario(-1, esquerda, simboloOp, direita);
            const agrupamento = new Agrupamento(-1, 1, binario);
            const decl = new Expressao(agrupamento);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('2 + 3');
        });
    });

    describe('fatiar e mapear', () => {
        it('fatiar via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'fatiar');
            const arg0 = new Literal(-1, 1, 0, 'número');
            const arg1 = new Literal(-1, 1, 3, 'número');
            const chamada = new Chamada(-1, acessoMetodo, [arg0, arg1]);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lista.slice(');
        });

        it('mapear via AcessoMetodo direto', () => {
            const simboloLista = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const varLista = new Variavel(-1, simboloLista, 'qualquer');
            const acessoMetodo = new AcessoMetodo(-1, varLista, 'mapear');
            const argFuncao = new Literal(-1, 1, 'x', 'texto');
            const chamada = new Chamada(-1, acessoMetodo, [argFuncao]);
            const decl = new Expressao(chamada);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lista.map(');
        });
    });

    describe('Atribuição composta via AST direto', () => {
        it('traduz atribuição composta com operador e valor Binario', () => {
            const simboloVar = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'x', null, 1, -1);
            const simboloOp = new Simbolo(tiposDeSimbolos.ADICAO, '+=', null, 1, -1);
            const simboloAdd = new Simbolo(tiposDeSimbolos.ADICAO, '+', null, 1, -1);
            const alvo = new Variavel(-1, simboloVar, 'número');
            const esquerda = new Variavel(-1, simboloVar, 'número');
            const direita = new Literal(-1, 1, 5, 'número');
            const binarioAtribuicao = new Binario(-1, esquerda, simboloAdd, direita);
            const atribuicaoComposta = new Atribuir(-1, alvo, binarioAtribuicao, undefined, simboloOp);
            const decl = new Expressao(atribuicaoComposta);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('x');
        });
    });

    describe('Literais com interpolação de falso e nulo', () => {
        it('traduz literal com interpolação de falso', () => {
            const literalFalso = new Literal(-1, 1, 'O valor é ${falso}', 'texto');
            const decl = new Expressao(literalFalso);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('${false}');
        });

        it('traduz literal com interpolação de nulo', () => {
            const literalNulo = new Literal(-1, 1, 'O valor é ${nulo}', 'texto');
            const decl = new Expressao(literalNulo);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('${null}');
        });
    });

    describe('Bloco com construto direto (não declaração)', () => {
        it('traduz bloco com literal direto via AST', () => {
            const literalDireto = new Literal(-1, 1, 42, 'número');
            const bloco = new Bloco(1, -1, [literalDireto as any]);
            const resultado = tradutor.traduzirDeclaracaoBloco(bloco);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('42');
        });
    });

    describe('Classe com construtor', () => {
        it('traduz método construtor via AST direto', () => {
            const simboloClasse = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'Pessoa', null, 1, -1);
            const simboloConstrutor = new Simbolo(tiposDeSimbolos.CONSTRUTOR, 'construtor', null, 2, -1);
            const simboloParam = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'nome', null, 2, -1);
            const parametros = [{ nome: simboloParam, tipoDado: 'texto', abrangencia: 'padrao' as const }];
            const funcaoConstruto = new FuncaoConstruto(-1, 2, parametros, [], 'qualquer');
            const metodoConstrutor = new FuncaoDeclaracao(simboloConstrutor, funcaoConstruto, 'qualquer');
            const classe = new Classe(simboloClasse, [], [metodoConstrutor]);

            const resultado = tradutor.traduzir([classe]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('constructor(');
        });
    });

    describe('Tente com FuncaoConstruto no pegue', () => {
        it('traduz tente com pegue como FuncaoConstruto via AST direto', () => {
            const msgTente = new Literal(-1, 1, 'no tente', 'texto');
            const escrevaTente = new Escreva(1, -1, [msgTente]);
            const msgPegue = new Literal(-1, 2, 'no pegue', 'texto');
            const escrevaPegue = new Escreva(2, -1, [msgPegue]);
            const funcaoPegue = new BlocoPegue(
                {} as any, 
                {} as any, [escrevaPegue]
            );
            const tente = new Tente(-1, 1, [escrevaTente], [funcaoPegue], null, null);

            const resultado = tradutor.traduzir([tente]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('try {');
            expect(resultado).toContain('catch {');
            expect(resultado).toContain('escreva("no pegue")');
        });
    });

    describe('Const com inicializador declaração', () => {
        it('traduz const com inicializador que é FuncaoDeclaracao via AST direto', () => {
            const simbolo = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'fn', null, 1, -1);
            const simboloFuncao = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'fn', null, 1, -1);
            const funcaoConstruto = new FuncaoConstruto(-1, 1, [], [], 'qualquer');
            const funcaoDecl = new FuncaoDeclaracao(simboloFuncao, funcaoConstruto, 'qualquer');
            const constDecl = new Const(simbolo, funcaoDecl as any, 'função');
            const resultado = tradutor.traduzir([constDecl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('const fn');
        });
    });

    describe('Var com inicializador declaração', () => {
        it('traduz var com inicializador que é FuncaoDeclaracao via AST direto', () => {
            const simbolo = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'fn', null, 1, -1);
            const simboloFuncao = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'fn', null, 1, -1);
            const funcaoConstruto = new FuncaoConstruto(-1, 1, [], [], 'qualquer');
            const funcaoDecl = new FuncaoDeclaracao(simboloFuncao, funcaoConstruto, 'qualquer');
            const varDecl = new Var(simbolo, funcaoDecl as any, 'função');
            const resultado = tradutor.traduzir([varDecl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('var fn');
        });
    });

    describe('AtribuicaoPorIndice com Variavel como valor', () => {
        it('traduz atribuição por índice com variável como valor via AST direto', () => {
            const simboloObj = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'lista', null, 1, -1);
            const simboloVal = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'valor', null, 1, -1);
            const objeto = new Variavel(-1, simboloObj, 'qualquer');
            const indice = new Literal(-1, 1, 0, 'número');
            const valorVar = new Variavel(-1, simboloVal, 'qualquer');
            const { AtribuicaoPorIndice: AtribPorIndiceClass } = jest.requireActual('../../fontes/construtos');
            const atribuicao = new AtribPorIndiceClass(-1, 1, objeto, indice, valorVar);
            const decl = new Expressao(atribuicao);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lista[0] = valor');
        });
    });

    describe('TipoDe com valor numérico', () => {
        it('traduz tipode de número literal via AST direto', () => {
            const simboloTipoDe = new Simbolo(tiposDeSimbolos.TIPO, 'tipo', null, 1, -1);
            const tipoDe = new TipoDe(-1, simboloTipoDe, 42 as any);
            const decl = new Expressao(tipoDe);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('typeof 42');
        });
    });

    describe('Unário incremento/decremento direto', () => {
        it('traduz incremento via AST direto', () => {
            const simboloIncr = new Simbolo(tiposDeSimbolos.INCREMENTAR, '++', null, 1, -1);
            const simboloVar = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'i', null, 1, -1);
            const varI = new Variavel(-1, simboloVar, 'número');
            const unario = new Unario(-1, simboloIncr, varI, 'DEPOIS');
            const decl = new Expressao(unario);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('i++');
        });

        it('traduz decremento via AST direto', () => {
            const simboloDecr = new Simbolo(tiposDeSimbolos.DECREMENTAR, '--', null, 1, -1);
            const simboloVar = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'j', null, 1, -1);
            const varJ = new Variavel(-1, simboloVar, 'número');
            const unario = new Unario(-1, simboloDecr, varJ, 'DEPOIS');
            const decl = new Expressao(unario);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('j--');
        });
    });

    describe('Isto como construto direto', () => {
        it('traduz isto (this) via AST direto', () => {
            const isto = new Isto(-1, 1);
            const decl = new Expressao(isto);

            const resultado = tradutor.traduzir([decl]);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('this');
        });
    });
});
