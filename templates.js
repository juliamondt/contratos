// ============================================================
// templates.js
// Aqui ficam os modelos de contrato. Cada modelo tem o texto
// jurídico (mantido fiel ao original validado com advogado) com
// placeholders preenchidos dinamicamente pelo app.js.
//
// Para adicionar um novo tipo de contrato no futuro:
// 1. Cole o texto no formato abaixo (uma função que recebe `d` = dados)
// 2. Registre em CONTRACT_TYPES com um id, label e a família certa
//    (ou crie uma nova família se a estrutura de cláusulas for diferente)
// ============================================================

// ---------- Número por extenso (reais) ----------
const UNIDADES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const DEZ_A_DEZENOVE = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function extensoAte999(n) {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  let partes = [];
  const c = Math.floor(n / 100);
  const resto = n % 100;
  if (c > 0) partes.push(CENTENAS[c]);
  if (resto > 0) {
    if (resto < 10) partes.push(UNIDADES[resto]);
    else if (resto < 20) partes.push(DEZ_A_DEZENOVE[resto - 10]);
    else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      partes.push(DEZENAS[d] + (u > 0 ? ' e ' + UNIDADES[u] : ''));
    }
  }
  return partes.join(' e ');
}

function extensoInteiro(n) {
  if (n === 0) return 'zero';
  const milhoes = Math.floor(n / 1000000);
  const milhares = Math.floor((n % 1000000) / 1000);
  const resto = n % 1000;
  let partes = [];
  if (milhoes > 0) partes.push((milhoes === 1 ? 'um milhão' : extensoAte999(milhoes) + ' milhões'));
  if (milhares > 0) partes.push((milhares === 1 ? 'mil' : extensoAte999(milhares) + ' mil'));
  if (resto > 0) partes.push(extensoAte999(resto));
  return partes.join(' e ');
}

function valorPorExtenso(valor) {
  const reais = Math.floor(valor + 1e-9);
  const centavos = Math.round((valor - reais) * 100);
  let txt = `${extensoInteiro(reais)} ${reais === 1 ? 'real' : 'reais'}`;
  if (centavos > 0) {
    txt += ` e ${extensoInteiro(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`;
  }
  return txt;
}

