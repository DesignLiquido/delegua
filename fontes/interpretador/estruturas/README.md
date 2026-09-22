# Estruturas

Estruturas são porções de código auxiliares para interpretação em Delégua. São visíveis apenas entre interpretadores e bibliotecas globais. Diferentemente de construtos e declarações, o visitante é sempre um interpretador.

---

# Padrões de Tratamento de Argumentos em Funções Embutidas

Este documento descreve os padrões usados pelas funções embutidas para tratar argumentos corretamente, especialmente quando esses argumentos são vetores ou expressões, nos diferentes dialetos (Delégua, Pituguês, Tenda).

## 1. Visão Geral: Como os Argumentos Percorrem o Sistema

```
Código do Usuário
    ↓
Avaliador Sintático (AvaliadorSintatico) → Cria construto `Chamada` com `argumentos: Construto[]`
    ↓
Interpretador (InterpretadorBase.visitarExpressaoDeChamada)
    ├→ Para FuncaoPadrao: resolve valores com `resolverValor()` → vetor plano de valores
    └→ Para DeleguaFuncao: passa `ArgumentoInterface[]` com valores não avaliados
    ↓
Função executa com argumentos avaliados
```

## 2. Estrutura da Classe `FuncaoPadrao`

**Localização:** [funcao-padrao.ts](./funcao-padrao.ts)

```typescript
export class FuncaoPadrao extends Chamavel {
    valorAridade: number;           // Número de parâmetros esperados
    funcao: Function;               // Implementação JavaScript da função
    simbolo: SimboloInterface;      // Informação do token para relatório de erros
    argumentos?: { nome: string; tipo: string }[];
    tipoRetorno?: string;
    documentacao?: string;
    descartarPrimeiroArgumento: boolean = true;  // Sempre verdadeiro - primeiro arg é o interpretador

    constructor(valorAridade: number, funcao: Function) {
        super();
        this.valorAridade = valorAridade;
        this.funcao = funcao;
    }

    async chamar(
        visitante: InterpretadorInterface,
        argumentos: any[],
        simbolo: SimboloInterface
    ): Promise<any> {
        this.simbolo = simbolo;
        // Os argumentos já estão PRÉ-RESOLVIDOS pelo chamador - aplicados diretamente!
        return await this.funcao.apply(this, [visitante, ...argumentos]);
    }
}
```

**Ponto-chave:** Quando `FuncaoPadrao.chamar()` é invocado, os argumentos já estão **resolvidos** (convertidos de construtos para valores).

## 3. Como os Argumentos São Resolvidos Antes de `FuncaoPadrao.chamar()`

**Localização:** [interpretador-base.ts](../interpretador-base.ts) linhas 1292–1330

```typescript
async visitarExpressaoDeChamada(expressao: Chamada): Promise<any> {
    // ... código para obter entidadeChamada ...

    if (entidadeChamada instanceof FuncaoPadrao) {
        try {
            // CRÍTICO: Os argumentos são mapeados via resolverValor()
            // Isso converte Construto → valor, removendo o "invólucro de Construto"
            return entidadeChamada.chamar(
                this,
                argumentos.map((a) => a && this.resolverValor(a.valor)),
                (expressao.entidadeChamada as any).simbolo
            );
        } catch (erro: any) {
            // Tratamento de erro...
        }
    }

    // Para DeleguaFuncao, os argumentos são passados como estão (NÃO resolvidos)
    if (entidadeChamada instanceof Chamavel /* inclui DeleguaFuncao */) {
        const retornoEntidadeChamada = await entidadeChamada.chamar(this, argumentos);
        return retornoEntidadeChamada;
    }
}
```

**O método `resolverValor()`:**

Localização: [interpretador-base.ts](../interpretador-base.ts) linha 285

```typescript
resolverValor(objeto: any) {
    if (objeto === null || objeto === undefined) {
        return objeto;
    }

    // Se o objeto tem uma propriedade 'valor', retorna ela ao invés do invólucro
    if (objeto.hasOwnProperty('valor')) {
        return objeto.valor;
    }

    // Caso contrário, retorna o objeto como está
    return objeto;
}
```

