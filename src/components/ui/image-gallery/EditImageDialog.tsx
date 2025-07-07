"use client";

import { useImageGroups } from "@/components/providers/ImageGroupsContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateImageGroup } from "@/hooks/image-gallery/useCreateImageGroup";
import { useGetImageGroups } from "@/hooks/image-gallery/useGetImageGroups";
import { useUpdateImage } from "@/hooks/image-gallery/useUpdateImage";
import { ImageDataProps } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Camera,
  File,
  FolderOpen,
  Loader2,
  Maximize,
  Plus,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  caption: z.string().max(500, "Caption must be less than 500 characters"),
  groupId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditImageDialogProps {
  image: ImageDataProps | null;
  isOpen: boolean;
  onClose: () => void;
  onImageUpdated: (updatedImage: ImageDataProps) => void;
}

export function EditImageDialog({
  image,
  isOpen,
  onClose,
  onImageUpdated,
}: EditImageDialogProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { addGroup } = useGetImageGroups(isOpen);
  const { groups, isLoading: groupsLoading, refetch } = useImageGroups();
  const { createGroup, isCreating } = useCreateImageGroup();
  const { updateImage, isUpdating } = useUpdateImage();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caption: "",
      groupId: "",
      tags: [],
    },
  });

  useEffect(() => {
    if (image) {
      form.reset({
        caption: image.caption || "",
        groupId: image.group || "ungrouped",
        tags: image.tags || [],
      });
      setSelectedTags(image.tags || []);
    }
  }, [image, form]);

  useEffect(() => {
    if (!isOpen) {
      setNewGroupName("");
      setShowCreateGroup(false);
      setTagInput("");
      setSelectedTags([]);
    }
  }, [isOpen]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    try {
      const newGroup = await createGroup({ name: newGroupName.trim() });
      if (newGroup) {
        addGroup(newGroup);
        form.setValue("groupId", newGroup.id);
        setNewGroupName("");
        setShowCreateGroup(false);
        toast.success("Group created successfully");
        refetch();
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
    form.setValue("tags", newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!image) return;
    try {
      const updatedImage = await updateImage(image.id.toString(), {
        caption: data.caption,
        groupId: data.groupId === "ungrouped" ? "ungrouped" : data.groupId,
        tags: selectedTags,
      });
      if (updatedImage) {
        onImageUpdated(updatedImage);
        onClose();
        toast.success("Image updated successfully");
      }
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
    }
  };

  if (!image) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-light dark:glass-light rounded-xl border border-pink-400 dark:border-pink-600 shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-['Dancing_Script'] text-2xl">
            <Camera className="h-6 w-6" />
            Edit Love Memory
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center">
              <div className="relative w-32 h-32 bg-pink-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md">
                <img
                  src={image.url}
                  alt={image.caption || "Image preview"}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-pink-600 dark:text-pink-400">
                    Caption
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your memory here..."
                      className="resize-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-pink-400 dark:border-pink-600 focus:ring-pink-500 focus:border-pink-500 rounded-md"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="bg-pink-300 dark:bg-pink-700" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-pink-500" />
                <h3 className="text-sm font-medium text-pink-600 dark:text-pink-400">
                  Album
                </h3>
              </div>
              <div className="flex flex-row items-end gap-4">
                <FormField
                  control={form.control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-pink-600 dark:text-pink-400">
                        Current Album
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={groupsLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-gray-800 border-pink-400 dark:border-pink-600 text-gray-800 dark:text-gray-200 focus:ring-pink-500">
                            <SelectValue placeholder="Select an album" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 border-pink-400 dark:border-pink-600 text-gray-800 dark:text-gray-200">
                          <SelectItem
                            value="ungrouped"
                            className="hover:bg-pink-100 dark:hover:bg-pink-900"
                          >
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4" />
                              <span>Ungrouped</span>
                            </div>
                          </SelectItem>
                          {groups.map((group) => (
                            <SelectItem
                              key={group.id}
                              value={group.id}
                              className="hover:bg-pink-100 dark:hover:bg-pink-900"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="h-4 w-4 text-pink-500" />
                                  <span>{group.name}</span>
                                </div>
                                {group.imageCount && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200"
                                  >
                                    {group.imageCount}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex-1 flex flex-col justify-end">
                  {!showCreateGroup ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateGroup(true)}
                      className="w-full bg-transparent text-pink-600 border-pink-400 hover:bg-pink-100 dark:text-pink-400 dark:border-pink-600 dark:hover:bg-pink-900 transition-transform duration-200 hover:scale-105 btn-light dark:btn-light"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Album
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Album name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCreateGroup();
                          }
                        }}
                        className="bg-white dark:bg-gray-800 border-pink-400 dark:border-pink-600 text-gray-800 dark:text-gray-200 focus:ring-pink-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateGroup}
                        disabled={isCreating || !newGroupName.trim()}
                        className={`bg-pink-500 text-white hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 transition-transform duration-200 hover:scale-105 ${
                          isCreating ? "cursor-not-allowed" : ""
                        } btn-light dark:btn-light`}
                      >
                        {isCreating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateGroup(false)}
                        className="border-pink-400 text-pink-600 hover:bg-pink-100 dark:border-pink-600 dark:text-pink-400 dark:hover:bg-pink-900 transition-transform duration-200 hover:scale-105"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-pink-300 dark:bg-pink-700" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-pink-500" />
                <h3 className="text-sm font-medium text-pink-600 dark:text-pink-400">
                  Tags
                </h3>
              </div>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200 hover:bg-pink-300 dark:hover:bg-pink-700 transition-colors duration-200"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white dark:bg-gray-800 border-pink-400 dark:border-pink-600 text-gray-800 dark:text-gray-200 focus:ring-pink-500"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={
                    !tagInput.trim() ||
                    selectedTags.includes(tagInput.trim().toLowerCase())
                  }
                  className="bg-pink-500 text-white hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 transition-transform duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-secondary-foreground dark:text-secondary-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-pink-500" />
                <span>
                  Created: {new Date(image.createdAt).toLocaleDateString()}
                </span>
              </div>
              {image.metadata?.size && (
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-pink-500" />
                  <span>Size: {formatFileSize(image.metadata.size)}</span>
                </div>
              )}
              {image.metadata?.width && image.metadata?.height && (
                <div className="flex items-center gap-2">
                  <Maximize className="h-4 w-4 text-pink-500" />
                  <span>
                    Dimensions: {image.metadata.width} × {image.metadata.height}
                  </span>
                </div>
              )}
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
            className="border-pink-400 text-pink-600 hover:bg-pink-100 dark:border-pink-600 dark:text-pink-400 dark:hover:bg-pink-900 transition-transform duration-200 hover:scale-105 btn-light dark:btn-light"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isUpdating}
            className="bg-pink-500 text-white hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 transition-transform duration-200 hover:scale-105 btn-light dark:btn-light"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Memory"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
