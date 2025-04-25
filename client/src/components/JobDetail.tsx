import React from 'react';
import { Typography, Button, Tag, Card, Divider, Space, Avatar } from 'antd';
import { SaveOutlined, ShareAltOutlined, CheckCircleFilled, UserOutlined } from '@ant-design/icons';
import { Job } from  '@shared/types';// Import the Job interface
import '../styles/JobDetail.css';

const { Title, Text, Paragraph } = Typography;


interface JobDetailProps {
  selectedJob: Job | null;
}

const JobDetail: React.FC<JobDetailProps> = ({ selectedJob }) => {
  if (!selectedJob) {
    return <div className="job-detail-empty">Select a job to view details</div>;
  }

  // Get description based on job ID
  const description = selectedJob.description || 'No description available for this position.';

  // Get apply URL based on job ID
  const applyUrl = selectedJob.applyUrl || '#';

  // Hiring team information for job #2
  const hiringTeam = selectedJob.id === '2' ? {
    name: 'Shawn Singh',
    title: 'RPO Talent Sourcing Specialist for IT/Cloud/Cyber Security for Interactive Games',
    connection: '3rd',
    messageUrl: 'https://www.linkedin.com/messaging/compose/?to=shawn-singh'
  } : null;

  // Handle apply button click
  const handleApplyClick = () => {
    window.open(applyUrl, '_blank');
  };

  // Handle message button click
  const handleMessageClick = () => {
    if (hiringTeam && hiringTeam.messageUrl) {
      window.open(hiringTeam.messageUrl, '_blank');
    }
  };

  return (
    <div className="job-detail">
      <div className="job-detail-header">
        <Title level={3} className="job-detail-title">{selectedJob.title}</Title>
        <div className="company-location">
          <Text className="company-name">{selectedJob.company}</Text>
          <Text className="location">{selectedJob.location}</Text>
          <Text className="posted-time">{selectedJob.timePosted} · {selectedJob.applicants} applicants</Text>
        </div>

        <div className="job-tags">
          {selectedJob.workType.map((type, index) => (
            <Tag key={index} className="work-type-tag">{type}</Tag>
          ))}
        </div>

        <div className="apply-buttons">
          <Button
            type="primary"
            size="large"
            className="easy-apply-button"
            onClick={handleApplyClick}
          >
            {selectedJob.easyApply ? 'Easy Apply' : 'Apply'}
          </Button>
          <Button size="large" className="save-button">Save</Button>
        </div>
      </div>

      {hiringTeam && (
        <Card className="hiring-team-card">
          <Title level={4} className="hiring-team-title">Meet the hiring team</Title>
          <div className="hiring-team-member">
            <div className="member-avatar-container">
              <Avatar size={64} icon={<UserOutlined />} className="member-avatar" />
            </div>
            <div className="member-info">
              <div className="member-name-container">
                <Text strong className="member-name">{hiringTeam.name}</Text>
                <CheckCircleFilled className="verified-icon" />
                <Text className="member-connection">· {hiringTeam.connection}</Text>
              </div>
              <Text className="member-title">{hiringTeam.title}</Text>
              <Text className="member-role">Job poster</Text>
            </div>
            <Button
              className="message-button"
              onClick={handleMessageClick}
            >
              Message
            </Button>
          </div>
        </Card>
      )}

      <Divider />

      <div className="about-job-section">
        <Title level={4}>About the job</Title>
        <div className="job-details">
          <div className="job-detail-item">
            <Text strong>Job Level:</Text> <Text>Full-time</Text>
          </div>
          <div className="job-detail-item">
            <Text strong>Employment Type:</Text> <Text>{selectedJob.workType.join(', ')}</Text>
          </div>
          <div className="job-detail-item">
            <Text strong>Company:</Text> <Text>{selectedJob.company}</Text>
          </div>
        </div>

        <Paragraph className="job-description">
          {description}
        </Paragraph>
      </div>
    </div>
  );
};

export default JobDetail;
