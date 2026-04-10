# Limitações do Tradutor Reverso de Python para Delégua

Este documento cataloga as funcionalidades do Python que não podem ser traduzidas para Delégua,
seja por ausência de equivalente na linguagem, seja por perda de semântica na tradução.

---

## 1. Sem equivalente em Delégua

Funcionalidades Python que não têm correspondente na linguagem Delégua e, portanto,
**não podem ser traduzidas de forma alguma**.

### Geradores e `yield`

```python
def contar():
    yield 1
    yield 2

gen = (x * 2 for x in range(5))   # generator expression
```

Delégua não possui protocolo de iteradores lazy nem instrução `yield`.
Geradores e expressões geradoras não têm equivalente.

### `async` / `await`

```python
async def buscar():
    resultado = await http.get(url)
```

Delégua executa de forma síncrona. Não há primitivas de concorrência ou co-rotinas.

### `global` e `nonlocal`

```python
contador = 0

def incrementar():
    global contador
    contador += 1
```

Delégua usa escopo léxico sem modificadores de escopo explícitos.

### Operador walrus (`:=`, Python 3.8+)

```python
while chunk := arquivo.read(1024):
    processar(chunk)
```

Não existe atribuição dentro de expressão em Delégua.

### `match` / `case` (Python 3.10+)

```python
match comando:
    case "sair":
        sair()
    case "ajuda":
        mostrar_ajuda()
    case _:
        acao_padrao()
```

Delégua possui o construto equivalente `escolha`/`caso`/`padrao`:

```
escolha comando {
    caso "sair":
        sair()
    caso "ajuda":
        mostrar_ajuda()
    padrao:
        acao_padrao()
}
```

No entanto, **a gramática ANTLR utilizada pelo tradutor é anterior ao Python 3.10** e não
reconhece a instrução `match`. Para suporte à tradução, seria necessário atualizar a
gramática para a versão Python 3.10+.

### `del`

```python
del lista[2]
del variavel
```

Não há instrução de exclusão de variáveis ou elementos em Delégua.

### `assert`

```python
assert x > 0, "x deve ser positivo"
```

Delégua não possui instrução de asserção nativa.

### Metaclasses

```python
class Meta(type):
    pass

class Foo(metaclass=Meta):
    pass
```

O sistema de tipos de Delégua não expõe metaclasses.

### Métodos mágicos (`__dunder__`) além de `__init__`

```python
class Vetor:
    def __add__(self, outro):   # sobrecarga de operador
        ...
    def __str__(self):          # representação textual
        ...
    def __len__(self):          # protocolo de tamanho
        ...
    def __iter__(self):         # protocolo de iteração
        ...
```

Delégua não suporta sobrecarga de operadores via métodos especiais.
Apenas `__init__` é traduzido (como `construtor`).

### `for/else` e `while/else`

```python
for item in lista:
    if item == alvo:
        break
else:
    print("não encontrado")
```

A cláusula `else` em laços não existe em Delégua.

### Sistema de módulos (`import`)

```python
import os
import json
from pathlib import Path
from collections import defaultdict
```

Delégua possui seu próprio sistema de bibliotecas, incompatível com o ecossistema Python.
Qualquer instrução `import` não é traduzida.

### Biblioteca padrão Python

Toda a stdlib Python (`os`, `sys`, `json`, `math`, `re`, `datetime`, `collections`,
`itertools`, etc.) não tem equivalente direto em Delégua.

---

## 2. Traduzidos com perda de semântica

Funcionalidades que **recebem uma tradução aproximada**, porém com diferenças semânticas
que podem alterar o comportamento do programa.

### `is` / `is not` → `==` / `!=`

```python
# Python: comparação de identidade (memória)
if x is None:
    ...
if a is not b:
    ...
```

Traduzido como `x == nulo` e `a != b`. Perde a distinção entre igualdade de valor e
identidade de objeto.

### Múltiplas cláusulas `except` → bloco único `pegue`

```python
try:
    operacao()
except ValueError:
    tratar_valor()
except TypeError:
    tratar_tipo()
```

Traduzido com os corpos mesclados num único `pegue {}`. O despacho por tipo de exceção
é perdido.

### Tipo da exceção em `except` → descartado

```python
except ValueError as e:
    print(e)
```

O tipo `ValueError` não é traduzido. Apenas o alias `e` é preservado: `pegue (e) { ... }`.
Delégua não filtra exceções por tipo.

### Cláusula `try/else` → descartada silenciosamente

```python
try:
    resultado = operacao()
except Exception:
    tratar()
else:
    # Executado apenas quando não houve exceção
    usar(resultado)
```

O bloco `else` não tem equivalente em Delégua e é silenciosamente ignorado.

### `raise X from Y` → encadeamento descartado

```python
raise RuntimeError("falha") from causa_original
```

Traduzido como `levante RuntimeError("falha")`. A causa original é descartada.

### Decoradores → ignorados

```python
@property
def nome(self):
    return self._nome

@classmethod
def criar(cls, valor):
    ...

@staticmethod
def utilitario():
    ...

@meu_decorador
def funcao():
    ...
```

