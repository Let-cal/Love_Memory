import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getInputBaseClasses } from "@/types/ui-utils";
import { AnimatePresence, motion } from "framer-motion";
import { Hash, Heart, Plus, Search, Sparkles, X } from "lucide-react";
import React, { memo, useEffect, useRef, useState } from "react";

export interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = memo(
  ({
    tags,
    onTagsChange,
    suggestions = [],
    placeholder = "Add a tag...",
    maxTags = 20,
    disabled = false,
    className = "",
  }) => {
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
      []
    );
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (inputValue.trim().length > 0) {
        const filtered = suggestions
          .filter(
            (suggestion) =>
              suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
              !tags.includes(suggestion.toLowerCase())
          )
          .slice(0, 8);
        setFilteredSuggestions(filtered);
        setIsOpen(filtered.length > 0);
        setSelectedIndex(-1);
      } else {
        setFilteredSuggestions([]);
        setIsOpen(false);
      }
    }, [inputValue, suggestions, tags]);

    const addTag = (tag: string) => {
      const trimmedTag = tag.trim().toLowerCase();
      if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
        onTagsChange([...tags, trimmedTag]);
        setInputValue("");
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
      }
    };

    const removeTag = (tagToRemove: string) => {
      onTagsChange(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          addTag(filteredSuggestions[selectedIndex]);
        } else if (inputValue.trim()) {
          addTag(inputValue);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setSelectedIndex(-1);
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        removeTag(tags[tags.length - 1]);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const handleInputFocus = () => {
      setIsInputFocused(true);
    };

    const handleInputBlur = () => {
      setIsInputFocused(false);
      setTimeout(() => {
        if (!popoverRef.current?.contains(document.activeElement)) {
          setIsOpen(false);
        }
      }, 300);
    };

    const popularTags = [
      "love",
      "memories",
      "special",
      "anniversary",
      "first-date",
      "romantic",
    ];

    return (
      <div className={`space-y-3 ${className}`}>
        <Label
          htmlFor="tags"
          className="text-sm font-medium flex items-center gap-2"
        >
          <div className="flex items-center gap-1">
            <Hash className="h-4 w-4 text-pink-500" />
            Tags
          </div>
          <span className="text-xs text-slate-500">
            {tags.length}/{maxTags}
          </span>
        </Label>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div
              className={`
                relative flex flex-wrap flex-row gap-2 pl-3 pr-2 min-h-[38px] max-h-[120px] overflow-y-auto transition-all duration-200 ease-out items-center
                ${getInputBaseClasses()}
                ${
                  isInputFocused || isOpen
                    ? "border-pink-500 ring-2 ring-pink-500 ring-offset-2 bg-pink-50/50 dark:bg-pink-900/20 shadow-lg shadow-pink-100/50 dark:shadow-pink-900/20"
                    : "border-pink-400 bg-white dark:bg-gray-800 hover:border-pink-500"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}
                backdrop-blur-sm
              `}
              onClick={() => inputRef.current?.focus()}
            >
              <AnimatePresence>
                {tags.map((tag, index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: index * 0.05,
                    }}
                    className="flex-shrink-0"
                  >
                    <Badge
                      variant="secondary"
                      className="
                        bg-gradient-to-r from-pink-100 to-rose-100 
                        text-pink-800 border-pink-200 
                        hover:from-pink-200 hover:to-rose-200 
                        transition-all duration-200
                        pl-3 pr-1 py-1 text-xs font-medium
                        shadow-sm hover:shadow-md
                        group dark:bg-gradient-to-r dark:from-pink-800 dark:to-rose-800 dark:text-pink-200 dark:border-pink-600
                      "
                    >
                      <Heart className="h-3 w-3 mr-1 text-pink-600 dark:text-pink-400" />
                      {tag}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(tag);
                        }}
                        className="
                          ml-2 hover:bg-pink-300 rounded-full p-1 
                          transition-colors duration-200
                          group-hover:bg-pink-300/50 dark:hover:bg-pink-700 dark:group-hover:bg-pink-700/50
                          focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                        "
                        disabled={disabled}
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex-1 min-w-[120px] h-[38px] flex items-center">
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={tags.length === 0 ? placeholder : "Add more..."}
                  className="
                    w-full h-full bg-transparent border-0 outline-none 
                    text-sm text-gray-800 placeholder-slate-400
                    focus:outline-none focus:ring-0
                    dark:text-gray-200 dark:placeholder-slate-500
                    py-0
                  "
                  disabled={disabled || tags.length >= maxTags}
                />
              </div>

              {inputValue.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={() => addTag(inputValue)}
                  className="
                    flex-shrink-0 p-1 rounded-full 
                    bg-gradient-to-r from-pink-500 to-rose-500 
                    text-white shadow-md hover:shadow-lg
                    transition-all duration-200 hover:scale-110
                    dark:from-pink-600 dark:to-rose-600
                    focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                  "
                  disabled={disabled || tags.length >= maxTags}
                  aria-label="Add tag"
                >
                  <Plus className="h-3 w-3" />
                </motion.button>
              )}
            </div>
          </PopoverTrigger>

          <PopoverContent
            ref={popoverRef}
            className="w-[var(--radix-popover-trigger-width)] p-0 border-pink-200 shadow-xl dark:border-pink-600"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl border-0 overflow-hidden dark:bg-gray-800/95"
            >
              <div className="px-4 py-3 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 dark:border-pink-700 dark:from-pink-900 dark:to-rose-900">
                <div className="flex items-center gap-2 text-sm text-pink-800 dark:text-pink-200">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Suggestions</span>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {filteredSuggestions.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {filteredSuggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        type="button"
                        onClick={() => addTag(suggestion)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 rounded-lg 
                          text-left text-sm transition-all duration-200
                          ${
                            selectedIndex === index
                              ? "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 shadow-sm dark:from-pink-800 dark:to-rose-800 dark:text-pink-200"
                              : "hover:bg-pink-50 text-slate-700 dark:hover:bg-pink-900 dark:text-slate-200"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-pink-400 dark:bg-pink-500" />
                          <span>{suggestion}</span>
                        </div>
                        {popularTags.includes(suggestion) && (
                          <div className="ml-auto">
                            <Badge
                              variant="outline"
                              className="text-xs border-pink-200 text-pink-600 dark:border-pink-500 dark:text-pink-300"
                            >
                              Popular
                            </Badge>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                    <Search className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm">No suggestions found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Press Enter to add {inputValue}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </PopoverContent>
        </Popover>

        {tags.length >= maxTags - 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 dark:bg-amber-900/50 dark:border-amber-700 dark:text-amber-300"
          >
            <Sparkles className="h-3 w-3" />
            <span>
              {tags.length >= maxTags
                ? "Maximum tags reached"
                : `${maxTags - tags.length} tags remaining`}
            </span>
          </motion.div>
        )}
      </div>
    );
  }
);

TagInput.displayName = "TagInput";
