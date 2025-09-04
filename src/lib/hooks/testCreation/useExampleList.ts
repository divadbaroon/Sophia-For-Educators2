import { useState } from 'react';

import { Example } from "@/components/testCreation/types"

export const useExampleList = (initialList: Example[] = []) => {
  const [items, setItems] = useState<Example[]>(initialList);

  const add = () => setItems([...items, { id: Date.now().toString(), text: "" }]);
  const remove = (id: string) => setItems(items.filter(ex => ex.id !== id));
  const update = (id: string, text: string) => setItems(items.map(ex => ex.id === id ? { ...ex, text } : ex));

  return { items, setItems, add, remove, update };
};