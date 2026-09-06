/**
 * Fixture for S26's chat thread. `ChatMessage` is a proposal (see its header
 * in `types/api.ts`) — CANON has no chat section at all.
 */

import type { ChatMessage } from '../types/api';

export const fxChatMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    tx_id: 'tx_1',
    sender: 'BUYER',
    text: 'माल कधी पाठवणार?',
    created_at: '2026-09-04T09:00:00+05:30',
  },
  {
    id: 'msg_2',
    tx_id: 'tx_1',
    sender: 'FARMER',
    text: 'उद्या सकाळी ट्रक येईल.',
    created_at: '2026-09-04T09:05:00+05:30',
  },
  {
    id: 'msg_3',
    tx_id: 'tx_1',
    sender: 'BUYER',
    text: 'ठीक आहे, वाट पाहतो.',
    created_at: '2026-09-04T09:06:00+05:30',
  },
];
