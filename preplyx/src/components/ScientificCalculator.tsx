"use client";
import { useState, useRef, useEffect } from 'react';
import { X, History, Delete, RotateCcw } from 'lucide-react';

interface ScientificCalculatorProps {
  onClose: () => void;
}

export default function ScientificCalculator({ onClose }: ScientificCalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [memory, setMemory] = useState(0);
  const [isDegree, setIsDegree] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isError, setIsError] = useState(false);

  // Draggable
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setPos({ x: window.innerWidth - rect.width - 24, y: 80 });
      initialized.current = true;
    }
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    };
    const onUp = () => { dragRef.current.dragging = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const addToDisplay = (value: string) => {
    setIsError(false);
    if (display === '0' && value !== '.' && !isNaN(Number(value))) {
      setDisplay(value);
    } else if (display === 'Error') {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
  };

  const addOperator = (operator: string) => {
    setIsError(false);
    setExpression(display + ' ' + operator + ' ');
    setDisplay('0');
  };

  const addFunction = (func: string) => {
    setIsError(false);
    setDisplay(func + '(');
  };

  const toggleSign = () => {
    if (display !== '0' && display !== 'Error') {
      setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
    }
  };

  const percentage = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) setDisplay(String(val / 100));
  };

  const calculate = () => {
    try {
      let fullExpression = expression + display;
      fullExpression = fullExpression
        .replace(/sin\(/g, isDegree ? 'Math.sin(Math.PI/180*' : 'Math.sin(')
        .replace(/cos\(/g, isDegree ? 'Math.cos(Math.PI/180*' : 'Math.cos(')
        .replace(/tan\(/g, isDegree ? 'Math.tan(Math.PI/180*' : 'Math.tan(')
        .replace(/asin\(/g, isDegree ? '(180/Math.PI)*Math.asin(' : 'Math.asin(')
        .replace(/acos\(/g, isDegree ? '(180/Math.PI)*Math.acos(' : 'Math.acos(')
        .replace(/atan\(/g, isDegree ? '(180/Math.PI)*Math.atan(' : 'Math.atan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/cbrt\(/g, 'Math.cbrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/℮/g, 'Math.E')
        .replace(/÷/g, '/')
        .replace(/×/g, '*');
      // eslint-disable-next-line no-eval
      const result = eval(fullExpression);
      const resultStr = Number.isInteger(result) ? String(result) : parseFloat(result.toFixed(10)).toString();
      const historyEntry = `${expression}${display} = ${resultStr}`;
      setHistory(prev => [historyEntry, ...prev].slice(0, 20));
      setDisplay(resultStr);
      setExpression('');
      setIsError(false);
    } catch {
      setDisplay('Error');
      setExpression('');
      setIsError(true);
    }
  };

  const clearAll = () => { setDisplay('0'); setExpression(''); setIsError(false); };
  const clearEntry = () => { setDisplay('0'); setIsError(false); };
  const backspace = () => {
    setIsError(false);
    if (display === 'Error') { setDisplay('0'); return; }
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };
  const memoryRecall = () => setDisplay(String(memory));
  const memoryStore = () => setMemory(parseFloat(display) || 0);
  const memoryClear = () => setMemory(0);
  const memoryAdd = () => setMemory(memory + (parseFloat(display) || 0));

  type BtnDef = { label: string; onClick: () => void; bg: string; fg: string; span?: number; fontSize?: string };

  const rows: BtnDef[][] = [
    // Row 1 – Scientific
    [
      { label: 'sin', onClick: () => addFunction('sin'), bg: '#3d1380', fg: '#c4b5fd', fontSize: '12px' },
      { label: 'cos', onClick: () => addFunction('cos'), bg: '#3d1380', fg: '#c4b5fd', fontSize: '12px' },
      { label: 'tan', onClick: () => addFunction('tan'), bg: '#3d1380', fg: '#c4b5fd', fontSize: '12px' },
      { label: 'log', onClick: () => addFunction('log'), bg: '#3d1380', fg: '#c4b5fd', fontSize: '12px' },
      { label: 'ln', onClick: () => addFunction('ln'), bg: '#3d1380', fg: '#c4b5fd', fontSize: '12px' },
    ],
    // Row 2 – More scientific
    [
      { label: '√', onClick: () => addFunction('sqrt'), bg: '#3d1380', fg: '#c4b5fd' },
      { label: 'x²', onClick: () => setDisplay(display + '^2'), bg: '#3d1380', fg: '#c4b5fd', fontSize: '12px' },
      { label: 'xʸ', onClick: () => addOperator('^'), bg: '#3d1380', fg: '#c4b5fd', fontSize: '12px' },
      { label: 'π', onClick: () => addToDisplay('π'), bg: '#1e3a5f', fg: '#93c5fd' },
      { label: '℮', onClick: () => addToDisplay('℮'), bg: '#1e3a5f', fg: '#93c5fd' },
    ],
    // Row 3 – Memory
    [
      { label: 'MC', onClick: memoryClear, bg: '#1e293b', fg: '#94a3b8', fontSize: '12px' },
      { label: 'MR', onClick: memoryRecall, bg: '#1e293b', fg: '#94a3b8', fontSize: '12px' },
      { label: 'MS', onClick: memoryStore, bg: '#1e293b', fg: '#94a3b8', fontSize: '12px' },
      { label: 'M+', onClick: memoryAdd, bg: '#1e293b', fg: '#94a3b8', fontSize: '12px' },
      { label: '(  )', onClick: () => addToDisplay(display.includes('(') && !display.includes(')') ? ')' : '('), bg: '#1e293b', fg: '#e2e8f0' },
    ],
    // Row 4
    [
      { label: 'AC', onClick: clearAll, bg: '#7f1d1d', fg: '#fca5a5' },
      { label: 'CE', onClick: clearEntry, bg: '#7f1d1d', fg: '#fca5a5', fontSize: '12px' },
      { label: '%', onClick: percentage, bg: '#1e293b', fg: '#e2e8f0' },
      { label: '÷', onClick: () => addOperator('÷'), bg: '#7B2FF7', fg: '#fff' },
      { label: '⌫', onClick: backspace, bg: '#1e293b', fg: '#f87171' },
    ],
    // Row 5
    [
      { label: '7', onClick: () => addToDisplay('7'), bg: '#0f172a', fg: '#f1f5f9' },
      { label: '8', onClick: () => addToDisplay('8'), bg: '#0f172a', fg: '#f1f5f9' },
      { label: '9', onClick: () => addToDisplay('9'), bg: '#0f172a', fg: '#f1f5f9' },
      { label: '×', onClick: () => addOperator('×'), bg: '#7B2FF7', fg: '#fff' },
      { label: '+/-', onClick: toggleSign, bg: '#1e293b', fg: '#e2e8f0', fontSize: '12px' },
    ],
    // Row 6
    [
      { label: '4', onClick: () => addToDisplay('4'), bg: '#0f172a', fg: '#f1f5f9' },
      { label: '5', onClick: () => addToDisplay('5'), bg: '#0f172a', fg: '#f1f5f9' },
      { label: '6', onClick: () => addToDisplay('6'), bg: '#0f172a', fg: '#f1f5f9' },
      { label: '−', onClick: () => addOperator('-'), bg: '#7B2FF7', fg: '#fff' },
      { label: '1/x', onClick: () => { try { setDisplay(String(1 / parseFloat(display))); } catch { setDisplay('Error'); } }, bg: '#1e293b', fg: '#e2e8f0', fontSize: '12px' },
    ],
    // Row 7
    [
      { label: '1', onClick: () => addToDisplay('1'), bg: '#0f172a', fg: '#f1f5f9' },
      { label: '2', onClick: () => addToDisplay('2'), bg: '#0f172a', fg: '#f1f5f9' },
      { label: '3', onClick: () => addToDisplay('3'), bg: '#0f172a', fg: '#f1f5f9' },
      { label: '+', onClick: () => addOperator('+'), bg: '#7B2FF7', fg: '#fff' },
      { label: '=', onClick: calculate, bg: '#22c55e', fg: '#fff' },
    ],
    // Row 8
    [
      { label: '0', onClick: () => addToDisplay('0'), bg: '#0f172a', fg: '#f1f5f9', span: 2 },
      { label: '.', onClick: () => { if (!display.includes('.')) addToDisplay('.'); }, bg: '#0f172a', fg: '#f1f5f9' },
      { label: '(', onClick: () => addToDisplay('('), bg: '#1e293b', fg: '#e2e8f0' },
      { label: ')', onClick: () => addToDisplay(')'), bg: '#1e293b', fg: '#e2e8f0' },
    ],
  ];

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: '340px',
        backgroundColor: '#1a1a2e',
        borderRadius: '20px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(123,47,247,0.3)',
        zIndex: 2000,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Header – drag handle */}
      <div
        onMouseDown={onMouseDown}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #4B0FA3, #7B2FF7)',
          cursor: 'grab',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '14px' }}>🧮</span>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>Scientific Calculator</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Drag to move • {isDegree ? 'DEG' : 'RAD'} mode</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => setShowHistory(h => !h)} style={{ background: showHistory ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <History size={15} color="#fff" />
          </button>
          <button onClick={() => setIsDegree(d => !d)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#fff', transition: 'all 0.2s' }}>
            {isDegree ? 'DEG' : 'RAD'}
          </button>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <X size={16} color="#fff" />
          </button>
        </div>
      </div>

      {/* Display */}
      <div style={{ padding: '12px 16px 8px', backgroundColor: '#0d0d1a' }}>
        {/* Expression line */}
        <div style={{ fontSize: '12px', color: '#7B2FF7', textAlign: 'right', minHeight: '18px', fontFamily: 'monospace', marginBottom: '4px', opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {expression || '\u00a0'}
        </div>
        {/* Main number */}
        <div style={{
          fontSize: display.length > 12 ? '20px' : display.length > 8 ? '26px' : '36px',
          fontWeight: 700, color: isError ? '#f87171' : '#fff',
          textAlign: 'right', fontFamily: 'monospace',
          letterSpacing: '-1px', lineHeight: 1.1,
          wordBreak: 'break-all', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'
        }}>
          {display}
        </div>
        {/* Memory indicator */}
        {memory !== 0 && (
          <div style={{ fontSize: '10px', color: '#7B2FF7', textAlign: 'right', marginTop: '4px', fontFamily: 'monospace' }}>
            M: {memory}
          </div>
        )}
      </div>

      {/* History Panel */}
      {showHistory && (
        <div style={{ maxHeight: '160px', overflowY: 'auto', backgroundColor: '#0d0d1a', borderTop: '1px solid rgba(123,47,247,0.2)', padding: '8px 12px' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#475569', fontSize: '12px', padding: '12px 0' }}>No calculations yet</div>
          ) : (
            history.map((item, i) => (
              <div
                key={i}
                onClick={() => { const res = item.split(' = ')[1]; if (res) setDisplay(res); }}
                style={{ fontSize: '11px', color: '#94a3b8', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', marginBottom: '2px', fontFamily: 'monospace', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                {item}
              </div>
            ))
          )}
        </div>
      )}

      {/* Buttons */}
      <div style={{ padding: '10px 12px 14px', backgroundColor: '#12122a', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {row.map((btn, bi) => (
              <button
                key={bi}
                onClick={btn.onClick}
                style={{
                  gridColumn: btn.span ? `span ${btn.span}` : 'span 1',
                  padding: '12px 4px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontSize: btn.fontSize || '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  backgroundColor: btn.bg,
                  color: btn.fg,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontFamily: 'monospace',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.filter = 'brightness(1.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
              >
                {btn.label === '⌫' ? <Delete size={15} style={{ display: 'block', margin: '0 auto' }} /> : btn.label}
              </button>
            ))}
          </div>
        ))}
        {/* Clear history */}
        {history.length > 0 && (
          <button onClick={() => setHistory([])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px', padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#475569', fontSize: '11px', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}
          >
            <RotateCcw size={12} /> Clear history
          </button>
        )}
      </div>
    </div>
  );
}
