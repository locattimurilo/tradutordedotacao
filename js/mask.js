/**
 * MASK.JS - Formatação e validação de campos de dotação
 * 
 * Responsável por:
 * - Extrair apenas números de um texto
 * - Formatar números em padrões específicos (XX.XX, X.X.XX.XX, etc)
 * - Distribuir valores entre os campos
 * - Navegar entre campos com tab automático
 * 
 * Exemplos de entrada:
 * - 23.02 3.3.90.93 1 10.302.2074.2.121
 * - 12.01 4.4.90.51 95 12.368.2049.2.074
 */
(function (root) {

  // Remove tudo que não é dígito
  function obterApenasDigitos(texto) { 
    return texto.replace(/\D/g, ''); 
  }

  // Formata ÓRGÃO
  // Ex: 1201 -> 12.01
  function formatarOrgao(texto) {
    const digitos = obterApenasDigitos(texto).slice(0, 4);
    if (digitos.length <= 2) return digitos;
    return digitos.slice(0,2) + '.' + digitos.slice(2);
  }

  // Formata NATUREZA

  function formatarNatureza(texto) {
    const digitos = obterApenasDigitos(texto).slice(0, 6);
    if (digitos.length <= 1) return digitos;
    if (digitos.length === 2) return digitos[0]+'.'+digitos[1];
    if (digitos.length === 3) return digitos[0]+'.'+digitos[1]+'.'+digitos.slice(2);
    if (digitos.length <= 5) return digitos[0]+'.'+digitos[1]+'.'+digitos.slice(2,4)+'.'+digitos.slice(4);
    return digitos[0]+'.'+digitos[1]+'.'+digitos.slice(2,4)+'.'+digitos.slice(4,6);
  }

  // Formata FONTE: XX 

  function formatarFonte(texto) { 
    return obterApenasDigitos(texto).slice(0, 2); 
  }

  // Formata FUNCIONAL PROGRAMÁTICA: XX.XXX.XXXX.X.XXX (máx 13 dígitos)
 
  function formatarFP(texto) {
    const digitos = obterApenasDigitos(texto).slice(0, 13);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 5) return digitos.slice(0,2)+'.'+digitos.slice(2);
    if (digitos.length <= 9) return digitos.slice(0,2)+'.'+digitos.slice(2,5)+'.'+digitos.slice(5);
    if (digitos.length === 10) return digitos.slice(0,2)+'.'+digitos.slice(2,5)+'.'+digitos.slice(5,9)+'.'+digitos.slice(9);
    return digitos.slice(0,2)+'.'+digitos.slice(2,5)+'.'+digitos.slice(5,9)+'.'+digitos.slice(9,10)+'.'+digitos.slice(10);
  }

  // Configuração dos campos: máximo de dígitos e função de formatação
  const maxDigitos = { orgao:4, nat:6, fonte:2, fp:13 };
  const funcoes    = { orgao:formatarOrgao, nat:formatarNatureza, fonte:formatarFonte, fp:formatarFP };

  // Aplica formatação e navega para o próximo campo se preenchido
  function aplicarMascaraEPular(idCampo, inputElement, proximoCampo) {
    const funcaoFormato = funcoes[idCampo];
    const valorAnterior = inputElement.value;
    const posicaoCursor = inputElement.selectionStart;
    // Conta quantos dígitos havia antes do cursor
    const digitsAntesDoItem = obterApenasDigitos(valorAnterior.slice(0, posicaoCursor)).length;

    // Aplica a formatação
    const valorFormatado = funcaoFormato(valorAnterior);
    inputElement.value = valorFormatado;

    // Posiciona o cursor no lugar certo (onde estava, contando dígitos)
    let contagem = 0, novaPosicao = valorFormatado.length;
    for (let i = 0; i < valorFormatado.length; i++) {
      if (/\d/.test(valorFormatado[i])) contagem++;
      if (contagem === digitsAntesDoItem) { novaPosicao = i+1; break; }
    }
    inputElement.setSelectionRange(novaPosicao, novaPosicao);

    // Se o campo foi totalmente preenchido, pula para o próximo
    if (proximoCampo && obterApenasDigitos(valorFormatado).length >= maxDigitos[idCampo]) {
      proximoCampo.focus();
      proximoCampo.setSelectionRange(0, 0);
    }
  }

  // Distribui um texto entre os campos baseado em padrões
  // Tenta reconhecer espaços, vírgulas ou sequência contínua de dígitos
  function distribuirValores(textoRaw, campos) {
    const partes = textoRaw.trim().split(/\s+/);
    
    // Cenário 1: Entrada formatada com 4 ou mais partes (órgão nat fonte fp)
    if (partes.length >= 4) {
      campos.orgao.value = formatarOrgao(partes[0]);
      campos.nat.value   = formatarNatureza(partes[1]);
      campos.fonte.value = formatarFonte(partes[2]);
      campos.fp.value    = formatarFP(partes.slice(3).join(''));
      return true;
    }
    
    // Cenário 2: Entrada com 3 partes (órgão nat fonte - sem fp)
    if (partes.length === 3) {
      campos.orgao.value = formatarOrgao(partes[0]);
      campos.nat.value   = formatarNatureza(partes[1]);
      campos.fonte.value = formatarFonte(partes[2]);
      campos.fp.value    = '';
      return true;
    }
    
    // Cenário 3: Sequência contígua de dígitos
    const digitos = obterApenasDigitos(textoRaw);
    if (digitos.length >= 10) {
      campos.orgao.value = formatarOrgao(digitos.slice(0,4));
      campos.nat.value   = formatarNatureza(digitos.slice(4,10));
      const resto = digitos.slice(10);
      
      if (resto.length >= 15) {
        campos.fonte.value = formatarFonte(resto.slice(0,2));
        campos.fp.value    = formatarFP(resto.slice(2));
      } else {
        campos.fonte.value = formatarFonte(resto.slice(0,1));
        campos.fp.value    = formatarFP(resto.slice(1));
      }
      return true;
    }
    
    return false;
  }

  // Configura todos os event listeners dos campos
  function configurarCampos(campos, aoMudar) {
    const { orgao, nat, fonte, fp } = campos;
    
    // Mapa de navegação: qual é o próximo campo após este
    const proximosCampos = { orgao:nat, nat:fonte, fonte:fp, fp:null };
    // Mapa inverso: qual é o campo anterior
    const campoAnterior = { nat:orgao, fonte:nat, fp:fonte };

    // Configura cada campo individualmente
    Object.keys(funcoes).forEach(idCampo => {
      const elemento   = campos[idCampo];
      const proximo    = proximosCampos[idCampo];
      const anterior   = campoAnterior[idCampo];

      // Quando cola algo, tenta distribuir ou formata
      elemento.addEventListener('paste', evento => {
        evento.preventDefault();
        const textoCola = (evento.clipboardData || window.clipboardData).getData('text');
        if (!distribuirValores(textoCola, campos)) {
          elemento.value = funcoes[idCampo](textoCola);
        }
        setTimeout(aoMudar, 0);
      });

      // Quando digita, formata e pula para próximo se completo
      elemento.addEventListener('input', () => {
        aplicarMascaraEPular(idCampo, elemento, proximo);
        aoMudar();
      });

      // Backspace em campo vazio volta para o anterior
      elemento.addEventListener('keydown', evento => {
        if (evento.key === 'Backspace' && elemento.value === '' && anterior) {
          evento.preventDefault();
          anterior.focus();
          anterior.setSelectionRange(anterior.value.length, anterior.value.length);
        }
      });
    });
  }

  // Retorna o valor concatenado de todos os campos (usado para traduzir)
  function obterValor(campos) {
    return [campos.orgao, campos.nat, campos.fonte, campos.fp]
      .map(elemento => elemento.value.trim())
      .filter(Boolean)
      .join(' ');
  }

  // Exporta a API pública
  root.Mask = { attach: configurarCampos, getValue: obterValor, distribute: distribuirValores };

})(window);
