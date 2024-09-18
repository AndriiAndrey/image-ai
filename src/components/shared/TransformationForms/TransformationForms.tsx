'use client';

import { FC, useEffect, useState, useTransition } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { getCldImageUrl } from 'next-cloudinary';

import TransformedImage from '../TransformedImage';
import MediaUploader from '@/components/shared/MediaUploader';
import CustomField from '@/components/shared/CustomField';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { AspectRatioKey, debounce, deepMergeObjects } from '@/lib/utils';
import { updateCredits } from '@/lib/actions/user.actions';
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from '@/constants';
import { addImage, updateImage } from '@/lib/actions/image.actions';
import { TransformationFormProps, Transformations } from '@/types';
import InsufficientCreditsModal from '../InsufficientCreditsModal';

export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string().optional(),
});

const TransformationForms: FC<TransformationFormProps> = (props) => {
  const { data = null, action, type, userId, creditBalance, config = null } = props;

  const [image, setImage] = useState(data);
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const initialValue =
    data && action === 'Update'
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
        }
      : defaultValues;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValue,
  });

  const transformation = transformationTypes[type];

  async function onSubmit(formData: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    if (data || image) {
      const transformationURL = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId || '',
        ...transformationConfig,
      });

      const imageData = {
        title: formData.title,
        publicId: image?.publicId || '',
        transformationType: type,
        width: image?.width || 0,
        height: image?.height || 0,
        config: transformationConfig,
        secureURL: image?.secureURL || '',
        transformationURL,
        aspectRatio: formData?.aspectRatio,
        prompt: formData.prompt,
        color: formData.color,
      };

      if (action === 'Add') {
        try {
          const newImage = await addImage({
            image: imageData,
            userId,
            path: '/',
          });

          if (newImage) {
            form.reset();
            setImage(data);
            router.push(`/transformations/${newImage._id}`);
          }
        } catch (err) {
          console.log('Error', err);
        }
      }

      if (action === 'Update') {
        try {
          const updatedImage = await updateImage({
            image: { ...imageData, _id: data!._id },
            userId,
            path: `/transformations/${data!._id}`,
          });

          if (updatedImage) {
            router.push(`/transformations/${updatedImage._id}`);
          }
        } catch (err) {
          console.log('Error', err);
        }
      }
    }

    setIsSubmitting(false);
  }

  function onSelect(value: string, onChange: (value: string) => void) {
    const imageSize = aspectRatioOptions[value as AspectRatioKey];

    setImage((prev: any) => ({
      ...prev,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }));

    setNewTransformation(transformation.config);

    return onChange(value);
  }

  function onInputChange(
    field: string,
    value: string,
    type: 'remove' | 'recolor',
    onChange: (value: string) => void,
  ) {
    debounce(() => {
      setNewTransformation((prev: any) => ({
        ...prev,
        [type]: {
          ...prev?.[type],
          [field === 'prompt' ? 'prompt' : 'to']: value,
        },
      }));
    }, 1000)();

    return onChange(value);
  }

  async function onTransform() {
    setIsTransforming(true);

    setTransformationConfig(deepMergeObjects(newTransformation, transformationConfig));

    setNewTransformation(null);

    startTransition(async () => {
      await updateCredits(userId, creditFee);
    });
  }

  useEffect(() => {
    if (image && (type === 'restore' || type === 'removeBackground')) {
      setNewTransformation(transformation.config);
    }
  }, [image, transformation.config, type]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}

        <CustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />

        {type === 'fill' && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) => onSelect(value, field.onChange)}
                value={field.value}
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((ratio) => (
                    <SelectItem key={ratio} value={ratio} className="select-item">
                      {aspectRatioOptions[ratio as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}

        {(type === 'remove' || type === 'recolor') && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={type === 'remove' ? 'Object to remove' : 'Object to recover'}
              className="w-full"
              render={({ field }) => (
                <Input
                  value={field.value}
                  className="input-field"
                  onChange={(e) => onInputChange('prompt', e.target.value, type, field.onChange)}
                />
              )}
            />
          </div>
        )}

        {type === 'recolor' && (
          <CustomField
            control={form.control}
            name="color"
            formLabel="Replacement Color"
            render={({ field }) => (
              <Input
                value={field.value}
                className="input-field"
                onChange={(e) => onInputChange('color', e.target.value, type, field.onChange)}
              />
            )}
          />
        )}

        <div className="media-uploader-field">
          <CustomField
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader
                onChange={field.onChange}
                setImage={setImage}
                publicId={field.value}
                image={image}
                type={type}
              />
            )}
          />

          <TransformedImage
            image={image}
            type={type}
            title={form.getValues().title}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}
            transformationConfig={transformationConfig}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            className="submit-button capitalize"
            disabled={isTransforming || newTransformation === null}
            onClick={onTransform}
          >
            {isTransforming ? 'Transforming ...' : 'Apply Transformation'}
          </Button>
          <Button type="submit" className="submit-button capitalize" disabled={isSubmitting}>
            {isSubmitting ? 'Subnitting' : 'Save Image'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransformationForms;
