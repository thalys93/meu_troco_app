"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImageIcon, XCircleIcon } from "lucide-react";
import React from "react";
import { useState } from "react";
import Dropzone from "react-dropzone";

const ImagePreview = ({
  url,
  onRemove,
  type
}: {
  url: string;
  onRemove: () => void;
  type?: string
}) => (
  <div className="relative aspect-square">
    <button
      className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
      onClick={onRemove}
    >
      <XCircleIcon className="h-5 w-5 fill-primary text-primary-foreground" />
    </button>
    <img
      src={url}      
      alt=""
      className={cn("border border-border rounded-md object-cover", type === "avatar" && "h-10 w-10")}
    />
  </div>
);

interface ImageDropzoneProps {
  label?: string;
  setFile: (file: File) => void
  initialImage?: string;
  onRemove?: () => void;
  type?: string
}

export default function ImageDropzone({ label, setFile, initialImage, onRemove, type }: ImageDropzoneProps) {
  const [imagePicture, setImagePicture] = useState<string | null>(null);

  React.useEffect(() => {
    setImagePicture(initialImage ?? null);
  }, [initialImage]);

  const handleRemove = () => {
    setImagePicture(null);
    onRemove?.();
  };

  return (
    <div className="w-auto max-w-40">
      {label && (<Label className="my-3">{label}</Label>)}
      <div className="mt-1 w-full">
        {imagePicture ? (
          <ImagePreview
            url={imagePicture}
            onRemove={() => handleRemove()}
            type={type}
          />
        ) : (
          <Dropzone
            onDrop={(acceptedFiles) => {
              const file = acceptedFiles[0];
              if (file) {
                const imageUrl = URL.createObjectURL(file);
                setImagePicture(imageUrl);
                setFile(file);
              }
            }}
            accept={{
              "image/png": [".png", ".jpg", ".jpeg", ".webp"],
            }}
            maxFiles={1}
          >
            {({
              getRootProps,
              getInputProps,
              isDragActive,
              isDragAccept,
              isDragReject,
            }) => (
              <div
                {...getRootProps()}
                className={cn(
                  "border p-10 border-dashed flex items-center justify-center hover:border-white transition-all aspect-square rounded-md focus:outline-none focus:border-primary",
                  {                    
                    "border-primary bg-secondary": isDragActive && isDragAccept,
                    "border-destructive bg-destructive/20":
                    isDragActive && isDragReject,                                        
                  }, type === "avatar" && "w-10 h-10 mb-2 p-0 border-dashed hover:border-white transition-all aspect-square rounded-md focus:outline-none focus:border-primary"
                )}
              >
                <input {...getInputProps()} id="profile" />
                <ImageIcon className={cn("h-16 w-16", type === "avatar" && "h-5")} strokeWidth={1.25} />
              </div>
            )}
          </Dropzone>
        )}
      </div>
    </div>
  );
}
