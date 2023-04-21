import { AvaliadorSintaticoMapler } from '../../fontes/avaliador-sintatico/dialetos';
import { InterpretadorMapler } from "../../fontes/interpretador/dialetos";
import { LexadorMapler } from '../../fontes/lexador/dialetos';

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorMapler;
        let avaliadorSintatico: AvaliadorSintaticoMapler;
        let interpretador: InterpretadorMapler;

        beforeEach(() => {
            lexador = new LexadorMapler();
            avaliadorSintatico = new AvaliadorSintaticoMapler();
            interpretador = new InterpretadorMapler(process.cwd());
        });

        describe('Cenários de sucesso', () => {
            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    'variaveis',
                    'inicio',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Trivial mesma linha', async () => {
                const retornoLexador = lexador.mapear([
                    'variaveis inicio escrever "olá mundo"; fim',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Escrever simples', async () => {
                const retornoLexador = lexador.mapear([
                    'variaveis',
                    'inicio',
                    'escrever "olá mundo";',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Escrever com variável', async () => {
                const retornoLexador = lexador.mapear([
                    'variaveis',
                    'idade: inteiro;',
                    'nome, sobrenome: cadeia;',
                    'inicio',
                    'idade <- 10;',
                    'escrever "Minha idade é: ", idade;',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Escrever lógicos e outros textos', async () => {
                const retornoLexador = lexador.mapear([
                    'variaveis',
                    'inicio',
                    'escrever "";',
                    'escrever "Mapler1 ", "Mapler2";',
                    'escrever "Mapler3 ", 10.2;',
                    'escrever verdadeiro;',
                    'escrever falso;',
                    'escrever nao verdadeiro;',
                    'escrever nao falso;',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Enquanto', async () => {
                const retornoLexador = lexador.mapear([
                    "variaveis",
                    "i: inteiro;",
                    "inicio",
                    "i <- 1;",
                    "enquanto i <= 5 faca",
                    "escrever i;",
                    "i <- i + 1;",
                    "fim enquanto;",
                    "fim"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Se', async () => {
                const retornoLexador = lexador.mapear([
                    "variaveis",
                    "inicio",
                    "se 10 > 5 entao",
                    "escrever \"Olá\";",
                    "fim se;",
                    "fim",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Se/Senao', async () => {
                const retornoLexador = lexador.mapear([
                    "variaveis",
                    "inicio",
                    "se 10 > 5 entao",
                    "escrever \"10 é maior que 5\";",
                    "senao",
                    "escrever \"10 não é maior que 5\";",
                    "fim se;",
                    "fim",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it.skip('Modulo', async () => {
                const retornoLexador = lexador.mapear([
                    "variaveis",
                    "dizerOla: modulo;",
                    "inicio",
                    "dizerOla;",
                    "fim",
                    "modulo dizerOla",
                    "escrever \"Olá, mundo!\";",
                    "fim modulo;"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});
