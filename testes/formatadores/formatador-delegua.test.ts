import * as sistemaOperacional from 'os';

import { FormatadorDelegua } from '../../fontes/formatadores';
import { Lexador } from '../../fontes/lexador';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';

describe('Formatadores > Delégua', () => {
    const formatador = new FormatadorDelegua(sistemaOperacional.EOL);
    const avaliadorSintatico = new AvaliadorSintatico();
    const lexador = new Lexador();

    it('Variaveis', () => {
        const resultadoLexador = lexador.mapear(
            ["var a = 1 fixo c = 2"], 
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
            ["var a = [1,2,3] var c = [4,5,6]"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        console.log(resultado);
        expect(linhasResultado).toHaveLength(3);
    });

    it('Escolha', () => {
        const resultadoLexador = lexador.mapear([
            "escolha (2) { caso 1: escreva('correspondente à opção 1'); caso 2: caso 3: escreva('correspondente à opção 2 e 3'); padrao: escreva('Sem opção correspondente'); }",
        ], -1);

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(11);
    });

    it('Enquanto', () => {
        const resultadoLexador = lexador.mapear(
            ["var a = 1 enquanto a < 10 { a++ }"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(6);
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
        expect(linhasResultado).toHaveLength(6);
    });

    it('Para', () => {
        const resultadoLexador = lexador.mapear(
            ["para var a = 1; a < 10; a++ { escreva(a) }"], 
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
            ["se a == 1 { escreva(a) } senao { escreva(a + 1) } "], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(7);
    });

    it('Tente', () => {
        const resultadoLexador = lexador.mapear(
            ["tente { escreva('sucesso') } pegue { escreva('pegue') } finalmente { escreva('pronto') }"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(9);
    });
});
