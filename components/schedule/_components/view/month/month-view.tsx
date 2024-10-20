'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@nextui-org/button';
import { Card } from '@nextui-org/card';
import { Chip } from '@nextui-org/chip';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

import EventStyled from '../event-component/event-styled';

import { Event, useScheduler } from '@/providers/schedular-provider';
import { useModalContext } from '@/providers/modal-provider';
import AddEventModal from '@/components/schedule/_modals/add-event-modal';
import ShowMoreEventsModal from '@/components/schedule/_modals/show-more-events-modal';
import { CustomEventModal } from '@/types/schedular-viewer';

export default function MonthView({
  prevButton,
  nextButton,
  CustomEventComponent,
  CustomEventModal,
  classNames
}: {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  classNames?: { prev?: string; next?: string; addEvent?: string };
}) {
  // Start week on Sunday
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const { getters, state } = useScheduler();
  const { showModal } = useModalContext();

  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = getters.getDaysInMonth(
    currentDate.getMonth(),
    currentDate.getFullYear()
  );

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay(); // This will give the day index (0 = Sunday, 1 = Monday, etc.)

  const previousMonthDays = getters.getDaysInMonth(
    currentDate.getMonth() - 1,
    currentDate.getFullYear()
  );

  const handlePrevMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );

    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );

    setCurrentDate(newDate);
  };

  function handleAddEvent(selectedDay?: number) {
    const gridColumns = 7; // Assuming a 7-column calendar grid

    // Find the position of the selected day in the grid (index in the array)
    const dayIndex = selectedDay
      ? firstDayOfMonth + selectedDay - 1
      : firstDayOfMonth;

    // Calculate row and column
    const row = Math.floor(dayIndex / gridColumns);
    const column = dayIndex % gridColumns;

    // Determine modal position based on day position (top-left, top-right, etc.)
    let x, y;

    if (row < 3) {
      // Top rows (display modal below)
      y = -1000;
      if (column < 3) {
        // Left side (display modal on the right)
        x = 500;
      } else {
        // Right side (display modal on the left)
        x = -500;
      }
    } else {
      // Bottom rows (display modal above)
      y = -600;
      if (column < 3) {
        // Left side (display modal on the right)
        x = 500;
      } else {
        // Right side (display modal on the left)
        x = -500;
      }
    }

    showModal({
      title: 'Add Event',
      body: <AddEventModal />,
      getter: async () => {
        const startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          selectedDay ?? 1,
          0,
          0,
          0,
          0
        );
        const endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          selectedDay ?? 1,
          23,
          59,
          59,
          999
        );

        return { startDate, endDate };
      },
      id: undefined,
      x, // Pass x position
      y // Pass y position
    });
  }

  function handleShowMoreEvents(dayEvents?: Event[]) {
    showModal({
      title:
        dayEvents &&
        dayEvents?.length &&
        dayEvents[0]?.startDate.toDateString(),
      body: <ShowMoreEventsModal />,
      getter: async () => {
        return { dayEvents };
      },
      id: undefined
    });
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    daysInMonth.length
  ).getDay();
  const nextMonthDaysToShow = 6 - lastDayOfMonth;

  return (
    <div>
      <div className="flex flex-col mb-4">
        <motion.h2
          key={currentDate.getMonth()}
          animate={{ opacity: 1 }}
          className="text-3xl my-5 tracking-tighter font-bold"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {currentDate.toLocaleString('default', { month: 'long' })}{' '}
          {currentDate.getFullYear()}
        </motion.h2>
        <div className="flex gap-3">
          {prevButton ? (
            <div onClick={handlePrevMonth}>{prevButton}</div>
          ) : (
            <Button
              className={classNames?.prev}
              startContent={<ArrowLeft />}
              onClick={handlePrevMonth}
            >
              Prev
            </Button>
          )}
          {nextButton ? (
            <div onClick={handleNextMonth}>{nextButton}</div>
          ) : (
            <Button
              className={classNames?.next}
              endContent={<ArrowRight />}
              onClick={handleNextMonth}
            >
              Next
            </Button>
          )}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDate.getMonth()}
          animate="visible"
          className="grid grid-cols-7"
          initial="hidden"
          variants={containerVariants}
          onClick={handlePrevMonth}
        >
          {daysOfWeek.map((day, idx) => (
            <div
              key={idx}
              className="text-right p-2 text-sm text-gray-500 tracking-tighter font-medium"
            >
              <p className="mr-1.5">{day}</p>
            </div>
          ))}

          {/* Add days from previous month */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`prev-month-${idx}`} className="h-[150px]">
              <Card
                className="relative flex p-1.5 border border-gray-300 border-r-0 border-b-0 h-full"
                radius="none"
                shadow="none"
              >
                <div className="font-semibold text-sm mb-1 p-2 text-right w-full text-gray-300">
                  {/* Show the last few days of the previous month */}
                  {
                    previousMonthDays[
                      previousMonthDays.length - firstDayOfMonth + idx
                    ].day
                  }
                </div>
              </Card>
            </div>
          ))}

          {daysInMonth.map((dayObj, index) => {
            const dayEvents = getters.getEventsForDay(dayObj.day, currentDate);
            const maxVisibleEvents = 3;
            const firstDay = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              index + 1
            ).getDay();

            const isLastInRow = (index + firstDayOfMonth + 1) % 7 === 0;
            const isLastRow = index >= daysInMonth.length - (7 - firstDay);
            const isLastDay = index === daysInMonth.length - 1;

            return (
              <motion.div
                key={dayObj.day}
                className="hover:z-50 border-none h-[150px] group flex flex-col"
                variants={itemVariants}
              >
                <Card
                  isPressable
                  className={clsx(
                    'relative flex p-1.5 border border-gray-300 h-full',
                    isLastDay
                      ? 'border-b'
                      : !isLastInRow && 'border-r-0 border-b', // Apply proper border styles for the last column
                    !isLastRow && 'border-b-0'
                  )}
                  radius="none"
                  shadow="none"
                  onClick={() => handleAddEvent(dayObj.day)}
                >
                  {dayEvents.length > maxVisibleEvents && (
                    <Chip
                      className="hover:bg-default-200 absolute left-2 text-xs top-2 transition duration-300 z-10"
                      variant="flat"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowMoreEvents(dayEvents);
                      }}
                    >
                      {`+${dayEvents.length - maxVisibleEvents} more`}
                    </Chip>
                  )}
                  <div
                    className={clsx(
                      'font-semibold relative text-sm mb-1 p-2 text-right w-full',
                      new Date().getDate() === dayObj.day &&
                        new Date().getMonth() === currentDate.getMonth() &&
                        new Date().getFullYear() === currentDate.getFullYear()
                        ? 'text-white'
                        : 'text-gray-500'
                    )}
                  >
                    <div
                      className={clsx(
                        'inline-block px-1.5 py-1 rounded-lg text-right',
                        new Date().getDate() === dayObj.day &&
                          new Date().getMonth() === currentDate.getMonth() &&
                          new Date().getFullYear() === currentDate.getFullYear()
                          ? 'bg-pink-500'
                          : 'border-transparent'
                      )}
                    >
                      {dayObj.day}
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col w-full overflow-hidden">
                    <div className="flex flex-col h-full">
                      {dayEvents
                        .slice(0, maxVisibleEvents)
                        .map((event, idx) => (
                          <div key={idx} className="py-0.5">
                            <EventStyled
                              CustomEventModal={CustomEventModal}
                              event={{
                                ...event,
                                CustomEventComponent,
                                minmized: true
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {Array.from({ length: nextMonthDaysToShow }).map((_, idx) => (
            <motion.div
              key={`next-${idx}`}
              className="text-gray-400 h-[150px] group flex flex-col"
              variants={itemVariants}
              onClick={handleNextMonth}
            >
              <Card
                className={clsx(
                  'relative flex p-1.5 text-gray-300 border border-gray-300 h-full text-right',
                  'border-r border-b border-l-0', // Ensure consistent border style
                  'border-gray-300'
                )}
                radius="none"
                shadow="none"
              >
                <div className="font-semibold text-sm mb-1 p-2 text-right w-full">
                  {idx + 1}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
