import { Decorador } from '../construtos';
import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class PropriedadeClasse extends Declaracao {
    nome: SimboloInterface;
    tipo?: string;
    decoradores: Decorador[];
    acesso: 'privado' | 'protegido' | 'publico';
    estatico: boolean;

    constructor(
        nome: SimboloInterface,
        tipo?: string,
        decoradores: Decorador[] = [],
        acesso: 'privado' | 'protegido' | 'publico' = 'publico',
        estatico: boolean = false
    ) {
        super(Number(nome.linha), nome.hashArquivo);
        this.nome = nome;
        this.tipo = tipo;
        this.decoradores = decoradores;
        this.acesso = acesso;
        this.estatico = estatico;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.reject(new Error('Não utilizado por enquanto.'));
    }

    paraTexto(): string {
        return `<propriedade-classe nome=${this.nome.lexema} tipo=${this.tipo} />`;
    }
}
