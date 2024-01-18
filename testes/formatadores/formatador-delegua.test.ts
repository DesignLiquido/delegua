import * as sistemaOperacional from 'os';

import { FormatadorDelegua } from '../../fontes/formatadores';
import { Lexador } from '../../fontes/lexador';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';

describe('Formatadores > Delégua', () => {
    const formatador = new FormatadorDelegua(sistemaOperacional.EOL);
    const avaliadorSintatico = new AvaliadorSintatico();
    const lexador = new Lexador();

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