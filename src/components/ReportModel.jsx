import React from 'react';
import { Button, Dialog } from '@itwin/itwinui-react';
import ReportCharts from './charts/ReportCharts';
import { useSelector } from 'react-redux';

export const ReportModel = ({ showReport }) => {
    const [isOpen, setIsOpen] = React.useState(showReport);
    const activeRepositories = useSelector((state) => state.discussions.activeRepositories);
    const closeDialog = () => {
        setIsOpen(false);
    };

    const onClose = (event) => {
        closeDialog();
    };

    return (
        <>
            <Button styleType="cta" onClick={() => setIsOpen(true)}>
                Report
            </Button>
            <Dialog
                isOpen={isOpen}
                onClose={onClose}
                closeOnEsc
                isDismissible
                isDraggable
            // isResizable
            >
                <Dialog.Main style={{ color: 'black', minWidth: '80vw', height: '80vh' }}>
                    <Dialog.TitleBar titleText={<strong>Report for ({activeRepositories.length}) Repositories - ( {String(activeRepositories)} )</strong>} />
                    <Dialog.Content >
                        <ReportCharts />
                    </Dialog.Content>
                    {/* <Dialog.ButtonBar>
                        <Button onClick={onClose} >Close</Button>
                    </Dialog.ButtonBar> */}
                </Dialog.Main>
            </Dialog>
        </>
    );
};