(function () {
  // ========== INICIALIZAÇÃO ==========
  // Atalho para document.getElementById
  const $ = (id) => document.getElementById(id);

  // Referência aos campos de entrada de dados
  const fields = {
    orgao: $('f-orgao'),      // Ex: 12.01
    nat:   $('f-nat'),        // Ex: 3.3.90.39
    fonte: $('f-fonte'),      // Ex: 95
    fp:    $('f-fp')          // Ex: 12.368.2049.2.074
  };

  // Referência aos elementos de resultado e tabelas
  const answer      = $('answer');
  const tableSelect = $('table-select');
  const searchInput = $('search-input');
  const lookupResult = $('lookup-result');

  let debounceTimer;  // Armazena o ID do timeout de debounce

  // ========== FUNÇÃO PRINCIPAL ==========
  // Traduz os valores dos campos e exibe o resultado
  function translate() {
    // Captura o valor dos campos formatados
    const inputValue = Mask.getValue(fields).trim();
    
    if (!inputValue) {
      answer.style.display = 'none';
      answer.innerHTML = '';
      return;
    }
    
    // Exibe o resultado da tradução
    answer.style.display = 'block';
    answer.innerHTML = Translator.render(inputValue);
  }

  // Handler com debounce: aguarda 120ms antes de traduzir
  // Evita traduzir a cada caractere digitado
  function onChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(translate, 120);
  }

  // Configura validação e formatação automática dos campos
  Mask.attach(fields, onChange);

  // ========== EXEMPLOS (CHIPS) ==========
  // Quando o usuário clica num exemplo, preenche os campos e traduz
  document.querySelectorAll('.chip').forEach(exemploBotao => {
    exemploBotao.addEventListener('click', () => {
      const exemploDotacao = exemploBotao.dataset.ex;
      Mask.distribute(exemploDotacao, fields);
      onChange();
      fields.orgao.focus();
    });
  });

  // ========== NAVEGAÇÃO ENTRE ABAS ==========
  // Controla a alternância entre "Traduzir" e "Consultar tabela"
  document.querySelectorAll('.tab').forEach(tabBotao => {
    tabBotao.addEventListener('click', () => {
      // Remove ativo de todas as abas e painéis
      document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(painel => painel.classList.remove('active'));
      
      // Ativa a aba clicada e seu painel correspondente
      tabBotao.classList.add('active');
      $("panel-" + tabBotao.dataset.panel).classList.add('active');
      
      // Se mudou para "lookup", atualiza a tabela
      if (tabBotao.dataset.panel === 'lookup') atualizarTabela();
    });
  });

  // Atualiza o painel de consulta de tabelas
  function atualizarTabela() {
    lookupResult.innerHTML = Lookup.render(tableSelect.value, searchInput.value);
  }

  // Atualiza tabela quando filtro ou busca muda
  tableSelect.addEventListener('change', atualizarTabela);
  searchInput.addEventListener('input', atualizarTabela);

  // Foca no primeiro campo ao carregar a página
  fields.orgao.focus();

})();
