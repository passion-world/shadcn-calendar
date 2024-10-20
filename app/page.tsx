'use client';

import SchedulerWrapper from '@/components/schedule/_components/view/schedular-view-filteration';
import { Event, SchedulerProvider } from '@/providers/schedular-provider';

export default function Home() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-4 py-8 md:py-10 px-[100px]">
      <SchedulerProvider>
        <SchedulerWrapper />
      </SchedulerProvider>
    </section>
  );
}

function CustomDayTab() {
  return <div className="">my Day tab</div>;
}

const CustomEventStyled: React.FC<Event> = (event, customData) => {
  return (
    <div>
      {event?.title} {event?.variant}
    </div>
  );
};

const MyCustomForm: React.FC<{ register: any; errors: any }> = ({
  register,
  errors
}) => (
  <>
    <input
      {...register('title')}
      className={`input ${errors.title ? 'input-error' : ''}`}
      placeholder="Custom Event Name"
    />
    {errors.title && (
      <span className="error-message">{errors.title.message}</span>
    )}

    <textarea
      {...register('description')}
      className="textarea"
      placeholder="Custom Description"
    />

    <input
      {...register('startDate')}
      className={`input ${errors.startDate ? 'input-error' : ''}`}
      type="date"
    />

    <input
      {...register('endDate')}
      className={`input ${errors.endDate ? 'input-error' : ''}`}
      type="date"
    />

    <button className="btn" type="submit">
      Submit
    </button>
  </>
);
