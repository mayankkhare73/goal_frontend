'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

export default function CareerPage() {
  const [career, setCareer] = useState(null);
  const [jobMarket, setJobMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  const fetchCareerDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/careers/${params.id}`);
      const data = await response.json();
      setCareer(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching career details:', error);
    }
  }, [params.id]);

  const fetchJobMarketData = useCallback(async () => {
    try {
      const response = await fetch(`/api/careers/${params.id}/job-market`);
      const data = await response.json();
      setJobMarket(data);
    } catch (error) {
      console.error('Error fetching job market data:', error);
    }
  }, [params.id]);

  useEffect(() => {
    fetchCareerDetails();
    fetchJobMarketData();
  }, [fetchCareerDetails, fetchJobMarketData]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Career Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">{career.title}</h1>
          <p className="text-gray-600 mb-6">{career.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Average Salary</h3>
              <p className="text-2xl font-bold">{career.average_salary}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Job Demand</h3>
              <p className="text-2xl font-bold">{career.job_demand}</p>
            </div>
          </div>
        </div>

        {/* Job Market Data */}
        {jobMarket && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Job Market Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold">Total Jobs</h3>
                <p className="text-2xl font-bold">{jobMarket.totalJobs.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold">Growth Rate</h3>
                <p className="text-2xl font-bold">{jobMarket.growthRate}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold">Top Locations</h3>
                <ul className="mt-2">
                  {jobMarket.topLocations.map((location, index) => (
                    <li key={index} className="text-gray-600">{location}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Career Roadmap */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Career Roadmap</h2>
          <div className="space-y-6">
            {career.roadmap.map((step, index) => (
              <div key={step.id} className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-gray-600 mt-1">{step.description}</p>
                  {step.duration && (
                    <p className="text-sm text-gray-500 mt-2">Duration: {step.duration}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Learning Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {career.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border rounded-lg hover:border-blue-500 transition-colors"
              >
                <h3 className="font-semibold">{resource.title}</h3>
                <p className="text-gray-600 mt-1">{resource.description}</p>
                <span className="text-sm text-blue-600 mt-2 block">
                  {resource.resource_type}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 