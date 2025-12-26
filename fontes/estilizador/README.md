# Estilizador Delégua

O Estilizador é uma ferramenta de transformação de código que aplica regras para melhorar a qualidade e consistência do código Delégua. Diferente de um formatador que apenas ajusta a apresentação visual, o Estilizador modifica a árvore sintática para cumprir convenções e fortalecer tipos.

## Características

- ✅ **Fortalecimento de Tipos**: Converte tipos genéricos (`qualquer`) para tipos inferidos
- ✅ **Convenções de Nomenclatura**: Enforça padrões de nomes para variáveis, constantes e funções
- ✅ **Paradigma Consistente**: Enforça uso consistente de imperativo ou infinitivo em palavras reservadas
- ✅ **Regras Plugáveis**: Adicione suas próprias regras de transformação
- ✅ **Modo de Validação**: Detecta violações sem modificar o código
- ✅ **Modo de Transformação**: Aplica transformações automaticamente

## Uso Básico

```typescript
import { Lexador, AvaliadorSintatico } from '@designliquido/delegua';
import { EstilizadorDelegua, RegraFortalecerTipos } from '@designliquido/delegua/estilizador';

// 1. Lexar e parsear o código
const lexador = new Lexador();
const avaliadorSintatico = new AvaliadorSintatico();

const retornoLexador = lexador.mapear(['var x = 5'], -1);
const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

// 2. Criar estilizador com regras
const estilizador = new EstilizadorDelegua([
    new RegraFortalecerTipos()
]);

// 3. Estilizar (transformar) o código
const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

// Resultado: var x: número = 5
```

## Regras Disponíveis

### 1. Fortalecer Tipos (`RegraFortalecerTipos`)

Converte declarações com tipo `qualquer` para tipos inferidos quando possível.

**Exemplos:**

```typescript
// Antes
var x = 5              // tipo: qualquer
var nome = "João"      // tipo: qualquer
constante PI = 3.14    // tipo: qualquer

// Depois
var x: número = 5              // tipo: número
var nome: texto = "João"       // tipo: texto
constante PI: número = 3.14    // tipo: número
```

**Uso:**

```typescript
import { RegraFortalecerTipos } from '@designliquido/delegua/estilizador';

const regra = new RegraFortalecerTipos();
estilizador.adicionarRegra(regra);
```

### 2. Convenção de Nomenclatura (`RegraConvencaoNomenclatura`)

Enforça padrões de nomenclatura para variáveis, constantes e funções.

**Opções de Convenção:**

- **caixaCamelo**: `primeiraPalavraMinuscula`
- **caixa_cobra**: `primeira_palavra_minuscula`
- **CaixaPascal**: `PrimeiraPalavraMaiuscula`
- **CAIXA_ALTA**: `TODAS_MAIUSCULAS`

**Exemplos:**

```typescript
// Variáveis em caixaCamelo
var MeuNome = "João"     // → var meuNome = "João"

// Constantes em CAIXA_ALTA
constante piValor = 3.14  // → constante PI_VALOR = 3.14

// Funções em caixaCamelo
função CalcularTotal() {}  // → função calcularTotal() {}
```

**Uso:**

```typescript
import { RegraConvencaoNomenclatura } from '@designliquido/delegua/estilizador';

const regra = new RegraConvencaoNomenclatura({
    variavel: 'caixaCamelo',      // ou 'caixa_cobra', 'CaixaPascal'
    constante: 'CAIXA_ALTA',      // ou 'caixaCamelo'
    funcao: 'caixaCamelo'         // ou 'caixa_cobra', 'CaixaPascal'
});

estilizador.adicionarRegra(regra);
```

### 3. Paradigma Consistente (`RegraParadigmaConsistente`)

Enforça consistência de paradigma (imperativo vs infinitivo) em palavras reservadas.

Em português, instruções podem ser expressas no imperativo (escreva, leia) ou no infinitivo (escrever, ler). Esta regra permite escolher um paradigma único para manter a consistência do código.

**Exemplos:**

```typescript
// Modo imperativo
escreva("Olá")    // ✅ Aceito
escrever("Olá")   // ❌ Transformado para: escreva("Olá")

// Modo infinitivo
escrever("Olá")   // ✅ Aceito
escreva("Olá")    // ❌ Transformado para: escrever("Olá")
```

**Uso:**

```typescript
import { RegraParadigmaConsistente } from '@designliquido/delegua/estilizador';

const regra = new RegraParadigmaConsistente({
    paradigma: 'imperativo'  // ou 'infinitivo', 'ambos'
});

estilizador.adicionarRegra(regra);
```

**📖 Documentação completa:** Veja [PARADIGMAS.md](./PARADIGMAS.md) para detalhes sobre:
- Palavras suportadas (escreva/escrever, leia/ler, tente/tentar, etc.)
- Filtro de paradigma para o lexador
- Exemplos de uso e limitações

## Modo de Validação

O modo de validação detecta violações sem modificar o código:

```typescript
const estilizador = new EstilizadorDelegua([
    new RegraFortalecerTipos(),
    new RegraConvencaoNomenclatura({ variavel: 'caixaCamelo' })
]);

const violacoes = estilizador.validar(declaracoes);

violacoes.forEach(violacao => {
    console.log(`${violacao.regra}: ${violacao.mensagem} (linha ${violacao.linha})`);
});
```

**Exemplo de saída:**

