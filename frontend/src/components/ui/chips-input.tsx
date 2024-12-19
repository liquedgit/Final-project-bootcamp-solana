"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChipsInputProps {
  name: string;
  placeholder?: string;
  onChipsChange?: (chips: string[]) => void;
}

export function ChipsInput({
  name,
  onChipsChange,
  placeholder,
}: ChipsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [chips, setChips] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addChip(inputValue.trim());
    }
  };

  const addChip = (chip: string) => {
    if (!chips.includes(chip)) {
      const newChips = [...chips, chip];
      setChips(newChips);
      setInputValue("");
      onChipsChange?.(newChips);
    }
  };

  const removeChip = (chipToRemove: string) => {
    const newChips = chips.filter((chip) => chip !== chipToRemove);
    setChips(newChips);
    onChipsChange?.(newChips);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {chips.map((chip) => (
          <Badge key={chip} variant="secondary" className="text-sm py-1 px-2">
            {chip}
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 h-auto p-0"
              onClick={() => removeChip(chip)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </Button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        name={name}
        id={name}
        placeholder={
          placeholder ? placeholder : "Type and press Enter to add chips"
        }
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        className="w-full"
      />
    </div>
  );
}
