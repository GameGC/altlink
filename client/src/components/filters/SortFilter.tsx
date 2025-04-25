import React from 'react';
import { Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

interface SortFilterProps {
    sortOption: string;
    onSortChange: (key: string) => void;
}

const sortItems = [
    { key: 'recent', label: 'Most recent' },
    { key: 'relevant', label: 'Most relevant' },
];

const SortFilter: React.FC<SortFilterProps> = ({ sortOption, onSortChange }) => {
    const getSortText = () => {
        const option = sortItems.find(item => item.key === sortOption);
        return option ? option.label : 'Most recent';
    };

    return (
        <Dropdown
            menu={{
                items: sortItems,
                onClick: (e) => onSortChange(e.key),
                selectedKeys: [sortOption],
            }}
            trigger={['click']}
        >
            <Button className="filter-button">
                {getSortText()} <DownOutlined />
            </Button>
        </Dropdown>
    );
};

export default SortFilter;
