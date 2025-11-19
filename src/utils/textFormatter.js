// 텍스트 포맷팅 유틸리티

export const formatContent = (text) => {
  if (!text) return '';

  let formatted = text;

  // ** ** 볼드 처리를 HTML로 변환
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');

  // 숫자 + % 강조
  formatted = formatted.replace(/\+(\d+(?:\.\d+)?%)/g, '<strong class="font-bold">+$1</strong>');
  formatted = formatted.replace(/\-(\d+(?:\.\d+)?%)/g, '<strong class="font-bold">-$1</strong>');

  // 달러 금액 강조
  formatted = formatted.replace(/(\$\d+(?:\.\d+)?)/g, '<strong class="font-bold">$1</strong>');

  // 큰 숫자 (B, M 단위)
  formatted = formatted.replace(/(\d+(?:\.\d+)?[BM](?:\s|$))/g, '<strong class="font-bold">$1</strong>');

  // "의미:", "결론:" 등 키워드 강조
  formatted = formatted.replace(/^(의미|결론|목적|이유|대상|진입 조건|목표 수익률|손절 라인|리스크 관리|실행 예시|트레이딩 시사점|권장 손절 방식|전략 프레임워크):/gm, '<div class="font-bold mb-2 mt-4">$1:</div>');

  return formatted;
};

// 리스트 항목 감지 및 스타일링
export const formatListItems = (text) => {
  if (!text) return '';

  const lines = text.split('\n');
  let inList = false;
  let result = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // 일반 불릿 포인트 감지 (-, •, ·)
    if (trimmed.match(/^[\-•·]\s/) && !trimmed.match(/^- \[/)) {
      if (!inList) {
        result.push('<ul class="space-y-2 my-3 ml-4 list-disc">');
        inList = true;
      }
      const content = trimmed.replace(/^[\-•·]\s/, '');
      result.push(`<li class="text-gray-700">${formatContent(content)}</li>`);
    }
    // 숫자 리스트 (1., 2., 3. 등)
    else if (trimmed.match(/^\d+\.\s/)) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      const number = trimmed.match(/^(\d+)\./)[1];
      const content = trimmed.replace(/^\d+\.\s/, '');
      result.push(`
        <div class="flex items-start gap-3 my-3">
          <span class="font-bold">${number}.</span>
          <div class="flex-1 text-gray-700">${formatContent(content)}</div>
        </div>
      `);
    }
    else {
      if (inList) {
        result.push('</ul>');
        inList = false;
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

  return result.join('\n');
};

// 코드 블록 감지
export const formatCodeBlocks = (text) => {
  if (!text) return text;

  return text.replace(/```(\w+)?\n([\s\S]+?)\n```/g, (match, lang, code) => {
    return `<pre class="bg-gray-100 text-gray-900 p-4 rounded overflow-x-auto my-4 border border-gray-200"><code class="text-sm font-mono">${code.trim()}</code></pre>`;
  });
};
