import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, User } from 'lucide-react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { isApiError, useAuth } from '../context/AuthContext';
import {
  resolvePhotoSrc,
  updateProfilePhoto,
  uploadProfilePhotoFile,
  validateProfilePhotoFile,
} from '../lib/profile';

const sizeClasses = {
  sm: {
    wrap: 'w-9 h-9',
    icon: 'w-4 h-4',
    camera: 'p-1',
    cameraIcon: 'w-2.5 h-2.5',
  },
  md: {
    wrap: 'w-12 h-12',
    icon: 'w-6 h-6',
    camera: 'p-1.5',
    cameraIcon: 'w-3 h-3',
  },
  lg: {
    wrap: 'w-20 h-20',
    icon: 'w-10 h-10',
    camera: 'p-1.5',
    cameraIcon: 'w-3.5 h-3.5',
  },
} as const;

type ProfileAvatarSize = keyof typeof sizeClasses;

type ProfileAvatarProps = {
  photoUrl?: string;
  name?: string;
  size?: ProfileAvatarSize;
  showChangePhoto?: boolean;
  className?: string;
  onPhotoUpdated?: (photoUrl: string) => void;
};

export function ProfileAvatar({
  photoUrl = '',
  name = 'User',
  size = 'md',
  showChangePhoto = true,
  className,
  onPhotoUpdated,
}: ProfileAvatarProps) {
  const { refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const sizes = sizeClasses[size];
  const avatarSrc = resolvePhotoSrc(photoUrl);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    setFilePreview('');
    setError('');
  };

  useEffect(() => {
    return () => {
      if (filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const resetDialogState = () => {
    setUrlInput(photoUrl);
    setSelectedFile(null);
    if (filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview('');
    setError('');
  };

  const openDialog = () => {
    resetDialogState();
    setUrlInput(photoUrl);
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetDialogState();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateProfilePhotoFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
      setFilePreview('');
      return;
    }

    setError('');
    setSelectedFile(file);
    if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    setFilePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSave = async () => {
    setIsUpdating(true);
    setError('');

    try {
      let result: { photoUrl: string };

      if (selectedFile) {
        result = await uploadProfilePhotoFile(selectedFile);
      } else {
        const trimmed = urlInput.trim();
        if (!trimmed) {
          setError('Choose an image file or enter a URL.');
          setIsUpdating(false);
          return;
        }
        result = await updateProfilePhoto(trimmed);
      }

      await refreshProfile();
      onPhotoUpdated?.(result.photoUrl);
      setDialogOpen(false);
      resetDialogState();
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to update photo.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className={cn('relative shrink-0', className)}>
        <div
          className={cn(
            sizes.wrap,
            'rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden',
          )}
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt={name} className="h-full w-full object-cover" />
          ) : (
            <User className={cn(sizes.icon, 'text-primary')} />
          )}
        </div>
        {showChangePhoto && (
          <button
            type="button"
            onClick={openDialog}
            className={cn(
              'absolute -bottom-0.5 -right-0.5 rounded-full bg-primary text-primary-foreground border-2 border-background hover:bg-primary/90 transition-colors',
              sizes.camera,
            )}
            aria-label="Change profile photo"
            title="Change photo"
          >
            <Camera className={sizes.cameraIcon} />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change profile photo</DialogTitle>
            <DialogDescription>
              Upload an image from your computer or paste a link (PNG, JPG, WebP, or GIF, max 5 MB).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                {filePreview || avatarSrc ? (
                  <img
                    src={filePreview || avatarSrc}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
              >
                <Upload className="w-4 h-4" />
                {selectedFile ? 'Change file' : 'Upload from computer'}
              </Button>
              {selectedFile ? (
                <div className="flex flex-col items-center gap-1 max-w-full px-2">
                  <p className="text-xs text-muted-foreground text-center truncate max-w-full">
                    {selectedFile.name}
                  </p>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={clearSelectedFile}
                    disabled={isUpdating}
                  >
                    Remove file
                  </button>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or paste URL</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-photo-url">Image URL</Label>
              <Input
                id="profile-photo-url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                disabled={isUpdating || !!selectedFile}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save photo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
