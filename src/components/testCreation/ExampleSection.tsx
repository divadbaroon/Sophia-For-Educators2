"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

import { Example } from "@/components/testCreation/types"

function ExampleSection({ 
  title, 
  examples, 
  onAdd, 
  onRemove, 
  onUpdate, 
  placeholder 
}: {
  title: string;
  examples: Example[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-900">{title}</label>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="text-sm">
          <Plus className="w-3 h-3 mr-1" />
          Add Example
        </Button>
      </div>
      <div className="space-y-2">
        {examples.map((example) => (
          <div key={example.id} className="flex gap-2">
            <Textarea
              placeholder={placeholder}
              value={example.text}
              onChange={(e) => onUpdate(example.id, e.target.value)}
              rows={2}
              className="flex-1 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemove(example.id)}
              className="px-2"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExampleSection