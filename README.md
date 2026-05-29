<!-- ================================ -->
<!-- 🏛️ TRADUTOR DE DOTAÇÃO          -->
<!-- ================================ -->

<h1 align="center">🏛️ Tradutor de Dotação Orçamentária</h1>

<p align="center">
  Cole o código ou digite a dotação e entenda em linguagem clara para onde vai o dinheiro público: o seu dinheiro!
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-orange?style=for-the-badge&logo=html5&logoColor=white">
  <img src="https://img.shields.io/badge/CSS3-blue?style=for-the-badge&logo=css3&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge&logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/RegEx-009688?style=for-the-badge">
  <img src="https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white">
</p>

<p align="center">
  <a href="https://locattimurilo.github.io/tradutordedotacao/">
    <img src="https://img.shields.io/badge/🚀 Acessar Ferramenta-0A66C2?style=for-the-badge">
  </a>
</p>

---

> Uma ferramenta web que traduz códigos de dotação orçamentária (aqueles números crípticos como `23.02 3.3.90.93 1 10.302.2074.2.121`) em linguagem legível: qual órgão, qual programa, que tipo de despesa e de qual fonte de recurso. Roda **100% no navegador**, sem servidor e sem armazenar dados.

---

## 💡 Como nasceu

O projeto começou a partir de uma conversa com o <a href="https://www.instagram.com/djalmaneryneto/">vereador Djalma Nery (PSOL)</a>. Foi ele quem trouxe a demanda e a ideia inicial: a partir da própria rotina como vereador, identificou uma dificuldade traduzir as dotações, que exigiam consultar várias tabelas oficiais separadas, cruzando manualmente os códigos de órgão, função, subfunção, programa, ação, natureza da despesa e fonte de recurso.

A proposta que ele formulou foi direta e solicita: criar um **mecanismo de busca em que, ao inserir a dotação, a ferramenta devolvesse a leitura pronta** funcionando como um leitor de CPF que encotramos em sites variados,  que reconhece e valida o padrão automaticamente conforme você digita. A visão do problema e o desenho da solução partiram dessa leitura política e prática do orçamento público.

---

## 🛠️ A engenharia por trás

A partir dessa ideia, meu papel foi transformá-la em software funcional. O núcleo do projeto é um **problema de reconhecimento de padrões**: uma dotação não é um número único, mas a concatenação de vários campos com formatos próprios, que precisam ser identificados, separados e cruzados com as tabelas oficiais da prefeitura.

A solução de engenharia se apoiou em alguns pilares:

- **Modelagem do padrão com expressões regulares.** Cada campo da dotação tem uma estrutura distinta (`X.Y.ZZ.AA` para natureza, `XX.YY.ZZZZ.A.BBBB` para a funcional programática, e assim por diante). Desenhei o conjunto de regex que reconhece cada formato e desambígua os tokens, por exemplo, distinguir um código de órgão de um código de fonte quando ambos são numéricos curtos, registrando a fonte apenas quando uma natureza já foi identificada, para evitar falsos positivos.

- **Parser tolerante a entrada humana.** O usuário pode colar a dotação formatada, com espaços, com vírgulas ou como uma sequência contínua de dígitos. O parser distribui corretamente os valores entre os campos em qualquer um desses cenários, decompondo até mesmo a funcional programática em função, subfunção, programa e ação.

- **Máscara com controle de cursor e navegação assistida.** A formatação é aplicada em tempo real enquanto se digita, reposicionando o cursor pela contagem de dígitos (e não pela posição bruta) para que a edição no meio do campo não "pule". Os campos avançam sozinhos quando preenchidos e o `Backspace` em campo vazio retorna ao anterior a experiência de leitor de CPF que o vereador propôs.

- **Arquitetura modular e sem dependências.** Cada responsabilidade vive em seu próprio módulo encapsulado (`parser`, `mask`, `translator`, `lookup`, `app`), no padrão IIFE com namespace, expondo apenas uma API pública. Nenhum framework, nenhuma biblioteca externa e sim JavaScript puro.

- **Segurança contra XSS.** Todo dado é passado por uma função de escape de HTML (`& < > " '`) antes de ser inserido no DOM, evitando injeção de código mesmo a partir das tabelas de dados.

- **Otimização de desempenho com debounce.** A tradução só dispara após uma breve pausa na digitação (debounce de 120 ms), evitando reprocessar a cada tecla.

- **Separação de dados e lógica.** As tabelas oficiais (órgãos, unidades, funções, subfunções, programas, ações, naturezas e fontes) ficam isoladas em arquivos de dados, separadas da lógica de tradução. Isso permite atualizar a base orçamentária de um exercício para outro sem tocar no código.

- **Interface responsiva.** Layout adaptado para desktop, tablet e celular, com a tabela de detalhes reorganizada em telas pequenas e ajustes específicos para dispositivos de toque.

- **Arquitetura sem back-end.** Tudo roda no navegador e é publicado via GitHub Pages. Não há servidor, login nem armazenamento de dados, o que mantém a ferramenta simples de hospedar, auditável e segura por design.

No processo, usei inteligência artificial como ferramenta de apoio para acelerar a escrita do parser e dos regex a partir das minhas especificações, a concepção do problema, a lógica de reconhecimento, os ajustes no código e a validação contra as fichas públicas foram trabalho de engenharia.


---

## ⚙️ Como funciona

1. Você cola ou digita a dotação nos campos (órgão · categoria econômica · fonte · funcional programática).
2. As máscaras formatam a entrada em tempo real e o parser identifica cada componente via regex.
3. Após uma breve pausa na digitação (debounce), a ferramenta cruza os códigos com as tabelas oficiais e devolve cartões com a leitura: órgão, ação/programa, tipo de despesa e fonte de recurso.
4. Uma seção expansível mostra o detalhamento completo, campo a campo, incluindo função e subfunção extraídas da funcional programática.

Também há uma aba de **consulta de tabelas**, para navegar e filtrar diretamente cada uma das bases (órgãos, funções, programas, etc.).

---

## 🧱 Tecnologias e técnicas

**Linguagens e padrões**
`HTML5` `CSS3` `JavaScript (ES6, vanilla)` `RegEx`

**Arquitetura e técnicas**
- JavaScript modular (padrão IIFE + namespace), sem frameworks nem dependências
- Expressões regulares para parsing e validação de padrões
- Máscaras de input com controle de cursor e navegação assistida entre campos
- Debounce para otimização de desempenho
- Escape de HTML (proteção contra XSS)
- Separação de dados e lógica (tabelas isoladas em módulos de dados)
- CSS responsivo (desktop, tablet, mobile e dispositivos de toque)
- Arquitetura 100% client-side, sem back-end

**Hospedagem**
`GitHub Pages`

---

## 📚 Fontes dos dados

Tabelas orçamentárias oficiais da Prefeitura Municipal de São Carlos (exercício 2026).

---

## 🏙️ Quer implementar na sua cidade?

A ferramenta foi pensada para ser adaptável a qualquer município — basta substituir as tabelas orçamentárias pelos dados locais. **Estou aberto a colaborar e implementar o Tradutor em outras cidades.** Entre em contato pelo [LinkedIn](https://www.linkedin.com/in/murilo-locatti-cavalho-36b03a140/).

---

Licença: GNU 🦬

---

<p align="center">
  ⭐ Se a ferramenta te ajudou a entender o orçamento da sua cidade, considera deixar uma estrela!
</p>
