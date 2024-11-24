import { Declaracao } from '../declaracoes/declaracao';
import { VisitanteComumInterface } from './visitante-comum-interface';

export interface FormatadorComumInterface extends VisitanteComumInterface {
    indentacaoAtual: number;
    quebraLinha: string;
    tamanhoIndentacao: number;
    codigoFormatado: string;
    devePularLinha: boolean;
    deveIndentar: boolean;
    formatar(declaracoes: Declaracao[]): string;
}
