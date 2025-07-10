"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useImageUpload } from "@/hooks/image-gallery/useImageUpload";
import { useGetWebLinks } from "@/hooks/web-gallery/useGetWebLinks";
import { WebLinkDataProps } from "@/types/types";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Globe, Heart, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CreateWebLinkData,
  useCreateWebLink,
} from "../../../hooks/web-gallery/useCreateWebLink";
import {
  getBtnLightClasses,
  getInputBaseClasses,
} from "../../../types/ui-utils";
// Sửa import này - dùng named import thay vì default import
import { TagInput } from "../TagInput";

interface CreateWebLinkDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: (webLink: WebLinkDataProps) => void;
}

const categoryOptions = [
  { value: "memories", label: "Memories", emoji: "💕" },
  { value: "gifts", label: "Gifts", emoji: "🎁" },
  { value: "letters", label: "Letters", emoji: "💌" },
  { value: "moments", label: "Moments", emoji: "✨" },
  { value: "other", label: "Other", emoji: "🌟" },
];

const defaultColors = [
  "#ec4899", // Pink-500
  "#f97316", // Orange-500
  "#8b5cf6", // Purple-500
  "#06b6d4", // Cyan-500
  "#10b981", // Emerald-500
  "#ef4444", // Red-500
];

export default function CreateWebLinkDialog({
  trigger,
  onSuccess,
}: CreateWebLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateWebLinkData>({
    title: "",
    url: "",
    description: "",
    tags: [],
    category: "memories",
    backgroundColor: "#ec4899",
    textColor: "#ffffff",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createWebLink, isLoading } = useCreateWebLink((WebLink) => {
    setOpen(false);
    resetForm();
    onSuccess?.(WebLink);
  });
  const { uploadFiles } = useImageUpload();
  const { webLinks } = useGetWebLinks();

  // Tính toán danh sách tag duy nhất từ webLinks với xử lý an toàn
  const allTags = useMemo(() => {
    return Array.from(
      new Set(
        webLinks
          .filter((link) => link.tags && Array.isArray(link.tags))
          .flatMap((link) => link.tags)
          .filter((tag) => tag && typeof tag === "string")
      )
    );
  }, [webLinks]);

  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      description: "",
      tags: [],
      category: "memories",
      backgroundColor: "#ec4899",
      textColor: "#ffffff",
    });
    setErrors({});
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!formData.url.trim()) {
      newErrors.url = "URL is required";
    } else if (!/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url =
        "Please enter a valid URL (starting with http:// or https://)";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const webLink = await createWebLink(formData);
      if (!webLink) {
        throw new Error("Failed to create WebLink");
      }

      if (selectedFile) {
        try {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(selectedFile);
          const fileList = dataTransfer.files;

          await uploadFiles(fileList, { webLinkId: webLink._id.toString() });
        } catch (uploadError) {
          toast.error("WebLink created, but image upload failed 😢", {
            description:
              uploadError instanceof Error
                ? uploadError.message
                : "Unknown error",
          });
        }
      }

      setOpen(false);
      resetForm();
      onSuccess?.(webLink);
    } catch (error) {
      toast.error("Failed to create WebLink 😢", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const defaultTrigger = (
    <Button
      variant="default"
      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add WebLink
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-light glass-light-hover dark:glass-light">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
              <Globe className="h-5 w-5 text-white" />
            </div>
            Create New WebLink
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Add a new love-themed website to your digital gallery
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Our First Anniversary"
              className={
                getInputBaseClasses() +
                (errors.title
                  ? " border-red-500 focus:border-red-500"
                  : "focus:border-pink-500")
              }
              disabled={isLoading}
            />
            <AnimatePresence>
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://our-love-story.vercel.app"
              className={
                getInputBaseClasses() +
                (errors.url
                  ? " border-red-500 focus:border-red-500"
                  : "focus:border-pink-500")
              }
              disabled={isLoading}
            />
            <AnimatePresence>
              {errors.url && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {errors.url}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value: typeof formData.category) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 border-pink-400 dark:border-pink-600 text-gray-800 dark:text-gray-200">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-pink-400 dark:border-pink-600 text-gray-800 dark:text-gray-200">
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags - Sử dụng TagInput component */}
          <TagInput
            tags={formData.tags}
            onTagsChange={(newTags: string[]) =>
              setFormData((prev) => ({ ...prev, tags: newTags }))
            }
            suggestions={allTags}
            placeholder="Add tags for your WebLink..."
            maxTags={20}
            disabled={isLoading}
          />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="A beautiful timeline of our first year together..."
              className={
                "min-h-[80px] transition-all duration-200" +
                getInputBaseClasses() +
                (errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-pink-500")
              }
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-slate-500">
              <AnimatePresence>
                {errors.description && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-500 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </motion.p>
                )}
              </AnimatePresence>
              <span>{formData.description?.length || 0}/1000</span>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail-upload" className="text-sm font-medium">
              Thumbnail Image
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="thumbnail-upload"
                disabled={isSubmitting}
              />
              <label
                htmlFor="thumbnail-upload"
                className={`btn-light inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm h-9 px-4 py-2 ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                Select Image
              </label>
              {selectedFile && (
                <Button
                  variant="destructive"
                  onClick={removeImage}
                  disabled={isSubmitting}
                >
                  Remove
                </Button>
              )}
            </div>
            {previewUrl && (
              <div className="mt-2">
                <Image
                  src={previewUrl || ""}
                  alt="Preview"
                  width={300}
                  height={200}
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}
            {!selectedFile && (
              <p className="text-sm text-slate-500">No image selected</p>
            )}
          </div>

          {/* Color Customization */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Card Color</Label>
            <div className="flex flex-wrap gap-2">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, backgroundColor: color }))
                  }
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    formData.backgroundColor === color
                      ? "border-slate-400 scale-110"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isLoading}
                >
                  {formData.backgroundColor === color && (
                    <Check className="h-4 w-4 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className={getBtnLightClasses()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Create WebLink
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
