import { Declaracao } from '../declaracoes';
import { VisitanteComumInterface, ParametroInterface, SimboloInterface, TipoDadoParametroInterface } from '../interfaces';
import { Construto } from './construto';

export class Parametro implements ParametroInterface {
    abrangencia: 'padrao' | 'multiplo';
    nome: SimboloInterface;
    tipoDado?: TipoDadoParametroInterface;
    valorPadrao?: any;
    referencia?: boolean;
    
    toString() {
        let formatacaoParametro = `<Parametro nome=${this.nome.lexema}`;
        if (this.valorPadrao) {
            formatacaoParametro += ` valor-padrão=${this.valorPadrao}`;
        }

        if (this.abrangencia) {
            formatacaoParametro += ` abrangência=${this.abrangencia}`;
        }

        formatacaoParametro += `>`;
        return formatacaoParametro;
    }
}

export class FuncaoConstruto implements Construto {
    linha: number;
    hashArquivo: number;

    parametros: ParametroInterface[];
    tipoRetorno?: string;
    corpo: Declaracao[];

    constructor(
        hashArquivo: number,
        linha: number,
        parametros: ParametroInterface[],
        corpo: Declaracao[],
        tipoRetorno?: string
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.parametros = parametros;
        this.tipoRetorno = tipoRetorno;
        this.corpo = corpo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoFuncaoConstruto(this));
    }
}
