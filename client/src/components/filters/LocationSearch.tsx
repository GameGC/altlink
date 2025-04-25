import React, { useState, useEffect } from 'react';
import { Input, AutoComplete } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import locationsData from '../../data/locations.json'; // Import the locations JSON file

interface LocationSearchProps {
    value: string;
    onChange: (value: string) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ value, onChange }) => {
    const [locations, setLocations] = useState<string[]>([]);

    useEffect(() => {
        if (value) {
            filterLocations(value);
        } else {
            setLocations([]);
        }
    }, [value]);

    // Filter the locations based on the user's input
    const filterLocations = (query: string) => {
        const lowerQuery = query.toLowerCase();
        const filtered = locationsData.filter(location =>
            location.toLowerCase().startsWith(lowerQuery)
        );
        setLocations(filtered);
    };


    const handleSelectLocation = (value: string) => {
        onChange(value); // Pass the selected location back to the parent component
    };

    return (
        <AutoComplete
            value={value}
            onChange={onChange}
            onSelect={handleSelectLocation}
            options={locations.map(location => ({
                value: location,
            }))}
            style={{ width: '100%' }}
        >
            <Input
                prefix={<EnvironmentOutlined />}
                placeholder="Location"
                value={value}
            />
        </AutoComplete>
    );
};

export default LocationSearch;
