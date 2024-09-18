import { IImage } from '@/lib/database/models/image.model';

// ====== USER PARAMS
export interface CreateUserParams {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
}

export interface UpdateUserParams {
  firstName: string;
  lastName: string;
  username: string;
  photo: string;
}

// ====== IMAGE PARAMS
export interface AddImageParams {
  image: {
    title: string;
    publicId: string;
    transformationType: string;
    width: number;
    height: number;
    config: any;
    secureURL: string;
    transformationURL: string;
    aspectRatio: string | undefined;
    prompt: string | undefined;
    color: string | undefined;
  };
  userId: string;
  path: string;
}

export interface UpdateImageParams {
  image: {
    _id: string;
    title: string;
    publicId: string;
    transformationType: string;
    width: number;
    height: number;
    config: any;
    secureURL: string;
    transformationURL: string;
    aspectRatio: string | undefined;
    prompt: string | undefined;
    color: string | undefined;
  };
  userId: string;
  path: string;
}

export interface Transformations {
  restore?: boolean;
  fillBackground?: boolean;
  remove?: {
    prompt: string;
    removeShadow?: boolean;
    multiple?: boolean;
  };
  recolor?: {
    prompt?: string;
    to: string;
    multiple?: boolean;
  };
  removeBackground?: boolean;
}

// ====== TRANSACTION PARAMS
export interface CheckoutTransactionParams {
  plan: string;
  credits: number;
  amount: number;
  buyerId: string;
}

export interface CreateTransactionParams {
  stripeId: string;
  amount: number;
  credits: number;
  plan: string;
  buyerId: string;
  createdAt: Date;
}

export type TransformationTypeKey = 'restore' | 'fill' | 'remove' | 'recolor' | 'removeBackground';

// ====== URL QUERY PARAMS
export interface FormUrlQueryParams {
  searchParams: string;
  key: string;
  value: string | number | null;
}

export interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
}

export interface RemoveUrlQueryParams {
  searchParams: string;
  keysToRemove: string[];
}

export interface SearchParamProps {
  params: { id: string; type: TransformationTypeKey };
  searchParams: { [key: string]: string | string[] | undefined };
}

export interface TransformationFormProps {
  action: 'Add' | 'Update';
  userId: string;
  type: TransformationTypeKey;
  creditBalance: number;
  data?: IImage | null;
  config?: Transformations | null;
}

export interface TransformedImageProps {
  image: any;
  type: string;
  title: string;
  transformationConfig: Transformations | null;
  isTransforming: boolean;
  hasDownload?: boolean;
  setIsTransforming?: React.Dispatch<React.SetStateAction<boolean>>;
}
