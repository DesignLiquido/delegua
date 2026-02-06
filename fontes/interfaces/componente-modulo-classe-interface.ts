export interface ComponenteModuloClasseInterface {
    implementacao: any,
    propriedades?: {
        [nomePropriedade: string]: any,
        metodos?: { [nomeMetodo: string]: any }
    }
}
