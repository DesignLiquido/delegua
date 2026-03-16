import { Decorador } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';
import { FuncaoDeclaracao } from './funcao';
import { PropriedadeClasse } from './propriedade-classe';

export class Classe extends Declaracao {
    simbolo: SimboloInterface;
    superClasses: any[];
    mesclas: any[];
    metodos: FuncaoDeclaracao[];
    propriedades: PropriedadeClasse[];
    decoradores: Decorador[];
    documentacao?: Declaracao;
    abstrata: boolean;
    classeEstatica: boolean;
    implementa: SimboloInterface[];

    /** Compat com tradutores e analisador semântico que ainda usam .superClasse */
    get superClasse(): any {
        return this.superClasses[0] ?? null;
    }

    constructor(
        simbolo: SimboloInterface,
        superClasses: any[] = [],
        metodos: FuncaoDeclaracao[],
        propriedades: PropriedadeClasse[] = [],
        decoradores: Decorador[] = [],
        abstrata: boolean = false,
        classeEstatica: boolean = false,
        implementa: SimboloInterface[] = [],
        mesclas: any[] = []
    ) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.superClasses = superClasses;
        this.mesclas = mesclas;
        this.metodos = metodos;
        this.propriedades = propriedades;
        this.decoradores = decoradores;
        this.abstrata = abstrata;
        this.classeEstatica = classeEstatica;
        this.implementa = implementa;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoClasse(this);
    }

    paraTexto(): string {
        let resultado = `<classe nome=${this.simbolo.lexema} `;
        if (this.superClasses.length > 0) {
            resultado += `herda=${this.superClasses.map((s: any) => s?.simbolo?.lexema ?? s).join(', ')} `;
        }
        if (this.mesclas.length > 0) {
            resultado += `mescla=${this.mesclas.map((m: any) => m?.simbolo?.lexema ?? m).join(', ')} `;
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
