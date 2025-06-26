import { TradutorReversoTenda } from '../../fontes/tradutores/tradudor-reverso-tenda';
import { LexadorTenda } from '../../fontes/lexador';
import { AvaliadorSintaticoTenda } from '../../fontes/avaliador-sintatico';

describe('Tradutor Tenda -> Delégua', () => {
    let lexador: LexadorTenda;
    let avaliadorSintatico: AvaliadorSintaticoTenda;
    const tradutor: TradutorReversoTenda = new TradutorReversoTenda();

    beforeEach(() => {
        lexador = new LexadorTenda();
        avaliadorSintatico = new AvaliadorSintaticoTenda();
    });

    describe('Código', () => {
        it('exiba -> escreva', () => {
            const codigo = `exiba("Oi")`;

            const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\("Oi"\)/i);
        });

        it.skip('dicionário', () => {
            const codigo = [
                'seja dicionário = { "nome": "Tenda", "versão": 1.0 }',
                'seja nome = dicionário["nome"]',
                'seja versão = dicionário.versão',
                'exiba("Nome: " + nome + ", Versão: " + versão)',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it.skip('enquanto', () => {
            const codigo = [
                'seja contador = 1',
                'enquanto contador <= 5 faça',
                '    exiba("Contador: " + contador)',
                '    contador = contador + 1',
                'fim'
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it('leia -> leia', () => {
            const codigo = `leia("Digite sua idade: ")`;

            const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/leia\(\"Digite sua idade: \"\)/i);
        });

        it.skip('operações de comparação', () => {
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
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it('operações de concatenação', () => {
            const codigo = [
                'seja texto1 = "Olá"',
                'seja texto2 = "Mundo"',
                'seja texto_concatenado = texto1 + " " + texto2',
                'seja lista1 = [1, 2, 3]',
                'seja lista2 = [4, 5, 6]',
                'seja lista_concatenada = lista1 + lista2'
            ];
            
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var texto1 = \"Olá\"/i);
            expect(resultado).toMatch(/var texto2 = \"Mundo\"/i);
            expect(resultado).toMatch(/var texto_concatenado = texto1 \+ \" \" \+ texto2/i);
            expect(resultado).toMatch(/var lista1 = \[1, 2, 3\]/i);
            expect(resultado).toMatch(/var lista2 = \[4, 5, 6\]/i);
            expect(resultado).toMatch(/var lista_concatenada = lista1 \+ lista2/i);
        });

        it('operações matemáticas', () => {
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
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
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

        it('seja -> var', () => {
            const codigo = `seja nome = "Tenda"
            seja idade = 10
            seja lista = [1, 2, 3, 4, 5]
            `;

            const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var nome = \"Tenda\"/i);
            expect(resultado).toMatch(/var idade = 10/i);
            expect(resultado).toMatch(/var lista = \[1, 2, 3, 4, 5\]/i);
        });

        it.skip('para cada', () => {
            const codigo = [
                "seja total = 0",
                "para cada i em 1 até 10 faça",
                "    total = total + i",
                "fim",
                "exiba(total)",
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
        });

        it('se senão', () => {
            const codigo = `seja idade = 18
            se idade >= 18 então
                exiba("Você é maior de idade.")
            senão
                exiba("Você é menor de idade.")
            fim
            `;

            const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var idade = 18/i);
            expect(resultado).toMatch(/se idade >= 18/i);
            expect(resultado).toMatch(/escreva\(\"Você é maior de idade.\"\)/i);
            expect(resultado).toMatch(/senão/i);
            expect(resultado).toMatch(/escreva\(\"Você é menor de idade.\"\)/i);
        });
    });
});
