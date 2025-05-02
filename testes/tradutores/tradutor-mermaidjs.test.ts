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
        expect(resultado).toContain("Linha1{se verdadeiro}-->|Não|Linha3(Senão);");
        expect(resultado).toContain("Linha3(Senão)-->Linha4(escreva: \\'Falso!\\');");
        expect(resultado).toContain("Linha4(escreva: \\'Falso!\\')-->Fim;");
        expect(resultado).toContain("Linha2(escreva: \\'Verdadeiro!\\')-->Fim;");
    });
});