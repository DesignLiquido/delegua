import { Classe, FuncaoDeclaracao, Var } from '../../declaracoes';
import { RetornoResolverDeclaracao } from './retorno-resolver-declaracao';

export type RetornoDeclaracao = Var | FuncaoDeclaracao | Classe | RetornoResolverDeclaracao;
