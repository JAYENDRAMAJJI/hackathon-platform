import React, { useRef, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';

interface KotlinEditorProps {
  code: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  theme?: 'vs-dark' | 'light';
}

export function KotlinEditor({ code, onChange, readOnly = false, theme = 'vs-dark' }: KotlinEditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (!monaco || !editorRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    // Simulate basic syntax checking using regex
    const validateCode = () => {
      const markers: any[] = [];
      const lines = code.split('\n');

      lines.forEach((line, i) => {
        const lineNum = i + 1;

        // Missing closing quote
        if ((line.match(/"/g) || []).length % 2 !== 0 && !line.includes('//')) {
          markers.push({
            message: 'Unterminated string literal',
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNum,
            startColumn: line.indexOf('"') + 1,
            endLineNumber: lineNum,
            endColumn: line.length + 1,
          });
        }

        // Using 'let' instead of 'val' or 'var' (common mistake for JS/TS devs)
        const letMatch = line.match(/\blet\s+\w+\s*=/);
        if (letMatch && !line.includes('//')) {
          markers.push({
            message: "Kotlin uses 'val' (immutable) or 'var' (mutable) for variable declarations, not 'let'.",
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNum,
            startColumn: letMatch.index! + 1,
            endLineNumber: lineNum,
            endColumn: letMatch.index! + 4,
          });
        }
        
        // Missing parenthesis in print/println
        if (line.match(/\bprintln\s+["\w]/) || line.match(/\bprint\s+["\w]/)) {
           markers.push({
            message: "Function call requires parentheses: println()",
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNum,
            startColumn: line.indexOf('print') + 1,
            endLineNumber: lineNum,
            endColumn: line.length + 1,
          });
        }
      });

      monaco.editor.setModelMarkers(model, 'kotlin-validator', markers);
    };

    // Debounce validation
    const timeout = setTimeout(validateCode, 500);
    return () => clearTimeout(timeout);
  }, [code, monaco]);

  return (
    <Editor
      height="100%"
      defaultLanguage="kotlin"
      theme={theme}
      value={code}
      onChange={(value) => onChange(value || '')}
      onMount={handleEditorMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        lineHeight: 24,
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        readOnly: readOnly,
        formatOnPaste: true,
      }}
    />
  );
}
