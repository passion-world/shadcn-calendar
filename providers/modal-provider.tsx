'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@nextui-org/modal';
import { motion } from 'framer-motion';

interface ModalContextType {
  showModal: (config: {
    id: ReactNode;
    title: ReactNode;
    body: ReactNode;
    footer?: ReactNode;
    modalClassName?: string;
    getter?: () => Promise<any>;
    x?: number;
    y?: number;
  }) => void;
  onClose: () => void;
  data: any | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [modalContent, setModalContent] = useState<{
    title?: ReactNode;
    body?: ReactNode;
    modalClassName?: string;
    footer?: ReactNode;
  } | null>(null);

  const [data, setData] = useState<any | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalPosition, setModalPosition] = useState<{
    x?: number;
    y?: number;
  }>({
    x: -500, // Default x position
    y: -600 // Default y position
  });

  const showModal = async ({
    title,
    body,
    footer,
    modalClassName,
    getter,
    x,
    y
  }: {
    title: ReactNode;
    body: ReactNode;
    footer?: ReactNode;
    modalClassName?: string;
    getter?: () => Promise<any>;
    x?: number;
    y?: number;
  }) => {
    setModalContent({ title, body, footer, modalClassName });

    if (getter) {
      try {
        const result = await getter();

        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
        setData(null);
      }
    } else {
      setData(null);
    }

    setModalPosition({ x, y }); // Set modal position here
    onOpen();
  };

  return (
    <ModalContext.Provider value={{ showModal, onClose, data }}>
      {children}
      <motion.div
        animate={{
          x: modalPosition.x ?? -500,
          y: modalPosition.y ?? -600,
          width: 0,
          height: 0
        }}
      >
        <Modal
          backdrop="transparent"
          // isDismissable={false}
          isOpen={isOpen}
          onOpenChange={onClose}
        >
          <motion.div
            animate={{
              x: modalPosition.x ?? -500,
              y: modalPosition.y ?? -600
            }}
          >
            <ModalContent className={modalContent?.modalClassName}>
              {modalContent && (
                <>
                  {modalContent.title && (
                    <ModalHeader>{modalContent.title}</ModalHeader>
                  )}
                  {modalContent.body && (
                    <ModalBody>{modalContent.body}</ModalBody>
                  )}
                  {modalContent.footer && (
                    <ModalFooter>{modalContent.footer}</ModalFooter>
                  )}
                </>
              )}
            </ModalContent>
          </motion.div>
        </Modal>
      </motion.div>
    </ModalContext.Provider>
  );
};

// Hook to use modal context
export const useModalContext = (): ModalContextType => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }

  return context;
};
