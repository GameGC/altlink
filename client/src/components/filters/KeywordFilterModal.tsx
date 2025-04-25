import React, {useRef, useState} from 'react';
import {Modal, Input, Tag, Button, InputRef} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface KeywordFilterModalProps {
    includeTags: string[];
    excludeTags: string[];
    onIncludeTagsChange: (tags: string[]) => void;
    onExcludeTagsChange: (tags: string[]) => void;
    onFilterChange: (filterType: string, value: string) => void;
}

const KeywordFilterModal: React.FC<KeywordFilterModalProps> = ({
                                                                   includeTags,
                                                                   excludeTags,
                                                                   onIncludeTagsChange,
                                                                   onExcludeTagsChange,
                                                                   onFilterChange,
                                                               }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [includeInputVisible, setIncludeInputVisible] = useState(false);
    const [excludeInputVisible, setExcludeInputVisible] = useState(false);
    const [includeInputValue, setIncludeInputValue] = useState('');
    const [excludeInputValue, setExcludeInputValue] = useState('');

    const includeInputRef = useRef<InputRef>(null);
    const excludeInputRef = useRef<InputRef>(null);


    const handleIncludeInputConfirm = () => {
        const trimmed = includeInputValue.trim();
        if (trimmed && !includeTags.includes(trimmed)) {
            onIncludeTagsChange([...includeTags, trimmed]);
        }
        setIncludeInputVisible(false);
        setIncludeInputValue('');
    };

    const handleExcludeInputConfirm = () => {
        const trimmed = excludeInputValue.trim();
        if (trimmed && !excludeTags.includes(trimmed)) {
            onExcludeTagsChange([...excludeTags, trimmed]);
        }
        setExcludeInputVisible(false);
        setExcludeInputValue('');
    };

    const showIncludeInput = () => {
        setIncludeInputVisible(true);
        setTimeout(() => includeInputRef.current?.focus(), 0);
    };

    const showExcludeInput = () => {
        setExcludeInputVisible(true);
        setTimeout(() => excludeInputRef.current?.focus(), 0);
    };

    const handleIncludeClose = (removedTag: string) => {
        onIncludeTagsChange(includeTags.filter(tag => tag !== removedTag));
    };

    const handleExcludeClose = (removedTag: string) => {
        onExcludeTagsChange(excludeTags.filter(tag => tag !== removedTag));
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        onFilterChange('includeKeywords', includeTags.join(','));
        onFilterChange('excludeKeywords', excludeTags.join(','));
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div>
            <Button onClick={showModal} className="filter-button">
                Keywords <PlusOutlined />
            </Button>

            <Modal
                title="Keyword Filters"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <div className="keyword-filter-section">
                    <div className="keyword-filter-item">
                        <label>Include keywords:</label>
                        <div className="tag-container">
                            {includeTags.map(tag => (
                                <Tag key={tag} closable onClose={() => handleIncludeClose(tag)}>
                                    {tag}
                                </Tag>
                            ))}
                            {includeInputVisible ? (
                                <Input
                                    ref={includeInputRef}
                                    size="small"
                                    value={includeInputValue}
                                    onChange={(e) => setIncludeInputValue(e.target.value)}
                                    onBlur={handleIncludeInputConfirm}
                                    onPressEnter={handleIncludeInputConfirm}
                                />
                            ) : (
                                <Tag className="site-tag-plus" onClick={showIncludeInput}>
                                    <PlusOutlined /> New Keyword
                                </Tag>
                            )}
                        </div>
                        <div className="keyword-hint">Results must include these keywords</div>
                    </div>

                    <div className="keyword-filter-item">
                        <label>Exclude keywords:</label>
                        <div className="tag-container">
                            {excludeTags.map(tag => (
                                <Tag key={tag} closable onClose={() => handleExcludeClose(tag)}>
                                    {tag}
                                </Tag>
                            ))}
                            {excludeInputVisible ? (
                                <Input
                                    ref={excludeInputRef}
                                    size="small"
                                    value={excludeInputValue}
                                    onChange={(e) => setExcludeInputValue(e.target.value)}
                                    onBlur={handleExcludeInputConfirm}
                                    onPressEnter={handleExcludeInputConfirm}
                                />
                            ) : (
                                <Tag className="site-tag-plus" onClick={showExcludeInput}>
                                    <PlusOutlined /> New Keyword
                                </Tag>
                            )}
                        </div>
                        <div className="keyword-hint">Results must not include these keywords</div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default KeywordFilterModal;
