import React, { useState, useEffect, useRef } from 'react';

import {Button, Layout} from 'antd';
import LinkedInHeader from './components/Header';
import FilterBar from './components/FilterBar';
import JobList from './components/JobList';
import JobDetail from './components/JobDetail';
import './App.css';
import {Job} from '@shared/types';
import SearchFilterBar from "./components/SearchFilterBar";

const { Content } = Layout;



/*const JobFetchButton: React.FC = () => {
const [loading, setLoading] = useState(false);

const handleClick = async () => {
  setLoading(true);
  console.log('Fetching jobs...');
  const jobs = await fetchJobs('Software Engineer', 'San Francisco, CA', DatePosted.PastWeek);
  console.log('Jobs fetched:', jobs);
  setLoading(false);
};

  /*return (
      <Button
          onClick={handleClick}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Fetch Jobs'}
      </Button>
  );
};*/

// Mock data for jobs
/*const allJobs: Job[] = [
  {
    id: '1',
    title: 'Unity Developer',
    company: 'Game Studio Inc.',
    location: 'San Francisco, CA (On-site)',
    timePosted: '2 minutes ago',
    applicants: 3,
    workType: ['On-site', 'Full-time'],
    easyApply: true,
    logo: 'https://media.licdn.com/dms/image/C4E0BAQGgcRYcsEA95g/company-logo_100_100/0/1656681489088?e=1719878400&v=beta&t=_5nQJJfK9D_s5mYHYVQxNUZvEm-jqCwxGzD0Ix55YEY',
    applyUrl: 'https://www.linkedin.com/jobs/apply/1',
    hiringTeam: {
      name: 'Lana Brooks',
      title: 'Senior Hiring Specialist at Mobile Gaming Co.',
      connection: '3rd',
      messageUrl: 'https://www.linkedin.com/messaging/compose/?to=lana-brooks'
    },
    description: `We are looking for a skilled Unity Developer to join our team at Game Studio Inc. The ideal candidate will have experience developing 3D games and applications using Unity. You will work with our team of designers and developers to create engaging gaming experiences.

Responsibilities:
• Develop and implement game features using Unity
• Collaborate with artists and designers to implement visual assets
• Optimize applications for performance
• Debug and fix issues

Requirements:
• 2+ years of experience with Unity development
• Strong C# programming skills
• Experience with 3D mathematics and physics
• Portfolio demonstrating Unity projects`
  },
  {
    id: '2',
    title: 'Senior Unity Developer',
    company: 'Interactive Games',
    location: 'New York, NY (Hybrid)',
    timePosted: '15 minutes ago',
    applicants: 7,
    workType: ['Hybrid', 'Full-time'],
    easyApply: true,
    applyUrl: 'https://www.linkedin.com/jobs/apply/2',
    description: `Interactive Games is seeking a Senior Unity Developer to lead development efforts on our upcoming titles. This role requires extensive experience with Unity and a track record of successful game launches.

Responsibilities:
• Lead development of game features and systems
• Mentor junior developers
• Architect scalable and maintainable code
• Collaborate with cross-functional teams

Requirements:
• 5+ years of Unity development experience
• Strong leadership and communication skills
• Experience with mobile and console platforms
• Knowledge of game design principles`
  },
  {
    id: '3',
    title: 'Unity 3D Game Programmer',
    company: 'Virtual Reality Solutions',
    location: 'Austin, TX (Remote)',
    timePosted: '30 minutes ago',
    applicants: 12,
    workType: ['Remote', 'Full-time'],
    easyApply: false,
    applyUrl: 'https://www.linkedin.com/jobs/apply/3',
    description: `Virtual Reality Solutions is looking for a Unity 3D Game Programmer to join our innovative team. You will be responsible for developing immersive VR experiences using Unity.

Responsibilities:
• Create VR applications and games using Unity
• Implement user interactions and movement systems
• Optimize performance for VR platforms
• Collaborate with 3D artists and designers

Requirements:
• Experience with Unity and C#
• Knowledge of VR development principles
• Understanding of 3D mathematics and physics
• Experience with VR hardware (Oculus, Vive, etc.)`
  },
  {
    id: '4',
    title: 'Unity AR/VR Developer',
    company: 'Tech Innovations',
    location: 'Seattle, WA (On-site)',
    timePosted: '1 hour ago',
    applicants: 5,
    workType: ['On-site', 'Contract'],
    easyApply: true,
    applyUrl: 'https://www.linkedin.com/jobs/apply/4',
    description: `Tech Innovations is seeking a Unity AR/VR Developer to create cutting-edge augmented and virtual reality experiences. This role focuses on developing applications for both consumer and enterprise markets.

Responsibilities:
• Develop AR/VR applications using Unity
• Implement features using ARKit, ARCore, or other AR frameworks
• Create intuitive user interfaces for spatial computing
• Test and optimize applications across multiple devices

Requirements:
• Experience with Unity AR/VR development
• Knowledge of AR frameworks (ARKit, ARCore)
• Strong C# programming skills
• Portfolio of AR/VR projects`
  },
  {
    id: '5',
    title: 'Mobile Game Developer (Unity)',
    company: 'Mobile Gaming Co.',
    location: 'United States (Remote)',
    timePosted: '2 hours ago',
    applicants: 18,
    workType: ['Remote', 'Full-time'],
    easyApply: true,
    applyUrl: 'https://www.linkedin.com/jobs/apply/5',
    description: `Mobile Gaming Co. is looking for a Mobile Game Developer with Unity experience to join our team. You will be responsible for developing engaging mobile games from concept to launch.

Responsibilities:
• Develop mobile games using Unity
• Implement game mechanics and systems
• Optimize performance for mobile devices
• Integrate analytics, ads, and in-app purchases

Requirements:
• 3+ years of mobile game development experience
• Proficiency with Unity and C#
• Understanding of mobile platform constraints
• Experience with publishing games to app stores`
  }
];*/

