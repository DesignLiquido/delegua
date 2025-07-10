import { InformacaoVariavelOuConstante } from "../informacao-variavel-ou-constante";
import { PrimitivaInterface } from "../interfaces";

export function registrarPrimitiva(
    primitivasConhecidas: { [nomeModuloOuClasse: string]: {[nomePrimitiva: string]: InformacaoVariavelOuConstante }},
    tipo: string,
    catalogoPrimitivas: { [nome: string]: PrimitivaInterface }
) {
    primitivasConhecidas[tipo] = {};
    for (const [nomePrimitivaDicionario, dadosPrimitiva] of Object.entries(
        catalogoPrimitivas
    )) {
        primitivasConhecidas[tipo][nomePrimitivaDicionario] = new InformacaoVariavelOuConstante(
            nomePrimitivaDicionario,
            tipo,
            dadosPrimitiva.argumentos
        );
    }
}
