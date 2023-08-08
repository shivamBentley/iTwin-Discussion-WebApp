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
                    {textVisible && <div style={{ display: 'flex', justifyContent: 'space-between', borderRadius: '3px', backgroundColor:'white', boxShadow:'2px 2px 2px 2px lightgray' }} >
                        <span style={{ margin: '5px', paddingTop:'8px' }}>{startD?.toLocaleDateString()} - {endD?.toLocaleDateString()}</span>
                        <Button style={{ margin: '5px' }} styleType="high-visibility" onClick={handleDownloadLatestData}> Okay</Button>

                    </div>}
                </div>
            )}
        </div>
    );
};