**O que isso significa:**
- Argumentos de tipos complexos (vetores, objetos) chegam encapsulados em `{ valor: valorReal, tipo: 'vetor', ... }`
- `resolverValor()` desencapsula: `{ valor: [1,2,3] } → [1,2,3]`
- Primitivos simples passam sem alteração

## 4. Padrão 1: Tratamento Simples de Argumentos (Sem Vetores/Funções)

### Exemplo: função de conversão `numero()`

**Localização:** [biblioteca-global.ts](../../bibliotecas/dialetos/egua-classico/biblioteca-global.ts)

```typescript
globals.definirVariavel(
    'inteiro',
    new FuncaoPadrao(1, function (_: any, value: any) {
        // Argumentos já estão resolvidos neste ponto
        const valorResolvido = value && value.hasOwnProperty('valor')
            ? value.valor
            : value;

        if (valorResolvido === undefined || valorResolvido === null) {
            throw new ErroEmTempoDeExecucao(
                this.simbolo,
                'Valor não pode ser nulo.'
            );
        }

        return Math.trunc(valorResolvido);
    })
);
```

**Lista de verificação do padrão:**
- ✅ Recebe `_` (interpretador) como primeiro parâmetro
- ✅ Verifica invólucro `hasOwnProperty('valor')`
- ✅ Extrai `.valor` se presente
- ✅ Valida tipo/nulo
- ✅ Lança `ErroEmTempoDeExecucao` para erros

## 5. Padrão 2: Argumentos de Vetor com Funções (Funções de ordem superior)

### Exemplo: `algum()` — Verifica se ALGUM elemento satisfaz a condição

**Localização:** [biblioteca-global.ts](../../bibliotecas/dialetos/egua-classico/biblioteca-global.ts) linha 52+

```typescript
globals.definirVariavel(
    'algum',
    new FuncaoPadrao(2, async function (_: any, array: any, callback: any) {
        // Passo 1: Desencapsula argumento do vetor
        const arrayResolvido = array && array.hasOwnProperty('valor')
            ? array.valor
            : array;

        // Passo 2: Desencapsula argumento da função de callback
        const callbackResolvido =
            callback && callback.hasOwnProperty('valor')
            ? callback.valor
            : callback;

        // Passo 3: Valida o vetor
        if (!Array.isArray(arrayResolvido)) {
            throw new ErroEmTempoDeExecucao(
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
            );
        }

        // Passo 4: Valida que o callback é realmente uma função
        if (callbackResolvido.constructor !== DeleguaFuncao) {
            throw new ErroEmTempoDeExecucao(
                this.simbolo,
                'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
            );
        }

        // Passo 5: Itera e chama a função de callback com cada elemento
        for (let index = 0; index < arrayResolvido.length; ++index) {
            // CRÍTICO: Passa o interpretador e um vetor de argumentos para chamar()
            if (await callbackResolvido.chamar(interpreter, [arrayResolvido[index]])) {
                return true;
            }
        }

        return false;
    })
);
```

**Lista de verificação para funções de ordem superior:**
- ✅ Desencapsula TANTO o vetor QUANTO a função de callback
- ✅ Valida o vetor com `Array.isArray()`
- ✅ Valida que o callback é `DeleguaFuncao` ou `FuncaoPadrao`
- ✅ Usa `await callback.chamar(interpretador, [argElemento])` para invocar o callback
- ✅ Passa cada elemento como valor simples (não encapsulado)

### Funções que usam este padrão:

1. **`encontrar()`** — Retorna o primeiro elemento correspondente
2. **`encontrarIndice()`** — Retorna o índice da primeira correspondência
3. **`mapear()`** — Transforma o vetor usando callback
4. **`reduzir()`** — Reduz o vetor com acumulador e callback

## 6. Padrão 3: Dialeto Pituguês (Igual ao Delégua para funções)

**Localização:** [biblioteca-global.ts](../../bibliotecas/dialetos/pitugues/biblioteca-global.ts)

