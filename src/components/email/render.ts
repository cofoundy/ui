import { render } from '@react-email/render';
import type { ReactElement } from 'react';

export async function renderEmail(element: ReactElement): Promise<string> {
  return render(element);
}

export async function renderEmailPlainText(element: ReactElement): Promise<string> {
  return render(element, { plainText: true });
}
