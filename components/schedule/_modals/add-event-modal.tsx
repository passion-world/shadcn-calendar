'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Input, Textarea } from '@nextui-org/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

import { useModalContext } from '@/providers/modal-provider';
import SelectDate from '@/components/schedule/_components/add-event-components/select-date';
import {
  EventFormData,
  eventSchema,
  useScheduler
} from '@/providers/schedular-provider';
import { Event } from '@/providers/schedular-provider';

export default function AddEventModal({
  CustomAddEventModal
}: {
  CustomAddEventModal?: React.FC<{ register: any; errors: any }>;
}) {
  const { onClose, data } = useModalContext();
  const typedData = data as Event;
  const { handlers } = useScheduler();

  const {
    register,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '', // Initial title is an empty string
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      variant: data?.variant || 'primary',
      color: data?.color || 'blue'
    }
  });

  // State to hold the ID of the added event
  const [eventId, setEventId] = useState<string>('');
  // Ref to check if the event has been added
  const eventAddedRef = useRef(false);

  // Reset the form on initialization and create a new event in month view
  useEffect(() => {
    if (data) {
      reset({
        title: data.title,
        description: data.description || '',
        startDate: data.startDate,
        endDate: data.endDate,
        variant: data.variant || 'primary',
        color: data.color || 'blue'
      });
      if (!eventAddedRef.current && !data.title) {
        const newEvent: Event = {
          id: uuidv4(),
          title: 'New Event',
          startDate: data.startDate,
          endDate: data.endDate,
          variant: data.variant || 'primary',
          description: data.description || ''
        };

        handlers.handleAddEvent(newEvent);
        setEventId(newEvent.id);
        setValue('title', '');
        eventAddedRef.current = true;
      }
    }
  }, [data, reset, handlers]); // Include handlers to prevent potential stale closure

  // Watch for title changes
  const title = watch('title');

  // Update the event title when the title changes
  useEffect(() => {
    if (eventId && title) {
      const updatedEvent: Event = {
        ...typedData,
        id: eventId || 'temp', // Use the stored event ID
        title
      };

      handlers.handleUpdateEvent(updatedEvent, eventId);
    }
  }, [title, eventId, typedData, handlers]);

  // useEffect(() => {
  //   if (!eventId) {
  //     const updatedEvent: Event = {
  //       ...typedData,
  //       id: data.id || 'temp', // Use the stored event ID
  //       title,
  //       description: 'a',
  //       variant: data?.variant || 'secondary'
  //     };

  //     // handlers.handleUpdateEvent(updatedEvent, data.id);
  //   }
  // }, [title, eventId, typedData, handlers]);

  return (
    <form className="flex flex-col gap-3">
      {CustomAddEventModal ? (
        CustomAddEventModal({ register, errors })
      ) : (
        <>
          <Input
            {...register('title')}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            // autoFocus
            errorMessage={errors.title?.message}
            isInvalid={!!errors.title}
            placeholder="New Event" // Placeholder for the title input
            onChange={(e) => {
              const newValue = e.target.value;

              setValue('title', newValue); // Update the form state
            }}
          />
          <Textarea
            {...register('description')}
            label="Description"
            placeholder="Enter event description"
            variant="bordered"
          />
          <SelectDate data={data} setValue={() => {}} />
          {/* Add Dropdown here if needed */}
        </>
      )}
    </form>
  );
}
