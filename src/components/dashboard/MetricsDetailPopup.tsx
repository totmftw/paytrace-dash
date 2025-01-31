// src/components/Dashboard/MetricsDetailPopup.tsx
import { Modal } from '@chakra-ui/react';
import { DataTable } from '@/components/ui/data-table';

interface MetricsDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  columns: any[];
}

const MetricsDetailPopup: React.FC<MetricsDetailPopupProps> = ({
  isOpen,
  onClose,
  data,
  columns,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalContent>
        <ModalHeader>Data Details</ModalHeader>
        <ModalBody>
          <DataTable data={data} columns={columns} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};