function getTimeAgoInMs(timePosted: string): number {
  const now = new Date().getTime();

  if (!timePosted) return now;

  const regex = /(\d+)\s+(minute|hour|day|week)s?\s+ago/i;
  const match = timePosted.match(regex);

  if (!match) return now;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const unitToMs = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
  };

  return now - (value * unitToMs[unit as keyof typeof unitToMs]);
}

function App() {
  const lastSearchRef = useRef<{ keyword: string; location: string }>({ keyword: '', location: '' });
  const [isLoading, setIsLoading] = useState(false);

  const [useLinkedInAPI, setUseLinkedInAPI] = useState(false);


  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(allJobs);
  const [searchKeyword, setSearchKeyword] = useState('unity');
  const [searchLocation, setSearchLocation] = useState('United States');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [includeTags, setIncludeTags] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);

  const filtersRef = useRef(activeFilters);


  useEffect(() => {
    // Check if access token exists in the URL on component mount
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    if (!accessToken) {
      const { SERVER_URI  } = process.env;
      console.log('Server URI:', SERVER_URI);
      const apiUrl = `${process.env.SERVER_URI}/api/linkedin/auth`;
      console.log(apiUrl); // It should print: https://altlink.vercel.app/api/linkedin/auth

      window.location.href = `${SERVER_URI}/api/linkedin/auth`;
    }
  }, []);


  const handleIncludeTagsChange = (tags: string[]) => {
    setIncludeTags(tags);
  };

  const handleExcludeTagsChange = (tags: string[]) => {
    setExcludeTags(tags);
  };

  // Apply all filters whenever search or filter criteria change
  useEffect(() => {
    applyFilters();
    filtersRef.current = {
      datePosted: activeFilters.timePosted || 'AnyTime', // Ensure default value
    };
  }, [searchKeyword, searchLocation, activeFilters, includeTags, excludeTags]);

  // Re-apply filters when jobs change (e.g. new jobs streamed in)
  useEffect(() => {
    applyFilters();
  }, [allJobs]);

  const fetchJobs = async (filters: { title: string, location: string, datePosted: string }) => {


    const getAccessTokenFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      return params.get('access_token');
    };

    const { title, location, datePosted} = filters;
    const accessToken = getAccessTokenFromURL();
    const endpoints = [
      `${process.env.SERVER_URI}/api/jobsNew?title=${title}&location=${location}&datePosted=${datePosted}`, // scraper
      `${process.env.SERVER_URI}/api/linkedin/jobs?title=${title}&location=${location}&datePosted=${datePosted}&access_token=${accessToken}` // LinkedIn API
    ];

    const url = useLinkedInAPI ? endpoints[1] : endpoints[0];

    const decoder = new TextDecoder();
    const jobSet = new Set(); // For deduplication

    const processStream = async (response: Response) => {
      if (!response.ok || !response.body) throw new Error('Stream failed');

      const reader = response.body.getReader();
      let buffer = '';
      let done = false;

      while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;

        buffer += decoder.decode(value || new Uint8Array(), { stream: true });

        let boundary = buffer.indexOf('\n');
        while (boundary !== -1) {
          const jobData = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 1);
          boundary = buffer.indexOf('\n');

          if (jobData) {
            try {
              const job = JSON.parse(jobData);
              if (!jobSet.has(job.id)) {
                jobSet.add(job.id);
                setAllJobs(prev => [...prev, job]);
              }
            } catch (err) {
              console.error('Invalid job JSON:', jobData);
            }
          }
        }
      }
    };

    try {
      const response = await fetch(url);
      await processStream(response);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
    finally {
      setIsLoading(false);
    }
  };






  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'reset') {
      // Reset all filters
      setActiveFilters({});
    } else {
      // Update the specific filter
      setActiveFilters(prev => ({
        ...prev,
        [filterType]: value,
      }));
    }
  };

  // Apply all filters to the job list
  const applyFilters = () => {
    let filtered = [...allJobs];

    // Sort newest to oldest
    filtered.sort((a, b) => {
      const timeA = getTimeAgoInMs(a.timePosted);
      const timeB = getTimeAgoInMs(b.timePosted);
      return timeB - timeA; // earlier = more recentx
    });

    // Filter by keyword and location first
    /*filtered = filtered.filter((job) => {
      const matchesKeyword =
          searchKeyword === '' ||
          job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          job.company.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchesLocation =
          searchLocation === '' || job.location.toLowerCase().includes(searchLocation.toLowerCase());

      return matchesKeyword && matchesLocation;
    });*/

    // Apply includeTags and excludeTags filtering
    filtered = filtered.filter((job) => {
      const jobDescription = job.description?.toLowerCase() || '';

      // Check if job description includes any of the includeTags
      const includesRequiredTags = includeTags.every((tag) => {
        const pattern = new RegExp(`\\b${tag}\\b`, 'i'); // whole word, case-insensitive
        return pattern.test(jobDescription);
      });

      // Check if job description excludes any of the excludeTags

      const excludesForbiddenTags = excludeTags.every((tag) => {
        const pattern = new RegExp(`\\b${tag}\\b`, 'i'); // matches whole words only
        return !pattern.test(jobDescription);
      });


      // Debug logs:
      /*console.log(`Job: ${job.title}`);
      console.log(`Description: ${jobDescription}`);
      console.log(`Includes: ${includesRequiredTags}, Excludes: ${excludesForbiddenTags}`);
       */


      return includesRequiredTags && excludesForbiddenTags;
    });


    // Apply additional filters (workType, timePosted, etc.)
    Object.entries(activeFilters).forEach(([filterType, value]) => {
      if (value === '') return;

      switch (filterType) {
        case 'workType':
          filtered = filtered.filter((job) =>
              job.workType.some((type) => type.toLowerCase().includes(value.toLowerCase()))
          );
          break;

        case 'timePosted':
          // In a real app, this would filter based on actual timestamps
          if (value === 'Past24Hours') {
            filtered = filtered.filter(
                (job) =>
                    job.timePosted.includes('minutes ago') ||
                    job.timePosted.includes('hour ago') ||
                    job.timePosted.includes('hours ago')
            );
          }
          break;

        case 'sort':
          if (value === 'recent') {
            // Sort by most recent (already sorted in our mock data)
            // In a real app, this would sort based on actual timestamps
          } else if (value === 'relevant') {
            // Sort by relevance (in a real app, this would use a relevance algorithm)
            filtered.sort((a, b) => {
              const aRelevance = a.title.toLowerCase().includes(searchKeyword.toLowerCase()) ? 2 : 1;
              const bRelevance = b.title.toLowerCase().includes(searchKeyword.toLowerCase()) ? 2 : 1;
              return bRelevance - aRelevance;
            });
          }
          break;

          // Add more filter types as needed
      }
    });

    setFilteredJobs(filtered);

    // Reset selected job if it's no longer in the filtered list
    if (selectedJob && !filtered.find((job) => job.id === selectedJob.id)) {
      setSelectedJob(null);
    }
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
  };

  const runScrap = async () => {
    try {
      const res = await fetch(`${process.env.SERVER_URI}/scrape`);
      if (!res.ok) {
        throw new Error(`Failed to run scraper: ${res.statusText}`);
      }
      const text = await res.text();
      alert(text);
    } catch (err) {
      console.error(err);
      alert(`Failed to run scraper: ${err}`);
    }
  };

  /*const testServerRequest = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/jobsNew?title=developer&location=sacramento&datePosted=AnyTime');

      if (!response.ok || !response.body) {
        throw new Error('Failed to fetch jobs');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let done = false;

      while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;

        buffer += decoder.decode(value || new Uint8Array(), { stream: true });

        let boundary = buffer.indexOf('\n');
        while (boundary !== -1) {
          const jobData = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 1);
          boundary = buffer.indexOf('\n');

          if (jobData) {
            try {
              const job = JSON.parse(jobData);
              setAllJobs(prev => {
                const exists = prev.some(j => j.id === job.id);
                const updated = exists ? prev : [...prev, job];
                return updated;
              });
            } catch (err) {
              console.error('Invalid job JSON:', jobData);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };
*/
  // Handle search functionality
  const handleSearch = async (keyword: string, location: string) => {
    setSearchKeyword(keyword);
    setSearchLocation(location);

    // You can now send all active filters to the backend
    const filters = {
      title: keyword,
      location: location,
      datePosted: filtersRef.current.datePosted,  // If no filter set, default to 'AnyTime'
      // Add other filters from activeFilters as needed
    };

    console.log(filtersRef.current.datePosted)
    // Now, call the function to fetch jobs with the applied filters
    await fetchJobs(filters);
  };

  return (
      <Layout className="app-layout">
        <SearchFilterBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            includeTags={includeTags}
            excludeTags={excludeTags}
            onIncludeTagsChange={handleIncludeTagsChange}
            onExcludeTagsChange={handleExcludeTagsChange}
            useLinkedInAPI={useLinkedInAPI}
            onUseLinkedInAPIToggle={setUseLinkedInAPI}
        />

        <Content className="main-content">

          <div className="job-container">
            <div className="job-list-container">
              <JobList
                  jobs={filteredJobs}
                  onSelectJob={handleSelectJob}
                  searchKeyword={searchKeyword}
                  searchLocation={searchLocation}
                  includeTags={includeTags} // Pass includeTags here
                  excludeTags={excludeTags} // Pass excludeTags here
              />
            </div>
            <div className="job-detail-container">
              <JobDetail selectedJob={selectedJob}/>
            </div>
          </div>
          <Button onClick={runScrap}>Run Scraper</Button>
        </Content>
      </Layout>
  );
}

export default App;