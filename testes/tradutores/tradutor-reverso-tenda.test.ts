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

        it('leia -> leia', () => {
            const codigo = `leia("Digite sua idade: ")`;

            const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/leia\(\"Digite sua idade: \"\)/i);
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
