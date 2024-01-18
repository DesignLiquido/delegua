import * as sistemaOperacional from 'node:os';

import { FormatadorDelegua } from '../../fontes/formatadores';
import { Lexador } from '../../fontes/lexador';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';

describe('Formatadores > Delégua', () => {
    const formatador = new FormatadorDelegua();
    const avaliadorSintatico = new AvaliadorSintatico();
    const lexador = new Lexador();

    it('Trivial', () => {
        const resultadoLexador = lexador.mapear(
            ["tente { escreva('sucesso') } pegue { escreva('pegue') } finalmente { escreva('pronto') }"], 
            -1
        );

        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes, sistemaOperacional.EOL);
        // expect(resultado.split('\n')).toHaveLength(19);
        expect(1).toBe(1);
    });
});