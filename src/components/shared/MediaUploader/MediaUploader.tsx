'use client';

import React, { FC, SetStateAction } from 'react';

import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { dataUrl, getImageSize } from '@/lib/utils';
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props';
import { IImage } from '@/lib/database/models/image.model';

interface IProps {
  onChange: (value: string) => void;
  setImage: React.Dispatch<SetStateAction<IImage | null>>;
  publicId: string;
  image: IImage | null;
  type: string;
}

const MediaUploader: FC<IProps> = (props) => {
  const { image, onChange, publicId, setImage, type } = props;

  const { toast } = useToast();

  function onSuccess(result: any) {
    setImage((prevState: any) => ({
      ...prevState,
      publicId: result?.info?.public_id,
      width: result?.info?.width,
      height: result?.info?.height,
      secureURL: result?.info?.secure_url,
    }));

    onChange(result?.info?.public_id);

    toast({
      title: 'Image uploaded successfully',
      description: '1 credit was deducted from your account',
      duration: 5000,
      className: 'success-toast',
    });
  }

  function onError(result: any) {
    toast({
      title: 'Something went wrong while uploading',
      description: 'Please try again',
      duration: 5000,
      className: 'error-toast',
    });
  }

  return (
    <CldUploadWidget
      uploadPreset="image_ai"
      options={{ multiple: false, resourceType: 'image' }}
      onSuccess={onSuccess}
      onError={onError}
    >
      {({ open }) => (
        <div className="flex flex-col gap-4">
          <h3 className="h3-bold text-dark-600">Original</h3>

          {publicId ? (
            <div className="cursor-pointer overflow-hidden rounded-[10px]">
              <CldImage
                width={getImageSize(type, image, 'width')}
                height={getImageSize(type, image, 'height')}
                src={publicId}
                alt="image"
                sizes={'(max-width: 767px) 100vw, 50vw'}
                placeholder={dataUrl as PlaceholderValue}
                className="media-uploader_cldImage"
              />
            </div>
          ) : (
            <div className="media-uploader_cta" onClick={() => open()}>
              <div className="media-uploader_cta-image">
                <Image src="/assets/icons/add.svg" alt="add image" width={24} height={24} />
              </div>
              <p className="p-14-medium">Click here to upload image</p>
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
};

export default MediaUploader;
