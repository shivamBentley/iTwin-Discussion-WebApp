import React from 'react';
import {
    Modal,
    ModalContent,
    Alert,
} from '@itwin/itwinui-react';
export const BasicModal = ({
    isOpen,
    title = 'Downloading Status',
    messages
}) => {
    const [isModalOpen, setIsModalOpen] = React.useState(isOpen);

    React.useEffect(() => {
        setIsModalOpen(isOpen);
    }, [isOpen]);

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const onClose = (event) => {

        closeModal();
    };

    const showPositive = (message) => {
        return (
            <Alert
                type={message.status}
                clickableTextProps={{ onClick: () => { console.log('Clicked') } }}
                style={{ margin: '10px 0' }}
            >
                {message.name}
            </Alert>
        );
    };

    return (
        <>
            <Modal
                isOpen={isModalOpen}
                title={title}
                onClose={onClose}
                // onKeyDown={() => { console.log('key down') }}
                closeOnEsc={false}
                closeOnExternalClick={false}
            >
                <ModalContent style={{ height: '250px', overflowY: 'scroll' }}>
                    {messages.map((message) => (showPositive(message)))}
                </ModalContent>
            </Modal>
        </>
    );
};