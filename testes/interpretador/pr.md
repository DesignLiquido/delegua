# Descrição
Esta PR tem como objetivo melhorar o suporte a emojis no interpretador do Delegua, permitindo que os emojis sejam processados corretamente tanto em strings quanto como caracteres independentes.
## Alterações
- O lexador foi atualizado para reconhecer emojis. Para isso, foi preciso alterar a codificação para UTF-16, modificando a forma como os caracteres são processados, garantindo que os emojis sejam tratados como unidades completas.
## Ganhos
- Suporte a emojis: Agora o interpretador processa emojis como texto, permitindo que sejam usados em strings e como caracteres independentes.
fix #1315
