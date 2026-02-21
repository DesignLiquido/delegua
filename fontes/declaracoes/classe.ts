import { Decorador } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';
import { FuncaoDeclaracao } from './funcao';
import { PropriedadeClasse } from './propriedade-classe';

export class Classe extends Declaracao {
    simbolo: SimboloInterface;
    superClasse: any;
    metodos: FuncaoDeclaracao[];
    propriedades: PropriedadeClasse[];
    decoradores: Decorador[];
    documentacao?: Declaracao;
    abstrata: boolean;
    implementa: SimboloInterface[];

    constructor(
        simbolo: SimboloInterface,
        superClasse: any,
        metodos: FuncaoDeclaracao[],
        propriedades: PropriedadeClasse[] = [],
        decoradores: Decorador[] = [],
        abstrata: boolean = false,
        implementa: SimboloInterface[] = []
    ) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.superClasse = superClasse;
        this.metodos = metodos;
        this.propriedades = propriedades;
        this.decoradores = decoradores;
        this.abstrata = abstrata;
        this.implementa = implementa;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoClasse(this);
    }

    paraTexto(): string {
        let resultado = `<classe nome=${this.simbolo.lexema} `;
        if (this.superClasse) {
            resultado += `herda=${this.superClasse} `;
        }

        resultado += '>';

        for (const propriedade of this.propriedades) {
            resultado += `${propriedade.paraTexto()}`;
        }

        for (const metodo of this.metodos) {
            resultado += `${metodo.paraTexto()}`;
        }

        resultado += `</classe>`;
        return resultado;
    }
}
