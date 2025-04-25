import React, { useState, useEffect } from 'react';
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
  description?: string;  // Assuming there's a job description field.
}

interface JobListProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  searchKeyword: string;
  searchLocation: string;
  includeTags: string[];
  excludeTags: string[];
}

const JobList: React.FC<JobListProps> = ({ jobs, onSelectJob, searchKeyword, searchLocation, includeTags, excludeTags }) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleJobClick = (job: Job) => {
    setSelectedJobId(job.id);
    onSelectJob(job);
  };

  // Filter jobs based on include and exclude tags
  const filteredJobs = jobs.filter((job) => {
    const jobDescription = job.description ? job.description.toLowerCase() : '';

    // Check if the job description includes all include tags (case-insensitive)
    const includesKeywords = includeTags.every((tag) => jobDescription.includes(tag.toLowerCase()));

    // Check if the job description excludes any of the exclude tags (case-insensitive)
    const excludesKeywords = excludeTags.every((tag) => !jobDescription.includes(tag.toLowerCase()));

    return includesKeywords && excludesKeywords;
  });

  return (
      <div className="job-list">
        <div className="job-cards">
          {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
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
