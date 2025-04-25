import React, { useState, useEffect } from 'react';
import { Input, AutoComplete } from 'antd';

interface KeywordSearchWithSuggestionsProps {
    value: string;
    onChange: (value: string) => void;
}

const KeywordSearch: React.FC<KeywordSearchWithSuggestionsProps> = ({ value, onChange }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        // Fetch the saved keywords from localStorage
        const savedKeywords = JSON.parse(localStorage.getItem('savedKeywords') || '[]') as string[];

        // Filter the saved keywords to match the current value
        const filteredSuggestions = savedKeywords.filter((keyword) =>
            keyword.toLowerCase().includes(value.toLowerCase())
        );

        // Update suggestions
        setSuggestions(filteredSuggestions);
    }, [value]);

    return (
        <AutoComplete
            value={value}
            onChange={onChange}
            placeholder="Search job titles or keywords"
            options={suggestions.map((suggestion) => ({ value: suggestion }))}
        >
            <Input />
        </AutoComplete>
    );
};

export default KeywordSearch;
