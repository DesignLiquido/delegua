# Paradigma Consistente - Imperativo vs Infinitivo

Este recurso permite escolher um paradigma único para palavras reservadas em Delégua, mantendo a consistência do código entre formas imperativas e infinitivas.

## Contexto

Em português, instruções podem ser expressas de duas formas:
- **Imperativo**: escreva, leia, pegue, tente, etc.
- **Infinitivo**: escrever, ler, pegar, tentar, etc.

Delégua tradicionalmente aceita ambas as formas, mas alguns professores consideram a mistura não-intuitiva. Este recurso permite enforçar um paradigma único.

## Componentes

### 1. Mapeamento de Paradigmas (`mapeamento-paradigmas.ts`)

Define quais palavras pertencem a cada paradigma:

```typescript
import { pertenceAoParadigma, obterFormaAlternativa } from './lexador/mapeamento-paradigmas';

// Verifica se uma palavra pertence ao paradigma
pertenceAoParadigma('escreva', 'imperativo'); // true
pertenceAoParadigma('escrever', 'imperativo'); // false

// Obtém a forma alternativa
obterFormaAlternativa('escreva', 'infinitivo'); // 'escrever'
obterFormaAlternativa('ler', 'imperativo'); // 'leia'
```

**Palavras suportadas:**
- escreva ↔ escrever
- leia ↔ ler
- continua ↔ continuar
- retorna/retorne ↔ retornar
- escolha ↔ escolher
- tente ↔ tentar
- pegue ↔ pegar
- quebre ↔ quebrar
- importe ↔ importar
- faca/faça ↔ fazer

### 2. Filtro de Paradigma para Lexador (`filtro-paradigma.ts`)

Gera palavras reservadas filtradas por paradigma:

```typescript
import { gerarPalavrasReservadasPorParadigma } from './lexador/filtro-paradigma';

// Gera palavras apenas do paradigma imperativo
const palavrasImperativas = gerarPalavrasReservadasPorParadigma('imperativo');
// Resultado: { escreva: 'ESCREVA', leia: 'LEIA', ... }

// Gera palavras apenas do paradigma infinitivo
const palavrasInfinitivas = gerarPalavrasReservadasPorParadigma('infinitivo');
// Resultado: { escrever: 'ESCREVA', ler: 'LEIA', ... }

// Aceita ambos (padrão)
const todasPalavras = gerarPalavrasReservadasPorParadigma('ambos');
```

**Uso com Lexador personalizado:**

```typescript
import { Lexador } from './lexador';
import { gerarPalavrasReservadasPorParadigma } from './lexador/filtro-paradigma';

// Cria um lexador que só aceita forma imperativa
const palavrasImperativas = gerarPalavrasReservadasPorParadigma('imperativo');
const lexador = new Lexador();
// Nota: atualmente o Lexador usa palavras reservadas hardcoded
// Esta funcionalidade está disponível para futura extensão
```

### 3. Regra do Estilizador (`paradigma-consistente.ts`)

Transforma código para seguir um paradigma consistente:

```typescript
import { EstilizadorDelegua } from './estilizador/estilizador-delegua';
import { RegraParadigmaConsistente } from './estilizador/regras/paradigma-consistente';
import { Lexador } from './lexador';
import { AvaliadorSintaticoPitugues } from './avaliador-sintatico/dialetos/avaliador-sintatico-pitugues';

// Lexar e parsear o código
const lexador = new Lexador();
const parser = new AvaliadorSintaticoPitugues(); // Note: requer parser que armazena símbolos

const codigo = ['escrever("Olá")', 'ler()'];
const tokens = lexador.mapear(codigo, -1);
const ast = parser.analisar(tokens, -1);

// Modo 1: Transformar para imperativo
const estilizadorImperativo = new EstilizadorDelegua([
    new RegraParadigmaConsistente({ paradigma: 'imperativo' })
]);
const codigoImperativo = estilizadorImperativo.estilizar(ast.declaracoes);
// Resultado: escreva("Olá"), leia()

// Modo 2: Transformar para infinitivo
const estilizadorInfinitivo = new EstilizadorDelegua([
    new RegraParadigmaConsistente({ paradigma: 'infinitivo' })
]);
const codigoInfinitivo = estilizadorInfinitivo.estilizar(ast.declaracoes);
// Resultado: escrever("Olá"), ler()

// Modo 3: Validar sem transformar
const violacoes = estilizadorImperativo.validar(ast.declaracoes);
violacoes.forEach(v => console.log(v.mensagem));
```

