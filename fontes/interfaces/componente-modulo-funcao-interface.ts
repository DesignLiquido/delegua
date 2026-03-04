export interface ComponenteModuloFuncaoInterface {
    documentacao?: string;
    tipoRetorno: string;
    funcao: Function;
    argumentos: { nome: string; tipo: string }[];
}
