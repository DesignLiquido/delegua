import { InterpretadorInterface } from '../../interfaces';
import { DeleguaFuncao } from './delegua-funcao';
import { ObjetoDeleguaClasse } from './objeto-delegua-classe';

/**
 * Uma função nativa que implementa lógica em TypeScript em vez de código Delégua.
 * Usada internamente para métodos embutidos como os da classe base `Objeto`.
 */
export class DeleguaFuncaoNativa extends DeleguaFuncao {
    private funcaoASerChamada: (instancia: ObjetoDeleguaClasse | undefined, args: any[]) => any;
    private _aridade: number;

    constructor(
        nome: string,
        aridade: number,
        funcaoASerChamada: (instancia: ObjetoDeleguaClasse | undefined, args: any[]) => any
    ) {
        super(nome, null, undefined, false);
        this._aridade = aridade;
        this.funcaoASerChamada = funcaoASerChamada;
    }

    aridade(): number {
        return this._aridade;
    }

    async chamar(visitante: InterpretadorInterface, argumentos: any[]): Promise<any> {
        // Argumentos chegam como ArgumentoInterface = { nome, valor: VariavelInterface }.
        // VariavelInterface tem a forma { tipo, valor: valorReal, imutavel }.
        // Usamos o método resolverValor() do interpretador para remover ambas as camadas de encapsulamento.
        const resolver = (visitante as any).resolverValor?.bind(visitante) ?? ((v: any) => v);
        const args = argumentos.map((a) => {
            const nivel1 = a && Object.prototype.hasOwnProperty.call(a, 'valor') ? a.valor : a;
            return resolver(nivel1);
        });
        return await this.funcaoASerChamada(this.instancia, args);
    }

    funcaoPorMetodoDeClasse(instancia: ObjetoDeleguaClasse): DeleguaFuncaoNativa {
        const nativa = new DeleguaFuncaoNativa(this.nome, this._aridade, this.funcaoASerChamada);
        nativa.instancia = instancia;
        return nativa;
    }

    paraTexto(): string {
        return `<função-nativa nome=${this.nome} />`;
    }

    toString(): string {
        return this.paraTexto();
    }
}
