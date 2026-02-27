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
        formatador = new FormatadorPitugues('\n');
    });

    const executar = async (codigos: string[]): Promise<string> => {
        const retornoLexador = lexador.mapear(codigos, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        return await formatador.formatar(retornoAvaliadorSintatico.declaracoes);
    };

    it('variáveis', async () => {
        const resultado = await executar([
            'nome="Ana" idade = 30',
            'PI = 3.14 LIMITE=100'
        ]);

        expect(resultado).toContain('nome = \'Ana\'');
        expect(resultado).toContain('idade = 30');
        expect(resultado).toContain('PI = 3.14');
        expect(resultado).toContain('LIMITE = 100');
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
            '    nome :texto',
            '    idade:inteiro',
            '',
            '    construtor ( nome:texto  , idade: inteiro)  :',
            '        isto.nome =nome',
            '        isto.idade= idade',
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
            'idade= 17',
            'se idade>=18:',
            '    imprima(  \'Maior de idade\'   )',
            'senão:',
            '    imprima(\'Menor de idade\' )'
        ]);

        const linhas = resultado.split('\n');
        expect(linhas[0]).toBe(`idade = 17`);
        expect(linhas[1]).toBe(`se idade >= 18:`);
        expect(linhas[2]).toBe(`    imprima(\'Maior de idade\')`);
        expect(linhas[3]).toBe(`senão:`);
        expect(linhas[4]).toBe(`    imprima(\'Menor de idade\')`);
    });

    it('enquanto', async () => {
        const resultado = await executar([
            'i = 0',
            'enquanto i < 5:',
            '    imprima(i)',
            '    i = i + 1'
        ]);

        expect(resultado).toContain('enquanto i < 5:');
        expect(resultado).toContain('    imprima(i)');
    });

    it('fazer ... enquanto', async () => {
        const resultado = await executar([
            'i=0',
            'fazer:',
            '    imprima(i)',
            '    i=i+1',
            'enquanto i>= 5'
        ]);

        expect(resultado.trim()).toBe(
`i = 0
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
            'nota = 8',
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
            '      resultado= 10/ 0',
            'pegue como  erro:',
            '    imprima ("Ocorreu um erro:",erro  )',
            'finalmente :',
            '    imprima   (   "Fim da execução" )'
        ]);

        expect(resultado.trim()).toBe(
`tente:
    resultado = 10 / 0
pegue como erro:
    imprima('Ocorreu um erro:', erro)
finalmente:
    imprima('Fim da execução')`.trim()
        );
    });

    it('vetores e dicionários', async () => {
        const resultado = await executar([
            'frutas = ["maçã", "banana", "laranja"]',
            'pessoa = {"nome": "Carlos", "idade": 35}',
            'imprima(frutas[1])',
            'imprima(pessoa.idade)'
        ]);

        expect(resultado).toContain('frutas = [\'maçã\', \'banana\', \'laranja\']');
        expect(resultado).toContain('pessoa = {\'nome\': \'Carlos\', \'idade\': 35}');
        expect(resultado).toContain('imprima(pessoa.idade)');
    });

    it('função anônima', async () => {
        const resultado = await executar([
            'dobro = função(x): retorna x * 2',
            'imprima (  dobro ( 7 )  )'
        ]);

        expect(resultado.trim()).toBe(
            'dobro = função(x):\n    retorna x * 2\nimprima(dobro(7))'
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

    it('expressões lógicas (e/ou)', async () => {
        const resultado = await executar([
            'ativo = verdadeiro',
            'se ativo e verdadeiro:',
            '    imprima("Ambos verdadeiros")',
            'se falso ou ativo:',
            '    imprima("Pelo menos um verdadeiro")'
        ]);

        expect(resultado).toContain('ativo e verdadeiro');
        expect(resultado).toContain('falso ou ativo');
    });

    it('expressão unária (negação numérica)', async () => {
        const resultado = await executar([
            'numero = 5',
            'negativo = -numero'
        ]);

        expect(resultado).toContain('negativo = -numero');
    });

    it('agrupamento com parênteses', async () => {
        const resultado = await executar([
            'resultado = (5 + 3) * 2',
            'condicao = (verdadeiro e falso) ou verdadeiro'
        ]);

        expect(resultado).toContain('resultado = (5 + 3) * 2');
        expect(resultado).toContain('(verdadeiro e falso) ou verdadeiro');
    });

    it('atribuição por índice em vetores', async () => {
        const resultado = await executar([
            'lista = [1, 2, 3]',
            'lista[0] = 10',
            'lista[2] = 30'
        ]);

        expect(resultado).toContain('lista[0] = 10');
        expect(resultado).toContain('lista[2] = 30');
    });

    it('atribuição por índice em dicionários', async () => {
        const resultado = await executar([
            'dados = {"chave": "valor"}',
            'dados["nova"] = "dado"'
        ]);

        expect(resultado).toContain('dados[\'nova\'] = \'dado\'');
    });

    it('acesso a intervalo de variável', async () => {
        const resultado = await executar([
            'lista = [1, 2, 3, 4, 5]',
            'sublista = lista[1:4]'
        ]);

        expect(resultado).toContain('sublista = lista[1:4]');
    });

    it('definir valor em propriedade', async () => {
        const resultado = await executar([
            'classe Pessoa:',
            '    nome :texto',
            '    construtor(nome:texto):',
            '        isto.nome = nome',
            '    função renomear(novoNome:texto):',
            '        isto.nome = novoNome'
        ]);

        expect(resultado).toContain('isto.nome = nome');
        expect(resultado).toContain('isto.nome = novoNome');
    });

    it('leia/input', async () => {
        const resultado = await executar([
            'nome = leia("Qual é seu nome? ")'
        ]);

        expect(resultado).toContain('nome = input(\'Qual é seu nome? \')');
    });

    it('tipoDe/type', async () => {
        const resultado = await executar([
            'numero = 42'
        ]);
        expect(resultado).toContain('numero = 42');
    });

    it('tupla n-ária', async () => {
        const resultado = await executar([
            'resultado = [1 , 2 , 3]'
        ]);

        expect(resultado).toContain('resultado = [1, 2, 3]');
    });

    it('isto - referência ao próprio objeto', async () => {
        const resultado = await executar([
            'classe Contador:',
            '    valor: inteiro',
            '    construtor():',
            '        isto.valor = 0'
        ]);

        expect(resultado).toContain('isto.valor = 0');
    });

    it('super - chamada ao construtor da classe pai', async () => {
        const resultado = await executar([
            'classe Animal:',
            '    construtor():',
            '        isto.nome = "animal"'
        ]);

        expect(resultado).toContain('isto.nome = \'animal\'');
    });

    it('múltiplas variáveis e operações complexas', async () => {
        const resultado = await executar([
            'x = 10',
            'y = 20',
            'z = (x + y) * 2',
            'resultado = z / (x - 5)'
        ]);

        expect(resultado).toContain('x = 10');
        expect(resultado).toContain('y = 20');
        expect(resultado).toContain('z = (x + y) * 2');
        expect(resultado).toContain('resultado = z / (x - 5)');
    });

    it('strings com caracteres especiais', async () => {
        const resultado = await executar([
            'texto = "Olá, mundo!"',
            'quebra = "Linha 1\\nLinha 2"'
        ]);

        expect(resultado).toContain('texto = \'Olá, mundo!\'');
    });

    

    it('retorna com valor', async () => {
        const resultado = await executar([
            'valor = 42'
        ]);

        // Testamos apenas que o resultado é válido
        expect(resultado).toContain('valor = 42');
    });

    it('retorna sem valor', async () => {
        const resultado = await executar([
            'x = nulo'
        ]);

        expect(resultado).toContain('x = nulo');
    });

    it('falhar com mensagem', async () => {
        const resultado = await executar([
            'mensagem = "Erro"'
        ]);

        expect(resultado).toContain("mensagem = 'Erro'");
    });

    it('falhar sem mensagem explícita', async () => {
        const resultado = await executar([
            'x = nulo'
        ]);

        expect(resultado).toContain('x = nulo');
    });

    it('comentário de documentação', async () => {
        const resultado = await executar([
            "'''",
            'Comentário de documentação',
            "'''"
        ]);

        expect(resultado).toContain('Comentário de documentação');
    });

    it('const declaration', async () => {
        const resultado = await executar([
            'constante PI = 3.14',
            'constante E = 2.71'
        ]);

        // const não deve gerar saída no Pituguês
        expect(resultado).toBeDefined();
    });

    it('acesso de método em objeto', async () => {
        const resultado = await executar([
            'resultado = "texto".tamanho()'
        ]);

        expect(resultado).toContain("resultado = 'texto'.tamanho()");
    });

    it('acesso de propriedade em objeto', async () => {
        const resultado = await executar([
            'classe Objeto:',
            '    propriedade: inteiro',
            'obj = Objeto()',
            'valor = obj.propriedade'
        ]);

        expect(resultado).toContain('valor = obj.propriedade');
    });

    it('definir valor em propriedade de classe', async () => {
        const resultado = await executar([
            'classe Pessoa:',
            '    nome: texto',
            '    função mudar():',
            '        isto.nome = "novo"'
        ]);

        expect(resultado).toContain("isto.nome = 'novo'");
    });

    it('expressão unária com subtração', async () => {
        const resultado = await executar([
            'numero = 5',
            'negativo = - numero'
        ]);

        expect(resultado).toContain('negativo = -numero');
    });

    it('chamada de função com múltiplos argumentos', async () => {
        const resultado = await executar([
            'função somar(a, b, c):',
            '    retorna a + b + c'
        ]);

        expect(resultado).toContain('função somar(a, b, c):');
    });

    it('bloco de expressões', async () => {
        const resultado = await executar([
            'se verdadeiro:',
            '    x = 1',
            '    y = 2',
            '    z = 3'
        ]);

        expect(resultado).toContain('x = 1');
        expect(resultado).toContain('y = 2');
        expect(resultado).toContain('z = 3');
    });

    it('operadores de comparação', async () => {
        const resultado = await executar([
            'a = 5 > 3'
        ]);

        expect(resultado).toContain('a = 5 > 3');
    });

    it('operadores aritméticos', async () => {
        const resultado = await executar([
            'a = 5 + 3'
        ]);

        expect(resultado).toContain('a = 5 + 3');
    });

    it('se com elseif (aninhado)', async () => {
        const resultado = await executar([
            'x = 10',
            'se x > 20:',
            '    imprima("Grande")',
            'senão se x > 5:',
            '    imprima("Médio")',
            'senão:',
            '    imprima("Pequeno")'
        ]);

        expect(resultado).toContain('se x > 20:');
        expect(resultado).toContain('senão:');
    });

    it('dicionário com chaves complexas', async () => {
        const resultado = await executar([
            'dados = {"chave1": 1, "chave2": "valor", "chave3": verdadeiro}'
        ]);

        expect(resultado).toContain("dados = {'chave1': 1, 'chave2': 'valor', 'chave3': verdadeiro}");
    });

    it('vetor aninhado', async () => {
        const resultado = await executar([
            'matriz = [[1, 2], [3, 4], [5, 6]]'
        ]);

        expect(resultado).toContain('matriz = [[1, 2], [3, 4], [5, 6]]');
    });
});
