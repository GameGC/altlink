import React, { useState, useEffect } from 'react';
import { Space } from 'antd';
import LocationSearch from './filters/LocationSearch';  // Import the LocationSearch component
import KeywordSearch from './filters/KeywordSearch';  // Import the new keyword search component

interface SearchBarProps {
    onSearch: (keyword: string, location: string) => void;
    initialKeyword?: string;
    initialLocation?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
                                                 onSearch,
                                                 initialKeyword = 'unity developer',
                                                 initialLocation = 'United States',
                                             }) => {
    const [keyword, setKeyword] = useState(initialKeyword);
    const [location, setLocation] = useState(initialLocation);

    // Load saved keyword from localStorage if available
    useEffect(() => {
        const savedKeyword = localStorage.getItem('savedKeyword');
        if (savedKeyword) {
            setKeyword(savedKeyword);
        }
    }, []);

    const handleSearch = () => {
        onSearch(keyword, location);

        // Save keyword in localStorage and also add it to the saved keywords list
        const savedKeywords = JSON.parse(localStorage.getItem('savedKeywords') || '[]') as string[];
        if (!savedKeywords.includes(keyword)) {
            savedKeywords.push(keyword);
            localStorage.setItem('savedKeywords', JSON.stringify(savedKeywords));
        }
    };

    const handleKeywordChange = (value: string) => {
        setKeyword(value);
    };

    const handleLocationChange = (value: string) => {
        setLocation(value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <Space className="search-container"  onKeyUp={handleKeyPress}>
            <KeywordSearch value={keyword} onChange={handleKeywordChange} />
            <LocationSearch value={location} onChange={handleLocationChange} />
        </Space>
    );
};

export default SearchBar;
