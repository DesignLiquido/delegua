import * as sistemaOperacional from 'os';

import { FormatadorVisuAlg } from '../../fontes/formatadores';
import { LexadorVisuAlg } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoVisuAlg } from '../../fontes/avaliador-sintatico/dialetos';

describe('Formatadores > VisualG', () => {
    const formatadorVisuAlg = new FormatadorVisuAlg(sistemaOperacional.EOL);
    const avaliadorSintaticoVisualG = new AvaliadorSintaticoVisuAlg();
    const lexadorVisuAlg = new LexadorVisuAlg();

    it('Olá mundo', () => {
        const retornoLexador = lexadorVisuAlg.mapear([
            'algoritmo "olá mundo"',
            'inicio',
            'escreva("Olá mundo")',
            'fimalgoritmo'
        ], -1);

        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);

        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(5)
    })

    it('Lendo variaveis', () => {
        const retornoLexador = lexadorVisuAlg.mapear([
            'algoritmo "Soma dos números"',
            'var',
            'numero1: inteiro',
            'numero2: inteiro',
            'inicio',
            'escreva("Digite o primeiro número: ")',
            'leia(numero1)',
            'leia(numero2)',
            'escreva("Digite o segundo número: ")',
            'escreva("A soma de ", numero1 , "por " , numero2 , "é igual à: " , numero1 , numero2)',
            'fimalgoritmo'
        ], -1);

        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);

        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(12)
    })

    it('Atribuição', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
                'algoritmo "Atribuição"',
                'var a: inteiro',
                'var b: caracter',
                'inicio',
                'a <- 1',
                'b := "b"',
                'escreva (a)',
                'escreva (b)',
                'fimalgoritmo',
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        const linhasResultado = resultado.split(sistemaOperacional.EOL)
        expect(linhasResultado).toHaveLength(10)
    })

    it('Enquanto', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
                'algoritmo "Números de 1 a 10 (com enquanto...faca)"',
                'var j: inteiro',
                'inicio',
                'j <- 1',
                'enquanto j <= 10 faca',
                'escreva (j)',
                'j <- j + 1',
                'fimenquanto',
                'fimalgoritmo',
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        const linhasResultado = resultado.split(sistemaOperacional.EOL)
        expect(linhasResultado).toHaveLength(9)
    })

    it('Escolha', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
                'algoritmo "Times"',
                'var time: caractere',
                'inicio',
                'escreva ("Entre com o nome de um time de futebol: ")',
                'leia (time)',
                'escolha time',
                'caso "Flamengo", "Fluminense", "Vasco", "Botafogo"',
                'escreval ("É um time carioca.")',
                'caso "São Paulo", "Palmeiras", "Santos", "Corínthians"',
                'escreval ("É um time paulista.")',
                'outrocaso',
                'escreval ("É de outro estado.")',
                'fimescolha',
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        const linhasResultado = resultado.split(sistemaOperacional.EOL)
        expect(linhasResultado).toHaveLength(15)
    });

    it('Função', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
                'Algoritmo "exemplo-funcoes"',
                'Var',
                'n: inteiro',
                'm: inteiro',
                'res: inteiro',
                'Inicio',
                'funcao soma: inteiro',
                'var aux: inteiro',
                'inicio',
                'aux <- n + m',
                'retorne aux',
                'fimfuncao',
                'n <- 4',
                'm <- -9',
                'res <- soma',
                'escreva(res)',
                'Fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);

        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        const linhasResultado = resultado.split(sistemaOperacional.EOL)
        expect(linhasResultado).toHaveLength(21)
    });

    it('Interrompa', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
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
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes)
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(12)
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(5);
    });

    it('Leia', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
                'Algoritmo "Soma 5"',
                'Var',
                '   n1, n2, n3, n4, n5: inteiro',
                'Inicio',
                '      leia(n1, n2, n3, n4, n5)',
                '      escreva(n1 + n2 + n3 + n4 + n5)',
                'Fimalgoritmo', 'Algoritmo "Soma 5"',
                'Var',
                '   n1, n2, n3, n4, n5: inteiro',
                'Inicio',
                '      leia(n1, n2, n3, n4, n5)',
                '      escreva(n1 + n2 + n3 + n4 + n5)',
                'Fimalgoritmo',
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes)
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(11)

        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });

    it('Para', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
                'algoritmo "Numeros de 1 a 10"',
                'var j: inteiro',
                'inicio',
                '    para j de 1 ate 10 faca',
                '        escreva(j)',
                '    fimpara',
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes)
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(8)
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
    });

    /* it('Procedimento', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
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
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);
        const resultado = formatadorVisualG.formatar(retornoAvaliadorSintatico.declaracoes)
        const linhasResultado = resultado.split(sistemaOperacional.EOL)
        console.log(resultado);

        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
    }); */

    it('Repita', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
                'algoritmo "Números de 1 a 10 (com repita)"',
                'var j: inteiro',
                'inicio',
                'j <- 1',
                'repita',
                '   escreva (j)',
                '   j <- j + 1',
                'ate j > 10',
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes)
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(9);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(5);
    });

    it('XOU', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
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
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes)
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(28);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(24);
    });

    it('Sucesso - Aleatorio - Números', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
                'algoritmo "Exemplo Xou"',
                'var',
                'numero: inteiro',
                'inicio',
                'aleatorio 1, 6',
                'leia(numero)',
                'fimalgoritmo',
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);


        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes)
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(7);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
    });
});