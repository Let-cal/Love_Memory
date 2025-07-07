// components/image-gallery/DeleteConfirmationDialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageDataProps } from "@/types/types";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  image: ImageDataProps | null;
  isDeleting: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  image,
  isDeleting,
}: DeleteConfirmationDialogProps) {
  if (!image) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px] content-card-light dark:content-card-light content-card-hover-light">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            Delete Photo
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Are you sure you want to delete {image.caption || "this photo"}?
            <br />
            <br />
            <span className="text-red-500 font-bold">
              This action cannot be undone.
            </span>{" "}
            The photo will be permanently removed from your gallery and cloud
            storage.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            disabled={isDeleting}
            className="sm:mr-2"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Photo"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