O tradutor ignora todos os decoradores e traduz apenas o `funcao`/`classe` subjacente.
A semântica de `@property`, `@classmethod` e `@staticmethod` é perdida.

### Indexação negativa

```python
ultimo = lista[-1]
penultimo = lista[-2]
```

`lista[-1]` é traduzido literalmente. Delégua pode não suportar índices negativos
dependendo do contexto de execução.

### `*args` e `**kwargs` → truncados

```python
def funcao(*args, **kwargs):
    ...
```

O tradutor para de processar parâmetros ao encontrar `*` ou `**`. A função fica sem
parâmetros variádicos em Delégua.

---

## 3. Não implementados no tradutor (mas Delégua tem equivalente)

Funcionalidades que **poderiam ser traduzidas** pois Delégua possui o construto correspondente,
mas que ainda não estão implementadas no tradutor.

| Python | Delégua |
|--------|---------|
| `a if cond else b` | `cond ? a : b` |
| `a & b` (AND bit a bit) | `a & b` |
| `a \| b` (OR bit a bit) | `a \| b` |
| `a ^ b` (XOR bit a bit) | `a ^ b` |
| `~a` (NOT bit a bit) | `~a` |
| `a << n` (shift esquerda) | `a << n` |
| `a >> n` (shift direita) | `a >> n` |
| `super().metodo()` | `super.metodo()` |
| `with expr as var:` | `tendo var como expr` |

A instrução `tendo...como` de Delégua gerencia o ciclo de vida do recurso: ao sair
do escopo, o método `finalizar()` do objeto é chamado automaticamente, equivalendo ao
`__exit__` do gerenciador de contexto Python.

---

## 4. Sem equivalente em Delégua (em expressões ou atribuições)

### Desempacotamento de tupla

```python
a, b = 1, 2
a, b = b, a          # troca
x, y, z = ponto
```

Delégua não suporta desempacotamento de iterável em atribuição.

### Desempacotamento com `*`

```python
primeiro, *resto = lista
*inicio, ultimo = lista
a, *b, c = [1, 2, 3, 4, 5]
```

Sem equivalente em Delégua.

### Atribuição em cadeia

```python
a = b = c = 0
```

O tradutor processa apenas a primeira atribuição. `a = b = c = 0` não é traduzido
corretamente.

### Compreensão de dicionário

```python
quadrados = {x: x**2 for x in range(10)}
invertido = {v: k for k, v in dicionario.items()}
```

Delégua não possui compreensão de dicionário. Apenas compreensões de lista são traduzidas
(via `mapear`/`filtrarPor`).

### Compreensão de conjunto (_set comprehension_)

```python
unicos = {x.lower() for x in palavras}
```

Delégua não possui tipo `set` nativo.

### Literais de conjunto (_set_)

```python
vogais = {'a', 'e', 'i', 'o', 'u'}
```

Sem equivalente. Literais `{...}` sem pares `chave: valor` são ambíguos para o tradutor.

### Compreensões encadeadas (múltiplos `for`)

```python
planificado = [x for linha in matriz for x in linha]
pares = [(x, y) for x in range(3) for y in range(3) if x != y]
```

Apenas o primeiro `for` é traduzido. Iterações encadeadas não são suportadas.

### Fatiamento com passo

```python
cada_dois = lista[::2]
invertida = lista[::-1]
fragmento = lista[1:10:2]
```

Delégua usa `lista[inicio..fim]` mas não suporta um terceiro argumento de passo.

### Formatação de string com `%`

```python
mensagem = "Olá, %s! Você tem %d anos." % (nome, idade)
```

Sem equivalente. Use f-strings: `f"Olá, {nome}! Você tem {idade} anos."`.

### `str.format()`

```python
mensagem = "Olá, {}! Você tem {} anos.".format(nome, idade)
mensagem = "Olá, {nome}!".format(nome=nome)
```

Sem equivalente. Use f-strings.

### Funções de ordem superior da stdlib

```python
lista_ordenada = sorted(lista, key=lambda x: x.nome, reverse=True)
mapeada = list(map(lambda x: x * 2, lista))
filtrada = list(filter(lambda x: x > 0, lista))
combinada = list(zip(lista_a, lista_b))
enumerada = list(enumerate(lista))
```

`map`, `filter`, `zip`, `enumerate` e `sorted` com argumentos nomeados não têm
equivalente direto. Use as funções `mapear`/`filtrarPor` de Delégua com sintaxe explícita.

### `__slots__`

```python
class Ponto:
    __slots__ = ['x', 'y']
```

Sem equivalente em Delégua.

### Variáveis de classe vs. de instância

```python
class Contador:
    total = 0                  # variável de classe (compartilhada)

    def __init__(self):
        self.local = 0         # variável de instância
```

O tradutor não distingue variáveis de classe de variáveis de instância.
Toda atribuição dentro de `__init__` é tratada como atribuição de atributo.

### Strings multilinhas com `"""`

```python
texto = """
Linha 1
Linha 2
"""
```

O lexer ANTLR do Python3 tokeniza strings multilinha corretamente, mas o resultado
pode não ser compatível com o parser de Delégua dependendo do dialeto utilizado.
