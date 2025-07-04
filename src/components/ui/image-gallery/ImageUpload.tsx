"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImageUpload } from "@/hooks/image-gallery/useImageUpload";
import { cn } from "@/lib/utils";
import { ImageGroupProps } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";



interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "device" | "url";
  selectedGroup?: string;
  availableGroups: ImageGroupProps[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

// Validation schemas
const uploadFormSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
  groupId: z.string().optional(),
  caption: z
    .string()
    .max(500, "Caption must be less than 500 characters")
    .optional(),
  tags: z.string().optional(),
});

const urlUploadSchema = z.object({
  imageUrl: z.string().url("Please enter a valid URL"),
  groupId: z.string().optional(),
  caption: z
    .string()
    .max(500, "Caption must be less than 500 characters")
    .optional(),
  tags: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;
type UrlUploadFormData = z.infer<typeof urlUploadSchema>;

// Sub-components
const UploadDropzone = ({
  getRootProps,
  getInputProps,
  isDragActive,
  isUploading,
  maxFiles,
  maxFileSize,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRootProps: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getInputProps: () => any;
  isDragActive: boolean;
  isUploading: boolean;
  maxFiles: number;
  maxFileSize: number;
}) => (
  <div
    {...getRootProps()}
    className={cn(
      "p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors",
      isDragActive ? "border-pink-400 bg-pink-500/10" : "border-slate-600",
      isUploading && "pointer-events-none opacity-50"
    )}
  >
    <input {...getInputProps()} aria-label="File upload input" />
    <Cloud className="h-8 w-8 mx-auto text-slate-300" />
    <p className="text-lg text-white mt-2">
      {isDragActive ? "Drop files here" : "Drag & drop images here"}
    </p>
    <p className="text-sm text-slate-400">
      or click to browse • Max {maxFiles} files • {maxFileSize}MB each
    </p>
  </div>
);

// Individual File Item Component
const FileItem = ({
  file,
  index,
  onRemove,
  formatFileSize,
}: {
  file: File;
  index: number;
  onRemove: (index: number) => void;
  formatFileSize: (bytes: number) => string;
}) => (
  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800/70 transition-colors">
    <div className="flex-shrink-0">
      <ImageIcon className="h-5 w-5 text-slate-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-white truncate font-medium" title={file.name}>
        {file.name}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">
        {formatFileSize(file.size)}
      </p>
    </div>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => onRemove(index)}
      className="flex-shrink-0 h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
);

// Pagination Controls Component
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex items-center justify-between">
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="flex items-center gap-1 text-primary-foreground bg-primary border-slate-600 hover:bg-accent hover:text-accent-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
      Previous
    </Button>

    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-300">
        Page {currentPage} of {totalPages}
      </span>
    </div>

    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="flex items-center gap-1 text-primary-foreground bg-primary border-slate-600 hover:bg-accent hover:text-accent-foreground"
    >
      Next
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
);

