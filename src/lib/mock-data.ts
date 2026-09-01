// Mock data for the dashboard UI. Replace with real database queries later.

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ItemType {
  id: string;
  name: string;
  slug: 'snippet' | 'prompt' | 'command' | 'note' | 'file' | 'image' | 'url';
  icon: string;
  color: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemTypeIds: string[];
  itemCount: number;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  content?: string;
  typeId: string;
  collectionId: string | null;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
}

export const currentUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'devStash@example.com',
};

export const itemTypes: ItemType[] = [
  {
    id: 'type-snippet',
    name: 'Snippets',
    slug: 'snippet',
    icon: 'code',
    color: 'blue',
  },
  {
    id: 'type-prompt',
    name: 'Prompts',
    slug: 'prompt',
    icon: 'sparkles',
    color: 'purple',
  },
  {
    id: 'type-command',
    name: 'Commands',
    slug: 'command',
    icon: 'terminal',
    color: 'orange',
  },
  {
    id: 'type-note',
    name: 'Notes',
    slug: 'note',
    icon: 'file-text',
    color: 'yellow',
  },
  { id: 'type-file', name: 'Files', slug: 'file', icon: 'file', color: 'gray' },
  {
    id: 'type-image',
    name: 'Images',
    slug: 'image',
    icon: 'image',
    color: 'pink',
  },
  { id: 'type-url', name: 'Links', slug: 'url', icon: 'link', color: 'green' },
];

export const collections: Collection[] = [
  {
    id: 'col-react-patterns',
    name: 'React Patterns',
    description: 'Common React patterns and hooks',
    isFavorite: true,
    itemTypeIds: ['type-snippet', 'type-note', 'type-url'],
    itemCount: 12,
  },
  {
    id: 'col-python-snippets',
    name: 'Python Snippets',
    description: 'Useful Python code snippets',
    isFavorite: false,
    itemTypeIds: ['type-snippet', 'type-file'],
    itemCount: 8,
  },
  {
    id: 'col-context-files',
    name: 'Context Files',
    description: 'AI context files for projects',
    isFavorite: true,
    itemTypeIds: ['type-file', 'type-note'],
    itemCount: 5,
  },
  {
    id: 'col-interview-prep',
    name: 'Interview Prep',
    description: 'Technical interview preparation',
    isFavorite: false,
    itemTypeIds: ['type-note', 'type-snippet', 'type-url', 'type-prompt'],
    itemCount: 24,
  },
  {
    id: 'col-git-commands',
    name: 'Git Commands',
    description: 'Frequently used git commands',
    isFavorite: true,
    itemTypeIds: ['type-command', 'type-note'],
    itemCount: 15,
  },
  {
    id: 'col-ai-prompts',
    name: 'AI Prompts',
    description: 'Curated AI prompts for coding',
    isFavorite: false,
    itemTypeIds: ['type-prompt', 'type-snippet', 'type-note'],
    itemCount: 18,
  },
];

export const items: Item[] = [
  {
    id: 'item-use-auth-hook',
    title: 'useAuth Hook',
    description: 'Custom authentication hook for React applications',
    content: 'export function useAuth() { /* ... */ }',
    typeId: 'type-snippet',
    collectionId: 'col-react-patterns',
    tags: ['react', 'auth', 'hooks'],
    isFavorite: true,
    isPinned: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'item-api-error-handling',
    title: 'API Error Handling Pattern',
    description: 'Fetch wrapper with exponential backoff retry logic',
    content: 'async function fetchWithRetry(url, options) { /* ... */ }',
    typeId: 'type-snippet',
    collectionId: 'col-react-patterns',
    tags: ['api', 'error-handling'],
    isFavorite: false,
    isPinned: true,
    createdAt: '2026-01-12',
  },
];
