import React, { useState } from 'react';
import { Card, Avatar, Typography, Tag, Button } from 'antd';
import { CloseOutlined, LinkedinOutlined } from '@ant-design/icons';
import '../styles/JobList.css';

const { Title, Text } = Typography;

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  timePosted: string;
  applicants: number;
  workType: string[];
  easyApply: boolean;
  logo?: string;
}

interface JobListProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  searchKeyword: string;
  searchLocation: string;
}

const JobList: React.FC<JobListProps> = ({ jobs, onSelectJob, searchKeyword, searchLocation }) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleJobClick = (job: Job) => {
    setSelectedJobId(job.id);
    onSelectJob(job);
  };

  return (
    <div className="job-list">
      <div className="job-list-header">
        <div className="job-search-info">
          <Title level={5}>{searchKeyword} in {searchLocation}</Title>
          <Text type="secondary">{jobs.length} results</Text>
        </div>
        <div className="job-alert-toggle">
          <Text>Set alert</Text>
          <div className="toggle-switch"></div>
        </div>
      </div>

      <div className="job-cards">
        {jobs.length > 0 ? (
          jobs.map(job => (
            <Card 
              key={job.id}
              className={`job-card ${selectedJobId === job.id ? 'selected' : ''}`}
              onClick={() => handleJobClick(job)}
            >
              <div className="job-card-content">
                <div className="job-logo">
                  {job.logo ? (
                    <Avatar src={job.logo} size={48} />
                  ) : (
                    <Avatar icon={<LinkedinOutlined />} size={48} />
                  )}
                </div>
                
                <div className="job-info">
                  <Title level={5} className="job-title">{job.title}</Title>
                  <Text className="company-name">{job.company}</Text>
                  <Text type="secondary" className="job-location">{job.location}</Text>
                  <div className="job-meta">
                    <Text type="secondary">{job.timePosted} · {job.applicants} applicants</Text>
                  </div>
                  
                  <div className="job-tags">
                    {job.workType.map((type, index) => (
                      <Tag key={index} className="work-type-tag">{type}</Tag>
                    ))}
                  </div>
                  
                  {job.easyApply && (
                    <div className="easy-apply">
                      <img src="https://static.licdn.com/aero-v1/sc/h/8w0vew433o9nluoruq9k5eqy" alt="LinkedIn" height="16" />
                      <Text className="easy-apply-text">Easy Apply</Text>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="text" 
                  icon={<CloseOutlined />} 
                  className="dismiss-button"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </Card>
          ))
        ) : (
          <div className="no-results">
            <Text>No jobs found matching your search criteria.</Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