// Updated File Preview List with Pagination
const FilePreviewList = ({
  files,
  onRemove,
  formatFileSize,
  itemsPerPage = 4,
}: {
  files: File[];
  onRemove: (index: number) => void;
  formatFileSize: (bytes: number) => string;
  itemsPerPage?: number;
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { paginatedFiles, totalPages, startIndex } = useMemo(() => {
    const totalPages = Math.ceil(files.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedFiles = files.slice(startIndex, startIndex + itemsPerPage);

    return { paginatedFiles, totalPages, startIndex };
  }, [files, currentPage, itemsPerPage]);

  // Reset to first page if current page becomes invalid
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const handleRemove = (localIndex: number) => {
    const actualIndex = startIndex + localIndex;
    onRemove(actualIndex);

    // If we removed the last item on the current page and we're not on page 1
    if (paginatedFiles.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">
          Selected Files ({files.length})
        </h4>
        {totalPages > 1 && (
          <span className="text-xs text-slate-400">
            Showing {Math.min(startIndex + 1, files.length)}-
            {Math.min(startIndex + itemsPerPage, files.length)} of{" "}
            {files.length}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {paginatedFiles.map((file, localIndex) => (
          <FileItem
            key={`${file.name}-${startIndex + localIndex}`}
            file={file}
            index={localIndex}
            onRemove={handleRemove}
            formatFileSize={formatFileSize}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StatusDisplay = ({ status }: { status: any }) => (
  <>
    {status.isUploading && (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Uploading...</span>
          <span>{status.progress}%</span>
        </div>
        <Progress value={status.progress} className="h-2" />
      </div>
    )}
    {status.error && (
      <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <span className="text-red-300 text-sm">{status.error}</span>
      </div>
    )}
    {status.success && (
      <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
        <CheckCircle className="h-4 w-4 text-green-400" />
        <span className="text-green-300 text-sm">
          Upload completed successfully!
        </span>
      </div>
    )}
  </>
);

export default function ImageUploadDialog({
  isOpen,
  onClose,
  onSuccess,
  mode,
  selectedGroup,
  availableGroups,
  maxFiles = 10,
  maxFileSize = 10,
}: ImageUploadDialogProps) {
  const { uploadFiles, uploadFromUrl, status, resetStatus } = useImageUpload();

  // State
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [urlPreview, setUrlPreview] = useState<string>("");

  // Form setup
  const uploadForm = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      files: [],
      groupId: selectedGroup || "",
      caption: "",
      tags: "",
    },
  });

  const urlForm = useForm<UrlUploadFormData>({
    resolver: zodResolver(urlUploadSchema),
    defaultValues: {
      imageUrl: "",
      groupId: selectedGroup || "",
      caption: "",
      tags: "",
    },
  });

  // File validation
  const validateFiles = useCallback(
    (files: File[]) => {
      const errors: string[] = [];
      const maxSizeBytes = maxFileSize * 1024 * 1024;
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      if (files.length > maxFiles)
        errors.push(`Maximum ${maxFiles} files allowed`);
      files.forEach((file, index) => {
        if (!allowedTypes.includes(file.type))
          errors.push(
            `File ${index + 1}: Unsupported file type (${file.type})`
          );
        if (file.size > maxSizeBytes)
          errors.push(
            `File ${index + 1}: File too large (max ${maxFileSize}MB)`
          );
      });
      return errors;
    },
    [maxFiles, maxFileSize]
  );

  // Dropzone setup
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles
          .map((file) => file.errors.map((error) => error.message).join(", "))
          .join("\n");
        toast.error("Upload Error", { description: errors });
        return;
      }

      const validationErrors = validateFiles(acceptedFiles);
      if (validationErrors.length > 0) {
        toast.error("Validation Error", {
          description: validationErrors.join("\n"),
        });
        return;
      }

      setPreviewFiles(acceptedFiles);
      uploadForm.setValue("files", acceptedFiles);
    },
    [uploadForm, validateFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"] },
    maxFiles,
    maxSize: maxFileSize * 1024 * 1024,
    disabled: status.isUploading,
  });

  // Handle URL preview
  const handleUrlChange = useCallback((url: string) => {
    setUrlPreview("");
    if (url && z.string().url().safeParse(url).success) {
      setUrlPreview(url);
    }
  }, []);

  // File upload handler
  const handleFileUpload = async (data: UploadFormData) => {
    try {
      resetStatus();
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];
      const fileList = Object.assign(data.files, {
        item: (index: number) => data.files[index] || null,
        length: data.files.length,
      }) as FileList;

      await uploadFiles(fileList, {
        caption: data.caption,
        groupId: data.groupId || undefined,
        tags,
        onSuccess: (images) => {
          toast.success("Upload Successful", {
            description: `Successfully uploaded ${images.length} image(s)`,
          });
          onSuccess(); // Trigger onSuccess to close dialog and refresh gallery
          handleReset();
        },
        onError: (error) =>
          toast.error("Upload Failed", { description: error }),
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload Error", {
        description: "An unexpected error occurred",
      });
    }
  };

  // URL upload handler
  const handleUrlUpload = async (data: UrlUploadFormData) => {
    try {
      resetStatus();
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      await uploadFromUrl(data.imageUrl, {
        caption: data.caption,
        groupId: data.groupId || undefined,
        tags,
        onSuccess: () => {
          toast.success("Upload Successful", {
            description: "Successfully uploaded image from URL",
          });
          onSuccess(); // Trigger onSuccess to close dialog and refresh gallery
          handleReset();
        },
        onError: (error) =>
          toast.error("Upload Failed", { description: error }),
      });
    } catch (error) {
      console.error("URL upload error:", error);
      toast.error("Upload Error", {
        description: "An unexpected error occurred",
      });
    }
  };

  // Reset handler
  const handleReset = () => {
    setPreviewFiles([]);
    setUrlPreview("");
    uploadForm.reset();
    urlForm.reset();
    resetStatus();
  };

  // Remove file from preview
  const removeFile = (index: number) => {
    const newFiles = previewFiles.filter((_, i) => i !== index);
    setPreviewFiles(newFiles);
    uploadForm.setValue("files", newFiles);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "device" ? "Upload from Device" : "Add from URL"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-4">
          <StatusDisplay status={status} />

          {mode === "device" && (
            <Form {...uploadForm}>
              <form
                onSubmit={uploadForm.handleSubmit(handleFileUpload)}
                className="space-y-6"
              >
                <FormField
                  control={uploadForm.control}
                  name="files"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-white">Upload Files</FormLabel>
                      <FormControl>
                        <UploadDropzone
                          getRootProps={getRootProps}
                          getInputProps={getInputProps}
                          isDragActive={isDragActive}
                          isUploading={status.isUploading}
                          maxFiles={maxFiles}
                          maxFileSize={maxFileSize}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {previewFiles.length > 0 && (
                  <FilePreviewList
                    files={previewFiles}
                    onRemove={removeFile}
                    formatFileSize={formatFileSize}
                    itemsPerPage={4}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={uploadForm.control}
                    name="groupId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Album</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="bg-slate-800 text-white">
                              <SelectValue placeholder="Select album (optional)" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 text-white">
                              {availableGroups.map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                  {group.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={uploadForm.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Caption</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter caption (optional)"
                            className="bg-slate-800 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={uploadForm.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tags</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter tags separated by commas"
                          className="bg-slate-800 text-white"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        Separate multiple tags with commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={status.isUploading || previewFiles.length === 0}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    {status.isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {previewFiles.length} Image
                        {previewFiles.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    className="text-primary-foreground bg-primary border-slate-600 hover:bg-accent hover:text-accent-foreground"
                    variant="outline"
                    onClick={handleReset}
                    disabled={status.isUploading}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {mode === "url" && (
            <Form {...urlForm}>
              <form
                onSubmit={urlForm.handleSubmit(handleUrlUpload)}
                className="space-y-6"
              >
                <FormField
                  control={urlForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Image URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          className="bg-slate-800 text-white"
                          onChange={(e) => {
                            field.onChange(e);
                            handleUrlChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {urlPreview && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white">Preview</h4>
                    <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden">
                      <Image
                        src={urlPreview}
                        alt="URL Preview"
                        fill
                        className="object-cover"
                        onError={() => setUrlPreview("")}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={urlForm.control}
                    name="groupId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Album</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="bg-slate-800 text-white">
                              <SelectValue placeholder="Select album (optional)" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 text-white">
                              {availableGroups.map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                  {group.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={urlForm.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Caption</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter caption (optional)"
                            className="bg-slate-800 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={urlForm.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tags</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter tags separated by commas"
                          className="bg-slate-800 text-white"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        Separate multiple tags with commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={
                      status.isUploading || !urlForm.getValues("imageUrl")
                    }
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    {status.isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={status.isUploading}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
