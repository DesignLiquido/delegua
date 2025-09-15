# Dialeto Prisma para Delégua

Este diretório contém exemplos de código escritos no dialeto **Prisma** da linguagem Delégua. O dialeto Prisma foi criado seguindo a mesma estrutura dos outros dialetos suportados pelo projeto Delégua.

## Características do Dialeto Prisma

- **Sintaxe similar ao JavaScript/C**: Usa chaves `{}` para blocos de código
- **Tipagem dinâmica**: Variáveis não precisam ter tipo declarado explicitamente
- **Palavras-chave em português**: `se`, `senão`, `enquanto`, `para`, `funcao`, etc.
- **Suporte a orientação a objetos**: Classes, herança e métodos
- **Estruturas de dados**: Arrays/vetores e dicionários/objetos
- **Comentários**: Suporte a comentários de linha (`//`) e bloco (`/* */`)

## Exemplos Disponíveis

1. **ola-mundo.prisma** - Exemplo básico de "Olá, mundo!"
2. **variaveis.prisma** - Declaração e uso de variáveis
3. **operacoes.prisma** - Operações matemáticas e aritméticas
4. **condicionais.prisma** - Estruturas condicionais (`se`/`senão`)
5. **loops.prisma** - Estruturas de repetição (`para`, `enquanto`, `para cada`)
6. **funcoes.prisma** - Declaração e uso de funções
7. **arrays.prisma** - Trabalho com arrays/vetores
8. **classes.prisma** - Programação orientada a objetos

## Sintaxe Básica

### Variáveis
```prisma
local nome = "João";
local idade = 25;
local ativo = verdadeiro;
```

### Condicionais
```prisma
se (idade >= 18) {
    imprima("Maior de idade");
} senão {
    imprima("Menor de idade");
}
```

### Loops
```prisma
// For tradicional
para (local i = 0; i < 5; i = i + 1) {
    imprima(i);
}

// While
enquanto (contador < 10) {
    contador = contador + 1;
}

// Para cada
para cada item em lista {
    imprima(item);
}
```

### Funções
```prisma
funcao somar(a, b) {
    retorna a + b;
}

local resultado = somar(3, 4);
```

### Classes
```prisma
classe Pessoa {
    construtor(nome, idade) {
        isto.nome = nome;
        isto.idade = idade;
    }
    
    funcao apresentar() {
        retorna "Olá, eu sou " + isto.nome;
    }
}

local pessoa = Pessoa("Maria", 30);
imprima(pessoa.apresentar());
```

## Palavras-chave

- `local` - Declaração de variável
- `funcao` - Declaração de função
- `classe` - Declaração de classe
- `construtor` - Construtor de classe
- `se` - Condicional
- `senão` - Else
- `enquanto` - Loop while
- `para` - Loop for
- `cada` - Para cada elemento
- `em` - Operador in
- `retorna` - Return
- `verdadeiro` - Boolean true
- `falso` - Boolean false
- `nulo` - Null
- `isto` - This
- `super` - Super
- `imprima` - Print/output
- `leia` - Input
- `e` - Operador AND lógico
- `ou` - Operador OR lógico
- `continua` - Continue
- `sustar` - Break
- `tente` - Try
- `pegue` - Catch
- `finalmente` - Finally

## Como usar

Para usar o dialeto Prisma, você precisará do lexador e avaliador sintático específicos:

```typescript
import { LexadorPrisma } from './fontes/lexador/dialetos';
import { AvaliadorSintaticoPrisma } from './fontes/avaliador-sintatico/dialetos';

const lexador = new LexadorPrisma();
const avaliador = new AvaliadorSintaticoPrisma();

// Análise do código Prisma
const retornoLexador = lexador.mapear(codigoFonte, hashArquivo);
const retornoAvaliador = avaliador.analisar(retornoLexador, hashArquivo);
```

## Testes

Os testes para o dialeto Prisma estão localizados em `testes/prisma/` e incluem:
- Testes do lexador
- Testes do avaliador sintático  
- Testes do interpretador

Execute os testes com:
```bash
npm test -- testes/prisma/
```