function brl(n) {
  return (isFinite(n) ? n : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function dataExtenso(date) {
  return `${String(date.getDate()).padStart(2, '0')} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Junta pedaços opcionais de um parágrafo em uma frase só, separados por vírgula
function juntaOpcionais(partes) {
  return partes.filter(Boolean).join(', ');
}

// ============================================================
// FAMÍLIA "site" — usada por Site Institucional e Landing Page
// (texto idêntico, só muda o nome do serviço, valor, parcelas e prazo)
// ============================================================
function renderSite(d) {
  const artigo = d.servicoArtigo || 'um';
  const clienteBloco = juntaOpcionais([
    `<strong>CONTRATANTE:</strong> ${esc(d.clienteNome)}, inscrito(a) no CPF/CNPJ sob o nº ${esc(d.clienteDoc)}`,
    d.clienteEndereco ? `residente e domiciliado(a) em ${esc(d.clienteEndereco)}` : '',
    d.clienteEmail ? `e-mail: ${esc(d.clienteEmail)}` : '',
    d.clienteTelefone ? `telefone: ${esc(d.clienteTelefone)}` : '',
  ]) + ', doravante denominada CONTRATANTE.';

  return `
  <div class="doc-topbox">
    <div class="doc-topbox__row doc-topbox__row--head"><strong>CONTRATO DE</strong></div>
    <div class="doc-topbox__row doc-topbox__row--sub"><em>${esc(d.servicoNome).toUpperCase()}</em></div>
    <div class="doc-topbox__row doc-topbox__row--split">
      <div><strong>CONTRATADA:</strong><br>${esc(d.contratadaNome).toUpperCase()}</div>
      <div><strong>CONTRATANTE:</strong><br>${esc(d.clienteNome).toUpperCase()}</div>
    </div>
  </div>

  <h1 class="doc-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>

  <p>${clienteBloco}</p>

  <p><strong>CONTRATADA:</strong> ${esc(d.contratadaNome)}, pessoa jurídica de direito privado, inscrita no CNPJ nº ${esc(d.contratadaCnpj)}, com sede em ${esc(d.contratadaCidade)}, doravante denominada CONTRATADA, e neste ato representada por sua sócia <strong>${esc(d.contratadaSocia)}</strong>, portadora da Identidade nº ${esc(d.contratadaSocioRg)} e do CPF nº ${esc(d.contratadaSocioCpf)}, residente e domiciliada em ${esc(d.contratadaSocioCidade)}.</p>

  <p><strong>Data:</strong> ${esc(d.cidadeContrato)}, ${dataExtenso(d.dataContrato)}.</p>

  <div class="doc-sign-row">
    <div>CONTRATANTE: ______________________</div>
    <div>CONTRATADA: ______________________</div>
  </div>

  <p class="doc-testemunhas-label"><strong>Testemunhas:</strong></p>
  <div class="doc-testemunhas">
    <div>1. Nome Completo: ${esc(d.testemunha1Nome)}<br>CPF: ${esc(d.testemunha1Cpf)}<br>______________________</div>
    <div>2. Nome Completo: ${esc(d.testemunha2Nome)}<br>CPF: ${esc(d.testemunha2Cpf)}<br>______________________</div>
  </div>

  <table class="doc-clauses">
    <tr>
      <th>1. SERVIÇO</th>
      <td>
        <p>1.1 A Contratada realizará o desenvolvimento de ${esc(d.servicoNome)} com foco em conversão, compreendendo as seguintes etapas técnicas:</p>
        <ul>
          <li><strong>Benchmark:</strong> Estudo de navegação e interface focada no usuário.</li>
          <li><strong>Copywriting:</strong> Criação do texto do site, a ser validado com o cliente.</li>
          <li><strong>Design Visual:</strong> Criação do layout personalizado (Desktop e Mobile/Responsivo).</li>
          <li><strong>Prototipagem:</strong> Entrega do design para aprovação antes da implementação/publicação.</li>
          <li><strong>Publicação do site.</strong></li>
        </ul>
      </td>
    </tr>
    <tr>
      <th>2. PAGAMENTO</th>
      <td>
        <p>2.1 Pela execução do projeto de 01 (${artigo}) ${esc(d.servicoNome)}, a Contratante pagará à Contratada o valor fixo de <strong>${brl(d.valor)} (${valorPorExtenso(d.valor)})</strong>.</p>
        <p>2.2 A forma de pagamento definida foi o parcelamento em <strong>${d.parcelasQtd} parcelas de ${brl(d.parcelaValor)}</strong> mensalmente, compreendendo o período de ${d.mesInicio} até ${d.mesFim}.</p>
        <p>2.3 O valor inclui até <strong>3 (três) rodadas de alterações</strong> solicitadas pela Contratante. Caso haja necessidade de mudanças estruturais após a aprovação final ou após as rodadas gratuitas, será cobrada uma taxa adicional a ser combinada.</p>
      </td>
    </tr>
    <tr>
      <th>3. PRAZO</th>
      <td>
        <p>3.1 A Contratada tem o prazo de <strong>${d.prazoDias} dias úteis</strong> para entregar o serviço solicitado, contado a partir da confirmação do pagamento.</p>
        <p>3.2 Caso seja necessário realizar alguma edição ou alteração no design entregue, a Contratada deverá concluir as modificações em até 1 dia útil após a solicitação.</p>
        <p>3.3 A Contratante concorda que, para cada dia útil atrasado no envio de materiais e feedbacks necessários para a Contratada, será adicionado mais um dia útil à data de entrega da próxima etapa.</p>
      </td>
    </tr>
    <tr>
      <th>4. OBRIGAÇÕES</th>
      <td>
        <p>4.1 A Contratada se compromete a entregar o serviço no prazo e conforme o combinado.</p>
        <p>4.2 A Contratante deve fornecer todas as informações necessárias para que o serviço seja executado corretamente.</p>
      </td>
    </tr>
    <tr>
      <th>5. SIGILO</th>
      <td><p>5.1 Ambas as partes devem manter as informações e materiais do contrato em sigilo durante sua execução, exceto com autorização da contratante para divulgação prévia.</p></td>
    </tr>
    <tr>
      <th>6. RESCISÃO</th>
      <td>
        <p>6.1 O contrato pode ser encerrado por qualquer uma das partes, desde que avise a outra com 30 dias de antecedência.</p>
        <p>6.2 Em caso de cancelamento por parte da Contratante após o início do design, o valor da entrada (ou 50% do valor total) não será reembolsado, visando cobrir as horas técnicas já despendidas.</p>
      </td>
    </tr>
    <tr>
      <th>7. CONDIÇÕES</th>
      <td>
        <p>7.1 Este contrato não cria vínculo empregatício entre as partes.</p>
        <p>7.2 Qualquer alteração neste contrato precisa ser feita por escrito, ou através de novo Termo Aditivo.</p>
      </td>
    </tr>
  </table>
  `;
}

// ============================================================
// FAMÍLIA "idv" — Identidade Visual
// ============================================================
const IDV_ITENS_DISPONIVEIS = [
  { id: 'cartao', label: 'Cartão de visitas (frente e verso)' },
  { id: 'ecobag', label: 'Ecobag (design/mockup)' },
  { id: 'garrafa', label: 'Garrafa (design/mockup)' },
  { id: 'caderno', label: 'Caderno (design/mockup)' },
  { id: 'adesivo', label: 'Adesivo (design/mockup)' },
  { id: 'kitDigital', label: 'Kit digital (assinatura de e-mail, capa de destaques, capa WhatsApp Business, foto de perfil)' },
  { id: 'socialMedia', label: 'Social media (templates de feed e story, sequência de story, figurinha WhatsApp)' },
  { id: 'documentos', label: 'Documentos institucionais (portfólio, formulário, modelo de contrato e orçamento)' },
];

function renderIdv(d) {
  const clienteBloco = juntaOpcionais([
    `<strong>CONTRATANTE:</strong> ${esc(d.clienteNome)}, inscrito(a) no CPF/CNPJ sob o nº ${esc(d.clienteDoc)}`,
    d.clienteEndereco ? `residente e domiciliado(a) em ${esc(d.clienteEndereco)}` : '',
    d.clienteEmail ? `e-mail: ${esc(d.clienteEmail)}` : '',
    d.clienteTelefone ? `telefone: ${esc(d.clienteTelefone)}` : '',
  ]) + ', doravante denominada CONTRATANTE.';

  const itensMarcados = IDV_ITENS_DISPONIVEIS.filter((it) => d.itens && d.itens[it.id]);
  const itensHtml = itensMarcados.length
    ? `<ul>${itensMarcados.map((it) => `<li>${esc(it.label)}</li>`).join('')}</ul>`
    : '<p><em>Nenhuma aplicação adicional incluída além da criação da marca.</em></p>';

  const entrada = Math.round(d.valor * 0.3 * 100) / 100;
  const final = Math.round((d.valor - entrada) * 100) / 100;

  return `
  <h1 class="doc-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>

  <p>${clienteBloco}</p>

  <p><strong>CONTRATADA:</strong> ${esc(d.contratadaNome)}, pessoa jurídica de direito privado, inscrita no CNPJ nº ${esc(d.contratadaCnpj)}, com sede em ${esc(d.contratadaCidade)}, doravante denominada CONTRATADA, e neste ato representada por sua sócia <strong>${esc(d.contratadaSocia)}</strong>, portadora da Identidade nº ${esc(d.contratadaSocioRg)} e do CPF nº ${esc(d.contratadaSocioCpf)}, residente e domiciliada em ${esc(d.contratadaSocioCidade)}.</p>

  <p><strong>Data:</strong> ${esc(d.cidadeContrato)}, ${dataExtenso(d.dataContrato)}.</p>

  <div class="doc-sign-row">
    <div>CONTRATANTE: ______________________</div>
    <div>CONTRATADA: ______________________</div>
  </div>

  <p class="doc-testemunhas-label"><strong>Testemunhas:</strong></p>
  <div class="doc-testemunhas">
    <div>1. Nome Completo: ${esc(d.testemunha1Nome)}<br>CPF: ${esc(d.testemunha1Cpf)}<br>______________________</div>
    <div>2. Nome Completo: ${esc(d.testemunha2Nome)}<br>CPF: ${esc(d.testemunha2Cpf)}<br>______________________</div>
  </div>

  <table class="doc-clauses">
    <tr>
      <th>Cláusula 1ª — DO OBJETO</th>
      <td>
        <p>O objeto do presente contrato é a prestação de serviços de criação de Identidade Visual pela CONTRATADA à CONTRATANTE, consistindo em:</p>
        <p><strong>TIPO DE PROJETO:</strong> ${esc(d.tipoProjeto)}</p>
        <p><strong>Para:</strong> ${esc(d.nomeProjeto)}</p>
        <p><strong>Segmento:</strong> ${esc(d.segmento)}</p>
      </td>
    </tr>
    <tr>
      <th>Cláusula 2ª — DAS CONDIÇÕES DA PRESTAÇÃO DE SERVIÇOS</th>
      <td>
        <p><strong>Item I — Obrigações da CONTRATANTE</strong></p>
        <p>2.1 — Fornecer briefing completo contendo informações sobre a marca, público-alvo, valores, concorrentes e referências visuais.</p>
        <p>2.2 — Disponibilizar materiais necessários quando aplicável (logo anterior, fotos, textos institucionais).</p>
        <p>2.3 — Efetuar o pagamento na forma estabelecida na Cláusula 5ª.</p>
        <p>2.4 — Aprovar as etapas de entrega dentro dos prazos acordados, sob pena de aprovação tácita após 5 (cinco) dias úteis sem manifestação.</p>
        <p>2.5 — Fornecer feedbacks claros, objetivos e consolidados nas solicitações de alteração.</p>
        <p><strong>Item II — Obrigações da CONTRATADA</strong></p>
        <p>2.6 — Executar a prestação dos serviços referentes ao projeto descrito na Cláusula 1ª com qualidade e criatividade.</p>
        <p>2.7 — Atender solicitações da CONTRATANTE em até 24 horas úteis após o contato (via WhatsApp ou e-mail).</p>
        <p>2.8 — Apresentar propostas criativas originais e exclusivas para a marca da CONTRATANTE.</p>
        <p>2.9 — Responsabilizar-se por todos os encargos trabalhistas, tributários e previdenciários relacionados à sua atividade.</p>
        <p>2.10 — Manter confidencialidade e segurança das informações fornecidas pela CONTRATANTE.</p>
        <p>2.11 — Entregar os arquivos finais nos formatos especificados no Item III.</p>
        <p>2.12 — Serviços não previstos neste contrato (como aplicações adicionais, papelaria estendida, motion design, etc.) deverão ser negociados à parte.</p>
        <p><strong>Item III — Serviços e suas Execuções</strong></p>
        <p>O projeto compreende:</p>
        <p><strong>Criação da Marca:</strong></p>
        <ul>
          <li>Pesquisa e conceituação (foco em organização e comunicação)</li>
          <li>Desenvolvimento de 02 (duas) propostas iniciais de logotipo</li>
          <li>Refinamento da proposta escolhida</li>
          <li>Manual de identidade visual básico (versões, cores, tipografia, usos corretos e incorretos)</li>
        </ul>
        <p><strong>Aplicações incluídas (conforme briefing):</strong></p>
        ${itensHtml}
        <p><strong>Entregas digitais:</strong></p>
        <ul>
          <li>Logotipo em versões: colorida, preto e branco, negativo</li>
          <li>Arquivos vetoriais editáveis (.AI, .EPS, .PDF)</li>
          <li>Arquivos para uso digital (.PNG com fundo transparente, .JPG)</li>
          <li>Paleta de cores com códigos (RGB, CMYK, HEX)</li>
          <li>Especificações tipográficas</li>
          <li>Manual de identidade visual em PDF</li>
        </ul>
        <p><em>Observações: a impressão dos materiais não está inclusa, sendo entregues apenas os arquivos prontos para produção. A criação de conteúdo (texto) para os templates e documentos é de responsabilidade da CONTRATANTE.</em></p>
        <p><strong>Item IV — Cronograma de Execução</strong></p>
        <p>Prazo total de entrega: <strong>${d.prazoDias} dias úteis</strong> a partir da assinatura do contrato, confirmação do pagamento inicial e recebimento do briefing completo.</p>
      </td>
    </tr>
    <tr>
      <th>Cláusula 3ª — DO LIMITE DE ALTERAÇÕES E REVISÕES</th>
      <td>
        <p>3.1 — Estão incluídas no valor do contrato até 3 (três) rodadas de alterações no projeto, distribuídas da seguinte forma: 1ª rodada — após apresentação das propostas iniciais; 2ª rodada — após refinamento da proposta escolhida; 3ª rodada — ajustes finais antes da entrega definitiva.</p>
        <p>3.2 — Cada rodada de alteração compreende o conjunto de modificações solicitadas pela CONTRATANTE após a apresentação de uma etapa do projeto.</p>
        <p>3.3 — Alterações que representem mudança radical de direção criativa após a aprovação de uma etapa não serão contabilizadas como rodadas de revisão simples, devendo ser negociadas à parte como retrabalho.</p>
        <p>3.4 — Rodadas adicionais além das 3 (três) incluídas serão cobradas separadamente no valor de R$ 80 por rodada, a serem pagas após a execução das alterações.</p>
        <p>3.5 — Aplicações adicionais não previstas no escopo original serão orçadas separadamente.</p>
        <p>3.6 — Não serão contabilizadas como rodadas de alteração: correções de erros técnicos identificados pela CONTRATADA; ajustes de alinhamento, proporção ou qualidade de arquivo; correções que não correspondam ao briefing aprovado.</p>
      </td>
    </tr>
    <tr>
      <th>Cláusula 4ª — DA EXCLUSIVIDADE</th>
      <td>
        <p>4.1 — A CONTRATADA compromete-se a desenvolver um projeto exclusivo e original para a CONTRATANTE.</p>
        <p>4.2 — A CONTRATADA não poderá utilizar o mesmo conceito, elementos visuais ou estrutura criativa para outras empresas do mesmo segmento.</p>
        <p>4.3 — A CONTRATADA garante que o projeto desenvolvido não infringe direitos autorais de terceiros.</p>
      </td>
    </tr>
    <tr>
      <th>Cláusula 5ª — DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO</th>
      <td>
        <p>5.1 — O valor total do presente contrato é de <strong>${brl(d.valor)} (${valorPorExtenso(d.valor)})</strong>.</p>
        <p>Formas de pagamento:</p>
        <ul>
          <li>Pagamento de <strong>${brl(entrada)} (30%)</strong> na assinatura do contrato.</li>
          <li>Pagamento de <strong>${brl(final)} (70%)</strong> após o envio dos arquivos finais para uso e impressão.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <th>Cláusula 6ª — DO INADIMPLEMENTO</th>
      <td>
        <p>6.1 — Aplica-se multa de 1% sobre o valor devido, juros de 0,032% ao dia e correção monetária em caso de atraso.</p>
        <p>6.2 — O atraso superior a 15 (quinze) dias suspende automaticamente a execução dos serviços e o envio de arquivos finais até a regularização do pagamento.</p>
      </td>
    </tr>
    <tr>
      <th>Cláusula 7ª — DA RESCISÃO</th>
      <td><p>O contrato poderá ser rescindido em caso de inadimplência, descumprimento das cláusulas, ou por motivo de força maior. Valores já pagos não serão devolvidos se não houver falha da CONTRATADA.</p></td>
    </tr>
    <tr>
      <th>Cláusula 8ª — DO PRAZO E DA VALIDADE</th>
      <td><p>Este contrato terá duração de <strong>2 (duas) semanas úteis</strong> a partir da assinatura e poderá ser prorrogado mediante acordo entre as partes.</p></td>
    </tr>
    <tr>
      <th>Cláusula 9ª — DISPOSIÇÕES GERAIS</th>
      <td>
        <p>9.1 — Este contrato não cria vínculo empregatício entre as partes.</p>
        <p>9.2 — Fica eleito o foro da Comarca de <strong>${esc(d.contratadaCidade)}</strong> para dirimir quaisquer dúvidas ou controvérsias decorrentes deste contrato.</p>
      </td>
    </tr>
  </table>
  `;
}

// ============================================================
// Registro dos tipos de contrato disponíveis no seletor
// ============================================================
const CONTRACT_TYPES = [
  { id: 'site-institucional', label: 'Site Institucional', family: 'site', servicoNome: 'Site Institucional', servicoArtigo: 'um' },
  { id: 'landing-page', label: 'Landing Page', family: 'site', servicoNome: 'Landing Page', servicoArtigo: 'uma' },
  { id: 'idv', label: 'Identidade Visual', family: 'idv' },
];

const TEMPLATE_RENDERERS = { site: renderSite, idv: renderIdv };
