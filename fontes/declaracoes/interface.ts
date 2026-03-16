import { VisitanteComumInterface, SimboloInterface, ParametroInterface } from '../interfaces';
import { Declaracao } from './declaracao';
import { PropriedadeClasse } from './propriedade-classe';

/**
 * Assinatura de um método em uma declaração de interface.
 * Contém apenas nome e parâmetros — sem corpo.
 */
export class AssinaturaMetodo {
    nome: SimboloInterface;
    parametros: ParametroInterface[];
    tipoRetorno?: string;

    constructor(
        nome: SimboloInterface,
        parametros: ParametroInterface[] = [],
        tipoRetorno?: string
    ) {
        this.nome = nome;
        this.parametros = parametros;
        this.tipoRetorno = tipoRetorno;
    }
}

/**
 * Declaração de uma interface.
 * Define um contrato de métodos e propriedades que as classes implementadoras devem respeitar.
 * A verificação é feita em tempo de análise sintática (parse-time), não em tempo de execução.
 */
export class InterfaceDeclaracao extends Declaracao {
    simbolo: SimboloInterface;
    metodos: AssinaturaMetodo[];
    propriedades: PropriedadeClasse[];

    constructor(
        simbolo: SimboloInterface,
        metodos: AssinaturaMetodo[] = [],
        propriedades: PropriedadeClasse[] = []
    ) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.metodos = metodos;
        this.propriedades = propriedades;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await (visitante as any).visitarDeclaracaoInterface(this);
    }

    paraTexto(): string {
        let resultado = `<interface nome=${this.simbolo.lexema}>`;
        for (const prop of this.propriedades) {
            resultado += prop.paraTexto();
        }
        for (const metodo of this.metodos) {
            resultado += `<assinatura-metodo nome=${metodo.nome.lexema} />`;
        }
        resultado += `</interface>`;
        return resultado;
    }
}
