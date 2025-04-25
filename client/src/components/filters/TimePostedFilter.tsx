import React from 'react';
import { Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

interface TimePostedFilterProps {
    timePostedOption: string;
    onTimePostedChange: (key: string) => void;
}

const timePostedItems = [
    { key: 'Past24Hours', label: 'Past 24 hours' },
    { key: 'PastWeek', label: 'Past week' },
    { key: 'PastMonth', label: 'Past month' },
    { key: 'Past12Hours', label: 'Past 12 hours' },
    { key: 'Past3Days', label: 'Past 3 days' },
    { key: 'Past5Days', label: 'Past 5 days' },
];

const TimePostedFilter: React.FC<TimePostedFilterProps> = ({ timePostedOption, onTimePostedChange }) => {
    const getTimePostedText = () => {
        const option = timePostedItems.find(item => item.key === timePostedOption);
        return option ? option.label : 'Past 24 hours';
    };

    return (
        <Dropdown
            menu={{
                items: timePostedItems,
                onClick: (e) => onTimePostedChange(e.key),
                selectedKeys: [timePostedOption],
            }}
            trigger={['click']}
        >
            <Button className="filter-button">
                {getTimePostedText()} <DownOutlined />
            </Button>
        </Dropdown>
    );
};

export default TimePostedFilter;
