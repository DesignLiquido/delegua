import * as sistemaOperacional from 'os';

import { FormatadorDelegua } from '../../fontes/formatadores';
import { Lexador } from '../../fontes/lexador';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';

describe('Formatadores > Delégua', () => {
    const formatador = new FormatadorDelegua(sistemaOperacional.EOL);
    const avaliadorSintatico = new AvaliadorSintatico();
    const lexador = new Lexador();

    it('Escolha', () => {
        const resultadoLexador = lexador.mapear([
            "escolha (2) { caso 1: escreva('correspondente à opção 1'); caso 2: caso 3: escreva('correspondente à opção 2 e 3'); padrao: escreva('Sem opção correspondente'); }",
        ], -1);

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(10);
    });

    it('Enquanto', () => {
        const resultadoLexador = lexador.mapear(
            ["var a = 1 enquanto a < 10 { a += 1}"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(5);
    });

    it('Fazer', () => {
        const resultadoLexador = lexador.mapear(
            ["var a = 1 fazer { a++ } enquanto a < 10 "],
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(5);
    });

    it('Funções', () => {
        const resultadoLexador = lexador.mapear(
            ["funcao teste() { retorna 1} var a = teste() escreva(a)"],
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(6);
    });

    it('Funções, indentação bem zoada', () => {
        const resultadoLexador = lexador.mapear(
            [
                "funcao temDigitoRepetido(num) {",
                "    var str = texto( num);",
                "  para (var i =1; i< tamanho(str);i++   ) {",
                "        se (str[i] != str[0]) {",
                "     retorna falso;",
                "}",
                "    }",
                "   retorna verdadeiro;",
                "}",
            ], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        console.log(resultado);
        expect(linhasResultado).toHaveLength(10);
    });

    it('Funções com argumentos tipados', () => {
        const resultadoLexador = lexador.mapear(
            [
                'função f(a:texto,b:inteiro, c: texto, d){ escreva(a +b)}',
            ], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(4);
    });

    it('Expressões Regulares', () => {
        const resultadoLexador = lexador.mapear(
            [
                "var str = \"olá mundo, olá universo\" var novaStr = str.substituir(||/olá/g||, \"oi\") escreva(novaStr);",
            ], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(4);
    });

    it('Para', () => {
        const resultadoLexador = lexador.mapear(
            ["para var a = 1; a < 10; a++ { se a %2==0 { continua } escreva(a) }"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(7);
    });

    it('Se', () => {
        const resultadoLexador = lexador.mapear(
            ["se a == 1 { escreva(a) } senao {escreva(a + 1)} "], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(6);
    });

    it('Tente', () => {
        const resultadoLexador = lexador.mapear(
            ["tente { escreva('sucesso') } pegue {escreva('pegue')} finalmente { escreva('pronto') }"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(8);
    });

    it('Variaveis', () => {
        const resultadoLexador = lexador.mapear(
            ["var a=1 fixo c = 2"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        console.log(resultado);
        expect(linhasResultado).toHaveLength(3);
    });

    it('Vetor', () => {
        const resultadoLexador = lexador.mapear(
            ["var a = [1,2,3] const c=[4,5,6]"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(3);
    });
});
