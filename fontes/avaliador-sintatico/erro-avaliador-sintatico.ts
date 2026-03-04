import { SimboloInterface } from '../interfaces';

export interface MembroInterfaceFaltando {
    tipo: 'metodo' | 'propriedade';
    nome: string;
    parametros?: { nome: string; tipoDado?: string }[];
    tipoRetorno?: string;
    tipoPropriedade?: string;
}

export interface CorrecaoImplementacaoInterface {
    tipo: 'implementar-interface';
    nomeInterface: string;
    nomeClasse: string;
    membrosFaltando: MembroInterfaceFaltando[];
    linhaFinalClasse: number;
}

export class ErroAvaliadorSintatico extends Error {
    simbolo: SimboloInterface;
    hashArquivo: number;
    linha: number;
    correcaoSugerida?: CorrecaoImplementacaoInterface;

    constructor(simbolo: SimboloInterface, mensagem: string) {
        super(mensagem);
        this.simbolo = simbolo;
        this.hashArquivo = simbolo.hashArquivo;
        this.linha = simbolo.linha;
        Object.setPrototypeOf(this, ErroAvaliadorSintatico.prototype);
    }
}
