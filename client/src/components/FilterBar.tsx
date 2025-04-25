import React, { useState } from 'react';
import { Button, Space, Dropdown } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import TimePostedFilter from './filters/TimePostedFilter';
import SortFilter from './filters/SortFilter';
import KeywordFilterModal from './filters/KeywordFilterModal'; // Import the new class-based KeywordFilterModal component
import '../styles/FilterBar.css';

interface FilterBarProps {
  onFilterChange: (filterType: string, value: string) => void;
  includeTags: string[];
  excludeTags: string[];
  onIncludeTagsChange: (tags: string[]) => void;
  onExcludeTagsChange: (tags: string[]) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
                                               onFilterChange,
                                               includeTags,
                                               excludeTags,
                                               onIncludeTagsChange,
                                               onExcludeTagsChange,
                                             }) => {
  const [sortOption, setSortOption] = useState('recent');
  const [timePostedOption, setTimePostedOption] = useState('past_24_hours');

  const handleTimePostedFilter = (key: string) => {
    setTimePostedOption(key);
    onFilterChange('timePosted', key);
  };

  const handleSortChange = (key: string) => {
    setSortOption(key);
    onFilterChange('sort', key);
  };

  return (
      <div className="filter-bar">
        <Space size="small" wrap className="filter-container">
          {/* Jobs Dropdown */}
          <Dropdown
              menu={{
                items: [
                  { key: 'all', label: 'All Jobs' },
                  { key: 'saved', label: 'Saved Jobs' },
                  { key: 'applied', label: 'Applied Jobs' },
                ],
                onClick: (e) => onFilterChange('jobType', e.key),
              }}
              trigger={['click']}
          >
            <Button className="filter-button jobs-button">
              Jobs <DownOutlined />
            </Button>
          </Dropdown>

          {/* Sort Dropdown */}
          <SortFilter sortOption={sortOption} onSortChange={handleSortChange} />

          {/* Time Posted Dropdown */}
          <TimePostedFilter timePostedOption={timePostedOption} onTimePostedChange={handleTimePostedFilter} />
          <KeywordFilterModal
                includeTags={includeTags}
                excludeTags={excludeTags}
                onIncludeTagsChange={onIncludeTagsChange}
                onExcludeTagsChange={onExcludeTagsChange}
                onFilterChange={onFilterChange}
          />
        </Space>
      </div>
  );
};

export default FilterBar;