### Exemplo: `para_cada()` em Pituguês

```typescript
export async function para_cada(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoFiltragem: VariavelInterface | any
): Promise<any> {
    // Verificação de nulo
    if (vetor === null || vetor === undefined)
        return Promise.reject(
            new ErroEmTempoDeExecucao({
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                linha: interpretador.linhaDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro não pode ser nulo.'
        ));

    // IMPORTANTE: Funções em Pituguês usam interpretador.resolverValor()
    // ao invés de verificações inline!
    const valorVetor = interpretador.resolverValor(vetor);
    const valorFuncaoFiltragem = interpretador.resolverValor(funcaoFiltragem);

    // ... validação ...

    for (let indice = 0; indice < valorVetor.length; ++indice) {
        await valorFuncaoFiltragem.chamar(interpretador, [valorVetor[indice]]);
    }
}
```

**Diferenças no Pituguês:**
- ✅ Funções definidas com assinatura: `async function(interpretador, arg1, arg2, ...)`
- ✅ Pode chamar `interpretador.resolverValor()` ao invés de verificações inline
- ✅ Mais idiomático usar `interpretador.resolverValor()` de forma consistente

## 7. Padrão 4: Dialeto Tenda (Funções baseadas em espaços de nome)

**Localização:** [biblioteca-global.ts](../../bibliotecas/dialetos/tenda/biblioteca-global.ts)

```typescript
globals.definirVariavel('Saída', {
    exiba: new FuncaoPadrao(1, function (_: any, texto: any) {
        // Mesmo padrão: desencapsula o invólucro
        const valor = texto !== null && texto !== undefined && texto.hasOwnProperty('valor')
            ? texto.valor
            : texto;

        interpretador.funcaoDeRetorno(
            valor !== null && valor !== undefined
            ? String(valor)
            : 'nulo'
        );
    }),

    // Métodos em espaço de nome para vetores
    Lista: {
        tamanho: new FuncaoPadrao(1, function (_: any, lista: any) {
            const v = lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                ? lista.valor
                : lista;
            return v.length;
        }),

        // Exemplo de ordem superior
        para_cada: new FuncaoPadrao(2, async function (_visitante: any, lista: any, fn: any) {
            const v = lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                ? lista.valor
                : lista;
            const func = fn !== null && fn !== undefined && fn.hasOwnProperty('valor')
                ? fn.valor
                : fn;

            for (let i = 0; i < v.length; i++) {
                await func.chamar(_visitante, [v[i]]);
            }
        }),
    }
});
```

**Diferenças no Tenda:**
- ✅ Funções organizadas em objetos/espaços de nome (ex.: `Saída`, `Lista`)
- ✅ Cada método é uma `FuncaoPadrao`
- ✅ O mesmo padrão de desencapsulamento de argumentos se aplica

## 8. Padrão 5: `escreva()` / `imprima()` — Argumentos variáveis

### Como `escreva()` trata múltiplos argumentos

**Estrutura da declaração:**

```typescript
// Declaração em Declaracao/escreva.ts
export class Escreva extends Declaracao {
    argumentos: Construto[];  // Pode ter 0 ou mais argumentos
    simboloEscreva?: SimboloInterface;
}
```

**O avaliador sintático gera:**
```typescript
// Em AvaliadorSintatico.declaracaoEscreva()
const argumentos: Array<Construto> = [];
do {
    argumentos.push(await this.expressao());
} while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
```

**Avaliação pelo interpretador:**

Localização: [interpretador-base.ts](../interpretador-base.ts) linha 1866+

```typescript
async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
    try {
        // Todos os argumentos são avaliados juntos em uma única string formatada
        const formatoTexto: string = await this.avaliarArgumentosEscreva(
            declaracao.argumentos
        );
        this.funcaoDeRetorno(formatoTexto);
        return null;
    } catch (erro: any) {
        this.erros.push({
            erroInterno: erro,
            linha: declaracao.linha,
            hashArquivo: declaracao.hashArquivo,
        });
    }
}
```

**O método `avaliarArgumentosEscreva()`:**

