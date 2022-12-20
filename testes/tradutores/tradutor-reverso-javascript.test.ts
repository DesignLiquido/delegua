import { Binario, Variavel, Literal } from '../../fontes/construtos';
import { Se, Bloco, Escreva } from '../../fontes/declaracoes';
import { Simbolo } from '../../fontes/lexador';
import { TradutorReversoJavaScript } from '../../fontes/tradutores/tradutor-reverso-javascript';

import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';
import { Delegua } from '../../fontes/delegua';

describe('Tradutor Reverso Javascript -> Delégua', () => {
    const tradutor: TradutorReversoJavaScript = new TradutorReversoJavaScript();

    describe('Código', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('delegua');
        });

        it('', () => {
            // const retornoLexador = delegua.lexador.mapear(
            //     [
            //         'para (var i = 0; i < 5; i = i + 1) {',
            //             'escreva(i);',
            //         '}',
            //     ],
            //     -1
            // );
            // const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            // const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            // expect(resultado).toBeTruthy();
            // expect(resultado).toMatch(/console\.log\(i\)/i);
        });
    });
});
