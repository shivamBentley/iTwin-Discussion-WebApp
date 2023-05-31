import React from 'react';
import {
    Modal,
    ModalContent,
    Alert,
    ProgressRadial,
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
            <div style={{ position: "relative" }}>
                <Alert
                    type={message.status}
                    clickableTextProps={{ onClick: () => { console.log('Clicked') } }}
                    style={{ margin: '10px 0' }}
                >
                    {message.name}
                </Alert>
                <div style={{ position: 'absolute', right: '12px', top: '12px', display: `${message.status !== 'positive' ? '' : 'none'}` }}><ProgressRadial indeterminate={true} size='small' /></div>
            </div>
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
                    <div style={{
                        color:'red', 
                        fontSize:'0.95rem',
                        fontWeight:'600',
                        border:'1px solid red', 
                        borderRadius:'5px' , 
                        padding:'1px 8px', 
                        marginTop:'24px'
                        }}
                    >Please don't Refresh the page, until process get completed</div>
                </ModalContent>
            </Modal>
        </>
    );
};