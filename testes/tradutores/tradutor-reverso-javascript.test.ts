import { TradutorReversoJavaScript } from '../../fontes/tradutores/tradutor-reverso-javascript';
import { Delegua } from '../../fontes/delegua';

describe('Tradutor Reverso JavaScript -> Delégua', () => {
    const tradutor: TradutorReversoJavaScript = new TradutorReversoJavaScript();

    describe('Código', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('delegua');
        });

        it('comparacao de valores -> igualdade', () => {
            const codigo = `console.log(1 === 2)\nconsole.log(1 == '1')\nconsole.log('1' === '1')`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\(1 == 2\)/i);
            expect(resultado).toMatch(/escreva\(1 == '1'\)/i);
            expect(resultado).toMatch(/escreva\('1' == '1'\)/i);
        });

        it('console.log -> escreva', () => {
            const codigo = `console.log('Oi')`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
        });

        it('for -> para', () => {
            const codigo = 'for (let i = 0; i < 10; i++) { console.log(i) }'

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/para \(var i = 0; i < 10; i\+\+\)/i);
            expect(resultado).toMatch(/escreva\(i\)/i);
        });

        it('array - vetor - com valores', () => {
            const codigo = 'let vetor = [1, \'2\']'
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var vetor = \[1, \'2\'\]/i);
        });

        it('array - vetor - vazio', () => {
            const codigo = 'let vetor = []'
            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var vetor = \[\]/i);
        });

        it('const/let/var -> var', () => {
            const codigo = `const a = 1\nlet b = 2\nvar c = 3`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var a = 1/i);
            expect(resultado).toMatch(/var b = 2/i);
            expect(resultado).toMatch(/var c = 3/i);
        });

        it('function -> funcao sem parametro', () => {
            const codigo = `function teste() {console.log(\'Oi\')\nconsole.log(123)}`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/funcao teste\(\)/i);
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
            expect(resultado).toMatch(/escreva\(123\)/i);
        });

        it('function -> funcao com parametro', () => {
            const codigo = `function teste(a, b, c) {console.log(\'Oi\')}`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/funcao teste\(a, b, c\)/i);
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
        });

        it('function -> funcao com retorno vazio', () => {
            const codigo = `function teste(a, b, c) { return '' }`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/funcao teste\(a, b, c\)/i);
            expect(resultado).toMatch(/retorna \'\'/i);
        });

        it('function -> funcao com retorno vazio', () => {
            const codigo = `function teste(a, b, c) { return 0 }`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/funcao teste\(a, b, c\)/i);
            expect(resultado).toMatch(/retorna 0/i);
        });

        it('function -> funcao com retorno de variavel', () => {
            const codigo = `function teste(a, b, c) { return a }`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/funcao teste\(a, b, c\)/i);
            expect(resultado).toMatch(/retorna a/i);
        });

        it('function -> funcao com retorno de soma valores', () => {
            const codigo = `function teste(a, b, c) { return 1 + 2 }`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/funcao teste\(a, b, c\)/i);
            expect(resultado).toMatch(/retorna 1 \+ 2/i);
        });

        it('function -> chamada de função', () => {
            const codigo = `function teste(a, b, c) {console.log(\'Oi\')} teste(1,2,3)`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/funcao teste\(a, b, c\)/i);
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
            expect(resultado).toMatch(/teste\(1, 2, 3\)/i);
        });

        it('class -> classe', () => {
            const codigo = `
                class Base {
                    constructor(){}
                }
                class Rectangle extends Base {
                    constructor(height, width, abc) {
                        this.height = height;
                        this.width = width;
                    }

                    teste(){
                        console.log('oi')
                    }

                    teste2(parametro1){
                        console.log('oi')
                    }
                }
            `

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            // expect(resultado).toMatch(/console\.log\(i\)/i);
        });

        it('class -> classe', () => {
            const codigo = `
                class Base {
                }
                class Retangulo extends Base {
                    constructor(a,b,c){
                    }
                }
                var retangulo = new Retangulo(1,2,'a')
            `

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            // expect(resultado).toMatch(/console\.log\(i\)/i);
        });

        it('while -> enquanto', () => {
            const codigo = `
                let i = 0;
                while(i < 10){
                    escreva(i)
                    i++;
                }
            `

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            // expect(resultado).toMatch(/console\.log\(i\)/i);
        });

        it('do while -> fazer enquanto', () => {
            const codigo = `
                let result = '';
                let i = 0;
                
                do {
                i = i + 1;
                result = result + i;
                } while (i < 5);
                
                console.log(result);
            `

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            // expect(resultado).toMatch(/console\.log\(i\)/i);
        });
    });
});
