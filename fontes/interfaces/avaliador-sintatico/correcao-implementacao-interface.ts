import { MembroInterfaceFaltandoInterface } from "./membro-interface-faltando-interface";

export interface CorrecaoImplementacaoInterface {
    tipo: 'implementar-interface';
    nomeInterface: string;
    nomeClasse: string;
    membrosFaltando: MembroInterfaceFaltandoInterface[];
    linhaFinalClasse: number;
}
