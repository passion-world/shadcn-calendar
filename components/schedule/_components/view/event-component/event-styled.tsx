'use client';

import React from 'react';
import { Chip } from '@nextui-org/chip';

import { Event } from '@/providers/schedular-provider';
import { useModalContext } from '@/providers/modal-provider';
import AddEventModal from '@/components/schedule/_modals/add-event-modal';
import { CustomEventModal } from '@/types/schedular-viewer';
// Function to format date
const formatDate = (date: Date) => {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

interface EventStyledProps extends Event {
  minmized?: boolean;
  CustomEventComponent?: React.FC<Event>;
}

export default function EventStyled({
  event,
  CustomEventModal
}: {
  event: EventStyledProps;
  CustomEventModal?: CustomEventModal;
}) {
  const { showModal: showEventModal } = useModalContext();

  // Handler function
  function handleEditEvent(event: Event) {
    // console.log("Edit event", event);

    showEventModal({
      title: event?.title,
      body: (
        <AddEventModal
          CustomAddEventModal={
            CustomEventModal?.CustomAddEventModal?.CustomForm
          }
        />
      ),
      getter: async () => {
        return { ...event };
      },
      id: undefined
    });
  }

  return (
    <div
      key={event?.id}
      className="w-full  use-automation-zoom-in cursor-pointer border border-default-400/60 rounded-md overflow-hidden flex flex-col flex-grow "
      onClickCapture={(e) => {
        e.stopPropagation(); // Stop event from propagating to parent
        handleEditEvent({
          id: event?.id,
          title: event?.title,
          startDate: event?.startDate,
          endDate: event?.endDate,
          description: event?.description,
          variant: event?.variant
        });
      }}
    >
      {event.CustomEventComponent ? (
        <event.CustomEventComponent {...event} />
      ) : (
        <Chip
          className={`min-w-full items-start p-0 flex-grow border-none flex-col flex ${event?.minmized ? 'h-full' : 'min-h-fit p-1'} rounded-md`}
          classNames={{ content: 'p-0' }}
          color="secondary"
          variant="flat"
        >
          <div className="absolute left-1 transform translate-y-0.5 h-3/4 w-[3px] rounded-lg bg-secondary-400" />
          <div
            className={`flex ${event?.minmized ? 'p-0' : 'p-1'} flex-col flex-grow px-1 rounded-md items-start w-full`}
          >
            <h1
              className={`${event?.minmized && 'text-[0.7rem] p-0 px-2'} font-semibold line-clamp-1`}
            >
              {event?.title}
            </h1>

            <p className="text-[0.65rem]">{event?.description}</p>
            {!event?.minmized && (
              <div className="flex justify-between w-full">
                <p className="text-sm">{formatDate(event?.startDate)}</p>
                <p className="text-sm">-</p>
                <p className="text-sm">{formatDate(event?.endDate)}</p>
              </div>
            )}
          </div>
        </Chip>
      )}
    </div>
  );
}
