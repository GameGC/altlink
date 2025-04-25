import React, { useState } from 'react';
import { Layout, Button, Space, Avatar, Modal, Input, Checkbox, Divider } from 'antd';
import { UserOutlined, SearchOutlined, GoogleOutlined, AppleOutlined } from '@ant-design/icons';
import SearchBar from './SearchBar';
import '../styles/Header.css';

const { Header } = Layout;

interface HeaderProps {
  onSearch: (keyword: string, location: string, include: string, exclude: string) => void;
}

const LinkedInHeader: React.FC<HeaderProps> = ({ onSearch }) => {
  const [includeKeywords, setIncludeKeywords] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState('');

  const handleSearch = (keyword: string, location: string) => {
    // Call onSearch with include and exclude filters as well
    onSearch(keyword, location, includeKeywords, excludeKeywords);
  };

  return (
      <Header className="header">
        <div className="header-content">
          <div className="logo-search">
            <div className="linkedin-logo">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" height="34" />
            </div>

            <SearchBar onSearch={handleSearch} />

            <Button type="primary" icon={<SearchOutlined />} className="search-button" onClick={() => handleSearch('unity developer', 'United States')}>
              Search
            </Button>
          </div>
        </div>
      </Header>
  );
};

export default LinkedInHeader;
