import { Literal } from '../../fontes/construtos';
import { Simbolo } from '../../fontes/lexador';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

export function criarSimbolo(lexema: string, tipo: string = tiposDeSimbolos.IDENTIFICADOR): Simbolo {
    return new Simbolo(tipo as any, lexema, lexema, 1, 1);
}

export function criarLiteral(valor: any, tipo: string = 'número'): Literal {
    return new Literal(1, 1, valor, tipo as any);
}
