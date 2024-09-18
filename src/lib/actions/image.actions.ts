'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '../database/mongoose';
import User from '@/lib/database/models/user.model';
import Image from '@/lib/database/models/image.model';
import { handleError } from '../utils';
import { redirect } from 'next/navigation';
import { AddImageParams, UpdateImageParams } from '@/types';

import { v2 as cloudinary } from 'cloudinary';

export async function addImage({ image, path, userId }: AddImageParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);

    if (!author) {
      throw new Error('User not found');
    }

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (err) {
    handleError(err);
  }
}

export async function updateImage({ image, path, userId }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error('Image not found');
    }

    const updatedImage = await Image.findByIdAndUpdate(imageToUpdate._id, image, { new: true });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (err) {
    handleError(err);
  }
}

export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();

    await Image.findByIdAndDelete(imageId);
  } catch (err) {
    handleError(err);
  } finally {
    redirect('/');
  }
}

export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));

    if (!image) {
      throw new Error('Image not found');
    }

    return JSON.parse(JSON.stringify(image));
  } catch (err) {
    handleError(err);
  }
}

export async function getAllImages({ limit = 10, page = 1, searchQuery = '' }) {
  try {
    await connectToDatabase();

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    let expression = 'folder=image_ai';
    let query = {};

    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    const { resources } = await cloudinary.search.expression(expression).execute();

    const resourceIds = resources.map((resource: any) => resource.public_id);

    if (searchQuery) {
      query = {
        publicId: { $in: resourceIds },
      };
    }

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: 1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (err) {
    handleError(err);
  }
}

export async function getUserImages({
  limit = 10,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

function populateUser(query: any) {
  return query.populate({
    path: 'author',
    model: User,
    select: '_id firstName lastName clerkId',
  });
}
