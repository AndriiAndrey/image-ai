import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import Header from '@/components/shared/Header';
import TransformationForms from '@/components/shared/TransformationForms';
import { transformationTypes } from '@/constants';
import { getUserById } from '@/lib/actions/user.actions';
import { SearchParamProps, TransformationTypeKey } from '@/types';

const AddTransformationTypePage = async ({ params: { type } }: SearchParamProps) => {
  const { userId: clerkId } = auth();

  if (!clerkId) redirect('/sign-in');

  const user = await getUserById(clerkId);

  const transformation = transformationTypes[type];

  return (
    <>
      <Header title={transformation.title} subTitle={transformation.subTitle}></Header>

      <section className="mt-10">
        <TransformationForms
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;
