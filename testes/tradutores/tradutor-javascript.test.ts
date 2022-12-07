import { Binario, Variavel, Literal } from "../../fontes/construtos";
import { Se, Bloco, Escreva } from "../../fontes/declaracoes";
import { Simbolo } from "../../fontes/lexador";
import { TradutorJavaScript } from "../../fontes/tradutores";

import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';
import { Delegua } from "../../fontes/delegua";

describe("Tradutor Delégua -> JavaScript", () => {
    const tradutor: TradutorJavaScript = new TradutorJavaScript();

    describe("Programático", () => {
        it("se -> if, programático", () => {
            const se = new Se(
                new Binario(-1,
                    new Variavel(-1, new Simbolo(tiposDeSimbolos.IDENTIFICADOR, "a", null, 1, -1)),
                    new Simbolo(tiposDeSimbolos.IGUAL_IGUAL, "", null, 1, -1),
                    new Literal(-1, 1, 1)),
                new Bloco(-1, 1, [
                    new Escreva(2, -1, [new Literal(-1, 1, 10)])
                ]),
                null,
                null
            );
            const resultado = tradutor.traduzir([se]);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
        });
    });

    describe("Código", () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('delegua');
        });

        it("função -> function", () => {
            const retornoLexador = delegua.lexador.mapear(
                [
                    "funcao minhaFuncao(teste) {",
                    "    escreva(teste)",
                    "}"
                ],
                -1
            );
            const retornoAvaliadorSintatico =
                delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/console\.log\(teste\)/i);
        })

        it("se -> if, código", () => {
            const retornoLexador = delegua.lexador.mapear(
                [
                    "se (a == 1) {",
                    "    escreva(10)",
                    "}"
                ],
                -1
            );
            const retornoAvaliadorSintatico =
                delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
        });
    });
});
