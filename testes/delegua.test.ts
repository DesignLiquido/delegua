import { Delegua } from '../fontes/delegua';
import { TradutorJavaScript, TradutorReversoJavaScript } from '../fontes/tradutores';

describe('Delégua', () => {
    let delegua: Delegua;

    beforeEach(() => {
        delegua = new Delegua('delegua');
    });

    describe('Sucesso', () => {
        it('Obter versão Delégua', () => {
            const versaoDelegua = delegua.versao();

            expect(versaoDelegua).toBeTruthy();
        });

        it('Traduzir delégua para javascript', () => {
            expect(new Delegua('', false, false, 'js').tradutorJavaScript).toBeInstanceOf(TradutorJavaScript);
            expect(new Delegua('', false, false, 'javascript').tradutorJavaScript).toBeInstanceOf(TradutorJavaScript);
        });

        it('Traduzir javascript para delégua', () => {
            expect(new Delegua('', false, false, 'delegua').tradutorReversoJavascript).toBeInstanceOf(TradutorReversoJavaScript);
        });
    });

    describe('Falha', () => {
        it('Tradutor', () => {
            expect(() => new Delegua('', false, false, 'go')).toThrow(
                new Error('Tradutor \'go\' não implementado.')
            );
        });
    });
});
