import React, { FC } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { dataUrl, debounce, getImageSize } from '@/lib/utils';
import { CldImage } from 'next-cloudinary';
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props';
import { TransformedImageProps } from '@/types';

const TransformedImage: FC<TransformedImageProps> = (props) => {
  const {
    image,
    isTransforming,
    setIsTransforming,
    title,
    transformationConfig,
    type,
    hasDownload = true,
  } = props;

  function onDownload() {}

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h3 className="h3-bold text-dark-600">Transformed</h3>

        {hasDownload && (
          <Button type="button" variant="ghost" size="icon" onClick={onDownload}>
            <Image src="/assets/icons/download.svg" alt="Download" width={24} height={24} />
          </Button>
        )}
      </div>
      {image?.publicId && transformationConfig ? (
        <div className="relative">
          <CldImage
            width={getImageSize(type, image, 'width')}
            height={getImageSize(type, image, 'height')}
            src={image?.publicId}
            alt={image?.title || title}
            sizes={'(max-width: 767px) 100vw, 50vw'}
            placeholder={dataUrl as PlaceholderValue}
            className="transformed-image"
            onLoad={() => {
              setIsTransforming?.(false);
            }}
            onError={() => {
              debounce(() => {
                setIsTransforming?.(false);
              }, 8000);
            }}
            {...transformationConfig}
          />

          {isTransforming && (
            <div className="transforming-loader">
              <Image src="/assets/icons/spinner.svg" width={50} height={50} alt="Transforming" />
            </div>
          )}
        </div>
      ) : (
        <div className="transformed-placeholder">Transformed Image</div>
      )}
    </div>
  );
};

export default TransformedImage;
