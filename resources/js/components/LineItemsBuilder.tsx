import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface LineItemsBuilderProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

export default function LineItemsBuilder({ items, onChange }: LineItemsBuilderProps) {
  const addItem = () => {
    const newItems = [...items, { description: '', quantity: 1, rate: 0, amount: 0 }];
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700">
        <div className="col-span-5">Description</div>
        <div className="col-span-2">Qty</div>
        <div className="col-span-2">Rate</div>
        <div className="col-span-2">Amount</div>
        <div className="col-span-1"></div>
      </div>

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-5">
            <Input
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              placeholder="Item description"
            />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              value={item.rate}
              onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              value={item.amount}
              onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="col-span-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Line Item
      </Button>

      <div className="text-right text-sm text-gray-600">
        Subtotal: ${items.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}
      </div>
    </div>
  );
}