import { TradutorReversoPython } from '../../fontes/tradutores/tradutor-reverso-python';

describe('Tradutor Reverso Python -> Delégua', () => {
    const tradutor: TradutorReversoPython = new TradutorReversoPython();

    describe('Funções embutidas', () => {
        it('print -> escreva', () => {
            const resultado = tradutor.traduzir(`print('Oi')`);
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
        });

        it('input -> leia com atribuição', () => {
            const resultado = tradutor.traduzir("a = input('Alguma coisa: ')\nprint(a)\n");
            expect(resultado).toMatch(/var a = leia\('Alguma coisa: '\)/i);
            expect(resultado).toMatch(/escreva\(a\)/i);
        });
    });

    describe('Literais', () => {
        it('True -> verdadeiro', () => {
            const resultado = tradutor.traduzir('a = True');
            expect(resultado).toBe('var a = verdadeiro');
        });

        it('False -> falso', () => {
            const resultado = tradutor.traduzir('a = False');
            expect(resultado).toBe('var a = falso');
        });

        it('None -> nulo', () => {
            const resultado = tradutor.traduzir('a = None');
            expect(resultado).toBe('var a = nulo');
        });

        it('número inteiro passa direto', () => {
            const resultado = tradutor.traduzir('a = 42');
            expect(resultado).toBe('var a = 42');
        });

        it('número real passa direto', () => {
            const resultado = tradutor.traduzir('a = 3.14');
            expect(resultado).toBe('var a = 3.14');
        });

        it('string passa direto', () => {
            const resultado = tradutor.traduzir(`a = 'ola'`);
            expect(resultado).toBe(`var a = 'ola'`);
        });
    });

    describe('Atribuição de variáveis', () => {
        it('atribuição simples gera var', () => {
            const resultado = tradutor.traduzir('a = 5');
            expect(resultado).toBe('var a = 5');
        });

        it('múltiplas atribuições em linhas separadas', () => {
            const resultado = tradutor.traduzir('a = 1\nb = 2');
            expect(resultado).toBe('var a = 1\nvar b = 2');
        });
    });

    describe('Operadores aritméticos', () => {
        it('adição', () => {
            const resultado = tradutor.traduzir('a = 1 + 2');
            expect(resultado).toBe('var a = 1 + 2');
        });

        it('subtração', () => {
            const resultado = tradutor.traduzir('a = 5 - 3');
            expect(resultado).toBe('var a = 5 - 3');
        });

        it('multiplicação', () => {
            const resultado = tradutor.traduzir('a = 3 * 4');
            expect(resultado).toBe('var a = 3 * 4');
        });

        it('divisão', () => {
            const resultado = tradutor.traduzir('a = 10 / 2');
            expect(resultado).toBe('var a = 10 / 2');
        });

        it('módulo', () => {
            const resultado = tradutor.traduzir('a = 10 % 3');
            expect(resultado).toBe('var a = 10 % 3');
        });

        it('potência (**)', () => {
            const resultado = tradutor.traduzir('a = 2 ** 3');
            expect(resultado).toBe('var a = 2 ** 3');
        });

        it('divisão inteira (//)', () => {
            const resultado = tradutor.traduzir('a = 10 // 3');
            expect(resultado).toBe('var a = 10 // 3');
        });

        it('negação unária', () => {
            const resultado = tradutor.traduzir('a = -5');
            expect(resultado).toBe('var a = -5');
        });

        it('expressão aritmética composta', () => {
            const resultado = tradutor.traduzir('a = 1 + 2 * 3');
            expect(resultado).toBe('var a = 1 + 2 * 3');
        });
    });

    describe('Operadores de comparação', () => {
        it('maior que (>)', () => {
            const resultado = tradutor.traduzir('resultado = a > b');
            expect(resultado).toBe('var resultado = a > b');
        });

        it('menor que (<)', () => {
            const resultado = tradutor.traduzir('resultado = a < b');
            expect(resultado).toBe('var resultado = a < b');
        });

        it('igual (==)', () => {
            const resultado = tradutor.traduzir('resultado = a == b');
            expect(resultado).toBe('var resultado = a == b');
        });

        it('diferente (!=)', () => {
            const resultado = tradutor.traduzir('resultado = a != b');
            expect(resultado).toBe('var resultado = a != b');
        });

        it('maior ou igual (>=)', () => {
            const resultado = tradutor.traduzir('resultado = a >= b');
            expect(resultado).toBe('var resultado = a >= b');
        });

        it('menor ou igual (<=)', () => {
            const resultado = tradutor.traduzir('resultado = a <= b');
            expect(resultado).toBe('var resultado = a <= b');
        });
    });

    describe('Operadores lógicos', () => {
        it('and -> e', () => {
            const resultado = tradutor.traduzir('resultado = a and b');
            expect(resultado).toBe('var resultado = a e b');
        });

        it('or -> ou', () => {
            const resultado = tradutor.traduzir('resultado = a or b');
            expect(resultado).toBe('var resultado = a ou b');
        });

        it('not -> nao', () => {
            const resultado = tradutor.traduzir('resultado = not a');
            expect(resultado).toBe('var resultado = nao a');
        });

        it('expressão lógica composta', () => {
            const resultado = tradutor.traduzir('resultado = a and b or c');
            expect(resultado).toBe('var resultado = a e b ou c');
        });
    });

    describe('Funções globais built-in', () => {
        it('len -> tamanho', () => {
            const resultado = tradutor.traduzir('n = len(lista)');
            expect(resultado).toBe('var n = tamanho(lista)');
        });

        it('int -> inteiro', () => {
            const resultado = tradutor.traduzir('n = int(x)');
            expect(resultado).toBe('var n = inteiro(x)');
        });

        it('float -> real', () => {
            const resultado = tradutor.traduzir('n = float(x)');
            expect(resultado).toBe('var n = real(x)');
        });

        it('str -> texto', () => {
            const resultado = tradutor.traduzir('s = str(n)');
            expect(resultado).toBe('var s = texto(n)');
        });

        it('type -> tipoDe', () => {
            const resultado = tradutor.traduzir('t = type(x)');
            expect(resultado).toBe('var t = tipoDe(x)');
        });

        it('abs -> absoluto', () => {
            const resultado = tradutor.traduzir('n = abs(x)');
            expect(resultado).toBe('var n = absoluto(x)');
        });

        it('round -> arredondar', () => {
            const resultado = tradutor.traduzir('n = round(x)');
            expect(resultado).toBe('var n = arredondar(x)');
        });

        it('min -> minimo', () => {
            const resultado = tradutor.traduzir('n = min(a, b)');
            expect(resultado).toBe('var n = minimo(a, b)');
        });

        it('max -> maximo', () => {
            const resultado = tradutor.traduzir('n = max(a, b)');
            expect(resultado).toBe('var n = maximo(a, b)');
        });
    });

    describe('Métodos de lista / vetor', () => {
        it('append -> adicionar', () => {
            const resultado = tradutor.traduzir('lista.append(x)');
            expect(resultado).toBe('lista.adicionar(x)');
        });

        it('pop -> removerUltimo', () => {
            const resultado = tradutor.traduzir('lista.pop()');
            expect(resultado).toBe('lista.removerUltimo()');
        });

        it('reverse -> inverter', () => {
            const resultado = tradutor.traduzir('lista.reverse()');
            expect(resultado).toBe('lista.inverter()');
        });

        it('sort -> ordenar', () => {
            const resultado = tradutor.traduzir('lista.sort()');
            expect(resultado).toBe('lista.ordenar()');
        });

        it('clear -> limpar', () => {
            const resultado = tradutor.traduzir('lista.clear()');
            expect(resultado).toBe('lista.limpar()');
        });
    });

    describe('Métodos de texto / string', () => {
        it('upper -> maiusculo', () => {
            const resultado = tradutor.traduzir('s = nome.upper()');
            expect(resultado).toBe('var s = nome.maiusculo()');
        });

        it('lower -> minusculo', () => {
            const resultado = tradutor.traduzir('s = nome.lower()');
            expect(resultado).toBe('var s = nome.minusculo()');
        });

        it('strip -> aparar', () => {
            const resultado = tradutor.traduzir('s = texto.strip()');
            expect(resultado).toBe('var s = texto.aparar()');
        });

        it('split -> dividir', () => {
            const resultado = tradutor.traduzir(`partes = frase.split(' ')`);
            expect(resultado).toBe(`var partes = frase.dividir(' ')`);
        });

        it('join inverte receptor e argumento', () => {
            const resultado = tradutor.traduzir(`s = ', '.join(lista)`);
            expect(resultado).toBe(`var s = lista.juntar(', ')`);
        });

        it('startswith -> iniciaCom', () => {
            const resultado = tradutor.traduzir(`b = s.startswith('http')`);
            expect(resultado).toBe(`var b = s.iniciaCom('http')`);
        });

        it('endswith -> terminaCom', () => {
            const resultado = tradutor.traduzir(`b = s.endswith('.py')`);
            expect(resultado).toBe(`var b = s.terminaCom('.py')`);
        });

        it('replace -> substituir', () => {
            const resultado = tradutor.traduzir(`s = frase.replace('a', 'b')`);
            expect(resultado).toBe(`var s = frase.substituir('a', 'b')`);
        });
    });

    describe('Acesso a atributo e índice (fallback)', () => {
        it('acesso a atributo passa direto', () => {
            const resultado = tradutor.traduzir('n = obj.nome');
            expect(resultado).toBe('var n = obj.nome');
        });

        it('acesso a índice passa direto', () => {
            const resultado = tradutor.traduzir('x = lista[0]');
            expect(resultado).toBe('var x = lista[0]');
        });
    });

    describe('Atribuição composta (augmented assignment)', () => {
        it('+=', () => {
            const resultado = tradutor.traduzir('a += 1');
            expect(resultado).toBe('a += 1');
        });

        it('-=', () => {
            const resultado = tradutor.traduzir('a -= 1');
            expect(resultado).toBe('a -= 1');
        });

        it('*=', () => {
            const resultado = tradutor.traduzir('a *= 2');
            expect(resultado).toBe('a *= 2');
        });

        it('/=', () => {
            const resultado = tradutor.traduzir('a /= 2');
            expect(resultado).toBe('a /= 2');
        });

        it('%=', () => {
            const resultado = tradutor.traduzir('a %= 3');
            expect(resultado).toBe('a %= 3');
        });
    });

    describe('Controle de fluxo — se', () => {
        it('if simples', () => {
            const codigo = `if a > 0:\n    print(a)\n`;
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('se (a > 0) {\n    escreva(a)\n}');
        });

        it('if / else', () => {
            const codigo = `if a > 0:\n    print('positivo')\nelse:\n    print('negativo')\n`;
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe(
                `se (a > 0) {\n    escreva('positivo')\n} senão {\n    escreva('negativo')\n}`
            );
        });

        it('if / elif / else', () => {
            const codigo = `if a > 0:\n    print('positivo')\nelif a == 0:\n    print('zero')\nelse:\n    print('negativo')\n`;
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe(
                `se (a > 0) {\n    escreva('positivo')\n} senão se (a == 0) {\n    escreva('zero')\n} senão {\n    escreva('negativo')\n}`
            );
        });

        it('if com condição lógica', () => {
            const codigo = `if a > 0 and b > 0:\n    print(a)\n`;
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('se (a > 0 e b > 0) {\n    escreva(a)\n}');
        });
    });

    describe('Controle de fluxo — enquanto', () => {
        it('while simples', () => {
            const codigo = `while i < 10:\n    i += 1\n`;
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('enquanto (i < 10) {\n    i += 1\n}');
        });

        it('while com break', () => {
            const codigo = `while verdadeiro:\n    break\n`;
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toMatch(/enquanto \(verdadeiro\)/);
            expect(resultado).toMatch(/sustar/);
        });

        it('while com continue', () => {
            const codigo = `while i < 10:\n    i += 1\n    continue\n`;
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toMatch(/enquanto \(i < 10\)/);
            expect(resultado).toMatch(/continua/);
        });
    });

    describe('Controle de fluxo — para cada', () => {
        it('for...in lista literal', () => {
            const codigo = `for item in lista:\n    print(item)\n`;
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('para cada item em lista {\n    escreva(item)\n}');
        });

        it('for...in com range', () => {
            const codigo = `for i in range(10):\n    print(i)\n`;
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('para cada i em intervalo(10) {\n    escreva(i)\n}');
        });

        it('for...in com break', () => {
            const codigo = `for item in lista:\n    break\n`;
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toMatch(/para cada item em lista/);
            expect(resultado).toMatch(/sustar/);
        });
    });

    describe('Controle de fluxo — retorna', () => {
        it('return com valor', () => {
            const resultado = tradutor.traduzir('return x\n');
            expect(resultado).toBe('retorna x');
        });

        it('return sem valor', () => {
            const resultado = tradutor.traduzir('return\n');
            expect(resultado).toBe('retorna');
        });
    });

    describe('Funções', () => {
        it('função sem parâmetros', () => {
            const codigo = 'def ola():\n    print("Ola")\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('funcao ola() {\n    escreva("Ola")\n}');
        });

        it('função com parâmetros simples', () => {
            const codigo = 'def soma(a, b):\n    return a + b\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('funcao soma(a, b) {\n    retorna a + b\n}');
        });

        it('função com parâmetro de valor padrão', () => {
            const codigo = "def saudar(nome, saudacao='Ola'):\n    print(saudacao)\n";
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe("funcao saudar(nome, saudacao = 'Ola') {\n    escreva(saudacao)\n}");
        });

        it('função com múltiplos valores padrão', () => {
            const codigo = 'def f(a, b=1, c=2):\n    return a + b + c\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('funcao f(a, b = 1, c = 2) {\n    retorna a + b + c\n}');
        });

        it('função com corpo de múltiplas linhas', () => {
            const codigo = 'def dobro(n):\n    resultado = n * 2\n    return resultado\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('funcao dobro(n) {\n    var resultado = n * 2\n    retorna resultado\n}');
        });

        it('duas funções no mesmo arquivo', () => {
            const codigo = 'def soma(a, b):\n    return a + b\ndef sub(a, b):\n    return a - b\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe(
                'funcao soma(a, b) {\n    retorna a + b\n}\nfuncao sub(a, b) {\n    retorna a - b\n}'
            );
        });
    });

    describe('Classes', () => {
        it('classe vazia', () => {
            const codigo = 'class Vazia:\n    pass\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toMatch(/^classe Vazia \{/);
        });

        it('classe com construtor (__init__)', () => {
            const codigo = 'class Animal:\n    def __init__(self, nome):\n        self.nome = nome\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe(
                'classe Animal {\n    construtor(nome) {\n        isto.nome = nome\n    }\n}'
            );
        });

        it('self → isto em atribuição de atributo', () => {
            const codigo = 'class A:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toMatch(/isto\.x = x/);
            expect(resultado).toMatch(/isto\.y = y/);
        });

        it('self → isto em chamada de método', () => {
            const codigo = 'class A:\n    def falar(self):\n        print(self.nome)\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toMatch(/escreva\(isto\.nome\)/);
        });

        it('self removido dos parâmetros', () => {
            const codigo = 'class A:\n    def metodo(self, a, b):\n        return a + b\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toMatch(/funcao metodo\(a, b\)/);
        });

        it('classe com herança simples', () => {
            const codigo = 'class Cachorro(Animal):\n    def latir(self):\n        print("Au")\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toMatch(/^classe Cachorro herda Animal \{/);
            expect(resultado).toMatch(/funcao latir\(\)/);
        });

        it('classe com construtor e método', () => {
            const codigo =
                'class Contador:\n    def __init__(self):\n        self.n = 0\n    def incrementar(self):\n        self.n += 1\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toMatch(/construtor\(\)/);
            expect(resultado).toMatch(/funcao incrementar\(\)/);
            expect(resultado).toMatch(/isto\.n = 0/);
            expect(resultado).toMatch(/isto\.n \+= 1/);
        });
    });

    describe('Estruturas aninhadas', () => {
        it('if dentro de while', () => {
            const codigo = `while i < 10:\n    if i == 5:\n        break\n    i += 1\n`;
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toMatch(/enquanto \(i < 10\)/);
            expect(resultado).toMatch(/se \(i == 5\)/);
            expect(resultado).toMatch(/sustar/);
        });
    });

    describe('Estruturas de dados — listas', () => {
        it('lista vazia', () => {
            const resultado = tradutor.traduzir('a = []');
            expect(resultado).toBe('var a = []');
        });

        it('lista com inteiros', () => {
            const resultado = tradutor.traduzir('a = [1, 2, 3]');
            expect(resultado).toBe('var a = [1, 2, 3]');
        });

        it('lista com strings', () => {
            const resultado = tradutor.traduzir(`a = ['x', 'y', 'z']`);
            expect(resultado).toBe(`var a = ['x', 'y', 'z']`);
        });

        it('lista com expressões', () => {
            const resultado = tradutor.traduzir('a = [x + 1, y * 2]');
            expect(resultado).toBe('var a = [x + 1, y * 2]');
        });

        it('acesso a índice', () => {
            const resultado = tradutor.traduzir('x = lista[0]');
            expect(resultado).toBe('var x = lista[0]');
        });

        it('atribuição a índice não usa var', () => {
            const resultado = tradutor.traduzir('lista[0] = 99');
            expect(resultado).toBe('lista[0] = 99');
        });

        it('fatia inicio:fim → inicio..fim', () => {
            const resultado = tradutor.traduzir('s = texto[1:3]');
            expect(resultado).toBe('var s = texto[1..3]');
        });

        it('fatia desde o início :fim → ..fim', () => {
            const resultado = tradutor.traduzir('s = texto[:3]');
            expect(resultado).toBe('var s = texto[..3]');
        });

        it('fatia até o fim inicio: → inicio..', () => {
            const resultado = tradutor.traduzir('s = texto[2:]');
            expect(resultado).toBe('var s = texto[2..]');
        });
    });

    describe('Estruturas de dados — dicionários', () => {
        it('dicionário vazio', () => {
            const resultado = tradutor.traduzir('d = {}');
            expect(resultado).toBe('var d = {}');
        });

        it('dicionário com um par', () => {
            const resultado = tradutor.traduzir(`d = {'a': 1}`);
            expect(resultado).toBe(`var d = {'a': 1}`);
        });

        it('dicionário com múltiplos pares', () => {
            const resultado = tradutor.traduzir(`d = {'x': 1, 'y': 2}`);
            expect(resultado).toBe(`var d = {'x': 1, 'y': 2}`);
        });

        it('acesso a chave de dicionário', () => {
            const resultado = tradutor.traduzir(`v = d['chave']`);
            expect(resultado).toBe(`var v = d['chave']`);
        });
    });

    describe('Tratamento de erros — tente/pegue/finalmente', () => {
        it('try/except básico → tente/pegue', () => {
            const codigo = 'try:\n    x = 1\nexcept:\n    x = 0\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('tente {\n    var x = 1\n} pegue {\n    var x = 0\n}');
        });

        it('try/except com alias (as e) → pegue (e)', () => {
            const codigo = 'try:\n    x = 1\nexcept Exception as e:\n    print(e)\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('tente {\n    var x = 1\n} pegue (e) {\n    escreva(e)\n}');
        });

        it('try/except com tipo mas sem alias → pegue', () => {
            const codigo = 'try:\n    x = 1\nexcept ValueError:\n    x = 0\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('tente {\n    var x = 1\n} pegue {\n    var x = 0\n}');
        });

        it('try/finally sem except → tente/finalmente', () => {
            const codigo = 'try:\n    x = 1\nfinally:\n    print("fim")\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe('tente {\n    var x = 1\n} finalmente {\n    escreva("fim")\n}');
        });

        it('try/except/finally → tente/pegue/finalmente', () => {
            const codigo = 'try:\n    x = 1\nexcept:\n    x = 0\nfinally:\n    print("fim")\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBe(
                'tente {\n    var x = 1\n} pegue {\n    var x = 0\n} finalmente {\n    escreva("fim")\n}'
            );
        });

        it('múltiplos except → corpo mesclado num único pegue', () => {
            const codigo =
                'try:\n    x = 1\nexcept ValueError:\n    x = 0\nexcept TypeError:\n    x = -1\n';
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toMatch(/tente \{/);
            expect(resultado).toMatch(/pegue \{/);
            expect(resultado).toMatch(/var x = 0/);
            expect(resultado).toMatch(/var x = -1/);
        });

        it('raise com expressão → levante', () => {
            const resultado = tradutor.traduzir('raise ValueError("msg")\n');
            expect(resultado).toBe('levante ValueError("msg")');
        });

        it('raise bare → levante', () => {
            const resultado = tradutor.traduzir('raise\n');
            expect(resultado).toBe('levante');
        });
    });

    describe('Lambda', () => {
        it('lambda sem parâmetros', () => {
            const resultado = tradutor.traduzir('f = lambda: 42');
            expect(resultado).toBe('var f = funcao() { retorna 42 }');
        });

        it('lambda com um parâmetro', () => {
            const resultado = tradutor.traduzir('f = lambda x: x * 2');
            expect(resultado).toBe('var f = funcao(x) { retorna x * 2 }');
        });

        it('lambda com dois parâmetros', () => {
            const resultado = tradutor.traduzir('f = lambda x, y: x + y');
            expect(resultado).toBe('var f = funcao(x, y) { retorna x + y }');
        });

        it('lambda com valor padrão', () => {
            const resultado = tradutor.traduzir('f = lambda x, y=10: x + y');
            expect(resultado).toBe('var f = funcao(x, y = 10) { retorna x + y }');
        });

        it('lambda passada para função', () => {
            const resultado = tradutor.traduzir('r = sorted(lista, key=lambda x: x)\n');
            expect(resultado).toMatch(/funcao\(x\) \{ retorna x \}/);
        });
    });

    describe('Compreensão de lista', () => {
        it('compreensão simples → mapear', () => {
            const resultado = tradutor.traduzir('r = [x * 2 for x in lista]');
            expect(resultado).toBe('var r = lista.mapear(funcao(x) { retorna x * 2 })');
        });

        it('compreensão com identidade → mapear', () => {
            const resultado = tradutor.traduzir('r = [x for x in lista]');
            expect(resultado).toBe('var r = lista.mapear(funcao(x) { retorna x })');
        });

        it('compreensão com filtro → filtrarPor + mapear', () => {
            const resultado = tradutor.traduzir('r = [x for x in lista if x > 0]');
            expect(resultado).toBe(
                'var r = filtrarPor(lista, funcao(x) { retorna x > 0 }).mapear(funcao(x) { retorna x })'
            );
        });

        it('compreensão com transformação e filtro', () => {
            const resultado = tradutor.traduzir('r = [x * 2 for x in lista if x > 0]');
            expect(resultado).toBe(
                'var r = filtrarPor(lista, funcao(x) { retorna x > 0 }).mapear(funcao(x) { retorna x * 2 })'
            );
        });
    });

    describe('F-strings', () => {
        it('f-string com aspas duplas passa direto', () => {
            const resultado = tradutor.traduzir(`a = f"Olá {nome}"`);
            expect(resultado).toBe(`var a = f"Olá {nome}"`);
        });

        it('f-string com aspas simples passa direto', () => {
            const resultado = tradutor.traduzir(`a = f'Olá {nome}'`);
            expect(resultado).toBe(`var a = f'Olá {nome}'`);
        });
    });

    describe('Estruturas de dados — tuplas', () => {
        it('tupla com dois elementos → vetor', () => {
            const resultado = tradutor.traduzir('t = (1, 2)');
            expect(resultado).toBe('var t = [1, 2]');
        });

        it('tupla com três elementos → vetor', () => {
            const resultado = tradutor.traduzir('t = (1, 2, 3)');
            expect(resultado).toBe('var t = [1, 2, 3]');
        });

        it('expressão entre parênteses (não é tupla) mantém parênteses', () => {
            const resultado = tradutor.traduzir('a = (x + 1)');
            expect(resultado).toBe('var a = (x + 1)');
        });
    });
});
