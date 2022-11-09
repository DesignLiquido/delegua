import { Binario, Literal, Variavel } from "./fontes/construtos";
import { Bloco, Se } from "./fontes/declaracoes";
import { Simbolo } from "./fontes/lexador";
import { TradutorJavaScript } from "./fontes/tradutores";

import tiposDeSimbolos from './fontes/tipos-de-simbolos/delegua';

const tradutorJs = new TradutorJavaScript();
const se = new Se(
    new Binario(-1,
        new Variavel(-1, new Simbolo(tiposDeSimbolos.IDENTIFICADOR, "a", null, 1, -1)),
        new Simbolo(tiposDeSimbolos.IGUAL_IGUAL, "", null, 1, -1),
        new Literal(-1, 1, 1)),
    new Bloco(-1, 1, []),
    null,
    null
);
console.log(tradutorJs.traduzir([se]));
