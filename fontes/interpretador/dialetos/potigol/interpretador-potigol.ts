import { InterpretadorBase } from '../../interpretador-base';

import { registrarBibliotecaGlobalPotigol } from '../../../bibliotecas/dialetos/potigol/biblioteca-global';
import { AcessoMetodo, Binario, ConstanteOuVariavel, Literal, QualTipo, Unario, Variavel } from '../../../construtos';

import * as comum from './comum';
import { ObjetoPadrao } from '../../../estruturas';
import { inferirTipoVariavel } from './inferenciador';
import { InterpretadorInterfacePotigol } from '../../../interfaces/interpretador-interface-potigol';

/**
 * Uma implementação do interpretador de Potigol.
 */
export class InterpretadorPotigol extends InterpretadorBase implements InterpretadorInterfacePotigol {
    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        super(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.expandirPropriedadesDeObjetosEmEspacoVariaveis = true;
        this.regexInterpolacao = /{(.*?)}/g;

        registrarBibliotecaGlobalPotigol(this, this.pilhaEscoposExecucao);
    }

    paraTexto(objeto: any) {
        if (objeto === null || objeto === undefined) return 'nulo';
        if (typeof objeto === 'boolean') {
            return objeto ? 'verdadeiro' : 'falso';
        }

        if (objeto instanceof Date) {
            const formato = Intl.DateTimeFormat('pt', {
                dateStyle: 'full',
                timeStyle: 'full',
            });
            return formato.format(objeto);
        }

        if (Array.isArray(objeto)) return `[${objeto.join(', ')}]`;
        if (objeto.valor instanceof ObjetoPadrao) return objeto.valor.paraTexto();
        if (typeof objeto === 'object') return JSON.stringify(objeto);

        return objeto.toString();
    }

    protected async resolverInterpolacoes(textoOriginal: string, linha: number): Promise<any[]> {
        return comum.resolverInterpolacoes(this, textoOriginal, linha);
    }

    protected retirarInterpolacao(texto: string, variaveis: any[]): string {
        return comum.retirarInterpolacao(texto, variaveis);
    }

    async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> {
        return comum.visitarExpressaoAcessoMetodo(this, expressao);
    }

    async visitarExpressaoQualTipo(expressao: QualTipo): Promise<string> {
        let qualTipo = expressao.valor;

        if (expressao?.valor instanceof ConstanteOuVariavel) {
            const nome = expressao?.valor.simbolo.lexema
            qualTipo = this.pilhaEscoposExecucao.topoDaPilha().ambiente.valores[nome].valor
        }
        
         if (
             qualTipo instanceof Binario ||
             qualTipo instanceof Literal ||
             qualTipo instanceof QualTipo ||
             qualTipo instanceof Unario ||
             qualTipo instanceof Variavel
         ) {
             qualTipo = await this.avaliar(qualTipo);
             return qualTipo.tipo || inferirTipoVariavel(qualTipo);
         }

         return inferirTipoVariavel(qualTipo?.valores || qualTipo);
    }
}
