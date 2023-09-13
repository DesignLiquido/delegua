import { AcessoMetodo } from "../../../construtos";
import { DeleguaModulo, MetodoPrimitiva, ObjetoDeleguaClasse } from "../../../estruturas";
import { VariavelInterface } from "../../../interfaces";
import { inferirTipoVariavel } from "./inferenciador";

import primitivasNumero from "../../../bibliotecas/dialetos/potigol/primitivas-numero";
import primitivasTexto from "../../../bibliotecas/dialetos/potigol/primitivas-texto";
import primitivasVetor from "../../../bibliotecas/dialetos/potigol/primitivas-vetor";
import { ErroEmTempoDeExecucao } from "../../../excecoes";
import { InterpretadorBase } from "../../interpretador-base";

/**
* Executa um acesso a método, normalmente de um objeto de classe.
* @param expressao A expressão de acesso.
* @returns O resultado da execução.
*/
export async function visitarExpressaoAcessoMetodo(interpretador: InterpretadorBase, expressao: AcessoMetodo): Promise<any> {
   const variavelObjeto: VariavelInterface = await interpretador.avaliar(expressao.objeto);
   const objeto = variavelObjeto.hasOwnProperty('valor') ? variavelObjeto.valor : variavelObjeto;

   if (objeto instanceof ObjetoDeleguaClasse) {
       return objeto.obter(expressao.simbolo) || null;
   }

   // TODO: Possivelmente depreciar esta forma.
   // Não parece funcionar em momento algum.
   if (objeto.constructor === Object) {
       return objeto[expressao.simbolo.lexema] || null;
   }

   // Função tradicional do JavaScript.
   // Normalmente executa quando uma biblioteca é importada.
   if (typeof objeto[expressao.simbolo.lexema] === 'function') {
       return objeto[expressao.simbolo.lexema];
   }

   // Objeto tradicional do JavaScript.
   // Normalmente executa quando uma biblioteca é importada.
   if (typeof objeto[expressao.simbolo.lexema] === 'object') {
       return objeto[expressao.simbolo.lexema];
   }

   if (objeto instanceof DeleguaModulo) {
       return objeto.componentes[expressao.simbolo.lexema] || null;
   }

   let tipoObjeto: any = variavelObjeto.tipo;
   if (tipoObjeto === null || tipoObjeto === undefined) {
       tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
   }

   switch (tipoObjeto) {
       case 'numero':
       case 'número':
           const metodoDePrimitivaNumero: Function = primitivasNumero[expressao.simbolo.lexema];
           if (metodoDePrimitivaNumero) {
               return new MetodoPrimitiva(objeto, metodoDePrimitivaNumero);
           }
           break;
       case 'texto':
           const metodoDePrimitivaTexto: Function = primitivasTexto[expressao.simbolo.lexema];
           if (metodoDePrimitivaTexto) {
               return new MetodoPrimitiva(objeto, metodoDePrimitivaTexto);
           }
           break;
       case 'vetor':
           const metodoDePrimitivaVetor: Function = primitivasVetor[expressao.simbolo.lexema];
           if (metodoDePrimitivaVetor) {
               return new MetodoPrimitiva(objeto, metodoDePrimitivaVetor);
           }
           break;
   }

   return Promise.reject(
       new ErroEmTempoDeExecucao(
           expressao.simbolo,
           `Método para objeto ou primitiva não encontrado: ${expressao.simbolo.lexema}.`,
           expressao.linha
       )
   );
}
