import { Checkbox, DropdownMenu, IconButton, MenuItem } from '@itwin/itwinui-react';
import React from 'react'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setColumnState } from '../store/reducers/column';
import { SvgMore } from '@itwin/itwinui-react/cjs/core/utils';

export default function ColumnHider() {
    const dispatch = useDispatch();
    const colState = useSelector((state) => state.column.columnState)
    const [columnState, setNewColumnState] = useState(() => colState, [colState])

    const getMenuItem = (currColumnState) => {
        const menuItem = [];
        Object.keys(currColumnState).forEach((key, index) => {
            menuItem.push(<MenuItem key={index} >
                <Checkbox key={index} label={key} name={key} checked={currColumnState[key]} onClick={(e) => handleColumnCheckBoxClick(e, currColumnState)} />
            </MenuItem>)
        });

        return menuItem;
    }

    const handleColumnCheckBoxClick = (e, currColumnState) => {
        Object.keys(currColumnState).forEach((key, index) => {
            if (e.target.name === key) {
                const newColumnState = { ...columnState, [key]: !currColumnState[key] };
                setNewColumnState(newColumnState);
                dispatch(setColumnState({ columnState: newColumnState }))
            }
        });
    }

    return (
        <div>
            <DropdownMenu  menuItems={() => getMenuItem(columnState)}>
                <IconButton size='small'>
                    <SvgMore />
                </IconButton>
            </DropdownMenu>
        </div>
    )
}
