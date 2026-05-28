/**
 * TRADUTOR DE DOTAÇÃO
 * 
 * Módulo responsável por formatar e renderizar os dados de dotação
 * Converte códigos técnicos para texto legível com informações de tabelas
 */
(function (root) {

  // Escapa caracteres especiais para HTML seguro
  function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[caractere]));
  }

  // Busca ação pelo código (remove pontos)
  function encontrarAcao(codigo) {
    return ACOES[String(codigo).replace(/\./g, '')] || null;
  }

  // Capitaliza corretamente (primeira maiúscula, resto minúscula)
  function capitalizarTexto(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }

  // Extrai sigla entre parênteses no final do nome
  // Ex: "Polícia Militar do Estado de São Paulo (PMESP)" -> "PMESP"
  function extrairSiglaOrgao(nome) {
    if (!nome) return null;
    const match = nome.match(/\(([^)]+)\)\s*$/);
    return match ? match[1] : null;
  }

  // Cria os cartões de informação resumida (visão geral da dotação)
  function construirCartoes(dotacao) {
    const cartoes = [];

    // ========== CARTÃO: ÓRGÃO ==========
    if (dotacao.orgao) {
      const nomeOrgao = ORGAOS[dotacao.orgao];
      const codigoUnidade = dotacao.unidade ? (dotacao.orgao + '.' + dotacao.unidade) : null;
      const nomeUnidade = codigoUnidade ? UNIDADES[codigoUnidade] : null;

      let tag, valor, subtitulo;
      if (nomeUnidade) {
        // Se há unidade, usa a sigla da unidade
        const siglaUnidade = extrairSiglaOrgao(nomeUnidade) || nomeUnidade.split('—')[0].trim();
        tag = codigoUnidade;
        valor = siglaUnidade;
        subtitulo = nomeUnidade;
      } else {
        // Caso contrário, usa a sigla do órgão
        const siglaOrgao = extrairSiglaOrgao(nomeOrgao);
        tag = dotacao.orgao;
        valor = siglaOrgao || nomeOrgao;
        subtitulo = nomeOrgao;
      }

      cartoes.push({
        kind: 'org',
        label: 'Órgão',
        tag,
        valor: valor || '(não encontrado)',
        subtitulo: subtitulo || '',
        naoEncontrado: !nomeOrgao
      });
    }

    // ========== CARTÃO: AÇÃO/PROGRAMA ==========
    if (dotacao.acao || dotacao.programa) {
      const acao = dotacao.acao ? encontrarAcao(dotacao.acao) : null;
      const programa = dotacao.programa ? PROGRAMAS[dotacao.programa] : null;

      cartoes.push({
        kind: 'act',
        label: 'Ação',
        tag: dotacao.acao || dotacao.programa,
        valor: acao ? acao.d : (programa || '(sem ação identificada)'),
        subtitulo: programa ? 'Programa: ' + programa : '',
        naoEncontrado: dotacao.acao && !acao
      });
    }

    // ========== CARTÃO: NATUREZA DE DESPESA ==========
    if (dotacao.natureza) {
      const natureza = NATUREZAS[dotacao.natureza];
      cartoes.push({
        kind: 'exp',
        label: 'Despesa',
        tag: dotacao.natureza,
        valor: natureza || '(não encontrada)',
        subtitulo: '',
        naoEncontrado: !natureza
      });
    }

    // ========== CARTÃO: FONTE ==========
    if (dotacao.fonte) {
      const fonte = FONTES[dotacao.fonte];
      cartoes.push({
        kind: 'src',
        label: 'Fonte',
        tag: dotacao.fonte,
        valor: fonte ? fonte.split('(')[0].trim() : '(não identificada)',
        subtitulo: fonte && fonte.includes('(') ? fonte : '',
        naoEncontrado: !fonte
      });
    }

    return cartoes;
  }

  // Constrói a tabela detalhada com todos os campos
  function construirLinhasDetalhes(dotacao) {
    const linhas = [];

    // Helper para adicionar uma linha à tabela
    function adicionarLinha(label, codigo, valor, estaNaoEncontrado) {
      linhas.push({ 
        label, 
        codigo, 
        valor, 
        naoEncontrado: !!estaNaoEncontrado 
      });
    }

    if (dotacao.orgao) {
      const nome = ORGAOS[dotacao.orgao];
      adicionarLinha('Órgão', dotacao.orgao, nome || '(não encontrado)', !nome);
    }
    if (dotacao.unidade) {
      const nome = UNIDADES[dotacao.orgao + '.' + dotacao.unidade] || `Unidade ${dotacao.unidade}`;
      adicionarLinha('Unidade', dotacao.orgao + '.' + dotacao.unidade, nome);
    }
    if (dotacao.funcao) {
      const nome = FUNCOES[dotacao.funcao];
      adicionarLinha('Função', dotacao.funcao, nome ? capitalizarTexto(nome) : '(não encontrada)', !nome);
    }
    if (dotacao.subfuncao) {
      const nome = SUBFUNCOES[dotacao.subfuncao];
      adicionarLinha('Subfunção', dotacao.subfuncao, nome ? capitalizarTexto(nome) : '(não encontrada)', !nome);
    }
    if (dotacao.programa) {
      const nome = PROGRAMAS[dotacao.programa];
      adicionarLinha('Programa', dotacao.programa, nome || '(não encontrado)', !nome);
    }
    if (dotacao.acao) {
      const acao = encontrarAcao(dotacao.acao);
      adicionarLinha('Ação', dotacao.acao, acao ? acao.d : '(não encontrada)', !acao);
      if (acao) adicionarLinha('Tipo', '—', acao.t);
    }
    if (dotacao.natureza) {
      const nome = NATUREZAS[dotacao.natureza];
      adicionarLinha('Natureza', dotacao.natureza, nome || '(não encontrada)', !nome);
    }
    if (dotacao.fonte) {
      const nome = FONTES[dotacao.fonte] || 'Fonte específica (consultar TCESP)';
      adicionarLinha('Fonte', dotacao.fonte, nome);
    }

    return linhas;
  }

  // Renderiza um cartão de informação
  function renderizarCartao(cartao) {
    return `
      <div class="card ${cartao.kind}${cartao.naoEncontrado ? ' missing' : ''}">
        <div class="card-header">
          <span class="card-label">${escaparHTML(cartao.label)}</span>
          <span class="card-tag">${escaparHTML(cartao.tag)}</span>
        </div>
        <div class="card-value">${escaparHTML(cartao.valor)}</div>
        ${cartao.subtitulo ? `<div class="card-sub">${escaparHTML(cartao.subtitulo)}</div>` : ''}
      </div>
    `;
  }

  // Função principal: renderiza a saída completa
  function render(inputRaw) {
    // Parse do input para extrair componentes
    const dotacao = Parser.parse(inputRaw);
    if (!dotacao || Object.keys(dotacao).length === 0) {
      return `<div class="answer-empty">não reconheci.</div>`;
    }

    // Monta os cartões (visão resumida) e as linhas detalhadas (tabela)
    const cartoes = construirCartoes(dotacao);
    const linhas = construirLinhasDetalhes(dotacao);

    let html = '';

    // Seção de resumo com cartões
    if (cartoes.length) {
      html += `
        <div class="preamble">
          <span class="preamble-label">Resumo da dotação</span>
          <span class="preamble-code">${escaparHTML(inputRaw.trim())}</span>
        </div>
        <div class="cards">${cartoes.map(renderizarCartao).join('')}</div>
      `;
    }

    // Seção expandível com detalhes completos
    if (linhas.length) {
      html += `
        <details class="detail">
          <summary><span class="caret">›</span> ver detalhes (${linhas.length} ${linhas.length === 1 ? 'campo' : 'campos'})</summary>
          <div class="breakdown">
            ${linhas.map(linha => `
              <div class="row${linha.naoEncontrado ? ' missing' : ''}">
                <div class="k">${escaparHTML(linha.label)}</div>
                <span class="code">${escaparHTML(linha.codigo)}</span>
                <div class="v">${escaparHTML(linha.valor)}</div>
              </div>
            `).join('')}
          </div>
        </details>
      `;
    }

    return html;
  }

  // Exporta a API pública
  root.Translator = { render, esc: escaparHTML };

})(window);
