import * as sistemaOperacional from 'os';

import { FormatadorDelegua } from '../../fontes/formatadores';
import { Lexador } from '../../fontes/lexador';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';

describe('Formatadores > Delégua', () => {
    const formatador = new FormatadorDelegua(sistemaOperacional.EOL);
    const avaliadorSintatico = new AvaliadorSintatico();
    const lexador = new Lexador();

    it('Atribuições múltiplas', () => {
        const resultadoLexador = lexador.mapear([
            "var a, b, c = 1, 2, 3 const d,f,g=4,5,6",
        ], -1);

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(7);
    })

    it('Classes', () => {
        const resultadoLexador = lexador.mapear([
            `classe Teste {propriedade1: numero propriedade2: texto construtor(){isto.propriedade1=0 isto.propriedade2="123"}testeMetodo(argumento1: numero){isto.propriedade1=argumento1}}`,
        ], -1);

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(13);
    });

    // TODO: Corrigir avaliação de estrutura `super` antes de religar este teste.
    it.skip('Classes com herança, uso de super', () => {
        const resultadoLexador = lexador.mapear([
            `classe Ancestral{propriedade1: numero construtor(){super.propriedade1=0 }}`,
            `classe Teste herda Ancestral{ super()}`,
        ], -1);

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(13);
    });

    it('Dicionários', () => {
        const resultadoLexador = lexador.mapear([
            `var dicionario = {  'a':1, 'b'  : 2    }`,
        ], -1);

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(2);
    });

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
            ["var a = 1 enquanto a < 10 { a += 1 se a > 8 {sustar  }}"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(8);
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
        
        // console.log(resultado);
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

    it('leia() e escreva()', () => {
        const resultadoLexador = lexador.mapear(
            [`var a=leia( "Escreva alguma coisa"   ) escreva( a )`], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        console.log(resultado);
        expect(linhasResultado).toHaveLength(3);
    });

    it('Operadores lógicos', () => {
        const resultadoLexador = lexador.mapear(
            [`var a=falso var b=verdadeiro escreva( a    ou b)`], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        console.log(resultado);
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

    it('Para cada', () => {
        const resultadoLexador = lexador.mapear(
            ["var a = [1, 2,3] para cada  elemento   de  a    {  escreva( a  ) }"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(5);
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

    it('Tipo de', () => {
        const resultadoLexador = lexador.mapear(
            [`var a   = "Teste" escreva( tipo     de a      )`],
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        console.log(resultado);
        expect(linhasResultado).toHaveLength(3);
    });

    it('Variaveis', () => {
        const resultadoLexador = lexador.mapear(
            ["var a=1 fixo c = 2"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(3);
    });

    it('Vetor', () => {
        const resultadoLexador = lexador.mapear(
            ["var a = [1,2,3] const c=[4,5,6] escreva(a[0])"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        console.log(resultado);
        expect(linhasResultado).toHaveLength(4);
    });

    it('Falhar', () => {
        const resultadoLexador = lexador.mapear(
            [
                "funcao temDigitoRepetido(num) {",
                "    var str = texto( num);",
                "  para (var i =1; i< tamanho(str);i++   ) {",
                "        se (str[i] != str[0]) {",
                "     falhar \"Erro!!!\"",
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
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(10);
    });

    it('Importar', () => {
        const resultadoLexador = lexador.mapear(
            [
                "var dm = importar('@designliquido/delegua-matematica')var m = importar('matematica') dm.raizQuadrada(9) // Imprime 3",
            ], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        console.log(resultado);
        expect(linhasResultado).toHaveLength(3);
    });

    it('Atribuição por Indice', () => {
        const resultadoLexador = lexador.mapear(
            ["var fila = []; fila[0] = 1 fila[1] = 2 fila[3] = 3 escreva(fila[3])"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(6);
    });
});
