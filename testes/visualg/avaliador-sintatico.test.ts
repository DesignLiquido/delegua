import { LexadorVisuAlg } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoVisuAlg } from '../../fontes/avaliador-sintatico/dialetos';

describe('Avaliador sintático (VisuAlg)', () => {
    describe('analisar()', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
        });

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = lexador.mapear([
                'algoritmo "olá-mundo"',
                'inicio',
                'escreva("Olá mundo")',
                'fimalgoritmo'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - Enquanto', () => {
            const retornoLexador = lexador.mapear([
                'algoritmo "Números de 1 a 10 (com enquanto...faca)"',
                'var j: inteiro',
                'inicio',
                'j <- 1',
                'enquanto j <= 10 faca',
                '   escreva (j)',
                '   j <- j + 1',
                'fimenquanto',
                'fimalgoritmo'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - Escolha', () => {
            const retornoLexador = lexador.mapear([
                'algoritmo "Times"',
                'var time: caractere',
                'inicio',
                'escreva ("Entre com o nome de um time de futebol: ")',
                'leia (time)',
                'escolha time',
                '    caso "Flamengo", "Fluminense", "Vasco", "Botafogo"',
                '        escreval ("É um time carioca.")',
                '    caso "São Paulo", "Palmeiras", "Santos", "Corínthians"',
                '        escreval ("É um time paulista.")',
                '    outrocaso',
                '        escreval ("É de outro estado.")',
                'fimescolha',
                'fimalgoritmo'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
        });

        it('Sucesso - Função', () => {
            const retornoLexador = lexador.mapear([
                'Algoritmo "exemplo-funcoes"',
                'Var',
                '   n: inteiro',
                '   m: inteiro',
                '   res: inteiro',
                'Inicio',
                '   funcao soma: inteiro',
                '   var aux: inteiro',
                '   inicio',
                '      aux <- n + m',
                '      retorne aux',
                '   fimfuncao',
                '   n <- 4',
                '   m <- -9',
                '   res <- soma',
                '   escreva(res)',
                'Fimalgoritmo'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(8);
        });

        it('Sucesso - Interrompa', () => {
            const retornoLexador = lexador.mapear([
                'algoritmo "Números de 1 a 10 (com interrompa)"',
                'var x: inteiro',
                'inicio',
                'x <- 0',
                'repita',
                '   x <- x + 1',
                '   escreva (x)',
                '   se x = 10 entao',
                '      interrompa',
                '   fimse',
                'ate falso',
                'fimalgoritmo'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - Leia', () => {
            const retornoLexador = lexador.mapear([
                'Algoritmo "Soma 5"',
                'Var',
                '   n1, n2, n3, n4, n5: inteiro',
                'Inicio',
                '      leia(n1, n2, n3, n4, n5)',
                '      escreva(n1 + n2 + n3 + n4 + n5)',
                'Fimalgoritmo'
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
        });

        it('Sucesso - Para', () => {
            const retornoLexador = lexador.mapear([
                'algoritmo "Numeros de 1 a 10"',
                'var j: inteiro',
                'inicio',
                '    para j de 1 ate 10 faca',
                '        escreva (j)',
                '    fimpara',
                'fimalgoritmo'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });

        it('Sucesso - Procedimento', () => {
            const retornoLexador = lexador.mapear([
                'algoritmo "semnome"',
                'var',
                'a,b:inteiro',
                'procedimento mostranumero (a:inteiro;b:inteiro)',
                'inicio',
                'se a > b entao',
                '     escreval ("A variavel escolhida é ",a)',
                'senao',
                '     escreval ("A variavel escolhida é ",b)',
                'fimse',
                'fimprocedimento',
                'inicio',
                'escreval ("Digite dois valores: ")',
                'leia (a,b)',
                'mostranumero (a,b)',
                '',
                'fimalgoritmo'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(6);
        });

        it('Sucesso - Repita', () => {
            const retornoLexador = lexador.mapear([
                'algoritmo "Números de 1 a 10 (com repita)"',
                'var j: inteiro',
                'inicio',
                'j <- 1',
                'repita',
                '   escreva (j)',
                '   j <- j + 1',
                'ate j > 10',
                'fimalgoritmo'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - Xou', () => {
            const retornoLexador = lexador.mapear([
                'algoritmo "Exemplo Xou"',
                'var A, B, C, resultA, resultB, resultC: logico',
                'inicio',
                'A <- verdadeiro',
                'B <- verdadeiro',
                'C <- falso',
                'resultA <- A ou B',
                'escreval("A ", resultA)',
                'resultA <- A xou B',
                'escreval("A ", resultA)',
                'resultA <- nao B',
                'escreval("A ", resultA)',
                'resultB <- B',
                'resultA <- (A e B) ou (A xou B)',
                'resultB <- (A ou B) e (A e C)',
                'resultC <- A ou C e B xou A e nao B',
                'escreval("A ", resultA)',
                'escreval("B ", resultB)',
                'escreval("C ", resultC)',
                'fimalgoritmo'
            ], -1);
            
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(22);
        })
    });
});
