import { TradutorPortugolIpt } from '../../fontes/tradutores';

describe('Tradutor Portugol IPT -> Delégua', () => {
    let tradutor: TradutorPortugolIpt;

    beforeEach(() => {
        tradutor = new TradutorPortugolIpt();
    });

    async function traduzir(linhas: string[]): Promise<string> {
        return tradutor.traduzir(linhas.join('\n'));
    }

    describe('Saída', () => {
        it('escrever texto literal -> escreva()', async () => {
            const resultado = await traduzir(['inicio', 'escrever "Olá Mundo"', 'fim']);
            expect(resultado).toMatch(/escreva\('Olá Mundo'\)/);
        });
    });

    describe('Declarações de variáveis', () => {
        it('inteiro simples', async () => {
            const resultado = await traduzir(['inicio', 'inteiro x', 'fim']);
            expect(resultado).toMatch(/var x: inteiro = 0/);
        });

        it('real simples', async () => {
            const resultado = await traduzir(['inicio', 'real y', 'fim']);
            expect(resultado).toMatch(/var y: real = 0/);
        });

        it('logico simples', async () => {
            const resultado = await traduzir(['inicio', 'logico b', 'fim']);
            expect(resultado).toMatch(/var b: logico = falso/);
        });

        it('caracter simples', async () => {
            const resultado = await traduzir(['inicio', 'caracter c', 'fim']);
            expect(resultado).toMatch(/var c: caracter/);
        });

        it('inteiro com valor inicial', async () => {
            const resultado = await traduzir(['inicio', 'inteiro x = 42', 'fim']);
            expect(resultado).toMatch(/var x: inteiro = 42/);
        });

        it('múltiplas variáveis na mesma linha', async () => {
            const resultado = await traduzir(['inicio', 'inteiro a, b, c', 'fim']);
            expect(resultado).toMatch(/var a: inteiro = 0/);
            expect(resultado).toMatch(/var b: inteiro = 0/);
            expect(resultado).toMatch(/var c: inteiro = 0/);
        });

        it('array inteiro', async () => {
            const resultado = await traduzir(['inicio', 'inteiro v[3]', 'fim']);
            expect(resultado).toMatch(/var v: inteiro\[\] = \[/);
        });
    });

    describe('Constantes', () => {
        it('constante inteira', async () => {
            const resultado = await traduzir(['inicio', 'constante inteiro PI = 3', 'fim']);
            expect(resultado).toMatch(/const PI = 3/);
        });
    });

    describe('Atribuição', () => {
        it('atribuição simples com <-', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x',
                'x <- 10',
                'fim',
            ]);
            expect(resultado).toMatch(/x = 10/);
        });
    });

    describe('Leitura', () => {
        it('ler variável -> x = leia()', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x',
                'ler x',
                'fim',
            ]);
            expect(resultado).toMatch(/x = leia\(\)/);
        });
    });

    describe('Condicional se', () => {
        it('se simples', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x = 5',
                'se x > 3 entao',
                'escrever "maior"',
                'fimse',
                'fim',
            ]);
            expect(resultado).toMatch(/se \(x > 3\)/);
            expect(resultado).toMatch(/escreva\('maior'\)/);
        });

        it('se com senao', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x = 1',
                'se x > 3 entao',
                'escrever "maior"',
                'senao',
                'escrever "menor"',
                'fimse',
                'fim',
            ]);
            expect(resultado).toMatch(/se \(x > 3\)/);
            expect(resultado).toMatch(/senão/);
            expect(resultado).toMatch(/escreva\('menor'\)/);
        });

        it('se com operador lógico e', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x = 5',
                'se x > 0 e x < 10 entao',
                'escrever "ok"',
                'fimse',
                'fim',
            ]);
            expect(resultado).toMatch(/x > 0 && x < 10/);
        });

        it('se com operador lógico ou', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x = 0',
                'se x = 0 ou x = 1 entao',
                'escrever "ok"',
                'fimse',
                'fim',
            ]);
            expect(resultado).toMatch(/x == 0 \|\| x == 1/);
        });

        it('se com nao', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x = 5',
                'se nao x = 0 entao',
                'escrever "nonzero"',
                'fimse',
                'fim',
            ]);
            expect(resultado).toMatch(/!x == 0/);
        });
    });

    describe('Laço enquanto', () => {
        it('enquanto simples', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x = 0',
                'enquanto x < 3 faz',
                'escrever x',
                'x <- x + 1',
                'fimenquanto',
                'fim',
            ]);
            expect(resultado).toMatch(/enquanto \(x < 3\)/);
            expect(resultado).toMatch(/x = x \+ 1/);
        });
    });

    describe('Laço para', () => {
        it('para sem passo', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro i',
                'para i de 1 ate 3',
                'escrever i',
                'proximo',
                'fim',
            ]);
            expect(resultado).toMatch(/para \(/);
            expect(resultado).toMatch(/i = 1/);
            expect(resultado).toMatch(/i <= 3/);
        });

        it('para com passo 2', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro i',
                'para i de 0 ate 6 passo 2',
                'escrever i',
                'proximo',
                'fim',
            ]);
            expect(resultado).toMatch(/para \(/);
            expect(resultado).toMatch(/i = 0/);
            expect(resultado).toMatch(/i <= 6/);
            expect(resultado).toMatch(/i = i \+ 2/);
        });
    });

    describe('Laço repete...ate', () => {
        it('repete...ate -> fazer...enquanto', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x = 0',
                'repete',
                'x <- x + 1',
                'ate x >= 3',
                'fim',
            ]);
            expect(resultado).toMatch(/fazer/);
            expect(resultado).toMatch(/enquanto/);
            expect(resultado).toMatch(/x >= 3/);
        });
    });

    describe('Laço faz...enquanto', () => {
        it('faz...enquanto -> fazer...enquanto', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x = 0',
                'faz',
                'x <- x + 1',
                'enquanto x < 3',
                'fim',
            ]);
            expect(resultado).toMatch(/fazer/);
            expect(resultado).toMatch(/enquanto \(x < 3\)/);
        });
    });

    describe('Escolha', () => {
        it('escolha com caso e defeito', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x = 2',
                'escolhe x',
                'caso 1:',
                'escrever "um"',
                'caso 2:',
                'escrever "dois"',
                'defeito:',
                'escrever "outro"',
                'fimescolhe',
                'fim',
            ]);
            expect(resultado).toMatch(/escolha \(x\)/);
            expect(resultado).toMatch(/caso 1:/);
            expect(resultado).toMatch(/caso 2:/);
            expect(resultado).toMatch(/padrão:/);
        });

        it('escolha sem defeito', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x = 1',
                'escolhe x',
                'caso 1:',
                'escrever "um"',
                'fimescolhe',
                'fim',
            ]);
            expect(resultado).toMatch(/escolha \(x\)/);
            expect(resultado).toMatch(/caso 1:/);
            expect(resultado).not.toMatch(/padrão:/);
        });
    });

    describe('Funções embutidas', () => {
        it('POTENCIA -> potência', async () => {
            const resultado = await traduzir([
                'inicio',
                'real x',
                'x <- POTENCIA(2, 8)',
                'fim',
            ]);
            expect(resultado).toMatch(/potência\(2, 8\)/);
        });

        it('ABS -> absoluto', async () => {
            const resultado = await traduzir([
                'inicio',
                'real x',
                'x <- ABS(-5)',
                'fim',
            ]);
            expect(resultado).toMatch(/absoluto\(-5\)/);
        });

        it('RAIZ -> raiz_quadrada', async () => {
            const resultado = await traduzir([
                'inicio',
                'real x',
                'x <- RAIZ(9)',
                'fim',
            ]);
            expect(resultado).toMatch(/raiz_quadrada\(9\)/);
        });

        it('INT -> inteiro', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro x',
                'x <- INT(3.9)',
                'fim',
            ]);
            expect(resultado).toMatch(/inteiro\(3\.9\)/);
        });

        it('COMPRIMENTO -> tamanho', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro n',
                'n <- COMPRIMENTO("hello")',
                'fim',
            ]);
            expect(resultado).toMatch(/tamanho\('hello'\)/);
        });

        it('ALEATORIO -> aleatorio', async () => {
            const resultado = await traduzir([
                'inicio',
                'real x',
                'x <- ALEATORIO()',
                'fim',
            ]);
            expect(resultado).toMatch(/aleatorio\(\)/);
        });
    });

    describe('Arrays', () => {
        it('acesso a elemento de array', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro v[3]',
                'inteiro x',
                'x <- v[1]',
                'fim',
            ]);
            expect(resultado).toMatch(/v\[1\]/);
        });

        it('atribuição em elemento de array', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro v[3]',
                'v[0] <- 42',
                'fim',
            ]);
            expect(resultado).toMatch(/v\[0\] = 42/);
        });
    });

    describe('Programa completo', () => {
        it('traduz programa de verificação de idade', async () => {
            const resultado = await traduzir([
                'inicio',
                'inteiro idade',
                'escrever "Qual é a sua idade?"',
                'ler idade',
                'se (idade >= 18) entao',
                'escrever "Você é maior de idade"',
                'senao',
                'escrever "Você é menor de idade"',
                'fimse',
                'fim',
            ]);
            expect(resultado).toMatch(/var idade: inteiro/);
            expect(resultado).toMatch(/escreva\('Qual é a sua idade\?'\)/);
            expect(resultado).toMatch(/idade = leia\(\)/);
            expect(resultado).toMatch(/se \(/);
            expect(resultado).toMatch(/idade >= 18/);
            expect(resultado).toMatch(/escreva\('Você é maior de idade'\)/);
            expect(resultado).toMatch(/senão/);
            expect(resultado).toMatch(/escreva\('Você é menor de idade'\)/);
        });
    });
});
