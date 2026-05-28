/**
 * PARSER.JS - Extração de componentes de dotação
 * 
 * Responsável por reconhecer e validar padrões de:
 * - Órgão (XX ou XX.XX)
 * - Natureza de despesa (X.X.XX.XX)
 * - Fonte (XX ou XXX)
 * - Funcional Programática (XX.XXX.XXXX.X.XXX)
 * 
 * Usa regex para validação e extração de componentes
 */
(function (root) {

  // REGEX para validar padrões
  const REGEX_NATUREZA  = /^\d\.\d\.\d{2}\.\d{2}$/;  // X.X.XX.XX (ex: 3.3.90.39)
  const REGEX_FUNCPROG  = /^(\d{2})\.(\d{3})\.(\d{4})(?:\.(\d+(?:\.\d+)?))?$/;  // XX.XXX.XXXX[.X.XXX]
  const REGEX_ORGAO_UNI = /^(\d{1,2})\.(\d{1,2})$/;  // XX.XX (órgão.unidade)
  const REGEX_ORGAO     = /^\d{1,2}$/;  // XX (apenas órgão)
  const REGEX_FONTE     = /^\d{1,3}$/;  // XX ou XXX

  /**
   * Parse de uma string de dotação
   * Extrai componentes reconhecendo padrões textuais
   * 
   * @param {string} textoRaw - Texto a ser analisado
   * @returns {Object|null} Objeto com os campos identificados ou null
   */
  function parse(textoRaw) {
    // Normaliza espaços múltiplos em espaço único
    const texto = (textoRaw || '').replace(/\s+/g, ' ').trim();
    if (!texto) return null;

    const resultado = {};
    // Separa por espaço, vírgula ou ponto-vírgula
    const tokens = texto.split(/[\s,;]+/).filter(Boolean);

    tokens.forEach((token, posicao) => {
      // ========== TESTE 1: NATUREZA DE DESPESA ==========
      if (REGEX_NATUREZA.test(token)) {
        resultado.natureza = token;
        return;
      }

      // ========== TESTE 2: FUNCIONAL PROGRAMÁTICA ==========
      // Captura: (função)(subfunção)(programa)[.(ação)]
      const matchFP = token.match(REGEX_FUNCPROG);
      if (matchFP) {
        resultado.funcao = matchFP[1];
        resultado.subfuncao = matchFP[2];
        resultado.programa = matchFP[3];
        if (matchFP[4]) resultado.acao = matchFP[4];
        return;
      }

      // ========== TESTE 3: ÓRGÃO COM UNIDADE ==========
      const matchOrgaoUnidade = token.match(REGEX_ORGAO_UNI);
      if (matchOrgaoUnidade && !resultado.orgao) {
        resultado.orgao = matchOrgaoUnidade[1].padStart(2, '0');
        resultado.unidade = matchOrgaoUnidade[2].padStart(2, '0');
        return;
      }

      // ========== TESTE 4: ÓRGÃO SIMPLES ==========
      // Só aceita se for o primeiro token
      if (REGEX_ORGAO.test(token) && !resultado.orgao && posicao === 0) {
        resultado.orgao = token.padStart(2, '0');
        return;
      }

      // ========== TESTE 5: FONTE ==========
      // Só registra se já tiver uma natureza definida (evita falsos positivos)
      if (REGEX_FONTE.test(token) && resultado.natureza && !resultado.fonte) {
        resultado.fonte = token;
      }
    });

    return resultado;
  }

  // Exporta a API pública
  root.Parser = { parse };

})(window);
