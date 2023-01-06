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
            const codigo = 'const a = 42\nconst b = \'a\'\nconst c = 1 === 1\nconst d = 1 === \'1\'\nconst e = \'1\' === \'1\'\nconst f = 1 == 1';
            // const codigo = 'const a = () => { console.log(\'Oi\') }';
            // const codigo = 'function abc(parametro1){console.log(\'oi\')\nconsole.log(\'aaaa\')}'
            // const codigo = 'console.log(\'Oi\')'

            const resultado = tradutor.traduzir(codigo);
            // expect(resultado).toBeTruthy();
            // expect(resultado).toMatch(/console\.log\(i\)/i);
        });
    });
});
