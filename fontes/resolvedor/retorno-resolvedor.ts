import { Construto } from "../construtos";
import { ErroResolvedor } from "./erro-resolvedor";

export interface RetornoResolvedor {
    erros: ErroResolvedor[];
    locais: Map<Construto, number>;
}
