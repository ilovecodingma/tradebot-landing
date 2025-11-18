// 텍스트 포맷팅 유틸리티

export const formatContent = (text) => {
  if (!text) return '';

  let formatted = text;

  // ** ** 볼드 처리를 HTML로 변환 (더 강조된 스타일)
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="inline-block text-blue-700 font-extrabold bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1 rounded-lg border border-blue-200 shadow-sm">$1</strong>');

  // 숫자 + % 강조 (양수/음수 구분)
  formatted = formatted.replace(/\+(\d+(?:\.\d+)?%)/g, '<span class="inline-block text-emerald-600 font-bold text-lg bg-emerald-50 px-2 py-0.5 rounded">+$1</span>');
  formatted = formatted.replace(/\-(\d+(?:\.\d+)?%)/g, '<span class="inline-block text-red-600 font-bold text-lg bg-red-50 px-2 py-0.5 rounded">-$1</span>');
  formatted = formatted.replace(/(?<!\+|\-)(\d+(?:\.\d+)?%)/g, '<span class="text-blue-600 font-bold">$1</span>');

  // 달러 금액 강조
  formatted = formatted.replace(/(\$\d+(?:\.\d+)?)/g, '<span class="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">$1</span>');

  // 큰 숫자 (B, M 단위)
  formatted = formatted.replace(/(\d+(?:\.\d+)?[BM](?:\s|$))/g, '<span class="text-purple-600 font-bold text-lg">$1</span>');

  // 비율 (1:2 같은 형식)
  formatted = formatted.replace(/(\d+:\d+)/g, '<span class="text-teal-600 font-semibold">$1</span>');

  // "의미:", "결론:" 등 키워드 강조
  formatted = formatted.replace(/^(의미|결론|목적|이유|대상|진입 조건|목표 수익률|손절 라인|리스크 관리|실행 예시|트레이딩 시사점|권장 손절 방식|전략 프레임워크):/gm, '<div class="inline-flex items-center gap-2 text-orange-600 font-bold mb-2 mt-4"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>$1:</div>');

  // 체크박스
  formatted = formatted.replace(/- \[ \]/g, '<div class="flex items-start gap-3 my-2"><span class="inline-flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded mt-0.5 flex-shrink-0"></span><span class="flex-1">');
  formatted = formatted.replace(/- \[x\]/gi, '<div class="flex items-start gap-3 my-2"><span class="inline-flex items-center justify-center w-5 h-5 bg-blue-600 border-2 border-blue-600 rounded mt-0.5 flex-shrink-0"><svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></span><span class="flex-1">');

  // □ 헤더 체크박스 (유니코드)
  formatted = formatted.replace(/\*\*□\s*/g, '<div class="flex items-center gap-3 mb-3 mt-6"><span class="inline-flex items-center justify-center w-6 h-6 border-2 border-blue-500 rounded-lg bg-white"></span><strong class="text-xl font-bold text-gray-900">');

  return formatted;
};

// 리스트 항목 감지 및 스타일링
export const formatListItems = (text) => {
  if (!text) return '';

  const lines = text.split('\n');
  let inList = false;
  let inCheckboxSection = false;
  let result = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // 체크박스 아이템 감지
    if (trimmed.match(/^- \[[ x]\]/i)) {
      if (!inCheckboxSection) {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        result.push('<div class="space-y-2 my-4 bg-blue-50/30 p-6 rounded-xl border border-blue-100">');
        inCheckboxSection = true;
      }
      const content = trimmed.replace(/^- \[[ x]\]\s*/i, '');
      const isChecked = trimmed.match(/- \[x\]/i);
      result.push(`
        <div class="flex items-start gap-3 my-3 p-3 bg-white rounded-lg hover:shadow-sm transition-shadow">
          <span class="inline-flex items-center justify-center w-6 h-6 border-2 ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-blue-400'} rounded mt-0.5 flex-shrink-0">
            ${isChecked ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}
          </span>
          <span class="flex-1 ${isChecked ? 'text-gray-500 line-through' : 'text-gray-700'}">${formatContent(content)}</span>
        </div>
      `);
    }
    // 일반 불릿 포인트 감지 (-, •, ·)
    else if (trimmed.match(/^[\-•·]\s/) && !trimmed.match(/^- \[/)) {
      if (inCheckboxSection) {
        result.push('</div>');
        inCheckboxSection = false;
      }
      if (!inList) {
        result.push('<ul class="space-y-3 my-4 ml-2">');
        inList = true;
      }
      const content = trimmed.replace(/^[\-•·]\s/, '');
      result.push(`<li class="flex items-start gap-3 group"><span class="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mt-2.5 group-hover:scale-125 transition-transform"></span><span class="flex-1 text-gray-700">${formatContent(content)}</span></li>`);
    }
    // 숫자 리스트 (1., 2., 3. 등)
    else if (trimmed.match(/^\d+\.\s/)) {
      if (inCheckboxSection) {
        result.push('</div>');
        inCheckboxSection = false;
      }
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      const number = trimmed.match(/^(\d+)\./)[1];
      const content = trimmed.replace(/^\d+\.\s/, '');
      result.push(`
        <div class="flex items-start gap-4 my-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-l-4 border-blue-400 shadow-sm">
          <span class="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold rounded-lg text-sm shadow-md">${number}</span>
          <div class="flex-1 text-gray-700">${formatContent(content)}</div>
        </div>
      `);
    }
    else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (inCheckboxSection && !trimmed.match(/\*\*□/)) {
        result.push('</div>');
        inCheckboxSection = false;
      }
      if (trimmed) {
        result.push(`<p class="mb-3 leading-relaxed">${formatContent(trimmed)}</p>`);
      } else {
        result.push('<div class="my-2"></div>');
      }
    }
  });

  if (inList) {
    result.push('</ul>');
  }
  if (inCheckboxSection) {
    result.push('</div>');
  }

  return result.join('\n');
};

// 코드 블록 감지
export const formatCodeBlocks = (text) => {
  if (!text) return text;

  return text.replace(/```(\w+)?\n([\s\S]+?)\n```/g, (match, lang, code) => {
    return `<pre class="bg-slate-900 text-slate-100 p-6 rounded-xl overflow-x-auto my-6 border border-slate-700"><code class="text-sm font-mono">${code.trim()}</code></pre>`;
  });
};