## Limitações

### Parsers Suportados

A regra do estilizador **requer que o parser armazene os símbolos das palavras-chave**. Atualmente, apenas alguns parsers fazem isso:

- ✅ **AvaliadorSintaticoPitugues**: Armazena `simboloEscreva` em declarações Escreva
- ❌ **AvaliadorSintatico** (padrão): Não armazena símbolos das palavras-chave
- ❌ **Outros dialetos**: Suporte varia

### Declarações/Construtos Suportados

Atualmente, a regra funciona com:
- ✅ **Escreva** (quando `simboloEscreva` está presente)
- ✅ **Leia** (o símbolo sempre está presente no construto)
- ❌ **Tente, Escolha, Para, etc**: Símbolos não armazenados atualmente

Para suporte completo, seria necessário modificar os parsers para armazenar todos os símbolos de palavras-chave.

## Exemplos de Uso

### Exemplo 1: Código Imperativo

```delegua
escreva("Digite seu nome:")
var nome = leia()
escreva("Olá, " + nome)

tente {
    // código
} pegue (erro) {
    escreva(erro)
}
```

### Exemplo 2: Código Infinitivo

```delegua
escrever("Digite seu nome:")
var nome = ler()
escrever("Olá, " + nome)

tentar {
    // código
} pegar (erro) {
    escrever(erro)
}
```

### Exemplo 3: Pipeline de Build com Paradigma

```typescript
// build-imperativo.ts
import { Lexador, AvaliadorSintaticoPitugues, EstilizadorDelegua } from '@designliquido/delegua';
import { RegraParadigmaConsistente } from '@designliquido/delegua/estilizador';
import * as fs from 'fs';

const codigo = fs.readFileSync('meu-codigo.delegua', 'utf-8');

const lexador = new Lexador();
const parser = new AvaliadorSintaticoPitugues();
const tokens = lexador.mapear(codigo.split('\n'), -1);
const ast = parser.analisar(tokens, -1);

// Enforça paradigma imperativo
const estilizador = new EstilizadorDelegua([
    new RegraParadigmaConsistente({ paradigma: 'imperativo' })
]);

const astEstilizado = estilizador.estilizar(ast.declaracoes);

// Gera código formatado
const formatador = new FormatadorDelegua('\n', 4);
const codigoFormatado = formatador.formatar(astEstilizado);

fs.writeFileSync('meu-codigo-imperativo.delegua', codigoFormatado);
```

## Melhores Práticas

1. **Escolha um paradigma no início do projeto** e mantenha-o consistente
2. **Use no CI/CD** para validar que todo código segue o paradigma escolhido
3. **Documente a escolha** no README do projeto para novos contribuidores
4. **Considere o público-alvo**:
   - Iniciantes podem preferir imperativo (mais direto)
   - Programadores experientes podem preferir infinitivo (mais técnico)

## Futuras Melhorias

- [ ] Modificar todos os parsers para armazenar símbolos de palavras-chave
- [ ] Suportar transformação de todas as palavras-chave (tente, escolha, etc.)
- [ ] Adicionar opção de paradigma no Lexador diretamente
- [ ] Criar comando CLI para transformar arquivos automaticamente
- [ ] Adicionar suporte para configuração via arquivo (`.deleguarc`)

## Testes

Veja os testes completos em:
- `testes/lexador/mapeamento-paradigmas.test.ts`
- `testes/lexador/filtro-paradigma.test.ts`
- `testes/estilizador/paradigma-consistente.test.ts`

Para executar:
```bash
npm run testes-unitarios -- mapeamento-paradigmas.test
npm run testes-unitarios -- filtro-paradigma.test
npm run testes-unitarios -- paradigma-consistente.test
```
