'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '../database/mongoose';
import User from '@/lib/database/models/user.model';
import Image from '@/lib/database/models/image.model';
import { handleError } from '../utils';
import { redirect } from 'next/navigation';
import { AddImageParams, UpdateImageParams } from '@/types';

// Add image
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

// Update image
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

// Delete image
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

// Get image by id
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

function populateUser(query: any) {
  return query.populate({
    path: 'author',
    model: User,
    select: '_id firstName lastName',
  });
}
