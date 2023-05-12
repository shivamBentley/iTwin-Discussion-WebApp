import { Table } from '@itwin/itwinui-react'
import React, { useMemo } from 'react'

function List() {
    const columns = useMemo(
        () => [
            {
                Header: 'Table',
                columns: [
                    {
                        id: 'name',
                        Header: 'Name',
                        accessor: 'name',
                    },
                    {
                        id: 'description',
                        Header: 'Description',
                        accessor: 'description',
                        maxWidth: 200,
                    },
                    {
                        id: 'click-me',
                        Header: 'Click',
                        width: 100,

                    },
                ],
            },
        ],
        [],
    );

    const data = useMemo(
        () => [
            { name: 'Name1', description: 'Description1' },
            { name: 'Name2', description: 'Description2' },
            { name: 'Name3', description: 'Description3' },
        ],
        [],
    );
    return (
        <div>
            <Table
                data={data}
                columns={columns}
            />
        </div>
    )
}

export default List