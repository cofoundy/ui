// __tests__/chat-sim/stories-smoke.test.tsx — qa's own write cell.
//
// Storybook itself isn't booted in this test run, so nothing else catches a story that throws
// at render time (a bad script, a channel/adapter mismatch, a typo in an id reference). This
// renders every exported story from every chat-sim story file, with the SAME arg-merging
// Storybook does (meta.args + story.args), so a broken story fails `vitest run`, not just a
// human clicking through Storybook later.

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { createElement } from 'react';
import { ChatSim } from '../../components/chat-sim';
import * as InboxAIReplacement from '../../stories/chat-sim/InboxAIReplacement.stories';
import * as ChatSimStates from '../../stories/chat-sim/ChatSimStates.stories';
import * as ChatSimChannels from '../../stories/chat-sim/ChatSimChannels.stories';

type StoryModule = {
  default: { args?: Record<string, unknown> };
  [key: string]: unknown;
};

function storiesOf(mod: StoryModule): Array<[string, Record<string, unknown>]> {
  const metaArgs = mod.default.args ?? {};
  return Object.entries(mod)
    .filter(([name]) => name !== 'default')
    .map(([name, story]) => [name, { ...metaArgs, ...(story as { args?: Record<string, unknown> }).args }]);
}

describe.each([
  ['InboxAIReplacement', InboxAIReplacement as unknown as StoryModule],
  ['ChatSimStates', ChatSimStates as unknown as StoryModule],
  ['ChatSimChannels', ChatSimChannels as unknown as StoryModule],
])('%s stories render without throwing', (_fileName, mod) => {
  for (const [name, args] of storiesOf(mod)) {
    it(name, () => {
      expect(() => render(createElement(ChatSim, args as never))).not.toThrow();
    });
  }
});
