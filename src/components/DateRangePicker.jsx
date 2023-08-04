import { Button, DatePicker, IconButton } from "@itwin/itwinui-react";
import { SvgCalendar } from "@itwin/itwinui-react/cjs/core/utils";
import React from "react";

export const DateRangePicker = ({ startD, endD, onChange, textVisible, handleDownloadLatestData }) => {
    const [opened, setOpened] = React.useState(false);
    return (
        <div style={{ position: 'absolute', zIndex: 100, }}>
            {!textVisible && <IconButton size="small" onClick={() => setOpened(!opened)} id='picker-button'><SvgCalendar /></IconButton>}
            {textVisible && <span style={{ position: 'absolute', top: '-8px' }} onClick={() => setOpened(!opened)}>Custom Date</span>}
            {!textVisible && <span style={{
                borderLeft: 'none',
                padding: '2px 4px',
                fontWeight: '600',
                color: '#037d7d',
            }}>
                <span
                    style={{
                        borderLeft: 'none',
                        padding: '2px 4px',
                        color: '#037d7d',
                    }}
                >
                    Start Date: {startD?.toLocaleDateString()}
                </span>
                <span style={{ margin: '0 4px', fontWeight: 'bold' }}>To</span>
                <span
                    style={{
                        borderLeft: 'none',
                        padding: '2px 4px',
                        color: '#037d7d',
                    }}
                >
                    End Date: {endD?.toLocaleDateString()}
                </span>
            </span>}

            {opened && (
                <div style={{ marginTop: 4 }}>
                    <DatePicker
                        enableRangeSelect
                        startDate={startD}
                        endDate={endD}
                        onChange={onChange}
                    />
                    {textVisible && <div>
                        <Button onClick={handleDownloadLatestData}> Okay</Button>
                        <span style={{ marginLeft: '10px' }}>{startD?.toLocaleDateString()} - {endD?.toLocaleDateString()}</span>
                    </div>}
                </div>
            )}
        </div>
    );
};