import { ComentarioComoConstruto, Decorador } from '../construtos';
import { ConstrutoInterface, SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class PropriedadeClasse extends Declaracao {
    nome: SimboloInterface;
    tipo?: string;
    decoradores: Decorador[];
    acesso: 'privado' | 'protegido' | 'publico';
    estatico: boolean;
    autoObter: boolean;
    autoDefinir: boolean;
    documentacao?: ComentarioComoConstruto;
    valorInicial?: ConstrutoInterface;

    constructor(
        nome: SimboloInterface,
        tipo?: string,
        decoradores: Decorador[] = [],
        acesso: 'privado' | 'protegido' | 'publico' = 'publico',
        estatico: boolean = false,
        valorInicial?: ConstrutoInterface
    ) {
        super(Number(nome.linha), nome.hashArquivo);
        this.nome = nome;
        this.tipo = tipo;
        this.decoradores = decoradores;
        this.acesso = acesso;
        this.estatico = estatico;
        this.autoObter = false;
        this.autoDefinir = false;
        this.valorInicial = valorInicial;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.reject(new Error('Não utilizado por enquanto.'));
    }

    paraTexto(): string {
        return `<propriedade-classe nome=${this.nome.lexema} tipo=${this.tipo} />`;
    }
}
