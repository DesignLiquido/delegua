import { TradutorReversoJavaScript } from '../../fontes/tradutores/tradutor-reverso-javascript';

describe('Tradutor Reverso JavaScript -> Delégua', () => {
    const tradutor: TradutorReversoJavaScript = new TradutorReversoJavaScript();

    describe('Código', () => {
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

        it('for in -> para cada em', () => {
            const codigo = 'for (let elemento in [1, 2, 3]) { console.log(elemento) }'

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/para \(var elemento em \[1, 2, 3\]\)/i);
            expect(resultado).toMatch(/escreva\(elemento\)/i);
        });

        it('for of -> para cada de', () => {
            const codigo = 'for (let elemento of [1, 2, 3]) { console.log(elemento) }'

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/para \(var elemento de \[1, 2, 3\]\)/i);
            expect(resultado).toMatch(/escreva\(elemento\)/i);
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
            expect(resultado).toMatch(/const a = 1/i);
            expect(resultado).toMatch(/var b = 2/i);
            expect(resultado).toMatch(/var c = 3/i);
        });

        it('const -> const/constante', () => {
            const codigo = `const a = 1`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/const a = 1/i);
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

        it('arrow function -> função seta', () => {
            const codigo = `const func = (a, b, c) => {console.log(\'Oi\')}\nfunc(1,2,3)`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/const func = \(a, b, c\) => {/i);
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
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
            expect(resultado).toMatch(/var i = 0/i);
            expect(resultado).toMatch(/enquanto\(i < 10\){/i);
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
            expect(resultado).toMatch(/fazer{/i);
            expect(resultado).toMatch(/enquanto\(i < 5\)/i);
        });

        it('switch -> escolha', () => {
            const codigo = `
            const palavra = 'Papayas';
            switch (palavra) {
              case 'Laranja':
                console.log('Laranja custa 0.59R$ centavos.');
                break;
              case 'Morango':
              case 'Uva':
                console.log('Morango e Uva custam 2.79R$ Reais.');
                break;
              default:
                console.log('Valor padrão de 5R$');
            }
            `

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escolha\(palavra\)/i);
            expect(resultado).toMatch(/caso \'Laranja\':/i);
            expect(resultado).toMatch(/caso \'Morango\':/i);
            expect(resultado).toMatch(/caso \'Uva\':/i);
            expect(resultado).toMatch(/padrao:/i);
        });

        it('And e Or -> E e Ou', () => {
            const codigo = `
            const v = true && true;
            const f = true || false;
            `

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/const v = verdadeiro e verdadeiro/i);
            expect(resultado).toMatch(/const f = verdadeiro ou falso/i);
        });

        it('if -> se', () => {
            const codigo = `
                let i = 1;                
                if(i == 1){
                    console.log(\'i é igual a 1\')
                }
            `

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var i = 1/i);
            expect(resultado).toMatch(/se \(i == 1\)/i);
        });

        it('if/true/false -> se/verdadeiro/falso', () => {
            const codigo = `             
                if(true){
                    console.log(\'verdadeiro\')
                } else if(false){
                    console.log(\'falso\')
                }
            `

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/se \(verdadeiro\)/i);
            expect(resultado).toMatch(/senao se \(falso\)/i);
        });

        it('if/else if/else -> se/senao se/senao', () => {
            const codigo = `
                let i = 1;                
                if(i == 1){
                    console.log(\'i é igual a 1\')
                } 
                else if(i === 2){
                    console.log(\'i é igual a 2\')
                }
                else if(i === 3){
                    console.log(\'i é igual a 3\')
                } 
                else{
                    console.log(\'i é diferente de 1, 2 e 3\')
                }
            `

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var i = 1/i);
            expect(resultado).toMatch(/se \(i == 1\)/i);
            expect(resultado).toMatch(/senao se \(i == 2\)/i);
            expect(resultado).toMatch(/senao se \(i == 3\)/i);
            expect(resultado).toMatch(/senao {/i);
        });

        it('try/catch/finally -> tente/pegue/finalmente', () => {
            const codigo = `                
                try {
                    console.log(\'Teste1\')
                } catch (erro){
                    console.log(erro)
                } finally {
                    console.log(\'Terminou\')
                }
            `

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/tente/i);
            expect(resultado).toMatch(/pegue\(erro\)/i);
            expect(resultado).toMatch(/finalmente/i);
            expect(resultado).toMatch(/escreva\('Teste1'\)/i);
            // expect(resultado).toMatch(/escreva\(erro\)/i);
            expect(resultado).toMatch(/escreva\('Terminou'\)/i);
        });
    });
});
