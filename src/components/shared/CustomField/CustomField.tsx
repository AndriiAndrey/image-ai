import React, { FC } from 'react';

import { Control } from 'react-hook-form';
import { z } from 'zod';

import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { formSchema } from '@/components/shared/TransformationForms';

type CustomFieldProps = {
  control: Control<z.infer<typeof formSchema>> | undefined;
  render: (props: { field: any }) => React.ReactNode;
  name: keyof z.infer<typeof formSchema>;
  formLabel?: string;
  className?: string;
};

const CustomField: FC<CustomFieldProps> = ({ control, render, name, formLabel, className }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {formLabel && <FormLabel>{formLabel}</FormLabel>}
          <FormControl>{render({ field })}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomField;
