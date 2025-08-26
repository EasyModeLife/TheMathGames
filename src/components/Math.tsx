import katex from 'katex';
import { useMemo } from 'react';

interface Props {
  children: string;
  inline?: boolean;
}

export default function Math({ children, inline = false }: Props) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(children, {
        displayMode: !inline,
        throwOnError: false,
      });
    } catch (e) {
      console.error('KaTeX error', e);
      return 'Error';
    }
  }, [children, inline]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}