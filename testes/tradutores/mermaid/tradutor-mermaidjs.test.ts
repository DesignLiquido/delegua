import { AvaliadorSintatico } from "../../../fontes/avaliador-sintatico";
import { Lexador } from "../../../fontes/lexador";
import { TradutorMermaidJs } from '../../../fontes/tradutores';

describe('Tradutor Delégua -> MermaidJs', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let tradutor: TradutorMermaidJs;

    beforeAll(() => {
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
        tradutor = new TradutorMermaidJs();
    });

    it('Vazio', async () => {
        const retornoLexador = lexador.mapear(
            [],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Vazio;");
    });

    it('Olá mundo', async () => {
        const retornoLexador = lexador.mapear(
            ['escreva("Olá Mundo!")'],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(escreva: \\'Olá Mundo!\\')-->Fim;");
    });

    it('Enquanto', async () => {
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

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(variável: a, iniciada com: 1)-->Linha2(enquanto a for menor que 5);");
        expect(resultado).toContain("Linha2(enquanto a for menor que 5)-->Linha3(escreva: a);");
        expect(resultado).toContain("Linha3(escreva: a)-->Linha4(devolver valor de a, incrementar a em 1);");
        expect(resultado).toContain("Linha4(devolver valor de a, incrementar a em 1)-->Linha2(enquanto a for menor que 5);");
        expect(resultado).toContain("Linha4(devolver valor de a, incrementar a em 1)-->Fim;");
    });

    it('Escolha', async () => {
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

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

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

    it('Fazer ... Enquanto', async () => {
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

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

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

    it('Para', async () => {
        const retornoLexador = lexador.mapear(
            [
                'para (var i = 0; i < 5; i = i + 1) {',
                '    escreva(i);', 
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(para uma variável i inicializada com 0)-->Linha1Condicao{se i for menor que 5};");
        expect(resultado).toContain("Linha1Condicao{se i for menor que 5}-->|Sim|Linha2(escreva: i);");
        expect(resultado).toContain("Linha2(escreva: i)-->Linha1Incremento(i recebe: somar i e 1);");
        expect(resultado).toContain("Linha1Incremento(i recebe: somar i e 1)-->Linha1Condicao{se i for menor que 5};");
        expect(resultado).toContain("Linha1Condicao{se i for menor que 5}-->|Não|Fim;");
    });

    it('Para cada', async () => {
        const retornoLexador = lexador.mapear(
            [
                'para cada elemento em [1, 2, 3, 4, 5] {',
                '    escreva(elemento);', 
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(para cada elemento em vetor: 1, 2, 3, 4, 5)-->Linha2(escreva: elemento);");
        expect(resultado).toContain("Linha2(escreva: elemento)-->Linha1(para cada elemento em vetor: 1, 2, 3, 4, 5);");
        expect(resultado).toContain("Linha2(escreva: elemento)-->Fim;");
    });

    it('Se e senão', async () => {
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

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1{se verdadeiro}-->|Sim|Linha2(escreva: \\'Verdadeiro!\\');");
        expect(resultado).toContain("Linha1{se verdadeiro}-->|Não|Linha3(senão);");
        expect(resultado).toContain("Linha3(senão)-->Linha4(escreva: \\'Falso!\\');");
        expect(resultado).toContain("Linha4(escreva: \\'Falso!\\')-->Fim;");
        expect(resultado).toContain("Linha2(escreva: \\'Verdadeiro!\\')-->Fim;");
    });

    it('Expressões lógicas com E e OU', async () => {
        const retornoLexador = lexador.mapear(
            [
                'var a = 5',
                'var b = 10',
                'se a > 0 e b < 20 {',
                '    escreva("Ambas condições verdadeiras")',
                '}',
                'se a < 0 ou b > 5 {',
                '    escreva("Pelo menos uma condição verdadeira")',
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("a for maior que 0 e b for menor que 20");
        expect(resultado).toContain("a for menor que 0 ou b for maior que 5");
    });

    it('Tente-Pegue-Finalmente', async () => {
        const retornoLexador = lexador.mapear(
            [
                'tente {',
                '    escreva("Tentando...")',
                '} pegue {',
                '    escreva("Erro capturado")',
                '} finalmente {',
                '    escreva("Finalizando")',
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(tente)");
        expect(resultado).toContain("Linha1Pegue(pegue)");
        expect(resultado).toContain("Linha1Finalmente(finalmente)");
        expect(resultado).toContain("escreva: \\'Tentando...\\'");
        expect(resultado).toContain("escreva: \\'Erro capturado\\'");
        expect(resultado).toContain("escreva: \\'Finalizando\\'");
    });

    it('Tente-Pegue sem Finalmente', async () => {
        const retornoLexador = lexador.mapear(
            [
                'tente {',
                '    var x = 10',
                '} pegue {',
                '    escreva("Erro")',
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha1(tente)");
        expect(resultado).toContain("Linha1Pegue(pegue)");
        expect(resultado).toContain("variável: x");
    });

    it('Atribuição por índice em vetor', async () => {
        const retornoLexador = lexador.mapear(
            [
                'var vetor = [1, 2, 3]',
                'vetor[0] = 10',
                'vetor[1] = 20'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("vetor no índice 0 recebe: 10");
        expect(resultado).toContain("vetor no índice 1 recebe: 20");
    });

    it('Continua em laço para', async () => {
        const retornoLexador = lexador.mapear(
            [
                'para (var i = 0; i < 5; i++) {',
                '    se (i == 3) {',
                '        continua',
                '    }',
                '    escreva(i)',
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha3(continua)");
        expect(resultado).toContain("se i for igual a 3");
    });

    it('Função anônima', async () => {
        const retornoLexador = lexador.mapear(
            [
                'var dobrar = funcao(x) {',
                '    retorna x * 2',
                '}',
                'var resultado = dobrar(5)'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("função anônima(x)");
    });

    it('Expressão regular - implementação básica', async () => {
        // Teste direto do método visitarExpressaoExpressaoRegular
        // Nota: A sintaxe de regex em Delegua pode variar por dialeto
        const { ExpressaoRegular } = require('../../../fontes/construtos');
        const { SimboloInterface } = require('../../../fontes/interfaces');

        const simboloMock = {
            tipo: 'EXPRESSAO_REGULAR',
            lexema: '[0-9]+',
            literal: null,
            linha: 1,
            hashArquivo: -1
        };

        const expressaoRegex = new ExpressaoRegular(-1, simboloMock, '[0-9]+');
        const resultado = await tradutor.visitarExpressaoExpressaoRegular(expressaoRegex);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain("expressão regular:");
        expect(resultado).toContain("[0-9]+");
    });

    it('Falhar com mensagem', async () => {
        const retornoLexador = lexador.mapear(
            [
                'se verdadeiro {',
                '    falhar "Erro ocorreu"',
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha2(falhar:");
        expect(resultado).toContain("Erro ocorreu");
    });

    it('Sustar em laço para', async () => {
        const retornoLexador = lexador.mapear(
            [
                'para (var i = 0; i < 10; i++) {',
                '    se (i == 5) {',
                '        sustar',
                '    }',
                '    escreva(i)',
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("Linha3(sustar)");
        expect(resultado).toContain("se i for igual a 5");
    });

    it('Tupla com valores', async () => {
        const retornoLexador = lexador.mapear(
            [
                'var coordenadas = (10, 20, 30)',
                'var pessoa = ("João", 25)',
                'escreva(coordenadas)',
                'escreva(pessoa)'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        // console.log(resultado);
        expect(resultado).toBeTruthy();
        expect(resultado).toContain("graph TD;");
        expect(resultado).toContain("tupla(");
    });

    it('Argumento referência função - implementação básica', async () => {
        // Teste direto do método visitarExpressaoArgumentoReferenciaFuncao
        const { ArgumentoReferenciaFuncao } = require('../../../fontes/construtos');

        const simboloMock = {
            tipo: 'IDENTIFICADOR',
            lexema: 'minhaFuncao',
            literal: null,
            linha: 1,
            hashArquivo: -1
        };

        const argumentoRef = new ArgumentoReferenciaFuncao(-1, 1, simboloMock);
        const resultado = await tradutor.visitarExpressaoArgumentoReferenciaFuncao(argumentoRef);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain("referência à função");
        expect(resultado).toContain("minhaFuncao");
    });

    it('Formatação escrita - implementação básica', async () => {
        // Teste direto do método visitarExpressaoFormatacaoEscrita
        const { FormatacaoEscrita } = require('../../../fontes/construtos');
        const { Literal } = require('../../../fontes/construtos');

        const literal = new Literal(-1, 1, 3.14159, 'número');
        const formatacao = new FormatacaoEscrita(-1, 1, literal, 10, 2);

        const resultado = await tradutor.visitarExpressaoFormatacaoEscrita(formatacao);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain("10 espaços");
        expect(resultado).toContain("2 casas decimais");
    });

    it('Referência função - implementação básica', async () => {
        // Teste direto do método visitarExpressaoReferenciaFuncao
        const { ReferenciaFuncao } = require('../../../fontes/construtos');

        const simboloMock = {
            tipo: 'IDENTIFICADOR',
            lexema: 'processar',
            literal: null,
            linha: 1,
            hashArquivo: -1
        };

        const referenciaFuncao = new ReferenciaFuncao(-1, 1, simboloMock, 'funcao', 'processar_123');
        const resultado = await tradutor.visitarExpressaoReferenciaFuncao(referenciaFuncao);

        expect(resultado).toBeTruthy();
        expect(resultado).toBe("@processar");
    });

    it('Super - implementação básica', async () => {
        // Teste direto do método visitarExpressaoSuper
        const { Super } = require('../../../fontes/construtos');

        const simboloMock = {
            tipo: 'SUPER',
            lexema: 'super',
            literal: null,
            linha: 1,
            hashArquivo: -1
        };

        const expressaoSuper = new Super(-1, simboloMock, 'Animal');
        const resultado = await tradutor.visitarExpressaoSuper(expressaoSuper);

        expect(resultado).toBeTruthy();
        expect(resultado).toBe("super");
    });

    describe('Funções', () => {
        it('Função simples sem parâmetros', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao saudar() {',
                    '    escreva("Olá!")',
                    '}',
                    'saudar()'
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            console.log(resultado);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph saudar["Função: saudar()"]');
            expect(resultado).toContain("FuncsaudarInicio[Início: saudar()]");
            expect(resultado).toContain("FuncsaudarFim[Fim: saudar()]");
            expect(resultado).toContain("Linha4(chamada a saudar, sem argumentos)");
        });

        it('Função com parâmetros', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao somar(a: inteiro, b: inteiro) {',
                    '    retorna a + b',
                    '}',
                    'var resultado = somar(5, 3)'
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph somar["Função: somar()"]');
            expect(resultado).toContain("FuncsomarInicio[Início: somar()]");
            expect(resultado).toContain("FuncsomarFim[Fim: somar()]");
            expect(resultado).toContain("chamada a somar, com argumentos: 5, 3");
        });

        it('Função com parâmetros sem tipo', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao multiplicar(x, y) {',
                    '    retorna x * y',
                    '}',
                    'multiplicar(4, 7)'
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph multiplicar["Função: multiplicar()"]');
            expect(resultado).toContain("FuncmultiplicarInicio[Início: multiplicar()]");
            expect(resultado).toContain("FuncmultiplicarFim[Fim: multiplicar()]");
            expect(resultado).toContain("chamada a multiplicar, com argumentos: 4, 7");
        });

        it('Função com lógica condicional', async () => {
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

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph verificarParidade["Função: verificarParidade()"]');
            expect(resultado).toContain("FuncverificarParidadeInicio[Início: verificarParidade()]");
            expect(resultado).toContain("FuncverificarParidadeFim[Fim: verificarParidade()]");
            expect(resultado).toContain("chamada a verificarParidade, com argumentos: 10");
        });

        it('Múltiplas funções', async () => {
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

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph funcao1["Função: funcao1()"]');
            expect(resultado).toContain("Funcfuncao1Inicio[Início: funcao1()]");
            expect(resultado).toContain("Funcfuncao1Fim[Fim: funcao1()]");
            expect(resultado).toContain('subgraph funcao2["Função: funcao2()"]');
            expect(resultado).toContain("Funcfuncao2Inicio[Início: funcao2()]");
            expect(resultado).toContain("Funcfuncao2Fim[Fim: funcao2()]");
            expect(resultado).toContain("chamada a funcao1, sem argumentos");
            expect(resultado).toContain("chamada a funcao2, com argumentos: \\'Olá\\'");
        });
    });

    // ========== TESTES PARA CLASSES ==========

    describe('Classes', () => {
        it('Classe simples sem métodos', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Pessoa {',
                    '}',
                    'var p = Pessoa()'
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph Pessoa["Classe: Pessoa"]');
        });

        it('Classe com um método', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Animal {',
                    '    falar() {',
                    '        escreva("Som genérico")',
                    '    }',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph Animal["Classe: Animal"]');
            expect(resultado).toContain('subgraph falar_Animal["Método: falar()"]');
            expect(resultado).toContain("MetodofalarAnimalInicio[Início: falar()]");
            expect(resultado).toContain("MetodofalarAnimalFim[Fim: falar()]");
            expect(resultado).toContain("escreva: \\'Som genérico\\'");
        });

        it('Classe com múltiplos métodos', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Calculadora {',
                    '    somar(a: inteiro, b: inteiro) {',
                    '        retorna a + b',
                    '    }',
                    '    subtrair(a: inteiro, b: inteiro) {',
                    '        retorna a - b',
                    '    }',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph Calculadora["Classe: Calculadora"]');
            expect(resultado).toContain('subgraph somar_Calculadora["Método: somar()"]');
            expect(resultado).toContain('subgraph subtrair_Calculadora["Método: subtrair()"]');
            expect(resultado).toContain("MetodosomarCalculadoraInicio[Início: somar()]");
            expect(resultado).toContain("MetodosubtrairCalculadoraInicio[Início: subtrair()]");
        });

        it('Classe com herança', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Animal {',
                    '    falar() {',
                    '        escreva("Som")',
                    '    }',
                    '}',
                    'classe Cachorro herda Animal {',
                    '    latir() {',
                    '        escreva("Au au!")',
                    '    }',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph Animal["Classe: Animal"]');
            expect(resultado).toContain('subgraph Cachorro["Classe: Cachorro (estende Animal)"]');
            expect(resultado).toContain('subgraph falar_Animal["Método: falar()"]');
            expect(resultado).toContain('subgraph latir_Cachorro["Método: latir()"]');
        });

        it('Classe com método contendo lógica condicional', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Validador {',
                    '    ehMaiorDeIdade(idade: inteiro) {',
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

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph Validador["Classe: Validador"]');
            expect(resultado).toContain('subgraph ehMaiorDeIdade_Validador["Método: ehMaiorDeIdade()"]');
            expect(resultado).toContain("{se idade for maior ou igual a 18}");
            expect(resultado).toContain("senão");
        });

        it('Classe com método contendo loops', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Contador {',
                    '    contar(limite: inteiro) {',
                    '        para (var i = 0; i < limite; i++) {',
                    '            escreva(i)',
                    '        }',
                    '    }',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph Contador["Classe: Contador"]');
            expect(resultado).toContain('subgraph contar_Contador["Método: contar()"]');
            expect(resultado).toContain("para uma variável");
        });
    });

    // ========== TESTES COMBINADOS ==========

    describe('Funções e Classes Combinadas', () => {
        it('Função que cria instância de classe', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Pessoa {',
                    '    saudar() {',
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

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph Pessoa["Classe: Pessoa"]');
            expect(resultado).toContain('subgraph saudar_Pessoa["Método: saudar()"]');
            expect(resultado).toContain('subgraph criarPessoa["Função: criarPessoa()"]');
            expect(resultado).toContain("chamada a criarPessoa");
        });

        it('Classe com método que chama outra função', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao formatar(texto: texto) {',
                    '    retorna texto',
                    '}',
                    'classe Impressora {',
                    '    imprimir(mensagem: texto) {',
                    '        var formatada = formatar(mensagem)',
                    '        escreva(formatada)',
                    '    }',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("graph TD;");
            expect(resultado).toContain('subgraph formatar["Função: formatar()"]');
            expect(resultado).toContain('subgraph Impressora["Classe: Impressora"]');
            expect(resultado).toContain('subgraph imprimir_Impressora["Método: imprimir()"]');
            expect(resultado).toContain("chamada a formatar");
        });
    });
});