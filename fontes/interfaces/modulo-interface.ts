import { ComponenteModuloClasseInterface } from './componente-modulo-classe-interface';
import { ComponenteModuloFuncaoInterface } from './componente-modulo-funcao-interface';

export interface ModuloInterface {
    manifestoModulo: {
        [nomeMetodo: string]: ComponenteModuloClasseInterface | ComponenteModuloFuncaoInterface;
    };
    nome: string;
}