Localização: [interpretador.ts](../interpretador.ts) linha 120+

```typescript
protected override async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
    let formatoTexto = '';

    for (const argumento of argumentos) {
        let resultadoAvaliacao = await this.avaliar(argumento);

        // Desencapsula se o resultado tem valorRetornado
        if (resultadoAvaliacao &&
            resultadoAvaliacao.hasOwnProperty &&
            resultadoAvaliacao.hasOwnProperty('valorRetornado')) {
            resultadoAvaliacao = resultadoAvaliacao.valorRetornado;
        }

        // Tratamento especial para atribuições
        if (argumento instanceof Atribuir || argumento instanceof AtribuicaoPorIndice) {
            formatoTexto += `${argumento.paraTexto()} `;
            continue;
        }

        // Padrão: converte para string
        formatoTexto += String(resultadoAvaliacao) + ' ';
    }

    return formatoTexto.trimEnd();
}
```

**Observação importante sobre `escreva()`:**
- ✅ NÃO é uma `FuncaoPadrao` — é uma `Declaracao`
- ✅ Cada argumento é **avaliado separadamente** usando `this.avaliar()`
- ✅ Todos os resultados são concatenados em uma única string
- ✅ Aceita 0 ou mais argumentos (variádico)

## 9. Método-chave: `resolverAmbiente()` para DeleguaFuncao

**Localização:** [delegua-funcao.ts](./delegua-funcao.ts) linha 118+

Mostra como `DeleguaFuncao` (funções definidas pelo usuário) trata argumentos de forma diferente:

```typescript
protected resolverAmbiente(argumentos: Array<ArgumentoInterface>): EspacoMemoria {
    const ambiente = new EspacoMemoria();
    const parametros = this.declaracao.parametros || [];

    for (let i = 0; i < parametros.length; i++) {
        const parametro = parametros[i];
        const nome = parametro['nome'].lexema;

        if (parametro.abrangencia === 'multiplo') {
            // Trata parâmetros variádicos
            const argumentosResolvidos = this.resolverParametrosEspalhados(argumentos, i);
            ambiente.valores[nome] = {
                tipo: 'vetor',
                valor: argumentosResolvidos,
                imutavel: true,
            };
        } else {
            // Parâmetro único
            let argumento = argumentos[i];

            // Trata valores padrão
            if (argumento.valor === null) {
                argumentos[i].valor = parametro['padrao']
                    ? parametro['padrao'].valor
                    : null;
            }

            // Desencapsula o valor do argumento
            ambiente.valores[nome] =
                argumento && argumento.hasOwnProperty('valor')
                ? argumento.valor
                : argumento;

            // Trata currying de funções
            if (argumento.valor && ['funcao', 'função'].includes(argumento.valor.tipo)) {
                parametro.referencia = true;
            }
        }
    }

    return ambiente;
}
```

**Pontos-chave:**
- Recebe `ArgumentoInterface[]` (NÃO pré-resolvido)
- Cada argumento ainda é um Construto que precisa ser extraído
- Trata parâmetros com valor padrão
- Trata parâmetros variádicos (`...args`)
- Suporta referências a funções para currying

## 10. Lista de Verificação Completa para Novas Funções Embutidas

### Lista para funções baseadas em `FuncaoPadrao`:

