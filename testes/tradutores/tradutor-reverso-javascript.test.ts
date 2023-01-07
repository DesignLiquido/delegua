import { TradutorReversoJavaScript } from '../../fontes/tradutores/tradutor-reverso-javascript';
import { Delegua } from '../../fontes/delegua';

describe('Tradutor Reverso Javascript -> Delégua', () => {
    const tradutor: TradutorReversoJavaScript = new TradutorReversoJavaScript();

    describe('Código', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('delegua');
        });

        it('console.log -> escreva', () => {
            const codigo = `console.log('Oi')`

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
        });

        it('const/let/var -> var', () => {
            const codigo = `const a = 1\nlet b = 2\nvar c = 3`

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var a = 1/i);
            expect(resultado).toMatch(/var b = 2/i);
            expect(resultado).toMatch(/var c = 3/i);
        });

        it('function -> funcao', () => {
            const codigo = `function teste(){console.log(\'Oi\')\nconsole.log(123)}`

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/funcao teste\(\)/i);
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
            expect(resultado).toMatch(/escreva\(123\)/i);
        });

        // it('', () => {
        //     // const codigo = 'const a = 42\nconst b = \'a\'\nconst c = 1 === 1\nconst d = 1 === \'1\'\nconst e = \'1\' === \'1\'\nconst f = 1 == 1';
        //     // const codigo = 'const a = () => { console.log(\'Oi\') }';
        //     // const codigo = 'function abc(parametro1){console.log(\'oi\')\nconsole.log(\'aaaa\')}'
        //     // const codigo = 'console.log(\'Oi\')'
        //     const codigo = `
        //         class Rectangle {
        //             constructor(height, width, abc) {
        //                 this.height = height;
        //                 this.width = width;
        //             }

        //             teste(){
        //                 console.log('oi')
        //             }
        //         }
        //     `

        //     const resultado = tradutor.traduzir(codigo);
        //     // expect(resultado).toBeTruthy();
        //     // expect(resultado).toMatch(/console\.log\(i\)/i);
        // });
    });
});
