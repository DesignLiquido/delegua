import { Decorador } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';

export class Declaracao {
    linha: number;
    hashArquivo: number;
    assinaturaMetodo: string;
    decoradores: Decorador[];

    constructor(linha: number, hashArquivo: number, decoradores: Decorador[] = [], assinaturaMetodo: string = '<principal>') {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.decoradores = decoradores;
        // TODO: Por ora, todos os testes são feitos num script só.
        // Quando iniciarem os testes em múltiplos arquivos e módulos,
        // pensar numa forma melhor de preencher isso.
        this.assinaturaMetodo = assinaturaMetodo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.reject(new Error('Este método não deveria ser chamado.'));
    }
}
