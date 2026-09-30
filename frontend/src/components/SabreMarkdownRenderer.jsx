import React from 'react';
import SabreVisualArchitectureDiagram from './SabreVisualArchitectureDiagram';

/**
 * Formats inline bold (**text**), inline code (`code`), bullet lists, numbered lists,
 * and paragraphs cleanly with modern, enterprise-grade typography.
 */
function renderInlineFormatting(text) {
  const parts = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      parts.push(
        <strong key={match.index} style={{ fontWeight: 700, color: '#0f172a' }}>
          {inner}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const inner = token.slice(1, -1);
      parts.push(
        <code
          key={match.index}
          style={{
            background: '#f1f5f9',
            color: '#0284c7',
            padding: '1px 5px',
            borderRadius: '4px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '12px',
            border: '1px solid #e2e8f0'
          }}
        >
          {inner}
        </code>
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts.length > 0 ? parts : text;
}

export default function SabreMarkdownRenderer({ content }) {
  if (!content) return null;

  // 1. PRE-PROCESS: Detect raw ASCII boxes (even without triple backticks or with single backticks)
  // and cleanly partition the content so the ASCII mess is completely replaced by SabreVisualArchitectureDiagram!
  const lines = content.split('\n');
  const sections = [];
  let currentTextLines = [];
  let currentDiagramLines = [];
  let inRawDiagram = false;
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if entering/exiting a markdown code block ```
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Exiting code block
        const codeText = codeBlockLines.join('\n');
        const isArch = codeBlockLang === 'diagram' || codeBlockLang === 'architecture' || 
                       codeText.includes('+---') || codeText.includes('|') || 
                       codeText.includes('PaaS') || codeText.includes('Gateway') || codeText.includes('Service');
        
        if (isArch) {
          sections.push({ type: 'diagram', code: codeText });
        } else {
          sections.push({ type: 'code', lang: codeBlockLang, code: codeText });
        }
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        // Entering code block
        if (currentTextLines.length > 0) {
          sections.push({ type: 'text', content: currentTextLines.join('\n') });
          currentTextLines = [];
        }
        inCodeBlock = true;
        codeBlockLang = trimmed.replace(/^```/, '').trim();
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Detect if this line belongs to a raw ASCII box diagram (e.g., "+---+", "| Bijapur |", single backtick "`")
    const isBoxLine = (trimmed.startsWith('+') && trimmed.includes('-')) ||
                      (trimmed.startsWith('|') && trimmed.endsWith('|')) ||
                      (trimmed.includes('+---') || trimmed.includes('+---+')) ||
                      (inRawDiagram && (trimmed === '' || trimmed === 'v' || trimmed === '|' || trimmed === '`' || trimmed.startsWith('+') || trimmed.startsWith('|')));

    if (isBoxLine) {
      if (!inRawDiagram) {
        if (currentTextLines.length > 0) {
          sections.push({ type: 'text', content: currentTextLines.join('\n') });
          currentTextLines = [];
        }
        inRawDiagram = true;
      }
      currentDiagramLines.push(line);
    } else {
      if (inRawDiagram) {
        sections.push({ type: 'diagram', code: currentDiagramLines.join('\n') });
        currentDiagramLines = [];
        inRawDiagram = false;
      }
      currentTextLines.push(line);
    }
  }

  if (inCodeBlock && codeBlockLines.length > 0) {
    sections.push({ type: 'diagram', code: codeBlockLines.join('\n') });
  }

  if (inRawDiagram && currentDiagramLines.length > 0) {
    sections.push({ type: 'diagram', code: currentDiagramLines.join('\n') });
  }

  if (currentTextLines.length > 0) {
    sections.push({ type: 'text', content: currentTextLines.join('\n') });
  }

  // CRITICAL DEDUPLICATION:
  // When an LLM outputs multiple diagram/ASCII boxes, combine all diagram codes
  // and emit EXACTLY ONE diagram section so the architecture diagram is NEVER duplicated!
  let diagramFound = false;
  let combinedDiagramCode = '';
  const finalSections = [];

  for (const sec of sections) {
    if (sec.type === 'diagram') {
      combinedDiagramCode += (combinedDiagramCode ? '\n' : '') + (sec.code || '');
      if (!diagramFound) {
        finalSections.push({ type: 'diagram', code: '' });
        diagramFound = true;
      }
    } else {
      finalSections.push(sec);
    }
  }

  if (diagramFound) {
    const diagSec = finalSections.find(s => s.type === 'diagram');
    if (diagSec) {
      diagSec.code = combinedDiagramCode;
    }
  }

  // 2. Render text blocks
  const renderTextBlock = (text, secIdx) => {
    const rawLines = text.split('\n');
    const elements = [];
    let currentList = null;
    let listType = null; // 'ul' | 'ol'

    const flushList = () => {
      if (currentList) {
        if (listType === 'ul') {
          elements.push(
            <ul key={`ul-${secIdx}-${elements.length}`} style={{ margin: '6px 0 10px 18px', padding: 0, listStyleType: 'disc' }}>
              {currentList.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '4px', lineHeight: '1.5' }}>
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ul>
          );
        } else if (listType === 'ol') {
          elements.push(
            <ol key={`ol-${secIdx}-${elements.length}`} style={{ margin: '6px 0 10px 18px', padding: 0 }}>
              {currentList.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '4px', lineHeight: '1.5' }}>
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ol>
          );
        }
        currentList = null;
        listType = null;
      }
    };

    rawLines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed === '`') {
        flushList();
        return;
      }

      // Check for bullet list item: * or -
      const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);
      if (bulletMatch) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
          currentList = [];
        }
        currentList.push(bulletMatch[1]);
        return;
      }

      // Check for numbered list item: 1. or 2)
      const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.+)/);
      if (numMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
          currentList = [];
        }
        currentList.push(numMatch[2]);
        return;
      }

      // Check for step headers like "Step 1: Route Optimization (NET-09 & NET-10)"
      const stepMatch = trimmed.match(/^(Step\s+\d+:?\s*.+)/i);
      if (stepMatch) {
        flushList();
        elements.push(
          <div key={`step-${secIdx}-${lineIdx}`} style={{ fontSize: '13.5px', fontWeight: 800, color: '#0284c7', margin: '14px 0 4px 0' }}>
            {renderInlineFormatting(stepMatch[1])}
          </div>
        );
        return;
      }

      // Regular line / paragraph
      flushList();

      if (trimmed.startsWith('### ')) {
        elements.push(
          <div key={`h3-${secIdx}-${lineIdx}`} style={{ fontSize: '13px', fontWeight: 800, color: '#0369a1', margin: '12px 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {renderInlineFormatting(trimmed.substring(4))}
          </div>
        );
      } else if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        elements.push(
          <div key={`h2-${secIdx}-${lineIdx}`} style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: '14px 0 6px 0' }}>
            {renderInlineFormatting(trimmed.replace(/^#+\s*/, ''))}
          </div>
        );
      } else {
        elements.push(
          <p key={`p-${secIdx}-${lineIdx}`} style={{ margin: '0 0 10px 0', lineHeight: '1.6', color: '#1e293b' }}>
            {renderInlineFormatting(trimmed)}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  let diagramRendered = false;

  return (
    <div style={{ fontSize: '13.5px', color: '#1e293b' }}>
      {finalSections.map((sec, idx) => {
        if (sec.type === 'diagram') {
          if (diagramRendered) return null;
          diagramRendered = true;
          return (
            <div key={`arch-${idx}`}>
              <SabreVisualArchitectureDiagram rawCode={`${content}\n${sec.code || ''}`} />
            </div>
          );
        }
        if (sec.type === 'code') {
          return (
            <pre key={`code-${idx}`} style={{ background: '#0f172a', color: '#f8fafc', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px' }}>
              <code>{sec.code}</code>
            </pre>
          );
        }
        return <React.Fragment key={`text-${idx}`}>{renderTextBlock(sec.content, idx)}</React.Fragment>;
      })}
    </div>
  );
}
