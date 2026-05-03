import { ConstrutoInterface } from '../construtos';
import { ErroResolvedor } from '../../interpretador/dialetos/egua-classico/resolvedor/erro-resolvedor';

export interface RetornoResolvedor {
    erros: ErroResolvedor[];
    locais: Map<ConstrutoInterface, number>;
}
