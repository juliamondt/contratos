(() => {
  const STORAGE_CONTRATADA = 'contrato_contratada_v1';
  const STORAGE_TESTEMUNHAS = 'contrato_testemunhas_v1';

  const $ = (id) => document.getElementById(id);

  const fields = {
    tipo: $('fTipo'), tipoProjeto: $('fTipoProjeto'),
    cNome: $('cNome'), cDoc: $('cDoc'), cEndereco: $('cEndereco'), cEmail: $('cEmail'), cTelefone: $('cTelefone'),
    nomeProjeto: $('fNomeProjeto'), segmento: $('fSegmento'),
    valor: $('fValor'), parcelas: $('fParcelas'), prazo: $('fPrazo'),
    pNome: $('pNome'), pCnpj: $('pCnpj'), pCidade: $('pCidade'), pSocia: $('pSocia'), pSociaRg: $('pSociaRg'), pSociaCpf: $('pSociaCpf'), pSociaCidade: $('pSociaCidade'),
    t1Nome: $('t1Nome'), t1Cpf: $('t1Cpf'), t2Nome: $('t2Nome'), t2Cpf: $('t2Cpf'),
  };

  let idvItens = {}; // { cartao: true, ecobag: false, ... }

  // ---------- Helpers ----------
  const brl = (n) => (isFinite(n) ? n : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const parseNumber = (val) => {
    if (typeof val === 'number') return isFinite(val) ? val : 0;
    if (!val) return 0;
    let s = String(val).trim();
    if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.');
    else s = s.replace(/,/g, '');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };
  function escapeAttr(str) { return String(str ?? '').replace(/"/g, '&quot;'); }

  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // ---------- Cache: Contratada ----------
  function loadContratada() {
    try {
      const raw = localStorage.getItem(STORAGE_CONTRATADA);
      if (!raw) return;
      const data = JSON.parse(raw);
      fields.pNome.value = data.nome || '';
      fields.pCnpj.value = data.cnpj || '';
      fields.pCidade.value = data.cidade || '';
      fields.pSocia.value = data.socia || '';
      fields.pSociaRg.value = data.sociaRg || '';
      fields.pSociaCpf.value = data.sociaCpf || '';
      fields.pSociaCidade.value = data.sociaCidade || '';
    } catch (e) { /* ignora dados corrompidos */ }
  }
  function saveContratada() {
    const data = {
      nome: fields.pNome.value, cnpj: fields.pCnpj.value, cidade: fields.pCidade.value,
      socia: fields.pSocia.value, sociaRg: fields.pSociaRg.value, sociaCpf: fields.pSociaCpf.value, sociaCidade: fields.pSociaCidade.value,
    };
    localStorage.setItem(STORAGE_CONTRATADA, JSON.stringify(data));
  }
  $('clearContratada').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_CONTRATADA);
    ['pNome', 'pCnpj', 'pCidade', 'pSocia', 'pSociaRg', 'pSociaCpf', 'pSociaCidade'].forEach((k) => (fields[k].value = ''));
    render();
  });

  // ---------- Cache: Testemunhas ----------
  function loadTestemunhas() {
    try {
      const raw = localStorage.getItem(STORAGE_TESTEMUNHAS);
      if (!raw) return;
      const data = JSON.parse(raw);
      fields.t1Nome.value = data.t1Nome || '';
      fields.t1Cpf.value = data.t1Cpf || '';
      fields.t2Nome.value = data.t2Nome || '';
      fields.t2Cpf.value = data.t2Cpf || '';
    } catch (e) { /* ignora dados corrompidos */ }
  }
  function saveTestemunhas() {
    const data = { t1Nome: fields.t1Nome.value, t1Cpf: fields.t1Cpf.value, t2Nome: fields.t2Nome.value, t2Cpf: fields.t2Cpf.value };
    localStorage.setItem(STORAGE_TESTEMUNHAS, JSON.stringify(data));
  }

  // ---------- Seletor de tipo de contrato ----------
  function initTipoSelect() {
    fields.tipo.innerHTML = CONTRACT_TYPES.map((t) => `<option value="${t.id}">${t.label}</option>`).join('');
  }

  function currentType() {
    return CONTRACT_TYPES.find((t) => t.id === fields.tipo.value) || CONTRACT_TYPES[0];
  }

  function updateVisibilityForType() {
    const type = currentType();
    const isIdv = type.family === 'idv';
    $('wrapTipoProjeto').hidden = !isIdv;
    $('wrapNomeProjeto').hidden = !isIdv;
    $('wrapSegmento').hidden = !isIdv;
    $('accItensIdv').hidden = !isIdv;
    $('wrapParcelas').hidden = isIdv;
    $('wrapEntradaFinal').hidden = !isIdv;
    if (isIdv && !fields.tipoProjeto.value) fields.tipoProjeto.value = 'Identidade Visual Completa';
  }

  // ---------- Itens IDV (checklist) ----------
  function renderIdvItensList() {
    const list = $('idvItensList');
    list.innerHTML = '';
    IDV_ITENS_DISPONIVEIS.forEach((it) => {
      const row = document.createElement('label');
      row.className = 'check-row';
      row.innerHTML = `<input type="checkbox" data-item="${it.id}" ${idvItens[it.id] ? 'checked' : ''}> <span>${it.label}</span>`;
      list.appendChild(row);
    });
    list.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        idvItens[e.target.dataset.item] = e.target.checked;
        render();
      });
    });
  }

  // ---------- Cálculo de parcelas ----------
  function computeParcelas(valor, qtd) {
    qtd = Math.max(1, Math.floor(qtd) || 1);
    const base = Math.floor((valor / qtd) * 100) / 100;
    const resto = Math.round((valor - base * qtd) * 100) / 100;
    const parcelas = new Array(qtd).fill(base);
    parcelas[qtd - 1] = Math.round((base + resto) * 100) / 100;
    return parcelas;
  }

  function mesPeriodo(qtd) {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + qtd - 1, 1);
    const mesInicio = `${MESES[inicio.getMonth()]} de ${inicio.getFullYear()}`;
    const mesFim = `${MESES[fim.getMonth()]} de ${fim.getFullYear()}`;
    return qtd > 1 ? { mesInicio, mesFim } : { mesInicio: mesFim, mesFim };
  }

  // ---------- Validação ----------
  function validate() {
    const missing = [];
    if (!fields.cNome.value.trim()) missing.push('Nome do cliente');
    if (!fields.cDoc.value.trim()) missing.push('CPF/CNPJ do cliente');
    if (!(parseNumber(fields.valor.value) > 0)) missing.push('Valor combinado');
    if (!fields.prazo.value) missing.push('Prazo de entrega');
    if (currentType().family === 'idv' && !fields.nomeProjeto.value.trim()) missing.push('Nome do projeto/marca');
    return missing;
  }

  // ---------- Monta dados e renderiza ----------
  function buildData() {
    const type = currentType();
    const valor = parseNumber(fields.valor.value);
    const parcelasQtd = Math.max(1, parseInt(fields.parcelas.value, 10) || 1);
    const parcelasArr = computeParcelas(valor, parcelasQtd);
    const { mesInicio, mesFim } = mesPeriodo(parcelasQtd);

    return {
      contratadaNome: fields.pNome.value.trim() || 'Nome da contratada',
      contratadaCnpj: fields.pCnpj.value.trim(),
      contratadaCidade: fields.pCidade.value.trim(),
      contratadaSocia: fields.pSocia.value.trim(),
      contratadaSocioRg: fields.pSociaRg.value.trim(),
      contratadaSocioCpf: fields.pSociaCpf.value.trim(),
      contratadaSocioCidade: fields.pSociaCidade.value.trim(),
      cidadeContrato: fields.pCidade.value.trim() || '—',
      dataContrato: new Date(),
      clienteNome: fields.cNome.value.trim() || 'Nome do cliente',
      clienteDoc: fields.cDoc.value.trim() || '—',
      clienteEndereco: fields.cEndereco.value.trim(),
      clienteEmail: fields.cEmail.value.trim(),
      clienteTelefone: fields.cTelefone.value.trim(),
      testemunha1Nome: fields.t1Nome.value.trim(), testemunha1Cpf: fields.t1Cpf.value.trim(),
      testemunha2Nome: fields.t2Nome.value.trim(), testemunha2Cpf: fields.t2Cpf.value.trim(),
      valor, prazoDias: fields.prazo.value || 0,
      servicoNome: type.servicoNome, servicoArtigo: type.servicoArtigo,
      parcelasQtd, parcelaValor: parcelasArr[0], mesInicio, mesFim,
      tipoProjeto: fields.tipoProjeto.value.trim() || 'Identidade Visual Completa',
      nomeProjeto: fields.nomeProjeto.value.trim() || 'Nome do projeto',
      segmento: fields.segmento.value.trim() || '—',
      itens: idvItens,
    };
  }

  function render() {
    updateVisibilityForType();
    const type = currentType();
    const data = buildData();
    const renderer = TEMPLATE_RENDERERS[type.family];
    $('docBody').innerHTML = renderer(data);

    // Preview de parcelas
    if (type.family === 'site') {
      const parcelasArr = computeParcelas(data.valor, data.parcelasQtd);
      const iguais = parcelasArr.every((p) => p === parcelasArr[0]);
      $('parcelaPreview').textContent = data.parcelasQtd > 1
        ? (iguais ? `${data.parcelasQtd}x de ${brl(parcelasArr[0])}` : `${data.parcelasQtd - 1}x de ${brl(parcelasArr[0])} + 1x de ${brl(parcelasArr[parcelasArr.length - 1])}`)
        : `À vista: ${brl(data.valor)}`;
    } else {
      $('parcelaPreview').textContent = '';
    }

    // Resumos da sanfona
    $('sumTipo').textContent = type.label;
    $('sumCliente').textContent = fields.cNome.value.trim() ? 'Preenchido' : 'Obrigatório';
    $('sumPagamento').textContent = data.valor > 0 ? brl(data.valor) : '—';
    $('sumContratada').textContent = fields.pNome.value.trim() ? 'Adicionado' : 'Nenhum';
    $('sumTestemunhas').textContent = (fields.t1Nome.value.trim() || fields.t2Nome.value.trim()) ? 'Adicionada' : 'Nenhuma';
    const itensCount = Object.values(idvItens).filter(Boolean).length;
    $('sumItensIdv').textContent = itensCount > 0 ? `${itensCount} selecionada(s)` : 'Nenhuma';
  }

  // ---------- Eventos ----------
  fields.tipo.addEventListener('change', () => { renderIdvItensList(); render(); });
  Object.entries(fields).forEach(([key, el]) => {
    if (!el || key === 'tipo') return;
    el.addEventListener('input', () => {
      if (['pNome', 'pCnpj', 'pCidade', 'pSocia', 'pSociaRg', 'pSociaCpf', 'pSociaCidade'].includes(key)) saveContratada();
      if (['t1Nome', 't1Cpf', 't2Nome', 't2Cpf'].includes(key)) saveTestemunhas();
      render();
    });
  });

  // ---------- Sanfona (accordion) ----------
  document.querySelectorAll('.acc-header').forEach((header) => {
    header.addEventListener('click', () => {
      header.closest('.acc-item').classList.toggle('is-open');
    });
  });

  // ---------- Alternar Editar / Visualizar (mobile) ----------
  function showPane(pane) {
    $('paneEdit').classList.toggle('is-visible', pane === 'edit');
    $('panePreview').classList.toggle('is-visible', pane === 'preview');
  }
  $('toggleViewBtn').addEventListener('click', () => showPane('preview'));
  $('editBtn').addEventListener('click', () => showPane('edit'));
  showPane('edit');

  // ---------- Exportar PDF ----------
  $('exportBtn').addEventListener('click', async () => {
    const missing = validate();
    if (missing.length) {
      alert('Preencha os campos obrigatórios antes de exportar:\n\n' + missing.join('\n'));
      return;
    }

    const btn = $('exportBtn');
    const original = btn.textContent;
    btn.textContent = 'Gerando...';
    btn.disabled = true;

    const original_paper = $('paper');
    const clone = original_paper.cloneNode(true);
    clone.style.boxShadow = 'none';
    clone.style.borderRadius = '0';
    clone.style.width = '760px';
    clone.style.maxWidth = 'none';
    clone.style.margin = '0';
    clone.style.padding = '64px 56px 56px';

    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '-99999px';
    wrapper.style.background = '#ffffff';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      const canvas = await html2canvas(clone, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Documento pode ter mais de uma página — fatia o canvas em blocos de altura A4
      const pxPerPage = Math.floor((canvas.width * pageHeight) / pageWidth);
      let renderedHeight = 0;
      let first = true;
      while (renderedHeight < canvas.height) {
        const sliceHeight = Math.min(pxPerPage, canvas.height - renderedHeight);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, renderedHeight, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        const sliceData = sliceCanvas.toDataURL('image/png');
        const drawWidth = pageWidth;
        const drawHeight = (sliceHeight * drawWidth) / canvas.width;
        if (!first) pdf.addPage();
        pdf.addImage(sliceData, 'PNG', 0, 0, drawWidth, drawHeight);
        renderedHeight += sliceHeight;
        first = false;
      }

      const hoje = new Date();
      const dd = String(hoje.getDate()).padStart(2, '0');
      const mm = String(hoje.getMonth() + 1).padStart(2, '0');
      const yy = String(hoje.getFullYear()).slice(-2);
      const dataArquivo = `${dd}-${mm}-${yy}`;
      const nomeCliente = (fields.cNome.value.trim() || 'cliente').replace(/[^a-zA-Z0-9]+/g, '-');
      const tipoArquivo = currentType().id;
      pdf.save(`${dataArquivo}-${tipoArquivo}-${nomeCliente}.pdf`);
    } catch (err) {
      alert('Não foi possível gerar o PDF. Tente novamente.');
      console.error(err);
    } finally {
      document.body.removeChild(wrapper);
      btn.textContent = original;
      btn.disabled = false;
    }
  });

  // ---------- Inicialização ----------
  function init() {
    initTipoSelect();
    loadContratada();
    loadTestemunhas();
    renderIdvItensList();
    render();
  }

  init();
})();
