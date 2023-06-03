import React from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ToastNotify = () => {
    const toastState = useSelector((state) => state.toast.toastState);
    const idToClose = useSelector((state) => state.toast.idToClose);

    useEffect(() => {

        if (toastState.isOpen) {
            toast(`${toastState.title}`, {
                toastId: `${toastState.id}`,
                isLoading: toastState.status === 'downloading' ? true : false
            });

        }

        else if (toastState.status === 'successfullyDownloaded')
            toast.update(idToClose, {
                type: toast.TYPE.SUCCESS,
                autoClose: 5049,
                render: toastState.title,
                isLoading: false
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toastState])

    return (
        <div>
            <ToastContainer
                position="bottom-right"
                autoClose={toastState.autoClose}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={true}
                theme="dark"
            />
        </div>
    );
}