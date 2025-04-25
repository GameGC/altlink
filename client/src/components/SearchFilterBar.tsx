import React, { Component } from 'react';
import {
    Layout,
    Button,
    Space,
    Dropdown, Switch
} from 'antd';
import {
    DownOutlined,
    SearchOutlined
} from '@ant-design/icons';

import TimePostedFilter from './filters/TimePostedFilter';
import SortFilter from './filters/SortFilter';
import KeywordFilterModal from './filters/KeywordFilterModal';
import LocationSearch from './filters/LocationSearch';
import KeywordSearch from './filters/KeywordSearch';

import '../styles/FilterBar.css';
import '../styles/Header.css';

const { Header } = Layout;

interface SearchFilterBarProps {
    onFilterChange: (filterType: string, value: string) => void;
    onSearch: (keyword: string, location: string, include: string, exclude: string) => void;
    onIncludeTagsChange: (tags: string[]) => void;
    onExcludeTagsChange: (tags: string[]) => void;
    includeTags: string[];
    excludeTags: string[];
    useLinkedInAPI: boolean;
    onUseLinkedInAPIToggle: (use: boolean) => void; // NEW callback prop
}

interface SearchFilterBarState {
    sortOption: string;
    timePostedOption: string;
    includeKeywords: string;
    excludeKeywords: string;
    includeTags: string[];
    excludeTags: string[];
    keyword: string;
    location: string;
}

class SearchFilterBar extends Component<SearchFilterBarProps, SearchFilterBarState> {
    constructor(props: SearchFilterBarProps) {
        super(props);
        const savedKeyword = localStorage.getItem('savedKeyword') || 'unity developer';

        this.state = {
            sortOption: 'recent',
            timePostedOption: 'past_24_hours',
            includeKeywords: '',
            excludeKeywords: '',
            includeTags: props.includeTags || [],
            excludeTags: props.excludeTags || [],
            keyword: savedKeyword,
            location: 'United States',
        };
    }

    componentDidMount() {
        const savedKeyword = localStorage.getItem('savedKeyword');
        if (savedKeyword) {
            this.setState({ keyword: savedKeyword });
        }
    }

    handleSearch = () => {
        const { keyword, location, includeKeywords, excludeKeywords } = this.state;

        this.props.onSearch(keyword, location, includeKeywords, excludeKeywords);

        const savedKeywords = JSON.parse(localStorage.getItem('savedKeywords') || '[]') as string[];
        if (!savedKeywords.includes(keyword)) {
            savedKeywords.push(keyword);
            localStorage.setItem('savedKeywords', JSON.stringify(savedKeywords));
        }
    };

    handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            this.handleSearch();
        }
    };

    handleTimePostedFilter = (key: string) => {
        this.setState({ timePostedOption: key });
        this.props.onFilterChange('timePosted', key);
    };

    handleSortChange = (key: string) => {
        this.setState({ sortOption: key });
        this.props.onFilterChange('sort', key);
    };

    handleIncludeTagsChange = (tags: string[]) => {
        this.setState({ includeTags: tags });
        this.props.onIncludeTagsChange(tags);
    };

    handleExcludeTagsChange = (tags: string[]) => {
        this.setState({ excludeTags: tags });
        this.props.onExcludeTagsChange(tags);
    };

    render() {
        const {
            sortOption,
            timePostedOption,
            includeTags,
            excludeTags,
            keyword,
            location
        } = this.state;
        const { onFilterChange } = this.props;

        return (
            <>
                <Header className="header">
                    <div className="header-content">
                        <Space className="logo-search" direction="horizontal">
                            <img
                                style={{ display: 'flex', alignItems: 'center' }}
                                src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                                alt="LinkedIn"
                                height="34"
                            />

                            <Space className="search-container" onKeyUp={this.handleKeyPress}>
                                <KeywordSearch
                                    value={keyword}
                                    onChange={(value) => this.setState({ keyword: value })}
                                />
                                <LocationSearch
                                    value={location}
                                    onChange={(value) => this.setState({ location: value })}
                                />
                            </Space>

                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                className="search-button"
                                onClick={this.handleSearch}
                            >
                                Search
                            </Button>

                            <Switch
                                title={"Job types:"}
                                checked={this.props.useLinkedInAPI}
                                onChange={(checked) => this.props.onUseLinkedInAPIToggle(checked)}
                                checkedChildren="Promoted"
                                unCheckedChildren="Not promoted"
                            />

                        </Space>
                    </div>

                    <Space size="small" wrap className="filter-container">
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

                        <SortFilter sortOption={sortOption} onSortChange={this.handleSortChange} />
                        <TimePostedFilter timePostedOption={timePostedOption} onTimePostedChange={this.handleTimePostedFilter} />

                        <KeywordFilterModal
                            includeTags={includeTags}
                            excludeTags={excludeTags}
                            onIncludeTagsChange={this.handleIncludeTagsChange}
                            onExcludeTagsChange={this.handleExcludeTagsChange}
                            onFilterChange={onFilterChange}
                        />
                    </Space>
                </Header>
            </>
        );
    }
}

export default SearchFilterBar;
