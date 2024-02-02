import * as sistemaOperacional from 'os';

import { FormatadorVisualG } from '../../fontes/formatadores';
import { LexadorVisuAlg } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoVisuAlg } from '../../fontes/avaliador-sintatico/dialetos';

describe('Formatadores > VisualG', () => {
    const formatadorVisualG = new FormatadorVisualG(sistemaOperacional.EOL);
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

        const resultado = formatadorVisualG.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(6)

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
            'escreva("A soma de ", numero1 + "por " + numero2 + "é igual à: " + numero1 + numero2)',
            'fimalgoritmo'
        ], -1);

        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);

        const resultado = formatadorVisualG.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(13)
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
        const resultado = formatadorVisualG.formatar(retornoAvaliadorSintatico.declaracoes);

        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(12)
    })

    it('Enquanto', () => {
        const retornoLexador = lexadorVisuAlg.mapear(
            [
                'algoritmo "Números de 1 a 10 (com enquanto...faca)"',
                'var j: inteiro',
                'inicio',
                'j <- 1',
                'enquanto j <= 10 faca',
                '   escreva (j)',
                '   j <- j + 1',
                'fimenquanto',
                'fimalgoritmo',
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);
        const resultado = formatadorVisualG.formatar(retornoAvaliadorSintatico.declaracoes);

        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(12)
    })
});