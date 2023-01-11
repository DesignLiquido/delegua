import { FormatadorDelegua } from '../../fontes/formatadores';
import { Lexador } from '../../fontes/lexador';

describe('Formatadores > Delégua', () => {
    const formatador = new FormatadorDelegua();
    const lexador = new Lexador();

    it('Trivial', () => {
        const resultadoLexador = lexador.mapear(
            ["tente { escreva('sucesso') } pegue { escreva('pegue') } finalmente { escreva('pronto') }"], 
            -1
        );
        const resultado = formatador.formatar(resultadoLexador.simbolos);
        // console.log(resultado);
        expect(resultado.split('\n')).toHaveLength(10);
    });
});