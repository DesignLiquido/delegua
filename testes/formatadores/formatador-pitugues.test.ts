import { AvaliadorSintaticoPitugues } from '../../fontes/avaliador-sintatico/dialetos';
import { FormatadorPitugues } from '../../fontes/formatadores/formatador-pitugues';
import { LexadorPitugues } from '../../fontes/lexador/dialetos';

describe('Formatador (Pituguês)', () => {
    let lexador: LexadorPitugues;
    let avaliadorSintatico: AvaliadorSintaticoPitugues;
    let formatador: FormatadorPitugues;

    beforeEach(() => {
        lexador = new LexadorPitugues();
        avaliadorSintatico = new AvaliadorSintaticoPitugues();
        formatador = new FormatadorPitugues();
    });

    const executar = async (codigos: string[]): Promise<string> => {
        const retornoLexador = lexador.mapear(codigos, -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        return await formatador.formatar(retornoAvaliadorSintatico.declaracoes);
    };

    it('variáveis', async () => {
        const resultado = await executar([
            'var nome="Ana" var idade = 30',
            'var PI = 3.14 var LIMITE=100'
        ]);

        expect(resultado).toContain('var nome = \'Ana\'');
        expect(resultado).toContain('var idade = 30');
        expect(resultado).toContain('var PI = 3.14');
        expect(resultado).toContain('var LIMITE = 100');
    });

    it('função simples', async () => {
        const resultado = await executar([
            'função saudar(nome):',
            '    imprima("Olá,", nome)'
        ]);

        expect(resultado.trim()).toBe(
            'função saudar(nome):\n    imprima(\'Olá,\', nome)'
        );
    });

    it('classe com propriedades, construtor e método', async () => {
        const resultado = await executar([
            'classe Pessoa:',
            '    nome: texto',
            '    idade: inteiro',
            '',
            '    construtor(nome: texto, idade: inteiro):',
            '        isto.nome = nome',
            '        isto.idade = idade',
            '',
            '    função falar():',
            '        imprima("Oi, eu sou", isto.nome, "e tenho", isto.idade, "anos")'
        ]);

        const linhas = resultado.split('\n');
        expect(linhas[0]).toBe('classe Pessoa:');
        expect(linhas[1]).toBe('    nome: texto');
        expect(linhas[2]).toBe('    idade: inteiro');
        expect(linhas[3]).toBe('    construtor(nome: texto, idade: inteiro):');
        expect(linhas[4]).toBe('        isto.nome = nome');
        expect(linhas[6]).toBe('    função falar():');
        expect(linhas[7]).toBe('        imprima(\'Oi, eu sou\', isto.nome, \'e tenho\', isto.idade, \'anos\')');
    });

    it('se / senão', async () => {
        const resultado = await executar([
            'var idade= 17',
            'se idade>=18:',
            '    imprima(  \'Maior de idade\'   )',
            'senão:',
            '    imprima(\'Menor de idade\' )'
        ]);

        const linhas = resultado.split('\n');
        expect(linhas[0]).toBe(`var idade = 17`);
        expect(linhas[1]).toBe(`se idade >= 18:`);
        expect(linhas[2]).toBe(`    imprima(\'Maior de idade\')`);
        expect(linhas[3]).toBe(`senão:`);
        expect(linhas[4]).toBe(`    imprima(\'Menor de idade\')`);
    });

    it('enquanto', async () => {
        const resultado = await executar([
            'var i = 0',
            'enquanto i < 5:',
            '    imprima(i)',
            '    i = i + 1'
        ]);

        expect(resultado).toContain('enquanto i < 5:');
        expect(resultado).toContain('    imprima(i)');
    });

    it('fazer ... enquanto', async () => {
        const resultado = await executar([
            'var i=0',
            'fazer:',
            '    imprima(i)',
            '    i=i+1',
            'enquanto i>= 5'
        ]);

        expect(resultado.trim()).toBe(
`var i = 0
fazer:
    imprima(i)
    i = i + 1
enquanto i >= 5`.trim()
        );
    });

    it('para cada', async () => {
        const resultado = await executar([
            'para cada i de [1,2, 3,  4, 5   ] :',
            '    imprima ( i  )'
        ]);

        expect(resultado.trim()).toBe('para cada i de [1, 2, 3, 4, 5]:\n    imprima(i)');
    });

    it('escolha com múltiplos casos', async () => {
        const resultado = await executar([
            'var nota = 8',
            'escolha nota:',
            '    caso 10:',
            '        imprima("Perfeito!")',
            '    caso 9:',
            '    caso 8:',
            '        imprima("Ótimo!")',
            '    caso 7:',
            '    caso 6:',
            '        imprima("Bom")',
            '    padrão:',
            '        imprima("Precisa melhorar")'
        ]);

        expect(resultado).toContain('escolha nota:');
        expect(resultado).toContain('  caso 10:');
        expect(resultado).toContain('  caso 9:');
        expect(resultado).toContain('  padrão:');
    });

    it('tente / pegue / finalmente', async () => {
        const resultado = await executar([
            'tente:',
            '    var   resultado= 10/ 0',
            'pegue como  erro:',
            '    imprima ("Ocorreu um erro:",erro  )',
            'finalmente :',
            '    imprima   (   "Fim da execução" )'
        ]);

        expect(resultado.trim()).toBe(
`tente:
    var resultado = 10 / 0
pegue como erro:
    imprima('Ocorreu um erro:', erro)
finalmente:
    imprima('Fim da execução')`.trim()
        );
    });

    it('vetores e dicionários', async () => {
        const resultado = await executar([
            'var frutas = ["maçã", "banana", "laranja"]',
            'var pessoa = {"nome": "Carlos", "idade": 35}',
            'imprima(frutas[1])',
            'imprima(pessoa.idade)'
        ]);

        expect(resultado).toContain('var frutas = [\'maçã\', \'banana\', \'laranja\']');
        expect(resultado).toContain('var pessoa = {\'nome\': \'Carlos\', \'idade\': 35}');
        expect(resultado).toContain('imprima(pessoa.idade)');
    });

    it('função anônima', async () => {
        const resultado = await executar([
            'var dobro = função(x): retorna x * 2',
            'imprima (  dobro ( 7 )  )'
        ]);

        expect(resultado.trim()).toBe(
            'var dobro = função(x):\n    retorna x * 2\nimprima(dobro(7))'
        );
    });

    it('comentários', async () => {
        const resultado = await executar([
            '# Este é um comentário',
            `'''`,
            '   Comentário',
            '   em várias linhas',
            `'''`,
            'imprima("Olá")'
        ]);

        expect(resultado).toContain('# Este é um comentário');
        expect(resultado).toContain(`'''`);
        expect(resultado).toContain('   Comentário');
        expect(resultado).toContain(`'''`);
    });

    it('exemplo completo - FizzBuzz em Pituguês puro', async () => {
        const codigo = [
            'para  cada   i  em     intervalo ( 1 , 100):',
            '    se i % 15 == 0:',
            '        imprima("FizzBuzz")',
            '    senão se i % 3 == 0:',
            '        imprima("Fizz")',
            '    senão se i % 5 == 0:',
            '        imprima("Buzz")',
            '    senão:',
            '        imprima(i)'
        ];

        const resultado = await executar(codigo);
        const linhas = resultado.split('\n');

        expect(linhas[0]).toBe('para cada i de intervalo(1, 100):');
        expect(linhas[1]).toBe('    se i % 15 == 0:');
        expect(linhas[2]).toBe('        imprima(\'FizzBuzz\')');
    });
});
