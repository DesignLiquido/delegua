import { DeleguaFuncao } from "./estruturas";
import { ErroEmTempoDeExecucao } from "./excecoes";
import { SimboloInterface } from "./interfaces";

export class Ambiente {
    ambientePai: any;
    valores: any;

    constructor(ambientePai?: any) {
        this.ambientePai = ambientePai || null;
        this.valores = {};
    }

    definirVariavel(nomeVariavel: any, valor: any) {
        this.valores[nomeVariavel] = valor;
    }

    atribuirVariavelEm(distancia: any, nome: any, valor: any) {
        this.obterAmbienteAncestral(distancia).valores[nome.lexema] = valor;
    }

    atribuirVariavel(simbolo: SimboloInterface, valor: any) {
        if (this.valores[simbolo.lexema] !== undefined) {
            this.valores[simbolo.lexema] = valor;
            return;
        }

        if (this.ambientePai != null) {
            this.ambientePai.atribuirVariavel(simbolo, valor);
            return;
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexema + "'.");
    }

    obterAmbienteAncestral(distancia: number) {
        let ambiente = this;
        for (let i = 0; i < distancia; i++) {
            ambiente = ambiente.ambientePai;
        }

        return ambiente;
    }

    obterVariavelEm(distancia: number, nome: string) {
        return this.obterAmbienteAncestral(distancia).valores[nome];
    }

    obterVariavel(simbolo: SimboloInterface) {
        if (this.valores[simbolo.lexema] !== undefined) {
            return this.valores[simbolo.lexema];
        }

        if (this.ambientePai !== null) return this.ambientePai.obterVariavel(simbolo);

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexema + "'.");
    }

    /**
     * Método usado pelo depurador para obter todas as variáveis definidas.
     */
    obterTodasVariaveis(todasVariaveis: any[] = []) {
        todasVariaveis.push(this.valores);
        if (this.ambientePai != null) {
            this.ambientePai.obterTodasVariaveis(todasVariaveis);
        } else {
            return todasVariaveis;
        }
    }

    /*
     * Obtém todas as definições de funções feitas ou por código-fonte, ou pelo desenvolvedor
     * em console, buscando pelo hash do arquivo, para não importar elementos em duplicidade.
     * @param hashArquivo O hash do arquivo ao qual a declaração pertence. 
     * @returns Um dicionário contendo todas as funções declaradas no arquivo.
     */
    obterTodasDeleguaFuncao(hashArquivo: number): {[nome: string]: DeleguaFuncao} {
        const retorno = {};
        for (const [nome, corpo] of Object.entries(this.valores)) {
            if (corpo instanceof DeleguaFuncao && corpo.declaracao.hashArquivo === hashArquivo) {
                retorno[nome] = corpo;
            }
        }

        return retorno;
    }
};