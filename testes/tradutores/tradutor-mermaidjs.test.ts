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
});