import { Classe } from '../declaracoes';
import { DescritorTipoClasse } from '../interpretador/estruturas';

/**
 * Contrato que qualquer runtime deve implementar para fornecer suporte a FFI
 * em tempo de execução.
 *
 * O core (`InterpretadorBase`) depende apenas desta interface — sem qualquer
 * referência a `koffi`, APIs de SO ou Node.js. Cada runtime (Node.js, Deno,
 * Bun, etc.) fornece sua própria implementação concreta.
 */
export interface DespachadorFFIInterface {
    /**
     * Chamado quando o interpretador visita uma `classe estrangeira` com `@definicao`.
     *
     * Deve retornar um `DescritorTipoClasse` com os métodos estáticos já vinculados
     * à biblioteca nativa, ou `null` se a declaração não tiver metadados FFI suficientes
     * (ex.: `@definicao` sem atributo `biblioteca`).
     *
     * Quando retorna `null`, o interpretador mantém o comportamento padrão:
     * `DescritorTipoClasse.estrangeira = true`, que lança erro ao tentar instanciar.
     */
    resolverClasseEstrangeira(declaracao: Classe): DescritorTipoClasse | null;

    /**
     * Libera todos os recursos nativos carregados (handles de bibliotecas, etc.).
     * Chamado automaticamente pelo interpretador quando `interpretar()` é invocado sem
     * `manterAmbiente` (modo script). Em modo REPL (`manterAmbiente = true`), o
     * runtime deve chamar este método manualmente ao encerrar a sessão.
     */
    descarregarTudo(): void;
}
