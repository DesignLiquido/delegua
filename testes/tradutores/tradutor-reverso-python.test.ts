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
});
