import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@chakra-ui/react';

export function LayoutConfigButton() {
  const { user } = useAuth();
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);

  if (!user?.isITAdmin) return null;

  return (
    <div>
      <Button onClick={() => setIsConfigOpen(true)}>Configure Layout</Button>
      <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)}>
        <ModalContent>
          <ModalHeader>Layout Configuration</ModalHeader>
          {/* Add layout configuration controls here */}
        </ModalContent>
      </Modal>
    </div>
  );
}