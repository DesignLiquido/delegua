export interface MembroInterfaceFaltando {
    tipo: 'metodo' | 'propriedade';
    nome: string;
    parametros?: { nome: string; tipoDado?: string }[];
    tipoRetorno?: string;
    tipoPropriedade?: string;
}
