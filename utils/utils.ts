import { useEffect, useState } from 'react';
import { showToast } from '../ui-lib';
import Locale from '../locales';
// import { RequestMessage } from "./client/api";

export const ROLES = ['system', 'user', 'assistant'] as const;

export type MessageRole = (typeof ROLES)[number];

export interface MultimodalContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface RequestMessage {
  role: MessageRole;
  content: string | MultimodalContent[];
}

export function trimTopic(topic: string) {
  // Fix an issue where double quotes still show in the Indonesian language
  // This will remove the specified punctuation from the end of the string
  // and also trim quotes from both the start and end if they exist.
  return (
    topic
      // fix for gemini
      .replace(/^["“”*]+|["“”*]+$/g, '')
      .replace(/[，。！？”“"、,.!?*]*$/, '')
  );
}

export async function copyToClipboard(text: string) {
  try {
    if (window.__TAURI__) {
      window.__TAURI__.writeText(text);
    } else {
      await navigator.clipboard.writeText(text);
    }

    showToast(Locale.Copy.Success);
  } catch (error) {
    if (typeof window === 'undefined') return;
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(Locale.Copy.Success);
    } catch (error) {
      showToast(Locale.Copy.Failed);
    }
    document.body.removeChild(textArea);
  }
}

export async function downloadAs(text: string, filename: string) {
  if (window.__TAURI__) {
    const result = await window.__TAURI__.dialog.save({
      defaultPath: `${filename}`,
      filters: [
        {
          name: `${filename.split('.').pop()} files`,
          extensions: [`${filename.split('.').pop()}`],
        },
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
    });

    if (result !== null) {
      try {
        await window.__TAURI__.fs.writeTextFile(result, text);
        showToast(Locale.Download.Success);
      } catch (error) {
        showToast(Locale.Download.Failed);
      }
    } else {
      showToast(Locale.Download.Failed);
    }
  } else {
    if (typeof window === 'undefined') return;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}

export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return size;
}

export function merge(target: any, source: any) {
  Object.keys(source).forEach(function (key) {
    if (
      (source.hasOwnProperty(key) && // Check if the property is not inherited
        source[key] &&
        typeof source[key] === 'object') ||
      key === '__proto__' ||
      key === 'constructor'
    ) {
      merge((target[key] = target[key] || {}), source[key]);
      return;
    }
    target[key] = source[key];
  });
}
