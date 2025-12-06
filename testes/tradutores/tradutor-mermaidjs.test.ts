import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import { Lexador } from "../../fontes/lexador";
import { TradutorMermaidJs } from '../../fontes/tradutores';

describe('Tradutor Delégua -> MermaidJs', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let tradutor: TradutorMermaidJs;

    beforeAll(() => {
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
        tradutor = new TradutorMermaidJs();
    });

    it('Vazio', () => {
        const retornoLexador = lexador.mapear(
            [],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Vazio;");
    });

    it('Olá mundo', () => {
        const retornoLexador = lexador.mapear(
            ['escreva("Olá Mundo!")'],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(escreva: \\'Olá Mundo!\\')-->Fim;");
    });

    it('Enquanto', () => {
        const retornoLexador = lexador.mapear(
            [
                'var a = 1',
                'enquanto a < 5 {',
                '    escreva(a)',
                '    a++',
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(variável: a, iniciada com: 1)-->Linha2(enquanto a for menor que 5);");
        expect(resultado).toContain("Linha2(enquanto a for menor que 5)-->Linha3(escreva: a);");
        expect(resultado).toContain("Linha3(escreva: a)-->Linha4(devolver valor de a, incrementar a em 1);");
        expect(resultado).toContain("Linha4(devolver valor de a, incrementar a em 1)-->Linha2(enquanto a for menor que 5);");
        expect(resultado).toContain("Linha4(devolver valor de a, incrementar a em 1)-->Fim;");
    });

    it('Escolha', () => {
        const retornoLexador = lexador.mapear(
            [
                'var teste = leia("Digite alguma coisa: ")',
                'escolha teste {',
                '  caso "1":',
                '    escreva("correspondente à opção 1");',
                '  caso "2":',
                '    escreva("correspondente à opção 2");',
                '  padrao:',
                '    escreva("Sem opção correspondente");',
                '}',
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(variável: teste, iniciada com: leia da entrada, imprimindo antes: \\'\\'Digite alguma coisa: \\'\\')-->Linha2(escolha um caminho pelo valor de teste);");
        expect(resultado).toContain("Linha2(escolha um caminho pelo valor de teste)-->Linha3(caso teste seja igual a \\'1\\':);");
        expect(resultado).toContain("Linha3(caso teste seja igual a \\'1\\':)-->Linha4(escreva: \\'correspondente à opção 1\\');");
        expect(resultado).toContain("Linha2(escolha um caminho pelo valor de teste)-->Linha5(caso teste seja igual a \\'2\\':);");
        expect(resultado).toContain("Linha5(caso teste seja igual a \\'2\\':)-->Linha6(escreva: \\'correspondente à opção 2\\');");
        expect(resultado).toContain("Linha2(escolha um caminho pelo valor de teste)-->Linha7(caso teste tenha qualquer outro valor:);");
        expect(resultado).toContain("Linha7(caso teste tenha qualquer outro valor:)-->Linha8(escreva: \\'Sem opção correspondente\\');");
        expect(resultado).toContain("Linha4(escreva: \\'correspondente à opção 1\\')-->Fim;");
        expect(resultado).toContain("Linha6(escreva: \\'correspondente à opção 2\\')-->Fim;");
        expect(resultado).toContain("Linha8(escreva: \\'Sem opção correspondente\\')-->Fim;");
    });

    it('Fazer ... Enquanto', () => {
        const retornoLexador = lexador.mapear(
            [
                'var a = 1',
                'fazer {',
                '    escreva(a)',
                '    a++',
                '} enquanto a < 5'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(variável: a, iniciada com: 1)-->Linha2(fazer);");
        expect(resultado).toContain("Linha2(fazer)-->Linha3(escreva: a);");
        expect(resultado).toContain("Linha3(escreva: a)-->Linha4(devolver valor de a, incrementar a em 1);");
        expect(resultado).toContain("Linha4(devolver valor de a, incrementar a em 1)-->Linha5(enquanto a for menor que 5);");
        expect(resultado).toContain("Linha5(enquanto a for menor que 5)-->Linha2(fazer);");
        expect(resultado).toContain("Linha5(enquanto a for menor que 5)-->Fim;");
    });

    it('Para', () => {
        const retornoLexador = lexador.mapear(
            [
                'para (var i = 0; i < 5; i = i + 1) {',
                '    escreva(i);', 
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(para uma variável i inicializada com 0)-->Linha1Condicao{se i for menor que 5};");
        expect(resultado).toContain("Linha1Condicao{se i for menor que 5}-->|Sim|Linha2(escreva: i);");
        expect(resultado).toContain("Linha2(escreva: i)-->Linha1Incremento(i recebe: somar i e 1);");
        expect(resultado).toContain("Linha1Incremento(i recebe: somar i e 1)-->Linha1Condicao{se i for menor que 5};");
        expect(resultado).toContain("Linha1Condicao{se i for menor que 5}-->|Não|Fim;");
    });

    it('Para cada', () => {
        const retornoLexador = lexador.mapear(
            [
                'para cada elemento em [1, 2, 3, 4, 5] {',
                '    escreva(elemento);', 
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(para cada elemento em vetor: 1, 2, 3, 4, 5)-->Linha2(escreva: elemento);");
        expect(resultado).toContain("Linha2(escreva: elemento)-->Linha1(para cada elemento em vetor: 1, 2, 3, 4, 5);");
        expect(resultado).toContain("Linha2(escreva: elemento)-->Fim;");
    });

    it('Se e senão', () => {
        const retornoLexador = lexador.mapear(
            [
                'se verdadeiro {',
                '    escreva("Verdadeiro!")',
                '} senão {',
                '    escreva("Falso!")',
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1{se verdadeiro}-->|Sim|Linha2(escreva: \\'Verdadeiro!\\');");
        expect(resultado).toContain("Linha1{se verdadeiro}-->|Não|Linha3(senão);");
        expect(resultado).toContain("Linha3(senão)-->Linha4(escreva: \\'Falso!\\');");
        expect(resultado).toContain("Linha4(escreva: \\'Falso!\\')-->Fim;");
        expect(resultado).toContain("Linha2(escreva: \\'Verdadeiro!\\')-->Fim;");
    });

    describe.skip('Funções', () => {
        it('Função simples sem parâmetros', () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao saudar() {',
                    '    escreva("Olá!")',
                    '}',
                    'saudar()'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            console.log(resultado);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("Linha1[[definir função saudar]]");
            expect(resultado).toContain("Linha4(chamada a saudar, sem argumentos)");
        });

        it('Função com parâmetros', () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao somar(a: inteiro, b: inteiro) {',
                    '    retorna a + b',
                    '}',
                    'var resultado = somar(5, 3)'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("Linha1[[definir função somar com parâmetros: a: inteiro, b: inteiro]]");
            expect(resultado).toContain("chamada a somar, com argumentos: 5, 3");
        });

        it('Função com parâmetros sem tipo', () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao multiplicar(x, y) {',
                    '    retorna x * y',
                    '}',
                    'multiplicar(4, 7)'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("Linha1[[definir função multiplicar com parâmetros: x: qualquer, y: qualquer]]");
            expect(resultado).toContain("chamada a multiplicar, com argumentos: 4, 7");
        });

        it('Função com lógica condicional', () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao verificarParidade(numero: inteiro) {',
                    '    se numero % 2 == 0 {',
                    '        escreva("Par")',
                    '    } senão {',
                    '        escreva("Ímpar")',
                    '    }',
                    '}',
                    'verificarParidade(10)'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("Linha1[[definir função verificarParidade com parâmetros: numero: inteiro]]");
            expect(resultado).toContain("chamada a verificarParidade, com argumentos: 10");
        });

        it('Múltiplas funções', () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao funcao1() {',
                    '    escreva("Função 1")',
                    '}',
                    'funcao funcao2(x: texto) {',
                    '    escreva(x)',
                    '}',
                    'funcao1()',
                    'funcao2("Olá")'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("Linha1[[definir função funcao1]]");
            expect(resultado).toContain("Linha4[[definir função funcao2 com parâmetros: x: texto]]");
            expect(resultado).toContain("chamada a funcao1, sem argumentos");
            expect(resultado).toContain("chamada a funcao2, com argumentos: \\'Olá\\'");
        });
    });

    // ========== TESTES PARA CLASSES ==========

    describe.skip('Classes', () => {
        it('Classe simples sem métodos', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Pessoa {',
                    '}',
                    'var p = Pessoa()'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("Linha1_ClasseEntrada_Pessoa((Definir classe Pessoa))");
            expect(resultado).toContain("Linha1_ClasseSaida_Pessoa((Classe Pessoa definida))");
            expect(resultado).toContain("subgraph Classe_Pessoa");
        });

        it('Classe com um método', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Animal {',
                    '    metodo falar() {',
                    '        escreva("Som genérico")',
                    '    }',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("subgraph Classe_Animal");
            expect(resultado).toContain("Metodo_falar_Animal");
            expect(resultado).toContain("escreva: \\'Som genérico\\'");
        });

        it('Classe com múltiplos métodos', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Calculadora {',
                    '    metodo somar(a: inteiro, b: inteiro) {',
                    '        retorna a + b',
                    '    }',
                    '    metodo subtrair(a: inteiro, b: inteiro) {',
                    '        retorna a - b',
                    '    }',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("subgraph Classe_Calculadora");
            expect(resultado).toContain("Metodo_somar_Calculadora");
            expect(resultado).toContain("Metodo_subtrair_Calculadora");
            expect(resultado).toContain("a: inteiro, b: inteiro");
        });

        it('Classe com herança', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Animal {',
                    '    metodo falar() {',
                    '        escreva("Som")',
                    '    }',
                    '}',
                    'classe Cachorro herda Animal {',
                    '    metodo latir() {',
                    '        escreva("Au au!")',
                    '    }',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("subgraph Classe_Animal");
            expect(resultado).toContain("subgraph Classe_Cachorro");
            expect(resultado).toContain("estende Animal");
            expect(resultado).toContain("Metodo_falar_Animal");
            expect(resultado).toContain("Metodo_latir_Cachorro");
        });

        it('Classe com método contendo lógica condicional', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Validador {',
                    '    metodo ehMaiorDeIdade(idade: inteiro) {',
                    '        se idade >= 18 {',
                    '            escreva("Maior de idade")',
                    '        } senão {',
                    '            escreva("Menor de idade")',
                    '        }',
                    '    }',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("subgraph Classe_Validador");
            expect(resultado).toContain("Metodo_ehMaiorDeIdade_Validador");
            expect(resultado).toContain("se idade");
        });

        it('Classe com método contendo loops', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Contador {',
                    '    metodo contar(limite: inteiro) {',
                    '        para (var i = 0; i < limite; i++) {',
                    '            escreva(i)',
                    '        }',
                    '    }',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("subgraph Classe_Contador");
            expect(resultado).toContain("Metodo_contar_Contador");
            expect(resultado).toContain("para uma variável");
        });
    });

    // ========== TESTES COMBINADOS ==========

    describe.skip('Funções e Classes Combinadas', () => {
        it('Função que cria instância de classe', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Pessoa {',
                    '    metodo saudar() {',
                    '        escreva("Olá!")',
                    '    }',
                    '}',
                    'funcao criarPessoa() {',
                    '    retorna Pessoa()',
                    '}',
                    'var p = criarPessoa()'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("subgraph Classe_Pessoa");
            expect(resultado).toContain("Linha6[[definir função criarPessoa]]");
            expect(resultado).toContain("chamada a criarPessoa");
        });

        it('Classe com método que chama outra função', () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao formatar(texto: texto) {',
                    '    retorna texto',
                    '}',
                    'classe Impressora {',
                    '    metodo imprimir(mensagem: texto) {',
                    '        var formatada = formatar(mensagem)',
                    '        escreva(formatada)',
                    '    }',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain("Linha1[[definir função formatar");
            expect(resultado).toContain("subgraph Classe_Impressora");
            expect(resultado).toContain("chamada a formatar");
        });
    });
});