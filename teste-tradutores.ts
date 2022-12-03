import { Binario, Literal, Variavel } from "./fontes/construtos";
import { Bloco, Escreva, Se } from "./fontes/declaracoes";
import { Lexador, Simbolo } from "./fontes/lexador";
import { TradutorJavaScript } from "./fontes/tradutores";

import tiposDeSimbolos from './fontes/tipos-de-simbolos/delegua';
import { AvaliadorSintatico } from "./fontes/avaliador-sintatico";

const tradutorJs = new TradutorJavaScript();
/* const se = new Se(
    new Binario(-1,
        new Variavel(-1, new Simbolo(tiposDeSimbolos.IDENTIFICADOR, "a", null, 1, -1)),
        new Simbolo(tiposDeSimbolos.IGUAL_IGUAL, "", null, 1, -1),
        new Literal(-1, 1, 1)),
    new Bloco(-1, 1, [
        new Escreva(2, -1, [new Literal(-1, 1, 10)])
    ]),
    null,
    null
); */
const lexador = new Lexador();
const avaliadorSintatico = new AvaliadorSintatico();
const resultadoLexador = lexador.mapear([
    "classe Resposta { ",
    "    enviar(codigo) { ",
    "        isto.codigo = codigo ",
    "        retorna(isto) ",
    "    } ",
    " ",
    "    status(statusHttp) { ",
    "        isto.statusHttp = statusHttp ",
    "        retorna(isto) ",
    "    } ",
    "} "
], -1)
const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador, -1);
console.log(tradutorJs.traduzir(resultadoAvaliadorSintatico.declaracoes));
