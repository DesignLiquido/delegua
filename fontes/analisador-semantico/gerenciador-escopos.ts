import { EscopoVariavel } from "./escopo-variavel";

export class GerenciadorEscopos {
    private escopos: Map<string, EscopoVariavel>[] = [];
    
    constructor() {
        // Escopo global
        this.empilharEscopo();
    }
    
    empilharEscopo(): void {
        this.escopos.push(new Map());
    }
    
    desempilharEscopo(): Map<string, EscopoVariavel> | undefined {
        return this.escopos.pop();
    }
    
    declarar(nome: string, variavel: EscopoVariavel): boolean {
        const escopoAtual = this.escopos[this.escopos.length - 1];
        
        // Verifica se já existe no escopo atual
        if (escopoAtual.has(nome)) {
            return false; // Já declarada no escopo atual
        }
        
        escopoAtual.set(nome, variavel);
        return true;
    }
    
    buscar(nome: string): EscopoVariavel | undefined {
        // Busca do escopo mais interno para o mais externo
        for (let i = this.escopos.length - 1; i >= 0; i--) {
            const variavel = this.escopos[i].get(nome);
            if (variavel) {
                return variavel;
            }
        }
        return undefined;
    }
    
    buscarNoEscopoAtual(nome: string): EscopoVariavel | undefined {
        const escopoAtual = this.escopos[this.escopos.length - 1];
        return escopoAtual.get(nome);
    }
    
    marcarComoInicializada(nome: string, valor?: any): void {
        const variavel = this.buscar(nome);
        if (variavel) {
            variavel.inicializada = true;
            variavel.usada = true;
            if (valor !== undefined) {
                variavel.valor = this.extrairValor(valor);
            }
        }
    }

    private extrairValor(construto: any): any {
        if (construto === null || construto === undefined) {
            return undefined;
        }
        
        if (construto.hasOwnProperty('valor')) {
            return construto.valor;
        }
        
        return construto;
    }
    
    marcarComoUsada(nome: string): void {
        const variavel = this.buscar(nome);
        if (variavel) {
            variavel.usada = true;
        }
    }
    
    obterVariaveisNaoUsadas(): EscopoVariavel[] {
        const naoUsadas: EscopoVariavel[] = [];
        
        for (let escopo of this.escopos) {
            for (let variavel of escopo.values()) {
                if (!variavel.usada) {
                    naoUsadas.push(variavel);
                }
            }
        }
        
        return naoUsadas;
    }
}