```typescript
// ✅ Passo 1: Defina com invólucro FuncaoPadrao especificando a aridade
globals.definirVariavel(
    'minhaFuncao',
    new FuncaoPadrao(quantidadeParametros, async function(_: any, param1: any, param2: any) {
        // ✅ Passo 2: Primeiro parâmetro é SEMPRE _ (interpretador) - OBRIGATÓRIO

        // ✅ Passo 3: Desencapsula objetos invólucro nos parâmetros normais
        const resolvido1 = param1 && param1.hasOwnProperty('valor') ? param1.valor : param1;
        const resolvido2 = param2 && param2.hasOwnProperty('valor') ? param2.valor : param2;

        // ✅ Passo 4: Use interpretador.resolverValor() no estilo Pituguês
        const alt_resolvido1 = this.resolverValor(param1);

        // ✅ Passo 5: Valide os argumentos
        if (!Array.isArray(resolvido1)) {
            throw new ErroEmTempoDeExecucao(
                this.simbolo,
                'O primeiro parâmetro deve ser um vetor'
            );
        }

        // ✅ Passo 6: Para parâmetros de função, valide o tipo
        if (resolvido2.constructor !== DeleguaFuncao) {
            throw new ErroEmTempoDeExecucao(
                this.simbolo,
                'O segundo parâmetro deve ser uma função'
            );
        }

        // ✅ Passo 7: Chame parâmetros de função corretamente
        await resolvido2.chamar(this /* use _visitante, não _ */, [valorElemento]);

        // ✅ Passo 8: Retorne ou lance exceção
        return resultado;
    })
);
```

### Alternativa no estilo Pituguês:

```typescript
export async function minhaFuncao(
    interpretador: InterpretadorInterface,
    param1: any,
    param2: any
): Promise<any> {
    // ✅ Use interpretador.resolverValor() de forma consistente
    const resolvido1 = interpretador.resolverValor(param1);
    const resolvido2 = interpretador.resolverValor(param2);

    // ... o restante segue o padrão FuncaoPadrao ...
}
```

## 11. Erros Comuns a Evitar

### ❌ NÃO faça: Passe valores encapsulados para callbacks

```typescript
// ERRADO
for (let item of arrayResolvido) {
    // NÃO FAÇA: Passe item encapsulado se ele chegou encapsulado
    await callback.chamar(interpretador, [{ valor: item }]); // ❌
}

// CORRETO
for (let item of arrayResolvido) {
    // FAÇA: Passe o valor desencapsulado
    await callback.chamar(interpretador, [item]); // ✅
}
```

### ❌ NÃO faça: Esqueça de usar `await` para callbacks assíncronos

```typescript
// ERRADO
for (let item of arrayResolvido) {
    callback.chamar(interpretador, [item]); // ❌ Sem await!
}

// CORRETO
for (let item of arrayResolvido) {
    await callback.chamar(interpretador, [item]); // ✅
}
```

### ❌ NÃO faça: Use verificações inline de forma inconsistente

```typescript
// INCONSISTENTE
const resolvido1 = param1 && param1.hasOwnProperty('valor') ? param1.valor : param1;
const resolvido2 = interpretador.resolverValor(param2); // Estilos misturados!

// MELHOR: Consistente dentro de uma função
const resolvido1 = interpretador.resolverValor(param1);
const resolvido2 = interpretador.resolverValor(param2);
```

### ❌ NÃO faça: Esqueça de passar `interpretador` como primeiro argumento para `chamar()`

```typescript
// ERRADO - DeleguaFuncao espera InterpretadorInterface como primeiro parâmetro
callback.chamar([elemento]); // ❌

// CORRETO
callback.chamar(interpretador, [elemento]); // ✅
```

## 12. Tabela Resumo

| Tipo de Função | Argumentos Passados Como | Precisa Desencapsular? | Validação | Tratamento de Callback |
|---|---|---|---|---|
| **FuncaoPadrao** | Valores pré-resolvidos | Talvez (verificar `hasOwnProperty`) | Dentro da função | `callback.chamar(interp, [arg])` |
| **DeleguaFuncao** | `ArgumentoInterface[]` | Sempre (via `resolverAmbiente()`) | No resolvedor | `callback.chamar(interp, [arg])` |
| **Funções de ordem superior** | Ver FuncaoPadrao + callbacks | Vetor E callback | Ambos os tipos | Valida `callback.constructor` |
| **escreva() / imprima()** | Via `avaliarArgumentosEscreva()` | Durante avaliação | Por argumento | N/A (declarações) |
| **Métodos Tenda** | Igual a FuncaoPadrao | Igual a FuncaoPadrao | Igual | Igual |
| **Funções Pituguês** | Igual a FuncaoPadrao | Use `interpretador.resolverValor()` | Igual | Igual |
