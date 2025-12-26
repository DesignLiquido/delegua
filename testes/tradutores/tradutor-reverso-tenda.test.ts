import { TradutorReversoTenda } from '../../fontes/tradutores/tradutor-reverso-tenda';
import { LexadorTenda } from '../../fontes/lexador';
import { AvaliadorSintaticoTenda } from '../../fontes/avaliador-sintatico';

describe('Tradutor Tenda -> Delégua', async () => {
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

    describe('Bibliotecas globais', async () => {
        it.skip('Data', async () => {
            const codigo = [
                'exiba(Data.agora())',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it.skip('Lista', async () => {
            const codigo = [
                'seja listaQualquer = [2, 4, 6, 8, 10]',
                'exiba(Lista.tamanho(listaQualquer))',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it.skip('Matemática', async () => {
            const codigo = [
                'exiba(Matemática.aleatório(1, 100))'
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it.skip('Saída', async () => {
            const codigo = [
                'exiba(Saída.exiba("Olá mundo!"))'
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it.skip('Texto', async () => {
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

    describe('Funções', async () => {
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
});