```
convencao-nomenclatura: Enforça convenções de nomenclatura para variáveis, constantes e funções (linha 1)
fortalecer-tipos: Converte tipos `qualquer` para tipos inferidos quando possível (linha 2)
```

## Aplicando Múltiplas Regras

As regras são aplicadas na ordem em que são adicionadas:

```typescript
const estilizador = new EstilizadorDelegua([
    new RegraFortalecerTipos(),
    new RegraConvencaoNomenclatura({
        variavel: 'caixaCamelo',
        constante: 'CAIXA_ALTA'
    }),
    new RegraParadigmaConsistente({
        paradigma: 'imperativo'
    })
]);

// Código original
const codigo = [
    'var MeuNumero = 42',
    'constante piValor = 3.14',
    'escrever("Olá")'
];

// Resultado após estilização
// var meuNumero: número = 42
// constante PI_VALOR: número = 3.14
// escreva("Olá")
```

## Gerenciando Regras Dinamicamente

```typescript
const estilizador = new EstilizadorDelegua();

// Adicionar regra
estilizador.adicionarRegra(new RegraFortalecerTipos());
estilizador.adicionarRegra(new RegraConvencaoNomenclatura());

// Remover regra pelo nome
estilizador.removerRegra('fortalecer-tipos');

// Verificar regras ativas
console.log(estilizador.regras.map(r => r.nome));
// Saída: ['convencao-nomenclatura']
```

## Criando Regras Personalizadas

Você pode criar suas próprias regras implementando a interface `RegraEstilizacao`:

```typescript
import { RegraEstilizacao } from '@designliquido/delegua';
import { Declaracao, Var } from '@designliquido/delegua/declaracoes';

export class MinhaRegraCustomizada implements RegraEstilizacao {
    nome = 'minha-regra';
    descricao = 'Descrição da minha regra';

    aplicarEmDeclaracao(declaracao: Declaracao): Declaracao {
        if (declaracao instanceof Var) {
            // Aplicar transformação
            // ...
        }
        return declaracao;
    }

    aplicarEmConstruto(construto: Construto): Construto {
        // Aplicar transformação em construtos
        return construto;
    }
}

// Usar a regra
estilizador.adicionarRegra(new MinhaRegraCustomizada());
```

## Integração com _Pipeline_ de _Build_

O Estilizador pode ser integrado em _pipelines_ de _build_ para garantir consistência:

```typescript
// build.ts
import { Lexador, AvaliadorSintatico } from '@designliquido/delegua';
import { EstilizadorDelegua, RegraFortalecerTipos, RegraConvencaoNomenclatura } from '@designliquido/delegua/estilizador';
import { FormatadorDelegua } from '@designliquido/delegua/formatadores';
import * as fs from 'fs';

// Ler código
const codigo = fs.readFileSync('meu-codigo.delegua', 'utf-8');

// Lexar e parsear
const lexador = new Lexador();
const avaliadorSintatico = new AvaliadorSintatico();
const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

// Estilizar
const estilizador = new EstilizadorDelegua([
    new RegraFortalecerTipos(),
    new RegraConvencaoNomenclatura({ variavel: 'caixaCamelo', constante: 'CAIXA_ALTA' }),
    new RegraParadigmaConsistente({ paradigma: 'imperativo' })
]);
const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

// Formatar
const formatador = new FormatadorDelegua('\n', 4);
const codigoFormatado = formatador.formatar(declaracoesEstilizadas);

// Salvar
fs.writeFileSync('meu-codigo-estilizado.delegua', codigoFormatado);
```

## Diferenças entre Estilizador e Formatador

| **Estilizador**              | **Formatador**                  |
|------------------------------|---------------------------------|
| Modifica a árvore sintática  | Modifica apenas a apresentação  |
| Fortalece tipos              | Não altera tipos                |
| Renomeia identificadores     | Não renomeia identificadores    |
| Aplica regras de qualidade   | Aplica regras de formatação     |
| Executa antes da compilação  | Executa antes de salvar arquivo |

## Melhores Práticas

1. **Aplique o Estilizador antes da compilação** para garantir que o código esteja consistente
2. **Use modo de validação em CI/CD** para detectar violações sem modificar código
3. **Combine com Formatador** para obter código bem formatado E bem estilizado
4. **Defina convenções no início do projeto** e use o Estilizador para enforçá-las
5. **Crie regras customizadas** para necessidades específicas da sua equipe

## API

### `EstilizadorDelegua`

```typescript
class EstilizadorDelegua {
    regras: RegraEstilizacao[];

    constructor(regras?: RegraEstilizacao[]);
    adicionarRegra(regra: RegraEstilizacao): void;
    removerRegra(nomeRegra: string): void;
    estilizar(declaracoes: Declaracao[]): Declaracao[];
    validar(declaracoes: Declaracao[]): ViolacaoEstilo[];
}
```

### `RegraEstilizacao`

```typescript
interface RegraEstilizacao {
    nome: string;
    descricao: string;
    aplicarEmDeclaracao?(declaracao: Declaracao): Declaracao;
    aplicarEmConstruto?(construto: Construto): Construto;
}
```

### `ViolacaoEstilo`

```typescript
interface ViolacaoEstilo {
    regra: string;
    mensagem: string;
    linha: number;
    hashArquivo: number;
    severidade: 'erro' | 'aviso' | 'informacao';
}
```

