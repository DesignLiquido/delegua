import { CorrecaoImplementacaoInterface, SimboloInterface } from '../interfaces';
import { inferirCodigoDiagnosticoSintatico } from './tabela-diagnosticos-sintaticos';

export class ErroAvaliadorSintatico extends Error {
    simbolo: SimboloInterface;
    simboloRelacionado: SimboloInterface;
    codigoDiagnostico: string;
    hashArquivo: number;
    linha: number;
    correcaoSugerida?: CorrecaoImplementacaoInterface;

    constructor(
        simbolo: SimboloInterface,
        mensagem: string,
        codigoDiagnostico?: string,
        simboloRelacionado?: SimboloInterface
    ) {
        super(mensagem);
        this.simbolo = simbolo;
        this.simboloRelacionado = simboloRelacionado ?? simbolo;
        this.codigoDiagnostico = codigoDiagnostico ?? inferirCodigoDiagnosticoSintatico(mensagem);
        this.hashArquivo = simbolo.hashArquivo;
        this.linha = simbolo.linha;
        Object.setPrototypeOf(this, ErroAvaliadorSintatico.prototype);
    }
}
